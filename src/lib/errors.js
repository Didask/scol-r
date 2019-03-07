import i18n from './i18n'
import {$, $create} from './DOMHelpers'

export const InitError = (str) => {
    const box = $('.messages')
    box && box.appendChild($create('p', {}, i18n(str)))
}

export const RuntimeError = (...args) => {
    const box = $('#runtime-error')
    
    box.innerHTML = ""
    if (!args.length) return;
    
    box.innerHTML = '<h6>' + i18n('runtimeErrorTitle') + '</h6>'
    args.forEach( a => { box.appendChild($create('p', {}, i18n(a))) })
    setTimeout(function () { box.innerHTML = '' }, 3000)
}