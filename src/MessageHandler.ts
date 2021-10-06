import { LessonStatus, SCORMAdapter } from ".";

export class MessageReceiver {
  private timeoutId: number;
  private adapter: SCORMAdapter;

  constructor(win: Window, sourceOrigin: string, adapter: SCORMAdapter) {
    this.adapter = adapter;

    const handler = (e: MessageEvent) => {
      if (e.origin !== sourceOrigin) return;
      var functionName = e.data["function"];
      var functionArgs = e.data["arguments"];
      typeof this["adapter"] === "function";
      if (functionName && Array.isArray(functionArgs)) {
        const func = Object.entries(this).reduce((acc, [key, value]) => {
          if (key === functionName && typeof value === "function") return value;
          return acc;
        }, undefined);

        if (func) {
          func(...functionArgs);
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
          }
          this.timeoutId = setTimeout(() => {
            this.commit();
            this.timeoutId = null;
          }, 500);
        }
      }
    };

    win.addEventListener("message", handler);
  }

  commit() {
    this.adapter.LMSCommit();
  }

  setTitle(title: string) {
    document.title = title;
  }

  setScore(score: number) {
    this.adapter.setScore(score);
  }

  setLessonStatus(lessonStatus: LessonStatus) {
    this.adapter.setLessonStatus(lessonStatus);
  }

  setObjectives(objectivesIds: string[]) {
    if (this.adapter.objectivesAreAvailable) {
      this.adapter.setObjectives(objectivesIds);
    }
  }

  setObjectiveScore(objectiveId: string, score: number) {
    if (this.adapter.objectivesAreAvailable) {
      this.adapter.setObjectiveScore(objectiveId, score);
    }
  }
}

export class MessageEmitter {
  private currentWindow: Window;
  private lmsOrigin: string;

  constructor(currentWindow: Window, lmsOrigin: string) {
    this.currentWindow = currentWindow;
    this.lmsOrigin = lmsOrigin;
  }

  private sendMessage(
    name: string,
    values: (string[] | string | number)[]
  ): void {
    this.currentWindow.postMessage(
      {
        function: name,
        arguments: values,
      },
      this.lmsOrigin
    );
  }

  setLessonStatus(status: LessonStatus): void {
    this.sendMessage("setLessonStatus", [status]);
  }

  setObjectiveScore(objectiveId: string, score: number): void {
    this.sendMessage("setObjectiveScore", [objectiveId, score]);
  }
  setScore(score: number): void {
    this.sendMessage("setScore", [score]);
  }
  setObjectives(objectives: string[]): void {
    this.sendMessage("setObjectives", [objectives]);
  }
}
