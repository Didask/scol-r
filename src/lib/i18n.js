const i18n_txt = {
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

export default function i18n(str) {
    return (i18n_txt[(navigator.language || navigator.userLanguage || 'en').split(/[_-]/)[0]] || i18n_txt['en'])[str] || str
}