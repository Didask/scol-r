interface ApiWindow extends Window {
    API?: any
    API_1484_11?: any
}

export default class SCORMAdapter {

    private _API: any
    private _isSCORM2004: boolean
    private _errorCallback: Function

    constructor(errorCallback: Function = function(){}) {
        this._API = null
        this._isSCORM2004 = false
        this._errorCallback =  errorCallback
        this._findAndSetAPI();
    }

    get foundAPI() { return !!this._API };

    private _findAndSetAPI() {
        if (typeof window === 'undefined') {
            console.error("Unable to find an API adapter");
        } else { 
            let theAPI = this._findAPIInWindow(window as unknown as ApiWindow);
            if ((theAPI == null) && (window.opener != null) && (typeof(window.opener) != "undefined")) {
                theAPI = this._findAPIInWindow(window.opener);
            }
            if (theAPI == null) {
                console.error("Unable to find an API adapter");
            } else {
                this._API = theAPI["API"];
                this._isSCORM2004 = theAPI["isSCORM2004"];
            }

            if (this._API == null) {
                console.error("Couldn't find the API!");
            }
        }
    }; 

    private _findAPIInWindow(win: ApiWindow) {
        var findAPITries = 0;
        while ((win.API == null) && (win.API_1484_11 == null) && (win.parent != null) && (win.parent != win)) {
            findAPITries++;
            if (findAPITries > 7) {
                console.error("Error finding API -- too deeply nested.");
                return null;
            }
            win = win.parent as ApiWindow;
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

    private _callAPIFunction(fun: string, args: [(string | number)?, (string | number)?] = [""]) {
        if (this._API == null) {
            this._warnNOAPI();
            return;
        }   
        if (this._isSCORM2004 && fun.indexOf('LMS')==0) {
            fun = fun.substr(3);
        } else if (!this._isSCORM2004 && !(fun.indexOf('LMS') == 0)) {
            fun = 'LMS' + fun;
        }
        return this._API[fun].apply(this._API, args);
    };

    private _handleError() {
        var lastErrorCode = this.LMSGetLastError();
        var lastErrorString = this.LMSGetErrorString(lastErrorCode);
        var lastErrorDiagnostic = this.LMSGetDiagnostic(lastErrorCode);
        if (lastErrorCode !== 0) {
            console.warn(
                "An error occured on the SCORM API:",
                "Error " + lastErrorCode + ": " + lastErrorString,
                lastErrorDiagnostic
            );
            this._errorCallback(lastErrorString, lastErrorDiagnostic && lastErrorDiagnostic != lastErrorCode ? lastErrorDiagnostic : null);
        }
    };

    private _warnNOAPI() {
        console.warn("Cannot execute this function because the SCORM API is not available.");
        this._errorCallback('apiNotFound')
    };

    LMSInitialize() {
        var result = this._callAPIFunction("Initialize");
        result = eval(result.toString()) || this.LMSGetLastError() === 101; // Error 101 means that API is already initialized
        if (!result) this._handleError();
        return result
    };

    LMSTerminate() {
        var result = this._callAPIFunction(this._isSCORM2004 ? "Terminate" : "Finish");
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result) this._handleError();
        return result;
    };

    LMSGetValue(name: string) {
        var value = this._callAPIFunction("GetValue", [name]);
        if (this.LMSGetLastError() === 0) {
            return value;
        } else {
            this._handleError();
            return null;
        }
    };

    LMSSetValue(name: string, value: string | number) {
        var result = this._callAPIFunction("SetValue", [name, value]);
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result) this._handleError();
        return result.toString();
    };

    LMSCommit() {
        var result = this._callAPIFunction("Commit");
        result = eval(result.toString()); // Some APIs return "true" or "false"!
        if (!result) this._errorCallback('commitFailed');
        return result;
    };

    LMSGetLastError() {
        return parseInt(this._callAPIFunction("GetLastError"));
    };

    LMSGetErrorString(errorCode: number) {
        return this._callAPIFunction("GetErrorString", [errorCode]);
    };

    LMSGetDiagnostic(errorCode: number) {
        return this._callAPIFunction("GetDiagnostic", [errorCode]);
    };

    getDataFromLMS() {
        return this.LMSGetValue('cmi.launch_data');
    };

    getLearnerId() {
        var CMIVariableName = this._isSCORM2004 ? "cmi.learner_id" : "cmi.core.student_id";
        return this.LMSGetValue(CMIVariableName);
    };

    setScore(score: number) {
        var CMIVariableName = this._isSCORM2004 ? 'cmi.score.scaled' : 'cmi.core.score.raw';
        if (this._isSCORM2004) score = (score / 100);
        this.LMSSetValue(CMIVariableName, score);
        this.LMSCommit();
    }

    getScore() {
        var CMIVariableName = this._isSCORM2004 ? 'cmi.score.scaled' : 'cmi.core.score.raw';
        let score = this.LMSGetValue(CMIVariableName);
        if (this._isSCORM2004) score = (score * 100);
        return score
    }

    setLessonStatus(lessonStatus: string) {
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
        this.LMSCommit();
    }

    setSessionTime(sessionTime: number) {
        var CMIVariableName = this._isSCORM2004 ? 'cmi.session_time' : 'cmi.core.session_time';

        var hours = Math.floor(sessionTime / 1000 / 60 / 60);
        sessionTime -= hours * 1000 * 60 * 60;
        var minutes = Math.floor(sessionTime / 1000 / 60);
        sessionTime -= minutes * 1000 * 60;
        var seconds = Math.floor(sessionTime / 1000);

        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes
        const formattedHours = hours < 10 ? '0' + hours : hours

        var duration = formattedHours + ':' + formattedMinutes + ':' + formattedSeconds;
        this.LMSSetValue(CMIVariableName, duration);
        this.LMSCommit();
    }
}