function loadContent () {

    var errorMessages = {
        'en': {
            'apiNotFound': '<p>We were not able to contact your LMS: please close this window and try again later.</p>',
            'couldNotInitialize': '<p>We were not able to initialize the connection with your LMS: please close this window and try again later.</p>',
            'learnerIdMissing': '<p>We could not get your learner ID from the LMS: please close this window and try again later.</p>',
            'sourceUrlMissing': '<p>We could find the address of the remote resource: it looks like this module is invalid, please contact your LMS administrator.</p>',
        },
        'fr': {
            'apiNotFound': '<p>Nous n\'avons pas pu contacter votre LMS&nbsp;: veuillez fermer cette fenêtre et réessayer plus tard.</p>',
            'couldNotInitialize': '<p>Nous n\'avons pas pu initialiser la connection avec votre LMS&nbsp;: veuillez fermer cette fenêtre et réessayer plus tard.</p>',
            'learnerIdMissing': '<p>Nous n\'avons pas pu obtenir votre identifiant depuis le LMS&nbsp;: veuillez fermer cette fenêtre et réessayer plus tard.</p>',
            'sourceUrlMissing': '<p>Nous n\'avons pas pu trouver l\'adresse de la ressource distante&nbsp;: il semble que ce module est invalide, veuillez contacter l\'administrateur de votre LMS.</p>',
        }
    }

    var localizeMessage = function (message) {
        var locale = navigator.language || navigator.userLanguage;
        if (locale) locale = locale.split(/[_-]/)[0];
        if (!errorMessages.hasOwnProperty(locale)) locale = 'en';
        var localizedMessages = errorMessages[locale];
        return localizedMessages.hasOwnProperty(message) ? localizedMessages[message] : message;
    };

    var abort = function (message) {
        document.open()
        document.write(localizeMessage(message));
        document.close();
    };

    var ADAPTER = new SCORMAdapter();
    if (!ADAPTER.foundAPI()) {
        abort('apiNotFound'); return;
    }
    if (!ADAPTER.LMSInitialize("")) {
        abort('couldNotInitialize'); return;
    }

    var sourceUrl = document.body.dataset.source;
    if (!sourceUrl) {
        abort('sourceUrlMissing'); return;
    }

    var sourceUrlParser = document.createElement('a');
    sourceUrlParser.href = sourceUrl;

    var learnerId = ADAPTER.getLearnerId();
    if (learnerId == null) {
        abort('learnerIdMissing'); return;
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
