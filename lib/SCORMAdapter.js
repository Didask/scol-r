function SCORMAdapter() {

    this._API = null;
    this._isSCORM2004 = null;

    this._errorCodes = {
        'NoError': 0,
        'GeneralException': 101,
        'ServerBusy': 102,
        'InvalidArgumentError': 201,
        'ElementCannotHaveChildren': 202,
        'ElementIsNotAnArray': 203,
        'NotInitialized': 301,
        'NotImplementedError': 401,
        'InvalidSetValue': 402,
        'ElementIsReadOnly': 403,
        'ElementIsWriteOnly': 404,
        'IncorrectDataType': 405
    };

    this.initialize = function () {
        this.findAndSetAPI();
    };

    this.findAndSetAPI = function () {
        var theAPI = this._findAPIInWindow(window);
        if ((theAPI == null) && (window.opener != null) && (typeof(window.opener) != "undefined")) {
          theAPI = this._findAPIInWindow(window)(window.opener);
        }
        if (theAPI == null) {
           console.warn("Unable to find an API adapter");
        } else {
            this._API = theAPI["API"];
            this._isSCORM2004 = theAPI["isSCORM2004"];
        }

        if (this._API == null) {
            console.warn("Couldn't find the API!");
        }
    };

    this.foundAPI = function () {
        return !!this._API;
    };

    this._findAPIInWindow = function (win) {
        var findAPITries = 0;
        while ((win.API == null) && (win.API_1484_11 == null) && (win.parent != null) && (win.parent != win)) {
            findAPITries++;
            if (findAPITries > 7) {
                console.error("Error finding API -- too deeply nested.");
                return null;
            }
            win = win.parent;
        }

        if (win.API) {
            return {
                "API": win.API,
                "isSCORM2004": false
            };
        } else if (win.API_1484_11) {
            return {
                "API": win.API_1484_11,
                "isSCORM2004": true
            };
        }
        return null;
    };

    this._callAPIFunction = function (fun, args) {
        if (this._API == null) {
            this._warnNOAPI();
            return;
        }
        if (this._isSCORM2004 && fun.startsWith('LMS')) {
            fun = fun.substr(3);
        } else if (!this._isSCORM2004 && !fun.startsWith('LMS')) {
            fun = 'LMS' + fun;
        }
        return this._API[fun].apply(this._API, args);
    };

    this.LMSInitialize = function () {
        var result = this._callAPIFunction("Initialize", arguments);
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result) this._handleError();
        return result
    };

    this.LMSTerminate = function () {
        var result = this._callAPIFunction(this._isSCORM2004 ? "Terminate" : "Finish", arguments);
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result) this._handleError();
        return result;
    };

    this.LMSFinish = this.LMSTerminate;

    this.LMSGetValue = function (name) {
        var value = this._callAPIFunction("GetValue", arguments);
        if (this.LMSGetLastError() === this._errorCodes["NoError"]) {
            return value;
        } else {
            this._handleError();
            return null;
        }
    };

    this.LMSSetValue = function (name, value) {
        var result = this._callAPIFunction("SetValue", arguments);
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result) this._handleError();
        return result.toString();
    };

    this.LMSCommit = function () {
        var result = this._callAPIFunction("Commit", arguments);
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result) this._handleError();
        return result;
    };

    this.LMSGetLastError = function () {
        return parseInt(this._callAPIFunction("GetLastError", arguments));
    };

    this.LMSGetErrorString = function () {
        return this._callAPIFunction("GetErrorString", arguments);
    };

    this.LMSGetDiagnostic = function () {
        return this._callAPIFunction("GetDiagnostic", arguments);
    };

    this._handleError = function () {
        var lastErrorCode = this.LMSGetLastError();
        var lastErrorString = this.LMSGetErrorString();
        var lastErrorDiagnostic = this.LMSGetDiagnostic();
        if (lastErrorCode !== this._errorCodes["NoError"]) {
            console.warn(
                "An error occured on the SCORM API:",
                "Error " + lastErrorCode + ": " + lastErrorString,
                lastErrorDiagnostic
            );
        }
    };

    this._warnNOAPI = function () {
        console.warn("Cannot execute this function because the SCORM API is not available.");
    };

    this.getLearnerId = function () {
        var CMIVariableName = this._isSCORM2004 ? "cmi.learner_id" : "cmi.core.student_id";
        return this.LMSGetValue(CMIVariableName);
    };

    this.setScore = function (score) {
        var CMIVariableName = this._isSCORM2004 ? 'cmi.score.scaled' : 'cmi.core.score.raw';
        if (this._isSCORM2004) score = (score / 100);
        this.LMSSetValue(CMIVariableName, score);
        this.LMSCommit("");
    }

    this.setLessonStatus = function (lessonStatus) {
        if (this._isSCORM2004) {
            var successStatus = 'unknown';
            if (lessonStatus === 'passed' || lessonStatus === 'failed') successStatus = lessonStatus;
            this.LMSSetValue('cmi.success_status', successStatus);
            var completionStatus = 'unknown';
            if (lessonStatus === 'passed' || lessonStatus === 'completed') {
                completionStatus = 'completed';
            } else if (lessonStatus === 'incomplete') {
                completionStatus = 'incomplete';
            } else if (lessonStatus === 'not attempted' || lessonStatus === 'browsed') {
                completionStatus = 'not attempted'
            }
            this.LMSSetValue('cmi.completion_status', completionStatus);
        } else {
            this.LMSSetValue('cmi.core.lesson_status', lessonStatus);
        }
        this.LMSCommit("");
    }

    this.setSessionTime = function (sessionTime) {
        var CMIVariableName = this._isSCORM2004 ? 'cmi.session_time' : 'cmi.core.session_time';

        var hours = Math.floor(sessionTime / 1000 / 60 / 60);
        sessionTime -= hours * 1000 * 60 * 60;
        var minutes = Math.floor(sessionTime / 1000 / 60);
        sessionTime -= minutes * 1000 * 60;
        var seconds = Math.floor(sessionTime / 1000);

        if (seconds < 10) seconds = '0' + seconds;
        if (minutes < 10) minutes = '0' + minutes;
        if (hours < 10) hours = '0' + hours;

        var duration = hours + ':' + minutes + ':' + seconds;
        this.LMSSetValue(CMIVariableName, duration);
        this.LMSCommit("");
    }

    this.initialize();

};
