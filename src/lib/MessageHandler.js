function MessageHandler (win, sourceOrigin, adapter) {
    win.addEventListener('message', function (e) {
        if (e.origin !== sourceOrigin) return;
        var functionName = e.data["function"];
        var functionArgs = e.data["arguments"];
        if (functionName && functionArgs && typeof this[functionName] === "function") {
	        this[functionName].apply(this, functionArgs);
        }
    }.bind(this));

    this.setTitle = function (title) {
    	document.title = title;
    };

    this.setScore = function (score) {
    	adapter.setScore(score);
    };

    this.setLessonStatus = function (lessonStatus) {
    	adapter.setLessonStatus(lessonStatus);
    };
}

export default MessageHandler