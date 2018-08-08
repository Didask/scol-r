function MessageHandler (win, sourceOrigin, adapter) {
    win.addEventListener('message', function (e) {
        if (e.origin !== sourceOrigin) return;
        var functionName = e.data["function"];
        var functionArgs = e.data["arguments"];
        if (functionName && functionArgs && typeof this[functionName] === "function") {
	        this[functionName].call(this, functionArgs);
        } else {
        	console.warn("Received a message from the source that we couldn't interpret.");
        }
    }.bind(this));

    this.setTitle = function (title) {
    	document.title = title;
    };

    this.setScore = function (score) {
    	adapter.setScore(score);
    };
}
