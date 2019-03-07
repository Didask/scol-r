import localizeMessage from './i18n'
import MessageHandler from './MessageHandler'
import SCORMAdapter from './SCORMAdapter'

import {$, $create} from './DOMHelpers'
import {Arr} from './utils'

function displayInitError (str) {
    var box = $('.messages')
    box && box.appendChild($create('p', {}, localizeMessage(str)))
}

function displayRuntimeError () {
    var box = $('#runtime-error'),
        args = Arr(arguments)
    
    box.innerHTML = ""
    if (!args.length) return;
    
    box.innerHTML = '<h6>' + localizeMessage('runtimeErrorTitle') + '</h6>'
    args.forEach(function (a) {
        box.appendChild($create('p', {}, localizeMessage(a)))
    })
    setTimeout(function () {box.innerHTML = ''}, 3000)
}

function loadContent () {

    $('#title').innerHTML = localizeMessage('pageTitle')
    $('#subtitle').innerHTML = localizeMessage('pageSubtitle')
    $('#footer-content').innerHTML = localizeMessage('pageFooter')
    $('#title-error-messages').innerHTML = localizeMessage('pageErrorMessagesTitle')

    try {

        var ADAPTER = new SCORMAdapter(displayRuntimeError),
            sourceUrl = document.body.getAttribute('data-source'),
            sessionStart = new Date(),
            learnerId = ADAPTER.getLearnerId();


        if (!ADAPTER.foundAPI()) { throw 'apiNotFound' }
        if (!ADAPTER.LMSInitialize("")) { throw 'couldNotInitialize' }
        if (learnerId == null) { throw 'learnerIdMissing' }


        if (!sourceUrl) { throw 'sourceUrlMissing' }
        var urlParts = $create('a', {
            href: sourceUrl
        });
        urlParts.search += (urlParts.search[0] ? '&' : '?') + [
            'scorm',
            `learner_id=${ learnerId }`,
            `lms_origin=${ location.origin }`
        ].join('&')
    
        document.body.insertBefore($create('iframe', {
            src: urlParts.href,
            frameborder: '0'
        }), $('#wrapper'))
    
        new MessageHandler(window, urlParts.origin, ADAPTER);

        window.addEventListener('beforeunload', function () {
            ADAPTER.setSessionTime((new Date()) - sessionStart);
            ADAPTER.LMSCommit("");
            ADAPTER.LMSFinish("");
        });

    } catch (error) {
        displayInitError(error)
    }
}

export default loadContent