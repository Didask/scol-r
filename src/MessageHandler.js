function MessageHandler(win, sourceOrigin, adapter) {
  this.timeoutId = null
  win.addEventListener(
    "message",
    function (e) {
      if (e.origin !== sourceOrigin) return;
      var functionName = e.data["function"];
      var functionArgs = e.data["arguments"];
      if (
        functionName &&
        functionArgs &&
        typeof this[functionName] === "function"
      ) {
        this[functionName].apply(this, functionArgs);
        if (this.timeoutId) {
          clearTimeout(this.timeoutId)
        }
        this.timeoutId = setTimeout(() => {
          this.commit();
          this.timeoutId = null
        }, 500)
      }
    }.bind(this)
  );

  this.commit = function () {
    adapter.LMSCommit()
  }

  this.setTitle = function (title) {
    document.title = title;
  };

  this.setScore = function (score) {
    adapter.setScore(score);
  };

  this.setLessonStatus = function (lessonStatus) {
    adapter.setLessonStatus(lessonStatus);
  };

  this.setObjectives = function (objectivesIds) {
    if (adapter.objectivesAreAvailable) {
      adapter.setObjectives(objectivesIds);
    }
  };

  this.setObjectiveScore = function (objectiveId, score) {
    if (adapter.objectivesAreAvailable) {
      adapter.setObjectiveScore(objectiveId, score);
    }
  };
}
