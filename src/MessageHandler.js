function MessageHandler(win, sourceOrigin, adapter) {
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
      }
    }.bind(this)
  );

  this.setTitle = function (title) {
    document.title = title;
  };

  this.setScore = function (score) {
    adapter.setScore(score, false);
  };

  this.setLessonStatus = function (lessonStatus) {
    adapter.setLessonStatus(lessonStatus, false);
  };

  this.setObjectives = function (objectivesIds) {
    adapter.setObjectives(objectivesIds, false);
  };

  this.setObjectiveScore = function (objectiveId, score) {
    adapter.setObjectiveScore(objectiveId, score, false);
    var objectives = adapter.getObjectives();
    var completedObjectives = 0;
    for (var index = 0; index < objectives.length; index++) {
      if (adapter.getObjectiveScore(objectives[index])) completedObjectives++;
    }
    var globalScore = (completedObjectives / objectives.length) * 100;
    adapter.setScore(globalScore, false);
    if (globalScore >= 100) adapter.setLessonStatus("passed", false);
  };
}
