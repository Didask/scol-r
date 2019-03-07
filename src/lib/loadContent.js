import i18n from './i18n'
import MessageHandler from './MessageHandler'
import SCORMAdapter from './SCORMAdapter'

import {InitError, RuntimeError} from './errors'
import {$, $create} from './DOMHelpers'

function loadContent () {

    $('#title').innerHTML = i18n('pageTitle')
    $('#subtitle').innerHTML = i18n('pageSubtitle')
    $('#footer-content').innerHTML = i18n('pageFooter')
    $('#title-error-messages').innerHTML = i18n('pageErrorMessagesTitle')

    try {
        var ADAPTER = new SCORMAdapter(RuntimeError),
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
        InitError(error)
    }
}

export default loadContent