function loadContent () {

    var ADAPTER = new SCORMAdapter();
    if (!ADAPTER.foundAPI()) {
        document.open()
        document.write('<p>Couldn\'t find the LMS!</p>');
        document.close();
        return;
    }
    if (!ADAPTER.LMSInitialize("")) {
        document.open()
        document.write('<p>Couldn\'t connect to the LMS!</p>');
        document.close();
        return;
    }

    var sourceUrl = document.body.dataset.source;
    if (!sourceUrl) {
        alert('Unable to load content: the source URL is not defined!');
        return;
    }

    var sourceUrlParser = document.createElement('a');
    sourceUrlParser.href = sourceUrl;

    var learnerId = ADAPTER.getLearnerId();
    if (learnerId == null) {
        document.open()
        document.write('<p>Couldn\'t find your learner ID!</p>');
        document.close();
        return;
    }
    sourceUrlParser.search += (sourceUrlParser.search.indexOf('?') === -1 ? '?' : '&') + 'scorm&learner_id=' + learnerId;

    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', sourceUrlParser.href);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('width', '100%');
    document.body.appendChild(iframe);

    var messageHandler = new MessageHandler(window, sourceUrlParser.origin, ADAPTER);

    window.addEventListener('beforeunload', function (e) {
        ADAPTER.LMSCommit("");
        ADAPTER.LMSFinish("");
    });

}
