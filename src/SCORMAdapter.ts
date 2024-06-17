interface ApiWindow extends Window {
  API?: any;
  API_1484_11?: any;
}

export class SCORMAdapter {
  private _API: any;
  private _isSCORM2004: boolean;
  private _errorCallback: Function;
  private _lastRequest: { method: "get" | "set"; key: string } | null;
  private _ignorableErrorCodes: {
    code: number;
    getShouldBeIgnored: () => boolean;
  }[] = [
    { code: 0, getShouldBeIgnored: () => true },
    {
      code: 403,
      getShouldBeIgnored: () => this._isSCORM2004,
    },
    {
      code: 401,
      getShouldBeIgnored: () =>
        !this._isSCORM2004 &&
        this._lastRequest &&
        this._lastRequest.method === "get" &&
        this._lastRequest.key === "cmi.objectives._children",
    },
    {
      code: 402,
      getShouldBeIgnored: () =>
        this._isSCORM2004 &&
        this._lastRequest &&
        this._lastRequest.method === "get" &&
        this._lastRequest.key === "cmi.objectives._children",
    },
    {
      code: 351,
      getShouldBeIgnored: () =>
        this._lastRequest.method === "set" &&
        new RegExp("^cmi.objectives.\\d+.id$").test(this._lastRequest.key) &&
        !!this.LMSGetValue(this._lastRequest.key),
    },
  ];

  constructor(errorCallback: Function = function () {}) {
    this._API = null;
    this._isSCORM2004 = false;
    this._errorCallback = errorCallback;
    this._lastRequest = null;
    this._findAndSetAPI();
  }

  get foundAPI() {
    return !!this._API;
  }

  private _initialize() {
    if (this._isSCORM2004) {
      this.LMSSetValue("cmi.score.min", 0);
      this.LMSSetValue("cmi.score.max", 100);
    } else {
      this.LMSSetValue("cmi.core.score.min", 0);
      this.LMSSetValue("cmi.core.score.max", 100);
    }
  }

