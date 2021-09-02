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
    adapter.setObjectives(objectivesIds);
  };

  this.setObjectiveScore = function (objectiveId, score) {
    adapter.setObjectiveScore(objectiveId, score);
    var objectives = adapter.getObjectives();
    var completedObjectives = 0;
    for (var index = 0; index < objectives.length; index++) {
      if (adapter.getObjectiveScore(objectives[index])) completedObjectives++;
    }
    var globalScore = (completedObjectives / objectives.length) * 100;
    adapter.setScore(globalScore);
    if (globalScore >= 100) adapter.setLessonStatus("passed");
  };
}
