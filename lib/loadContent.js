function loadContent () {

    var abort = function (message) {
        document.open()
        document.write(message);
        document.close();
    };

    var ADAPTER = new SCORMAdapter();
    if (!ADAPTER.foundAPI()) {
        abort('<p>Couldn\'t find the LMS!</p>'); return;
    }
    if (!ADAPTER.LMSInitialize("")) {
        abort('<p>Couldn\'t connect to the LMS!</p>'); return;
    }

    var sourceUrl = document.body.dataset.source;
    if (!sourceUrl) {
        abort('Unable to load content: the source URL is not defined!'); return;
    }

    var sourceUrlParser = document.createElement('a');
    sourceUrlParser.href = sourceUrl;

    var learnerId = ADAPTER.getLearnerId();
    if (learnerId == null) {
        abort('<p>Couldn\'t find your learner ID!</p>'); return;
    }
    sourceUrlParser.search += 
        (sourceUrlParser.search.indexOf('?') === -1 ? '?' : '&')
        + 'scorm&learner_id=' + learnerId
        + '&lms_origin=' + location.origin;

    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', sourceUrlParser.href);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('width', '100%');
    document.body.appendChild(iframe);

    var sessionStart = new Date();

    var messageHandler = new MessageHandler(window, sourceUrlParser.origin, ADAPTER);

    window.addEventListener('beforeunload', function (e) {
        var sessionEnd = new Date();
        ADAPTER.setSessionTime(sessionEnd - sessionStart);
        ADAPTER.LMSCommit("");
        ADAPTER.LMSFinish("");
    });

}
