export class MessageReceiver {
  constructor(
    win: Window,
    sourceOrigin: string,
    private readonly adapter: any,
  ) {
    let timeoutId: NodeJS.Timeout | null = null;

    win.addEventListener(
      "message",
      function (this: MessageReceiver, e: MessageEvent) {
        if (e.origin !== sourceOrigin) return;
        const functionName = e.data["function"];
        const functionArgs = e.data["arguments"];
        if (
          functionName &&
          functionArgs &&
          typeof this[functionName as keyof MessageReceiver] === "function"
        ) {
          // @ts-ignore
          this[functionName].apply(this, functionArgs);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            this.commit();
            timeoutId = null;
          }, 500);
        }
      }.bind(this),
    );
  }

  commit() {
    this.adapter.LMSCommit();
  }

  setTitle(title: string) {
    document.title = title;
  }

  setScore(score: string) {
    this.adapter.setScore(score);
  }

  setStudent(studentId: string, studentName: string) {
    this.adapter.setStudent(studentId, studentName);
  }

  setLessonStatus(lessonStatus: string) {
    this.adapter.setLessonStatus(lessonStatus);
    this.adapter.commit(); // We commit the changes to the LMS each time the lesson status is updated.
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

  setObjectiveStatus(objectiveId: string, status: string) {
    if (this.adapter.objectivesAreAvailable) {
      this.adapter.setObjectiveStatus(objectiveId, status);
    }
  }
}

export class MessageEmitter {
  private currentWindow: Window;
  private lmsOrigin: string;

  constructor(lmsOrigin: string) {
    this.currentWindow = window.parent || window.opener;
    this.lmsOrigin = lmsOrigin;
  }

  private sendMessage(
    name: string,
    values: (string[] | string | number)[],
  ): void {
    this.currentWindow.postMessage(
      {
        function: name,
        arguments: values,
      },
      this.lmsOrigin,
    );
  }

  setStudent({ id, name }: { id: string; name: string }): void {
    this.sendMessage("setStudent", [id, name]);
  }
  setLessonStatus(status: string): void {
    this.sendMessage("setLessonStatus", [status]);
  }
  setScore(score: number): void {
    this.sendMessage("setScore", [score]);
  }
  setObjectives(objectives: string[]): void {
    this.sendMessage("setObjectives", [objectives]);
  }
  setObjectiveScore(objectiveId: string, score: number): void {
    this.sendMessage("setObjectiveScore", [objectiveId, score]);
  }
  setObjectiveStatus(
    objectiveId: string,
    status: "completed" | "incomplete",
  ): void {
    this.sendMessage("setObjectiveStatus", [objectiveId, status]);
  }
}