  private _findAndSetAPI() {
    if (typeof window === "undefined") {
      console.error("Unable to find an API adapter");
    } else {
      let theAPI = this._findAPIInWindow(window as unknown as ApiWindow);
      if (
        theAPI == null &&
        window.opener != null &&
        typeof window.opener != "undefined"
      ) {
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
  }

  private _findAPIInWindow(win: ApiWindow) {
    let findAPITries = 0;
    while (
      win.API == null &&
      win.API_1484_11 == null &&
      win.parent != null &&
      win.parent != win
    ) {
      findAPITries++;
      if (findAPITries > 7) {
        console.error("Error finding API -- too deeply nested.");
        return null;
      }
      win = win.parent as ApiWindow;
    }

    if (win.API) {
      return {
        API: win.API,
        isSCORM2004: false,
      };
    } else if (win.API_1484_11) {
      return {
        API: win.API_1484_11,
        isSCORM2004: true,
      };
    }
    return null;
  }

  private _callAPIFunction(
    fun: string,
    args: [(string | number)?, (string | number)?] = [""]
  ) {
    if (this._API == null) {
      this._warnNOAPI();
      return;
    }
    if (this._isSCORM2004 && fun.indexOf("LMS") == 0) {
      fun = fun.substr(3);
    } else if (!this._isSCORM2004 && !(fun.indexOf("LMS") == 0)) {
      fun = "LMS" + fun;
    }
    console.info("[SCOL-R] Calling a scorm api function", { fun, args });
    return this._API[fun].apply(this._API, args);
  }

  private _handleError(functionName: string) {
    const lastErrorCode = this.LMSGetLastError();
    const lastErrorString = this.LMSGetErrorString(lastErrorCode);
    const lastErrorDiagnostic = this.LMSGetDiagnostic(lastErrorCode);
    if (
      !this._ignorableErrorCodes.some(
        ({ code, getShouldBeIgnored }) =>
          code === lastErrorCode && getShouldBeIgnored()
      )
    ) {
      console.warn(
        functionName,
        `An error occured on the SCORM API: code ${lastErrorCode}, message: ${lastErrorString}`,
        lastErrorDiagnostic
      );
      this._errorCallback(
        lastErrorString,
        lastErrorDiagnostic && lastErrorDiagnostic != lastErrorCode
          ? lastErrorDiagnostic
          : null
      );
    }
  }

  private _warnNOAPI() {
    console.warn(
      "Cannot execute this function because the SCORM API is not available."
    );
    this._errorCallback("apiNotFound");
  }

  LMSInitialize() {
    const functionName = "Initialize";
    const result = this._callAPIFunction(functionName);
    const lastErrorCode = this.LMSGetLastError();
    const success =
      eval(result.toString()) ||
      (this._isSCORM2004
        ? lastErrorCode === 103 // 103 in 2004.* = already initialized
        : lastErrorCode === 101); // 101 in 1.2 = already initialized

    if (success) {
      this._initialize();
    }
    return success || this._handleError(functionName);
  }

  LMSTerminate() {
    console.log('lms terminate called in wrapper');
    const functionName = this._isSCORM2004 ? "Terminate" : "Finish";
    const result = this._callAPIFunction(functionName);
    const success = eval(result.toString());
    return success || this._handleError(functionName);
  }

  LMSGetValue(name: string) {
    this._lastRequest = { method: "get", key: name };
    const functionName = "GetValue";
    const value = this._callAPIFunction(functionName, [name]);
    const success = this.LMSGetLastError() === 0;
    return success ? value : this._handleError(`${functionName}: ${name}`);
  }

  LMSSetValue(name: string, value: string | number) {
    this._lastRequest = { method: "set", key: name };
    const functionName = "SetValue";
    const result = this._callAPIFunction(functionName, [name, value]);
    const success = eval(result.toString());
    return success || this._handleError(`${functionName}: {${name}: ${value}}`);
  }

  LMSCommit() {
    const result = this._callAPIFunction("Commit");
    const success = eval(result.toString());
    return success || this._errorCallback("commitFailed");
  }

  LMSGetLastError() {
    return parseInt(this._callAPIFunction("GetLastError"));
  }

  LMSGetErrorString(errorCode: number) {
    return this._callAPIFunction("GetErrorString", [errorCode]);
  }

  LMSGetDiagnostic(errorCode: number) {
    return this._callAPIFunction("GetDiagnostic", [errorCode]);
  }

  get lastRequest() {
    return this._lastRequest;
  }

  getDataFromLMS() {
    return this.LMSGetValue("cmi.launch_data");
  }

  getLearnerId() {
    const CMIVariableName = this._isSCORM2004
      ? "cmi.learner_id"
      : "cmi.core.student_id";
    return this.LMSGetValue(CMIVariableName);
  }

  getLearnerName() {
    const CMIVariableName = this._isSCORM2004
     ? "cmi.learner_name"
     : "cmi.core.student_name";
    return this.LMSGetValue(CMIVariableName);
  }

  setStudent(studentId: string, studentName: string) {
    if (this._isSCORM2004) {
      this.LMSSetValue("cmi.learner_id", studentId);
      this.LMSSetValue("cmi.learner_name", studentName);
    } else {
      this.LMSSetValue("cmi.core.student_id", studentId);
      this.LMSSetValue("cmi.core.student_name", studentName);
    } 
  }

  setScore(score: number) {
    if (this._isSCORM2004) {
      this.LMSSetValue("cmi.score.raw", score);
      this.LMSSetValue("cmi.score.scaled", score / 100);
    } else {
      this.LMSSetValue("cmi.core.score.raw", score);
    }
  }

  getScore() {
    const CMIVariableName = this._isSCORM2004
      ? "cmi.score.raw"
      : "cmi.core.score.raw";
    let score = this.LMSGetValue(CMIVariableName);
    return score;
  }

  getLessonStatus() {
    const CMIVariableName = this._isSCORM2004
      ? "cmi.completion_status"
      : "cmi.core.lesson_status";
    return this.LMSGetValue(CMIVariableName);
  }

  setLessonStatus(lessonStatus: string) {
    if (this._isSCORM2004) {
      let successStatus = "unknown";
      if (lessonStatus === "passed" || lessonStatus === "failed")
        successStatus = lessonStatus;
      this.LMSSetValue("cmi.success_status", successStatus);
      let completionStatus = "unknown";
      if (lessonStatus === "passed" || lessonStatus === "completed") {
        completionStatus = "completed";
      } else if (lessonStatus === "incomplete") {
        completionStatus = "incomplete";
      } else if (
        lessonStatus === "not attempted" ||
        lessonStatus === "browsed"
      ) {
        completionStatus = "not attempted";
      }
      this.LMSSetValue("cmi.completion_status", completionStatus);
    } else {
      this.LMSSetValue("cmi.core.lesson_status", lessonStatus);
    }
  }

  setSessionTime(msSessionTime: number) {
    if (this._isSCORM2004) {
      const duration = convertToTimeInterval(msSessionTime);
      this.LMSSetValue("cmi.session_time", duration);
    } else {
      const duration = convertMsToCMITimespan(msSessionTime);
      this.LMSSetValue("cmi.core.session_time", duration);
    }
  }

  get objectivesAreAvailable() {
    const objectivesFields = !!this.LMSGetValue("cmi.objectives._children");
    return objectivesFields && this.LMSGetLastError() === 0;
  }

  setObjectives(objectivesIds: string[]) {
    objectivesIds.forEach((objectiveId, index) => {
      this.LMSSetValue(`cmi.objectives.${index}.id`, objectiveId);
    });
  }

  get objectives() {
    const objectives = [];
    const objectivesNbr = this.LMSGetValue("cmi.objectives._count");
    for (let index = 0; index < objectivesNbr; index++) {
      objectives.push(this.LMSGetValue(`cmi.objectives.${index}.id`));
    }
    return objectives;
  }

  setObjectiveScore(objectiveId: string, score: number) {
    const objectivesNbr = this.LMSGetValue("cmi.objectives._count");
    for (let index = 0; index < objectivesNbr; index++) {
      const storedObjectiveId = this.LMSGetValue(`cmi.objectives.${index}.id`);
      if (objectiveId === storedObjectiveId) {
        this.LMSSetValue(`cmi.objectives.${index}.score.raw`, score);
        return;
      }
    }
  }

  setObjectiveStatus(objectiveId: string, status: "completed" | "incomplete") {
    const objectivesNbr = this.LMSGetValue("cmi.objectives._count");
    for (let index = 0; index < objectivesNbr; index++) {
      const storedObjectiveId = this.LMSGetValue(`cmi.objectives.${index}.id`);
      if (objectiveId === storedObjectiveId) {
        if (this._isSCORM2004) {
          this.LMSSetValue(
            `cmi.objectives.${index}.success_status`,
            status === "completed" ? "passed" : "unknown"
          );
          this.LMSSetValue(
            `cmi.objectives.${index}.completion_status`,
            status === "completed" ? "completed" : "incomplete"
          );
        } else {
          this.LMSSetValue(
            `cmi.objectives.${index}.status`,
            status === "completed" ? "passed" : "incomplete"
          );
        }
        return;
      }
    }
  }

  getObjectiveScore(objectiveId: string) {
    const objectivesNbr = this.LMSGetValue("cmi.objectives._count");
    for (let index = 0; index < objectivesNbr; index++) {
      const storedObjectiveId = this.LMSGetValue(`cmi.objectives.${index}.id`);
      if (objectiveId === storedObjectiveId) {
        return this.LMSGetValue(`cmi.objectives.${index}.score.raw`);
      }
    }
  }

  setSuspendData(data: string) {
    this.LMSSetValue("cmi.suspend_data", data);
  }
  get suspendData() {
    return this.LMSGetValue("cmi.suspend_data");
  }
}

export const convertToTimeInterval = (milliseconds: number) => {
// timeinterval (second,10,2),
  const data = getDurationData(milliseconds)
  const days = data.days
  const hours = data.hours % 24
  const minutes = data.minutes % 60
  const seconds = data.seconds % 60
  const cents  = data.cents % 100

  const daysString = days ? days + 'D' : '';
  const hoursString = hours ? hours + 'H' : '';
  const minutesString = minutes ? minutes + 'M' : '';
  const secondsString = seconds || '0' + (cents ? '.' + cents : '') + 'S';

  const hms = [ hoursString, minutesString, secondsString ].join('');
  return 'P' + daysString + 'T' + hms;
}

export const convertMsToCMITimespan = (milliseconds: number) => {
  // CMITimespan "0000:00:00.00"
  const { seconds, minutes, hours, cents } = getDurationData(milliseconds)
  const h = pad(hours, 4)
  const m = pad(minutes % 60, 2)
  const s = pad(seconds % 60, 2)
  const c = pad(cents % 100, 2)
  return `${h}:${m}:${s}.${c}`
}


const getDurationData = (milliseconds: number): {
  days: number
  hours: number
  minutes: number
  seconds: number
  cents: number
} => {
  const cents = Math.floor(milliseconds / 10)
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  return { days, hours, minutes, seconds, cents }
}

const pad = (value: number, targetLength:number): string => {
  const text = value.toString()
  const padLength = targetLength - text.length;
  if (padLength <= 0) return text;

  return "0".repeat(padLength) + text;
}
