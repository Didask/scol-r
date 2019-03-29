function loadContent () {

    var messages = {
        'en': {
            'pageTitle': 'Your content is loading...',
            'pageSubtitle': 'Please wait, or if your content doesn\'t appear, try closing and opening this window again.',
            'pageErrorMessagesTitle': 'If the initialization fails, error messages will appear below:',
            'pageFooter': 'This content is loaded via <a href="https://github.com/Didask/scol-r" target="_blank">SCOL-R</a>, a cross-domain SCORM connector created by <a href="https://www.didask.com" target="_blank">Didask</a>.',
            'apiNotFound': '<p>We were not able to contact your LMS: please close this window and try again later.</p>',
            'couldNotInitialize': '<p>We were not able to initialize the connection with your LMS: please close this window and try again later.</p>',
            'learnerIdMissing': '<p>We could not get your learner ID from the LMS: please close this window and try again later.</p>',
            'sourceUrlMissing': '<p>We could find the address of the remote resource: it looks like this module is invalid, please contact your LMS administrator.</p>',
            'runtimeErrorTitle': 'An error occurred:',
        },
        'fr': {
            'pageTitle': 'Votre contenu est en cours de chargement...',
            'pageSubtitle': 'Merci de patienter&nbsp;; si votre contenu ne se charge pas, veuillez essayer de fermer et d\'ouvrir cette fenêtre à nouveau.',
            'pageErrorMessagesTitle': 'Si l\'initialisation échoue, les messages d\'erreur apparaîtront ci-dessous&nbsp;:',
            'pageFooter': 'Ce contenu est chargé via <a href="https://github.com/Didask/scol-r" target="_blank">SCOL-R</a>, un connecteur SCORM cross-domaine créé par <a href="https://www.didask.com" target="_blank">Didask</a>.',
            'apiNotFound': '<p>Nous n\'avons pas pu contacter votre LMS&nbsp;: veuillez fermer cette fenêtre et réessayer plus tard.</p>',
            'couldNotInitialize': '<p>Nous n\'avons pas pu initialiser la connection avec votre LMS&nbsp;: veuillez fermer cette fenêtre et réessayer plus tard.</p>',
            'learnerIdMissing': '<p>Nous n\'avons pas pu obtenir votre identifiant depuis le LMS&nbsp;: veuillez fermer cette fenêtre et réessayer plus tard.</p>',
            'sourceUrlMissing': '<p>Nous n\'avons pas pu trouver l\'adresse de la ressource distante&nbsp;: il semble que ce module est invalide, veuillez contacter l\'administrateur de votre LMS.</p>',
            'runtimeErrorTitle': 'Une erreur s\'est produite&nbsp;:'
        }
    }

    var localizeMessage = function (message) {
        var locale = navigator.language || navigator.userLanguage;
        if (locale) locale = locale.split(/[_-]/)[0];
        if (!messages.hasOwnProperty(locale)) locale = 'en';
        var localizedMessages = messages[locale];
        return localizedMessages.hasOwnProperty(message) ? localizedMessages[message] : message;
    };

    document.getElementById('title').innerHTML = localizeMessage('pageTitle');
    document.getElementById('subtitle').innerHTML = localizeMessage('pageSubtitle');
    document.getElementById('footer-content').innerHTML = localizeMessage('pageFooter');
    document.getElementById('title-error-messages').innerHTML = localizeMessage('pageErrorMessagesTitle');

    var displayInitError = function (message) {
        var messagesContainer = document.getElementsByClassName('messages');
        var newMessage = document.createElement('p');
        newMessage.innerHTML = localizeMessage(message);
        messagesContainer.length && messagesContainer[0].appendChild(newMessage);
    };

    var displayRuntimeError = function () {
        var errorContainer = document.getElementById('runtime-error');
        if (!(arguments && arguments.length)) {
            errorContainer.innerHTML = ''; return;
        }
        errorContainer.innerHTML = '<h6>' + localizeMessage('runtimeErrorTitle') + '</h6>';
        for (var i = 0; i < arguments.length; i++) {
            if (!arguments[i]) continue;
            var thisError = document.createElement('p');
            thisError.innerHTML = localizeMessage(arguments[i]);
            errorContainer.appendChild(thisError);
        }
        // Remove the messages after 3 seconds
        setTimeout(function(){ errorContainer.innerHTML = ''; }, 3000);
    }

    var ADAPTER = new SCORMAdapter(displayRuntimeError);
    if (!ADAPTER.foundAPI()) { displayInitError('apiNotFound'); return; }
    if (!ADAPTER.LMSInitialize("")) { displayInitError('couldNotInitialize'); return; }

    var sourceUrl = document.body.getAttribute('data-source');
    if (!sourceUrl) { displayInitError('sourceUrlMissing'); return; }

    var sourceUrlParser = document.createElement('a');
    sourceUrlParser.href = sourceUrl;

    var learnerId = ADAPTER.getLearnerId();
    if (learnerId == null) { displayInitError('learnerIdMissing'); return; }

    sourceUrlParser.search += 
        (sourceUrlParser.search.indexOf('?') === -1 ? '?' : '&')
        + 'scorm&learner_id=' + learnerId
        + '&lms_origin=' + location.origin;

    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', sourceUrlParser.href);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('width', '100%');
    document.body.insertBefore(iframe, document.getElementById('wrapper'));

    var sessionStart = new Date();

    var messageHandler = new MessageHandler(window, sourceUrlParser.origin, ADAPTER);

    window.addEventListener('beforeunload', function (e) {
        var sessionEnd = new Date();
        ADAPTER.setSessionTime(sessionEnd - sessionStart);
        ADAPTER.LMSCommit("");
        ADAPTER.LMSFinish("");
    });

}