function MessageHandler (win, sourceOrigin, adapter) {
	win.addEventListener('message', function(e){
		if (e.origin !== sourceOrigin) return;
		var funcName = e.data["function"], funcArgs = e.data["arguments"]
		if (funcName && funcArgs && typeof this[funcName] === "function")
			this[funcName].apply(this, funcArgs)
	}.bind(this))

	this.setTitle = function(title){document.title = title}
	this.setScore = function(score){adapter.setScore(score)}
    this.setLessonStatus = function(lessonStatus){adapter.setLessonStatus(lessonStatus)}
}
