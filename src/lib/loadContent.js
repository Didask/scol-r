import localizeMessage from './i18n'
import SCORMAdapter from './SCORMAdapter'
import MessageHandler from './MessageHandler'

function loadContent () {

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

    new MessageHandler(window, sourceUrlParser.origin, ADAPTER);

    window.addEventListener('beforeunload', function () {
        var sessionEnd = new Date();
        ADAPTER.setSessionTime(sessionEnd - sessionStart);
        ADAPTER.LMSCommit("");
        ADAPTER.LMSFinish("");
    });

}

export default loadContent