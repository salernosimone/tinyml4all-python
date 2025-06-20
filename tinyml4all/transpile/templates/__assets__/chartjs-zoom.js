/*!
 * chartjs-plugin-zoom v2.2.0
 * https://www.chartjs.org/chartjs-plugin-zoom/2.2.0/
 * (c) 2016-2024 chartjs-plugin-zoom Contributors
 * Released under the MIT License
 */
! function(t, n) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = n(require("chart.js"), require("hammerjs"), require("chart.js/helpers")) : "function" == typeof define && define.amd ? define(["chart.js", "hammerjs", "chart.js/helpers"], n) : (t = "undefined" != typeof globalThis ? globalThis : t || self).ChartZoom = n(t.Chart, t.Hammer, t.Chart.helpers)
}(this, (function(t, n, e) {
    "use strict";
    const o = t => t && t.enabled && t.modifierKey,
        a = (t, n) => t && n[t + "Key"],
        i = (t, n) => t && !n[t + "Key"];

    function r(t, n, e) {
        return void 0 === t || ("string" == typeof t ? -1 !== t.indexOf(n) : "function" == typeof t && -1 !== t({
            chart: e
        }).indexOf(n))
    }

    function c(t, n) {
        return "function" == typeof t && (t = t({
            chart: n
        })), "string" == typeof t ? {
            x: -1 !== t.indexOf("x"),
            y: -1 !== t.indexOf("y")
        } : {
            x: !1,
            y: !1
        }
    }

    function s(t, n, o) {
        const {
            mode: a = "xy",
            scaleMode: i,
            overScaleMode: r
        } = t || {}, s = function({
            x: t,
            y: n
        }, e) {
            const o = e.scales,
                a = Object.keys(o);
            for (let e = 0; e < a.length; e++) {
                const i = o[a[e]];
                if (n >= i.top && n <= i.bottom && t >= i.left && t <= i.right) return i
            }
            return null
        }(n, o), l = c(a, o), m = c(i, o);
        if (r) {
            const t = c(r, o);
            for (const n of ["x", "y"]) t[n] && (m[n] = l[n], l[n] = !1)
        }
        if (s && m[s.axis]) return [s];
        const u = [];
        return e.each(o.scales, (function(t) {
            l[t.axis] && u.push(t)
        })), u
    }
    const l = new WeakMap;

    function m(t) {
        let n = l.get(t);
        return n || (n = {
            originalScaleLimits: {},
            updatedScaleLimits: {},
            handlers: {},
            panDelta: {},
            dragging: !1,
            panning: !1
        }, l.set(t, n)), n
    }

    function u(t, n, e, o) {
        const a = Math.max(0, Math.min(1, (t - n) / e || 0));
        return {
            min: o * a,
            max: o * (1 - a)
        }
    }

    function d(t, n) {
        const e = t.isHorizontal() ? n.x : n.y;
        return t.getValueForPixel(e)
    }

    function f(t, n, e) {
        const o = t.max - t.min,
            a = o * (n - 1);
        return u(d(t, e), t.min, o, a)
    }

    function p(t, n, o, a, i) {
        let r = o[a];
        if ("original" === r) {
            const o = t.originalScaleLimits[n.id][a];
            r = e.valueOrDefault(o.options, o.scale)
        }
        return e.valueOrDefault(r, i)
    }

    function h(t, {
        min: n,
        max: o
    }, a, i = !1) {
        const r = m(t.chart),
            {
                options: c
            } = t,
            s = function(t, n) {
                return n && (n[t.id] || n[t.axis]) || {}
            }(t, a),
            {
                minRange: l = 0
            } = s,
            u = p(r, t, s, "min", -1 / 0),
            d = p(r, t, s, "max", 1 / 0);
        if ("pan" === i && (n < u || o > d)) return !0;
        const f = t.max - t.min,
            h = i ? Math.max(o - n, l) : f;
        if (i && h === l && f <= l) return !0;
        const g = function(t, {
            min: n,
            max: o,
            minLimit: a,
            maxLimit: i
        }, r) {
            const c = (t - o + n) / 2;
            n -= c, o += c;
            const s = r.min.options ?? r.min.scale,
                l = r.max.options ?? r.max.scale,
                m = t / 1e6;
            return e.almostEquals(n, s, m) && (n = s), e.almostEquals(o, l, m) && (o = l), n < a ? (n = a, o = Math.min(a + t, i)) : o > i && (o = i, n = Math.max(i - t, a)), {
                min: n,
                max: o
            }
        }(h, {
            min: n,
            max: o,
            minLimit: u,
            maxLimit: d
        }, r.originalScaleLimits[t.id]);
        return c.min = g.min, c.max = g.max, r.updatedScaleLimits[t.id] = g, t.parse(g.min) !== t.min || t.parse(g.max) !== t.max
    }
    const g = t => 0 === t || isNaN(t) ? 0 : t < 0 ? Math.min(Math.round(t), -1) : Math.max(Math.round(t), 1);
    const x = {
        second: 500,
        minute: 3e4,
        hour: 18e5,
        day: 432e5,
        week: 3024e5,
        month: 1296e6,
        quarter: 5184e6,
        year: 157248e5
    };

    function b(t, n, e, o = !1) {
        const {
            min: a,
            max: i,
            options: r
        } = t, c = r.time && r.time.round, s = x[c] || 0, l = t.getValueForPixel(t.getPixelForValue(a + s) - n), m = t.getValueForPixel(t.getPixelForValue(i + s) - n);
        return !(!isNaN(l) && !isNaN(m)) || h(t, {
            min: l,
            max: m
        }, e, !!o && "pan")
    }

    function y(t, n, e) {
        return b(t, n, e, !0)
    }
    const v = {
            category: function(t, n, e, o) {
                const a = f(t, n, e);
                return t.min === t.max && n < 1 && function(t) {
                    const n = t.getLabels().length - 1;
                    t.min > 0 && (t.min -= 1), t.max < n && (t.max += 1)
                }(t), h(t, {
                    min: t.min + g(a.min),
                    max: t.max - g(a.max)
                }, o, !0)
            },
            default: function(t, n, e, o) {
                const a = f(t, n, e);
                return h(t, {
                    min: t.min + a.min,
                    max: t.max - a.max
                }, o, !0)
            },
            logarithmic: function(t, n, e, o) {
                const a = function(t, n, e) {
                    const o = d(t, e);
                    if (void 0 === o) return {
                        min: t.min,
                        max: t.max
                    };
                    const a = Math.log10(t.min),
                        i = Math.log10(t.max),
                        r = i - a,
                        c = u(Math.log10(o), a, r, r * (n - 1));
                    return {
                        min: Math.pow(10, a + c.min),
                        max: Math.pow(10, i - c.max)
                    }
                }(t, n, e);
                return h(t, a, o, !0)
            }
        },
        w = {
            default: function(t, n, e, o) {
                h(t, function(t, n, e) {
                    const o = t.getValueForPixel(n),
                        a = t.getValueForPixel(e);
                    return {
                        min: Math.min(o, a),
                        max: Math.max(o, a)
                    }
                }(t, n, e), o, !0)
            }
        },
        z = {
            category: function(t, n, e) {
                const o = t.getLabels().length - 1;
                let {
                    min: a,
                    max: i
                } = t;
                const r = Math.max(i - a, 1),
                    c = Math.round(function(t) {
                        return t.isHorizontal() ? t.width : t.height
                    }(t) / Math.max(r, 10)),
                    s = Math.round(Math.abs(n / c));
                let l;
                return n < -c ? (i = Math.min(i + s, o), a = 1 === r ? i : i - r, l = i === o) : n > c && (a = Math.max(0, a - s), i = 1 === r ? a : a + r, l = 0 === a), h(t, {
                    min: a,
                    max: i
                }, e) || l
            },
            default: b,
            logarithmic: y,
            timeseries: y
        };

    function M(t, n) {
        e.each(t, ((e, o) => {
            n[o] || delete t[o]
        }))
    }

    function k(t, n) {
        const {
            scales: o
        } = t, {
            originalScaleLimits: a,
            updatedScaleLimits: i
        } = n;
        return e.each(o, (function(t) {
            (function(t, n, e) {
                const {
                    id: o,
                    options: {
                        min: a,
                        max: i
                    }
                } = t;
                if (!n[o] || !e[o]) return !0;
                const r = e[o];
                return r.min !== a || r.max !== i
            })(t, a, i) && (a[t.id] = {
                min: {
                    scale: t.min,
                    options: t.options.min
                },
                max: {
                    scale: t.max,
                    options: t.options.max
                }
            })
        })), M(a, o), M(i, o), a
    }

    function S(t, n, o, a) {
        const i = v[t.type] || v.default;
        e.callback(i, [t, n, o, a])
    }

    function P(t, n, o, a) {
        const i = w[t.type] || w.default;
        e.callback(i, [t, n, o, a])
    }

    function D(t) {
        const n = t.chartArea;
        return {
            x: (n.left + n.right) / 2,
            y: (n.top + n.bottom) / 2
        }
    }

    function C(t, n, o = "none", a = "api") {
        const {
            x: i = 1,
            y: r = 1,
            focalPoint: c = D(t)
        } = "number" == typeof n ? {
            x: n,
            y: n
        } : n, l = m(t), {
            options: {
                limits: u,
                zoom: d
            }
        } = l;
        k(t, l);
        const f = 1 !== i,
            p = 1 !== r,
            h = s(d, c, t);
        e.each(h || t.scales, (function(t) {
            t.isHorizontal() && f ? S(t, i, c, u) : !t.isHorizontal() && p && S(t, r, c, u)
        })), t.update(o), e.callback(d.onZoom, [{
            chart: t,
            trigger: a
        }])
    }

    function Z(t, n, o, a = "none", i = "api") {
        const c = m(t),
            {
                options: {
                    limits: s,
                    zoom: l
                }
            } = c,
            {
                mode: u = "xy"
            } = l;
        k(t, c);
        const d = r(u, "x", t),
            f = r(u, "y", t);
        e.each(t.scales, (function(t) {
            t.isHorizontal() && d ? P(t, n.x, o.x, s) : !t.isHorizontal() && f && P(t, n.y, o.y, s)
        })), t.update(a), e.callback(l.onZoom, [{
            chart: t,
            trigger: i
        }])
    }

    function j(t) {
        const n = m(t);
        let o = 1,
            a = 1;
        return e.each(t.scales, (function(t) {
            const i = function(t, n) {
                const o = t.originalScaleLimits[n];
                if (!o) return;
                const {
                    min: a,
                    max: i
                } = o;
                return e.valueOrDefault(i.options, i.scale) - e.valueOrDefault(a.options, a.scale)
            }(n, t.id);
            if (i) {
                const n = Math.round(i / (t.max - t.min) * 100) / 100;
                o = Math.min(o, n), a = Math.max(a, n)
            }
        })), o < 1 ? o : a
    }

    function L(t, n, o, a) {
        const {
            panDelta: i
        } = a, r = i[t.id] || 0;
        e.sign(r) === e.sign(n) && (n += r);
        const c = z[t.type] || z.default;
        e.callback(c, [t, n, o]) ? i[t.id] = 0 : i[t.id] = n
    }

    function O(t, n, o, a = "none") {
        const {
            x: i = 0,
            y: r = 0
        } = "number" == typeof n ? {
            x: n,
            y: n
        } : n, c = m(t), {
            options: {
                pan: s,
                limits: l
            }
        } = c, {
            onPan: u
        } = s || {};
        k(t, c);
        const d = 0 !== i,
            f = 0 !== r;
        e.each(o || t.scales, (function(t) {
            t.isHorizontal() && d ? L(t, i, l, c) : !t.isHorizontal() && f && L(t, r, l, c)
        })), t.update(a), e.callback(u, [{
            chart: t
        }])
    }

    function R(t) {
        const n = m(t);
        k(t, n);
        const e = {};
        for (const o of Object.keys(t.scales)) {
            const {
                min: t,
                max: a
            } = n.originalScaleLimits[o] || {
                min: {},
                max: {}
            };
            e[o] = {
                min: t.scale,
                max: a.scale
            }
        }
        return e
    }

    function E(t) {
        const n = m(t);
        return n.panning || n.dragging
    }
    const F = (t, n, e) => Math.min(e, Math.max(n, t));

    function N(t, n) {
        const {
            handlers: e
        } = m(t), o = e[n];
        o && o.target && (o.target.removeEventListener(n, o), delete e[n])
    }

    function A(t, n, e, o) {
        const {
            handlers: a,
            options: i
        } = m(t), r = a[e];
        if (r && r.target === n) return;
        N(t, e), a[e] = n => o(t, n, i), a[e].target = n;
        const c = "wheel" !== e && void 0;
        n.addEventListener(e, a[e], {
            passive: c
        })
    }

    function H(t, n) {
        const e = m(t);
        e.dragStart && (e.dragging = !0, e.dragEnd = n, t.update("none"))
    }

    function T(t, n) {
        const e = m(t);
        e.dragStart && "Escape" === n.key && (N(t, "keydown"), e.dragging = !1, e.dragStart = e.dragEnd = null, t.update("none"))
    }

    function Y(t, n) {
        if (t.target !== n.canvas) {
            const e = n.canvas.getBoundingClientRect();
            return {
                x: t.clientX - e.left,
                y: t.clientY - e.top
            }
        }
        return e.getRelativePosition(t, n)
    }

    function q(t, n, o) {
        const {
            onZoomStart: a,
            onZoomRejected: i
        } = o;
        if (a) {
            const o = Y(n, t);
            if (!1 === e.callback(a, [{
                    chart: t,
                    event: n,
                    point: o
                }])) return e.callback(i, [{
                chart: t,
                event: n
            }]), !1
        }
    }

    function V(t, n) {
        if (t.legend) {
            const o = e.getRelativePosition(n, t);
            if (e._isPointInArea(o, t.legend)) return
        }
        const r = m(t),
            {
                pan: c,
                zoom: s = {}
            } = r.options;
        if (0 !== n.button || a(o(c), n) || i(o(s.drag), n)) return e.callback(s.onZoomRejected, [{
            chart: t,
            event: n
        }]);
        !1 !== q(t, n, s) && (r.dragStart = n, A(t, t.canvas.ownerDocument, "mousemove", H), A(t, window.document, "keydown", T))
    }

    function X(t, n, e, {
        min: o,
        max: a,
        prop: i
    }) {
        t[o] = F(Math.min(e.begin[i], e.end[i]), n[o], n[a]), t[a] = F(Math.max(e.begin[i], e.end[i]), n[o], n[a])
    }

    function B(t, n, e) {
        const o = {
            begin: Y(n.dragStart, t),
            end: Y(n.dragEnd, t)
        };
        if (e) {
            ! function({
                begin: t,
                end: n
            }, e) {
                let o = n.x - t.x,
                    a = n.y - t.y;
                const i = Math.abs(o / a);
                i > e ? o = Math.sign(o) * Math.abs(a * e) : i < e && (a = Math.sign(a) * Math.abs(o / e)), n.x = t.x + o, n.y = t.y + a
            }(o, t.chartArea.width / t.chartArea.height)
        }
        return o
    }

    function K(t, n, e, o) {
        const a = r(n, "x", t),
            i = r(n, "y", t),
            {
                top: c,
                left: s,
                right: l,
                bottom: m,
                width: u,
                height: d
            } = t.chartArea,
            f = {
                top: c,
                left: s,
                right: l,
                bottom: m
            },
            p = B(t, e, o && a && i);
        a && X(f, t.chartArea, p, {
            min: "left",
            max: "right",
            prop: "x"
        }), i && X(f, t.chartArea, p, {
            min: "top",
            max: "bottom",
            prop: "y"
        });
        const h = f.right - f.left,
            g = f.bottom - f.top;
        return {
            ...f,
            width: h,
            height: g,
            zoomX: a && h ? 1 + (u - h) / u : 1,
            zoomY: i && g ? 1 + (d - g) / d : 1
        }
    }

    function W(t, n) {
        const o = m(t);
        if (!o.dragStart) return;
        N(t, "mousemove");
        const {
            mode: a,
            onZoomComplete: i,
            // @edit
            onThresholdRejected: rr,
            drag: {
                threshold: c = 0,
                maintainAspectRatio: s
            }
        } = o.options.zoom, l = K(t, a, {
            dragStart: o.dragStart,
            dragEnd: n
        }, s), u = r(a, "x", t) ? l.width : 0, d = r(a, "y", t) ? l.height : 0, f = Math.sqrt(u * u + d * d);
        if (o.dragStart = o.dragEnd = null, f <= c) {/* @edit */rr && rr({chart: t, rect: l}); return o.dragging = !1, void t.update("none");}
        Z(t, {
            x: l.left,
            y: l.top
        }, {
            x: l.right,
            y: l.bottom
        }, "zoom", "drag"), o.dragging = !1, o.filterNextClick = !0, e.callback(i, [{
            chart: t
        }])
    }

    function I(t, n) {
        const {
            handlers: {
                onZoomComplete: a
            },
            options: {
                zoom: r
            }
        } = m(t);
        if (! function(t, n, a) {
                if (i(o(a.wheel), n)) e.callback(a.onZoomRejected, [{
                    chart: t,
                    event: n
                }]);
                else if (!1 !== q(t, n, a) && (n.cancelable && n.preventDefault(), void 0 !== n.deltaY)) return !0
            }(t, n, r)) return;
        const c = n.target.getBoundingClientRect(),
            s = r.wheel.speed,
            l = n.deltaY >= 0 ? 2 - 1 / (1 - s) : 1 + s;
        C(t, {
            x: l,
            y: l,
            focalPoint: {
                x: n.clientX - c.left,
                y: n.clientY - c.top
            }
        }, "zoom", "wheel"), e.callback(a, [{
            chart: t
        }])
    }

    function U(t, n, o, a) {
        o && (m(t).handlers[n] = function(t, n) {
            let e;
            return function() {
                return clearTimeout(e), e = setTimeout(t, n), n
            }
        }((() => e.callback(o, [{
            chart: t
        }])), a))
    }

    function _(t, n) {
        return function(r, c) {
            const {
                pan: s,
                zoom: l = {}
            } = n.options;
            if (!s || !s.enabled) return !1;
            const m = c && c.srcEvent;
            return !m || (!(!n.panning && "mouse" === c.pointerType && (i(o(s), m) || a(o(l.drag), m))) || (e.callback(s.onPanRejected, [{
                chart: t,
                event: c
            }]), !1))
        }
    }

    function G(t, n, e) {
        if (n.scale) {
            const {
                center: o,
                pointers: a
            } = e, i = 1 / n.scale * e.scale, c = e.target.getBoundingClientRect(), s = function(t, n) {
                const e = Math.abs(t.clientX - n.clientX),
                    o = Math.abs(t.clientY - n.clientY),
                    a = e / o;
                let i, r;
                return a > .3 && a < 1.7 ? i = r = !0 : e > o ? i = !0 : r = !0, {
                    x: i,
                    y: r
                }
            }(a[0], a[1]), l = n.options.zoom.mode;
            C(t, {
                x: s.x && r(l, "x", t) ? i : 1,
                y: s.y && r(l, "y", t) ? i : 1,
                focalPoint: {
                    x: o.x - c.left,
                    y: o.y - c.top
                }
            }, "zoom", "pinch"), n.scale = e.scale
        }
    }

    function J(t, n, e) {
        const o = n.delta;
        o && (n.panning = !0, O(t, {
            x: e.deltaX - o.x,
            y: e.deltaY - o.y
        }, n.panScales), n.delta = {
            x: e.deltaX,
            y: e.deltaY
        })
    }
    const Q = new WeakMap;

    function $(t, o) {
        const a = m(t),
            i = t.canvas,
            {
                pan: r,
                zoom: c
            } = o,
            l = new n.Manager(i);
        c && c.pinch.enabled && (l.add(new n.Pinch), l.on("pinchstart", (n => function(t, n, o) {
            if (n.options.zoom.pinch.enabled) {
                const a = e.getRelativePosition(o, t);
                !1 === e.callback(n.options.zoom.onZoomStart, [{
                    chart: t,
                    event: o,
                    point: a
                }]) ? (n.scale = null, e.callback(n.options.zoom.onZoomRejected, [{
                    chart: t,
                    event: o
                }])) : n.scale = 1
            }
        }(t, a, n))), l.on("pinch", (n => G(t, a, n))), l.on("pinchend", (n => function(t, n, o) {
            n.scale && (G(t, n, o), n.scale = null, e.callback(n.options.zoom.onZoomComplete, [{
                chart: t
            }]))
        }(t, a, n)))), r && r.enabled && (l.add(new n.Pan({
            threshold: r.threshold,
            enable: _(t, a)
        })), l.on("panstart", (n => function(t, n, o) {
            const {
                enabled: a,
                onPanStart: i,
                onPanRejected: r
            } = n.options.pan;
            if (!a) return;
            const c = o.target.getBoundingClientRect(),
                l = {
                    x: o.center.x - c.left,
                    y: o.center.y - c.top
                };
            if (!1 === e.callback(i, [{
                    chart: t,
                    event: o,
                    point: l
                }])) return e.callback(r, [{
                chart: t,
                event: o
            }]);
            n.panScales = s(n.options.pan, l, t), n.delta = {
                x: 0,
                y: 0
            }, J(t, n, o)
        }(t, a, n))), l.on("panmove", (n => J(t, a, n))), l.on("panend", (() => function(t, n) {
            n.delta = null, n.panning && (n.panning = !1, n.filterNextClick = !0, e.callback(n.options.pan.onPanComplete, [{
                chart: t
            }]))
        }(t, a)))), Q.set(t, l)
    }

    function tt(t) {
        const n = Q.get(t);
        n && (n.remove("pinchstart"), n.remove("pinch"), n.remove("pinchend"), n.remove("panstart"), n.remove("pan"), n.remove("panend"), n.destroy(), Q.delete(t))
    }

    function nt(t, n, e) {
        const o = e.zoom.drag,
            {
                dragStart: a,
                dragEnd: i
            } = m(t);
        if (o.drawTime !== n || !i) return;
        const {
            left: r,
            top: c,
            width: s,
            height: l
        } = K(t, e.zoom.mode, {
            dragStart: a,
            dragEnd: i
        }, o.maintainAspectRatio), u = t.ctx;
        u.save(), u.beginPath(), u.fillStyle = o.backgroundColor || "rgba(225,225,225,0.3)", u.fillRect(r, c, s, l), o.borderWidth > 0 && (u.lineWidth = o.borderWidth, u.strokeStyle = o.borderColor || "rgba(225,225,225)", u.strokeRect(r, c, s, l)), u.restore()
    }
    var et = {
        id: "zoom",
        version: "2.2.0",
        defaults: {
            pan: {
                enabled: !1,
                mode: "xy",
                threshold: 10,
                modifierKey: null
            },
            zoom: {
                wheel: {
                    enabled: !1,
                    speed: .1,
                    modifierKey: null
                },
                drag: {
                    enabled: !1,
                    drawTime: "beforeDatasetsDraw",
                    modifierKey: null
                },
                pinch: {
                    enabled: !1
                },
                mode: "xy"
            }
        },
        start: function(t, o, a) {
            m(t).options = a, Object.prototype.hasOwnProperty.call(a.zoom, "enabled") && console.warn("The option `zoom.enabled` is no longer supported. Please use `zoom.wheel.enabled`, `zoom.drag.enabled`, or `zoom.pinch.enabled`."), (Object.prototype.hasOwnProperty.call(a.zoom, "overScaleMode") || Object.prototype.hasOwnProperty.call(a.pan, "overScaleMode")) && console.warn("The option `overScaleMode` is deprecated. Please use `scaleMode` instead (and update `mode` as desired)."), n && $(t, a), t.pan = (n, e, o) => O(t, n, e, o), t.zoom = (n, e) => C(t, n, e), t.zoomRect = (n, e, o) => Z(t, n, e, o), t.zoomScale = (n, o, a) => function(t, n, o, a = "none", i = "api") {
                const r = m(t);
                k(t, r), h(t.scales[n], o, void 0, !0), t.update(a), e.callback(r.options.zoom?.onZoom, [{
                    chart: t,
                    trigger: i
                }])
            }(t, n, o, a), t.resetZoom = n => function(t, n = "default") {
                const o = m(t),
                    a = k(t, o);
                e.each(t.scales, (function(t) {
                    const n = t.options;
                    a[t.id] ? (n.min = a[t.id].min.options, n.max = a[t.id].max.options) : (delete n.min, delete n.max), delete o.updatedScaleLimits[t.id]
                })), t.update(n), e.callback(o.options.zoom.onZoomComplete, [{
                    chart: t
                }])
            }(t, n), t.getZoomLevel = () => j(t), t.getInitialScaleBounds = () => R(t), t.getZoomedScaleBounds = () => function(t) {
                const n = m(t),
                    e = {};
                for (const o of Object.keys(t.scales)) e[o] = n.updatedScaleLimits[o];
                return e
            }(t), t.isZoomedOrPanned = () => function(t) {
                const n = R(t);
                for (const e of Object.keys(t.scales)) {
                    const {
                        min: o,
                        max: a
                    } = n[e];
                    if (void 0 !== o && t.scales[e].min !== o) return !0;
                    if (void 0 !== a && t.scales[e].max !== a) return !0
                }
                return !1
            }(t), t.isZoomingOrPanning = () => E(t)
        },
        beforeEvent(t, {
            event: n
        }) {
            if (E(t)) return !1;
            if ("click" === n.type || "mouseup" === n.type) {
                const n = m(t);
                if (n.filterNextClick) return n.filterNextClick = !1, !1
            }
        },
        beforeUpdate: function(t, n, e) {
            const o = m(t),
                a = o.options;
            o.options = e,
                function(t, n) {
                    const {
                        pan: e,
                        zoom: o
                    } = t, {
                        pan: a,
                        zoom: i
                    } = n;
                    return o?.zoom?.pinch?.enabled !== i?.zoom?.pinch?.enabled || e?.enabled !== a?.enabled || e?.threshold !== a?.threshold
                }(a, e) && (tt(t), $(t, e)),
                function(t, n) {
                    const e = t.canvas,
                        {
                            wheel: o,
                            drag: a,
                            onZoomComplete: i
                        } = n.zoom;
                    o.enabled ? (A(t, e, "wheel", I), U(t, "onZoomComplete", i, 250)) : N(t, "wheel"), a.enabled ? (A(t, e, "mousedown", V), A(t, e.ownerDocument, "mouseup", W)) : (N(t, "mousedown"), N(t, "mousemove"), N(t, "mouseup"), N(t, "keydown"))
                }(t, e)
        },
        beforeDatasetsDraw(t, n, e) {
            nt(t, "beforeDatasetsDraw", e)
        },
        afterDatasetsDraw(t, n, e) {
            nt(t, "afterDatasetsDraw", e)
        },
        beforeDraw(t, n, e) {
            nt(t, "beforeDraw", e)
        },
        afterDraw(t, n, e) {
            nt(t, "afterDraw", e)
        },
        stop: function(t) {
            ! function(t) {
                N(t, "mousedown"), N(t, "mousemove"), N(t, "mouseup"), N(t, "wheel"), N(t, "click"), N(t, "keydown")
            }(t), n && tt(t),
                function(t) {
                    l.delete(t)
                }(t)
        },
        panFunctions: z,
        zoomFunctions: v,
        zoomRectFunctions: w
    };
    return t.Chart.register(et), et
}));