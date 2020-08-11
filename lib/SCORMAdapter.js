"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SCORMAdapter = /** @class */ (function () {
    function SCORMAdapter(errorCallback) {
        if (errorCallback === void 0) { errorCallback = function () { }; }
        this._ignorableErrorCodes = [{ code: 0 }, { code: 403, scope: '2004' }];
        this._API = null;
        this._isSCORM2004 = false;
        this._errorCallback = errorCallback;
        this._findAndSetAPI();
    }
    Object.defineProperty(SCORMAdapter.prototype, "foundAPI", {
        get: function () { return !!this._API; },
        enumerable: true,
        configurable: true
    });
    ;
    SCORMAdapter.prototype._findAndSetAPI = function () {
        var _this = this;
        if (typeof window === 'undefined') {
            console.error("Unable to find an API adapter");
        }
        else {
            var theAPI = this._findAPIInWindow(window);
            if ((theAPI == null) && (window.opener != null) && (typeof (window.opener) != "undefined")) {
                theAPI = this._findAPIInWindow(window.opener);
            }
            if (theAPI == null) {
                console.error("Unable to find an API adapter");
            }
            else {
                this._API = theAPI["API"];
                this._isSCORM2004 = theAPI["isSCORM2004"];
                this._ignorableErrorCodes = this._ignorableErrorCodes.filter(function (_a) {
                    var scope = _a.scope;
                    return !scope || (_this._isSCORM2004 ? scope === '2004' : scope === '1.2');
                });
            }
            if (this._API == null) {
                console.error("Couldn't find the API!");
            }
        }
    };
    ;
    SCORMAdapter.prototype._findAPIInWindow = function (win) {
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
        }
        else if (win.API_1484_11) {
            return {
                "API": win.API_1484_11,
                "isSCORM2004": true
            };
        }
        return null;
    };
    ;
    SCORMAdapter.prototype._callAPIFunction = function (fun, args) {
        if (args === void 0) { args = [""]; }
        if (this._API == null) {
            this._warnNOAPI();
            return;
        }
        if (this._isSCORM2004 && fun.indexOf('LMS') == 0) {
            fun = fun.substr(3);
        }
        else if (!this._isSCORM2004 && !(fun.indexOf('LMS') == 0)) {
            fun = 'LMS' + fun;
        }
        return this._API[fun].apply(this._API, args);
    };
    ;
    SCORMAdapter.prototype._handleError = function () {
        var lastErrorCode = this.LMSGetLastError();
        var lastErrorString = this.LMSGetErrorString(lastErrorCode);
        var lastErrorDiagnostic = this.LMSGetDiagnostic(lastErrorCode);
        if (!this._ignorableErrorCodes.some(function (_a) {
            var code = _a.code;
            return code === lastErrorCode;
        })) {
            console.warn("An error occured on the SCORM API:", "Error " + lastErrorCode + ": " + lastErrorString, lastErrorDiagnostic);
            this._errorCallback(lastErrorString, lastErrorDiagnostic && lastErrorDiagnostic != lastErrorCode ? lastErrorDiagnostic : null);
        }
    };
    ;
    SCORMAdapter.prototype._warnNOAPI = function () {
        console.warn("Cannot execute this function because the SCORM API is not available.");
        this._errorCallback('apiNotFound');
    };
    ;
    SCORMAdapter.prototype.LMSInitialize = function () {
        var result = this._callAPIFunction("Initialize");
        result = eval(result.toString()) || this.LMSGetLastError() === 101; // Error 101 means that API is already initialized
        if (!result)
            this._handleError();
        return result;
    };
    ;
    SCORMAdapter.prototype.LMSTerminate = function () {
        var result = this._callAPIFunction(this._isSCORM2004 ? "Terminate" : "Finish");
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result)
            this._handleError();
        return result;
    };
    ;
    SCORMAdapter.prototype.LMSGetValue = function (name) {
        var value = this._callAPIFunction("GetValue", [name]);
        if (this.LMSGetLastError() === 0) {
            return value;
        }
        else {
            this._handleError();
            return null;
        }
    };
    ;
    SCORMAdapter.prototype.LMSSetValue = function (name, value) {
        var result = this._callAPIFunction("SetValue", [name, value]);
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result)
            this._handleError();
        return this.LMSCommit();
    };
    ;
    SCORMAdapter.prototype.LMSCommit = function () {
        var result = this._callAPIFunction("Commit");
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result)
            this._errorCallback('commitFailed');
        return result;
    };
    ;
    SCORMAdapter.prototype.LMSGetLastError = function () {
        return parseInt(this._callAPIFunction("GetLastError"));
    };
    ;
    SCORMAdapter.prototype.LMSGetErrorString = function (errorCode) {
        return this._callAPIFunction("GetErrorString", [errorCode]);
    };
    ;
    SCORMAdapter.prototype.LMSGetDiagnostic = function (errorCode) {
        return this._callAPIFunction("GetDiagnostic", [errorCode]);
    };
    ;
    SCORMAdapter.prototype.getDataFromLMS = function () {
        return this.LMSGetValue('cmi.launch_data');
    };
    ;
    SCORMAdapter.prototype.getLearnerId = function () {
        var CMIVariableName = this._isSCORM2004 ? "cmi.learner_id" : "cmi.core.student_id";
        return this.LMSGetValue(CMIVariableName);
    };
    ;
    SCORMAdapter.prototype.setScore = function (score) {
        var CMIVariableName = this._isSCORM2004 ? 'cmi.score.scaled' : 'cmi.core.score.raw';
        if (this._isSCORM2004)
            score = (score / 100);
        this.LMSSetValue(CMIVariableName, score);
    };
    SCORMAdapter.prototype.getScore = function () {
        var CMIVariableName = this._isSCORM2004 ? 'cmi.score.scaled' : 'cmi.core.score.raw';
        var score = this.LMSGetValue(CMIVariableName);
        if (this._isSCORM2004)
            score = (score * 100);
        return score;
    };
    SCORMAdapter.prototype.getLessonStatus = function () {
        var CMIVariableName = this._isSCORM2004 ? 'cmi.completion_status' : 'cmi.core.lesson_status';
        return this.LMSGetValue(CMIVariableName);
    };
    SCORMAdapter.prototype.setLessonStatus = function (lessonStatus) {
        if (this._isSCORM2004) {
            var successStatus = 'unknown';
            if (lessonStatus === 'passed' || lessonStatus === 'failed')
                successStatus = lessonStatus;
            this.LMSSetValue('cmi.success_status', successStatus);
            var completionStatus = 'unknown';
            if (lessonStatus === 'passed' || lessonStatus === 'completed') {
                completionStatus = 'completed';
            }
            else if (lessonStatus === 'incomplete') {
                completionStatus = 'incomplete';
            }
            else if (lessonStatus === 'not attempted' || lessonStatus === 'browsed') {
                completionStatus = 'not attempted';
            }
            this.LMSSetValue('cmi.completion_status', completionStatus);
        }
        else {
            this.LMSSetValue('cmi.core.lesson_status', lessonStatus);
        }
    };
    SCORMAdapter.prototype.setSessionTime = function (msSessionTime) {
        var CMIVariableName = this._isSCORM2004 ? 'cmi.session_time' : 'cmi.core.session_time', duration;
        if (this._isSCORM2004) {
            duration = Math.round(msSessionTime / 1000);
        }
        else {
            var hours = Math.floor(msSessionTime / 1000 / 60 / 60);
            msSessionTime -= hours * 1000 * 60 * 60;
            var minutes = Math.floor(msSessionTime / 1000 / 60);
            msSessionTime -= minutes * 1000 * 60;
            var seconds = Math.floor(msSessionTime / 1000);
            var formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
            var formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            var formattedHours = hours < 10 ? '0' + hours : hours;
            duration = formattedHours + ':' + formattedMinutes + ':' + formattedSeconds;
        }
        this.LMSSetValue(CMIVariableName, duration);
    };
    Object.defineProperty(SCORMAdapter.prototype, "objectivesAreAvailable", {
        get: function () {
            return this.LMSGetValue('cmi.objectives._children') !== null;
        },
        enumerable: true,
        configurable: true
    });
    SCORMAdapter.prototype.setObjectives = function (objectivesIds) {
        var _this = this;
        objectivesIds.forEach(function (objectiveId, index) {
            _this.LMSSetValue("cmi.objectives." + index + ".id", objectiveId);
        });
    };
    SCORMAdapter.prototype.getObjectives = function () {
        var objectives = [];
        var objectivesNbr = this.LMSGetValue('cmi.objectives._count');
        for (var index = 0; index < objectivesNbr; index++) {
            objectives.push(this.LMSGetValue("cmi.objectives." + index + ".id"));
        }
        return objectives;
    };
    SCORMAdapter.prototype.setObjectiveScore = function (objectiveId, score) {
        var objectivesNbr = this.LMSGetValue('cmi.objectives._count');
        for (var index = 0; index < objectivesNbr; index++) {
            var storedObjectiveId = this.LMSGetValue("cmi.objectives." + index + ".id");
            if (objectiveId === storedObjectiveId) {
                if (this._isSCORM2004)
                    score = (score / 100);
                this.LMSSetValue("cmi.objectives." + index + ".score." + (this._isSCORM2004 ? 'scaled' : 'raw'), score);
                return;
            }
        }
    };
    SCORMAdapter.prototype.getObjectiveScore = function (objectiveId) {
        var objectivesNbr = this.LMSGetValue('cmi.objectives._count');
        for (var index = 0; index < objectivesNbr; index++) {
            var storedObjectiveId = this.LMSGetValue("cmi.objectives." + index + ".id");
            if (objectiveId === storedObjectiveId) {
                var score = this.LMSGetValue("cmi.objectives." + index + ".score." + (this._isSCORM2004 ? 'scaled' : 'raw'));
                if (this._isSCORM2004)
                    score = (score * 100);
                return score;
            }
        }
    };
    SCORMAdapter.prototype.setSuspendData = function (data) { this.LMSSetValue('cmi.suspend_data', data); };
    Object.defineProperty(SCORMAdapter.prototype, "suspendData", {
        get: function () { return this.LMSGetValue('cmi.suspend_data'); },
        enumerable: true,
        configurable: true
    });
    return SCORMAdapter;
}());
exports.SCORMAdapter = SCORMAdapter;
