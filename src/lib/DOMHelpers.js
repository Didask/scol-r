var D = document

export function $(s, r) {
    r = r || D;
    return r.querySelector(s)
}

export function $create(t, p, c, el) {
    p = p || {};
    el = D.createElement(t)
    Object.keys(p).forEach(function (k) {
        el.setAttribute(k, p[k])
    })
    c && (Array.isArray(c) ? c : [c]).forEach(function (n) {
        el.appendChild(n.nodeType ? n : D.createTextNode(n))
    })
    return el
}