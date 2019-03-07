(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
"use strict";var _loadContent=_interopRequireDefault(require("./lib/loadContent.js"));function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}global.loadContent=_loadContent.default;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/loadContent.js":5}],2:[function(require,module,exports){
"use strict";function MessageHandler(t,e,s){t.addEventListener("message",function(t){if(t.origin===e){var s=t.data.function,n=t.data.arguments;s&&n&&"function"==typeof this[s]&&this[s].apply(this,n)}}.bind(this)),this.setTitle=function(t){document.title=t},this.setScore=function(t){s.setScore(t)},this.setLessonStatus=function(t){s.setLessonStatus(t)}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var _default=MessageHandler;exports.default=_default;

},{}],3:[function(require,module,exports){
"use strict";function SCORMAdapter(errorCallback){this._API=null,this._isSCORM2004=null,this._errorCallback="function"==typeof errorCallback?errorCallback:function(){},this.initialize=function(){this.findAndSetAPI()},this.findAndSetAPI=function(){var t=this._findAPIInWindow(window);null==t&&null!=window.opener&&void 0!==window.opener&&(t=this._findAPIInWindow(window.opener)),null==t?console.error("Unable to find an API adapter"):(this._API=t.API,this._isSCORM2004=t.isSCORM2004),null==this._API&&console.error("Couldn't find the API!")},this.foundAPI=function(){return!!this._API},this._findAPIInWindow=function(t){for(var i=0;null==t.API&&null==t.API_1484_11&&null!=t.parent&&t.parent!=t;){if(++i>7)return console.error("Error finding API -- too deeply nested."),null;t=t.parent}return t.API?{API:t.API,isSCORM2004:!1}:t.API_1484_11?{API:t.API_1484_11,isSCORM2004:!0}:null},this._callAPIFunction=function(t,i){if(null!=this._API)return this._isSCORM2004&&0==t.indexOf("LMS")?t=t.substr(3):this._isSCORM2004||0!=!t.indexOf("LMS")||(t="LMS"+t),this._API[t].apply(this._API,i);this._warnNOAPI()},this.LMSInitialize=function(){var result=this._callAPIFunction("Initialize",arguments);return result=eval(result.toString()),result||this._handleError(),result},this.LMSTerminate=function(){var result=this._callAPIFunction(this._isSCORM2004?"Terminate":"Finish",arguments);return result=eval(result.toString()),result||this._handleError(),result},this.LMSFinish=this.LMSTerminate,this.LMSGetValue=function(){var t=this._callAPIFunction("GetValue",arguments);return 0===this.LMSGetLastError()?t:(this._handleError(),null)},this.LMSSetValue=function(){var result=this._callAPIFunction("SetValue",arguments);return result=eval(result.toString()),result||this._handleError(),result.toString()},this.LMSCommit=function(){var result=this._callAPIFunction("Commit",arguments);return result=eval(result.toString()),result||this._handleError(),result},this.LMSGetLastError=function(){return parseInt(this._callAPIFunction("GetLastError",arguments))},this.LMSGetErrorString=function(){return this._callAPIFunction("GetErrorString",arguments)},this.LMSGetDiagnostic=function(){return this._callAPIFunction("GetDiagnostic",arguments)},this._handleError=function(){var t=this.LMSGetLastError(),i=this.LMSGetErrorString(t),e=this.LMSGetDiagnostic(t);0!==t&&(console.warn("An error occured on the SCORM API:","Error "+t+": "+i,e),this._errorCallback(i,e&&e!=t?e:null))},this._warnNOAPI=function(){console.warn("Cannot execute this function because the SCORM API is not available."),this._errorCallback("The API of the LMS was not found.")},this.getLearnerId=function(){var t=this._isSCORM2004?"cmi.learner_id":"cmi.core.student_id";return this.LMSGetValue(t)},this.setScore=function(t){var i=this._isSCORM2004?"cmi.score.scaled":"cmi.core.score.raw";this._isSCORM2004&&(t/=100),this.LMSSetValue(i,t),this.LMSCommit("")},this.setLessonStatus=function(t){if(this._isSCORM2004){var i="unknown";"passed"!==t&&"failed"!==t||(i=t),this.LMSSetValue("cmi.success_status",i);var e="unknown";"passed"===t||"completed"===t?e="completed":"incomplete"===t?e="incomplete":"not attempted"!==t&&"browsed"!==t||(e="not attempted"),this.LMSSetValue("cmi.completion_status",e)}else this.LMSSetValue("cmi.core.lesson_status",t);this.LMSCommit("")},this.setSessionTime=function(t){var i=this._isSCORM2004?"cmi.session_time":"cmi.core.session_time",e=Math.floor(t/1e3/60/60);t-=1e3*e*60*60;var n=Math.floor(t/1e3/60);t-=1e3*n*60;var r=Math.floor(t/1e3);r<10&&(r="0"+r),n<10&&(n="0"+n),e<10&&(e="0"+e);var s=e+":"+n+":"+r;this.LMSSetValue(i,s),this.LMSCommit("")},this.initialize()}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var _default=SCORMAdapter;exports.default=_default;

},{}],4:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=i18n;var messages={en:{pageTitle:"Your content is loading...",pageSubtitle:"Please wait, or if your content doesn't appear, try closing and opening this window again.",pageErrorMessagesTitle:"If the initialization fails, error messages will appear below:",pageFooter:'This content is loaded via <a href="https://github.com/Didask/scol-r" target="_blank">SCOL-R</a>, a cross-domain SCORM connector created by <a href="https://www.didask.com" target="_blank">Didask</a>.',apiNotFound:"<p>We were not able to contact your LMS: please close this window and try again later.</p>",couldNotInitialize:"<p>We were not able to initialize the connection with your LMS: please close this window and try again later.</p>",learnerIdMissing:"<p>We could not get your learner ID from the LMS: please close this window and try again later.</p>",sourceUrlMissing:"<p>We could find the address of the remote resource: it looks like this module is invalid, please contact your LMS administrator.</p>",runtimeErrorTitle:"An error occurred:"},fr:{pageTitle:"Votre contenu est en cours de chargement...",pageSubtitle:"Merci de patienter&nbsp;; si votre contenu ne se charge pas, veuillez essayer de fermer et d'ouvrir cette fenêtre à nouveau.",pageErrorMessagesTitle:"Si l'initialisation échoue, les messages d'erreur apparaîtront ci-dessous&nbsp;:",pageFooter:'Ce contenu est chargé via <a href="https://github.com/Didask/scol-r" target="_blank">SCOL-R</a>, un connecteur SCORM cross-domaine créé par <a href="https://www.didask.com" target="_blank">Didask</a>.',apiNotFound:"<p>Nous n'avons pas pu contacter votre LMS&nbsp;: veuillez fermer cette fenêtre et réessayer plus tard.</p>",couldNotInitialize:"<p>Nous n'avons pas pu initialiser la connection avec votre LMS&nbsp;: veuillez fermer cette fenêtre et réessayer plus tard.</p>",learnerIdMissing:"<p>Nous n'avons pas pu obtenir votre identifiant depuis le LMS&nbsp;: veuillez fermer cette fenêtre et réessayer plus tard.</p>",sourceUrlMissing:"<p>Nous n'avons pas pu trouver l'adresse de la ressource distante&nbsp;: il semble que ce module est invalide, veuillez contacter l'administrateur de votre LMS.</p>",runtimeErrorTitle:"Une erreur s'est produite&nbsp;:"}};function i18n(e){var t=navigator.language||navigator.userLanguage;t&&(t=t.split(/[_-]/)[0]),messages.hasOwnProperty(t)||(t="en");var r=messages[t];return r.hasOwnProperty(e)?r[e]:e}

},{}],5:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var _i18n=_interopRequireDefault(require("./i18n")),_MessageHandler=_interopRequireDefault(require("./MessageHandler")),_SCORMAdapter=_interopRequireDefault(require("./SCORMAdapter"));function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function loadContent(){document.getElementById("title").innerHTML=(0,_i18n.default)("pageTitle"),document.getElementById("subtitle").innerHTML=(0,_i18n.default)("pageSubtitle"),document.getElementById("footer-content").innerHTML=(0,_i18n.default)("pageFooter"),document.getElementById("title-error-messages").innerHTML=(0,_i18n.default)("pageErrorMessagesTitle");var e=function(e){var t=document.getElementsByClassName("messages"),n=document.createElement("p");n.innerHTML=(0,_i18n.default)(e),t.length&&t[0].appendChild(n)},t=new _SCORMAdapter.default(function(){var e=document.getElementById("runtime-error");if(arguments&&arguments.length){e.innerHTML="<h6>"+(0,_i18n.default)("runtimeErrorTitle")+"</h6>";for(var t=0;t<arguments.length;t++)if(arguments[t]){var n=document.createElement("p");n.innerHTML=(0,_i18n.default)(arguments[t]),e.appendChild(n)}setTimeout(function(){e.innerHTML=""},3e3)}else e.innerHTML=""});if(t.foundAPI())if(t.LMSInitialize("")){var n=document.body.getAttribute("data-source");if(n){var r=document.createElement("a");r.href=n;var i=t.getLearnerId();if(null!=i){r.search+=(-1===r.search.indexOf("?")?"?":"&")+"scorm&learner_id="+i+"&lms_origin="+location.origin;var a=document.createElement("iframe");a.setAttribute("src",r.href),a.setAttribute("frameborder","0"),a.setAttribute("height","100%"),a.setAttribute("width","100%"),document.body.insertBefore(a,document.getElementById("wrapper"));var o=new Date;new _MessageHandler.default(window,r.origin,t),window.addEventListener("beforeunload",function(){var e=new Date;t.setSessionTime(e-o),t.LMSCommit(""),t.LMSFinish("")})}else e("learnerIdMissing")}else e("sourceUrlMissing")}else e("couldNotInitialize");else e("apiNotFound")}var _default=loadContent;exports.default=_default;

},{"./MessageHandler":2,"./SCORMAdapter":3,"./i18n":4}]},{},[1]);
