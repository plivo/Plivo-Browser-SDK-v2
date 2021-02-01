/***
Copyright (c) 2013-2018, callstats.io
All rights reserved.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
***/

/*! callstats  version = 3.53.1 2018-08-07 11-35-59 */

!function() {
    function a(b, c, d) {
        function e(g, h) {
            if (!c[g]) {
                if (!b[g]) {
                    var i = "function" == typeof require && require;
                    if (!h && i) return i(g, !0);
                    if (f) return f(g, !0);
                    var j = new Error("Cannot find module '" + g + "'");
                    throw j.code = "MODULE_NOT_FOUND", j;
                }
                var k = c[g] = {
                    exports: {}
                };
                b[g][0].call(k.exports, function(a) {
                    return e(b[g][1][a] || a);
                }, k, k.exports, a, b, c, d);
            }
            return c[g].exports;
        }
        for (var f = "function" == typeof require && require, g = 0; g < d.length; g++) e(d[g]);
        return e;
    }
    return a;
}()({
    1: [ function(a, b, c) {
        (function(a, d, e) {
            !function(a) {
                if ("object" == typeof c && void 0 !== b) b.exports = a(); else if ("function" == typeof define && define.amd) define([], a); else {
                    var e;
                    "undefined" != typeof window ? e = window : void 0 !== d ? e = d : "undefined" != typeof self && (e = self), 
                    e.Promise = a();
                }
            }(function() {
                var b, c, f;
                return function a(b, c, d) {
                    function e(g, h) {
                        if (!c[g]) {
                            if (!b[g]) {
                                var i = "function" == typeof _dereq_ && _dereq_;
                                if (!h && i) return i(g, !0);
                                if (f) return f(g, !0);
                                var j = new Error("Cannot find module '" + g + "'");
                                throw j.code = "MODULE_NOT_FOUND", j;
                            }
                            var k = c[g] = {
                                exports: {}
                            };
                            b[g][0].call(k.exports, function(a) {
                                var c = b[g][1][a];
                                return e(c || a);
                            }, k, k.exports, a, b, c, d);
                        }
                        return c[g].exports;
                    }
                    for (var f = "function" == typeof _dereq_ && _dereq_, g = 0; g < d.length; g++) e(d[g]);
                    return e;
                }({
                    1: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(a) {
                            function b(a) {
                                var b = new c(a), d = b.promise();
                                return b.setHowMany(1), b.setUnwrap(), b.init(), d;
                            }
                            var c = a._SomePromiseArray;
                            a.any = function(a) {
                                return b(a);
                            }, a.prototype.any = function() {
                                return b(this);
                            };
                        };
                    }, {} ],
                    2: [ function(b, c, d) {
                        "use strict";
                        function e() {
                            this._customScheduler = !1, this._isTickUsed = !1, this._lateQueue = new k(16), 
                            this._normalQueue = new k(16), this._haveDrainedQueues = !1, this._trampolineEnabled = !0;
                            var a = this;
                            this.drainQueues = function() {
                                a._drainQueues();
                            }, this._schedule = j;
                        }
                        function f(a, b, c) {
                            this._lateQueue.push(a, b, c), this._queueTick();
                        }
                        function g(a, b, c) {
                            this._normalQueue.push(a, b, c), this._queueTick();
                        }
                        function h(a) {
                            this._normalQueue._pushOne(a), this._queueTick();
                        }
                        var i;
                        try {
                            throw new Error();
                        } catch (a) {
                            i = a;
                        }
                        var j = b("./schedule"), k = b("./queue"), l = b("./util");
                        e.prototype.setScheduler = function(a) {
                            var b = this._schedule;
                            return this._schedule = a, this._customScheduler = !0, b;
                        }, e.prototype.hasCustomScheduler = function() {
                            return this._customScheduler;
                        }, e.prototype.enableTrampoline = function() {
                            this._trampolineEnabled = !0;
                        }, e.prototype.disableTrampolineIfNecessary = function() {
                            l.hasDevTools && (this._trampolineEnabled = !1);
                        }, e.prototype.haveItemsQueued = function() {
                            return this._isTickUsed || this._haveDrainedQueues;
                        }, e.prototype.fatalError = function(b, c) {
                            c ? (a.stderr.write("Fatal " + (b instanceof Error ? b.stack : b) + "\n"), a.exit(2)) : this.throwLater(b);
                        }, e.prototype.throwLater = function(a, b) {
                            if (1 === arguments.length && (b = a, a = function() {
                                throw b;
                            }), "undefined" != typeof setTimeout) setTimeout(function() {
                                a(b);
                            }, 0); else try {
                                this._schedule(function() {
                                    a(b);
                                });
                            } catch (a) {
                                throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
                            }
                        }, l.hasDevTools ? (e.prototype.invokeLater = function(a, b, c) {
                            this._trampolineEnabled ? f.call(this, a, b, c) : this._schedule(function() {
                                setTimeout(function() {
                                    a.call(b, c);
                                }, 100);
                            });
                        }, e.prototype.invoke = function(a, b, c) {
                            this._trampolineEnabled ? g.call(this, a, b, c) : this._schedule(function() {
                                a.call(b, c);
                            });
                        }, e.prototype.settlePromises = function(a) {
                            this._trampolineEnabled ? h.call(this, a) : this._schedule(function() {
                                a._settlePromises();
                            });
                        }) : (e.prototype.invokeLater = f, e.prototype.invoke = g, e.prototype.settlePromises = h), 
                        e.prototype._drainQueue = function(a) {
                            for (;a.length() > 0; ) {
                                var b = a.shift();
                                if ("function" == typeof b) {
                                    var c = a.shift(), d = a.shift();
                                    b.call(c, d);
                                } else b._settlePromises();
                            }
                        }, e.prototype._drainQueues = function() {
                            this._drainQueue(this._normalQueue), this._reset(), this._haveDrainedQueues = !0, 
                            this._drainQueue(this._lateQueue);
                        }, e.prototype._queueTick = function() {
                            this._isTickUsed || (this._isTickUsed = !0, this._schedule(this.drainQueues));
                        }, e.prototype._reset = function() {
                            this._isTickUsed = !1;
                        }, c.exports = e, c.exports.firstLineError = i;
                    }, {
                        "./queue": 26,
                        "./schedule": 29,
                        "./util": 36
                    } ],
                    3: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(a, b, c, d) {
                            var e = !1, f = function(a, b) {
                                this._reject(b);
                            }, g = function(a, b) {
                                b.promiseRejectionQueued = !0, b.bindingPromise._then(f, f, null, this, a);
                            }, h = function(a, b) {
                                0 == (50397184 & this._bitField) && this._resolveCallback(b.target);
                            }, i = function(a, b) {
                                b.promiseRejectionQueued || this._reject(a);
                            };
                            a.prototype.bind = function(f) {
                                e || (e = !0, a.prototype._propagateFrom = d.propagateFromFunction(), a.prototype._boundValue = d.boundValueFunction());
                                var j = c(f), k = new a(b);
                                k._propagateFrom(this, 1);
                                var l = this._target();
                                if (k._setBoundTo(j), j instanceof a) {
                                    var m = {
                                        promiseRejectionQueued: !1,
                                        promise: k,
                                        target: l,
                                        bindingPromise: j
                                    };
                                    l._then(b, g, void 0, k, m), j._then(h, i, void 0, k, m), k._setOnCancel(j);
                                } else k._resolveCallback(l);
                                return k;
                            }, a.prototype._setBoundTo = function(a) {
                                void 0 !== a ? (this._bitField = 2097152 | this._bitField, this._boundTo = a) : this._bitField = -2097153 & this._bitField;
                            }, a.prototype._isBound = function() {
                                return 2097152 == (2097152 & this._bitField);
                            }, a.bind = function(b, c) {
                                return a.resolve(c).bind(b);
                            };
                        };
                    }, {} ],
                    4: [ function(a, b, c) {
                        "use strict";
                        function d() {
                            try {
                                Promise === f && (Promise = e);
                            } catch (a) {}
                            return f;
                        }
                        var e;
                        "undefined" != typeof Promise && (e = Promise);
                        var f = a("./promise")();
                        f.noConflict = d, b.exports = f;
                    }, {
                        "./promise": 22
                    } ],
                    5: [ function(a, b, c) {
                        "use strict";
                        var d = Object.create;
                        if (d) {
                            var e = d(null), f = d(null);
                            e[" size"] = f[" size"] = 0;
                        }
                        b.exports = function(b) {
                            function c(a, c) {
                                var d;
                                if (null != a && (d = a[c]), "function" != typeof d) {
                                    var e = "Object " + h.classString(a) + " has no method '" + h.toString(c) + "'";
                                    throw new b.TypeError(e);
                                }
                                return d;
                            }
                            function d(a) {
                                return c(a, this.pop()).apply(a, this);
                            }
                            function e(a) {
                                return a[this];
                            }
                            function f(a) {
                                var b = +this;
                                return b < 0 && (b = Math.max(0, b + a.length)), a[b];
                            }
                            var g, h = a("./util"), i = h.canEvaluate;
                            h.isIdentifier;
                            b.prototype.call = function(a) {
                                var b = [].slice.call(arguments, 1);
                                return b.push(a), this._then(d, void 0, void 0, b, void 0);
                            }, b.prototype.get = function(a) {
                                var b, c = "number" == typeof a;
                                if (c) b = f; else if (i) {
                                    var d = g(a);
                                    b = null !== d ? d : e;
                                } else b = e;
                                return this._then(b, void 0, void 0, a, void 0);
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    6: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e) {
                            var f = a("./util"), g = f.tryCatch, h = f.errorObj, i = b._async;
                            b.prototype.break = b.prototype.cancel = function() {
                                if (!e.cancellation()) return this._warn("cancellation is disabled");
                                for (var a = this, b = a; a._isCancellable(); ) {
                                    if (!a._cancelBy(b)) {
                                        b._isFollowing() ? b._followee().cancel() : b._cancelBranched();
                                        break;
                                    }
                                    var c = a._cancellationParent;
                                    if (null == c || !c._isCancellable()) {
                                        a._isFollowing() ? a._followee().cancel() : a._cancelBranched();
                                        break;
                                    }
                                    a._isFollowing() && a._followee().cancel(), a._setWillBeCancelled(), b = a, a = c;
                                }
                            }, b.prototype._branchHasCancelled = function() {
                                this._branchesRemainingToCancel--;
                            }, b.prototype._enoughBranchesHaveCancelled = function() {
                                return void 0 === this._branchesRemainingToCancel || this._branchesRemainingToCancel <= 0;
                            }, b.prototype._cancelBy = function(a) {
                                return a === this ? (this._branchesRemainingToCancel = 0, this._invokeOnCancel(), 
                                !0) : (this._branchHasCancelled(), !!this._enoughBranchesHaveCancelled() && (this._invokeOnCancel(), 
                                !0));
                            }, b.prototype._cancelBranched = function() {
                                this._enoughBranchesHaveCancelled() && this._cancel();
                            }, b.prototype._cancel = function() {
                                this._isCancellable() && (this._setCancelled(), i.invoke(this._cancelPromises, this, void 0));
                            }, b.prototype._cancelPromises = function() {
                                this._length() > 0 && this._settlePromises();
                            }, b.prototype._unsetOnCancel = function() {
                                this._onCancelField = void 0;
                            }, b.prototype._isCancellable = function() {
                                return this.isPending() && !this._isCancelled();
                            }, b.prototype.isCancellable = function() {
                                return this.isPending() && !this.isCancelled();
                            }, b.prototype._doInvokeOnCancel = function(a, b) {
                                if (f.isArray(a)) for (var c = 0; c < a.length; ++c) this._doInvokeOnCancel(a[c], b); else if (void 0 !== a) if ("function" == typeof a) {
                                    if (!b) {
                                        var d = g(a).call(this._boundValue());
                                        d === h && (this._attachExtraTrace(d.e), i.throwLater(d.e));
                                    }
                                } else a._resultCancelled(this);
                            }, b.prototype._invokeOnCancel = function() {
                                var a = this._onCancel();
                                this._unsetOnCancel(), i.invoke(this._doInvokeOnCancel, this, a);
                            }, b.prototype._invokeInternalOnCancel = function() {
                                this._isCancellable() && (this._doInvokeOnCancel(this._onCancel(), !0), this._unsetOnCancel());
                            }, b.prototype._resultCancelled = function() {
                                this.cancel();
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    7: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b) {
                            function c(a, c, h) {
                                return function(i) {
                                    var j = h._boundValue();
                                    a: for (var k = 0; k < a.length; ++k) {
                                        var l = a[k];
                                        if (l === Error || null != l && l.prototype instanceof Error) {
                                            if (i instanceof l) return f(c).call(j, i);
                                        } else if ("function" == typeof l) {
                                            var m = f(l).call(j, i);
                                            if (m === g) return m;
                                            if (m) return f(c).call(j, i);
                                        } else if (d.isObject(i)) {
                                            for (var n = e(l), o = 0; o < n.length; ++o) {
                                                var p = n[o];
                                                if (l[p] != i[p]) continue a;
                                            }
                                            return f(c).call(j, i);
                                        }
                                    }
                                    return b;
                                };
                            }
                            var d = a("./util"), e = a("./es5").keys, f = d.tryCatch, g = d.errorObj;
                            return c;
                        };
                    }, {
                        "./es5": 13,
                        "./util": 36
                    } ],
                    8: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(a) {
                            function b() {
                                this._trace = new b.CapturedTrace(d());
                            }
                            function c() {
                                if (e) return new b();
                            }
                            function d() {
                                var a = f.length - 1;
                                if (a >= 0) return f[a];
                            }
                            var e = !1, f = [];
                            return a.prototype._promiseCreated = function() {}, a.prototype._pushContext = function() {}, 
                            a.prototype._popContext = function() {
                                return null;
                            }, a._peekContext = a.prototype._peekContext = function() {}, b.prototype._pushContext = function() {
                                void 0 !== this._trace && (this._trace._promiseCreated = null, f.push(this._trace));
                            }, b.prototype._popContext = function() {
                                if (void 0 !== this._trace) {
                                    var a = f.pop(), b = a._promiseCreated;
                                    return a._promiseCreated = null, b;
                                }
                                return null;
                            }, b.CapturedTrace = null, b.create = c, b.deactivateLongStackTraces = function() {}, 
                            b.activateLongStackTraces = function() {
                                var c = a.prototype._pushContext, f = a.prototype._popContext, g = a._peekContext, h = a.prototype._peekContext, i = a.prototype._promiseCreated;
                                b.deactivateLongStackTraces = function() {
                                    a.prototype._pushContext = c, a.prototype._popContext = f, a._peekContext = g, a.prototype._peekContext = h, 
                                    a.prototype._promiseCreated = i, e = !1;
                                }, e = !0, a.prototype._pushContext = b.prototype._pushContext, a.prototype._popContext = b.prototype._popContext, 
                                a._peekContext = a.prototype._peekContext = d, a.prototype._promiseCreated = function() {
                                    var a = this._peekContext();
                                    a && null == a._promiseCreated && (a._promiseCreated = this);
                                };
                            }, b;
                        };
                    }, {} ],
                    9: [ function(b, c, d) {
                        "use strict";
                        c.exports = function(c, d) {
                            function e(a, b) {
                                return {
                                    promise: b
                                };
                            }
                            function f() {
                                return !1;
                            }
                            function g(a, b, c) {
                                var d = this;
                                try {
                                    a(b, c, function(a) {
                                        if ("function" != typeof a) throw new TypeError("onCancel must be a function, got: " + N.toString(a));
                                        d._attachCancellationCallback(a);
                                    });
                                } catch (a) {
                                    return a;
                                }
                            }
                            function h(a) {
                                if (!this._isCancellable()) return this;
                                var b = this._onCancel();
                                void 0 !== b ? N.isArray(b) ? b.push(a) : this._setOnCancel([ b, a ]) : this._setOnCancel(a);
                            }
                            function i() {
                                return this._onCancelField;
                            }
                            function j(a) {
                                this._onCancelField = a;
                            }
                            function k() {
                                this._cancellationParent = void 0, this._onCancelField = void 0;
                            }
                            function l(a, b) {
                                if (0 != (1 & b)) {
                                    this._cancellationParent = a;
                                    var c = a._branchesRemainingToCancel;
                                    void 0 === c && (c = 0), a._branchesRemainingToCancel = c + 1;
                                }
                                0 != (2 & b) && a._isBound() && this._setBoundTo(a._boundTo);
                            }
                            function m(a, b) {
                                0 != (2 & b) && a._isBound() && this._setBoundTo(a._boundTo);
                            }
                            function n() {
                                var a = this._boundTo;
                                return void 0 !== a && a instanceof c ? a.isFulfilled() ? a.value() : void 0 : a;
                            }
                            function o() {
                                this._trace = new G(this._peekContext());
                            }
                            function p(a, b) {
                                if (O(a)) {
                                    var c = this._trace;
                                    if (void 0 !== c && b && (c = c._parent), void 0 !== c) c.attachExtraTrace(a); else if (!a.__stackCleaned__) {
                                        var d = y(a);
                                        N.notEnumerableProp(a, "stack", d.message + "\n" + d.stack.join("\n")), N.notEnumerableProp(a, "__stackCleaned__", !0);
                                    }
                                }
                            }
                            function q(a, b, c, d, e) {
                                if (void 0 === a && null !== b && Y) {
                                    if (void 0 !== e && e._returnedNonUndefined()) return;
                                    if (0 == (65535 & d._bitField)) return;
                                    c && (c += " ");
                                    var f = "", g = "";
                                    if (b._trace) {
                                        for (var h = b._trace.stack.split("\n"), i = w(h), j = i.length - 1; j >= 0; --j) {
                                            var k = i[j];
                                            if (!Q.test(k)) {
                                                var l = k.match(R);
                                                l && (f = "at " + l[1] + ":" + l[2] + ":" + l[3] + " ");
                                                break;
                                            }
                                        }
                                        if (i.length > 0) for (var m = i[0], j = 0; j < h.length; ++j) if (h[j] === m) {
                                            j > 0 && (g = "\n" + h[j - 1]);
                                            break;
                                        }
                                    }
                                    var n = "a promise was created in a " + c + "handler " + f + "but was not returned from it, see http://goo.gl/rRqMUw" + g;
                                    d._warn(n, !0, b);
                                }
                            }
                            function r(a, b) {
                                var c = a + " is deprecated and will be removed in a future version.";
                                return b && (c += " Use " + b + " instead."), s(c);
                            }
                            function s(a, b, d) {
                                if (ga.warnings) {
                                    var e, f = new M(a);
                                    if (b) d._attachExtraTrace(f); else if (ga.longStackTraces && (e = c._peekContext())) e.attachExtraTrace(f); else {
                                        var g = y(f);
                                        f.stack = g.message + "\n" + g.stack.join("\n");
                                    }
                                    ba("warning", f) || z(f, "", !0);
                                }
                            }
                            function t(a, b) {
                                for (var c = 0; c < b.length - 1; ++c) b[c].push("From previous event:"), b[c] = b[c].join("\n");
                                return c < b.length && (b[c] = b[c].join("\n")), a + "\n" + b.join("\n");
                            }
                            function u(a) {
                                for (var b = 0; b < a.length; ++b) (0 === a[b].length || b + 1 < a.length && a[b][0] === a[b + 1][0]) && (a.splice(b, 1), 
                                b--);
                            }
                            function v(a) {
                                for (var b = a[0], c = 1; c < a.length; ++c) {
                                    for (var d = a[c], e = b.length - 1, f = b[e], g = -1, h = d.length - 1; h >= 0; --h) if (d[h] === f) {
                                        g = h;
                                        break;
                                    }
                                    for (var h = g; h >= 0; --h) {
                                        var i = d[h];
                                        if (b[e] !== i) break;
                                        b.pop(), e--;
                                    }
                                    b = d;
                                }
                            }
                            function w(a) {
                                for (var b = [], c = 0; c < a.length; ++c) {
                                    var d = a[c], e = "    (No stack trace)" === d || S.test(d), f = e && da(d);
                                    e && !f && (U && " " !== d.charAt(0) && (d = "    " + d), b.push(d));
                                }
                                return b;
                            }
                            function x(a) {
                                for (var b = a.stack.replace(/\s+$/g, "").split("\n"), c = 0; c < b.length; ++c) {
                                    var d = b[c];
                                    if ("    (No stack trace)" === d || S.test(d)) break;
                                }
                                return c > 0 && "SyntaxError" != a.name && (b = b.slice(c)), b;
                            }
                            function y(a) {
                                var b = a.stack, c = a.toString();
                                return b = "string" == typeof b && b.length > 0 ? x(a) : [ "    (No stack trace)" ], 
                                {
                                    message: c,
                                    stack: "SyntaxError" == a.name ? b : w(b)
                                };
                            }
                            function z(a, b, c) {
                                if ("undefined" != typeof console) {
                                    var d;
                                    if (N.isObject(a)) {
                                        var e = a.stack;
                                        d = b + T(e, a);
                                    } else d = b + String(a);
                                    "function" == typeof J ? J(d, c) : "function" != typeof console.log && "object" != typeof console.log || console.log(d);
                                }
                            }
                            function A(a, b, c, d) {
                                var e = !1;
                                try {
                                    "function" == typeof b && (e = !0, "rejectionHandled" === a ? b(d) : b(c, d));
                                } catch (a) {
                                    L.throwLater(a);
                                }
                                "unhandledRejection" === a ? ba(a, c, d) || e || z(c, "Unhandled rejection ") : ba(a, d);
                            }
                            function B(a) {
                                var b;
                                if ("function" == typeof a) b = "[function " + (a.name || "anonymous") + "]"; else {
                                    b = a && "function" == typeof a.toString ? a.toString() : N.toString(a);
                                    if (/\[object [a-zA-Z0-9$_]+\]/.test(b)) try {
                                        b = JSON.stringify(a);
                                    } catch (a) {}
                                    0 === b.length && (b = "(empty array)");
                                }
                                return "(<" + C(b) + ">, no stack trace)";
                            }
                            function C(a) {
                                return a.length < 41 ? a : a.substr(0, 38) + "...";
                            }
                            function D() {
                                return "function" == typeof fa;
                            }
                            function E(a) {
                                var b = a.match(ea);
                                if (b) return {
                                    fileName: b[1],
                                    line: parseInt(b[2], 10)
                                };
                            }
                            function F(a, b) {
                                if (D()) {
                                    for (var c, d, e = a.stack.split("\n"), f = b.stack.split("\n"), g = -1, h = -1, i = 0; i < e.length; ++i) {
                                        var j = E(e[i]);
                                        if (j) {
                                            c = j.fileName, g = j.line;
                                            break;
                                        }
                                    }
                                    for (var i = 0; i < f.length; ++i) {
                                        var j = E(f[i]);
                                        if (j) {
                                            d = j.fileName, h = j.line;
                                            break;
                                        }
                                    }
                                    g < 0 || h < 0 || !c || !d || c !== d || g >= h || (da = function(a) {
                                        if (P.test(a)) return !0;
                                        var b = E(a);
                                        return !!(b && b.fileName === c && g <= b.line && b.line <= h);
                                    });
                                }
                            }
                            function G(a) {
                                this._parent = a, this._promisesCreated = 0;
                                var b = this._length = 1 + (void 0 === a ? 0 : a._length);
                                fa(this, G), b > 32 && this.uncycle();
                            }
                            var H, I, J, K = c._getDomain, L = c._async, M = b("./errors").Warning, N = b("./util"), O = N.canAttachTrace, P = /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/, Q = /\((?:timers\.js):\d+:\d+\)/, R = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/, S = null, T = null, U = !1, V = !(0 == N.env("BLUEBIRD_DEBUG")), W = !(0 == N.env("BLUEBIRD_WARNINGS") || !V && !N.env("BLUEBIRD_WARNINGS")), X = !(0 == N.env("BLUEBIRD_LONG_STACK_TRACES") || !V && !N.env("BLUEBIRD_LONG_STACK_TRACES")), Y = 0 != N.env("BLUEBIRD_W_FORGOTTEN_RETURN") && (W || !!N.env("BLUEBIRD_W_FORGOTTEN_RETURN"));
                            c.prototype.suppressUnhandledRejections = function() {
                                var a = this._target();
                                a._bitField = -1048577 & a._bitField | 524288;
                            }, c.prototype._ensurePossibleRejectionHandled = function() {
                                if (0 == (524288 & this._bitField)) {
                                    this._setRejectionIsUnhandled();
                                    var a = this;
                                    setTimeout(function() {
                                        a._notifyUnhandledRejection();
                                    }, 1);
                                }
                            }, c.prototype._notifyUnhandledRejectionIsHandled = function() {
                                A("rejectionHandled", H, void 0, this);
                            }, c.prototype._setReturnedNonUndefined = function() {
                                this._bitField = 268435456 | this._bitField;
                            }, c.prototype._returnedNonUndefined = function() {
                                return 0 != (268435456 & this._bitField);
                            }, c.prototype._notifyUnhandledRejection = function() {
                                if (this._isRejectionUnhandled()) {
                                    var a = this._settledValue();
                                    this._setUnhandledRejectionIsNotified(), A("unhandledRejection", I, a, this);
                                }
                            }, c.prototype._setUnhandledRejectionIsNotified = function() {
                                this._bitField = 262144 | this._bitField;
                            }, c.prototype._unsetUnhandledRejectionIsNotified = function() {
                                this._bitField = -262145 & this._bitField;
                            }, c.prototype._isUnhandledRejectionNotified = function() {
                                return (262144 & this._bitField) > 0;
                            }, c.prototype._setRejectionIsUnhandled = function() {
                                this._bitField = 1048576 | this._bitField;
                            }, c.prototype._unsetRejectionIsUnhandled = function() {
                                this._bitField = -1048577 & this._bitField, this._isUnhandledRejectionNotified() && (this._unsetUnhandledRejectionIsNotified(), 
                                this._notifyUnhandledRejectionIsHandled());
                            }, c.prototype._isRejectionUnhandled = function() {
                                return (1048576 & this._bitField) > 0;
                            }, c.prototype._warn = function(a, b, c) {
                                return s(a, b, c || this);
                            }, c.onPossiblyUnhandledRejection = function(a) {
                                var b = K();
                                I = "function" == typeof a ? null === b ? a : N.domainBind(b, a) : void 0;
                            }, c.onUnhandledRejectionHandled = function(a) {
                                var b = K();
                                H = "function" == typeof a ? null === b ? a : N.domainBind(b, a) : void 0;
                            };
                            var Z = function() {};
                            c.longStackTraces = function() {
                                if (L.haveItemsQueued() && !ga.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
                                if (!ga.longStackTraces && D()) {
                                    var a = c.prototype._captureStackTrace, b = c.prototype._attachExtraTrace;
                                    ga.longStackTraces = !0, Z = function() {
                                        if (L.haveItemsQueued() && !ga.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
                                        c.prototype._captureStackTrace = a, c.prototype._attachExtraTrace = b, d.deactivateLongStackTraces(), 
                                        L.enableTrampoline(), ga.longStackTraces = !1;
                                    }, c.prototype._captureStackTrace = o, c.prototype._attachExtraTrace = p, d.activateLongStackTraces(), 
                                    L.disableTrampolineIfNecessary();
                                }
                            }, c.hasLongStackTraces = function() {
                                return ga.longStackTraces && D();
                            };
                            var $ = function() {
                                try {
                                    if ("function" == typeof CustomEvent) {
                                        var a = new CustomEvent("CustomEvent");
                                        return N.global.dispatchEvent(a), function(a, b) {
                                            var c = new CustomEvent(a.toLowerCase(), {
                                                detail: b,
                                                cancelable: !0
                                            });
                                            return !N.global.dispatchEvent(c);
                                        };
                                    }
                                    if ("function" == typeof Event) {
                                        var a = new Event("CustomEvent");
                                        return N.global.dispatchEvent(a), function(a, b) {
                                            var c = new Event(a.toLowerCase(), {
                                                cancelable: !0
                                            });
                                            return c.detail = b, !N.global.dispatchEvent(c);
                                        };
                                    }
                                    var a = document.createEvent("CustomEvent");
                                    return a.initCustomEvent("testingtheevent", !1, !0, {}), N.global.dispatchEvent(a), 
                                    function(a, b) {
                                        var c = document.createEvent("CustomEvent");
                                        return c.initCustomEvent(a.toLowerCase(), !1, !0, b), !N.global.dispatchEvent(c);
                                    };
                                } catch (a) {}
                                return function() {
                                    return !1;
                                };
                            }(), _ = function() {
                                return N.isNode ? function() {
                                    return a.emit.apply(a, arguments);
                                } : N.global ? function(a) {
                                    var b = "on" + a.toLowerCase(), c = N.global[b];
                                    return !!c && (c.apply(N.global, [].slice.call(arguments, 1)), !0);
                                } : function() {
                                    return !1;
                                };
                            }(), aa = {
                                promiseCreated: e,
                                promiseFulfilled: e,
                                promiseRejected: e,
                                promiseResolved: e,
                                promiseCancelled: e,
                                promiseChained: function(a, b, c) {
                                    return {
                                        promise: b,
                                        child: c
                                    };
                                },
                                warning: function(a, b) {
                                    return {
                                        warning: b
                                    };
                                },
                                unhandledRejection: function(a, b, c) {
                                    return {
                                        reason: b,
                                        promise: c
                                    };
                                },
                                rejectionHandled: e
                            }, ba = function(a) {
                                var b = !1;
                                try {
                                    b = _.apply(null, arguments);
                                } catch (a) {
                                    L.throwLater(a), b = !0;
                                }
                                var c = !1;
                                try {
                                    c = $(a, aa[a].apply(null, arguments));
                                } catch (a) {
                                    L.throwLater(a), c = !0;
                                }
                                return c || b;
                            };
                            c.config = function(a) {
                                if (a = Object(a), "longStackTraces" in a && (a.longStackTraces ? c.longStackTraces() : !a.longStackTraces && c.hasLongStackTraces() && Z()), 
                                "warnings" in a) {
                                    var b = a.warnings;
                                    ga.warnings = !!b, Y = ga.warnings, N.isObject(b) && "wForgottenReturn" in b && (Y = !!b.wForgottenReturn);
                                }
                                if ("cancellation" in a && a.cancellation && !ga.cancellation) {
                                    if (L.haveItemsQueued()) throw new Error("cannot enable cancellation after promises are in use");
                                    c.prototype._clearCancellationData = k, c.prototype._propagateFrom = l, c.prototype._onCancel = i, 
                                    c.prototype._setOnCancel = j, c.prototype._attachCancellationCallback = h, c.prototype._execute = g, 
                                    ca = l, ga.cancellation = !0;
                                }
                                return "monitoring" in a && (a.monitoring && !ga.monitoring ? (ga.monitoring = !0, 
                                c.prototype._fireEvent = ba) : !a.monitoring && ga.monitoring && (ga.monitoring = !1, 
                                c.prototype._fireEvent = f)), c;
                            }, c.prototype._fireEvent = f, c.prototype._execute = function(a, b, c) {
                                try {
                                    a(b, c);
                                } catch (a) {
                                    return a;
                                }
                            }, c.prototype._onCancel = function() {}, c.prototype._setOnCancel = function(a) {}, 
                            c.prototype._attachCancellationCallback = function(a) {}, c.prototype._captureStackTrace = function() {}, 
                            c.prototype._attachExtraTrace = function() {}, c.prototype._clearCancellationData = function() {}, 
                            c.prototype._propagateFrom = function(a, b) {};
                            var ca = m, da = function() {
                                return !1;
                            }, ea = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
                            N.inherits(G, Error), d.CapturedTrace = G, G.prototype.uncycle = function() {
                                var a = this._length;
                                if (!(a < 2)) {
                                    for (var b = [], c = {}, d = 0, e = this; void 0 !== e; ++d) b.push(e), e = e._parent;
                                    a = this._length = d;
                                    for (var d = a - 1; d >= 0; --d) {
                                        var f = b[d].stack;
                                        void 0 === c[f] && (c[f] = d);
                                    }
                                    for (var d = 0; d < a; ++d) {
                                        var g = b[d].stack, h = c[g];
                                        if (void 0 !== h && h !== d) {
                                            h > 0 && (b[h - 1]._parent = void 0, b[h - 1]._length = 1), b[d]._parent = void 0, 
                                            b[d]._length = 1;
                                            var i = d > 0 ? b[d - 1] : this;
                                            h < a - 1 ? (i._parent = b[h + 1], i._parent.uncycle(), i._length = i._parent._length + 1) : (i._parent = void 0, 
                                            i._length = 1);
                                            for (var j = i._length + 1, k = d - 2; k >= 0; --k) b[k]._length = j, j++;
                                            return;
                                        }
                                    }
                                }
                            }, G.prototype.attachExtraTrace = function(a) {
                                if (!a.__stackCleaned__) {
                                    this.uncycle();
                                    for (var b = y(a), c = b.message, d = [ b.stack ], e = this; void 0 !== e; ) d.push(w(e.stack.split("\n"))), 
                                    e = e._parent;
                                    v(d), u(d), N.notEnumerableProp(a, "stack", t(c, d)), N.notEnumerableProp(a, "__stackCleaned__", !0);
                                }
                            };
                            var fa = function() {
                                var a = /^\s*at\s*/, b = function(a, b) {
                                    return "string" == typeof a ? a : void 0 !== b.name && void 0 !== b.message ? b.toString() : B(b);
                                };
                                if ("number" == typeof Error.stackTraceLimit && "function" == typeof Error.captureStackTrace) {
                                    Error.stackTraceLimit += 6, S = a, T = b;
                                    var c = Error.captureStackTrace;
                                    return da = function(a) {
                                        return P.test(a);
                                    }, function(a, b) {
                                        Error.stackTraceLimit += 6, c(a, b), Error.stackTraceLimit -= 6;
                                    };
                                }
                                var d = new Error();
                                if ("string" == typeof d.stack && d.stack.split("\n")[0].indexOf("stackDetection@") >= 0) return S = /@/, 
                                T = b, U = !0, function(a) {
                                    a.stack = new Error().stack;
                                };
                                var e;
                                try {
                                    throw new Error();
                                } catch (a) {
                                    e = "stack" in a;
                                }
                                return "stack" in d || !e || "number" != typeof Error.stackTraceLimit ? (T = function(a, b) {
                                    return "string" == typeof a ? a : "object" != typeof b && "function" != typeof b || void 0 === b.name || void 0 === b.message ? B(b) : b.toString();
                                }, null) : (S = a, T = b, function(a) {
                                    Error.stackTraceLimit += 6;
                                    try {
                                        throw new Error();
                                    } catch (b) {
                                        a.stack = b.stack;
                                    }
                                    Error.stackTraceLimit -= 6;
                                });
                            }();
                            "undefined" != typeof console && void 0 !== console.warn && (J = function(a) {
                                console.warn(a);
                            }, N.isNode && a.stderr.isTTY ? J = function(a, b) {
                                var c = b ? "[33m" : "[31m";
                                console.warn(c + a + "[0m\n");
                            } : N.isNode || "string" != typeof new Error().stack || (J = function(a, b) {
                                console.warn("%c" + a, b ? "color: darkorange" : "color: red");
                            }));
                            var ga = {
                                warnings: W,
                                longStackTraces: !1,
                                cancellation: !1,
                                monitoring: !1
                            };
                            return X && c.longStackTraces(), {
                                longStackTraces: function() {
                                    return ga.longStackTraces;
                                },
                                warnings: function() {
                                    return ga.warnings;
                                },
                                cancellation: function() {
                                    return ga.cancellation;
                                },
                                monitoring: function() {
                                    return ga.monitoring;
                                },
                                propagateFromFunction: function() {
                                    return ca;
                                },
                                boundValueFunction: function() {
                                    return n;
                                },
                                checkForgottenReturns: q,
                                setBounds: F,
                                warn: s,
                                deprecated: r,
                                CapturedTrace: G,
                                fireDomEvent: $,
                                fireGlobalEvent: _
                            };
                        };
                    }, {
                        "./errors": 12,
                        "./util": 36
                    } ],
                    10: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(a) {
                            function b() {
                                return this.value;
                            }
                            function c() {
                                throw this.reason;
                            }
                            a.prototype.return = a.prototype.thenReturn = function(c) {
                                return c instanceof a && c.suppressUnhandledRejections(), this._then(b, void 0, void 0, {
                                    value: c
                                }, void 0);
                            }, a.prototype.throw = a.prototype.thenThrow = function(a) {
                                return this._then(c, void 0, void 0, {
                                    reason: a
                                }, void 0);
                            }, a.prototype.catchThrow = function(a) {
                                if (arguments.length <= 1) return this._then(void 0, c, void 0, {
                                    reason: a
                                }, void 0);
                                var b = arguments[1], d = function() {
                                    throw b;
                                };
                                return this.caught(a, d);
                            }, a.prototype.catchReturn = function(c) {
                                if (arguments.length <= 1) return c instanceof a && c.suppressUnhandledRejections(), 
                                this._then(void 0, b, void 0, {
                                    value: c
                                }, void 0);
                                var d = arguments[1];
                                d instanceof a && d.suppressUnhandledRejections();
                                var e = function() {
                                    return d;
                                };
                                return this.caught(c, e);
                            };
                        };
                    }, {} ],
                    11: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(a, b) {
                            function c() {
                                return f(this);
                            }
                            function d(a, c) {
                                return e(a, c, b, b);
                            }
                            var e = a.reduce, f = a.all;
                            a.prototype.each = function(a) {
                                return e(this, a, b, 0)._then(c, void 0, void 0, this, void 0);
                            }, a.prototype.mapSeries = function(a) {
                                return e(this, a, b, b);
                            }, a.each = function(a, d) {
                                return e(a, d, b, 0)._then(c, void 0, void 0, a, void 0);
                            }, a.mapSeries = d;
                        };
                    }, {} ],
                    12: [ function(a, b, c) {
                        "use strict";
                        function d(a, b) {
                            function c(d) {
                                if (!(this instanceof c)) return new c(d);
                                l(this, "message", "string" == typeof d ? d : b), l(this, "name", a), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : Error.call(this);
                            }
                            return k(c, Error), c;
                        }
                        function e(a) {
                            if (!(this instanceof e)) return new e(a);
                            l(this, "name", "OperationalError"), l(this, "message", a), this.cause = a, this.isOperational = !0, 
                            a instanceof Error ? (l(this, "message", a.message), l(this, "stack", a.stack)) : Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
                        }
                        var f, g, h = a("./es5"), i = h.freeze, j = a("./util"), k = j.inherits, l = j.notEnumerableProp, m = d("Warning", "warning"), n = d("CancellationError", "cancellation error"), o = d("TimeoutError", "timeout error"), p = d("AggregateError", "aggregate error");
                        try {
                            f = TypeError, g = RangeError;
                        } catch (a) {
                            f = d("TypeError", "type error"), g = d("RangeError", "range error");
                        }
                        for (var q = "join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" "), r = 0; r < q.length; ++r) "function" == typeof Array.prototype[q[r]] && (p.prototype[q[r]] = Array.prototype[q[r]]);
                        h.defineProperty(p.prototype, "length", {
                            value: 0,
                            configurable: !1,
                            writable: !0,
                            enumerable: !0
                        }), p.prototype.isOperational = !0;
                        var s = 0;
                        p.prototype.toString = function() {
                            var a = Array(4 * s + 1).join(" "), b = "\n" + a + "AggregateError of:\n";
                            s++, a = Array(4 * s + 1).join(" ");
                            for (var c = 0; c < this.length; ++c) {
                                for (var d = this[c] === this ? "[Circular AggregateError]" : this[c] + "", e = d.split("\n"), f = 0; f < e.length; ++f) e[f] = a + e[f];
                                d = e.join("\n"), b += d + "\n";
                            }
                            return s--, b;
                        }, k(e, Error);
                        var t = Error.__BluebirdErrorTypes__;
                        t || (t = i({
                            CancellationError: n,
                            TimeoutError: o,
                            OperationalError: e,
                            RejectionError: e,
                            AggregateError: p
                        }), h.defineProperty(Error, "__BluebirdErrorTypes__", {
                            value: t,
                            writable: !1,
                            enumerable: !1,
                            configurable: !1
                        })), b.exports = {
                            Error: Error,
                            TypeError: f,
                            RangeError: g,
                            CancellationError: t.CancellationError,
                            OperationalError: t.OperationalError,
                            TimeoutError: t.TimeoutError,
                            AggregateError: t.AggregateError,
                            Warning: m
                        };
                    }, {
                        "./es5": 13,
                        "./util": 36
                    } ],
                    13: [ function(a, b, c) {
                        var d = function() {
                            "use strict";
                            return void 0 === this;
                        }();
                        if (d) b.exports = {
                            freeze: Object.freeze,
                            defineProperty: Object.defineProperty,
                            getDescriptor: Object.getOwnPropertyDescriptor,
                            keys: Object.keys,
                            names: Object.getOwnPropertyNames,
                            getPrototypeOf: Object.getPrototypeOf,
                            isArray: Array.isArray,
                            isES5: d,
                            propertyIsWritable: function(a, b) {
                                var c = Object.getOwnPropertyDescriptor(a, b);
                                return !(c && !c.writable && !c.set);
                            }
                        }; else {
                            var e = {}.hasOwnProperty, f = {}.toString, g = {}.constructor.prototype, h = function(a) {
                                var b = [];
                                for (var c in a) e.call(a, c) && b.push(c);
                                return b;
                            }, i = function(a, b) {
                                return {
                                    value: a[b]
                                };
                            }, j = function(a, b, c) {
                                return a[b] = c.value, a;
                            }, k = function(a) {
                                return a;
                            }, l = function(a) {
                                try {
                                    return Object(a).constructor.prototype;
                                } catch (a) {
                                    return g;
                                }
                            }, m = function(a) {
                                try {
                                    return "[object Array]" === f.call(a);
                                } catch (a) {
                                    return !1;
                                }
                            };
                            b.exports = {
                                isArray: m,
                                keys: h,
                                names: h,
                                defineProperty: j,
                                getDescriptor: i,
                                freeze: k,
                                getPrototypeOf: l,
                                isES5: d,
                                propertyIsWritable: function() {
                                    return !0;
                                }
                            };
                        }
                    }, {} ],
                    14: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(a, b) {
                            var c = a.map;
                            a.prototype.filter = function(a, d) {
                                return c(this, a, d, b);
                            }, a.filter = function(a, d, e) {
                                return c(a, d, e, b);
                            };
                        };
                    }, {} ],
                    15: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d) {
                            function e(a, b, c) {
                                this.promise = a, this.type = b, this.handler = c, this.called = !1, this.cancelPromise = null;
                            }
                            function f(a) {
                                this.finallyHandler = a;
                            }
                            function g(a, b) {
                                return null != a.cancelPromise && (arguments.length > 1 ? a.cancelPromise._reject(b) : a.cancelPromise._cancel(), 
                                a.cancelPromise = null, !0);
                            }
                            function h() {
                                return j.call(this, this.promise._target()._settledValue());
                            }
                            function i(a) {
                                if (!g(this, a)) return m.e = a, m;
                            }
                            function j(a) {
                                var e = this.promise, j = this.handler;
                                if (!this.called) {
                                    this.called = !0;
                                    var k = this.isFinallyHandler() ? j.call(e._boundValue()) : j.call(e._boundValue(), a);
                                    if (k === d) return k;
                                    if (void 0 !== k) {
                                        e._setReturnedNonUndefined();
                                        var n = c(k, e);
                                        if (n instanceof b) {
                                            if (null != this.cancelPromise) {
                                                if (n._isCancelled()) {
                                                    var o = new l("late cancellation observer");
                                                    return e._attachExtraTrace(o), m.e = o, m;
                                                }
                                                n.isPending() && n._attachCancellationCallback(new f(this));
                                            }
                                            return n._then(h, i, void 0, this, void 0);
                                        }
                                    }
                                }
                                return e.isRejected() ? (g(this), m.e = a, m) : (g(this), a);
                            }
                            var k = a("./util"), l = b.CancellationError, m = k.errorObj, n = a("./catch_filter")(d);
                            return e.prototype.isFinallyHandler = function() {
                                return 0 === this.type;
                            }, f.prototype._resultCancelled = function() {
                                g(this.finallyHandler);
                            }, b.prototype._passThrough = function(a, b, c, d) {
                                return "function" != typeof a ? this.then() : this._then(c, d, void 0, new e(this, b, a), void 0);
                            }, b.prototype.lastly = b.prototype.finally = function(a) {
                                return this._passThrough(a, 0, j, j);
                            }, b.prototype.tap = function(a) {
                                return this._passThrough(a, 1, j);
                            }, b.prototype.tapCatch = function(a) {
                                var c = arguments.length;
                                if (1 === c) return this._passThrough(a, 1, void 0, j);
                                var d, e = new Array(c - 1), f = 0;
                                for (d = 0; d < c - 1; ++d) {
                                    var g = arguments[d];
                                    if (!k.isObject(g)) return b.reject(new TypeError("tapCatch statement predicate: expecting an object but got " + k.classString(g)));
                                    e[f++] = g;
                                }
                                e.length = f;
                                var h = arguments[d];
                                return this._passThrough(n(e, h, this), 1, void 0, j);
                            }, e;
                        };
                    }, {
                        "./catch_filter": 7,
                        "./util": 36
                    } ],
                    16: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e, f, g) {
                            function h(a, c, d) {
                                for (var f = 0; f < c.length; ++f) {
                                    d._pushContext();
                                    var g = n(c[f])(a);
                                    if (d._popContext(), g === m) {
                                        d._pushContext();
                                        var h = b.reject(m.e);
                                        return d._popContext(), h;
                                    }
                                    var i = e(g, d);
                                    if (i instanceof b) return i;
                                }
                                return null;
                            }
                            function i(a, c, e, f) {
                                if (g.cancellation()) {
                                    var h = new b(d), i = this._finallyPromise = new b(d);
                                    this._promise = h.lastly(function() {
                                        return i;
                                    }), h._captureStackTrace(), h._setOnCancel(this);
                                } else {
                                    (this._promise = new b(d))._captureStackTrace();
                                }
                                this._stack = f, this._generatorFunction = a, this._receiver = c, this._generator = void 0, 
                                this._yieldHandlers = "function" == typeof e ? [ e ].concat(o) : o, this._yieldedPromise = null, 
                                this._cancellationPhase = !1;
                            }
                            var j = a("./errors"), k = j.TypeError, l = a("./util"), m = l.errorObj, n = l.tryCatch, o = [];
                            l.inherits(i, f), i.prototype._isResolved = function() {
                                return null === this._promise;
                            }, i.prototype._cleanup = function() {
                                this._promise = this._generator = null, g.cancellation() && null !== this._finallyPromise && (this._finallyPromise._fulfill(), 
                                this._finallyPromise = null);
                            }, i.prototype._promiseCancelled = function() {
                                if (!this._isResolved()) {
                                    var a, c = void 0 !== this._generator.return;
                                    if (c) this._promise._pushContext(), a = n(this._generator.return).call(this._generator, void 0), 
                                    this._promise._popContext(); else {
                                        var d = new b.CancellationError("generator .return() sentinel");
                                        b.coroutine.returnSentinel = d, this._promise._attachExtraTrace(d), this._promise._pushContext(), 
                                        a = n(this._generator.throw).call(this._generator, d), this._promise._popContext();
                                    }
                                    this._cancellationPhase = !0, this._yieldedPromise = null, this._continue(a);
                                }
                            }, i.prototype._promiseFulfilled = function(a) {
                                this._yieldedPromise = null, this._promise._pushContext();
                                var b = n(this._generator.next).call(this._generator, a);
                                this._promise._popContext(), this._continue(b);
                            }, i.prototype._promiseRejected = function(a) {
                                this._yieldedPromise = null, this._promise._attachExtraTrace(a), this._promise._pushContext();
                                var b = n(this._generator.throw).call(this._generator, a);
                                this._promise._popContext(), this._continue(b);
                            }, i.prototype._resultCancelled = function() {
                                if (this._yieldedPromise instanceof b) {
                                    var a = this._yieldedPromise;
                                    this._yieldedPromise = null, a.cancel();
                                }
                            }, i.prototype.promise = function() {
                                return this._promise;
                            }, i.prototype._run = function() {
                                this._generator = this._generatorFunction.call(this._receiver), this._receiver = this._generatorFunction = void 0, 
                                this._promiseFulfilled(void 0);
                            }, i.prototype._continue = function(a) {
                                var c = this._promise;
                                if (a === m) return this._cleanup(), this._cancellationPhase ? c.cancel() : c._rejectCallback(a.e, !1);
                                var d = a.value;
                                if (!0 === a.done) return this._cleanup(), this._cancellationPhase ? c.cancel() : c._resolveCallback(d);
                                var f = e(d, this._promise);
                                if (!(f instanceof b) && null === (f = h(f, this._yieldHandlers, this._promise))) return void this._promiseRejected(new k("A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/MqrFmX\n\n".replace("%s", String(d)) + "From coroutine:\n" + this._stack.split("\n").slice(1, -7).join("\n")));
                                f = f._target();
                                var g = f._bitField;
                                0 == (50397184 & g) ? (this._yieldedPromise = f, f._proxy(this, null)) : 0 != (33554432 & g) ? b._async.invoke(this._promiseFulfilled, this, f._value()) : 0 != (16777216 & g) ? b._async.invoke(this._promiseRejected, this, f._reason()) : this._promiseCancelled();
                            }, b.coroutine = function(a, b) {
                                if ("function" != typeof a) throw new k("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
                                var c = Object(b).yieldHandler, d = i, e = new Error().stack;
                                return function() {
                                    var b = a.apply(this, arguments), f = new d(void 0, void 0, c, e), g = f.promise();
                                    return f._generator = b, f._promiseFulfilled(void 0), g;
                                };
                            }, b.coroutine.addYieldHandler = function(a) {
                                if ("function" != typeof a) throw new k("expecting a function but got " + l.classString(a));
                                o.push(a);
                            }, b.spawn = function(a) {
                                if (g.deprecated("Promise.spawn()", "Promise.coroutine()"), "function" != typeof a) return c("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
                                var d = new i(a, this), e = d.promise();
                                return d._run(b.spawn), e;
                            };
                        };
                    }, {
                        "./errors": 12,
                        "./util": 36
                    } ],
                    17: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e, f, g) {
                            var h = a("./util");
                            h.canEvaluate, h.tryCatch, h.errorObj;
                            b.join = function() {
                                var a, b = arguments.length - 1;
                                if (b > 0 && "function" == typeof arguments[b]) {
                                    a = arguments[b];
                                    var d;
                                }
                                var e = [].slice.call(arguments);
                                a && e.pop();
                                var d = new c(e).promise();
                                return void 0 !== a ? d.spread(a) : d;
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    18: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e, f, g) {
                            function h(a, b, c, d) {
                                this.constructor$(a), this._promise._captureStackTrace();
                                var e = j();
                                this._callback = null === e ? b : k.domainBind(e, b), this._preservedValues = d === f ? new Array(this.length()) : null, 
                                this._limit = c, this._inFlight = 0, this._queue = [], n.invoke(this._asyncInit, this, void 0);
                            }
                            function i(a, c, e, f) {
                                if ("function" != typeof c) return d("expecting a function but got " + k.classString(c));
                                var g = 0;
                                if (void 0 !== e) {
                                    if ("object" != typeof e || null === e) return b.reject(new TypeError("options argument must be an object but it is " + k.classString(e)));
                                    if ("number" != typeof e.concurrency) return b.reject(new TypeError("'concurrency' must be a number but it is " + k.classString(e.concurrency)));
                                    g = e.concurrency;
                                }
                                return g = "number" == typeof g && isFinite(g) && g >= 1 ? g : 0, new h(a, c, g, f).promise();
                            }
                            var j = b._getDomain, k = a("./util"), l = k.tryCatch, m = k.errorObj, n = b._async;
                            k.inherits(h, c), h.prototype._asyncInit = function() {
                                this._init$(void 0, -2);
                            }, h.prototype._init = function() {}, h.prototype._promiseFulfilled = function(a, c) {
                                var d = this._values, f = this.length(), h = this._preservedValues, i = this._limit;
                                if (c < 0) {
                                    if (c = -1 * c - 1, d[c] = a, i >= 1 && (this._inFlight--, this._drainQueue(), this._isResolved())) return !0;
                                } else {
                                    if (i >= 1 && this._inFlight >= i) return d[c] = a, this._queue.push(c), !1;
                                    null !== h && (h[c] = a);
                                    var j = this._promise, k = this._callback, n = j._boundValue();
                                    j._pushContext();
                                    var o = l(k).call(n, a, c, f), p = j._popContext();
                                    if (g.checkForgottenReturns(o, p, null !== h ? "Promise.filter" : "Promise.map", j), 
                                    o === m) return this._reject(o.e), !0;
                                    var q = e(o, this._promise);
                                    if (q instanceof b) {
                                        q = q._target();
                                        var r = q._bitField;
                                        if (0 == (50397184 & r)) return i >= 1 && this._inFlight++, d[c] = q, q._proxy(this, -1 * (c + 1)), 
                                        !1;
                                        if (0 == (33554432 & r)) return 0 != (16777216 & r) ? (this._reject(q._reason()), 
                                        !0) : (this._cancel(), !0);
                                        o = q._value();
                                    }
                                    d[c] = o;
                                }
                                return ++this._totalResolved >= f && (null !== h ? this._filter(d, h) : this._resolve(d), 
                                !0);
                            }, h.prototype._drainQueue = function() {
                                for (var a = this._queue, b = this._limit, c = this._values; a.length > 0 && this._inFlight < b; ) {
                                    if (this._isResolved()) return;
                                    var d = a.pop();
                                    this._promiseFulfilled(c[d], d);
                                }
                            }, h.prototype._filter = function(a, b) {
                                for (var c = b.length, d = new Array(c), e = 0, f = 0; f < c; ++f) a[f] && (d[e++] = b[f]);
                                d.length = e, this._resolve(d);
                            }, h.prototype.preservedValues = function() {
                                return this._preservedValues;
                            }, b.prototype.map = function(a, b) {
                                return i(this, a, b, null);
                            }, b.map = function(a, b, c, d) {
                                return i(a, b, c, d);
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    19: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e, f) {
                            var g = a("./util"), h = g.tryCatch;
                            b.method = function(a) {
                                if ("function" != typeof a) throw new b.TypeError("expecting a function but got " + g.classString(a));
                                return function() {
                                    var d = new b(c);
                                    d._captureStackTrace(), d._pushContext();
                                    var e = h(a).apply(this, arguments), g = d._popContext();
                                    return f.checkForgottenReturns(e, g, "Promise.method", d), d._resolveFromSyncValue(e), 
                                    d;
                                };
                            }, b.attempt = b.try = function(a) {
                                if ("function" != typeof a) return e("expecting a function but got " + g.classString(a));
                                var d = new b(c);
                                d._captureStackTrace(), d._pushContext();
                                var i;
                                if (arguments.length > 1) {
                                    f.deprecated("calling Promise.try with more than 1 argument");
                                    var j = arguments[1], k = arguments[2];
                                    i = g.isArray(j) ? h(a).apply(k, j) : h(a).call(k, j);
                                } else i = h(a)();
                                var l = d._popContext();
                                return f.checkForgottenReturns(i, l, "Promise.try", d), d._resolveFromSyncValue(i), 
                                d;
                            }, b.prototype._resolveFromSyncValue = function(a) {
                                a === g.errorObj ? this._rejectCallback(a.e, !1) : this._resolveCallback(a, !0);
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    20: [ function(a, b, c) {
                        "use strict";
                        function d(a) {
                            return a instanceof Error && k.getPrototypeOf(a) === Error.prototype;
                        }
                        function e(a) {
                            var b;
                            if (d(a)) {
                                b = new j(a), b.name = a.name, b.message = a.message, b.stack = a.stack;
                                for (var c = k.keys(a), e = 0; e < c.length; ++e) {
                                    var f = c[e];
                                    l.test(f) || (b[f] = a[f]);
                                }
                                return b;
                            }
                            return g.markAsOriginatingFromRejection(a), a;
                        }
                        function f(a, b) {
                            return function(c, d) {
                                if (null !== a) {
                                    if (c) {
                                        var f = e(h(c));
                                        a._attachExtraTrace(f), a._reject(f);
                                    } else if (b) {
                                        var g = [].slice.call(arguments, 1);
                                        a._fulfill(g);
                                    } else a._fulfill(d);
                                    a = null;
                                }
                            };
                        }
                        var g = a("./util"), h = g.maybeWrapAsError, i = a("./errors"), j = i.OperationalError, k = a("./es5"), l = /^(?:name|message|stack|cause)$/;
                        b.exports = f;
                    }, {
                        "./errors": 12,
                        "./es5": 13,
                        "./util": 36
                    } ],
                    21: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b) {
                            function c(a, b) {
                                var c = this;
                                if (!f.isArray(a)) return d.call(c, a, b);
                                var e = h(b).apply(c._boundValue(), [ null ].concat(a));
                                e === i && g.throwLater(e.e);
                            }
                            function d(a, b) {
                                var c = this, d = c._boundValue(), e = void 0 === a ? h(b).call(d, null) : h(b).call(d, null, a);
                                e === i && g.throwLater(e.e);
                            }
                            function e(a, b) {
                                var c = this;
                                if (!a) {
                                    var d = new Error(a + "");
                                    d.cause = a, a = d;
                                }
                                var e = h(b).call(c._boundValue(), a);
                                e === i && g.throwLater(e.e);
                            }
                            var f = a("./util"), g = b._async, h = f.tryCatch, i = f.errorObj;
                            b.prototype.asCallback = b.prototype.nodeify = function(a, b) {
                                if ("function" == typeof a) {
                                    var f = d;
                                    void 0 !== b && Object(b).spread && (f = c), this._then(f, e, void 0, this, a);
                                }
                                return this;
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    22: [ function(b, c, d) {
                        "use strict";
                        c.exports = function() {
                            function d() {}
                            function e(a, b) {
                                if (null == a || a.constructor !== f) throw new t("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/MqrFmX\n");
                                if ("function" != typeof b) throw new t("expecting a function but got " + o.classString(b));
                            }
                            function f(a) {
                                a !== v && e(this, a), this._bitField = 0, this._fulfillmentHandler0 = void 0, this._rejectionHandler0 = void 0, 
                                this._promise0 = void 0, this._receiver0 = void 0, this._resolveFromExecutor(a), 
                                this._promiseCreated(), this._fireEvent("promiseCreated", this);
                            }
                            function g(a) {
                                this.promise._resolveCallback(a);
                            }
                            function h(a) {
                                this.promise._rejectCallback(a, !1);
                            }
                            function i(a) {
                                var b = new f(v);
                                b._fulfillmentHandler0 = a, b._rejectionHandler0 = a, b._promise0 = a, b._receiver0 = a;
                            }
                            var j, k = function() {
                                return new t("circular promise resolution chain\n\n    See http://goo.gl/MqrFmX\n");
                            }, l = function() {
                                return new f.PromiseInspection(this._target());
                            }, m = function(a) {
                                return f.reject(new t(a));
                            }, n = {}, o = b("./util");
                            j = o.isNode ? function() {
                                var b = a.domain;
                                return void 0 === b && (b = null), b;
                            } : function() {
                                return null;
                            }, o.notEnumerableProp(f, "_getDomain", j);
                            var p = b("./es5"), q = b("./async"), r = new q();
                            p.defineProperty(f, "_async", {
                                value: r
                            });
                            var s = b("./errors"), t = f.TypeError = s.TypeError;
                            f.RangeError = s.RangeError;
                            var u = f.CancellationError = s.CancellationError;
                            f.TimeoutError = s.TimeoutError, f.OperationalError = s.OperationalError, f.RejectionError = s.OperationalError, 
                            f.AggregateError = s.AggregateError;
                            var v = function() {}, w = {}, x = {}, y = b("./thenables")(f, v), z = b("./promise_array")(f, v, y, m, d), A = b("./context")(f), B = A.create, C = b("./debuggability")(f, A), D = (C.CapturedTrace, 
                            b("./finally")(f, y, x)), E = b("./catch_filter")(x), F = b("./nodeback"), G = o.errorObj, H = o.tryCatch;
                            return f.prototype.toString = function() {
                                return "[object Promise]";
                            }, f.prototype.caught = f.prototype.catch = function(a) {
                                var b = arguments.length;
                                if (b > 1) {
                                    var c, d = new Array(b - 1), e = 0;
                                    for (c = 0; c < b - 1; ++c) {
                                        var f = arguments[c];
                                        if (!o.isObject(f)) return m("Catch statement predicate: expecting an object but got " + o.classString(f));
                                        d[e++] = f;
                                    }
                                    return d.length = e, a = arguments[c], this.then(void 0, E(d, a, this));
                                }
                                return this.then(void 0, a);
                            }, f.prototype.reflect = function() {
                                return this._then(l, l, void 0, this, void 0);
                            }, f.prototype.then = function(a, b) {
                                if (C.warnings() && arguments.length > 0 && "function" != typeof a && "function" != typeof b) {
                                    var c = ".then() only accepts functions but was passed: " + o.classString(a);
                                    arguments.length > 1 && (c += ", " + o.classString(b)), this._warn(c);
                                }
                                return this._then(a, b, void 0, void 0, void 0);
                            }, f.prototype.done = function(a, b) {
                                this._then(a, b, void 0, void 0, void 0)._setIsFinal();
                            }, f.prototype.spread = function(a) {
                                return "function" != typeof a ? m("expecting a function but got " + o.classString(a)) : this.all()._then(a, void 0, void 0, w, void 0);
                            }, f.prototype.toJSON = function() {
                                var a = {
                                    isFulfilled: !1,
                                    isRejected: !1,
                                    fulfillmentValue: void 0,
                                    rejectionReason: void 0
                                };
                                return this.isFulfilled() ? (a.fulfillmentValue = this.value(), a.isFulfilled = !0) : this.isRejected() && (a.rejectionReason = this.reason(), 
                                a.isRejected = !0), a;
                            }, f.prototype.all = function() {
                                return arguments.length > 0 && this._warn(".all() was passed arguments but it does not take any"), 
                                new z(this).promise();
                            }, f.prototype.error = function(a) {
                                return this.caught(o.originatesFromRejection, a);
                            }, f.getNewLibraryCopy = c.exports, f.is = function(a) {
                                return a instanceof f;
                            }, f.fromNode = f.fromCallback = function(a) {
                                var b = new f(v);
                                b._captureStackTrace();
                                var c = arguments.length > 1 && !!Object(arguments[1]).multiArgs, d = H(a)(F(b, c));
                                return d === G && b._rejectCallback(d.e, !0), b._isFateSealed() || b._setAsyncGuaranteed(), 
                                b;
                            }, f.all = function(a) {
                                return new z(a).promise();
                            }, f.cast = function(a) {
                                var b = y(a);
                                return b instanceof f || (b = new f(v), b._captureStackTrace(), b._setFulfilled(), 
                                b._rejectionHandler0 = a), b;
                            }, f.resolve = f.fulfilled = f.cast, f.reject = f.rejected = function(a) {
                                var b = new f(v);
                                return b._captureStackTrace(), b._rejectCallback(a, !0), b;
                            }, f.setScheduler = function(a) {
                                if ("function" != typeof a) throw new t("expecting a function but got " + o.classString(a));
                                return r.setScheduler(a);
                            }, f.prototype._then = function(a, b, c, d, e) {
                                var g = void 0 !== e, h = g ? e : new f(v), i = this._target(), k = i._bitField;
                                g || (h._propagateFrom(this, 3), h._captureStackTrace(), void 0 === d && 0 != (2097152 & this._bitField) && (d = 0 != (50397184 & k) ? this._boundValue() : i === this ? void 0 : this._boundTo), 
                                this._fireEvent("promiseChained", this, h));
                                var l = j();
                                if (0 != (50397184 & k)) {
                                    var m, n, p = i._settlePromiseCtx;
                                    0 != (33554432 & k) ? (n = i._rejectionHandler0, m = a) : 0 != (16777216 & k) ? (n = i._fulfillmentHandler0, 
                                    m = b, i._unsetRejectionIsUnhandled()) : (p = i._settlePromiseLateCancellationObserver, 
                                    n = new u("late cancellation observer"), i._attachExtraTrace(n), m = b), r.invoke(p, i, {
                                        handler: null === l ? m : "function" == typeof m && o.domainBind(l, m),
                                        promise: h,
                                        receiver: d,
                                        value: n
                                    });
                                } else i._addCallbacks(a, b, h, d, l);
                                return h;
                            }, f.prototype._length = function() {
                                return 65535 & this._bitField;
                            }, f.prototype._isFateSealed = function() {
                                return 0 != (117506048 & this._bitField);
                            }, f.prototype._isFollowing = function() {
                                return 67108864 == (67108864 & this._bitField);
                            }, f.prototype._setLength = function(a) {
                                this._bitField = -65536 & this._bitField | 65535 & a;
                            }, f.prototype._setFulfilled = function() {
                                this._bitField = 33554432 | this._bitField, this._fireEvent("promiseFulfilled", this);
                            }, f.prototype._setRejected = function() {
                                this._bitField = 16777216 | this._bitField, this._fireEvent("promiseRejected", this);
                            }, f.prototype._setFollowing = function() {
                                this._bitField = 67108864 | this._bitField, this._fireEvent("promiseResolved", this);
                            }, f.prototype._setIsFinal = function() {
                                this._bitField = 4194304 | this._bitField;
                            }, f.prototype._isFinal = function() {
                                return (4194304 & this._bitField) > 0;
                            }, f.prototype._unsetCancelled = function() {
                                this._bitField = -65537 & this._bitField;
                            }, f.prototype._setCancelled = function() {
                                this._bitField = 65536 | this._bitField, this._fireEvent("promiseCancelled", this);
                            }, f.prototype._setWillBeCancelled = function() {
                                this._bitField = 8388608 | this._bitField;
                            }, f.prototype._setAsyncGuaranteed = function() {
                                r.hasCustomScheduler() || (this._bitField = 134217728 | this._bitField);
                            }, f.prototype._receiverAt = function(a) {
                                var b = 0 === a ? this._receiver0 : this[4 * a - 4 + 3];
                                if (b !== n) return void 0 === b && this._isBound() ? this._boundValue() : b;
                            }, f.prototype._promiseAt = function(a) {
                                return this[4 * a - 4 + 2];
                            }, f.prototype._fulfillmentHandlerAt = function(a) {
                                return this[4 * a - 4 + 0];
                            }, f.prototype._rejectionHandlerAt = function(a) {
                                return this[4 * a - 4 + 1];
                            }, f.prototype._boundValue = function() {}, f.prototype._migrateCallback0 = function(a) {
                                var b = (a._bitField, a._fulfillmentHandler0), c = a._rejectionHandler0, d = a._promise0, e = a._receiverAt(0);
                                void 0 === e && (e = n), this._addCallbacks(b, c, d, e, null);
                            }, f.prototype._migrateCallbackAt = function(a, b) {
                                var c = a._fulfillmentHandlerAt(b), d = a._rejectionHandlerAt(b), e = a._promiseAt(b), f = a._receiverAt(b);
                                void 0 === f && (f = n), this._addCallbacks(c, d, e, f, null);
                            }, f.prototype._addCallbacks = function(a, b, c, d, e) {
                                var f = this._length();
                                if (f >= 65531 && (f = 0, this._setLength(0)), 0 === f) this._promise0 = c, this._receiver0 = d, 
                                "function" == typeof a && (this._fulfillmentHandler0 = null === e ? a : o.domainBind(e, a)), 
                                "function" == typeof b && (this._rejectionHandler0 = null === e ? b : o.domainBind(e, b)); else {
                                    var g = 4 * f - 4;
                                    this[g + 2] = c, this[g + 3] = d, "function" == typeof a && (this[g + 0] = null === e ? a : o.domainBind(e, a)), 
                                    "function" == typeof b && (this[g + 1] = null === e ? b : o.domainBind(e, b));
                                }
                                return this._setLength(f + 1), f;
                            }, f.prototype._proxy = function(a, b) {
                                this._addCallbacks(void 0, void 0, b, a, null);
                            }, f.prototype._resolveCallback = function(a, b) {
                                if (0 == (117506048 & this._bitField)) {
                                    if (a === this) return this._rejectCallback(k(), !1);
                                    var c = y(a, this);
                                    if (!(c instanceof f)) return this._fulfill(a);
                                    b && this._propagateFrom(c, 2);
                                    var d = c._target();
                                    if (d === this) return void this._reject(k());
                                    var e = d._bitField;
                                    if (0 == (50397184 & e)) {
                                        var g = this._length();
                                        g > 0 && d._migrateCallback0(this);
                                        for (var h = 1; h < g; ++h) d._migrateCallbackAt(this, h);
                                        this._setFollowing(), this._setLength(0), this._setFollowee(d);
                                    } else if (0 != (33554432 & e)) this._fulfill(d._value()); else if (0 != (16777216 & e)) this._reject(d._reason()); else {
                                        var i = new u("late cancellation observer");
                                        d._attachExtraTrace(i), this._reject(i);
                                    }
                                }
                            }, f.prototype._rejectCallback = function(a, b, c) {
                                var d = o.ensureErrorObject(a), e = d === a;
                                if (!e && !c && C.warnings()) {
                                    var f = "a promise was rejected with a non-error: " + o.classString(a);
                                    this._warn(f, !0);
                                }
                                this._attachExtraTrace(d, !!b && e), this._reject(a);
                            }, f.prototype._resolveFromExecutor = function(a) {
                                if (a !== v) {
                                    var b = this;
                                    this._captureStackTrace(), this._pushContext();
                                    var c = !0, d = this._execute(a, function(a) {
                                        b._resolveCallback(a);
                                    }, function(a) {
                                        b._rejectCallback(a, c);
                                    });
                                    c = !1, this._popContext(), void 0 !== d && b._rejectCallback(d, !0);
                                }
                            }, f.prototype._settlePromiseFromHandler = function(a, b, c, d) {
                                var e = d._bitField;
                                if (0 == (65536 & e)) {
                                    d._pushContext();
                                    var f;
                                    b === w ? c && "number" == typeof c.length ? f = H(a).apply(this._boundValue(), c) : (f = G, 
                                    f.e = new t("cannot .spread() a non-array: " + o.classString(c))) : f = H(a).call(b, c);
                                    var g = d._popContext();
                                    e = d._bitField, 0 == (65536 & e) && (f === x ? d._reject(c) : f === G ? d._rejectCallback(f.e, !1) : (C.checkForgottenReturns(f, g, "", d, this), 
                                    d._resolveCallback(f)));
                                }
                            }, f.prototype._target = function() {
                                for (var a = this; a._isFollowing(); ) a = a._followee();
                                return a;
                            }, f.prototype._followee = function() {
                                return this._rejectionHandler0;
                            }, f.prototype._setFollowee = function(a) {
                                this._rejectionHandler0 = a;
                            }, f.prototype._settlePromise = function(a, b, c, e) {
                                var g = a instanceof f, h = this._bitField, i = 0 != (134217728 & h);
                                0 != (65536 & h) ? (g && a._invokeInternalOnCancel(), c instanceof D && c.isFinallyHandler() ? (c.cancelPromise = a, 
                                H(b).call(c, e) === G && a._reject(G.e)) : b === l ? a._fulfill(l.call(c)) : c instanceof d ? c._promiseCancelled(a) : g || a instanceof z ? a._cancel() : c.cancel()) : "function" == typeof b ? g ? (i && a._setAsyncGuaranteed(), 
                                this._settlePromiseFromHandler(b, c, e, a)) : b.call(c, e, a) : c instanceof d ? c._isResolved() || (0 != (33554432 & h) ? c._promiseFulfilled(e, a) : c._promiseRejected(e, a)) : g && (i && a._setAsyncGuaranteed(), 
                                0 != (33554432 & h) ? a._fulfill(e) : a._reject(e));
                            }, f.prototype._settlePromiseLateCancellationObserver = function(a) {
                                var b = a.handler, c = a.promise, d = a.receiver, e = a.value;
                                "function" == typeof b ? c instanceof f ? this._settlePromiseFromHandler(b, d, e, c) : b.call(d, e, c) : c instanceof f && c._reject(e);
                            }, f.prototype._settlePromiseCtx = function(a) {
                                this._settlePromise(a.promise, a.handler, a.receiver, a.value);
                            }, f.prototype._settlePromise0 = function(a, b, c) {
                                var d = this._promise0, e = this._receiverAt(0);
                                this._promise0 = void 0, this._receiver0 = void 0, this._settlePromise(d, a, e, b);
                            }, f.prototype._clearCallbackDataAtIndex = function(a) {
                                var b = 4 * a - 4;
                                this[b + 2] = this[b + 3] = this[b + 0] = this[b + 1] = void 0;
                            }, f.prototype._fulfill = function(a) {
                                var b = this._bitField;
                                if (!((117506048 & b) >>> 16)) {
                                    if (a === this) {
                                        var c = k();
                                        return this._attachExtraTrace(c), this._reject(c);
                                    }
                                    this._setFulfilled(), this._rejectionHandler0 = a, (65535 & b) > 0 && (0 != (134217728 & b) ? this._settlePromises() : r.settlePromises(this));
                                }
                            }, f.prototype._reject = function(a) {
                                var b = this._bitField;
                                if (!((117506048 & b) >>> 16)) {
                                    if (this._setRejected(), this._fulfillmentHandler0 = a, this._isFinal()) return r.fatalError(a, o.isNode);
                                    (65535 & b) > 0 ? r.settlePromises(this) : this._ensurePossibleRejectionHandled();
                                }
                            }, f.prototype._fulfillPromises = function(a, b) {
                                for (var c = 1; c < a; c++) {
                                    var d = this._fulfillmentHandlerAt(c), e = this._promiseAt(c), f = this._receiverAt(c);
                                    this._clearCallbackDataAtIndex(c), this._settlePromise(e, d, f, b);
                                }
                            }, f.prototype._rejectPromises = function(a, b) {
                                for (var c = 1; c < a; c++) {
                                    var d = this._rejectionHandlerAt(c), e = this._promiseAt(c), f = this._receiverAt(c);
                                    this._clearCallbackDataAtIndex(c), this._settlePromise(e, d, f, b);
                                }
                            }, f.prototype._settlePromises = function() {
                                var a = this._bitField, b = 65535 & a;
                                if (b > 0) {
                                    if (0 != (16842752 & a)) {
                                        var c = this._fulfillmentHandler0;
                                        this._settlePromise0(this._rejectionHandler0, c, a), this._rejectPromises(b, c);
                                    } else {
                                        var d = this._rejectionHandler0;
                                        this._settlePromise0(this._fulfillmentHandler0, d, a), this._fulfillPromises(b, d);
                                    }
                                    this._setLength(0);
                                }
                                this._clearCancellationData();
                            }, f.prototype._settledValue = function() {
                                var a = this._bitField;
                                return 0 != (33554432 & a) ? this._rejectionHandler0 : 0 != (16777216 & a) ? this._fulfillmentHandler0 : void 0;
                            }, f.defer = f.pending = function() {
                                return C.deprecated("Promise.defer", "new Promise"), {
                                    promise: new f(v),
                                    resolve: g,
                                    reject: h
                                };
                            }, o.notEnumerableProp(f, "_makeSelfResolutionError", k), b("./method")(f, v, y, m, C), 
                            b("./bind")(f, v, y, C), b("./cancel")(f, z, m, C), b("./direct_resolve")(f), b("./synchronous_inspection")(f), 
                            b("./join")(f, z, y, v, r, j), f.Promise = f, f.version = "3.5.1", b("./map.js")(f, z, m, y, v, C), 
                            b("./call_get.js")(f), b("./using.js")(f, m, y, B, v, C), b("./timers.js")(f, v, C), 
                            b("./generators.js")(f, m, v, y, d, C), b("./nodeify.js")(f), b("./promisify.js")(f, v), 
                            b("./props.js")(f, z, y, m), b("./race.js")(f, v, y, m), b("./reduce.js")(f, z, m, y, v, C), 
                            b("./settle.js")(f, z, C), b("./some.js")(f, z, m), b("./filter.js")(f, v), b("./each.js")(f, v), 
                            b("./any.js")(f), o.toFastProperties(f), o.toFastProperties(f.prototype), i({
                                a: 1
                            }), i({
                                b: 2
                            }), i({
                                c: 3
                            }), i(1), i(function() {}), i(void 0), i(!1), i(new f(v)), C.setBounds(q.firstLineError, o.lastLineError), 
                            f;
                        };
                    }, {
                        "./any.js": 1,
                        "./async": 2,
                        "./bind": 3,
                        "./call_get.js": 5,
                        "./cancel": 6,
                        "./catch_filter": 7,
                        "./context": 8,
                        "./debuggability": 9,
                        "./direct_resolve": 10,
                        "./each.js": 11,
                        "./errors": 12,
                        "./es5": 13,
                        "./filter.js": 14,
                        "./finally": 15,
                        "./generators.js": 16,
                        "./join": 17,
                        "./map.js": 18,
                        "./method": 19,
                        "./nodeback": 20,
                        "./nodeify.js": 21,
                        "./promise_array": 23,
                        "./promisify.js": 24,
                        "./props.js": 25,
                        "./race.js": 27,
                        "./reduce.js": 28,
                        "./settle.js": 30,
                        "./some.js": 31,
                        "./synchronous_inspection": 32,
                        "./thenables": 33,
                        "./timers.js": 34,
                        "./using.js": 35,
                        "./util": 36
                    } ],
                    23: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e, f) {
                            function g(a) {
                                switch (a) {
                                  case -2:
                                    return [];

                                  case -3:
                                    return {};

                                  case -6:
                                    return new Map();
                                }
                            }
                            function h(a) {
                                var d = this._promise = new b(c);
                                a instanceof b && d._propagateFrom(a, 3), d._setOnCancel(this), this._values = a, 
                                this._length = 0, this._totalResolved = 0, this._init(void 0, -2);
                            }
                            var i = a("./util");
                            i.isArray;
                            return i.inherits(h, f), h.prototype.length = function() {
                                return this._length;
                            }, h.prototype.promise = function() {
                                return this._promise;
                            }, h.prototype._init = function a(c, f) {
                                var h = d(this._values, this._promise);
                                if (h instanceof b) {
                                    h = h._target();
                                    var j = h._bitField;
                                    if (this._values = h, 0 == (50397184 & j)) return this._promise._setAsyncGuaranteed(), 
                                    h._then(a, this._reject, void 0, this, f);
                                    if (0 == (33554432 & j)) return 0 != (16777216 & j) ? this._reject(h._reason()) : this._cancel();
                                    h = h._value();
                                }
                                if (null === (h = i.asArray(h))) {
                                    var k = e("expecting an array or an iterable object but got " + i.classString(h)).reason();
                                    return void this._promise._rejectCallback(k, !1);
                                }
                                if (0 === h.length) return void (-5 === f ? this._resolveEmptyArray() : this._resolve(g(f)));
                                this._iterate(h);
                            }, h.prototype._iterate = function(a) {
                                var c = this.getActualLength(a.length);
                                this._length = c, this._values = this.shouldCopyValues() ? new Array(c) : this._values;
                                for (var e = this._promise, f = !1, g = null, h = 0; h < c; ++h) {
                                    var i = d(a[h], e);
                                    i instanceof b ? (i = i._target(), g = i._bitField) : g = null, f ? null !== g && i.suppressUnhandledRejections() : null !== g ? 0 == (50397184 & g) ? (i._proxy(this, h), 
                                    this._values[h] = i) : f = 0 != (33554432 & g) ? this._promiseFulfilled(i._value(), h) : 0 != (16777216 & g) ? this._promiseRejected(i._reason(), h) : this._promiseCancelled(h) : f = this._promiseFulfilled(i, h);
                                }
                                f || e._setAsyncGuaranteed();
                            }, h.prototype._isResolved = function() {
                                return null === this._values;
                            }, h.prototype._resolve = function(a) {
                                this._values = null, this._promise._fulfill(a);
                            }, h.prototype._cancel = function() {
                                !this._isResolved() && this._promise._isCancellable() && (this._values = null, this._promise._cancel());
                            }, h.prototype._reject = function(a) {
                                this._values = null, this._promise._rejectCallback(a, !1);
                            }, h.prototype._promiseFulfilled = function(a, b) {
                                return this._values[b] = a, ++this._totalResolved >= this._length && (this._resolve(this._values), 
                                !0);
                            }, h.prototype._promiseCancelled = function() {
                                return this._cancel(), !0;
                            }, h.prototype._promiseRejected = function(a) {
                                return this._totalResolved++, this._reject(a), !0;
                            }, h.prototype._resultCancelled = function() {
                                if (!this._isResolved()) {
                                    var a = this._values;
                                    if (this._cancel(), a instanceof b) a.cancel(); else for (var c = 0; c < a.length; ++c) a[c] instanceof b && a[c].cancel();
                                }
                            }, h.prototype.shouldCopyValues = function() {
                                return !0;
                            }, h.prototype.getActualLength = function(a) {
                                return a;
                            }, h;
                        };
                    }, {
                        "./util": 36
                    } ],
                    24: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c) {
                            function d(a) {
                                return !v.test(a);
                            }
                            function e(a) {
                                try {
                                    return !0 === a.__isPromisified__;
                                } catch (a) {
                                    return !1;
                                }
                            }
                            function f(a, b, c) {
                                var d = n.getDataPropertyOrDefault(a, b + c, t);
                                return !!d && e(d);
                            }
                            function g(a, b, c) {
                                for (var d = 0; d < a.length; d += 2) {
                                    var e = a[d];
                                    if (c.test(e)) for (var f = e.replace(c, ""), g = 0; g < a.length; g += 2) if (a[g] === f) throw new s("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/MqrFmX\n".replace("%s", b));
                                }
                            }
                            function h(a, b, c, d) {
                                for (var h = n.inheritedDataKeys(a), i = [], j = 0; j < h.length; ++j) {
                                    var k = h[j], l = a[k], m = d === w || w(k, l, a);
                                    "function" != typeof l || e(l) || f(a, k, b) || !d(k, l, a, m) || i.push(k, l);
                                }
                                return g(i, b, c), i;
                            }
                            function i(a, d, e, f, g, h) {
                                function i() {
                                    var e = d;
                                    d === m && (e = this);
                                    var f = new b(c);
                                    f._captureStackTrace();
                                    var g = "string" == typeof k && this !== j ? this[k] : a, i = o(f, h);
                                    try {
                                        g.apply(e, p(arguments, i));
                                    } catch (a) {
                                        f._rejectCallback(q(a), !0, !0);
                                    }
                                    return f._isFateSealed() || f._setAsyncGuaranteed(), f;
                                }
                                var j = function() {
                                    return this;
                                }(), k = a;
                                return "string" == typeof k && (a = f), n.notEnumerableProp(i, "__isPromisified__", !0), 
                                i;
                            }
                            function j(a, b, c, d, e) {
                                for (var f = new RegExp(x(b) + "$"), g = h(a, b, f, c), i = 0, j = g.length; i < j; i += 2) {
                                    var k = g[i], l = g[i + 1], o = k + b;
                                    if (d === y) a[o] = y(k, m, k, l, b, e); else {
                                        var p = d(l, function() {
                                            return y(k, m, k, l, b, e);
                                        });
                                        n.notEnumerableProp(p, "__isPromisified__", !0), a[o] = p;
                                    }
                                }
                                return n.toFastProperties(a), a;
                            }
                            function k(a, b, c) {
                                return y(a, b, void 0, a, null, c);
                            }
                            var l, m = {}, n = a("./util"), o = a("./nodeback"), p = n.withAppended, q = n.maybeWrapAsError, r = n.canEvaluate, s = a("./errors").TypeError, t = {
                                __isPromisified__: !0
                            }, u = [ "arity", "length", "name", "arguments", "caller", "callee", "prototype", "__isPromisified__" ], v = new RegExp("^(?:" + u.join("|") + ")$"), w = function(a) {
                                return n.isIdentifier(a) && "_" !== a.charAt(0) && "constructor" !== a;
                            }, x = function(a) {
                                return a.replace(/([$])/, "\\$");
                            }, y = r ? l : i;
                            b.promisify = function(a, b) {
                                if ("function" != typeof a) throw new s("expecting a function but got " + n.classString(a));
                                if (e(a)) return a;
                                b = Object(b);
                                var c = void 0 === b.context ? m : b.context, f = !!b.multiArgs, g = k(a, c, f);
                                return n.copyDescriptors(a, g, d), g;
                            }, b.promisifyAll = function(a, b) {
                                if ("function" != typeof a && "object" != typeof a) throw new s("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/MqrFmX\n");
                                b = Object(b);
                                var c = !!b.multiArgs, d = b.suffix;
                                "string" != typeof d && (d = "Async");
                                var e = b.filter;
                                "function" != typeof e && (e = w);
                                var f = b.promisifier;
                                if ("function" != typeof f && (f = y), !n.isIdentifier(d)) throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/MqrFmX\n");
                                for (var g = n.inheritedDataKeys(a), h = 0; h < g.length; ++h) {
                                    var i = a[g[h]];
                                    "constructor" !== g[h] && n.isClass(i) && (j(i.prototype, d, e, f, c), j(i, d, e, f, c));
                                }
                                return j(a, d, e, f, c);
                            };
                        };
                    }, {
                        "./errors": 12,
                        "./nodeback": 20,
                        "./util": 36
                    } ],
                    25: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e) {
                            function f(a) {
                                var b, c = !1;
                                if (void 0 !== h && a instanceof h) b = l(a), c = !0; else {
                                    var d = k.keys(a), e = d.length;
                                    b = new Array(2 * e);
                                    for (var f = 0; f < e; ++f) {
                                        var g = d[f];
                                        b[f] = a[g], b[f + e] = g;
                                    }
                                }
                                this.constructor$(b), this._isMap = c, this._init$(void 0, c ? -6 : -3);
                            }
                            function g(a) {
                                var c, g = d(a);
                                return j(g) ? (c = g instanceof b ? g._then(b.props, void 0, void 0, void 0, void 0) : new f(g).promise(), 
                                g instanceof b && c._propagateFrom(g, 2), c) : e("cannot await properties of a non-object\n\n    See http://goo.gl/MqrFmX\n");
                            }
                            var h, i = a("./util"), j = i.isObject, k = a("./es5");
                            "function" == typeof Map && (h = Map);
                            var l = function() {
                                function a(a, d) {
                                    this[b] = a, this[b + c] = d, b++;
                                }
                                var b = 0, c = 0;
                                return function(d) {
                                    c = d.size, b = 0;
                                    var e = new Array(2 * d.size);
                                    return d.forEach(a, e), e;
                                };
                            }(), m = function(a) {
                                for (var b = new h(), c = a.length / 2 | 0, d = 0; d < c; ++d) {
                                    var e = a[c + d], f = a[d];
                                    b.set(e, f);
                                }
                                return b;
                            };
                            i.inherits(f, c), f.prototype._init = function() {}, f.prototype._promiseFulfilled = function(a, b) {
                                if (this._values[b] = a, ++this._totalResolved >= this._length) {
                                    var c;
                                    if (this._isMap) c = m(this._values); else {
                                        c = {};
                                        for (var d = this.length(), e = 0, f = this.length(); e < f; ++e) c[this._values[e + d]] = this._values[e];
                                    }
                                    return this._resolve(c), !0;
                                }
                                return !1;
                            }, f.prototype.shouldCopyValues = function() {
                                return !1;
                            }, f.prototype.getActualLength = function(a) {
                                return a >> 1;
                            }, b.prototype.props = function() {
                                return g(this);
                            }, b.props = function(a) {
                                return g(a);
                            };
                        };
                    }, {
                        "./es5": 13,
                        "./util": 36
                    } ],
                    26: [ function(a, b, c) {
                        "use strict";
                        function d(a, b, c, d, e) {
                            for (var f = 0; f < e; ++f) c[f + d] = a[f + b], a[f + b] = void 0;
                        }
                        function e(a) {
                            this._capacity = a, this._length = 0, this._front = 0;
                        }
                        e.prototype._willBeOverCapacity = function(a) {
                            return this._capacity < a;
                        }, e.prototype._pushOne = function(a) {
                            var b = this.length();
                            this._checkCapacity(b + 1), this[this._front + b & this._capacity - 1] = a, this._length = b + 1;
                        }, e.prototype.push = function(a, b, c) {
                            var d = this.length() + 3;
                            if (this._willBeOverCapacity(d)) return this._pushOne(a), this._pushOne(b), void this._pushOne(c);
                            var e = this._front + d - 3;
                            this._checkCapacity(d);
                            var f = this._capacity - 1;
                            this[e + 0 & f] = a, this[e + 1 & f] = b, this[e + 2 & f] = c, this._length = d;
                        }, e.prototype.shift = function() {
                            var a = this._front, b = this[a];
                            return this[a] = void 0, this._front = a + 1 & this._capacity - 1, this._length--, 
                            b;
                        }, e.prototype.length = function() {
                            return this._length;
                        }, e.prototype._checkCapacity = function(a) {
                            this._capacity < a && this._resizeTo(this._capacity << 1);
                        }, e.prototype._resizeTo = function(a) {
                            var b = this._capacity;
                            this._capacity = a, d(this, 0, this, b, this._front + this._length & b - 1);
                        }, b.exports = e;
                    }, {} ],
                    27: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e) {
                            function f(a, f) {
                                var i = d(a);
                                if (i instanceof b) return h(i);
                                if (null === (a = g.asArray(a))) return e("expecting an array or an iterable object but got " + g.classString(a));
                                var j = new b(c);
                                void 0 !== f && j._propagateFrom(f, 3);
                                for (var k = j._fulfill, l = j._reject, m = 0, n = a.length; m < n; ++m) {
                                    var o = a[m];
                                    (void 0 !== o || m in a) && b.cast(o)._then(k, l, void 0, j, null);
                                }
                                return j;
                            }
                            var g = a("./util"), h = function(a) {
                                return a.then(function(b) {
                                    return f(b, a);
                                });
                            };
                            b.race = function(a) {
                                return f(a, void 0);
                            }, b.prototype.race = function() {
                                return f(this, void 0);
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    28: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e, f, g) {
                            function h(a, c, d, e) {
                                this.constructor$(a);
                                var g = m();
                                this._fn = null === g ? c : n.domainBind(g, c), void 0 !== d && (d = b.resolve(d), 
                                d._attachCancellationCallback(this)), this._initialValue = d, this._currentCancellable = null, 
                                this._eachValues = e === f ? Array(this._length) : 0 === e ? null : void 0, this._promise._captureStackTrace(), 
                                this._init$(void 0, -5);
                            }
                            function i(a, b) {
                                this.isFulfilled() ? b._resolve(a) : b._reject(a);
                            }
                            function j(a, b, c, e) {
                                return "function" != typeof b ? d("expecting a function but got " + n.classString(b)) : new h(a, b, c, e).promise();
                            }
                            function k(a) {
                                this.accum = a, this.array._gotAccum(a);
                                var c = e(this.value, this.array._promise);
                                return c instanceof b ? (this.array._currentCancellable = c, c._then(l, void 0, void 0, this, void 0)) : l.call(this, c);
                            }
                            function l(a) {
                                var c = this.array, d = c._promise, e = o(c._fn);
                                d._pushContext();
                                var f;
                                (f = void 0 !== c._eachValues ? e.call(d._boundValue(), a, this.index, this.length) : e.call(d._boundValue(), this.accum, a, this.index, this.length)) instanceof b && (c._currentCancellable = f);
                                var h = d._popContext();
                                return g.checkForgottenReturns(f, h, void 0 !== c._eachValues ? "Promise.each" : "Promise.reduce", d), 
                                f;
                            }
                            var m = b._getDomain, n = a("./util"), o = n.tryCatch;
                            n.inherits(h, c), h.prototype._gotAccum = function(a) {
                                void 0 !== this._eachValues && null !== this._eachValues && a !== f && this._eachValues.push(a);
                            }, h.prototype._eachComplete = function(a) {
                                return null !== this._eachValues && this._eachValues.push(a), this._eachValues;
                            }, h.prototype._init = function() {}, h.prototype._resolveEmptyArray = function() {
                                this._resolve(void 0 !== this._eachValues ? this._eachValues : this._initialValue);
                            }, h.prototype.shouldCopyValues = function() {
                                return !1;
                            }, h.prototype._resolve = function(a) {
                                this._promise._resolveCallback(a), this._values = null;
                            }, h.prototype._resultCancelled = function(a) {
                                if (a === this._initialValue) return this._cancel();
                                this._isResolved() || (this._resultCancelled$(), this._currentCancellable instanceof b && this._currentCancellable.cancel(), 
                                this._initialValue instanceof b && this._initialValue.cancel());
                            }, h.prototype._iterate = function(a) {
                                this._values = a;
                                var c, d, e = a.length;
                                if (void 0 !== this._initialValue ? (c = this._initialValue, d = 0) : (c = b.resolve(a[0]), 
                                d = 1), this._currentCancellable = c, !c.isRejected()) for (;d < e; ++d) {
                                    var f = {
                                        accum: null,
                                        value: a[d],
                                        index: d,
                                        length: e,
                                        array: this
                                    };
                                    c = c._then(k, void 0, void 0, f, void 0);
                                }
                                void 0 !== this._eachValues && (c = c._then(this._eachComplete, void 0, void 0, this, void 0)), 
                                c._then(i, i, void 0, c, this);
                            }, b.prototype.reduce = function(a, b) {
                                return j(this, a, b, null);
                            }, b.reduce = function(a, b, c, d) {
                                return j(a, b, c, d);
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    29: [ function(b, c, f) {
                        "use strict";
                        var g, h = b("./util"), i = function() {
                            throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
                        }, j = h.getNativePromise();
                        if (h.isNode && "undefined" == typeof MutationObserver) {
                            var k = d.setImmediate, l = a.nextTick;
                            g = h.isRecentNode ? function(a) {
                                k.call(d, a);
                            } : function(b) {
                                l.call(a, b);
                            };
                        } else if ("function" == typeof j && "function" == typeof j.resolve) {
                            var m = j.resolve();
                            g = function(a) {
                                m.then(a);
                            };
                        } else g = "undefined" == typeof MutationObserver || "undefined" != typeof window && window.navigator && (window.navigator.standalone || window.cordova) ? void 0 !== e ? function(a) {
                            e(a);
                        } : "undefined" != typeof setTimeout ? function(a) {
                            setTimeout(a, 0);
                        } : i : function() {
                            var a = document.createElement("div"), b = {
                                attributes: !0
                            }, c = !1, d = document.createElement("div");
                            new MutationObserver(function() {
                                a.classList.toggle("foo"), c = !1;
                            }).observe(d, b);
                            var e = function() {
                                c || (c = !0, d.classList.toggle("foo"));
                            };
                            return function(c) {
                                var d = new MutationObserver(function() {
                                    d.disconnect(), c();
                                });
                                d.observe(a, b), e();
                            };
                        }();
                        c.exports = g;
                    }, {
                        "./util": 36
                    } ],
                    30: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d) {
                            function e(a) {
                                this.constructor$(a);
                            }
                            var f = b.PromiseInspection;
                            a("./util").inherits(e, c), e.prototype._promiseResolved = function(a, b) {
                                return this._values[a] = b, ++this._totalResolved >= this._length && (this._resolve(this._values), 
                                !0);
                            }, e.prototype._promiseFulfilled = function(a, b) {
                                var c = new f();
                                return c._bitField = 33554432, c._settledValueField = a, this._promiseResolved(b, c);
                            }, e.prototype._promiseRejected = function(a, b) {
                                var c = new f();
                                return c._bitField = 16777216, c._settledValueField = a, this._promiseResolved(b, c);
                            }, b.settle = function(a) {
                                return d.deprecated(".settle()", ".reflect()"), new e(a).promise();
                            }, b.prototype.settle = function() {
                                return b.settle(this);
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    31: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d) {
                            function e(a) {
                                this.constructor$(a), this._howMany = 0, this._unwrap = !1, this._initialized = !1;
                            }
                            function f(a, b) {
                                if ((0 | b) !== b || b < 0) return d("expecting a positive integer\n\n    See http://goo.gl/MqrFmX\n");
                                var c = new e(a), f = c.promise();
                                return c.setHowMany(b), c.init(), f;
                            }
                            var g = a("./util"), h = a("./errors").RangeError, i = a("./errors").AggregateError, j = g.isArray, k = {};
                            g.inherits(e, c), e.prototype._init = function() {
                                if (this._initialized) {
                                    if (0 === this._howMany) return void this._resolve([]);
                                    this._init$(void 0, -5);
                                    var a = j(this._values);
                                    !this._isResolved() && a && this._howMany > this._canPossiblyFulfill() && this._reject(this._getRangeError(this.length()));
                                }
                            }, e.prototype.init = function() {
                                this._initialized = !0, this._init();
                            }, e.prototype.setUnwrap = function() {
                                this._unwrap = !0;
                            }, e.prototype.howMany = function() {
                                return this._howMany;
                            }, e.prototype.setHowMany = function(a) {
                                this._howMany = a;
                            }, e.prototype._promiseFulfilled = function(a) {
                                return this._addFulfilled(a), this._fulfilled() === this.howMany() && (this._values.length = this.howMany(), 
                                1 === this.howMany() && this._unwrap ? this._resolve(this._values[0]) : this._resolve(this._values), 
                                !0);
                            }, e.prototype._promiseRejected = function(a) {
                                return this._addRejected(a), this._checkOutcome();
                            }, e.prototype._promiseCancelled = function() {
                                return this._values instanceof b || null == this._values ? this._cancel() : (this._addRejected(k), 
                                this._checkOutcome());
                            }, e.prototype._checkOutcome = function() {
                                if (this.howMany() > this._canPossiblyFulfill()) {
                                    for (var a = new i(), b = this.length(); b < this._values.length; ++b) this._values[b] !== k && a.push(this._values[b]);
                                    return a.length > 0 ? this._reject(a) : this._cancel(), !0;
                                }
                                return !1;
                            }, e.prototype._fulfilled = function() {
                                return this._totalResolved;
                            }, e.prototype._rejected = function() {
                                return this._values.length - this.length();
                            }, e.prototype._addRejected = function(a) {
                                this._values.push(a);
                            }, e.prototype._addFulfilled = function(a) {
                                this._values[this._totalResolved++] = a;
                            }, e.prototype._canPossiblyFulfill = function() {
                                return this.length() - this._rejected();
                            }, e.prototype._getRangeError = function(a) {
                                var b = "Input array must contain at least " + this._howMany + " items but contains only " + a + " items";
                                return new h(b);
                            }, e.prototype._resolveEmptyArray = function() {
                                this._reject(this._getRangeError(0));
                            }, b.some = function(a, b) {
                                return f(a, b);
                            }, b.prototype.some = function(a) {
                                return f(this, a);
                            }, b._SomePromiseArray = e;
                        };
                    }, {
                        "./errors": 12,
                        "./util": 36
                    } ],
                    32: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(a) {
                            function b(a) {
                                void 0 !== a ? (a = a._target(), this._bitField = a._bitField, this._settledValueField = a._isFateSealed() ? a._settledValue() : void 0) : (this._bitField = 0, 
                                this._settledValueField = void 0);
                            }
                            b.prototype._settledValue = function() {
                                return this._settledValueField;
                            };
                            var c = b.prototype.value = function() {
                                if (!this.isFulfilled()) throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/MqrFmX\n");
                                return this._settledValue();
                            }, d = b.prototype.error = b.prototype.reason = function() {
                                if (!this.isRejected()) throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/MqrFmX\n");
                                return this._settledValue();
                            }, e = b.prototype.isFulfilled = function() {
                                return 0 != (33554432 & this._bitField);
                            }, f = b.prototype.isRejected = function() {
                                return 0 != (16777216 & this._bitField);
                            }, g = b.prototype.isPending = function() {
                                return 0 == (50397184 & this._bitField);
                            }, h = b.prototype.isResolved = function() {
                                return 0 != (50331648 & this._bitField);
                            };
                            b.prototype.isCancelled = function() {
                                return 0 != (8454144 & this._bitField);
                            }, a.prototype.__isCancelled = function() {
                                return 65536 == (65536 & this._bitField);
                            }, a.prototype._isCancelled = function() {
                                return this._target().__isCancelled();
                            }, a.prototype.isCancelled = function() {
                                return 0 != (8454144 & this._target()._bitField);
                            }, a.prototype.isPending = function() {
                                return g.call(this._target());
                            }, a.prototype.isRejected = function() {
                                return f.call(this._target());
                            }, a.prototype.isFulfilled = function() {
                                return e.call(this._target());
                            }, a.prototype.isResolved = function() {
                                return h.call(this._target());
                            }, a.prototype.value = function() {
                                return c.call(this._target());
                            }, a.prototype.reason = function() {
                                var a = this._target();
                                return a._unsetRejectionIsUnhandled(), d.call(a);
                            }, a.prototype._value = function() {
                                return this._settledValue();
                            }, a.prototype._reason = function() {
                                return this._unsetRejectionIsUnhandled(), this._settledValue();
                            }, a.PromiseInspection = b;
                        };
                    }, {} ],
                    33: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c) {
                            function d(a, d) {
                                if (k(a)) {
                                    if (a instanceof b) return a;
                                    var e = f(a);
                                    if (e === j) {
                                        d && d._pushContext();
                                        var i = b.reject(e.e);
                                        return d && d._popContext(), i;
                                    }
                                    if ("function" == typeof e) {
                                        if (g(a)) {
                                            var i = new b(c);
                                            return a._then(i._fulfill, i._reject, void 0, i, null), i;
                                        }
                                        return h(a, e, d);
                                    }
                                }
                                return a;
                            }
                            function e(a) {
                                return a.then;
                            }
                            function f(a) {
                                try {
                                    return e(a);
                                } catch (a) {
                                    return j.e = a, j;
                                }
                            }
                            function g(a) {
                                try {
                                    return l.call(a, "_promise0");
                                } catch (a) {
                                    return !1;
                                }
                            }
                            function h(a, d, e) {
                                function f(a) {
                                    h && (h._resolveCallback(a), h = null);
                                }
                                function g(a) {
                                    h && (h._rejectCallback(a, l, !0), h = null);
                                }
                                var h = new b(c), k = h;
                                e && e._pushContext(), h._captureStackTrace(), e && e._popContext();
                                var l = !0, m = i.tryCatch(d).call(a, f, g);
                                return l = !1, h && m === j && (h._rejectCallback(m.e, !0, !0), h = null), k;
                            }
                            var i = a("./util"), j = i.errorObj, k = i.isObject, l = {}.hasOwnProperty;
                            return d;
                        };
                    }, {
                        "./util": 36
                    } ],
                    34: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d) {
                            function e(a) {
                                this.handle = a;
                            }
                            function f(a) {
                                return clearTimeout(this.handle), a;
                            }
                            function g(a) {
                                throw clearTimeout(this.handle), a;
                            }
                            var h = a("./util"), i = b.TimeoutError;
                            e.prototype._resultCancelled = function() {
                                clearTimeout(this.handle);
                            };
                            var j = function(a) {
                                return k(+this).thenReturn(a);
                            }, k = b.delay = function(a, f) {
                                var g, h;
                                return void 0 !== f ? (g = b.resolve(f)._then(j, null, null, a, void 0), d.cancellation() && f instanceof b && g._setOnCancel(f)) : (g = new b(c), 
                                h = setTimeout(function() {
                                    g._fulfill();
                                }, +a), d.cancellation() && g._setOnCancel(new e(h)), g._captureStackTrace()), g._setAsyncGuaranteed(), 
                                g;
                            };
                            b.prototype.delay = function(a) {
                                return k(a, this);
                            };
                            var l = function(a, b, c) {
                                var d;
                                d = "string" != typeof b ? b instanceof Error ? b : new i("operation timed out") : new i(b), 
                                h.markAsOriginatingFromRejection(d), a._attachExtraTrace(d), a._reject(d), null != c && c.cancel();
                            };
                            b.prototype.timeout = function(a, b) {
                                a = +a;
                                var c, h, i = new e(setTimeout(function() {
                                    c.isPending() && l(c, b, h);
                                }, a));
                                return d.cancellation() ? (h = this.then(), c = h._then(f, g, void 0, i, void 0), 
                                c._setOnCancel(i)) : c = this._then(f, g, void 0, i, void 0), c;
                            };
                        };
                    }, {
                        "./util": 36
                    } ],
                    35: [ function(a, b, c) {
                        "use strict";
                        b.exports = function(b, c, d, e, f, g) {
                            function h(a) {
                                setTimeout(function() {
                                    throw a;
                                }, 0);
                            }
                            function i(a) {
                                var b = d(a);
                                return b !== a && "function" == typeof a._isDisposable && "function" == typeof a._getDisposer && a._isDisposable() && b._setDisposable(a._getDisposer()), 
                                b;
                            }
                            function j(a, c) {
                                function e() {
                                    if (g >= j) return k._fulfill();
                                    var f = i(a[g++]);
                                    if (f instanceof b && f._isDisposable()) {
                                        try {
                                            f = d(f._getDisposer().tryDispose(c), a.promise);
                                        } catch (a) {
                                            return h(a);
                                        }
                                        if (f instanceof b) return f._then(e, h, null, null, null);
                                    }
                                    e();
                                }
                                var g = 0, j = a.length, k = new b(f);
                                return e(), k;
                            }
                            function k(a, b, c) {
                                this._data = a, this._promise = b, this._context = c;
                            }
                            function l(a, b, c) {
                                this.constructor$(a, b, c);
                            }
                            function m(a) {
                                return k.isDisposer(a) ? (this.resources[this.index]._setDisposable(a), a.promise()) : a;
                            }
                            function n(a) {
                                this.length = a, this.promise = null, this[a - 1] = null;
                            }
                            var o = a("./util"), p = a("./errors").TypeError, q = a("./util").inherits, r = o.errorObj, s = o.tryCatch, t = {};
                            k.prototype.data = function() {
                                return this._data;
                            }, k.prototype.promise = function() {
                                return this._promise;
                            }, k.prototype.resource = function() {
                                return this.promise().isFulfilled() ? this.promise().value() : t;
                            }, k.prototype.tryDispose = function(a) {
                                var b = this.resource(), c = this._context;
                                void 0 !== c && c._pushContext();
                                var d = b !== t ? this.doDispose(b, a) : null;
                                return void 0 !== c && c._popContext(), this._promise._unsetDisposable(), this._data = null, 
                                d;
                            }, k.isDisposer = function(a) {
                                return null != a && "function" == typeof a.resource && "function" == typeof a.tryDispose;
                            }, q(l, k), l.prototype.doDispose = function(a, b) {
                                return this.data().call(a, a, b);
                            }, n.prototype._resultCancelled = function() {
                                for (var a = this.length, c = 0; c < a; ++c) {
                                    var d = this[c];
                                    d instanceof b && d.cancel();
                                }
                            }, b.using = function() {
                                var a = arguments.length;
                                if (a < 2) return c("you must pass at least 2 arguments to Promise.using");
                                var e = arguments[a - 1];
                                if ("function" != typeof e) return c("expecting a function but got " + o.classString(e));
                                var f, h = !0;
                                2 === a && Array.isArray(arguments[0]) ? (f = arguments[0], a = f.length, h = !1) : (f = arguments, 
                                a--);
                                for (var i = new n(a), l = 0; l < a; ++l) {
                                    var p = f[l];
                                    if (k.isDisposer(p)) {
                                        var q = p;
                                        p = p.promise(), p._setDisposable(q);
                                    } else {
                                        var t = d(p);
                                        t instanceof b && (p = t._then(m, null, null, {
                                            resources: i,
                                            index: l
                                        }, void 0));
                                    }
                                    i[l] = p;
                                }
                                for (var u = new Array(i.length), l = 0; l < u.length; ++l) u[l] = b.resolve(i[l]).reflect();
                                var v = b.all(u).then(function(a) {
                                    for (var b = 0; b < a.length; ++b) {
                                        var c = a[b];
                                        if (c.isRejected()) return r.e = c.error(), r;
                                        if (!c.isFulfilled()) return void v.cancel();
                                        a[b] = c.value();
                                    }
                                    w._pushContext(), e = s(e);
                                    var d = h ? e.apply(void 0, a) : e(a), f = w._popContext();
                                    return g.checkForgottenReturns(d, f, "Promise.using", w), d;
                                }), w = v.lastly(function() {
                                    var a = new b.PromiseInspection(v);
                                    return j(i, a);
                                });
                                return i.promise = w, w._setOnCancel(i), w;
                            }, b.prototype._setDisposable = function(a) {
                                this._bitField = 131072 | this._bitField, this._disposer = a;
                            }, b.prototype._isDisposable = function() {
                                return (131072 & this._bitField) > 0;
                            }, b.prototype._getDisposer = function() {
                                return this._disposer;
                            }, b.prototype._unsetDisposable = function() {
                                this._bitField = -131073 & this._bitField, this._disposer = void 0;
                            }, b.prototype.disposer = function(a) {
                                if ("function" == typeof a) return new l(a, this, e());
                                throw new p();
                            };
                        };
                    }, {
                        "./errors": 12,
                        "./util": 36
                    } ],
                    36: [ function(b, c, e) {
                        "use strict";
                        function f() {
                            try {
                                var a = F;
                                return F = null, a.apply(this, arguments);
                            } catch (a) {
                                return E.e = a, E;
                            }
                        }
                        function g(a) {
                            return F = a, f;
                        }
                        function h(a) {
                            return null == a || !0 === a || !1 === a || "string" == typeof a || "number" == typeof a;
                        }
                        function i(a) {
                            return "function" == typeof a || "object" == typeof a && null !== a;
                        }
                        function j(a) {
                            return h(a) ? new Error(s(a)) : a;
                        }
                        function k(a, b) {
                            var c, d = a.length, e = new Array(d + 1);
                            for (c = 0; c < d; ++c) e[c] = a[c];
                            return e[c] = b, e;
                        }
                        function l(a, b, c) {
                            if (!C.isES5) return {}.hasOwnProperty.call(a, b) ? a[b] : void 0;
                            var d = Object.getOwnPropertyDescriptor(a, b);
                            return null != d ? null == d.get && null == d.set ? d.value : c : void 0;
                        }
                        function m(a, b, c) {
                            if (h(a)) return a;
                            var d = {
                                value: c,
                                configurable: !0,
                                enumerable: !1,
                                writable: !0
                            };
                            return C.defineProperty(a, b, d), a;
                        }
                        function n(a) {
                            throw a;
                        }
                        function o(a) {
                            try {
                                if ("function" == typeof a) {
                                    var b = C.names(a.prototype), c = C.isES5 && b.length > 1, d = b.length > 0 && !(1 === b.length && "constructor" === b[0]), e = J.test(a + "") && C.names(a).length > 0;
                                    if (c || d || e) return !0;
                                }
                                return !1;
                            } catch (a) {
                                return !1;
                            }
                        }
                        function p(a) {
                            function b() {}
                            b.prototype = a;
                            for (var c = 8; c--; ) new b();
                            return a;
                        }
                        function q(a) {
                            return K.test(a);
                        }
                        function r(a, b, c) {
                            for (var d = new Array(a), e = 0; e < a; ++e) d[e] = b + e + c;
                            return d;
                        }
                        function s(a) {
                            try {
                                return a + "";
                            } catch (a) {
                                return "[no string representation]";
                            }
                        }
                        function t(a) {
                            return a instanceof Error || null !== a && "object" == typeof a && "string" == typeof a.message && "string" == typeof a.name;
                        }
                        function u(a) {
                            try {
                                m(a, "isOperational", !0);
                            } catch (a) {}
                        }
                        function v(a) {
                            return null != a && (a instanceof Error.__BluebirdErrorTypes__.OperationalError || !0 === a.isOperational);
                        }
                        function w(a) {
                            return t(a) && C.propertyIsWritable(a, "stack");
                        }
                        function x(a) {
                            return {}.toString.call(a);
                        }
                        function y(a, b, c) {
                            for (var d = C.names(a), e = 0; e < d.length; ++e) {
                                var f = d[e];
                                if (c(f)) try {
                                    C.defineProperty(b, f, C.getDescriptor(a, f));
                                } catch (a) {}
                            }
                        }
                        function z(b) {
                            return P ? a.env[b] : void 0;
                        }
                        function A() {
                            if ("function" == typeof Promise) try {
                                var a = new Promise(function() {});
                                if ("[object Promise]" === {}.toString.call(a)) return Promise;
                            } catch (a) {}
                        }
                        function B(a, b) {
                            return a.bind(b);
                        }
                        var C = b("./es5"), D = "undefined" == typeof navigator, E = {
                            e: {}
                        }, F, G = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== d ? d : void 0 !== this ? this : null, H = function(a, b) {
                            function c() {
                                this.constructor = a, this.constructor$ = b;
                                for (var c in b.prototype) d.call(b.prototype, c) && "$" !== c.charAt(c.length - 1) && (this[c + "$"] = b.prototype[c]);
                            }
                            var d = {}.hasOwnProperty;
                            return c.prototype = b.prototype, a.prototype = new c(), a.prototype;
                        }, I = function() {
                            var a = [ Array.prototype, Object.prototype, Function.prototype ], b = function(b) {
                                for (var c = 0; c < a.length; ++c) if (a[c] === b) return !0;
                                return !1;
                            };
                            if (C.isES5) {
                                var c = Object.getOwnPropertyNames;
                                return function(a) {
                                    for (var d = [], e = Object.create(null); null != a && !b(a); ) {
                                        var f;
                                        try {
                                            f = c(a);
                                        } catch (a) {
                                            return d;
                                        }
                                        for (var g = 0; g < f.length; ++g) {
                                            var h = f[g];
                                            if (!e[h]) {
                                                e[h] = !0;
                                                var i = Object.getOwnPropertyDescriptor(a, h);
                                                null != i && null == i.get && null == i.set && d.push(h);
                                            }
                                        }
                                        a = C.getPrototypeOf(a);
                                    }
                                    return d;
                                };
                            }
                            var d = {}.hasOwnProperty;
                            return function(c) {
                                if (b(c)) return [];
                                var e = [];
                                a: for (var f in c) if (d.call(c, f)) e.push(f); else {
                                    for (var g = 0; g < a.length; ++g) if (d.call(a[g], f)) continue a;
                                    e.push(f);
                                }
                                return e;
                            };
                        }(), J = /this\s*\.\s*\S+\s*=/, K = /^[a-z$_][a-z$_0-9]*$/i, L = function() {
                            return "stack" in new Error() ? function(a) {
                                return w(a) ? a : new Error(s(a));
                            } : function(a) {
                                if (w(a)) return a;
                                try {
                                    throw new Error(s(a));
                                } catch (a) {
                                    return a;
                                }
                            };
                        }(), M = function(a) {
                            return C.isArray(a) ? a : null;
                        };
                        if ("undefined" != typeof Symbol && Symbol.iterator) {
                            var N = "function" == typeof Array.from ? function(a) {
                                return Array.from(a);
                            } : function(a) {
                                for (var b, c = [], d = a[Symbol.iterator](); !(b = d.next()).done; ) c.push(b.value);
                                return c;
                            };
                            M = function(a) {
                                return C.isArray(a) ? a : null != a && "function" == typeof a[Symbol.iterator] ? N(a) : null;
                            };
                        }
                        var O = void 0 !== a && "[object process]" === x(a).toLowerCase(), P = void 0 !== a && void 0 !== a.env, Q = {
                            isClass: o,
                            isIdentifier: q,
                            inheritedDataKeys: I,
                            getDataPropertyOrDefault: l,
                            thrower: n,
                            isArray: C.isArray,
                            asArray: M,
                            notEnumerableProp: m,
                            isPrimitive: h,
                            isObject: i,
                            isError: t,
                            canEvaluate: D,
                            errorObj: E,
                            tryCatch: g,
                            inherits: H,
                            withAppended: k,
                            maybeWrapAsError: j,
                            toFastProperties: p,
                            filledRange: r,
                            toString: s,
                            canAttachTrace: w,
                            ensureErrorObject: L,
                            originatesFromRejection: v,
                            markAsOriginatingFromRejection: u,
                            classString: x,
                            copyDescriptors: y,
                            hasDevTools: "undefined" != typeof chrome && chrome && "function" == typeof chrome.loadTimes,
                            isNode: O,
                            hasEnvVariables: P,
                            env: z,
                            global: G,
                            getNativePromise: A,
                            domainBind: B
                        };
                        Q.isRecentNode = Q.isNode && function() {
                            var b = a.versions.node.split(".").map(Number);
                            return 0 === b[0] && b[1] > 10 || b[0] > 0;
                        }(), Q.isNode && Q.toFastProperties(a);
                        try {
                            throw new Error();
                        } catch (a) {
                            Q.lastLineError = a;
                        }
                        c.exports = Q;
                    }, {
                        "./es5": 13
                    } ]
                }, {}, [ 4 ])(4);
            }), "undefined" != typeof window && null !== window ? window.P = window.Promise : "undefined" != typeof self && null !== self && (self.P = self.Promise);
        }).call(this, a("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, a("timers").setImmediate);
    }, {
        _process: 15,
        timers: 16
    } ],
    2: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.PreCallTest = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./turnConnection"), g = a("./tests/rttTest"), h = a("./tests/throughputTest"), i = a("./utility/resultsHandler"), j = a("./utility/onlineCheck"), k = a("./utility/stats/detectbrowser"), l = a("bluebird"), m = {
            RTT: "rtt",
            THROUGHPUT: "throughput"
        }, n = function() {
            function a() {
                d(this, a), this.browserInfo = (0, k.detect)(), this.onlineCheck = new j.OnlineCheck(), 
                this.callsInProgress = 0, this.turnTests = [ m.RTT, m.THROUGHPUT ], this.active = !1, 
                this.rtt = null, this.resultsHandler = null;
            }
            return e(a, [ {
                key: "start",
                value: function(a, b, c) {
                    if (this.browserInfo.browserName !== k.Constants.browserName.msie) if (this.iceServers = a, 
                    this.callback = c, this.active) this.callback && this.callback(null, "Not started: already in progress"); else if (0 < this.callsInProgress) this.callback && this.callback(null, "Not started: call in progress"); else if (a) {
                        this.turnTestCounter = 0, this.resultsHandler = new i.ResultsHandler(), this.resultsHandler.setProvider(b);
                        var d = {
                            type: "browser",
                            os: this.browserInfo.os,
                            osVersion: this.browserInfo.osVersion,
                            buildName: this.browserInfo.browserName,
                            buildVersion: this.browserInfo.browserVersion
                        };
                        this.resultsHandler.add("endpointInfo", d), this.onlineCheck.start(), this.active = !0, 
                        this._start();
                    } else this.callback && this.callback(null, "Not started: no ICE servers given"); else this.callback && this.callback(null, "Not started: disabled for IE");
                }
            }, {
                key: "_start",
                value: function() {
                    var a = this;
                    this.active && (this.turnConnection = new f.TurnConnection(this.browserInfo), this.turnConnection.connect(this.iceServers).then(function() {
                        a.active ? a.startTurnTests().then(function() {
                            a.stop();
                        }, function(b) {
                            a.stop();
                        }) : a.stop();
                    }, function(b) {
                        var c = b.continueFlag;
                        if (a.resultsHandler.failure(b), !c) {
                            a.turnConnection.disconnect(), a.active = !1;
                            var d = "";
                            try {
                                d = b.stack;
                            } catch (c) {
                                d = b.toString();
                            }
                            return d && "" !== d || (d = b.toString()), void a.callback(null, d);
                        }
                        a.resultsHandler.getFailureNumber() >= 10 ? a.stop() : (a.turnConnection.disconnect(), 
                        setTimeout(function() {
                            a._start();
                        }, 0));
                    }));
                }
            }, {
                key: "stop",
                value: function() {
                    var a = this;
                    if (this.browserInfo.browserName !== k.Constants.browserName.msie && this.active) {
                        this.active = !1, this.activeTurnTest && this.activeTurnTest.forceStop();
                        var b = this.onlineCheck.stop();
                        this.resultsHandler && this.resultsHandler.add("onlineStatus", b), this.turnConnection.getIceResults().then(function(b) {
                            a.resultsHandler && a.resultsHandler.add("ice", b), a.turnConnection.disconnect(), 
                            a.sendResults();
                        }, function(b) {
                            a.resultsHandler && a.resultsHandler.failure(b), a.turnConnection.disconnect(), 
                            a.sendResults();
                        });
                    }
                }
            }, {
                key: "sendResults",
                value: function() {
                    if (this.resultsHandler) {
                        var a = this.resultsHandler.getResults();
                        this.resultsHandler = null, this.callback && this.callback(a, null);
                    } else this.callback && this.callback(null, "No results present");
                }
            }, {
                key: "callStarts",
                value: function() {
                    this.callsInProgress += 1, this.stop();
                }
            }, {
                key: "callFinished",
                value: function() {
                    this.callsInProgress -= 1;
                }
            }, {
                key: "getId",
                value: function() {
                    return this.resultsHandler ? this.resultsHandler.getId() : null;
                }
            }, {
                key: "crashDisconnect",
                value: function() {
                    try {
                        this.turnConnection.disconnect();
                    } catch (a) {}
                }
            }, {
                key: "startTurnTests",
                value: function() {
                    var a = this;
                    if (this.turnTestCounter >= this.turnTests.length) return new l(function(a, b) {
                        a();
                    });
                    var b = this.turnTests[this.turnTestCounter], c = null;
                    switch (b) {
                      case m.RTT:
                        c = new g.RttTest(this.turnConnection);
                        break;

                      case m.THROUGHPUT:
                        c = new h.ThroughputTest(this.turnConnection, this.rtt);
                        break;

                      default:
                        return new l(function(a, c) {
                            c(new Error("Unknown test: " + b));
                        });
                    }
                    return this.activeTurnTest = c, this.active ? c.start().then(function() {
                        return a.handleTestResults(b, c.getResults()), a.turnTestCounter += 1, a.activeTurnTest = null, 
                        a.startTurnTests();
                    }, function(d) {
                        return a.handleTestResults(b, c.getResults(), d), a.turnTestCounter += 1, a.activeTurnTest = null, 
                        a.startTurnTests();
                    }) : new l(function(a, b) {
                        b(new Error("Test trying to start while testing is not active"));
                    });
                }
            }, {
                key: "handleTestResults",
                value: function(a, b) {
                    null == (2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null) && a == m.RTT && (this.rtt = b.median), 
                    this.resultsHandler && this.resultsHandler.add(a, b);
                }
            } ]), a;
        }();
        c.PreCallTest = n;
    }, {
        "./tests/rttTest": 3,
        "./tests/throughputTest": 4,
        "./turnConnection": 6,
        "./utility/onlineCheck": 8,
        "./utility/resultsHandler": 10,
        "./utility/stats/detectbrowser": 11,
        bluebird: 1
    } ],
    3: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.RttTest = void 0;
        var g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = function a(b, c, d) {
            null === b && (b = Function.prototype);
            var e = Object.getOwnPropertyDescriptor(b, c);
            if (void 0 === e) {
                var f = Object.getPrototypeOf(b);
                return null === f ? void 0 : a(f, c, d);
            }
            if ("value" in e) return e.value;
            var g = e.get;
            return void 0 !== g ? g.call(d) : void 0;
        }, i = a("../utility/timestamps"), j = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(i), k = a("./turnTest"), l = function(a) {
            function b(a) {
                d(this, b);
                var c = e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, a));
                return c.sendTimer = null, c.countSent = 0, c.rtts = [], c;
            }
            return f(b, k.TurnTest), g(b, [ {
                key: "initiate",
                value: function() {
                    this.results.startTimestamp = j.getCurrent(), this.sendPing();
                }
            }, {
                key: "handleMessage",
                value: function(a) {
                    if (this.isActive()) {
                        var b = parseInt(a, 10), c = this.calculateRtt(b);
                        this.rtts.push(c), this.countSent < 10 ? this.sendPing() : this.calculateMetrics();
                    }
                }
            }, {
                key: "handleError",
                value: function(a) {
                    this.fillResults(), this.failed(a);
                }
            }, {
                key: "sendPing",
                value: function() {
                    if (this.isActive()) {
                        var a = j.getCurrent();
                        this.send(a.toString()), this.countSent += 1, this.sendTimer && (clearTimeout(this.sendTimer), 
                        this.sendTimer = null), this.countSent < 10 ? this.sendTimer = setTimeout(this.sendPing.bind(this), 100) : this.sendTimer = setTimeout(this.calculateMetrics.bind(this), 500);
                    }
                }
            }, {
                key: "calculateRtt",
                value: function(a) {
                    return j.getCurrent() - a;
                }
            }, {
                key: "calculateMetrics",
                value: function() {
                    this.sendTimer && (clearTimeout(this.sendTimer), this.sendTimer = null), this.fillResults(), 
                    this.finished();
                }
            }, {
                key: "fillResults",
                value: function() {
                    this.results.sentMessages = this.countSent, this.results.unAckedMessages = this.countSent - this.rtts.length, 
                    this.results.maxMessages = 10, this.results.forceStopped = this.forceStopped, this.results.median = this.median(), 
                    this.results.average = this.average(), this.results.variance = this.variance(), 
                    this.results.endTimestamp = j.getCurrent();
                }
            }, {
                key: "median",
                value: function() {
                    if (0 == this.rtts.length) return null;
                    this.rtts.sort();
                    var a = Math.floor(this.rtts.length / 2);
                    return this.rtts[a];
                }
            }, {
                key: "average",
                value: function() {
                    if (0 == this.rtts.length) return null;
                    for (var a = 0, b = 0; b < this.rtts.length; b++) a += this.rtts[b];
                    return a / this.rtts.length;
                }
            }, {
                key: "variance",
                value: function() {
                    if (0 == this.rtts.length) return null;
                    for (var a = 0, b = this.average(), c = 0; c < this.rtts.length; c++) {
                        var d = this.rtts[c];
                        a += Math.pow(d - b, 2);
                    }
                    return a /= this.rtts.length;
                }
            }, {
                key: "stop",
                value: function() {
                    this.isActive() && (h(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "stop", this).call(this), 
                    this.fillResults());
                }
            } ]), b;
        }();
        c.RttTest = l;
    }, {
        "../utility/timestamps": 14,
        "./turnTest": 5
    } ],
    4: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.ThroughputTest = void 0;
        var g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = function a(b, c, d) {
            null === b && (b = Function.prototype);
            var e = Object.getOwnPropertyDescriptor(b, c);
            if (void 0 === e) {
                var f = Object.getPrototypeOf(b);
                return null === f ? void 0 : a(f, c, d);
            }
            if ("value" in e) return e.value;
            var g = e.get;
            return void 0 !== g ? g.call(d) : void 0;
        }, i = a("../utility/timestamps"), j = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(i), k = a("../utility/messageMaker"), l = a("./turnTest"), m = function(a) {
            function b(a, c) {
                d(this, b);
                var f = e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, a));
                if (f.sentBytes = 0, f.receivedBytes = 0, f.secondHalfBytes = 0, f.secondHalfStart = null, 
                f.bufferEmpty = 0, f.chunkSize = 1200, f.messageMaker = new k.MessageMaker(f.chunkSize), 
                f.duration = 5e3, null != c) {
                    var g = 50 * c;
                    f.duration = Math.max(Math.min(g, 1e4), 1e3);
                }
                return f.sendTimer = null, f.lastMessage = null, f.intervals = [], f.intervalStart = 0, 
                f.intervalLength = 100, f.intervalBytes = 0, f;
            }
            return f(b, l.TurnTest), g(b, [ {
                key: "initiate",
                value: function() {
                    if (window && window.csioReactNative) {
                        this.handleError(new Error("Not running throughput test for react-native"));
                    } else this.startSend();
                }
            }, {
                key: "handleMessage",
                value: function(a) {
                    var b = this;
                    if (this.isActive()) {
                        this.lastMessage = a, this.receivedBytes += a.length;
                        var c = j.getCurrent();
                        if (this.sendTimer || (this.results.startTimestamp = c, this.sendTimer = setTimeout(function() {
                            b.stop(), b.finished();
                        }, this.duration)), 0 == this.intervalStart && (this.intervalStart = c), this.intervalBytes += a.length, 
                        c - this.intervalStart >= this.intervalLength) {
                            var d = c - this.intervalStart, e = this.averageThroughput(this.intervalBytes, d), f = null;
                            try {
                                f = c - JSON.parse(this.lastMessage).timestamp;
                            } catch (a) {}
                            this.intervals.push({
                                startTimestamp: this.intervalStart,
                                endTimestamp: c,
                                bytesReceived: this.intervalBytes,
                                average: e,
                                rtt: f
                            }), this.intervalStart = c, this.intervalBytes = 0;
                        }
                        this.results.startTimestamp && c - this.results.startTimestamp > this.duration / 2 && (this.secondHalfStart || (this.secondHalfStart = c), 
                        this.secondHalfBytes += a.length);
                    }
                }
            }, {
                key: "handleError",
                value: function(a) {
                    this.stop(), this.failed(a);
                }
            }, {
                key: "averageThroughput",
                value: function(a, b) {
                    return a / (b / 1e3) * 8 / 1024;
                }
            }, {
                key: "bufferListener",
                value: function() {
                    this.sendChannel.removeEventListener("bufferedamountlow", this.bufferListener.bind(this)), 
                    this.fillBuffer();
                }
            }, {
                key: "fillBuffer",
                value: function() {
                    for (0 == this.sendChannel.bufferedAmount && (this.bufferEmpty += 1); this.isActive(); ) {
                        if (this.sendChannel.bufferedAmount > this.bufferFullThreshold) return void (this.usePolling ? setTimeout(this.fillBuffer.bind(this), 250) : this.sendChannel.addEventListener("bufferedamountlow", this.bufferListener.bind(this)));
                        var a = this.messageMaker.make(this.sentBytes);
                        this.sentBytes += a.length, this.send(a);
                    }
                    this.sendChannel.removeEventListener("bufferedamountlow", this.bufferListener.bind(this));
                }
            }, {
                key: "startSend",
                value: function() {
                    this.isActive() && (this.bufferFullThreshold = 1e3 * this.chunkSize, this.sendChannel = this.connection.sendChannel, 
                    this.usePolling = !0, "number" == typeof this.sendChannel.bufferedAmountLowThreshold && (this.usePolling = !1, 
                    this.sendChannel.bufferedAmountLowThreshold = this.bufferFullThreshold / 10), setTimeout(this.fillBuffer.bind(this), 0));
                }
            }, {
                key: "fillResults",
                value: function() {
                    this.results.endTimestamp = j.getCurrent(), this.results.maxDuration = this.duration, 
                    this.results.forceStopped = this.forceStopped, this.results.bufferEmpty = this.bufferEmpty, 
                    this.results.intervals = this.intervals, this.results.bytesPrepared = this.sentBytes, 
                    this.results.bytesReceived = this.receivedBytes;
                    var a = 0, b = 0;
                    this.secondHalfStart && (a = this.results.endTimestamp - this.secondHalfStart, b = this.averageThroughput(this.secondHalfBytes, a));
                    var c = this.results.endTimestamp - this.results.startTimestamp, d = this.averageThroughput(this.receivedBytes, c);
                    b < d && (b = d), this.results.average = b;
                    var e = null;
                    try {
                        e = JSON.parse(this.lastMessage);
                    } catch (a) {
                        return;
                    }
                    if (e) {
                        var f = e.sentBytes + this.lastMessage.length;
                        this.results.bytesSent = f, this.results.fractionLostBytes = 1 - this.receivedBytes / f;
                    } else this.results.bytesSent = -1, this.results.fractionLostBytes = -1;
                }
            }, {
                key: "stop",
                value: function() {
                    this.isActive() && (clearTimeout(this.sendTimer), this.sendTimer = null, h(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "stop", this).call(this), 
                    this.fillResults());
                }
            } ]), b;
        }();
        c.ThroughputTest = m;
    }, {
        "../utility/messageMaker": 7,
        "../utility/timestamps": 14,
        "./turnTest": 5
    } ],
    5: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("bluebird"), g = function() {
            function a(b) {
                d(this, a), this.connection = b, this.active = !1, this.results = {};
            }
            return e(a, [ {
                key: "getResults",
                value: function() {
                    return this.results;
                }
            }, {
                key: "start",
                value: function() {
                    var a = this, b = new f(function(b, c) {
                        a.resolveCb = b, a.rejectCb = c;
                    });
                    return this.connection.setMessageCallback(this.handleMessage.bind(this)), this.connection.setErrorCallback(this.handleError.bind(this)), 
                    this.active = !0, this.forceStopped = !1, this.initiate(), b;
                }
            }, {
                key: "stop",
                value: function() {
                    this.active = !1;
                }
            }, {
                key: "forceStop",
                value: function() {
                    this.forceStopped = !0, this.stop(), this.finished();
                }
            }, {
                key: "isActive",
                value: function() {
                    return this.active;
                }
            }, {
                key: "initiate",
                value: function() {}
            }, {
                key: "handleMessage",
                value: function(a) {}
            }, {
                key: "handleError",
                value: function(a) {}
            }, {
                key: "send",
                value: function(a) {
                    this.connection.send(a);
                }
            }, {
                key: "finished",
                value: function() {
                    this.active = !1, this.resolveCb && (this.resolveCb(), this.resolveCb = null);
                }
            }, {
                key: "failed",
                value: function(a) {
                    this.active = !1, this.rejectCb && (this.rejectCb(a), this.rejectCb = null);
                }
            } ]), a;
        }();
        c.TurnTest = g;
    }, {
        bluebird: 1
    } ],
    6: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.TurnConnection = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./utility/parsedIceCandidate"), g = a("./utility/stats/getstatshandler"), h = a("./utility/stats/detectbrowser"), i = a("bluebird"), j = function() {
            function a(b) {
                d(this, a), this.reset(), this.statshandler = new g.GetStatsHandler(b);
            }
            return e(a, [ {
                key: "reset",
                value: function() {
                    this.disconnect(), this.iceServers = null, this.pctpc1 = null, this.pctpc2 = null, 
                    this.sendChannel = null, this.messageCallback = null, this.errorCallback = null, 
                    this.parsedIceResults = {}, this.resolveCb = null, this.rejectCb = null;
                }
            }, {
                key: "setMessageCallback",
                value: function(a) {
                    this.messageCallback = a;
                }
            }, {
                key: "setErrorCallback",
                value: function(a) {
                    this.errorCallback = a;
                }
            }, {
                key: "send",
                value: function(a) {
                    if (this.sendChannel) try {
                        this.sendChannel.send(a);
                    } catch (a) {
                        this.raiseSendError(a);
                    } else this.raiseSendError(new Error("No send channel"));
                }
            }, {
                key: "raiseSendError",
                value: function(a) {
                    this.errorCallback && this.errorCallback(a);
                }
            }, {
                key: "assignEvent",
                value: function(a, b, c) {
                    a.addEventListener ? a.addEventListener(b, c.bind(this), !1) : a.attachEvent && (b = "on" + b, 
                    a.attachEvent(b, c.bind(this)));
                }
            }, {
                key: "connect",
                value: function(a) {
                    var b = this;
                    this.reset();
                    var c = new i(function(a, c) {
                        b.resolveCb = a, b.rejectCb = c;
                    });
                    this.iceServers = a;
                    var d = null;
                    try {
                        if (RTCPeerConnection ? d = RTCPeerConnection : webkitRTCPeerConnection ? d = webkitRTCPeerConnection : mozRTCPeerConnection ? d = mozRTCPeerConnection : window && window.RTCPeerConnection && (d = window.RTCPeerConnection), 
                        !d) {
                            var e = new Error("RTCPeerConnection not found");
                            return e.continueFlag = !1, this.rejectCb(e), c;
                        }
                    } catch (e) {
                        return e.continueFlag = !1, this.rejectCb(e), c;
                    }
                    var f = {
                        iceTransportPolicy: "all",
                        iceServers: this.iceServers
                    };
                    try {
                        this.pctpc1 = new d(f), this.pctpc2 = new d(f);
                    } catch (e) {
                        return this.rejectDisconnect(!1, e), c;
                    }
                    this.connectionTimer = setTimeout(function() {
                        delete b.connectionTimer, b.rejectDisconnect(!1, new Error("Connection timeout"));
                    }, 3e4);
                    try {
                        this.sendChannel = this.pctpc1.createDataChannel("precalltest", {
                            ordered: !1,
                            maxRetransmits: 0
                        }), this.sendChannel.binaryType = "arraybuffer", this.assignEvent(this.sendChannel, "error", function(a) {
                            b.raiseSendError(a), b.rejectDisconnect(!0, a);
                        }), this.assignEvent(this.pctpc2, "datachannel", function(a) {
                            var c = a.channel;
                            b.assignEvent(c, "open", function(a) {
                                b.resolveCb && (b.resolveCb(), b.resolveCb = null);
                            }), b.assignEvent(c, "close", function(a) {
                                b && b.disconnect && b.disconnect();
                            }), b.assignEvent(c, "message", function(a) {
                                b.messageCallback && b.messageCallback(a.data);
                            }), b.assignEvent(c, "error", function(a) {
                                b.errorCallback && b.errorCallback(a), b.rejectDisconnect(!0, a);
                            });
                        });
                    } catch (e) {
                        return this.rejectDisconnect(!1, e), c;
                    }
                    try {
                        this.assignEvent(this.pctpc1, "icecandidate", function(a) {
                            b.onIceCandidate(b.pctpc1, a);
                        }), this.assignEvent(this.pctpc1, "iceconnectionstatechange", function(a) {
                            b.onIceStateChange(b.pctpc1, a);
                        }), this.assignEvent(this.pctpc2, "icecandidate", function(a) {
                            b.onIceCandidate(b.pctpc2, a);
                        }), this.assignEvent(this.pctpc2, "iceconnectionstatechange", function(a) {
                            b.onIceStateChange(b.pctpc2, a);
                        }), this.pctpc1.createOffer().then(function(a, c) {
                            b.onCreateOfferSuccess(a);
                        }, function(a) {
                            b.onCreateOfferError(b.pctpc1, a);
                        });
                    } catch (e) {
                        return this.rejectDisconnect(!1, e), c;
                    }
                    return c;
                }
            }, {
                key: "rejectDisconnect",
                value: function(a, b) {
                    this.disconnect(), this.rejectCb && (b.continueFlag = a, this.rejectCb(b)), this.resolveCb = null, 
                    this.rejectCb = null;
                }
            }, {
                key: "disconnect",
                value: function() {
                    if (clearTimeout(this.connectionTimer), clearTimeout(this.iceTimer), this.pctpc1) try {
                        this.pctpc1.close();
                    } catch (a) {}
                    if (this.pctpc1 = null, this.pctpc2) try {
                        this.pctpc2.close();
                    } catch (a) {}
                    this.pctpc2 = null;
                }
            }, {
                key: "getName",
                value: function(a) {
                    return a === this.pctpc1 ? "pctpc1" : "pctpc2";
                }
            }, {
                key: "getOtherPc",
                value: function(a) {
                    return a === this.pctpc1 ? this.pctpc2 : this.pctpc1;
                }
            }, {
                key: "onCreateOfferError",
                value: function(a, b) {
                    this.rejectDisconnect(!1, b);
                }
            }, {
                key: "onCreateAnswerError",
                value: function(a, b) {
                    this.rejectDisconnect(!1, b);
                }
            }, {
                key: "onCreateOfferSuccess",
                value: function(a) {
                    var b = this;
                    try {
                        this.pctpc1.setLocalDescription(a).then(function() {
                            b.onSetLocalSuccess(b.pctpc1);
                        }, function(a) {
                            b.onSetSessionDescriptionError(b.pctpc1, a);
                        }), this.pctpc2.setRemoteDescription(a).then(function() {
                            b.onSetRemoteSuccess(b.pctpc2);
                        }, function(a) {
                            b.onSetRemoteSessionDescriptionError(b.pctpc2, a);
                        }), this.pctpc2.createAnswer().then(function(a) {
                            b.onCreateAnswerSuccess(a);
                        }, function(a) {
                            b.onCreateAnswerError(b.pctpc2, a);
                        });
                    } catch (a) {
                        this.rejectDisconnect(!1, a);
                    }
                }
            }, {
                key: "onSetLocalSuccess",
                value: function(a) {}
            }, {
                key: "onSetRemoteSuccess",
                value: function(a) {}
            }, {
                key: "onSetSessionDescriptionError",
                value: function(a, b) {
                    this.rejectDisconnect(!1, b);
                }
            }, {
                key: "onSetRemoteSessionDescriptionError",
                value: function(a, b) {
                    this.rejectDisconnect(!1, b);
                }
            }, {
                key: "onCreateAnswerSuccess",
                value: function(a) {
                    var b = this;
                    try {
                        this.pctpc2.setLocalDescription(a).then(function() {
                            b.onSetLocalSuccess(b.pctpc2);
                        }, function(a) {
                            b.onSetSessionDescriptionError(b.pctpc2, a);
                        }), this.pctpc1.setRemoteDescription(a).then(function() {
                            b.onSetRemoteSuccess(b.pctpc1);
                        }, function(a) {
                            b.onSetRemoteSessionDescriptionError(b.pctpc1, a);
                        });
                    } catch (a) {
                        this.rejectDisconnect(!1, a);
                    }
                }
            }, {
                key: "onIceCandidate",
                value: function(a, b) {
                    var c = this;
                    try {
                        if (!b.candidate) return;
                        var d = new f.ParsedIceCandidate(b.candidate);
                        if (a == this.pctpc1 && this.statshandler.codeBase == h.Constants.codeBaseType.chrome && (d.isRelay() && (d.isTypeTransportUdp() && (this.parsedIceResults.relayUdpGathered = !0), 
                        d.isTypeTransportTcp() && (this.parsedIceResults.relayTcpGathered = !0), d.isTypeTransportTls() && (this.parsedIceResults.relayTlsGathered = !0)), 
                        d.isServerReflexive() && (this.parsedIceResults.srflxGathered = !0)), !d.isRelay()) return;
                        this.getOtherPc(a).addIceCandidate(b.candidate).then(function() {
                            c.onAddIceCandidateSuccess(a);
                        }, function(b) {
                            c.onAddIceCandidateError(a, b, d.isRelay());
                        });
                    } catch (b) {
                        this.rejectDisconnect(!1, b);
                    }
                }
            }, {
                key: "onAddIceCandidateSuccess",
                value: function(a) {}
            }, {
                key: "onAddIceCandidateError",
                value: function(a, b, c) {
                    c && this.rejectDisconnect(!1, b);
                }
            }, {
                key: "onIceStateChange",
                value: function(a, b) {
                    var c = this;
                    try {
                        var d = "(?)";
                        a && (d = a.iceConnectionState), "failed" === d && this.rejectDisconnect(!0, new Error("ICE failure")), 
                        "checking" !== d || this.iceTimer || (this.iceTimer = setTimeout(function() {
                            delete c.iceTimer, c.rejectDisconnect(!0, new Error("ICE timeout"));
                        }, 1e4)), "completed" !== d && "connected" !== d || (clearTimeout(this.iceTimer), 
                        delete this.iceTimer);
                    } catch (a) {
                        this.rejectDisconnect(!1, a);
                    }
                }
            }, {
                key: "getIceResults",
                value: function() {
                    var a = this;
                    return new i(function(b, c) {
                        for (var d = JSON.parse(JSON.stringify(a.iceServers)), e = 0; e < d.length; e++) {
                            var f = d[e];
                            d.hasOwnProperty(f) || delete f.credential;
                        }
                        var g = {
                            turnIpAddress: "",
                            turnIpVersion: "",
                            turnTransport: "",
                            iceServers: d,
                            ipv6Supported: !1,
                            ipv4Supported: !1,
                            relayTlsGathered: !1,
                            relayTcpGathered: !1,
                            relayUdpGathered: !1,
                            srflxGathered: !1,
                            relayTlsSuccess: !1,
                            relayTcpSuccess: !1,
                            relayUdpSuccess: !1,
                            srflxSuccess: !1
                        };
                        for (var h in a.parsedIceResults) a.parsedIceResults.hasOwnProperty(h) && (g[h] = a.parsedIceResults[h]);
                        a.pctpc1 ? a.statshandler.getIceCandidates(a.pctpc1).then(function(a) {
                            for (var c = 0; c < a.iceCandidatePairs.length; c++) {
                                var d = a.iceCandidatePairs[c];
                                if (d.googActiveConnection || d.selected) for (var e = 0; e < a.localCandidates.length; e++) {
                                    var f = a.localCandidates[e], h = null;
                                    if (h = f.ip ? f.ip : f.ipAddress, f.id == d.localCandidateId) {
                                        var i = -1 !== (g.turnIpAddress = h).indexOf(":");
                                        g.turnIpVersion = i ? "ipv6" : "ipv4", g.turnTransport = f.mozLocalTransport;
                                    }
                                    "relay" !== f.candidateType && "relayed" !== f.candidateType || ("udp" === f.mozLocalTransport && (g.relayUdpSuccess = !0), 
                                    "tcp" === f.mozLocalTransport && (g.relayTcpSuccess = !0), "tls" === f.mozLocalTransport && (g.relayTlsSuccess = !0)), 
                                    -1 !== h.indexOf(":") ? g.ipv6Supported = !0 : g.ipv4Supported = !0;
                                }
                            }
                            for (var j = 0; j < a.localCandidates.length; j++) {
                                var k = a.localCandidates[j];
                                "relay" !== k.candidateType && "relayed" !== k.candidateType || ("udp" === k.mozLocalTransport && (g.relayUdpGathered = !0), 
                                "tcp" === k.mozLocalTransport && (g.relayTcpGathered = !0), "tls" === k.mozLocalTransport && (g.relayTlsGathered = !0)), 
                                "srflx" !== k.candidateType && "serverreflexive" !== k.candidateType || (g.srflxGathered = !0);
                            }
                            for (var l = 0; l < a.iceCandidatePairs.length; l++) {
                                var m = a.iceCandidatePairs[l];
                                if ("succeeded" === m.state) for (var n = 0; n < a.localCandidates.length; n++) {
                                    var o = a.localCandidates[n];
                                    o.id == m.localCandidateId && ("relay" !== o.candidateType && "relayed" !== o.candidateType || ("udp" === o.mozLocalTransport && (g.relayUdpSuccess = !0), 
                                    "tcp" === o.mozLocalTransport && (g.relayTcpSuccess = !0), "tls" === o.mozLocalTransport && (g.relayTlsSuccess = !0)), 
                                    "srflx" !== o.candidateType && "serverreflexive" !== o.candidateType || (g.srflxSuccess = !0));
                                }
                            }
                            b(g);
                        }, function(a) {
                            c(a);
                        }) : c(new Error("PC not available for stats"));
                    }, function(a) {
                        reject(a);
                    });
                }
            } ]), a;
        }();
        c.TurnConnection = j;
    }, {
        "./utility/parsedIceCandidate": 9,
        "./utility/stats/detectbrowser": 11,
        "./utility/stats/getstatshandler": 12,
        bluebird: 1
    } ],
    7: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a) {
            for (var b = "", c = 0; c < a; c++) b += String.fromCharCode(35 + 58 * Math.random());
            return b;
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.randomAsciiString = c.MessageMaker = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../utility/timestamps"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = function() {
            function a() {
                var b = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 1200;
                d(this, a), this.message = {
                    timestamp: "",
                    sentBytes: 1e4,
                    padding: ""
                };
                var c = e(b - h.getCurrent().toString().length - JSON.stringify(this.message).length);
                this.message.padding = c;
            }
            return f(a, [ {
                key: "make",
                value: function(a) {
                    return this.message.timestamp = h.getCurrent(), this.message.sentBytes = a, JSON.stringify(this.message);
                }
            } ]), a;
        }();
        c.MessageMaker = i, c.randomAsciiString = e;
    }, {
        "../utility/timestamps": 14
    } ],
    8: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.OnlineCheck = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./timestamps"), g = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(f), h = function() {
            function a() {
                d(this, a), this.active = !1;
            }
            return e(a, [ {
                key: "start",
                value: function() {
                    var a = this;
                    this.active = !0, this.onlineCheck = [], window && window.addEventListener && "function" == typeof window.addEventListener && (window.addEventListener("offline", function() {
                        a.addEntry();
                    }), window.addEventListener("online", function() {
                        a.addEntry();
                    }), this.addEntry());
                }
            }, {
                key: "addEntry",
                value: function() {
                    if (this.active) {
                        var a = g.getCurrent();
                        if (navigator && navigator.onLine) {
                            var b = navigator.onLine;
                            this.onlineCheck.push({
                                timestamp: a,
                                online: b
                            });
                        }
                    }
                }
            }, {
                key: "stop",
                value: function() {
                    var a = this;
                    return this.active = !1, window && window.removeEventListener && "function" == typeof window.removeEventListener && (window.removeEventListener("offline", function() {
                        a.addEntry();
                    }), window.removeEventListener("online", function() {
                        a.addEntry();
                    })), this.onlineCheck;
                }
            } ]), a;
        }();
        c.OnlineCheck = h;
    }, {
        "./timestamps": 14
    } ],
    9: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a(b) {
                d(this, a), this.iceCandidateStr = b.candidate, this.parse();
            }
            return e(a, [ {
                key: "parse",
                value: function() {
                    var a = this.iceCandidateStr.split(" ");
                    a.length < 8 || (this.protocol = "1" === a[1] ? "rtp" : "rtcp", this.transport = a[2], 
                    this.typeTransport = this.extractTypeTransport(a[3]), this.ipv6 = -1 !== a[4].indexOf(":"), 
                    this.ipAddress = a[4], this.port = a[5], this.type = a[7]);
                }
            }, {
                key: "extractTypeTransport",
                value: function(a) {
                    var b = "None", c = a >> 24;
                    if ("rtp" === this.protocol && 0 <= c && c <= 2) switch (c) {
                      case 0:
                        b = "TLS";
                        break;

                      case 1:
                        b = "TCP";
                        break;

                      case 2:
                        b = "UDP";
                    }
                    return b;
                }
            }, {
                key: "getString",
                value: function() {
                    return this.iceCandidateStr;
                }
            }, {
                key: "getType",
                value: function() {
                    return this.type;
                }
            }, {
                key: "isHost",
                value: function() {
                    return "host" === this.type.toLowerCase();
                }
            }, {
                key: "isServerReflexive",
                value: function() {
                    return "srflx" === this.type.toLowerCase();
                }
            }, {
                key: "isPeerReflexive",
                value: function() {
                    return "prflx" === this.type.toLowerCase();
                }
            }, {
                key: "isRelay",
                value: function() {
                    return "relay" === this.type.toLowerCase() || "relayed" === this.type.toLowerCase();
                }
            }, {
                key: "getTypeTransport",
                value: function() {
                    return this.typeTransport;
                }
            }, {
                key: "isTypeTransportUdp",
                value: function() {
                    return "UDP" === this.typeTransport;
                }
            }, {
                key: "isTypeTransportTcp",
                value: function() {
                    return "TCP" === this.typeTransport;
                }
            }, {
                key: "isTypeTransportTls",
                value: function() {
                    return "TLS" === this.typeTransport;
                }
            }, {
                key: "getTransport",
                value: function() {
                    return this.transport;
                }
            }, {
                key: "isUdp",
                value: function() {
                    return "udp" === this.transport.toLowerCase();
                }
            }, {
                key: "isTcp",
                value: function() {
                    return "tcp" === this.transport.toLowerCase();
                }
            }, {
                key: "getProtocol",
                value: function() {
                    return this.protocol;
                }
            }, {
                key: "isRtp",
                value: function() {
                    return "rtp" === this.protocol;
                }
            }, {
                key: "isRtcp",
                value: function() {
                    return "rtcp" === this.protocol;
                }
            }, {
                key: "isIpv6",
                value: function() {
                    return this.ipv6;
                }
            }, {
                key: "getIpAddress",
                value: function() {
                    return this.ipAddress;
                }
            }, {
                key: "getPort",
                value: function() {
                    return this.port;
                }
            } ]), a;
        }();
        c.ParsedIceCandidate = f;
    }, {} ],
    10: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.ResultsHandler = void 0;
        var e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
            return typeof a;
        } : function(a) {
            return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a;
        }, f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("./timestamps"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = a("./messageMaker"), j = function() {
            function a() {
                d(this, a), this.start = h.getCurrent(), this.id = Math.trunc(this.start) + "-" + (0, 
                i.randomAsciiString)(20), this.version = "1.3.1", this.failures = [], this.results = {}, 
                this.forceStopped = !0, this.provider = "callstats";
            }
            return f(a, [ {
                key: "setProvider",
                value: function(a) {
                    a && (this.provider = a);
                }
            }, {
                key: "getResults",
                value: function() {
                    return {
                        id: this.id,
                        version: this.version,
                        forceStopped: this.forceStopped,
                        startTimestamp: this.start,
                        endTimestamp: h.getCurrent(),
                        failures: this.failures,
                        tests: this.results,
                        provider: this.provider
                    };
                }
            }, {
                key: "getFailureNumber",
                value: function() {
                    return this.failures.length;
                }
            }, {
                key: "getId",
                value: function() {
                    return this.id;
                }
            }, {
                key: "add",
                value: function(a, b) {
                    (this.results[a] = b).hasOwnProperty("forceStopped") && (this.forceStopped = b.forceStopped);
                }
            }, {
                key: "failure",
                value: function(a) {
                    "object" === (void 0 === a ? "undefined" : e(a)) && (a = a.toString());
                    var b = {
                        timestamp: h.getCurrent(),
                        reason: a
                    };
                    this.failures.push(b);
                }
            } ]), a;
        }();
        c.ResultsHandler = j;
    }, {
        "./messageMaker": 7,
        "./timestamps": 14
    } ],
    11: [ function(a, b, c) {
        "use strict";
        function d() {
            var a = e.browserName.chrome, b = null, c = null, d = null, f = null, g = e.codeBaseType.chrome;
            if (window && (!window.navigator || !window.navigator.userAgent || window.csioReactNative)) return window && window.csioGetOsName && (b = window.csioGetOsName()), 
            window && window.csioGetOsVer && (c = window.csioGetOsVer()), window && window.csioReactNative && (d = "react-native"), 
            {
                browserName: a,
                codeBase: g,
                os: b,
                osVersion: c,
                userAgent: d
            };
            var h = (d = navigator.userAgent).toLowerCase(), i = void 0, j = void 0;
            (f = navigator.appVersion) && (i = f.toLowerCase(), j = "" + parseFloat(i));
            var k = void 0, l = "Version";
            -1 !== (k = h.indexOf("opera")) ? (a = e.browserName.opera, j = h.substring(k + 6), 
            -1 !== (k = h.indexOf(l)) && (j = h.substring(k + 8)), g = e.codeBaseType.chrome) : -1 !== (k = h.indexOf("opr")) ? (a = e.browserName.opera, 
            j = h.substring(k + 4), -1 !== (k = h.indexOf(l)) && (j = h.substring(k + 8)), g = e.codeBaseType.chrome) : -1 !== (k = h.indexOf("msie")) ? (a = e.browserName.msie, 
            j = h.substring(k + 5), g = e.codeBaseType.chrome) : -1 !== (k = h.indexOf("edge")) ? (a = e.browserName.edge, 
            j = h.substring(k + 5), g = e.codeBaseType.edge) : -1 !== (k = h.indexOf("chrome")) ? (a = e.browserName.chrome, 
            j = h.substring(k + 7), g = e.codeBaseType.chrome) : -1 !== (k = h.indexOf("safari")) ? (a = e.browserName.safari, 
            j = h.substring(k + 7), -1 !== (k = h.indexOf(l)) && (j = h.substring(k + 8)), g = e.codeBaseType.chrome) : -1 !== (k = h.indexOf("firefox")) ? (a = e.browserName.firefox, 
            j = h.substring(k + 8), g = e.codeBaseType.firefox) : -1 !== (k = h.indexOf("trident")) && (a = e.browserName.msie, 
            k = h.indexOf("rv"), j = h.substring(k + 3, k + 7), g = e.codeBaseType.chrome);
            var m = [ {
                s: "Windows 3.11",
                r: /win16/
            }, {
                s: "Windows 95",
                r: /(windows 95|win95|windows_95)/
            }, {
                s: "Windows ME",
                r: /(win 9x 4.90|windows me)/
            }, {
                s: "Windows 98",
                r: /(windows 98|win98)/
            }, {
                s: "Windows CE",
                r: /windows ce/
            }, {
                s: "Windows 2000",
                r: /(windows nt 5.0|windows 2000)/
            }, {
                s: "Windows XP",
                r: /(windows nt 5.1|windows xp)/
            }, {
                s: "Windows Server 2003",
                r: /windows nt 5.2/
            }, {
                s: "Windows Vista",
                r: /windows nt 6.0/
            }, {
                s: "Windows 7",
                r: /(windows 7|windows nt 6.1)/
            }, {
                s: "Windows 8.1",
                r: /(windows 8.1|windows nt 6.3)/
            }, {
                s: "Windows 8",
                r: /(windows 8|windows nt 6.2)/
            }, {
                s: "Windows 10",
                r: /(windows 10|windows nt 10.0)/
            }, {
                s: "Windows NT 4.0",
                r: /(windows nt 4.0|winnt4.0|winnt|windows nt)/
            }, {
                s: "Windows ME",
                r: /windows me/
            }, {
                s: "Android",
                r: /android/
            }, {
                s: "Open BSD",
                r: /openbsd/
            }, {
                s: "Sun OS",
                r: /sunos/
            }, {
                s: "Linux",
                r: /(linux|x11)/
            }, {
                s: "iOS",
                r: /(iphone|ipad|ipod)/
            }, {
                s: "Mac OS X",
                r: /mac os x/
            }, {
                s: "Mac OS",
                r: /(macppc|macintel|mac_powerpc|macintosh)/
            }, {
                s: "QNX",
                r: /qnx/
            }, {
                s: "UNIX",
                r: /unix/
            }, {
                s: "BeOS",
                r: /beos/
            }, {
                s: "OS/2",
                r: /os\/2/
            }, {
                s: "Search Bot",
                r: /(nuhk|googlebot|yammybot|openbot|slurp|msnbot|ask jeeves\/teoma|ia_archiver)/
            } ], n = void 0, o = void 0;
            for (n in m) if (m.hasOwnProperty(n) && (o = m[n]).r.test(h)) {
                b = o.s;
                break;
            }
            switch (b && /Windows/.test(b) && (c = /Windows (.*)/.exec(b)[1], b = e.osName.windows), 
            b) {
              case e.osName.mac:
                c = /mac os x (10[\.\_\d]+)/.exec(h)[1];
                break;

              case e.osName.android:
                c = /android ([\.\_\d]+)/.exec(h)[1];
                break;

              case e.osName.ios:
                if (!i) break;
                if (!(c = /os (\d+)_(\d+)_?(\d+)?/.exec(i))) break;
                c = c[1] + "." + c[2] + "." + (0 | c[3]);
            }
            return {
                browserName: a,
                browserVersion: j.toString(),
                os: b,
                osVersion: c,
                codeBase: g,
                userAgent: d
            };
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.detect = d;
        var e = c.Constants = {
            codeBaseType: {
                chrome: "Chrome",
                firefox: "Firefox",
                edge: "Edge",
                plugin: "Plugin"
            },
            browserName: {
                chrome: "Chrome",
                firefox: "Firefox",
                edge: "Edge",
                msie: "Microsoft Internet Explorer",
                safari: "Safari"
            },
            osName: {
                windows: "Windows",
                mac: "Mac OS X",
                android: "Android",
                ios: "iOS"
            }
        };
    }, {} ],
    12: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.GetStatsHandler = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./detectbrowser"), g = a("./statsadapter"), h = a("bluebird"), i = function() {
            function a(b) {
                d(this, a), this.codeBase = b.codeBase, this.browserName = b.browserName, this.adapter = new g.StatsAdapter(this.codeBase, this.browserName), 
                this.isPromiseBased = !0;
            }
            return e(a, [ {
                key: "getIceCandidates",
                value: function(a) {
                    var b = this;
                    return new h(function(c, d) {
                        b.csioGetStats(b.iceCandidatesHandler.bind(b), a, function(a) {
                            c(a);
                        });
                    });
                }
            }, {
                key: "iceCandidatesHandler",
                value: function(a, b) {
                    b(this.adapter.getIceCandidates(a));
                }
            }, {
                key: "csioGetStats",
                value: function(a, b, c) {
                    var d = f.Constants.codeBaseType.firefox, e = f.Constants.codeBaseType.chrome, g = f.Constants.codeBaseType.edge, h = f.Constants.browserName.safari;
                    b && (this.codeBase === d ? this.getStatsFirefox(a, b, c) : this.browserName === h ? this.getStatsSafari(a, b, c) : this.codeBase === e ? this.getStatsChrome(a, b, c) : this.codeBase === g && this.getStatsEdge(a, b, c));
                }
            }, {
                key: "getStatsFirefox",
                value: function(a, b, c) {
                    var d = this;
                    if (d.isPromiseBased) try {
                        b.getStats().then(function(b) {
                            a(b, c);
                        }).catch(function(e) {
                            d.isPromiseBased = !1, b.getStats(null, function(b) {
                                a(b, c);
                            }, function() {});
                        });
                    } catch (e) {
                        d.isPromiseBased = !1, b.getStats(null, function(b) {
                            a(b, c);
                        }, function() {});
                    } else b.getStats(null, function(b) {
                        a(b, c);
                    }, function() {});
                }
            }, {
                key: "getStatsChrome",
                value: function(a, b, c) {
                    var d = this;
                    if (window && window.csioReactNative) b.getStats(null, function(b) {
                        a(b, c);
                    }, function(a) {}); else if (d.isPromiseBased) try {
                        b.getStats().then(function(b) {
                            a(b, c);
                        }).catch(function(e) {
                            d.isPromiseBased = !1, b.getStats(function(b) {
                                a(b, c);
                            });
                        });
                    } catch (d) {
                        isPromiseBased = !1, b.getStats(function(b) {
                            a(b, c);
                        });
                    } else b.getStats(function(b) {
                        a(b, c);
                    });
                }
            }, {
                key: "getStatsEdge",
                value: function(a, b, c) {
                    b.getStats().then(function(b) {
                        a(b, c);
                    }).catch(function(a) {});
                }
            }, {
                key: "getStatsSafari",
                value: function(a, b, c) {
                    b.getStats().then(function(b) {
                        a(b, c);
                    }).catch(function(a) {});
                }
            } ]), a;
        }();
        c.GetStatsHandler = i;
    }, {
        "./detectbrowser": 11,
        "./statsadapter": 13,
        bluebird: 1
    } ],
    13: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.StatsAdapter = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./detectbrowser"), g = function() {
            function a(b, c) {
                d(this, a), this.codeBase = b, this.browser = c;
            }
            return e(a, [ {
                key: "getIceCandidates",
                value: function(a) {
                    if (!a) return {
                        localCandidates: [],
                        remoteCandidates: [],
                        iceCandidatePairs: []
                    };
                    var b = this.extractRawStats(a);
                    return this.processRawStatsForIceInfo(b);
                }
            }, {
                key: "extractRawStats",
                value: function(a) {
                    var b = [], c = void 0, d = f.Constants.codeBaseType.firefox, e = f.Constants.codeBaseType.chrome, g = f.Constants.browserName.safari;
                    if (this.codeBase === d && this.browser !== g) a.forEach(function(a) {
                        b.push(a);
                    }); else if (this.codeBase === e && this.browser !== g) a && a.result ? b = a.result() : a && a.forEach && (b = [], 
                    a.forEach(function(a) {
                        b.push(a);
                    })); else for (c in a) a.hasOwnProperty(c) && b.push(a[c]);
                    return b;
                }
            }, {
                key: "processRawStatsForIceInfo",
                value: function(a) {
                    var b = [], c = [], d = [], e = void 0;
                    if (!a) return {
                        localCandidates: b,
                        remoteCandidates: c,
                        iceCandidatePairs: d
                    };
                    for (var f = 0; f < a.length; ++f) {
                        var g = this.getParsedStats(a[f]), h = this.statsClassifier(g);
                        if (h.candidatePair) d.push(h.candidatePair); else if (h.transportStats) {
                            if ("transport" === h.transportStats.type) {
                                e = h.transportStats.selectedCandidatePairId;
                                continue;
                            }
                            d.push(h.transportStats);
                        } else if (h.localCandidate) {
                            var i = h.localCandidate;
                            if ("relay" == i.candidateType || "relayed" == i.candidateType) {
                                if (!i.mozLocalTransport) {
                                    var j = i.priority >> 24;
                                    i.mozLocalTransport = this.formatRelayType(j);
                                }
                                i.mozLocalTransport = i.mozLocalTransport.toLowerCase();
                            }
                            b.push(i);
                        } else h.remoteCandidate && c.push(h.remoteCandidate);
                    }
                    if (e) for (var k = 0; k < d.length; ++k) d[k].id === e && (d[k].googActiveConnection = "true");
                    return {
                        localCandidates: b,
                        remoteCandidates: c,
                        iceCandidatePairs: d
                    };
                }
            }, {
                key: "getParsedStats",
                value: function(a) {
                    var b = {};
                    if (a.timestamp instanceof Date && (b.timestamp = a.timestamp.getTime().toString()), 
                    a.type && (b.type = a.type), a.names) for (var c = a.names(), d = 0; d < c.length; ++d) b[c[d]] = a.stat(c[d]); else Object.assign(b, a);
                    if (b.values) {
                        for (var e = 0; e < b.values.length; e++) {
                            var f = b.values[e];
                            Object.assign(b, f);
                        }
                        delete b.values;
                    }
                    return b;
                }
            }, {
                key: "statsClassifier",
                value: function(a) {
                    var b = {}, c = function() {
                        for (var b = arguments.length, c = Array(b), d = 0; d < b; d++) c[d] = arguments[d];
                        for (var e = 0; e < c.length; e++) {
                            var f = c[e];
                            if (a.type === f) return !0;
                        }
                        return !1;
                    }, d = c("inbound-rtp", "inboundrtp"), e = "true" === a.isRemote || !0 === a.isRemote;
                    return d || c("outbound-rtp", "outboundrtp") ? (b.tracks = {}, b.tracks.data = a, 
                    b.tracks.ssrc = a.ssrc, b.tracks.streamType = d ? "inbound" : "outbound", b.tracks.reportType = "local", 
                    void 0 !== a.isRemote && (b.tracks.reportType = e ? "remote" : "local")) : c("candidatepair") && a.selected ? b.transportStats = a : c("localcandidate", "local-candidate") ? b.localCandidate = a : c("remotecandidate", "remote-candidate") ? b.remoteCandidate = a : c("transport", "googCandidatePair") ? b.transportStats = a : c("VideoBwe") ? b.bwe = a : c("track") ? b.trackStats = a : c("candidate-pair") ? b.candidatePair = a : c("codec") ? b.codec = a : c("ssrc") && (b.tracks = {}, 
                    b.tracks.data = a, b.tracks.ssrc = a.ssrc, b.tracks.reportType = "local", b.tracks.streamType = a.bytesSent ? "outbound" : "inbound"), 
                    b;
                }
            }, {
                key: "formatRelayType",
                value: function(a) {
                    var b = "none";
                    switch (a) {
                      case 0:
                        b = "tls";
                        break;

                      case 1:
                        b = "tcp";
                        break;

                      case 2:
                        b = "udp";
                    }
                    return b;
                }
            } ]), a;
        }();
        c.StatsAdapter = g;
    }, {
        "./detectbrowser": 11
    } ],
    14: [ function(a, b, c) {
        "use strict";
        function d() {
            return window && window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.getCurrent = d;
    }, {} ],
    15: [ function(a, b, c) {
        function d() {
            throw new Error("setTimeout has not been defined");
        }
        function e() {
            throw new Error("clearTimeout has not been defined");
        }
        function f(a) {
            if (l === setTimeout) return setTimeout(a, 0);
            if ((l === d || !l) && setTimeout) return l = setTimeout, setTimeout(a, 0);
            try {
                return l(a, 0);
            } catch (b) {
                try {
                    return l.call(null, a, 0);
                } catch (b) {
                    return l.call(this, a, 0);
                }
            }
        }
        function g(a) {
            if (m === clearTimeout) return clearTimeout(a);
            if ((m === e || !m) && clearTimeout) return m = clearTimeout, clearTimeout(a);
            try {
                return m(a);
            } catch (b) {
                try {
                    return m.call(null, a);
                } catch (b) {
                    return m.call(this, a);
                }
            }
        }
        function h() {
            q && o && (q = !1, o.length ? p = o.concat(p) : r = -1, p.length && i());
        }
        function i() {
            if (!q) {
                var a = f(h);
                q = !0;
                for (var b = p.length; b; ) {
                    for (o = p, p = []; ++r < b; ) o && o[r].run();
                    r = -1, b = p.length;
                }
                o = null, q = !1, g(a);
            }
        }
        function j(a, b) {
            this.fun = a, this.array = b;
        }
        function k() {}
        var l, m, n = b.exports = {};
        !function() {
            try {
                l = "function" == typeof setTimeout ? setTimeout : d;
            } catch (a) {
                l = d;
            }
            try {
                m = "function" == typeof clearTimeout ? clearTimeout : e;
            } catch (a) {
                m = e;
            }
        }();
        var o, p = [], q = !1, r = -1;
        n.nextTick = function(a) {
            var b = new Array(arguments.length - 1);
            if (arguments.length > 1) for (var c = 1; c < arguments.length; c++) b[c - 1] = arguments[c];
            p.push(new j(a, b)), 1 !== p.length || q || f(i);
        }, j.prototype.run = function() {
            this.fun.apply(null, this.array);
        }, n.title = "browser", n.browser = !0, n.env = {}, n.argv = [], n.version = "", 
        n.versions = {}, n.on = k, n.addListener = k, n.once = k, n.off = k, n.removeListener = k, 
        n.removeAllListeners = k, n.emit = k, n.prependListener = k, n.prependOnceListener = k, 
        n.listeners = function(a) {
            return [];
        }, n.binding = function(a) {
            throw new Error("process.binding is not supported");
        }, n.cwd = function() {
            return "/";
        }, n.chdir = function(a) {
            throw new Error("process.chdir is not supported");
        }, n.umask = function() {
            return 0;
        };
    }, {} ],
    16: [ function(a, b, c) {
        (function(b, d) {
            function e(a, b) {
                this._id = a, this._clearFn = b;
            }
            var f = a("process/browser.js").nextTick, g = Function.prototype.apply, h = Array.prototype.slice, i = {}, j = 0;
            c.setTimeout = function() {
                return new e(g.call(setTimeout, window, arguments), clearTimeout);
            }, c.setInterval = function() {
                return new e(g.call(setInterval, window, arguments), clearInterval);
            }, c.clearTimeout = c.clearInterval = function(a) {
                a.close();
            }, e.prototype.unref = e.prototype.ref = function() {}, e.prototype.close = function() {
                this._clearFn.call(window, this._id);
            }, c.enroll = function(a, b) {
                clearTimeout(a._idleTimeoutId), a._idleTimeout = b;
            }, c.unenroll = function(a) {
                clearTimeout(a._idleTimeoutId), a._idleTimeout = -1;
            }, c._unrefActive = c.active = function(a) {
                clearTimeout(a._idleTimeoutId);
                var b = a._idleTimeout;
                b >= 0 && (a._idleTimeoutId = setTimeout(function() {
                    a._onTimeout && a._onTimeout();
                }, b));
            }, c.setImmediate = "function" == typeof b ? b : function(a) {
                var b = j++, d = !(arguments.length < 2) && h.call(arguments, 1);
                return i[b] = !0, f(function() {
                    i[b] && (d ? a.apply(null, d) : a.call(null), c.clearImmediate(b));
                }), b;
            }, c.clearImmediate = "function" == typeof d ? d : function(a) {
                delete i[a];
            };
        }).call(this, a("timers").setImmediate, a("timers").clearImmediate);
    }, {
        "process/browser.js": 15,
        timers: 16
    } ],
    17: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a() {
                var b = this;
                d(this, a), this.batteryManager = null, "function" == typeof navigator.getBattery && navigator.getBattery().then(function(a) {
                    b.batteryManager = a;
                });
            }
            return e(a, [ {
                key: "getLevel",
                value: function() {
                    return this.batteryManager ? this.batteryManager.level : -1;
                }
            }, {
                key: "getCharging",
                value: function() {
                    return this.batteryManager ? this.batteryManager.charging : null;
                }
            } ]), a;
        }();
        c.Battery = f;
    }, {} ],
    18: [ function(a, b, c) {
        "use strict";
        function d() {
            var a = f.browserName.chrome, b = null, c = null, d = null, e = null, g = f.codeBaseType.chrome;
            if (!window.navigator.userAgent || window.csioReactNative) return window && window.csioGetOsName && (b = window.csioGetOsName()), 
            window && window.csioGetOsVer && (c = window.csioGetOsVer()), window && window.csioReactNative && (d = "react-native"), 
            {
                browserName: a,
                codeBase: g,
                os: b,
                osVersion: c,
                userAgent: d,
                browserVersion: null
            };
            d = navigator.userAgent;
            var h = d.toLowerCase();
            e = navigator.appVersion;
            var i = void 0, j = void 0;
            e && (i = e.toLowerCase(), j = "" + parseFloat(i));
            var k = void 0;
            -1 !== (k = h.indexOf("opera")) ? (a = f.browserName.opera, j = h.substring(k + 6), 
            -1 !== (k = h.indexOf("Version")) && (j = h.substring(k + 8)), g = f.codeBaseType.chrome) : -1 !== (k = h.indexOf("opr")) ? (a = f.browserName.opera, 
            j = h.substring(k + 4), -1 !== (k = h.indexOf("Version")) && (j = h.substring(k + 8)), 
            g = f.codeBaseType.chrome) : -1 !== (k = h.indexOf("msie")) ? (a = f.browserName.msie, 
            j = h.substring(k + 5), g = f.codeBaseType.chrome) : -1 !== (k = h.indexOf("edge")) ? (a = f.browserName.edge, 
            j = h.substring(k + 5), g = f.codeBaseType.edge) : -1 !== (k = h.indexOf("chrome")) ? (a = f.browserName.chrome, 
            j = h.substring(k + 7), g = f.codeBaseType.chrome) : -1 !== (k = h.indexOf("safari")) ? (a = f.browserName.safari, 
            j = h.substring(k + 7), -1 !== (k = h.indexOf("Version")) && (j = h.substring(k + 8)), 
            g = f.codeBaseType.chrome) : -1 !== (k = h.indexOf("firefox")) ? (a = f.browserName.firefox, 
            j = h.substring(k + 8), g = f.codeBaseType.firefox) : -1 !== (k = h.indexOf("trident")) && (a = f.browserName.msie, 
            k = h.indexOf("rv"), j = h.substring(k + 3, k + 7), g = f.codeBaseType.chrome);
            var l = [ {
                s: "Windows 3.11",
                r: /win16/
            }, {
                s: "Windows 95",
                r: /(windows 95|win95|windows_95)/
            }, {
                s: "Windows ME",
                r: /(win 9x 4.90|windows me)/
            }, {
                s: "Windows 98",
                r: /(windows 98|win98)/
            }, {
                s: "Windows CE",
                r: /windows ce/
            }, {
                s: "Windows 2000",
                r: /(windows nt 5.0|windows 2000)/
            }, {
                s: "Windows XP",
                r: /(windows nt 5.1|windows xp)/
            }, {
                s: "Windows Server 2003",
                r: /windows nt 5.2/
            }, {
                s: "Windows Vista",
                r: /windows nt 6.0/
            }, {
                s: "Windows 7",
                r: /(windows 7|windows nt 6.1)/
            }, {
                s: "Windows 8.1",
                r: /(windows 8.1|windows nt 6.3)/
            }, {
                s: "Windows 8",
                r: /(windows 8|windows nt 6.2)/
            }, {
                s: "Windows 10",
                r: /(windows 10|windows nt 10.0)/
            }, {
                s: "Windows NT 4.0",
                r: /(windows nt 4.0|winnt4.0|winnt|windows nt)/
            }, {
                s: "Windows ME",
                r: /windows me/
            }, {
                s: "Android",
                r: /android/
            }, {
                s: "Open BSD",
                r: /openbsd/
            }, {
                s: "Sun OS",
                r: /sunos/
            }, {
                s: "Linux",
                r: /(linux|x11)/
            }, {
                s: "iOS",
                r: /(iphone|ipad|ipod)/
            }, {
                s: "Mac OS X",
                r: /mac os x/
            }, {
                s: "Mac OS",
                r: /(macppc|macintel|mac_powerpc|macintosh)/
            }, {
                s: "QNX",
                r: /qnx/
            }, {
                s: "UNIX",
                r: /unix/
            }, {
                s: "BeOS",
                r: /beos/
            }, {
                s: "OS/2",
                r: /os\/2/
            }, {
                s: "Search Bot",
                r: /(nuhk|googlebot|yammybot|openbot|slurp|msnbot|ask jeeves\/teoma|ia_archiver)/
            } ], m = void 0, n = void 0;
            for (m in l) if (l.hasOwnProperty(m) && (n = l[m], n.r.test(h))) {
                b = n.s;
                break;
            }
            switch (b && /Windows/.test(b) && (c = /Windows (.*)/.exec(b)[1], b = f.osName.windows), 
            b) {
              case f.osName.mac:
                c = /mac os x (10[\.\_\d]+)/.exec(h)[1];
                break;

              case f.osName.android:
                c = /android ([\.\_\d]+)/.exec(h)[1];
                break;

              case f.osName.ios:
                if (!i) break;
                if (!(c = /os (\d+)_(\d+)_?(\d+)?/.exec(i))) break;
                c = c[1] + "." + c[2] + "." + (0 | c[3]);
            }
            return {
                browserName: a,
                browserVersion: j.toString(),
                os: b,
                osVersion: c,
                codeBase: g,
                userAgent: d
            };
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.detect = d;
        var e = a("../config/constants"), f = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(e);
    }, {
        "../config/constants": 33
    } ],
    19: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Devices = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../config/constants"), h = d(g), i = a("../utility/registry"), j = a("../utility/csiologger"), k = d(j), l = a("../utility/utils"), m = d(l), n = function() {
            function a(b, c) {
                e(this, a), this.conferenceId = b, this.pc = c, this.devices = null, this.emb = i.Registry.getEventMessageBuilder();
            }
            return f(a, [ {
                key: "collectConnected",
                value: function() {
                    var a = this;
                    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                        var b = this;
                        navigator.mediaDevices.enumerateDevices().then(function(c) {
                            var d = m.normalizeMediaDeviceList(c);
                            b.sendConnected(d), setTimeout(a.collectConnected.bind(b), 1e4);
                        }).catch(function(c) {
                            setTimeout(a.collectConnected.bind(b), 1e4);
                        });
                    }
                }
            }, {
                key: "sendConnected",
                value: function(a) {
                    this.devices ? this.compare(a) || (this.devices = a, this.send()) : (this.devices = a, 
                    this.send());
                }
            }, {
                key: "compare",
                value: function(a) {
                    return self.devices.sort().toString() === a.sort().toString();
                }
            }, {
                key: "send",
                value: function() {
                    var a = {
                        mediaDeviceList: this.devices
                    };
                    k.log("sending connectedDevice", h.internalFabricEvent.connectedDeviceList, a), 
                    this.emb.make(h.internalFabricEvent.connectedDeviceList, this.conferenceId, this.pc, a);
                }
            } ]), a;
        }();
        c.Devices = n;
    }, {
        "../config/constants": 33,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "../utility/utils": 101
    } ],
    20: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (b) try {
                window && window.localStorage && window.localStorage.setItem(a, b);
            } catch (a) {
                return;
            }
        }
        function e(a) {
            try {
                if (window && window.localStorage) return window.localStorage.getItem(a);
            } catch (a) {
                return null;
            }
            return null;
        }
        function f(a) {
            try {
                window && window.localStorage && window.localStorage.removeItem(a);
            } catch (a) {
                return;
            }
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.store = d, c.get = e, c.remove = f;
    }, {} ],
    21: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (b) try {
                window && window.sessionStorage && window.sessionStorage.setItem(a, b);
            } catch (a) {
                return;
            }
        }
        function e(a) {
            try {
                if (window && window.sessionStorage) return window.sessionStorage.getItem(a);
            } catch (a) {
                return null;
            }
            return null;
        }
        function f(a) {
            try {
                window && window.sessionStorage && window.sessionStorage.removeItem(a);
            } catch (a) {
                return;
            }
        }
        function g(a, b) {
            if (a) {
                var c = JSON.parse(e("csio_ucid_data"));
                c || (c = {}), c[a] || (c[a] = {}), c[a].ucID = b, d("csio_ucid_data", JSON.stringify(c));
            }
        }
        function h(a) {
            if (!a) return null;
            var b = JSON.parse(e("csio_ucid_data"));
            return b && b[a] ? b[a].ucID : null;
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.store = d, c.get = e, c.remove = f, c.storeUcId = g, c.getUcId = h;
    }, {} ],
    22: [ function(a, b, c) {
        (function(c) {
            "use strict";
            function d(a) {
                if (a && a.__esModule) return a;
                var b = {};
                if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
                return b.default = a, b;
            }
            function e(a, b) {
                if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
            }
            function f(a, b) {
                var c = {};
                return c.status = a, b && (c.message = b), c;
            }
            function g(a, b) {
                return a + ": " + b + " " + (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "");
            }
            function h() {
                var a = null, b = r.Registry.getEndpoint().getBrowserName();
                return "Firefox" === b ? a = mozRTCPeerConnection : "Chrome" === b || "Opera" === b ? a = webkitRTCPeerConnection : "Safari" === b ? t.log("Browser type Safari") : "Edge" === b && (a = window.RTCPeerConnection), 
                a;
            }
            function i(a) {
                if (null === a) return !1;
                var b = r.Registry.getEndpoint().getCodeBase();
                if (b === m.codeBaseType.firefox) return "undefined" != typeof mozRTCPeerConnection && a instanceof mozRTCPeerConnection || "undefined" != typeof RTCPeerConnection && a instanceof RTCPeerConnection;
                if (b === m.codeBaseType.edge || "function" == typeof a) return !0;
                var c = h();
                return null !== c && a instanceof c || void 0 !== a.createOffer;
            }
            var j = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
                return typeof a;
            } : function(a) {
                return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a;
            }, k = function() {
                function a(a, b) {
                    for (var c = 0; c < b.length; c++) {
                        var d = b[c];
                        d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                        Object.defineProperty(a, d.key, d);
                    }
                }
                return function(b, c, d) {
                    return c && a(b.prototype, c), d && a(b, d), b;
                };
            }(), l = a("./config/constants"), m = d(l), n = a("./config/settings"), o = d(n), p = a("./config/callstatserrors"), q = a("./fsm/mainfsm"), r = a("./utility/registry"), s = a("./utility/csiologger"), t = d(s), u = a("./utility/onerroreventlistner"), v = d(u), w = a("./utility/utils"), x = d(w);
            v.setErrorEventListener(), x.assignPollyfill(), x.isIntegerPollyfill();
            var y = null, z = function() {
                function a() {
                    e(this, a), y = new q.MainFSM();
                }
                return k(a, [ {
                    key: "initialize",
                    value: function(a, b, c, d, e, h) {
                        if (!a || !c || !b) {
                            var i = g("initialize", p.csErrorStrings.argumentError);
                            return t.error(i), f(m.callstatsAPIReturnStatus.failure, i);
                        }
                        if (d && "function" != typeof d) {
                            var j = g("initialize", p.csErrorStrings.argumentError);
                            t.warn(j), d = null;
                        }
                        if (e && "function" != typeof e) {
                            var k = g("initialize", p.csErrorStrings.argumentError);
                            t.warn(k), e = null;
                        }
                        if ("function" != typeof b && !(window.crypto && (window.crypto.subtle || window.crypto.webkitSubtle) || window.msCrypto && window.msCrypto.subtle || window.csioReactNative)) {
                            var l = g("initialize", p.csErrorStrings.cryptoError);
                            return t.error(l), d && d(p.csError.tokenGenerationError, p.csErrorStrings.cryptoError), 
                            f(m.callstatsAPIReturnStatus.failure, l);
                        }
                        try {
                            y.fire(q.MainEvents.onInitialize, a, c, b, d, e, h), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "initialize: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("initialize: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "addNewFabric",
                    value: function(a, b, c, d, e, h) {
                        var j = null, k = m.endpointType.peer, l = m.transmissionDirection.sendrecv;
                        if (void 0 === b) {
                            var n = g("addNewFabric", p.csErrorStrings.argumentError);
                            return t.error(n), f(m.callstatsAPIReturnStatus.failure, n);
                        }
                        if (void 0 === d) {
                            var o = g("addNewFabric", p.csErrorStrings.argumentError);
                            return t.error(o), f(m.callstatsAPIReturnStatus.failure, o);
                        }
                        if (d || (d = m.tmpConferenceId), !a || !c) {
                            var s = g("addNewFabric", p.csErrorStrings.argumentError);
                            return t.error(s), f(m.callstatsAPIReturnStatus.failure, s);
                        }
                        if (h && "function" == typeof h && (j = h), e && "function" == typeof e && (j = e), 
                        e && "function" != typeof e) {
                            if (e.remoteEndpointType) {
                                if (!m.endpointType.hasOwnProperty(e.remoteEndpointType)) {
                                    var u = g("addNewFabric", p.csErrorStrings.invalidEndPointType, e.remoteEndpointType);
                                    return t.error(u), f(m.callstatsAPIReturnStatus.failure, u);
                                }
                                k = e.remoteEndpointType;
                            }
                            if (e.fabricTransmissionDirection) {
                                if (!m.transmissionDirection.hasOwnProperty(e.fabricTransmissionDirection)) {
                                    var v = g("addNewFabric", p.csErrorStrings.invalidTransmissionDirection, e.fabricTransmissionDirection);
                                    return t.error(v), f(m.callstatsAPIReturnStatus.failure, v);
                                }
                                l = e.fabricTransmissionDirection;
                            }
                        }
                        if (!m.fabricUsage.hasOwnProperty(c) || c instanceof Function) {
                            var w = g("addNewFabric", p.csErrorStrings.fabricUsageInvalid, c);
                            return t.error(w), f(m.callstatsAPIReturnStatus.failure, w);
                        }
                        if (!i(a)) {
                            var x = g("addNewFabric", p.csErrorStrings.pcInvalid);
                            return t.error(x), f(m.callstatsAPIReturnStatus.failure, x);
                        }
                        var z = r.Registry.getConferenceManager().get(d);
                        if (z) {
                            if (z.getPeerConnectionManager().getPcHandler(a)) return f(m.callstatsAPIReturnStatus.success);
                        }
                        if (!r.Registry.getCredentials().getAppId() || !r.Registry.getCredentials().getUserId()) {
                            var A = g("addNewFabric", p.csErrorStrings.notInitialized);
                            return t.error(A), f(m.callstatsAPIReturnStatus.failure, A);
                        }
                        try {
                            y.fire(q.MainEvents.onAddNewFabric, a, b, c, d, k, l, j), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "addNewFabric: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("addNewFabric: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "sendFabricEvent",
                    value: function(a, b, c, d) {
                        if (t.log("sendFabricEvent ", b), c || (c = m.tmpConferenceId), !a || !b) {
                            var e = g("sendFabricEvent", p.csErrorStrings.argumentError);
                            return t.error(e), f(m.callstatsAPIReturnStatus.failure, e);
                        }
                        if (b === m.fabricEvent.fabricSetupFailed) {
                            var h = g("sendFabricEvent", p.csErrorStrings.fabricEventUnsupported, b);
                            return t.error(h), f(m.callstatsAPIReturnStatus.failure, h);
                        }
                        if (!m.fabricEvent.hasOwnProperty(b) && !m.internalFabricEvent.hasOwnProperty(b)) {
                            var i = g("sendFabricEvent", p.csErrorStrings.fabricEventInvalid, b);
                            return t.error(i), f(m.callstatsAPIReturnStatus.failure, i);
                        }
                        if (!(b !== m.fabricEvent.activeDeviceList || d && d.deviceList)) {
                            var j = g("sendFabricEvent ", p.csErrorStrings.argumentError);
                            return t.error(j), f(m.callstatsAPIReturnStatus.failure, j);
                        }
                        var k = r.Registry.getConferenceManager().get(c);
                        if (!r.Registry.getCredentials().getAppId() || !r.Registry.getCredentials().getUserId() || !k) {
                            var l = g("sendFabricEvent ", p.csErrorStrings.notInitialized);
                            return t.error(l), f(m.callstatsAPIReturnStatus.failure, l);
                        }
                        if (!k.getPeerConnectionManager().getPcHandler(a)) {
                            var n = g("sendFabricEvent ", p.csErrorStrings.pcInvalid);
                            return t.error(n), f(m.callstatsAPIReturnStatus.failure, n);
                        }
                        try {
                            y.fire(q.MainEvents.onSendFabricEvent, a, b, c, d), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "sendFabricEvent: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("sendFabricEvent: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "sendUserFeedback",
                    value: function(a, b, c) {
                        if (!b || !a) {
                            var d = g("sendUserFeedback", p.csErrorStrings.argumentError);
                            return t.error(d), f(m.callstatsAPIReturnStatus.failure, d);
                        }
                        if ("object" !== (void 0 === b ? "undefined" : j(b))) {
                            var e = g("sendUserFeedback", p.csErrorStrings.argumentError);
                            return t.error(e), f(m.callstatsAPIReturnStatus.failure, e);
                        }
                        if (0 === Object.keys(b).length) {
                            var h = g("sendUserFeedback", p.csErrorStrings.argumentError);
                            return t.error(h), f(m.callstatsAPIReturnStatus.failure, h);
                        }
                        try {
                            y.fire(q.MainEvents.onSendUserFeedback, a, b, c), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "sendUserFeedback: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("sendUserFeedback: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "associateMstWithUserID",
                    value: function(a, b, c, d, e, h) {
                        if (c || (c = m.tmpConferenceId), !a || !d || !e) {
                            var j = g("associateMstWithUserID", p.csErrorStrings.argumentError);
                            return t.error(j), f(m.callstatsAPIReturnStatus.failure, j);
                        }
                        if (!i(a)) {
                            var k = g("associateMstWithUserID", p.csErrorStrings.pcInvalid);
                            return t.error(k), f(m.callstatsAPIReturnStatus.failure, k);
                        }
                        var l = r.Registry.getConferenceManager().get(c);
                        if (!l) {
                            var n = g("associateMstWithUserID", p.csErrorStrings.confereneDoesNotExist);
                            return t.error(n), f(m.callstatsAPIReturnStatus.failure, n);
                        }
                        if (!l.getPeerConnectionManager().getPcHandler(a)) {
                            var o = g("associateMstWithUserID", p.csErrorStrings.pcInvalid);
                            return t.error(o), f(m.callstatsAPIReturnStatus.failure, o);
                        }
                        h && "string" != typeof h && (t.error("associateMstWithUserID: Invalid videoTag"), 
                        h = null);
                        try {
                            y.fire(q.MainEvents.onAssociateMstWithUserID, a, b, c, d, e, h), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "associateMstWithUserID: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("associateMstWithUserID: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "reportError",
                    value: function(a, b, c, d, e, h) {
                        if (b || (b = m.tmpConferenceId), void 0 === a || !c) {
                            var i = g("reportError", p.csErrorStrings.argumentError);
                            return t.error(i), f(m.callstatsAPIReturnStatus.failure, i);
                        }
                        if (!m.webRTCFunctions.hasOwnProperty(c)) {
                            var j = g("reportError", p.csErrorStrings.webRTCFunctionsInvalid, c);
                            return t.error(j), f(m.callstatsAPIReturnStatus.failure, j);
                        }
                        if (void 0 === d && t.warn("reportError: Missing DOM error parameter"), !r.Registry.getCredentials().getAppId() || !r.Registry.getCredentials().getUserId()) {
                            var k = g("reportError", p.csErrorStrings.notInitialized);
                            return t.error(k), f(m.callstatsAPIReturnStatus.failure, k);
                        }
                        try {
                            y.fire(q.MainEvents.onReportError, a, b, c, d, e, h), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "reportError: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("reportError: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "setProxyConfig",
                    value: function(a) {
                        if (window && !window.csioproxy) {
                            var b = g("setProxyConfig", p.csErrorStrings.setProxyConfigInvokeError);
                            return t.error(b), f(m.callstatsAPIReturnStatus.failure, b);
                        }
                        if (!a) {
                            var c = g("setProxyConfig", p.csErrorStrings.argumentError);
                            return t.error(c), f(m.callstatsAPIReturnStatus.failure, c);
                        }
                        try {
                            y.fire(q.MainEvents.onSetProxyConfig, a), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "setProxyConfig: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("setProxyConfig: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "attachWifiStatsHandler",
                    value: function(a) {
                        if (!a) {
                            var b = g("attachWifiStatsHandler", p.csErrorStrings.argumentError);
                            return t.error(b), f(m.callstatsAPIReturnStatus.failure, b);
                        }
                        if ("function" != typeof a) {
                            var c = g("attachWifiStatsHandler", p.csErrorStrings.argumentError);
                            return t.error(c), f(m.callstatsAPIReturnStatus.failure, c);
                        }
                        try {
                            y.fire(q.MainEvents.onAttachWifiStatsHandler, a), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "attachWifiStatsHandler: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("attachWifiStatsHandler: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "setIdentifiers",
                    value: function(a, b) {
                        if (!a) {
                            var c = g("setIdentifiers", p.csErrorStrings.argumentError);
                            return t.error(c), f(m.callstatsAPIReturnStatus.failure, c);
                        }
                        try {
                            y.fire(q.MainEvents.onSetIdentifiers, a, b), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "setIdentifiers: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("setIdentifiers: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "makePrecallTest",
                    value: function(a, b) {
                        if (!r.Registry.getAuthenticator().getToken() || !r.Registry.getCredentials().getAppId()) {
                            var c = g("makePrecallTest", p.csErrorStrings.notInitialized);
                            return t.error(c), f(m.callstatsAPIReturnStatus.failure, c);
                        }
                        if (!r.Registry.getAuthenticator().getIceServers()) {
                            var d = g("makePrecallTest", p.csErrorStrings.notInitialized);
                            return t.error(d), f(m.callstatsAPIReturnStatus.failure, d);
                        }
                        if (!r.Registry.getCredentials().getCollectSDP()) {
                            var e = g("makePrecallTest", p.csErrorStrings.apiaccesserror);
                            return t.error(e), f(m.callstatsAPIReturnStatus.failure, e);
                        }
                        try {
                            y.fire(q.MainEvents.onMakePrecallTest, a, b), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "on: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("makePrecallTest: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "on",
                    value: function(a, b) {
                        if (!b || "function" != typeof b) {
                            var c = g("on", p.csErrorStrings.argumentError);
                            return t.error(c), f(m.callstatsAPIReturnStatus.failure, c);
                        }
                        if (!a || !m.callbackFunctions.hasOwnProperty(a)) {
                            var d = g("on", p.csErrorStrings.argumentError);
                            return t.error(d), f(m.callstatsAPIReturnStatus.failure, d);
                        }
                        try {
                            y.fire(q.MainEvents.onOn, a, b), y.run();
                        } catch (a) {
                            r.Registry.getGenericEventHandler().sendEvent(m.logEvents.error, {
                                msg: "on: Error",
                                error: a.message + ":" + a.stack
                            }), t.error("on: Error", a);
                        }
                        return f(m.callstatsAPIReturnStatus.success);
                    }
                }, {
                    key: "fabricUsage",
                    get: function() {
                        return this.constructor.fabricUsage;
                    }
                }, {
                    key: "fabricEvent",
                    get: function() {
                        return this.constructor.fabricEvent;
                    }
                }, {
                    key: "webRTCFunctions",
                    get: function() {
                        return this.constructor.webRTCFunctions;
                    }
                }, {
                    key: "csError",
                    get: function() {
                        return this.constructor.csError;
                    }
                }, {
                    key: "qualityRating",
                    get: function() {
                        return this.constructor.qualityRating;
                    }
                }, {
                    key: "callStatsAPIReturnStatus",
                    get: function() {
                        return this.constructor.callStatsAPIReturnStatus;
                    }
                }, {
                    key: "version",
                    get: function() {
                        return this.constructor.version;
                    }
                }, {
                    key: "userIDType",
                    get: function() {
                        return this.constructor.userIDType;
                    }
                }, {
                    key: "transmissionDirection",
                    get: function() {
                        return this.constructor.transmissionDirection;
                    }
                }, {
                    key: "endpointType",
                    get: function() {
                        return this.constructor.endpointType;
                    }
                } ]), a;
            }();
            z.fabricUsage = m.fabricUsage, z.fabricEvent = m.fabricEvent, z.webRTCFunctions = m.webRTCFunctions, 
            z.csError = p.csError, z.qualityRating = m.qualityRating, z.callStatsAPIReturnStatus = m.callstatsAPIReturnStatus, 
            z.version = o.version, z.userIDType = m.userIdType, z.endpointType = m.endpointType, 
            z.transmissionDirection = m.transmissionDirection, function() {
                function a() {
                    return new z();
                }
                "function" == typeof define && define.amd ? define("callstats", [], a) : c.callstats = a, 
                b.exports = a;
            }("undefined" != typeof window && window);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
    }, {
        "./config/callstatserrors": 32,
        "./config/constants": 33,
        "./config/settings": 34,
        "./fsm/mainfsm": 35,
        "./utility/csiologger": 88,
        "./utility/onerroreventlistner": 94,
        "./utility/registry": 95,
        "./utility/utils": 101
    } ],
    23: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (Array.isArray(a)) {
                for (var b = 0, c = Array(a.length); b < a.length; b++) c[b] = a[b];
                return c;
            }
            return Array.from(a);
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.BinaryTree = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("./binarytreenode.js"), h = a("../utility/csiologger"), i = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(h), j = function() {
            function a(b) {
                e(this, a), this.root = null, this.top = null, this.bottom = null, this.comparator = b, 
                this.node_counter = 0, this.duplicate_counter = 0;
            }
            return f(a, [ {
                key: "getTopNode",
                value: function() {
                    return this.top;
                }
            }, {
                key: "getTopValue",
                value: function() {
                    return null === this.top ? null : this.top.peek();
                }
            }, {
                key: "getBottomValue",
                value: function() {
                    return null === this.bottom ? null : this.bottom.peek();
                }
            }, {
                key: "getBottomNode",
                value: function() {
                    return this.bottom;
                }
            }, {
                key: "getDuplicatedCounter",
                value: function() {
                    return this.duplicate_counter;
                }
            }, {
                key: "getNodeCounter",
                value: function() {
                    return this.node_counter;
                }
            }, {
                key: "getSize",
                value: function() {
                    return this.duplicate_counter + this.node_counter;
                }
            }, {
                key: "insertNodeAtTop",
                value: function(a) {
                    a && this.inserting(a.getValues(), this.top);
                }
            }, {
                key: "insertNodeAtBottom",
                value: function(a) {
                    a && this.inserting(a.getValues(), this.bottom);
                }
            }, {
                key: "insert",
                value: function(a) {
                    this.inserting([ a ], this.root);
                }
            }, {
                key: "createNode",
                value: function(a) {
                    var b = new (Function.prototype.bind.apply(g.BinaryTreeNode, [ null ].concat(d(a))))();
                    return null === this.top ? this.top = b : this.comparator(this.top.peek(), b.peek()) < 0 && (this.top = b), 
                    null === this.bottom ? this.bottom = b : this.comparator(b.peek(), this.bottom.peek()) < 0 && (this.bottom = b), 
                    b;
                }
            }, {
                key: "inserting",
                value: function(a, b) {
                    if (null === this.root) return this.root = this.createNode(a), this.node_counter = 1, 
                    void (this.duplicate_counter += a.length - 1);
                    for (var c = null, d = b, e = 0; null !== d; ) {
                        if (0 === (e = this.comparator(a[0], d.peek()))) return d.concat(a), this.duplicate_counter += a.length, 
                        void d.find(a[0]);
                        c = d, d = e < 0 ? d.getLeft() : d.getRight();
                    }
                    ++this.node_counter, this.duplicate_counter += a.length - 1, d = this.createNode(a), 
                    e < 0 ? c.setLeft(d) : c.setRight(d);
                }
            }, {
                key: "getRightist",
                value: function(a) {
                    for (var b = null; null !== a.right; ) b = a, a = a.right;
                    return [ a, b ];
                }
            }, {
                key: "getLeftist",
                value: function(a) {
                    for (var b = null; null !== a.getLeft(); ) b = a, a = a.getLeft();
                    return [ a, b ];
                }
            }, {
                key: "popBottomNode",
                value: function() {
                    if (null === this.bottom) return null;
                    var a = this.search(this.bottom.peek()), b = a[0], c = a[1];
                    return null === b ? null : (this.replaceNode(b, c, b.getRight()), this.disposeNode(b), 
                    --this.node_counter, this.duplicate_counter -= b.getLength() - 1, b.setRight(null), 
                    b);
                }
            }, {
                key: "popTopNode",
                value: function() {
                    if (null === this.top) return null;
                    var a = this.search(this.top.peek()), b = a[0], c = a[1];
                    return null === b ? null : (this.replaceNode(b, c, b.getLeft()), this.disposeNode(b), 
                    --this.node_counter, this.duplicate_counter -= b.getLength() - 1, b.setLeft(null), 
                    b);
                }
            }, {
                key: "search",
                value: function(a) {
                    for (var b = this.root, c = null, d = void 0; null !== b; ) {
                        if (0 === (d = this.comparator(a, b.peek()))) return b.find(a) ? [ b, c ] : [ null, null ];
                        c = b, b = d < 0 ? b.getLeft() : b.getRight();
                    }
                    return [ null, null ];
                }
            }, {
                key: "replaceNode",
                value: function(a, b, c) {
                    null !== b ? b.left === a ? b.left = c : b.right = c : this.root = c;
                }
            }, {
                key: "disposeNode",
                value: function(a) {
                    if (null !== a) {
                        if (null === this.root) return void (this.bottom = this.top = null);
                        if (0 === this.comparator(this.top.peek(), a.peek())) {
                            var b = this.getRightist(this.root);
                            this.top = b[0];
                        }
                        if (0 === this.comparator(this.bottom.peek(), a.peek())) {
                            var c = this.getLeftist(this.root);
                            this.bottom = c[0];
                        }
                    }
                }
            }, {
                key: "delete",
                value: function(a) {
                    var b = this.search(a), c = b[0], d = b[1];
                    if (null === c) return !1;
                    if (1 < c.getLength()) return c.remove(a), --this.duplicate_counter, !0;
                    if (--this.node_counter, null === c.getLeft() && null === c.getRight()) this.replaceNode(c, d, null); else if (null === c.getLeft()) this.replaceNode(c, d, c.getRight()); else if (null === c.getRight()) this.replaceNode(c, d, c.getLeft()); else {
                        for (var e = c.getLeft(), f = c; null !== e.getRight(); f = e, e = e.getRight()) ;
                        var g = e.getLeft();
                        f === c ? f.setLeft(g) : f.setRight(g), c.setValues(e.getValues());
                    }
                    return this.disposeNode(c), !0;
                }
            }, {
                key: "logging",
                value: function() {
                    if (null === this.root) return void i.log("This tree is empty Duplicate Counter: " + this.duplicate_counter);
                    i.log("Size of the tree: " + this.getSize() + " Node: " + this.getNodeCounter() + " Duplicates: " + this.getDuplicatedCounter() + " Top: " + this.getTopNode().toString() + " Bottom: " + this.getBottomNode().toString()), 
                    function a(b, c, d) {
                        if (null !== b) {
                            for (var e = "-", f = 0; f < c; ++f) e += "--";
                            i.log(e + "> (" + d + ") [" + b.toString() + "]"), null !== b.getLeft() && a(b.getLeft(), c + 1, "Left"), 
                            null !== b.getRight() && a(b.getRight(), c + 1, "Right");
                        }
                    }(this.root, 0, "Root");
                }
            } ]), a;
        }();
        c.BinaryTree = j;
    }, {
        "../utility/csiologger": 88,
        "./binarytreenode.js": 24
    } ],
    24: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a() {
                d(this, a);
                for (var b = arguments.length, c = Array(b), e = 0; e < b; e++) c[e] = arguments[e];
                this.values = c, this.left = null, this.right = null;
            }
            return e(a, [ {
                key: "getRight",
                value: function() {
                    return this.right;
                }
            }, {
                key: "setRight",
                value: function(a) {
                    this.right = a;
                }
            }, {
                key: "getLeft",
                value: function() {
                    return this.left;
                }
            }, {
                key: "setLeft",
                value: function(a) {
                    this.left = a;
                }
            }, {
                key: "push",
                value: function(a) {
                    this.values.push(a);
                }
            }, {
                key: "concat",
                value: function(a) {
                    this.values = this.values.concat(a);
                }
            }, {
                key: "pop",
                value: function() {
                    return this.values.length < 1 ? null : this.values.shift();
                }
            }, {
                key: "remove",
                value: function(a) {
                    this.values.splice(this.values.indexOf(a), 1);
                }
            }, {
                key: "setValues",
                value: function(a) {
                    this.values = a;
                }
            }, {
                key: "getValues",
                value: function() {
                    return this.values;
                }
            }, {
                key: "hasValue",
                value: function() {
                    return 0 < this.values.length;
                }
            }, {
                key: "getLength",
                value: function() {
                    return this.values.length;
                }
            }, {
                key: "peek",
                value: function() {
                    return this.values.length < 1 ? null : this.values[0];
                }
            }, {
                key: "find",
                value: function(a) {
                    return this.values.find(function(b) {
                        return b === a;
                    });
                }
            }, {
                key: "toString",
                value: function() {
                    return this.values.toString();
                }
            } ]), a;
        }();
        c.BinaryTreeNode = f;
    }, {} ],
    25: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Cache = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("../utility/csiologger"), g = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(f), h = function() {
            function a() {
                d(this, a), this.queue = [], this.priority = [];
            }
            return e(a, [ {
                key: "add",
                value: function(a) {
                    var b = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                    if (this.length() > 1e6) return void g.error("Maximum cached items reached, dropping.");
                    b ? this.priority.push(a) : this.queue.push(a);
                }
            }, {
                key: "pop",
                value: function() {
                    return this.priority.length > 0 ? this.priority.shift() : this.queue.shift();
                }
            }, {
                key: "peak",
                value: function() {
                    return this.priority.length > 0 ? this.priority[0] : this.queue.length > 0 ? this.queue[0] : null;
                }
            }, {
                key: "length",
                value: function() {
                    return this.queue.length + this.priority.length;
                }
            }, {
                key: "updateConferenceId",
                value: function(a) {
                    for (var b = 0; b < this.queue.length; ++b) {
                        this.queue[b].updateConferenceId(a);
                    }
                    for (var c = 0; c < this.priority.length; ++c) {
                        this.priority[c].updateConferenceId(a);
                    }
                }
            } ]), a;
        }();
        c.Cache = h;
    }, {
        "../utility/csiologger": 88
    } ],
    26: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Component = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./port"), g = a("../utility/csiologger"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = function() {
            function a() {
                var b = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "Unknown";
                d(this, a), this.name = b, this.ports = new Map();
            }
            return e(a, [ {
                key: "bindPort",
                value: function(a, b) {
                    var c = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : this;
                    if (this.ports.has(a)) return void h.warn("Port (" + a + ") for " + this.name + " already exists.");
                    this.ports.set(a, new f.Port(b, c));
                }
            }, {
                key: "declarePort",
                value: function(a) {
                    if (this.ports.has(a)) return void h.warn("Port (" + a + ") for " + this.name + " already exists.");
                    this.ports.set(a, null);
                }
            }, {
                key: "getPort",
                value: function(a) {
                    return this.ports.get(a);
                }
            }, {
                key: "isConnected",
                value: function(a) {
                    return !!this.ports.has(a) && null !== this.ports.get(a);
                }
            }, {
                key: "connect",
                value: function(a, b) {
                    if (!this.ports.has(a)) return void h.warn("Port (" + a + ") for " + this.name + " does not exists.");
                    this.ports.set(a, b);
                }
            }, {
                key: "transmit",
                value: function(a) {
                    var b = this.ports.get(a);
                    if (void 0 === b) return void h.warn("Port (" + a + ") for " + this.name + " does not exists.");
                    if (null === b) return void h.warn("Port (" + a + ") for " + this.name + " is not connected.");
                    for (var c = arguments.length, d = Array(c > 1 ? c - 1 : 0), e = 1; e < c; e++) d[e - 1] = arguments[e];
                    b.transmit(d);
                }
            }, {
                key: "request",
                value: function(a) {
                    var b = this.ports.get(a);
                    if (void 0 === b) return h.warn("Port (" + a + ") for " + this.name + " does not exists."), 
                    null;
                    if (null === b) return h.warn("Port (" + a + ") for " + this.name + " is not connected."), 
                    null;
                    for (var c = arguments.length, d = Array(c > 1 ? c - 1 : 0), e = 1; e < c; e++) d[e - 1] = arguments[e];
                    return b.request(d);
                }
            } ]), a;
        }();
        c.Component = i;
    }, {
        "../utility/csiologger": 88,
        "./port": 27
    } ],
    27: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a(b) {
                var c = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
                d(this, a), this.target = b, this.object = c;
            }
            return e(a, [ {
                key: "transmit",
                value: function(a) {
                    this.target.apply(this.object, a);
                }
            }, {
                key: "request",
                value: function(a) {
                    return this.target.apply(this.object, a);
                }
            } ]), a;
        }();
        c.Port = f;
    }, {} ],
    28: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.SlidingWindow = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./switem"), g = a("../utility/timestamps"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = function() {
            function a(b, c) {
                d(this, a), this.items = [], this.plugins = [], this.postProcesses = [], this.preProcesses = [], 
                this.timeoutInMs = c, this.maxItemsNum = b, this.minItemsNum = 0;
            }
            return e(a, [ {
                key: "setMaxItemsNum",
                value: function(a) {
                    this.maxItemsNum = a;
                }
            }, {
                key: "setTimeoutInMs",
                value: function(a) {
                    this.timeoutInMs = a;
                }
            }, {
                key: "setMinItemsNum",
                value: function(a) {
                    this.minItemsNum = a;
                }
            }, {
                key: "refresh",
                value: function() {
                    var a = h.getCurrent();
                    if (!(this.items.length <= this.minItemsNum)) {
                        for (;0 < this.maxItemsNum && this.maxItemsNum <= this.items.length; ) this.remove();
                        this.timeoutInMs && this.timeoutInMs < a - this.items[0].getCreated() && (this.remove(), 
                        this.refresh());
                    }
                }
            }, {
                key: "getLength",
                value: function() {
                    return this.items.length;
                }
            }, {
                key: "add",
                value: function(a) {
                    this.refresh(), this.items.push(new f.SWItem(a));
                    for (var b = 0; b < this.preProcesses.length; b++) {
                        (0, this.preProcesses[b])(a);
                    }
                    for (var c = 0; c < this.plugins.length; c++) {
                        this.plugins[c].add(a);
                    }
                    for (var d = 0; d < this.postProcesses.length; d++) {
                        (0, this.postProcesses[d])(a);
                    }
                }
            }, {
                key: "remove",
                value: function() {
                    for (var a = this.items.shift(), b = 0; b < this.plugins.length; b++) {
                        this.plugins[b].remove(a.value);
                    }
                }
            }, {
                key: "peek",
                value: function() {
                    var a = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
                    return this.items.length <= a ? null : this.items[this.items.length - a - 1].getValue();
                }
            }, {
                key: "attach",
                value: function(a) {
                    this.plugins.push(a);
                }
            }, {
                key: "addPreProcess",
                value: function(a) {
                    this.preProcesses.push(a);
                }
            }, {
                key: "addPostProcess",
                value: function(a) {
                    this.postProcesses.push(a);
                }
            }, {
                key: "detach",
                value: function(a) {
                    this.plugins = this.plugins.filter(function(b) {
                        return b !== a;
                    });
                }
            } ]), a;
        }();
        c.SlidingWindow = i;
    }, {
        "../utility/timestamps": 99,
        "./switem": 29
    } ],
    29: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.SWItem = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("../utility/timestamps"), g = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(f), h = function() {
            function a(b) {
                d(this, a), this.value = b, this.created = g.getCurrent();
            }
            return e(a, [ {
                key: "getValue",
                value: function() {
                    return this.value;
                }
            }, {
                key: "getCreated",
                value: function() {
                    return this.created;
                }
            }, {
                key: "toString",
                value: function() {
                    return "";
                }
            } ]), a;
        }();
        c.SWItem = h;
    }, {
        "../utility/timestamps": 99
    } ],
    30: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Conference = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../peerconnection/peerconnectionmanager"), h = a("../config/settings"), i = d(h), j = a("../utility/registry"), k = a("../browserapi/sessionstorage"), l = d(k), m = function() {
            function a(b, c) {
                e(this, a), this.conferenceId = b, this.startTime, this.peerConnectionManager = new g.PeerConnectionManager(), 
                this.credentials = c, this.ucId = null, this.url = null, this.userJoinedSent = !1;
            }
            return f(a, [ {
                key: "getCredentials",
                value: function() {
                    return this.credentials;
                }
            }, {
                key: "getUcId",
                value: function() {
                    return this.ucId;
                }
            }, {
                key: "setUcId",
                value: function(a) {
                    this.ucId = a, this.url = i.conferenceBaseUrl + j.Registry.getCredentials().getAppId() + "/conferences/" + encodeURIComponent(this.conferenceId) + "/" + a + "/general", 
                    l.storeUcId(this.conferenceId, a);
                }
            }, {
                key: "getPeerConnectionManager",
                value: function() {
                    return this.peerConnectionManager;
                }
            }, {
                key: "getUrl",
                value: function() {
                    return this.url;
                }
            }, {
                key: "updateConferenceId",
                value: function(a) {
                    this.conferenceId = a, this.peerConnectionManager.updateConferenceId(a);
                }
            }, {
                key: "close",
                value: function(a) {}
            } ]), a;
        }();
        c.Conference = m;
    }, {
        "../browserapi/sessionstorage": 21,
        "../config/settings": 34,
        "../peerconnection/peerconnectionmanager": 42,
        "../utility/registry": 95
    } ],
    31: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.ConferenceManager = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./conference"), g = a("../config/constants"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = function() {
            function a() {
                d(this, a), this.conferenceMap = new Map();
            }
            return e(a, [ {
                key: "add",
                value: function(a, b) {
                    if (!this.get(a)) {
                        var c = new f.Conference(a, b);
                        this.conferenceMap.set(a, c);
                    }
                }
            }, {
                key: "get",
                value: function(a) {
                    return this.conferenceMap.get(a);
                }
            }, {
                key: "getConferenceForPc",
                value: function(a) {
                    var b = null;
                    return a ? (this.conferenceMap.forEach(function(c, d) {
                        var e = c.getPeerConnectionManager().getPcHandler(a);
                        e && e.getConferenceId() === d && (b = c);
                    }), b) : b;
                }
            }, {
                key: "getConferenceForPcHash",
                value: function(a) {
                    var b = null;
                    return a ? (this.conferenceMap.forEach(function(c, d) {
                        var e = c.getPeerConnectionManager().getPcHandlerByHash(a);
                        e && e.getConferenceId() === d && (b = c);
                    }), b) : b;
                }
            }, {
                key: "updateConferenceId",
                value: function(a) {
                    var b = h.tmpConferenceId, c = this.get(b);
                    c && (c.updateConferenceId(a), this.conferenceMap.set(a, c), this.conferenceMap.delete(b));
                }
            }, {
                key: "getConferenceIds",
                value: function() {
                    var a = [];
                    return this.conferenceMap.forEach(function(b, c) {
                        a.push(c);
                    }), a;
                }
            } ]), a;
        }();
        c.ConferenceManager = i;
    }, {
        "../config/constants": 33,
        "./conference": 30
    } ],
    32: [ function(a, b, c) {
        "use strict";
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        c.csError = {
            httpError: "httpError",
            authError: "authError",
            wsChannelFailure: "wsChannelFailure",
            success: "success",
            csProtoError: "csProtoError",
            appConnectivityError: "appConnectivityError",
            tokenGenerationError: "tokenGenerationError",
            ok: "OK",
            authOngoing: "authOngoing",
            invalidWebRTCFunctionName: "Invalid WebRTC function name",
            invalidEndPointType: "Invalid EndPoint Type",
            invalidTransmissionDirection: "Invalid fabric transmission direction"
        }, c.csErrorStrings = {
            argumentError: "Argument missing/invalid",
            cryptoError: "Browser does not support Web Cryptography API. App secret based authentication requires Web Cryptography API",
            fabricEventUnsupported: "Unsupported fabricEvent",
            fabricEventInvalid: "Invalid fabricEvents value",
            fabricUsageInvalid: "Invalid fabricUsage value",
            notInitialized: "SDK is not initialized or no Fabrics added",
            pcInvalid: "Invalid PeerConnection object passed",
            confereneDoesNotExist: "conferenceId does not exist",
            webRTCFunctionsInvalid: "Invalid webRTC functionName value",
            setProxyConfigInvokeError: "cannot be called if window.csioproxy is false",
            invalidWebRTCFunctionName: "Invalid WebRTC function name",
            invalidEndPointType: "Invalid EndPoint Type",
            invalidTransmissionDirection: "Invalid fabric transmission direction",
            apiaccesserror: "API access Error"
        }, c.csErrorReason = {
            csProtoError: "Protocol fields cannot be empty.",
            csNoAuthState: "Authentication state unavailable in server."
        }, c.internalErrors = {
            authOngoing: "authOngoing"
        }, c.authErrorActions = {
            RETRY: 0,
            GET_NEW_TOKEN: 1,
            REPORT_ERROR: 2
        };
    }, {} ],
    33: [ function(a, b, c) {
        "use strict";
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        c.logEvents = {
            stateMachine: "stateMachine",
            log: "log",
            timing: "timing",
            error: "error",
            getStatsError: "getStatsError",
            restResponseError: "restResponseError"
        }, c.fabricEvent = {
            fabricSetupFailed: "fabricSetupFailed",
            fabricHold: "fabricHold",
            fabricResume: "fabricResume",
            audioMute: "audioMute",
            audioUnmute: "audioUnmute",
            videoPause: "videoPause",
            videoResume: "videoResume",
            fabricUsageEvent: "fabricUsageEvent",
            fabricTerminated: "fabricTerminated",
            screenShareStart: "screenShareStart",
            screenShareStop: "screenShareStop",
            dominantSpeaker: "dominantSpeaker",
            activeDeviceList: "activeDeviceList",
            applicationErrorLog: "applicationErrorLog"
        }, c.internalFabricEvent = {
            fabricSetup: "fabricSetup",
            fabricSetupFailed: "fabricSetupFailed",
            userJoined: "userJoined",
            userLeft: "userLeft",
            userAlive: "userAlive",
            ssrcMap: "ssrcMap",
            mediaPlaybackStart: "mediaPlaybackStart",
            mediaPlaybackSuspended: "mediaPlaybackSuspended",
            mediaPlaybackStalled: "mediaPlaybackStalled",
            oneWayMedia: "oneWayMedia",
            fabricStateChange: "fabricStateChange",
            iceDisruptionStart: "iceDisruptionStart",
            iceDisruptionEnd: "iceDisruptionEnd",
            fabricTransportSwitch: "fabricTransportSwitch",
            iceConnectionDisruptionStart: "iceConnectionDisruptionStart",
            iceConnectionDisruptionEnd: "iceConnectionDisruptionEnd",
            iceAborted: "iceAborted",
            iceTerminated: "iceTerminated",
            iceFailed: "iceFailed",
            iceRestarted: "iceRestarted",
            fabricDropped: "fabricDropped",
            connectedDeviceList: "connectedDeviceList",
            sdpSubmission: "sdpSubmissionEvent",
            sendingThroughputObservations: "sendingThroughputObservations",
            limitationObservations: "limitationObservations",
            userDetails: "userDetails"
        }, c.callstatsChannels = {
            sdpSubmission: "sdpSubmissionEvent",
            processedStats: "processedStats",
            callstatsEvent: "callStatsEvent",
            userFeedback: "userFeedbackEvent",
            preCallTest: "preCallTest",
            senderConfiguration: "senderConfiguration"
        }, c.precalltestEvents = {
            results: "preCallTestResults",
            associate: "preCallTestAssociate"
        }, c.callstatsAPIReturnStatus = {
            success: "success",
            failure: "failure"
        }, c.fabricUsage = {
            audio: "audio",
            video: "video",
            data: "data",
            screen: "screen",
            multiplex: "multiplex",
            unbundled: "unbundled"
        }, c.userIdType = {
            local: "local",
            remote: "remote"
        }, c.qualityRating = {
            excellent: 5,
            good: 4,
            fair: 3,
            poor: 2,
            bad: 1
        }, c.reportType = {
            local: "local",
            remote: "remote",
            inbound: "inbound",
            outbound: "outbound"
        }, c.avQualityRatings = {
            excellent: "excellent",
            fair: "fair",
            bad: "bad",
            unknown: "unknown"
        }, c.fabricState = {
            established: "established",
            initializing: "initializing",
            failed: "failed",
            disrupted: "disrupted",
            hold: "hold",
            checkingDisrupted: "checkingDisrupted",
            terminated: "terminated"
        }, c.webRTCFunctions = {
            createOffer: "createOffer",
            createAnswer: "createAnswer",
            setLocalDescription: "setLocalDescription",
            setRemoteDescription: "setRemoteDescription",
            addIceCandidate: "addIceCandidate",
            getUserMedia: "getUserMedia",
            iceConnectionFailure: "iceConnectionFailure",
            signalingError: "signalingError",
            applicationError: "applicationError",
            applicationLog: "applicationLog"
        }, c.callFailureReasons = {
            mediaConfigError: "MediaConfigError",
            negotiationFailure: "NegotiationFailure",
            sdpError: "SDPGenerationError",
            iceFailure: "IceConnectionFailure",
            transportFailure: "TransportFailure",
            signalingError: "SignalingError",
            applicationError: "ApplicationError",
            applicationLog: "ApplicationLog",
            invalidWebRTCFunctionName: "Invalid WebRTC function name"
        }, c.throughputThreshold = {
            video: {
                green: 1024,
                red: 256
            },
            audio: {
                green: 30,
                red: 8
            }
        }, c.currOverPrevFrameRateThreshold = {
            video: {
                green: .8,
                red: .3
            }
        }, c.rttThreshold = {
            video: {
                green: 400,
                red: 1e3
            }
        }, c.fractionalLossThreshold = {
            video: {
                green: .1,
                red: .5
            },
            audio: {
                green: .15,
                red: .3
            }
        }, c.eModelThreshold = {
            audio: {
                green: 240,
                red: 400
            }
        }, c.codeBaseType = {
            chrome: "Chrome",
            firefox: "Firefox",
            edge: "Edge",
            plugin: "Plugin"
        }, c.browserName = {
            chrome: "Chrome",
            firefox: "Firefox",
            edge: "Edge",
            msie: "Microsoft Internet Explorer",
            safari: "Safari",
            opera: "Opera"
        }, c.osName = {
            windows: "Windows",
            mac: "Mac OS X",
            android: "Android",
            ios: "iOS"
        }, c.mediaType = {
            audio: "audio",
            video: "video"
        }, c.streamType = {
            inbound: "inbound",
            outbound: "outbound"
        }, c.fabricStateChangeType = {
            signalingState: "signalingState",
            iceConnectionState: "iceConnectionState",
            iceGatheringState: "iceGatheringState"
        }, c.transportType = {
            rest: "rest",
            ws: "ws"
        }, c.wsConnectionState = {
            initiated: "initiated",
            connected: "connected",
            closed: "closed"
        }, c.csCallBackMessages = {
            authSuccessful: "SDK authentication successful.",
            authFailed: "SDK authentication failed.",
            authProtocolInvalid: "Fatal authentication error. Invalid auth protocol message.",
            authOngoing: "Authentication on going.",
            wsConnected: "WebSocket establishment successful.",
            wsClosed: "WebSocket server closed.",
            wsFailed: "WebSocket establishment failed."
        }, c.oneWayMediaTypes = {
            audio: "audio",
            video: "video",
            screen: "screen"
        }, c.limitationType = {
            cpu: "cpu",
            network: "network"
        }, c.qualityDisruptionTypes = {
            qpchange: "qpchange"
        }, c.callbackFunctions = {
            stats: "stats",
            defaultConfig: "defaultConfig",
            recommendedConfig: "recommendedConfig",
            preCallTestResults: "preCallTestResults",
            preCallTest: "preCallTest"
        }, c.endpointType = {
            peer: "peer",
            server: "server"
        }, c.transmissionDirection = {
            sendonly: "sendonly",
            receiveonly: "receiveonly",
            sendrecv: "sendrecv",
            inactive: "inactive"
        }, c.tmpConferenceId = "csio-conf-id-tmp";
    }, {} ],
    34: [ function(a, b, c) {
        "use strict";
        function d(a) {
            c.configServiceUrl = m = a;
        }
        function e(a) {
            c.authServiceUrl = n = a;
        }
        function f(a) {
            c.conferenceBaseUrl = o = a;
        }
        function g(a) {
            c.wsUrl = p = a;
        }
        function h(a) {
            c.restEventUrl = q = a;
        }
        function i(a) {
            c.restStatsUrl = r = a;
        }
        function j(a) {
            c.baseUrl = s = a;
        }
        function k(a) {
            c.qmodelThresholdsAPIUrl = t = a;
        }
        function l(a) {
            c.transportType = u = a;
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.setConfigServiceUrl = d, c.setAuthServiceUrl = e, c.setConferenceBaseUrl = f, 
        c.setWsUrl = g, c.setRestEventUrl = h, c.setRestStatsUrl = i, c.setBaseUrl = j, 
        c.setQmodelThresholdsAPIUrl = k, c.setTransportType = l;
        var m = (c.version = "3.53.1", c.configServiceUrl = "https://appsettings.callstats.io/v1/apps/"), n = c.authServiceUrl = "https://auth.callstats.io/", o = (c.authRetryTimeout = 5e3, 
        c.conferenceBaseUrl = "https://dashboard.callstats.io/apps/"), p = c.wsUrl = "wss://collector.callstats.io:443/csiows/collectCallStats", q = c.restEventUrl = "https://events.callstats.io/v1/apps/", r = c.restStatsUrl = "https://stats.callstats.io/v1/apps/", s = c.baseUrl = "https://collector.callstats.io:443/", t = c.qmodelThresholdsAPIUrl = "https://dashboard.callstats.io/api-internal/v1/qmodelthresholds", u = (c.csioDebug = "false", 
        c.transportType = "@@transportType");
    }, {} ],
    35: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a) {
            if (Array.isArray(a)) {
                for (var b = 0, c = Array(a.length); b < a.length; b++) c[b] = a[b];
                return c;
            }
            return Array.from(a);
        }
        function f(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function g(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function h(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        function i() {
            Array.prototype.find || Object.defineProperty(Array.prototype, "find", {
                value: function(a) {
                    if (null === this) throw new TypeError("Array.prototype.find called on null or undefined");
                    if ("function" != typeof a) throw new TypeError("predicate must be a function");
                    for (var b = Object(this), c = b.length >>> 0, d = arguments[1], e = void 0, f = 0; f < c; f++) if (e = b[f], 
                    a.call(d, e, f, b)) return e;
                }
            });
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.MainFSM = c.MainEvents = void 0;
        var j = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
            return typeof a;
        } : function(a) {
            return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a;
        }, k = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), l = a("./statemachine"), m = a("../utility/registry"), n = a("../utility/csiologger"), o = d(n), p = a("../utility/utils"), q = d(p), r = a("../utility/timestamps"), s = d(r), t = a("../config/constants"), u = d(t), v = a("../config/settings"), w = d(v), x = a("./utility"), y = d(x), z = a("../statspipeline/statsadapter"), A = a("../statspipeline/statsparser"), B = a("../statspipeline/statsmonitor"), C = a("../statspipeline/statstransmitter"), D = a("../statspipeline/statsassembler"), E = {
            Created: "Created",
            Initializing: "Initializing",
            Idle: "Idle",
            Run: "Run"
        }, F = c.MainEvents = {
            onStart: "onStart",
            onInitialize: "onInitialize",
            onAddNewFabric: "onAddNewFabric",
            onSendFabricEvent: "onSendFabricEvent",
            onReportError: "onReportError",
            onAssociateMstWithUserID: "onAssociateMstWithUserID",
            onSetProxyConfig: "onSetProxyConfig",
            onAttachWifiStatsHandler: "onAttachWifiStatsHandler",
            onSendUserFeedback: "onSendUserFeedback",
            onOn: "onOn",
            onSetIdentifiers: "onSetIdentifiers",
            onMakePrecallTest: "onMakePrecallTest"
        }, G = {
            onServicesFinished: "onServicesFinished"
        }, H = function(a) {
            function b() {
                f(this, b);
                var a = g(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, E.Created));
                return o.log("FSM:", a.getState()), a.fire(F.onStart), a.run(), i(), a;
            }
            return h(b, a), k(b, [ {
                key: "proceed",
                value: function(a, b) {
                    switch (this.getState()) {
                      case E.Created:
                        switch (a) {
                          case F.onStart:
                            this.onStart.apply(this, e(b));
                            break;

                          case F.onInitialize:
                            this.setState(E.Initializing), o.log("FSM:", this.getState()), this.onInitialize.apply(this, e(b));
                            break;

                          case F.onOn:
                            this.onOn.apply(this, e(b));
                            break;

                          case F.onSetProxyConfig:
                            this.onSetProxyConfig.apply(this, e(b));
                        }
                        break;

                      case E.Initializing:
                        switch (a) {
                          case G.onServicesFinished:
                            this.onServicesFinished() && (this.setState(E.Idle), o.log("FSM:", this.getState()));
                            break;

                          case F.onAddNewFabric:
                            this.onAddNewFabric.apply(this, e(b));
                            break;

                          case F.onSendFabricEvent:
                            this.onSendFabricEvent.apply(this, e(b));
                            break;

                          case F.onReportError:
                            this.onReportError.apply(this, e(b));
                            break;

                          case F.onAssociateMstWithUserID:
                            this.onAssociateMstWithUserID.apply(this, e(b));
                            break;

                          case F.onSendUserFeedback:
                            this.onSendUserFeedback.apply(this, e(b));
                            break;

                          case F.onAttachWifiStatsHandler:
                            this.onAttachWifiStatsHandler.apply(this, e(b));
                            break;

                          case F.onOn:
                            this.onOn.apply(this, e(b));
                            break;

                          case F.onMakePrecallTest:
                            this.onMakePrecallTest.apply(this, e(b));
                            break;

                          case F.onSetIdentifiers:
                            this.onSetIdentifiers.apply(this, e(b));
                            break;

                          case F.onSetProxyConfig:
                            this.onSetProxyConfig.apply(this, e(b));
                        }
                        break;

                      case E.Idle:
                      case E.Run:
                        switch (a) {
                          case F.onAddNewFabric:
                            this.onAddNewFabric.apply(this, e(b));
                            break;

                          case F.onSendFabricEvent:
                            this.onSendFabricEvent.apply(this, e(b));
                            break;

                          case F.onReportError:
                            this.onReportError.apply(this, e(b));
                            break;

                          case F.onAssociateMstWithUserID:
                            this.onAssociateMstWithUserID.apply(this, e(b));
                            break;

                          case F.onSendUserFeedback:
                            this.onSendUserFeedback.apply(this, e(b));
                            break;

                          case F.onAttachWifiStatsHandler:
                            this.onAttachWifiStatsHandler.apply(this, e(b));
                            break;

                          case F.onOn:
                            this.onOn.apply(this, e(b));
                            break;

                          case F.onSetProxyConfig:
                            this.onSetProxyConfig.apply(this, e(b));
                            break;

                          case F.onMakePrecallTest:
                            this.onMakePrecallTest.apply(this, e(b));
                            break;

                          case F.onSetIdentifiers:
                            this.onSetIdentifiers.apply(this, e(b));
                        }
                    }
                }
            }, {
                key: "onStart",
                value: function() {
                    m.Registry.getEndpoint().setup(), this.authenticator = m.Registry.getAuthenticator(), 
                    this.configservicewrapper = m.Registry.getConfigServiceWrapper(), this.precalltest = m.Registry.getPreCallTest(), 
                    this.precalltestIds = [];
                    var a = m.Registry.getStatsAdapter(), b = m.Registry.getStatsParser(), c = m.Registry.getStatsMonitor(), d = m.Registry.getStatsTransmitter(), e = m.Registry.getStatsAssembler();
                    a.connect(z.StatsAdapterIO.RawStatsOut, b.getPort(A.StatsParserIO.RawStatsIn)), 
                    b.connect(A.StatsParserIO.PcStatsTupleOut, c.getPort(B.StatsMonitorIO.PcStatsTupleIn)), 
                    c.connect(B.StatsMonitorIO.StatsTupleOut, e.getPort(D.StatsAssemblerIO.StatsTupleIn)), 
                    e.connect(D.StatsAssemblerIO.CallstatsOut, d.getPort(C.StatsTransmitterIO.CallstatsIn)), 
                    a.connect(z.StatsAdapterIO.UnprocessedOut, d.getPort(C.StatsTransmitterIO.UnprocessedIn));
                }
            }, {
                key: "setupConnection",
                value: function() {
                    var a = this;
                    this.connectionManager = m.Registry.getConnectionManager(), this.connectionManager.setupCollectorConnection(m.Registry.getCredentials().getTransportType()), 
                    this.connectionManager.setup().then(function() {
                        o.log("Connected to connectionManager"), a.fire(G.onServicesFinished), a.run();
                    }).catch(function(a) {
                        return o.log("Could not connect to connectionManager", a);
                    });
                }
            }, {
                key: "setup",
                value: function() {
                    var a = this;
                    this.clocksync = m.Registry.getClockSync(), this.clocksync.initiate().then(function() {
                        o.log("Clocksync completed"), a.fire(G.onServicesFinished), a.run();
                    }).catch(function(a) {
                        return o.log("Could not finish ClockSync", a);
                    });
                }
            }, {
                key: "onInitialize",
                value: function(a, b, c, d, e, f) {
                    var g = this, h = m.Registry.getCredentials();
                    if (h.setAppId(a), h.setUserId(b), m.Registry.getCallbacks().set(u.callbackFunctions.stats, e), 
                    this.doPrecalltest = !0, f) {
                        if (!0 === f.disableBeforeUnloadHandler && this.setBeforeUnloadHandler(), f.applicationVersion) {
                            m.Registry.getEndpoint().setAppVersion(f.applicationVersion);
                        }
                        f.transportType && w.setTransportType(f.transportType), f.disablePrecalltest && (this.doPrecalltest = !1);
                    }
                    this.setup(), this.authenticator.initiate(c, d).then(function(a) {
                        o.log("Authentication complete"), g.setupConnection();
                        var b = m.Registry.getCredentials().getStatsSubmissionInterval();
                        m.Registry.getStatsMonitor().setIntervals(b, b), g.fire(G.onServicesFinished), g.run();
                        var c = g.authenticator.getIceServers();
                        c && g.doPrecalltest && g.precalltest.start(c, "callstats", g.precalltestCallback.bind(g)), 
                        g.configservicewrapper.initiateInternalConfig().then(function() {
                            o.log("ConfigService internal config:", g.configservicewrapper.getInternalConfig()), 
                            g.fire(G.onServicesFinished), g.run();
                        }, function(a) {
                            return o.log(a);
                        }), g.configservicewrapper.initiateAppConfig().then(function() {
                            var a = m.Registry.getCallbacks().get(u.callbackFunctions.defaultConfig), b = g.configservicewrapper.getAppDefaultConfig();
                            a && b && a(b);
                            var c = m.Registry.getCallbacks().get(u.callbackFunctions.recommendedConfig), d = g.configservicewrapper.getAppRecommendedConfig();
                            c && d && c(d), g.fire(G.onServicesFinished), g.run();
                        }, function(a) {
                            return o.log(a);
                        });
                    }, function(a) {
                        o.log(a);
                    });
                }
            }, {
                key: "precalltestCallback",
                value: function(a, b) {
                    var c = m.Registry.getCallbacks().get(u.callbackFunctions.preCallTestResults), d = m.Registry.getCallbacks().get(u.callbackFunctions.preCallTest);
                    if (d && d(a), c) {
                        if (b) {
                            var e = {
                                msg: "precalltest error: " + b
                            };
                            return o.warn("backendlog", e), m.Registry.getGenericEventHandler().sendEvent(u.logEvents.log, e), 
                            void c(u.callstatsAPIReturnStatus.failure, null);
                        }
                        var f = y.getPublicPrecalltestResults(a);
                        c(u.callstatsAPIReturnStatus.success, f);
                    }
                    a && (this.precalltestIds.push(a.id), a.tests && a.tests.ice && ("" === a.tests.ice.turnIpAddress && delete a.tests.ice.turnIpAddress, 
                    "" === a.tests.ice.turnIpVersion && delete a.tests.ice.turnIpVersion, "" === a.tests.ice.turnTransport && delete a.tests.ice.turnTransport), 
                    o.log("sending preCallTest results", a), m.Registry.getEventMessageBuilder().make(u.precalltestEvents.results, null, null, {
                        results: a
                    }));
                }
            }, {
                key: "setBeforeUnloadHandler",
                value: function() {
                    window && window.addEventListener && (o.log("setBeforeUnloadHandler"), window.addEventListener("beforeunload", function(a) {
                        return m.Registry.getConferenceManager().conferenceMap.forEach(function(a, b) {
                            a && a.getPeerConnectionManager().pcHandlers.forEach(function(a, b) {
                                m.Registry.getEventMessageBuilder().make(u.internalFabricEvent.userLeft, a.getConferenceId(), a.getPeerConnection());
                            });
                        }), "Are you sure you want to close the call?";
                    }));
                }
            }, {
                key: "onServicesFinished",
                value: function() {
                    return !!(this.connectionManager && this.connectionManager.isReady() && this.clocksync.isCompleted() && this.authenticator.isCompleted()) && (m.Registry.getTransmissionManager().trySend(), 
                    !0);
                }
            }, {
                key: "onAddNewFabric",
                value: function(a, b, c, d, e, f, g) {
                    o.warn("FSM onAddNewFabric"), m.Registry.getConferenceManager().add(d, m.Registry.getCredentials());
                    var h = m.Registry.getConferenceManager().get(d);
                    h.getPeerConnectionManager().addPcHandler(a, b, c, d, e, f, g);
                    var i = {
                        endpointInfo: m.Registry.getEndpoint().serialize()
                    };
                    m.Registry.getCredentials().getUserIdObject() && (i.localUserIDObject = m.Registry.getCredentials().getUserIdObject()), 
                    h.userJoinedSent || (m.Registry.getEventMessageBuilder().make(u.internalFabricEvent.userJoined, d, a, i), 
                    h.userJoinedSent = !0, m.Registry.getCredentials().getTransportType() === u.transportType.rest && i.localUserIDObject && i.localUserIDObject.userName && m.Registry.getEventMessageBuilder().make(u.internalFabricEvent.userDetails, d, a, {
                        userName: String(i.localUserIDObject.userName)
                    }));
                    var j = this.precalltestIds;
                    this.precalltestIds = [];
                    var k = this.precalltest.getId();
                    k && j.push(k), j.length > 0 && m.Registry.getEventMessageBuilder().make(u.precalltestEvents.associate, d, a, {
                        ids: j
                    });
                }
            }, {
                key: "onSendFabricEvent",
                value: function(a, b, c, d) {
                    o.warn("FSM onSendFabricEvent");
                    var e = {};
                    if (d && (e = d, e.ssrc && (e.ssrc = String(e.ssrc))), b === u.fabricEvent.activeDeviceList) {
                        e = {
                            mediaDeviceList: q.normalizeMediaDeviceList(d.deviceList)
                        };
                    }
                    m.Registry.getEventMessageBuilder().make(b, c, a, e);
                    var f = m.Registry.getConferenceManager().get(c);
                    if (f) {
                        var g = f.getPeerConnectionManager().getPcHandler(a);
                        b !== u.fabricEvent.fabricTerminated && b !== u.internalFabricEvent.fabricSetupFailed || (g.stopUserAliveHandler(), 
                        g.setPcState(u.fabricState.terminated), g.stopStatsPolling(), f.getPeerConnectionManager().removePcHandler(a)), 
                        b === u.fabricEvent.fabricHold && (g.setPcState(u.fabricState.hold), g.stopStatsPolling()), 
                        b === u.fabricEvent.fabricResume && (g.setPcState(u.fabricState.established), g.startStatsPolling());
                    }
                }
            }, {
                key: "onReportError",
                value: function(a, b, c, d, e, f) {
                    o.warn("FSM onReportError");
                    var g = {
                        failureDelay: 0,
                        reason: this.callFailureClassifier(c),
                        function: c,
                        magicKey: m.Registry.getEndpoint().getMagicKey(),
                        endpoint: m.Registry.getEndpoint().serialize(),
                        level: "debug"
                    };
                    if (d) {
                        var h = this.formatDomError(d);
                        g.message = h.message, g.messageType = h.messageType, g.name = d.name, g.stack = d.stack;
                    }
                    if (a) {
                        var i = m.Registry.getConferenceManager().get(b), j = void 0;
                        if (i && (j = i.getPeerConnectionManager().getPcHandler(a)), !j) return void o.error("onReportError: No handler found for given PeerConnection!");
                        if (g.failureDelay = s.getCurrent() - j.getStartTime(), g.fabricState = j.getPcState(), 
                        g.iceConnectionState = j.getIceConnectionState(), (e || f || a && "closed" !== a.signalingState) && m.Registry.getCredentials().getCollectSDP() && c === u.fabricEvent.fabricSetupFailed) {
                            var k = {};
                            k.localSDP = this.pickSDP(a, e, "localDescription"), k.remoteSDP = this.pickSDP(a, f, "remoteDescription"), 
                            m.Registry.getEventMessageBuilder().make(u.callstatsChannels.sdpSubmission, b, a, k);
                        }
                    }
                    c === u.webRTCFunctions.applicationLog || c === u.webRTCFunctions.applicationError ? m.Registry.getEventMessageBuilder().make(u.fabricEvent.applicationErrorLog, b, a, g) : (m.Registry.getEventMessageBuilder().make(u.fabricEvent.fabricSetupFailed, b, a, g), 
                    c === u.webRTCFunctions.getUserMedia && this.handleGUMErrors(b));
                }
            }, {
                key: "onAssociateMstWithUserID",
                value: function(a, b, c, d, e, f) {
                    var g = m.Registry.getConferenceManager().get(c);
                    if (g) {
                        var h = g.getPeerConnectionManager().getPcHandler(a);
                        "string" != typeof d && (d += ""), h.updateSSRCInfo(d, b, e, f);
                    }
                }
            }, {
                key: "onAttachWifiStatsHandler",
                value: function(a) {
                    m.Registry.getWifiStatsExecutor().setGetWifiStatsMethod(a);
                }
            }, {
                key: "onSetProxyConfig",
                value: function(a) {
                    o.warn("FSM onSetProxyConfig"), a.collectorURL && w.setBaseUrl(a.collectorURL), 
                    a.authServiceURL && w.setAuthServiceUrl(a.authServiceURL), a.csioInternalAPIURL && w.setQmodelThresholdsAPIUrl(a.csioInternalAPIURL), 
                    a.wsURL && w.setWsUrl(a.wsURL), a.restEventURL && w.setRestEventUrl(a.restEventURL), 
                    a.restStatsURL && w.setRestStatsUrl(a.restStatsURL), a.appSettingsURL && w.setConfigServiceUrl(a.appSettingsURL);
                }
            }, {
                key: "onSendUserFeedback",
                value: function(a, b, c) {
                    var d = {
                        feedback: {
                            overallRating: b.overall
                        }
                    };
                    b.video && (d.feedback.videoQualityRating = b.video), b.audio && (d.feedback.audioQualityRating = b.audio), 
                    b.comment && (d.feedback.comments = b.comment), m.Registry.getEventMessageBuilder().make(u.callstatsChannels.userFeedback, a, null, d);
                }
            }, {
                key: "onOn",
                value: function(a, b) {
                    m.Registry.getCallbacks().set(a, b);
                }
            }, {
                key: "onSetIdentifiers",
                value: function(a, b) {
                    if (a.conferenceID && (m.Registry.getConferenceManager().updateConferenceId(a.conferenceID), 
                    m.Registry.getTransmissionManager().updateConferenceId(a.conferenceID), m.Registry.getTransmissionManager().trySend()), 
                    a.remoteUserID && b) {
                        var c = m.Registry.getConferenceManager().getConferenceForPc(b);
                        if (!c) return void o.log("onSetIdentifiers conference not found");
                        var d = c.getPeerConnectionManager().getPcHandler(b);
                        if (!d) return void o.log("pcHandler not found");
                        d.updateRemoteId(a.remoteUserID), m.Registry.getTransmissionManager().trySend();
                    }
                }
            }, {
                key: "onMakePrecallTest",
                value: function(a, b) {
                    var c = this, d = a, e = b || "callstats";
                    a || (d = this.authenticator.getIceServers(), e = "callstats"), c.precalltest.start(d, e, c.precalltestCallback.bind(c));
                }
            }, {
                key: "handleGUMErrors",
                value: function(a) {
                    var b = m.Registry.getConferenceManager().get(a);
                    if (b || (m.Registry.getConferenceManager().add(a, m.Registry.getCredentials()), 
                    b = m.Registry.getConferenceManager().get(a)), !b.getUcId()) {
                        var c = {
                            endpointInfo: m.Registry.getEndpoint().serialize()
                        };
                        m.Registry.getEventMessageBuilder().make(u.internalFabricEvent.userJoined, a, null, c), 
                        b.userJoinedSent = !0;
                    }
                }
            }, {
                key: "callFailureClassifier",
                value: function(a) {
                    var b = void 0;
                    return u.webRTCFunctions.hasOwnProperty(a) ? a === u.webRTCFunctions.createOffer || a === u.webRTCFunctions.createAnswer || a === u.webRTCFunctions.setRemoteDescription ? b = u.callFailureReasons.negotiationFailure : a === u.webRTCFunctions.setLocalDescription ? b = u.callFailureReasons.sdpError : a === u.webRTCFunctions.addIceCandidate ? b = u.callFailureReasons.sdpError : a === u.webRTCFunctions.getUserMedia ? b = u.callFailureReasons.mediaConfigError : a === u.webRTCFunctions.iceConnectionFailure ? b = u.callFailureReasons.iceFailure : a === u.webRTCFunctions.signalingError ? b = u.callFailureReasons.signalingError : (a === u.webRTCFunctions.applicationLog || u.webRTCFunctions.applicationError) && (b = u.callFailureReasons.applicationLog) : b = u.callFailureReasons.invalidWebRTCFunctionName, 
                    b;
                }
            }, {
                key: "formatDomError",
                value: function(a) {
                    var b = {}, c = {};
                    a && (window.DOMException && a instanceof window.DOMException ? (c.message = a.message, 
                    c.name = a.name, b.messageType = "domError") : "object" === (void 0 === a ? "undefined" : j(a)) ? (a.message && (c.message = a.message), 
                    a.name && (c.name = a.name), a.constraintName && (c.name = a.constraintName), a.stack && (c.stack = a.stack), 
                    b.messageType = "json") : (c = a, b.messageType = "text"));
                    var d = this.truncateLog(c);
                    return "object" === (void 0 === d ? "undefined" : j(d)) ? b.message = JSON.stringify(d) : b.message = d, 
                    b;
                }
            }, {
                key: "pickSDP",
                value: function(a, b, c) {
                    return b || (a && a[c] ? a[c].sdp : "");
                }
            }, {
                key: "truncateString",
                value: function(a) {
                    return a.length > 2e4 && (o.log("Log exceeds 20kb, It will be truncated"), a = a.substring(0, 2e4)), 
                    a;
                }
            }, {
                key: "truncateLog",
                value: function(a) {
                    return a ? ("string" == typeof a ? a = this.truncateString(a) : "object" === (void 0 === a ? "undefined" : j(a)) && a.message && (a.message = this.truncateString(a.message)), 
                    a) : a;
                }
            } ]), b;
        }(l.StateMachine);
        c.MainFSM = H;
    }, {
        "../config/constants": 33,
        "../config/settings": 34,
        "../statspipeline/statsadapter": 69,
        "../statspipeline/statsassembler": 70,
        "../statspipeline/statsmonitor": 72,
        "../statspipeline/statsparser": 73,
        "../statspipeline/statstransmitter": 74,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "../utility/timestamps": 99,
        "../utility/utils": 101,
        "./statemachine": 37,
        "./utility": 38
    } ],
    36: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a(b, c) {
                d(this, a), this.type = b, this.args = void 0 !== c ? c : null;
            }
            return e(a, [ {
                key: "getType",
                value: function() {
                    return this.type;
                }
            }, {
                key: "getArgs",
                value: function() {
                    return this.args;
                }
            } ]), a;
        }();
        c.ProgramEvent = f;
    }, {} ],
    37: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.StateMachine = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./programevent"), g = a("../utility/csiologger"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = function() {
            function a(b) {
                d(this, a), this.events = [], this.state = b;
            }
            return e(a, [ {
                key: "fire",
                value: function(a) {
                    for (var b = arguments.length, c = Array(b > 1 ? b - 1 : 0), d = 1; d < b; d++) c[d - 1] = arguments[d];
                    var e = new f.ProgramEvent(a, c);
                    this.events.push(e);
                }
            }, {
                key: "proceed",
                value: function(a, b) {
                    h.warn("You need to overwrite the proceed function inan extended StateMachine");
                }
            }, {
                key: "setState",
                value: function(a) {
                    this.state = a;
                }
            }, {
                key: "getState",
                value: function() {
                    return this.state;
                }
            }, {
                key: "run",
                value: function() {
                    if (!(this.events.length < 1)) {
                        var a = this.events.shift();
                        this.proceed(a.getType(), a.getArgs());
                    }
                }
            } ]), a;
        }();
        c.StateMachine = i;
    }, {
        "../utility/csiologger": 88,
        "./programevent": 36
    } ],
    38: [ function(a, b, c) {
        "use strict";
        function d(a) {
            var b = {
                mediaConnectivity: !1,
                throughput: null,
                fractionalLoss: null,
                rtt: null
            };
            return a && a.tests ? (b.provider = a.provider, a.tests.rtt && (b.rtt = a.tests.rtt.median, 
            b.mediaConnectivity = !0), a.tests.throughput && (b.throughput = a.tests.throughput.average, 
            b.fractionalLoss = Math.max(a.tests.throughput.fractionLostBytes, 0), b.mediaConnectivity = !0), 
            a.tests.ice && (a.tests.ice.relayTcpSuccess || a.tests.ice.relayTlsSuccess || a.tests.ice.relayUdpSuccess) && (b.mediaConnectivity = !0), 
            b) : b;
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.getPublicPrecalltestResults = d;
    }, {} ],
    39: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.GetStatsHandler = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../config/constants"), h = d(g), i = a("../statspipeline/statsadapter"), j = a("../utility/registry"), k = a("../utility/rttregistry"), l = a("../utility/csiologger"), m = d(l), n = function() {
            function a(b, c, d, f, g) {
                e(this, a), this.pc = b, this.interval = d, this.codeBase = f, this.browserName = g, 
                this.getStatsTimer = null, this.isPromiseBased = !0, this.pcHash = c, this.genericevent = j.Registry.getGenericEventHandler();
            }
            return f(a, [ {
                key: "startStatsPolling",
                value: function() {
                    var a = this;
                    a.getStatsTimer || (m.log("startStatsPolling for ", a.pcHash), this.getStatsTimer = setInterval(function() {
                        a.csioGetStats(a.statsHandler, a.pcHash);
                    }, a.interval));
                }
            }, {
                key: "stopStatsPolling",
                value: function() {
                    this.getStatsTimer && (clearInterval(this.getStatsTimer), this.getStatsTimer = null);
                }
            }, {
                key: "csioGetStats",
                value: function(a, b) {
                    var c = h.codeBaseType.firefox, d = h.codeBaseType.chrome, e = h.codeBaseType.edge, f = h.browserName.safari;
                    if (this.pc) {
                        if ("closed" === this.pc.iceConnectionState) return void this.stopStatsPolling();
                        try {
                            this.isTemaSys() ? this.getStatsTemasys(a, b) : this.codeBase === c ? this.getStatsFirefox(a, b) : this.browserName === f ? this.getStatsSafari(a, b) : this.codeBase === d ? this.getStatsChrome(a, b) : this.codeBase === e && this.getStatsEdge(a, b);
                        } catch (a) {
                            m.log("csioGetStats: Error ", a);
                        }
                    }
                }
            }, {
                key: "getStatsTemasys",
                value: function(a, b) {
                    this.pc.getStats(null, function(c) {
                        a(c, b);
                    }, function(a) {
                        m.log("getStatsTemasys error", a);
                    });
                }
            }, {
                key: "getStatsFirefox",
                value: function(a, b) {
                    var c = this, d = this.pc;
                    if (!c.isPromiseBased) return void d.getStats(null, function(c) {
                        a(c, b);
                    });
                    try {
                        d.getStats().then(function(c) {
                            a(c, b);
                        }).catch(function(e) {
                            c.isPromiseBased = !1, d.getStats(null, function(c) {
                                a(c, b);
                            });
                        });
                    } catch (e) {
                        c.isPromiseBased = !1, c.genericevent.sendEvent(h.logEvents.getStatsError, {
                            msg: "Firefox getStats reports error ",
                            error: e.message + ":" + e.stack
                        }), d.getStats(null, function(c) {
                            a(c, b);
                        });
                    }
                }
            }, {
                key: "getStatsChrome",
                value: function(a, b) {
                    var c = this, d = c.pc;
                    if (window && window.csioReactNative) return void d.getStats(null, function(c) {
                        a(c, b);
                    }, function(a) {
                        c.genericevent.sendEvent(h.logEvents.getStatsError, {
                            msg: "react-native getStats reports error",
                            error: a.message + ":" + a.stack
                        });
                    });
                    if (!c.isPromiseBased) return void d.getStats(function(c) {
                        a(c, b);
                    });
                    try {
                        d.getStats().then(function(c) {
                            (0, k.getRTTRegistry)().update(d), a(c, b);
                        }).catch(function(e) {
                            m.log("Chrome getStats Error ", e), c.isPromiseBased = !1, c.genericevent.sendEvent(h.logEvents.getStatsError, {
                                msg: "Chrome getStats reports error",
                                error: e.message + ":" + e.stack
                            }), d.getStats(function(c) {
                                a(c, b);
                            });
                        });
                    } catch (e) {
                        c.isPromiseBased = !1, c.genericevent.sendEvent(h.logEvents.getStatsError, {
                            msg: "Chrome getStats reports error",
                            error: e.message + ":" + e.stack
                        }), d.getStats(function(c) {
                            a(c, b);
                        });
                    }
                }
            }, {
                key: "getStatsEdge",
                value: function(a, b) {
                    var c = this;
                    c.pc.getStats().then(function(c) {
                        a(c, b);
                    }).catch(function(d) {
                        a({}, b), d ? c.genericevent.sendEvent(h.logEvents.getStatsError, {
                            msg: "Edge getStats reports error",
                            error: d.message + ":" + d.stack
                        }) : c.genericevent.sendEvent(h.logEvents.getStatsError, {
                            msg: "Edge getStats reports error"
                        });
                    });
                }
            }, {
                key: "getStatsSafari",
                value: function(a, b) {
                    var c = this;
                    c.pc.getStats().then(function(c) {
                        a(c, b);
                    }).catch(function(a) {
                        c.genericevent.sendEvent(h.logEvents.getStatsError, {
                            msg: "Safari getStats reports error",
                            error: a.message + ":" + a.stack
                        });
                    });
                }
            }, {
                key: "statsHandler",
                value: function(a, b) {
                    var c = j.Registry.getStatsAdapter();
                    if (a && c) try {
                        c.transmit(i.StatsAdapterIO.RawStatsIn, a, b);
                    } catch (a) {
                        m.log("statsHandler 123: Error ", a), j.Registry.getGenericEventHandler().sendEvent(h.logEvents.error, {
                            msg: "statsHandler: Error",
                            error: a.message + ":" + a.stack
                        });
                    }
                }
            }, {
                key: "iceCandidatesHandler",
                value: function(a, b) {
                    var c = j.Registry.getStatsAdapter(), d = void 0;
                    d = c.getIceCandidates(a), b(d);
                }
            }, {
                key: "getIceCandidates",
                value: function() {
                    var a = this;
                    return new Promise(function(b, c) {
                        a.csioGetStats(a.iceCandidatesHandler, function(a) {
                            b(a);
                        });
                    });
                }
            }, {
                key: "isTemaSys",
                value: function() {
                    return !!(window && window.AdapterJS && window.AdapterJS.WebRTCPlugin && window.AdapterJS.WebRTCPlugin.plugin);
                }
            } ]), a;
        }();
        c.GetStatsHandler = n;
    }, {
        "../config/constants": 33,
        "../statspipeline/statsadapter": 69,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "../utility/rttregistry": 96
    } ],
    40: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.PcCallbackHandler = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../config/constants"), h = d(g), i = a("../utility/registry"), j = a("../utility/timestamps"), k = d(j), l = a("../config/callstatserrors"), m = d(l), n = a("../utility/csiologger"), o = d(n), p = function() {
            function a(b, c, d, f, g, j) {
                var l = this;
                e(this, a), c && (this.conferenceId = b, this.pc = c, this.getStatsHandler = d, 
                this.userAlive = f, this.callback = j, this.remoteId = g, this.clocksync = i.Registry.getClockSync(), 
                this.emb = i.Registry.getEventMessageBuilder(), this.precalltest = i.Registry.getPreCallTest(), 
                this.genericevent = i.Registry.getGenericEventHandler(), this.iceCandidates = [], 
                this.iceConnectionState = c.iceConnectionState, this.iceGatheringState = c.iceGatheringState, 
                this.signalingState = c.signalingState, this.oldIceConnectionState = "", this.oldIceGatheringState = "", 
                this.iceConnectionStateTS = "", this.negotiationNeeded = 0, this.pcState = h.fabricState.initializing, 
                this.disruptedTS = 0, this.connectionDisruptedTS = 0, this.startTime = k.getCurrent(), 
                this.established = !1, this.activeIceCandidatePair = null, this.prevActiveIceCandidatePair = null, 
                this.localIceCandidates = [], this.remoteIceCandidates = [], this.iceCandidatePairs = [], 
                this.iceConnectivityDelay = 0, this.iceGatheringDelay = 0, this.fabricSetupSent = !1, 
                this.pc && this.pc.addEventListener ? (this.pc.addEventListener("icecandidate", this.iceCandidateCallback.bind(this), !1), 
                this.pc.addEventListener("iceconnectionstatechange", this.iceConnectionStateChangeCallback.bind(this), !1), 
                this.pc.addEventListener("signalingstatechange", this.pcSignalingStateChangeCallback.bind(this), !1), 
                this.pc.addEventListener("negotiationneeded", this.pcNegotiationNeededCallback.bind(this), !1)) : this.pc && this.pc.attachEvent ? (o.info("attachEvent"), 
                this.pc.attachEvent("onicecandidate", this.iceCandidateCallback.bind(this)), this.pc.attachEvent("oniceconnectionstatechange", this.iceConnectionStateChangeCallback.bind(this)), 
                this.pc.attachEvent("onsignalingstatechange", this.pcSignalingStateChangeCallback.bind(this)), 
                this.pc.attachEvent("onnegotiationneeded", this.pcNegotiationNeededCallback.bind(this))) : o.error("callstats cannot monitor or collect stats"), 
                !c || "connected" !== c.iceConnectionState && "completed" !== c.iceConnectionState || (this.pcState = h.fabricState.established, 
                this.getStatsHandler.getIceCandidates().then(function(a) {
                    l.localIceCandidates = a.localIceCandidates, l.remoteIceCandidates = a.remoteIceCandidates, 
                    l.iceCandidatePairs = a.iceCandidatePairs, l.prevActiveIceCandidatePair = l.activeIceCandidatePair, 
                    l.activeIceCandidatePair = l.getActiveIceCandidatePair(), l.sendfabricSetup(), l.startStatsPolling();
                })));
            }
            return f(a, [ {
                key: "iceCandidateCallback",
                value: function(a) {
                    if (a && a.candidate) {
                        var b = a.candidate.candidate.split(" ");
                        if ("0" !== b[4] && "0" !== b[5]) {
                            var c = -1 !== b[4].indexOf(":"), d = "1" === b[1] ? "rtp" : "rtcp", e = {
                                transport: b[2],
                                protocol: d,
                                typePreference: b[3],
                                address: c ? "[" + b[4] + "]:" + b[5] : b[4] + ":" + b[5],
                                type: b[7],
                                media: a.candidate.sdpMid
                            };
                            -1 === this.iceCandidates.indexOf(e) && (this.iceCandidates.push(e), o.warn("CALLBACK: ICE candidate", e));
                        }
                    }
                }
            }, {
                key: "iceConnectionStateChangeCallback",
                value: function(a) {
                    var b = this;
                    if (a) {
                        o.log("pc states ", this.pc.iceGatheringState, this.pc.iceConnectionState), this.iceConnectionStateTS = this.clocksync.getSynchronizedTimestamp(), 
                        this.handleIceGatheringState(), this.handleIceConnectionState(), o.log("states ", this.iceGatheringState, this.iceConnectionState), 
                        "complete" === this.iceGatheringState && "checking" === this.iceConnectionState && this.handleIceChecking();
                        var c = {
                            prevIceConnectionState: this.oldIceConnectionState,
                            currIceConnectionState: this.iceConnectionState
                        }, d = this.iceConnectionState;
                        this.getStatsHandler.getIceCandidates().then(function(a) {
                            b.localIceCandidates = a.localIceCandidates, b.remoteIceCandidates = a.remoteIceCandidates, 
                            b.iceCandidatePairs = a.iceCandidatePairs, b.prevActiveIceCandidatePair = b.activeIceCandidatePair, 
                            b.activeIceCandidatePair = b.getActiveIceCandidatePair(), "connected" === d || "completed" === d ? b.handleIceConnectedOrCompleted(c) : "failed" === d ? b.handleIceFailed(c) : "disconnected" === d ? b.handleIceDisconnected(c) : "closed" === d ? b.handleIceClosed(c) : "new" === d && b.handleIceRestart(c);
                        });
                    }
                }
            }, {
                key: "sendFabricStateChange",
                value: function(a) {
                    this.emb.make(h.internalFabricEvent.fabricStateChange, this.conferenceId, this.pc, a);
                }
            }, {
                key: "handleIceConnectionState",
                value: function() {
                    this.oldIceConnectionState = this.iceConnectionState, this.iceConnectionState = this.pc.iceConnectionState, 
                    o.warn("CALLBACK: ICE connection state change", this.oldIceConnectionState, "->", this.iceConnectionState);
                    var a = {
                        changedState: h.fabricStateChangeType.iceConnectionState,
                        prevState: this.oldIceConnectionState,
                        newState: this.iceConnectionState
                    };
                    this.sendFabricStateChange(a);
                }
            }, {
                key: "handleIceGatheringState",
                value: function() {
                    if (this.iceGatheringState !== this.pc.iceGatheringState) {
                        "complete" === this.pc.iceGatheringState && (this.iceGatheringDelay = k.getCurrent() - this.startTime), 
                        this.oldIceGatheringState = this.iceGatheringState, this.iceGatheringState = this.pc.iceGatheringState, 
                        o.warn("CALLBACK: ICE gathering state change", this.oldIceGatheringState, "->", this.iceGatheringState);
                        var a = {
                            changedState: h.fabricStateChangeType.iceGatheringState,
                            prevState: this.oldIceGatheringState,
                            newState: this.iceGatheringState
                        };
                        this.sendFabricStateChange(a);
                    }
                }
            }, {
                key: "handleIceChecking",
                value: function() {
                    var a = k.getCurrent();
                    if ("disconnected" === this.oldIceConnectionState && (this.pcState === h.fabricState.checkingDisrupted || this.pcState === h.fabricState.disrupted)) {
                        var b = {
                            prevIceConnectionState: this.oldIceConnectionState,
                            currIceConnectionState: this.iceConnectionState,
                            delay: a - this.connectionDisruptedTS
                        };
                        this.pcState === h.fabricState.disrupted && (b.prevIceCandidatePair = this.prevActiveIceCandidatePair, 
                        b.currIceCandidatePair = this.activeIceCandidatePair, b.delay = a - this.disruptedTS, 
                        this.emb.make(h.internalFabricEvent.iceDisruptionEnd, this.conferenceId, this.pc, b)), 
                        this.pcState = h.fabricState.initializing, this.emb.make(h.internalFabricEvent.iceConnectionDisruptionEnd, this.conferenceId, this.pc, b);
                    }
                }
            }, {
                key: "handleIceConnectedOrCompleted",
                value: function(a) {
                    var b = k.getCurrent();
                    this.pcState === h.fabricState.disrupted && (a.prevIceCandidatePair = this.prevActiveIceCandidatePair, 
                    a.currIceCandidatePair = this.activeIceCandidatePair, a.delay = b - this.disruptedTS, 
                    this.emb.make(h.internalFabricEvent.iceDisruptionEnd, this.conferenceId, this.pc, a)), 
                    this.iceConnectivityDelay = b - this.startTime, this.established = !0, this.pcState = h.fabricState.established, 
                    this.sendfabricSetup(), this.startStatsPolling();
                }
            }, {
                key: "sendfabricSetup",
                value: function() {
                    if (this.fabricSetupSent) return void o.log("fabricSetup has been sent already");
                    var a = {
                        delay: k.getCurrent() - this.startTime,
                        iceGatheringDelay: this.iceGatheringDelay,
                        iceConnectivityDelay: this.iceConnectivityDelay,
                        localIceCandidates: this.localIceCandidates,
                        remoteIceCandidates: this.remoteIceCandidates,
                        iceCandidatePairs: this.iceCandidatePairs
                    }, b = this.getActiveIceCandidatePair();
                    b && (a.selectedCandidatePairID = b.id), this.fabricSetupSent = !0;
                    var c = void 0;
                    if (this.conferenceId) {
                        c = i.Registry.getConferenceManager().get(this.conferenceId).getPeerConnectionManager().getPcHandler(this.pc), 
                        a.remoteEndpointType = c.getRemoteEndpointType(), a.fabricTransmissionDirection = c.getFabricTransmissionDirection();
                    }
                    this.pcState = h.fabricState.established, this.emb.make(h.internalFabricEvent.fabricSetup, this.conferenceId, this.pc, a);
                }
            }, {
                key: "isFabricSetupSent",
                value: function() {
                    return this.fabricSetupSent;
                }
            }, {
                key: "startStatsPolling",
                value: function() {
                    this.getStatsHandler.startStatsPolling();
                }
            }, {
                key: "stopStatsPolling",
                value: function() {
                    this.getStatsHandler.stopStatsPolling();
                }
            }, {
                key: "handleIceFailed",
                value: function(a) {
                    a.currIceCandidatePair = this.activeIceCandidatePair, a.failureDelay = k.getCurrent() - this.startTime, 
                    a.delay = k.getCurrent() - this.startTime, this.pcState = h.fabricState.failed, 
                    "checking" === a.prevIceConnectionState ? this.sendIceFailed(a) : "completed" === a.prevIceConnectionState || "connected" === a.prevIceConnectionState ? this.emb.make(h.internalFabricEvent.fabricDropped, this.conferenceId, this.pc, a) : "disconnected" === a.prevIceConnectionState && this.established ? this.emb.make(h.internalFabricEvent.fabricDropped, this.conferenceId, this.pc, a) : "disconnected" === a.prevIceConnectionState && this.sendIceFailed(a);
                }
            }, {
                key: "getActiveIceCandidatePair",
                value: function() {
                    var a = null, b = this.iceCandidatePairs;
                    if (b && b.length > 0) {
                        var c = b.filter(function(a) {
                            return "true" === a.selected || "true" === a.googActiveConnection || !0 === a.selected || !0 === a.googActiveConnection;
                        });
                        c.length > 0 && (a = c[0]);
                    }
                    return a;
                }
            }, {
                key: "sendIceFailed",
                value: function(a) {
                    a.localIceCandidates = this.localIceCandidates, a.remoteIceCandidates = this.remoteIceCandidates, 
                    a.iceCandidatePairs = this.iceCandidatePairs, o.log("sending icefailed ", a), this.emb.make(h.internalFabricEvent.iceFailed, this.conferenceId, this.pc, a);
                }
            }, {
                key: "sendFabricTransportSwitch",
                value: function(a) {
                    var b = this, c = {};
                    c.prevIceCandidatePair = b.activeIceCandidatePair, c.relayType = a, c.currIceConnectionState = b.iceConnectionState, 
                    c.prevIceConnectionState = b.oldIceConnectionState, c.switchDelay = null, b.getStatsHandler.getIceCandidates().then(function(a) {
                        b.localIceCandidates = a.localIceCandidates, b.remoteIceCandidates = a.remoteIceCandidates, 
                        b.iceCandidatePairs = a.iceCandidatePairs, b.activeIceCandidatePair = b.getActiveIceCandidatePair(), 
                        c.currIceCandidatePair = b.activeIceCandidatePair, c.localIceCandidates = b.localIceCandidates, 
                        c.remoteIceCandidates = b.remoteIceCandidates, o.log("sending fabric transport switch ", c), 
                        "completed" !== c.currIceConnectionState && "connected" !== c.currIceConnectionState || "completed" !== c.prevIceConnectionState && "connected" !== c.prevIceConnectionState || b.emb.make(h.internalFabricEvent.fabricTransportSwitch, b.conferenceId, b.pc, c);
                    });
                }
            }, {
                key: "handleIceDisconnected",
                value: function(a) {
                    var b = k.getCurrent();
                    this.startTime = b, a.prevIceConnectionStateTs = this.iceConnectionStateTS, a.currIceCandidatePair = this.activeIceCandidatePair, 
                    "connected" === a.prevIceConnectionState || "completed" === a.prevIceConnectionState ? (this.pcState = h.fabricState.disrupted, 
                    this.disruptedTS = b, this.emb.make(h.internalFabricEvent.iceDisruptionStart, this.conferenceId, this.pc, a), 
                    this.callback && this.callback(m.csError.appConnectivityError, "Connectivity check for PC object to " + this.remoteId + " failed.")) : "checking" === a.prevIceConnectionState && (this.pcState = h.fabricState.checkingDisrupted, 
                    this.connectionDisruptedTS = b, this.emb.make(h.internalFabricEvent.iceConnectionDisruptionStart, this.conferenceId, this.pc, a), 
                    this.callback && this.callback(m.csError.appConnectivityError, "Connectivity check for PC object to " + this.remoteId + " failed."));
                }
            }, {
                key: "handleIceClosed",
                value: function(a) {
                    "new" === a.prevIceConnectionState || "checking" === a.prevIceConnectionState ? (a.failureDelay = k.getCurrent() - this.startTime, 
                    a.localIceCandidates = this.localIceCandidates, a.remoteIceCandidates = this.remoteIceCandidates, 
                    a.iceCandidatePairs = this.iceCandidatePairs, this.emb.make(h.internalFabricEvent.iceAborted, this.conferenceId, this.pc, a)) : "connected" !== a.prevIceConnectionState && "completed" !== a.prevIceConnectionState || (a.prevIceCandidatePair = this.activeIceCandidatePair, 
                    this.emb.make(h.internalFabricEvent.iceTerminated, this.conferenceId, this.pc, a)), 
                    this.pcState = h.fabricState.terminated, this.stopStatsPolling();
                }
            }, {
                key: "handleIceRestart",
                value: function(a) {
                    a.prevIceCandidatePair = this.prevActiveIceCandidatePair, "new" !== a.prevIceConnectionState && (o.log("iceRestarted sending"), 
                    this.established = !1, this.emb.make(h.internalFabricEvent.iceRestarted, this.conferenceId, this.pc, a));
                }
            }, {
                key: "pcSignalingStateChangeCallback",
                value: function(a) {
                    var b = this;
                    if (a) {
                        var c = this.signalingState;
                        this.signalingState = this.pc.signalingState, o.warn("CALLBACK: signaling state change", c, "->", this.signalingState);
                        var d = {
                            changedState: h.fabricStateChangeType.signalingState,
                            prevState: c,
                            newState: this.signalingState
                        };
                        this.sendFabricStateChange(d), "have-remote-offer" !== this.signalingState && "stable" !== this.signalingState || (this.precalltest.callStarts(), 
                        this.genericevent.sendEvent(h.logEvents.log, {
                            msg: "precalltest told to stop "
                        })), "closed" === this.signalingState && (this.emb.make(h.fabricEvent.fabricTerminated, this.conferenceId, this.pc), 
                        this.userAlive.stop(), this.precalltest.callFinished(), this.stopStatsPolling(), 
                        this.pcState = h.fabricState.terminated), "have-local-offer" !== this.signalingState && "have-local-pranswer" !== this.signalingState && "stable" !== this.signalingState || (o.log(this.signalingState, ".. requesting sender config."), 
                        i.Registry.getConfigServiceWrapper().initiateSenderConfig(this.pc).then(function() {
                            var a = i.Registry.getConfigServiceWrapper().getSenderConfig();
                            o.log("Sender config:", a);
                            var c = h.callstatsChannels.senderConfiguration;
                            a && i.Registry.getEventMessageBuilder().make(c, b.conferenceId, b.pc, a);
                        }).catch(function(a) {
                            o.warn(a);
                        }));
                    }
                }
            }, {
                key: "pcNegotiationNeededCallback",
                value: function(a) {
                    a && (this.negotiationNeeded++, this.startTime = k.getCurrent(), o.warn("CALLBACK: negotiation needed", this.negotiationNeeded));
                }
            } ]), a;
        }();
        c.PcCallbackHandler = p;
    }, {
        "../config/callstatserrors": 32,
        "../config/constants": 33,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "../utility/timestamps": 99
    } ],
    41: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.PeerConnectionHandler = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../utility/registry"), h = a("../peerconnection/pccallbackhandler"), i = a("../browserapi/devices"), j = a("./useralivehandler"), k = a("./getstatshandler"), l = a("../config/constants"), m = d(l), n = a("../utility/timestamps"), o = d(n), p = a("../utility/csiologger"), q = d(p), r = function() {
            function a(b) {
                e(this, a), this.pc = b.pc, this.remoteId = b.remoteId, this.fabricUsage = b.fabricUsage, 
                this.callback = b.callback, this.conferenceId = b.conferenceId, this.remoteEndpointType = b.remoteEndpointType, 
                this.fabricTransmissionDirection = b.fabricTransmissionDirection, this.clocksync = g.Registry.getClockSync(), 
                this.startTime = this.clocksync.getSynchronizedTimestamp(), this.credentials = g.Registry.getCredentials(), 
                this.pcHash = this.generatePcHash(), this.ssrcMap = new Map(), this.localSdp = null, 
                this.remoteSdp = null, this.transportInfo = null, this.userAliveHandler = new j.UserAliveHandler(this.conferenceId, this.pc), 
                this.userAliveHandler.start(), this.emb = g.Registry.getEventMessageBuilder(), this.devices = new i.Devices(this.conferenceId, this.pc);
                var c = g.Registry.getEndpoint();
                this.getStatsHandler = new k.GetStatsHandler(this.pc, this.pcHash, 5e3, c.getCodeBase(), c.getBrowserName()), 
                this.pcCallbackHandler = new h.PcCallbackHandler(this.conferenceId, this.pc, this.getStatsHandler, this.userAliveHandler, this.remoteId, this.callback), 
                this.devices.collectConnected(), this.fabricTransmissionDirection || (this.fabricTransmissionDirection = "sendrecv"), 
                this.remoteEndpointType || (this.remoteEndpointType = "peer");
            }
            return f(a, [ {
                key: "getFabricTransmissionDirection",
                value: function() {
                    return this.fabricTransmissionDirection;
                }
            }, {
                key: "getRemoteEndpointType",
                value: function() {
                    return this.remoteEndpointType;
                }
            }, {
                key: "stopUserAliveHandler",
                value: function() {
                    this.userAliveHandler.stop();
                }
            }, {
                key: "getPcState",
                value: function() {
                    return this.pcCallbackHandler.pcState;
                }
            }, {
                key: "stopStatsPolling",
                value: function() {
                    this.getStatsHandler.stopStatsPolling();
                }
            }, {
                key: "startStatsPolling",
                value: function() {
                    this.getStatsHandler.startStatsPolling();
                }
            }, {
                key: "setPcState",
                value: function(a) {
                    a in m.fabricState ? this.pcCallbackHandler.pcState = a : q.error("setPcState: Invalid state");
                }
            }, {
                key: "getAppId",
                value: function() {
                    return this.credentials.getAppId();
                }
            }, {
                key: "getLocalId",
                value: function() {
                    return this.credentials.getUserId();
                }
            }, {
                key: "getConferenceId",
                value: function() {
                    return this.conferenceId;
                }
            }, {
                key: "getPeerConnection",
                value: function() {
                    return this.pc;
                }
            }, {
                key: "getRemoteId",
                value: function() {
                    return this.remoteId;
                }
            }, {
                key: "isFabricSetupSent",
                value: function() {
                    return this.pcCallbackHandler.isFabricSetupSent();
                }
            }, {
                key: "getStartTime",
                value: function() {
                    return this.startTime;
                }
            }, {
                key: "getCallback",
                value: function() {
                    return this.callback;
                }
            }, {
                key: "getPcHash",
                value: function() {
                    return this.pcHash;
                }
            }, {
                key: "getIceCandidates",
                value: function() {
                    return this.pcCallbackHandler ? this.pcCallbackHandler.iceCandidates : null;
                }
            }, {
                key: "getIceConnectionState",
                value: function() {
                    return this.pcCallbackHandler ? this.pcCallbackHandler.iceConnectionState : null;
                }
            }, {
                key: "getNegotiationsNumber",
                value: function() {
                    return this.pcCallbackHandler ? this.pcCallbackHandler.negotiationNeeded : 0;
                }
            }, {
                key: "sendFabricTransportSwitch",
                value: function(a) {
                    this.pcCallbackHandler && this.pcCallbackHandler.sendFabricTransportSwitch(a);
                }
            }, {
                key: "getSdp",
                value: function() {
                    return {
                        localSdp: this.localSdp,
                        remoteSdp: this.remoteSdp
                    };
                }
            }, {
                key: "setSdp",
                value: function(a, b) {
                    this.localSdp = a, this.remoteSdp = b;
                }
            }, {
                key: "generatePcHash",
                value: function() {
                    var a = (Math.random() + 1).toString(36);
                    return a.substring(2, a.length);
                }
            }, {
                key: "getTransportInfo",
                value: function() {
                    return this.transportInfo;
                }
            }, {
                key: "setTransportInfo",
                value: function(a) {
                    this.transportInfo = a;
                }
            }, {
                key: "updateSDP",
                value: function(a) {
                    var b = this, c = void 0, d = void 0;
                    if (this.pc && this.pc.localDescription && (c = this.pc.localDescription.sdp), this.pc && this.pc.remoteDescription && (d = this.pc.remoteDescription.sdp), 
                    c && d && (c !== this.localSdp || d !== this.remoteSdp)) {
                        this.parseSDP(c, m.streamType.outbound), this.parseSDP(d, m.streamType.inbound);
                        var e = {
                            localSDP: c !== this.localSdp ? c : "",
                            remoteSDP: d !== this.remoteSdp ? d : ""
                        };
                        "" === c && "" === remoteSDP || !g.Registry.getCredentials().getCollectSDP() || this.emb.make(m.internalFabricEvent.sdpSubmission, this.conferenceId, this.pc, e), 
                        a && a.forEach(function(a) {
                            var c = String(a.data.ssrc), d = b.ssrcMap.get(c);
                            d || (d = {}), d.mediaType = a.data.mediaType, d.reportType = a.data.isRemote ? "remote" : "local", 
                            d.ssrc = c, b.ssrcMap.set(c, d);
                        });
                        var f = [];
                        this.ssrcMap.forEach(function(a, b) {
                            a.msid && a.mslabel && a.label && f.push(a);
                        });
                        for (var h = {
                            ssrcData: f
                        }, i = 0; i < h.ssrcData.length; i += 1) {
                            h.ssrcData[i].userID = g.Registry.getCredentials().getUserId();
                        }
                        this.emb.make(m.internalFabricEvent.ssrcMap, this.conferenceId, this.pc, h), this.setSdp(c, d);
                    }
                }
            }, {
                key: "parseSDP",
                value: function(a, b) {
                    var c = this, d = RegExp.prototype.test.bind(/^([a-z])=(.*)/), e = /^ssrc:(\d*) ([\w_]*):(.*)/, f = /^ssrc-group:SIM (\d*)/;
                    a.split(/(\r\n|\r|\n)/).filter(d).forEach(function(a) {
                        var d = a[0], g = a.slice(2);
                        if ("a" === d && e.test(g)) {
                            var h = g.match(e), i = h[1], j = h[2], k = h[3], l = c.ssrcMap.get(i);
                            if (l || (l = {}), l.ssrc = i, l[j] = k, l.localStartTime = o.getCurrent(), l.syncedStartTime = c.clocksync.getSynchronizedTimestamp(), 
                            l.streamType = b, !f.test(g)) return void c.ssrcMap.set(i, l);
                            l.ssrcGroup = {}, l.ssrcGroup[b] = {}, l.ssrcGroup[b].simulcastGroup = g.match(/\d+/g), 
                            c.ssrcMap.set(i, l);
                        }
                    });
                }
            }, {
                key: "getSSRCInfo",
                value: function(a) {
                    return this.ssrcMap.get(a);
                }
            }, {
                key: "setupVideoTagMethods",
                value: function(a, b) {
                    var c = this, d = document.getElementById(a);
                    d && (d.oncanplay = function() {
                        var a = {
                            ssrc: String(b),
                            highResTs: o.getCurrent()
                        };
                        c.emb.make(m.internalFabricEvent.mediaPlaybackStart, c.conferenceId, c.pc, a);
                    }, d.onsuspend = function() {
                        var a = {
                            ssrc: String(b),
                            highResTs: o.getCurrent()
                        };
                        c.emb.make(m.internalFabricEvent.mediaPlaybackSuspended, c.conferenceId, c.pc, a);
                    });
                }
            }, {
                key: "updateSSRCInfo",
                value: function(a, b, c, d) {
                    var e = this.ssrcMap.get(a);
                    e || (e = {}), e.ssrc = a, e.remoteUserID = b, e.usageLabel = c, e.associatedVideoTag = d, 
                    this.ssrcMap.set(a, e), d && b !== this.credentials.getUserId() && this.setupVideoTagMethods(d, a);
                }
            }, {
                key: "updateConferenceId",
                value: function(a) {
                    this.conferenceId = a, this.userAliveHandler.updateConferenceId(a);
                }
            }, {
                key: "updateRemoteId",
                value: function(a) {
                    this.remoteId = a;
                }
            } ], [ {
                key: "Builder",
                get: function() {
                    return function() {
                        function b() {
                            e(this, b);
                        }
                        return f(b, [ {
                            key: "withPc",
                            value: function(a) {
                                return this.pc = a, this;
                            }
                        }, {
                            key: "withRemoteId",
                            value: function(a) {
                                return this.remoteId = a, this;
                            }
                        }, {
                            key: "withFabricUsage",
                            value: function(a) {
                                return this.fabricUsage = a, this;
                            }
                        }, {
                            key: "withConferenceId",
                            value: function(a) {
                                return this.conferenceId = a, this;
                            }
                        }, {
                            key: "withRemoteEndpointType",
                            value: function(a) {
                                return this.remoteEndpointType = a, this;
                            }
                        }, {
                            key: "withFabricTransmissionDirection",
                            value: function(a) {
                                return this.fabricTransmissionDirection = a, this;
                            }
                        }, {
                            key: "withCallback",
                            value: function(a) {
                                return this.callback = a, this;
                            }
                        }, {
                            key: "make",
                            value: function() {
                                return new a(this);
                            }
                        } ]), b;
                    }();
                }
            } ]), a;
        }();
        c.PeerConnectionHandler = r;
    }, {
        "../browserapi/devices": 19,
        "../config/constants": 33,
        "../peerconnection/pccallbackhandler": 40,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "../utility/timestamps": 99,
        "./getstatshandler": 39,
        "./useralivehandler": 43
    } ],
    42: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.PeerConnectionManager = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./peerconnectionhandler"), g = function() {
            function a() {
                d(this, a), this.pcHandlers = new Map();
            }
            return e(a, [ {
                key: "removePcHandler",
                value: function(a) {
                    var b = this.getPcHandler(a);
                    if (b) {
                        var c = b.getPcHash();
                        this.pcHandlers.delete(c);
                    }
                }
            }, {
                key: "addPcHandler",
                value: function(a, b, c, d, e, g, h) {
                    if (!this.getPcHandler(a)) {
                        var i = new f.PeerConnectionHandler.Builder().withPc(a).withRemoteId(b).withFabricUsage(c).withConferenceId(d).withRemoteEndpointType(e).withFabricTransmissionDirection(g).withCallback(h).make();
                        this.pcHandlers.set(i.getPcHash(), i);
                    }
                }
            }, {
                key: "getPcHandler",
                value: function(a) {
                    var b = null;
                    return a ? (this.pcHandlers.forEach(function(c, d) {
                        c && c.getPeerConnection() === a && (b = c);
                    }), b) : b;
                }
            }, {
                key: "getPcHandlerByHash",
                value: function(a) {
                    return a && this.pcHandlers.has(a) ? this.pcHandlers.get(a) : null;
                }
            }, {
                key: "updateConferenceId",
                value: function(a) {
                    this.pcHandlers.forEach(function(b, c) {
                        b.updateConferenceId(a);
                    });
                }
            } ]), a;
        }();
        c.PeerConnectionManager = g;
    }, {
        "./peerconnectionhandler": 41
    } ],
    43: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.UserAliveHandler = void 0;
        var g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = a("../config/constants"), i = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(h), j = a("../utility/timeoutprocess"), k = a("../utility/registry"), l = 1e4, m = function(a) {
            function b(a, c) {
                d(this, b);
                var f = e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, l));
                return f.emb = k.Registry.getEventMessageBuilder(), f.pc = c, f.conferenceId = a, 
                f.setCallback(f.send), f;
            }
            return f(b, a), g(b, [ {
                key: "send",
                value: function() {
                    this.conferenceId !== i.tmpConferenceId && this.pc && this.emb.make(i.internalFabricEvent.userAlive, this.conferenceId, this.pc);
                }
            }, {
                key: "updateConferenceId",
                value: function(a) {
                    this.conferenceId = a;
                }
            } ]), b;
        }(j.TimeoutProcess);
        c.UserAliveHandler = m;
    }, {
        "../config/constants": 33,
        "../utility/registry": 95,
        "../utility/timeoutprocess": 98
    } ],
    44: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function g(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Authenticator = void 0;
        var h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = function a(b, c, d) {
            null === b && (b = Function.prototype);
            var e = Object.getOwnPropertyDescriptor(b, c);
            if (void 0 === e) {
                var f = Object.getPrototypeOf(b);
                return null === f ? void 0 : a(f, c, d);
            }
            if ("value" in e) return e.value;
            var g = e.get;
            if (void 0 !== g) return g.call(d);
        }, j = a("./jwt/jwt"), k = a("./jwt/jwttoken"), l = a("../config/settings"), m = d(l), n = a("../utility/base64"), o = d(n), p = a("../config/callstatserrors"), q = d(p), r = a("../config/constants"), s = d(r), t = a("../browserapi/localstorage"), u = d(t), v = a("../utility/json"), w = d(v), x = a("./xmlhttp"), y = a("./xmlhttpservice"), z = a("../utility/registry"), A = a("../utility/csiologger"), B = d(A), C = m.authRetryTimeout, D = function(a) {
            function b() {
                e(this, b);
                var a = f(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, "Authenticator"));
                return a.clockSync = z.Registry.getClockSync(), a.credentials = z.Registry.getCredentials(), 
                a;
            }
            return g(b, a), h(b, [ {
                key: "initiate",
                value: function(a, c) {
                    var d = this;
                    return this.inProgress ? (c && c(q.csError.authOngoing, null), new Promise(function(a, b) {
                        b(new Error(d.name + ": in progress"));
                    })) : this.credentials.getAppId() && this.credentials.getUserId() ? (this.initCallback = c, 
                    "function" == typeof a ? (this.setTokenGenerator(a), i(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "initiate", this).call(this)) : new Promise(function(c, e) {
                        d.createTokenGenerator(a).then(function(a) {
                            d.setTokenGenerator(a), i(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "initiate", d).call(d).then(function() {
                                c();
                            }, function(a) {
                                e(a);
                            });
                        }, function(a) {
                            e(new Error(d.name + ": tokenGenerator creation problem (" + a + ")"));
                        });
                    })) : new Promise(function(a, b) {
                        b(new Error(d.name + ": credentials not set"));
                    });
                }
            }, {
                key: "getToken",
                value: function() {
                    var a = null;
                    return this.token && (a = this.token.getToken()), a;
                }
            }, {
                key: "isTokenValid",
                value: function() {
                    return !!this.token && this.token.isValid(this.credentials);
                }
            }, {
                key: "getElapsed",
                value: function() {
                    return this.isCompleted() ? this.elapsed : null;
                }
            }, {
                key: "getIceServers",
                value: function() {
                    return this.iceServers;
                }
            }, {
                key: "reset",
                value: function() {
                    this.token = null, this.reauthTimer = null, this.renew = !1, this.credentials = null, 
                    this.jwt = new j.Jwt(), this.tokenGenerator = function(a, b) {
                        b("Token generator is not set");
                    }, this.elapsed = 0, this.iceServers = null, i(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "reset", this).call(this);
                }
            }, {
                key: "setupToken",
                value: function(a) {
                    u.store("csio_auth_data", JSON.stringify(a)), this.token = new k.JwtToken(a, this.clockSync);
                }
            }, {
                key: "clearReauthTimer",
                value: function() {
                    null !== this.reauthTimer && (clearTimeout(this.reauthTimer), this.reauthTimer = null);
                }
            }, {
                key: "setupReauthTimer",
                value: function(a) {
                    var b = this;
                    b.clearReauthTimer(), b.reauthTimer = setTimeout(function() {
                        b.reAuthenticate();
                    }, a);
                }
            }, {
                key: "reAuthenticate",
                value: function() {
                    this.inProgress || (this.inProgress = !0, this.token = null, this.sendRequest());
                }
            }, {
                key: "handleErrorActions",
                value: function(a) {
                    if (0 !== a.length) {
                        var b = a.shift();
                        if (b.action === q.authErrorActions.RETRY) {
                            var c = b.params.timeout ? b.params.timeout : m.authRetryTimeout;
                            this.setupReauthTimer(c), this.handleErrorActions(a);
                        }
                        b.action === q.authErrorActions.GET_NEW_TOKEN && (this.renew = !0, this.handleErrorActions(a)), 
                        b.action === q.authErrorActions.REPORT_ERROR && (B.error(this.name + ": " + b.params.errorReason), 
                        this.handleErrorActions(a));
                    }
                }
            }, {
                key: "setTokenGenerator",
                value: function(a) {
                    this.tokenGenerator = a;
                }
            }, {
                key: "handleResponse",
                value: function(a) {
                    var b = a.getXhr(), c = a.getElapsed(), d = w.parse(b.response);
                    if (!d) return B.error(this.name + ": invalid authentication response"), void this.sendNextRequest();
                    if (d["urn:x-callstats:auth:errorActions"] && d["urn:x-callstats:auth:errorActions"].length > 0) return void this.handleErrorActions(d["urn:x-callstats:auth:errorActions"]);
                    if (200 === b.status) {
                        if ("bearer" !== d.token_type) return B.error(this.name + ": successful, but token type was not bearer. Scheduling retry."), 
                        void this.sendNextRequest();
                        this.setupToken(d.access_token), d.iceServers && (this.iceServers = d.iceServers);
                        var e = parseInt(1e3 * parseInt(d.expires_in) * .9);
                        return this.setupReauthTimer(e), this.renew = !1, this.initCallback && this.initCallback(q.csError.success, s.csCallBackMessages.authSuccessful), 
                        this.elapsed = c, void this.completeProcess();
                    }
                    B.error("Authentication failed, but no error actions were defined in response."), 
                    this.sendNextRequest();
                }
            }, {
                key: "request",
                value: function() {
                    var a = this;
                    this.clearReauthTimer();
                    var b = new Promise(function(b, c) {
                        a.tempResolve = b, a.tempReject = c;
                    });
                    return this.tokenGenerator(this.renew, function(b, c) {
                        if (null !== b) return a.initCallback && a.initCallback(q.csError.tokenGenerationError, b.toString()), 
                        a.rejectCb(new Error(a.name + ": tokenGenerationError")), B.error("tokenGenerationError ", b), 
                        null;
                        var d = m.authServiceUrl + "authenticate", e = {
                            client_id: a.credentials.userId + "@" + a.credentials.getAppId(),
                            code: c,
                            grant_type: "authorization_code"
                        }, f = {
                            "Content-Type": "application/x-www-form-urlencoded"
                        };
                        (0, x.sendPostRequest)(d, f, C, e).then(function(b) {
                            a.tempResolve(b);
                        }, function(b) {
                            a.tempReject(b);
                        });
                    }), b;
                }
            }, {
                key: "tokenGeneratorCreator",
                value: function(a, b) {
                    var c = this;
                    return function(d, e) {
                        var f = null, g = {
                            alg: "HS256"
                        };
                        if (!d && null !== f) return e(null, f);
                        var h = c.credentials, i = {
                            userID: h.getUserId(),
                            appID: h.getAppId()
                        };
                        b && (i.keyId = b), c.jwt.sign(g, i, a).then(function(a) {
                            f = a, e(null, a);
                        }).catch(function(a) {
                            e(a);
                        });
                    };
                }
            }, {
                key: "createTokenGenerator",
                value: function(a) {
                    var b = this;
                    return new Promise(function(c, d) {
                        var e = null;
                        a.indexOf(":") > -1 && (e = o.strtohex(a.split(":")[0]), a = a.split(":")[1]), b.jwt.importKey(a).then(function(d) {
                            a = null;
                            var f = b.tokenGeneratorCreator(d, e);
                            c(f);
                        }).catch(function(a) {
                            B.error(b.name + ": could not import key (" + a + ")"), d(a);
                        });
                    });
                }
            } ]), b;
        }(y.XMLHttpService);
        c.Authenticator = D;
    }, {
        "../browserapi/localstorage": 20,
        "../config/callstatserrors": 32,
        "../config/constants": 33,
        "../config/settings": 34,
        "../utility/base64": 85,
        "../utility/csiologger": 88,
        "../utility/json": 93,
        "../utility/registry": 95,
        "./jwt/jwt": 52,
        "./jwt/jwttoken": 53,
        "./xmlhttp": 58,
        "./xmlhttpservice": 59
    } ],
    45: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.GenericEventHandler = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../config/settings"), h = d(g), i = a("./xmlhttp"), j = a("../utility/registry"), k = a("../utility/csiologger"), l = d(k), m = function() {
            function a() {
                e(this, a), this.credentials = j.Registry.getCredentials(), this.enabled = !1;
            }
            return f(a, [ {
                key: "enable",
                value: function() {
                    this.enabled = !0;
                }
            }, {
                key: "disable",
                value: function() {
                    this.enabled = !1;
                }
            }, {
                key: "sendEvent",
                value: function(a, b) {
                    this.send(a, b).then(function(a) {
                        l.log("Got generic response: %o", a);
                    }).catch(function(a) {
                        l.log("Got error for generic request", a);
                    });
                }
            }, {
                key: "send",
                value: function(a, b) {
                    if (!this.enabled) return new Promise(function(a, b) {
                        b(new Error("GenericEvent Error: not enabled"));
                    });
                    var c = this;
                    return new Promise(function(d, e) {
                        var f = {
                            "Content-Type": "application/json"
                        }, g = {
                            appID: c.credentials.appId,
                            userID: encodeURIComponent(c.credentials.userId),
                            version: h.version,
                            eventType: a,
                            data: b
                        }, j = h.baseUrl + "generics";
                        (0, i.sendPostRequest)(j, f, 5e3, g).then(function(a) {
                            d(a.getXhr().response);
                        }, function(a) {
                            e(a);
                        });
                    });
                }
            } ]), a;
        }();
        c.GenericEventHandler = m;
    }, {
        "../config/settings": 34,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "./xmlhttp": 58
    } ],
    46: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function g(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.ClockSync = void 0;
        var h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = function a(b, c, d) {
            null === b && (b = Function.prototype);
            var e = Object.getOwnPropertyDescriptor(b, c);
            if (void 0 === e) {
                var f = Object.getPrototypeOf(b);
                return null === f ? void 0 : a(f, c, d);
            }
            if ("value" in e) return e.value;
            var g = e.get;
            if (void 0 !== g) return g.call(d);
        }, j = a("../config/settings"), k = d(j), l = a("./xmlhttp"), m = a("../utility/timestamps"), n = d(m), o = a("./xmlhttpservice"), p = a("../utility/registry"), q = a("../config/constants"), r = d(q), s = function(a) {
            function b() {
                e(this, b);
                var a = f(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, "ClockSync"));
                return a.currentOffset = 0, a.completed = !1, a;
            }
            return g(b, a), h(b, [ {
                key: "initiate",
                value: function() {
                    return this.startTime = n.getCurrent(), i(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "initiate", this).call(this);
                }
            }, {
                key: "getSynchronizedTimestamp",
                value: function() {
                    return n.getCurrent() + this.currentOffset;
                }
            }, {
                key: "getElapsed",
                value: function() {
                    return this.isCompleted() ? this.endTime - this.startTime : null;
                }
            }, {
                key: "getOffset",
                value: function() {
                    return this.currentOffset;
                }
            }, {
                key: "reset",
                value: function() {
                    this.currentOffset = 0, this.offsetResults = [], this.startTime = 0, this.endTime = 0, 
                    i(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "reset", this).call(this);
                }
            }, {
                key: "request",
                value: function() {
                    var a = k.baseUrl + "clockSync";
                    return (0, l.sendGetRequest)(a, null, 5e3);
                }
            }, {
                key: "handleResponse",
                value: function(a) {
                    var b = a.getXhr(), c = a.getElapsed(), d = JSON.parse(b.response), e = n.getCurrent();
                    this.handleMessage(d, c, e);
                }
            }, {
                key: "handleMessage",
                value: function(a, b, c) {
                    var d = b / 2;
                    d > 6e4 ? this.offsetResults = [] : this.addOffset(a, d, c), this.offsetResults.length >= 5 ? (this.calculateOffset(), 
                    this.endTime = n.getCurrent(), this.completeProcess()) : this.sendRequest();
                }
            }, {
                key: "isCompleted",
                value: function() {
                    return this.completed;
                }
            }, {
                key: "addOffset",
                value: function(a, b, c) {
                    var d = a.now + b, e = d - c;
                    this.offsetResults.push(e);
                }
            }, {
                key: "calculateOffset",
                value: function() {
                    var a = this.offsetResults.reduce(function(a, b) {
                        return a + b;
                    });
                    this.currentOffset = a / this.offsetResults.length, this.currentOffset = isNaN(this.currentOffset) ? 0 : this.currentOffset, 
                    p.Registry.getGenericEventHandler().sendEvent(r.logEvents.log, {
                        msg: "clockSync Done, offset is: " + this.currentOffset + "results length" + this.offsetResults.length
                    }), this.offsetResults = [], this.completed = !0;
                }
            } ]), b;
        }(o.XMLHttpService);
        c.ClockSync = s;
    }, {
        "../config/constants": 33,
        "../config/settings": 34,
        "../utility/registry": 95,
        "../utility/timestamps": 99,
        "./xmlhttp": 58,
        "./xmlhttpservice": 59
    } ],
    47: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a() {
                d(this, a), this.connected = !1, this.reconnected = !1, this.conferenceUrl = {};
            }
            return e(a, [ {
                key: "setup",
                value: function() {
                    return new Promise(function(a, b) {
                        a();
                    });
                }
            }, {
                key: "isReady",
                value: function() {
                    return this.connected;
                }
            }, {
                key: "send",
                value: function(a) {}
            } ]), a;
        }();
        c.CollectorConnection = f;
    }, {} ],
    48: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.ConfigServiceGet = void 0;
        var g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = function a(b, c, d) {
            null === b && (b = Function.prototype);
            var e = Object.getOwnPropertyDescriptor(b, c);
            if (void 0 === e) {
                var f = Object.getPrototypeOf(b);
                return null === f ? void 0 : a(f, c, d);
            }
            if ("value" in e) return e.value;
            var g = e.get;
            if (void 0 !== g) return g.call(d);
        }, i = a("../xmlhttp"), j = a("../xmlhttpservice"), k = a("../../utility/registry"), l = function(a) {
            function b() {
                return d(this, b), e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, "ConfigService"));
            }
            return f(b, a), g(b, [ {
                key: "initiate",
                value: function(a) {
                    var c = this;
                    return this.url = a, this.authToken = k.Registry.getAuthenticator().getToken(), 
                    this.authToken ? h(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "initiate", this).call(this) : new Promise(function(a, b) {
                        b(new Error(c.name + ": authToken has to be string"));
                    });
                }
            }, {
                key: "getConfig",
                value: function() {
                    return this.config;
                }
            }, {
                key: "getElapsed",
                value: function() {
                    return this.isCompleted() ? this.elapsed : null;
                }
            }, {
                key: "reset",
                value: function() {
                    this.authToken = null, this.url = null, this.config = null, this.elapsed = 0, h(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "reset", this).call(this);
                }
            }, {
                key: "request",
                value: function() {
                    var a = {
                        Authorization: "Bearer " + this.authToken
                    };
                    return (0, i.sendGetRequest)(this.url, a, 2e3);
                }
            }, {
                key: "handleResponse",
                value: function(a) {
                    var b = a.getXhr(), c = a.getElapsed();
                    this.config = JSON.parse(b.response), this.elapsed = c, this.completeProcess();
                }
            } ]), b;
        }(j.XMLHttpService);
        c.ConfigServiceGet = l;
    }, {
        "../../utility/registry": 95,
        "../xmlhttp": 58,
        "../xmlhttpservice": 59
    } ],
    49: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.ConfigServicePost = void 0;
        var g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = function a(b, c, d) {
            null === b && (b = Function.prototype);
            var e = Object.getOwnPropertyDescriptor(b, c);
            if (void 0 === e) {
                var f = Object.getPrototypeOf(b);
                return null === f ? void 0 : a(f, c, d);
            }
            if ("value" in e) return e.value;
            var g = e.get;
            if (void 0 !== g) return g.call(d);
        }, i = a("../xmlhttp"), j = a("./configserviceget"), k = function(a) {
            function b() {
                return d(this, b), e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this));
            }
            return f(b, a), g(b, [ {
                key: "initiate",
                value: function(a, c) {
                    return this.body = c, h(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "initiate", this).call(this, a);
                }
            }, {
                key: "request",
                value: function() {
                    var a = {
                        Authorization: "Bearer " + this.authToken
                    };
                    return a["Content-Type"] = "application/json", (0, i.sendPostRequest)(this.url, a, 2e3, this.body);
                }
            } ]), b;
        }(j.ConfigServiceGet);
        c.ConfigServicePost = k;
    }, {
        "../xmlhttp": 58,
        "./configserviceget": 48
    } ],
    50: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.ConfigServiceWrapper = void 0;
        var f = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
            return typeof a;
        } : function(a) {
            return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a;
        }, g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = a("./configserviceget"), i = a("./configservicepost"), j = a("../../config/settings"), k = d(j), l = a("../../utility/registry"), m = a("../../utility/csiologger"), n = d(m), o = function() {
            function a() {
                e(this, a), this.internalConfigService = new h.ConfigServiceGet(), this.appConfigService = new h.ConfigServiceGet(), 
                this.senderConfigService = new i.ConfigServicePost(), this.defaultSenderConfig = null;
            }
            return g(a, [ {
                key: "initiateInternalConfig",
                value: function() {
                    var a = this, b = l.Registry.getCredentials().getAppId();
                    if (!b) return new Promise(function(b, c) {
                        n.log("appId has to be string"), c(new Error(a.internalConfigService.name + ": appId has to be string"));
                    });
                    var c = k.configServiceUrl + b;
                    return this.internalConfigService.initiate(c + "/configurations/internal");
                }
            }, {
                key: "initiateAppConfig",
                value: function() {
                    var a = this, b = l.Registry.getCredentials().getAppId();
                    if (!b) return new Promise(function(b, c) {
                        n.log("appId has to be string"), c(new Error(a.appConfigService.name + ": appId has to be string"));
                    });
                    var c = k.configServiceUrl + b;
                    return this.appConfigService.initiate(c + "/configurations");
                }
            }, {
                key: "initiateSenderConfig",
                value: function(a) {
                    var b = this;
                    if (this.senderConfigService.getConfig()) return new Promise(function(a, c) {
                        n.log("sender config already present"), c(new Error(b.senderConfigService.name + ": sender config already present"));
                    });
                    var c = l.Registry.getCredentials().getAppId(), d = l.Registry.getCredentials().getUserId();
                    if (!c || !d) return new Promise(function(a, c) {
                        n.log("appId and userId have to be string"), c(new Error(b.senderConfigService.name + ": appId and userId have to be string"));
                    });
                    if (this.defaultSenderConfig = this.getCurrentVideoSenderConfig(a), !this.defaultSenderConfig) return new Promise(function(a, c) {
                        n.log("Could not obtain a sender config"), c(new Error(b.senderConfigService.name + ": Could not obtain a sender config"));
                    });
                    var e = k.configServiceUrl + c, f = {
                        app_id: c,
                        local_id: d,
                        rtc_rtp_parameters: this.defaultSenderConfig
                    };
                    return this.senderConfigService.initiate(e + "/configurations", f);
                }
            }, {
                key: "getInternalConfig",
                value: function() {
                    return this.internalConfigService.getConfig();
                }
            }, {
                key: "getAppDefaultConfig",
                value: function() {
                    var a = this.appConfigService.getConfig(), b = {
                        peerConnection: null,
                        media: null
                    };
                    return a.default ? (a.default.peerConnection && (b.peerConnection = a.default.peerConnection), 
                    a.default.media && (b.media = a.default.media), b) : b;
                }
            }, {
                key: "getAppRecommendedConfig",
                value: function() {
                    var a = this.appConfigService.getConfig(), b = {};
                    return a.recommended ? (a.recommended.peerConnection && (b.peerConnection = a.recommended.peerConnection), 
                    a.recommended.media && (b.media = a.recommended.media), b) : b;
                }
            }, {
                key: "getSenderConfig",
                value: function() {
                    var a = this.senderConfigService.getConfig();
                    return a && a.recommended && a.recommended.sender ? a.recommended.sender : null;
                }
            }, {
                key: "getDefaultSenderConfig",
                value: function() {
                    return this.defaultSenderConfig ? this.defaultSenderConfig : null;
                }
            }, {
                key: "getInternalElapsed",
                value: function() {
                    return this.internalConfigService.getElapsed();
                }
            }, {
                key: "getAppElapsed",
                value: function() {
                    return this.appConfigService.getElapsed();
                }
            }, {
                key: "getSenderElapsed",
                value: function() {
                    return this.senderConfigService.getElapsed();
                }
            }, {
                key: "getCurrentVideoSenderConfig",
                value: function(a) {
                    var b = {
                        encodings: [ {
                            maxBitrate: 0
                        } ]
                    }, c = l.Registry.getConferenceManager().getConferenceForPc(a);
                    if (!c) return n.warn("No conference found for PC, skipping"), null;
                    if (c.getPeerConnectionManager().pcHandlers.size > 1) return n.warn("Multiple PCs found, skipping"), 
                    null;
                    if (!a.getSenders || "function" != typeof a.getSenders) return n.warn("Get senders error"), 
                    b;
                    for (var d = a.getSenders(), e = void 0, g = 0; g < d.length; g += 1) {
                        var h = d[g];
                        if ("object" !== (void 0 === h ? "undefined" : f(h)) || !h.track || "object" !== f(h.track) || !h.track.kind) return n.warn("Access senders error"), 
                        null;
                        if ("video" === h.track.kind) {
                            if (e) return n.warn("Multiple video sender, skipping"), null;
                            e = h;
                        }
                    }
                    if (!e) return n.warn("No video sender found"), null;
                    if (!e.getParameters || "function" != typeof e.getParameters) return n.warn("Sender getParameters error"), 
                    b;
                    var i = e.getParameters();
                    return "object" !== (void 0 === i ? "undefined" : f(i)) ? null : ("encodings" in i || (i.encodings = []), 
                    0 === i.encodings.length && i.encodings.push({
                        maxBitrate: 0
                    }), i);
                }
            } ]), a;
        }();
        c.ConfigServiceWrapper = o;
    }, {
        "../../config/settings": 34,
        "../../utility/csiologger": 88,
        "../../utility/registry": 95,
        "./configserviceget": 48,
        "./configservicepost": 49
    } ],
    51: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.ConnectionManager = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("../config/constants"), g = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(f), h = a("./wscollectorconnection"), i = a("./restcollectorconnection"), j = a("../utility/registry"), k = function() {
            function a() {
                d(this, a), this.connection = null;
            }
            return e(a, [ {
                key: "setupCollectorConnection",
                value: function(a) {
                    a === g.transportType.rest ? this.connection = new i.RestCollectorConnection() : this.connection = new h.WsCollectorConnection();
                }
            }, {
                key: "setup",
                value: function() {
                    return this.connection ? this.connection.setup() : new Promise(function(a, b) {
                        b();
                    });
                }
            }, {
                key: "isReady",
                value: function() {
                    return !!this.connection && this.connection.isReady();
                }
            }, {
                key: "send",
                value: function(a) {
                    if (!this.connection) return void j.Registry.getGenericEventHandler().sendEvent(g.logEvents.error, {
                        msg: "Connection not available to the collector"
                    });
                    this.connection.send(a);
                }
            } ]), a;
        }();
        c.ConnectionManager = k;
    }, {
        "../config/constants": 33,
        "../utility/registry": 95,
        "./restcollectorconnection": 54,
        "./wscollectorconnection": 57
    } ],
    52: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Jwt = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../../utility/base64"), h = d(g), i = a("../../utility/csiologger"), j = d(i), k = a("../../utility/registry"), l = a("../../config/constants"), m = d(l), n = function() {
            function a() {
                e(this, a), this.cryptotype = null, window.crypto && window.crypto.subtle ? (this.cryptotype = "standard", 
                this.subtlecrypto = window.crypto.subtle) : window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle ? (this.cryptotype = "webkit", 
                this.subtlecrypto = window.crypto.webkitSubtle) : window.msCrypto && window.msCrypto.subtle ? (this.cryptotype = "ie", 
                this.subtlecrypto = window.msCrypto.subtle) : (this.subtlecrypto = null, j.info("WebCryptography API not supported in this browser.")), 
                this.browserName = k.Registry.getEndpoint().getBrowserName();
            }
            return f(a, [ {
                key: "sign",
                value: function(a, b, c) {
                    var d = this;
                    return new Promise(function(e, f) {
                        "HS256" !== a.alg && f("Use header.alg=HS256"), a = JSON.stringify(a), "string" != typeof b && (b = JSON.stringify(b));
                        var g = h.urlencodeUnicode(a) + "." + h.urlencodeUnicode(b);
                        window.csioReactNative && window.csiosign(g, c, function(a, b) {
                            if (a) return j.log("Token sign error", a), void f(error);
                            e(b);
                        });
                        var i = new ArrayBuffer(g.length), k = new Uint8Array(i), l = {
                            name: "HMAC"
                        };
                        "ie" !== d.cryptotype && "webkit" !== d.cryptotype && d.browserName !== m.browserName.edge || (l.hash = {
                            name: "sha-256"
                        });
                        for (var n = g.length - 1; n >= 0; n--) k[n] = g.charCodeAt(n);
                        var o = d.subtlecrypto.sign(l, c, k);
                        "ie" === d.cryptotype ? (o.onerror = f, o.oncomplete = function(a) {
                            g = d.buildToken(a.target.result, g), e(g);
                        }) : o.then(function(a) {
                            g = d.buildToken(a, g), e(g);
                        }).catch(function(a) {
                            f(a);
                        });
                    });
                }
            }, {
                key: "buildToken",
                value: function(a, b) {
                    for (var c = "", d = new Uint8Array(a), e = d.byteLength, f = 0; f < e; f++) c += String.fromCharCode(d[f]);
                    return b += "." + h.urlencode(c);
                }
            }, {
                key: "decode",
                value: function(a) {
                    try {
                        var b = a.split(".")[1], c = h.decode(b);
                        return JSON.parse(c);
                    } catch (a) {
                        return j.error("Could not decode token. "), null;
                    }
                }
            }, {
                key: "importKey",
                value: function(a) {
                    var b = this;
                    return new Promise(function(c, d) {
                        if (window.csioReactNative) return void c(a);
                        if ("webkit" === b.cryptotype) for (;a.length < 32; ) a += "\0";
                        var e = {
                            kty: "oct",
                            k: h.urlencode(a),
                            alg: "HS256"
                        }, f = {
                            name: "HMAC",
                            hash: {
                                name: "SHA-256"
                            }
                        };
                        if ("ie" === b.cryptotype ? e.extractable = !1 : e.ext = !1, "webkit" === b.cryptotype && (f = null, 
                        e.use = "sig"), "ie" === b.cryptotype || "webkit" === b.cryptotype) {
                            var g = JSON.stringify(e);
                            e = new Uint8Array(g.length);
                            for (var i = 0; i < g.length; i++) e[i] = g.charCodeAt(i);
                        }
                        var j = b.subtlecrypto.importKey("jwk", e, f, !1, [ "sign" ]);
                        "ie" === b.cryptotype ? (j.onerror = d, j.oncomplete = function(a) {
                            c(a.target.result);
                        }) : j.then(c).catch(d);
                    });
                }
            } ]), a;
        }();
        c.Jwt = n;
    }, {
        "../../config/constants": 33,
        "../../utility/base64": 85,
        "../../utility/csiologger": 88,
        "../../utility/registry": 95
    } ],
    53: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.JwtToken = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("./jwt"), h = a("../../utility/registry"), i = a("../../config/constants"), j = d(i), k = a("../../utility/csiologger"), l = d(k), m = function() {
            function a(b) {
                e(this, a), this.token = b, this.statsSubmissionInterval = 15e3, this.collectSDP = !1, 
                this.appId = null, this.userId = null, this.tokenPayload = null, this.jwt = new g.Jwt(), 
                this.expires = null, this.clockSync = h.Registry.getClockSync(), this.adaptiveInterval = !1, 
                this.transportType = j.transportType.rest, this.setupTokenPayload(), this.restApiTransport = !1;
            }
            return f(a, [ {
                key: "getToken",
                value: function() {
                    return this.token;
                }
            }, {
                key: "setupTokenPayload",
                value: function() {
                    var a = this.jwt.decode(this.token);
                    if (this.statsSubmissionInterval = parseInt(a.submissionInterval, 10), this.collectSDP = a.collectSDP, 
                    this.adaptiveInterval = a.adaptiveInterval, this.appId = a.appID, this.userId = a.userID, 
                    this.restApiTransport = a.restApiTransport, navigator.mozGetUserMedia) {
                        var b = a.expiry.split(" ").join("T");
                        this.expires = Date.parse(b);
                    } else this.expires = new Date(a.expiry);
                    this.restApiTransport ? this.transportType = j.transportType.rest : this.transportType = j.transportType.ws, 
                    l.info("transportType is ", this.transportType, this.restApiTransport), h.Registry.getCredentials().setStatsSubmissionInterval(this.statsSubmissionInterval), 
                    h.Registry.getCredentials().setCollectSDP(this.collectSDP), h.Registry.getCredentials().setTransportType(this.transportType), 
                    h.Registry.getCredentials().setAdaptiveInterval(this.adaptiveInterval);
                }
            }, {
                key: "isValid",
                value: function(a) {
                    var b = this, c = !1;
                    if (null !== b.token && b.appId === a.appId && b.userId === encodeURIComponent(a.userId)) {
                        new Date(this.clockSync.getSynchronizedTimestamp()) < b.expires && (c = !0);
                    }
                    return c;
                }
            } ]), a;
        }();
        c.JwtToken = m;
    }, {
        "../../config/constants": 33,
        "../../utility/csiologger": 88,
        "../../utility/registry": 95,
        "./jwt": 52
    } ],
    54: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function g(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.RestCollectorConnection = void 0;
        var h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = a("../utility/registry"), j = a("./xmlhttp"), k = a("./collectorconnection"), l = a("./restrelays"), m = a("../config/constants"), n = d(m), o = a("../utility/csiologger"), p = d(o), q = function(a) {
            function b() {
                e(this, b);
                var a = f(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this));
                return a.relays = new l.RestRelays(), a;
            }
            return g(b, a), h(b, [ {
                key: "isReady",
                value: function() {
                    return !0;
                }
            }, {
                key: "send",
                value: function(a) {
                    var b = {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + i.Registry.getAuthenticator().getToken()
                    }, c = a.eventType, d = a.confID, e = a.ucID, f = this.relays, g = f.getRequestUrl(c, d, e);
                    if (!g) return void p.warn("No action for message type: " + c);
                    var h = this.getMessage(c, a);
                    p.log("sending ", g, a), (0, j.sendPostRequest)(g, b, 5e3, h).then(function(b) {
                        if (!b || !b.xhr) return void p.log("Response for request is null");
                        var e = JSON.parse(b.xhr.response);
                        e && "success" !== e.status && (i.Registry.getGenericEventHandler().sendEvent(n.logEvents.restResponseError, {
                            msg: "response failure " + d + ":" + c + ":" + e.msg + ":" + e.status + JSON.stringify(a)
                        }), p.error("Response error:", e.msg, a)), f.handleResponse(c, e, d);
                    }, function(a) {
                        p.error(a);
                    });
                }
            }, {
                key: "getMessage",
                value: function(a, b) {
                    delete b.confID, delete b.channel, delete b.token, delete b.appID, delete b.action, 
                    delete b.ucID, delete b.version, delete b.timeShift;
                    var c = decodeURIComponent(b.localID);
                    b.localID = c;
                    var d = decodeURIComponent(b.remoteID);
                    return b.remoteID = d, a === n.callstatsChannels.processedStats && (b.eventType = "stats"), 
                    b;
                }
            } ]), b;
        }(k.CollectorConnection);
        c.RestCollectorConnection = q;
    }, {
        "../config/constants": 33,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "./collectorconnection": 47,
        "./restrelays": 55,
        "./xmlhttp": 58
    } ],
    55: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f() {
            var a = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null, b = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
            return function(c, d, e) {
                "success" === c.status ? a && a(c, d) : b && b(c);
            };
        }
        function g(a) {
            var b = f();
            return new Map([ [ j.fabricEvent.fabricTerminated, new r(l.restEventUrl, "/events/fabric/terminated", b) ], [ j.fabricEvent.audioMute, new r(l.restEventUrl, "/events/media/actions", b) ], [ j.fabricEvent.audioUnmute, new r(l.restEventUrl, "/events/media/actions", b) ], [ j.fabricEvent.videoPause, new r(l.restEventUrl, "/events/media/actions", b) ], [ j.fabricEvent.videoResume, new r(l.restEventUrl, "/events/media/actions", b) ], [ j.fabricEvent.screenShareStart, new r(l.restEventUrl, "/events/media/actions", b) ], [ j.fabricEvent.screenShareStop, new r(l.restEventUrl, "/events/media/actions", b) ], [ j.fabricEvent.activeDeviceList, new r(l.restEventUrl, "/events/devices/list", b) ], [ j.fabricEvent.applicationErrorLog, new r(l.restEventUrl, "/events/app/logs", b) ], [ j.fabricEvent.dominantSpeaker, new r(l.restEventUrl, "/events/dominantspeaker", b) ], [ j.fabricEvent.fabricHold, new r(l.restEventUrl, "/events/fabric/actions", b) ], [ j.fabricEvent.fabricResume, new r(l.restEventUrl, "/events/fabric/actions", b) ], [ j.internalFabricEvent.fabricSetup, new r(l.restEventUrl, "/events/fabric/setup", b) ], [ j.fabricEvent.fabricSetupFailed, new r(l.restEventUrl, "/events/fabric/setupfailed", b) ], [ j.internalFabricEvent.userJoined, new r(l.restEventUrl, "", f(function(a, b) {
                b = decodeURIComponent(b);
                var c = m.Registry.getConferenceManager().get(b);
                c && (p.log("UcId is - ", a.ucID, b), c.setUcId(a.ucID), m.Registry.getTransmissionManager().trySend());
            })) ], [ j.internalFabricEvent.userLeft, new r(l.restEventUrl, "/events/user/left", b) ], [ j.internalFabricEvent.userAlive, new r(l.restEventUrl, "/events/user/alive", b) ], [ j.internalFabricEvent.fabricTransportSwitch, new r(l.restEventUrl, "/events/fabric/transportchange", b) ], [ j.internalFabricEvent.mediaPlaybackStart, new r(l.restEventUrl, "/events/media/pipeline", b) ], [ j.internalFabricEvent.mediaPlaybackSuspended, new r(l.restEventUrl, "/events/media/pipeline", b) ], [ j.internalFabricEvent.mediaPlaybackStalled, new r(l.restEventUrl, "/events/media/pipeline", b) ], [ j.internalFabricEvent.ssrcMap, new r(l.restEventUrl, "/events/ssrcmap", b) ], [ j.internalFabricEvent.connectedDeviceList, new r(l.restEventUrl, "/events/devices/list", b) ], [ j.internalFabricEvent.sdpSubmission, new r(l.restEventUrl, "/events/sdp", b) ], [ j.internalFabricEvent.iceDisruptionStart, new r(l.restEventUrl, "/events/ice/status", b) ], [ j.internalFabricEvent.iceDisruptionEnd, new r(l.restEventUrl, "/events/ice/status", b) ], [ j.internalFabricEvent.iceConnectionDisruptionStart, new r(l.restEventUrl, "/events/ice/status", b) ], [ j.internalFabricEvent.iceConnectionDisruptionEnd, new r(l.restEventUrl, "/events/ice/status", b) ], [ j.internalFabricEvent.iceAborted, new r(l.restEventUrl, "/events/ice/status", b) ], [ j.internalFabricEvent.iceTerminated, new r(l.restEventUrl, "/events/ice/status", b) ], [ j.internalFabricEvent.iceFailed, new r(l.restEventUrl, "/events/ice/status", b) ], [ j.internalFabricEvent.iceRestarted, new r(l.restEventUrl, "/events/ice/status", b) ], [ j.internalFabricEvent.fabricDropped, new r(l.restEventUrl, "/events/fabric/status", b) ], [ j.callstatsChannels.processedStats, new r(l.restStatsUrl, "/stats", b) ], [ j.internalFabricEvent.fabricStateChange, new r(l.restEventUrl, "/events/fabric/statechange", b) ], [ j.callstatsChannels.userFeedback, new r(l.restEventUrl, "/events/feedback", b) ], [ j.precalltestEvents.results, new r(l.restEventUrl, "/events/precall", b) ], [ j.precalltestEvents.associate, new r(l.restEventUrl, "/events/precall", b) ], [ j.internalFabricEvent.userDetails, new r(l.restEventUrl, "/events/userdetails", b) ] ]);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.RestRelays = void 0;
        var h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = a("../config/constants"), j = d(i), k = a("../config/settings"), l = d(k), m = a("../utility/registry"), n = a("../utility/url"), o = a("../utility/csiologger"), p = d(o), q = function() {
            function a() {
                e(this, a), this.items = g();
            }
            return h(a, [ {
                key: "getRequestUrl",
                value: function(a, b, c) {
                    return this.items.has(a) ? this.items.get(a).getRequestUrl(a, b, c) : (p.warn("EventType Unsupported ", a), 
                    null);
                }
            }, {
                key: "handleResponse",
                value: function(a, b, c) {
                    if (!this.items.has(a)) return void p.warn("No response handler for event type " + a);
                    this.items.get(a).handleResponse(b, c, a);
                }
            } ]), a;
        }(), r = function() {
            function a(b, c) {
                var d = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                e(this, a), this.baseUrl = b, this.urlAppendix = c, this.responseHandler = d;
            }
            return h(a, [ {
                key: "getRequestUrl",
                value: function(a, b, c) {
                    return this.makeRequestUrl(a, b, c), this.requestUrl.toString();
                }
            }, {
                key: "makeRequestUrl",
                value: function(a, b, c) {
                    a === j.precalltestEvents.results ? this.requestUrl = new n.Url(this.baseUrl, m.Registry.getCredentials().getAppId(), this.urlAppendix) : (a === j.internalFabricEvent.userJoined && c && (c = ""), 
                    this.requestUrl = new n.Url(this.baseUrl, m.Registry.getCredentials().getAppId() + "/conferences/" + b, c, this.urlAppendix));
                }
            }, {
                key: "handleResponse",
                value: function(a, b, c) {
                    this.responseHandler(a, b, c);
                }
            } ]), a;
        }();
        c.RestRelays = q;
    }, {
        "../config/constants": 33,
        "../config/settings": 34,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "../utility/url": 100
    } ],
    56: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.TransmissionManager = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../utility/timestamps"), h = d(g), i = a("../collections/cache"), j = a("../utility/registry"), k = a("../config/constants"), l = d(k), m = a("../utility/csiologger"), n = d(m), o = function() {
            function a() {
                e(this, a), this.cache = [], this.connectionManager = j.Registry.getConnectionManager(), 
                this.lastTS = 0, this.timerStarted = !1;
            }
            return f(a, [ {
                key: "send",
                value: function(a) {
                    (a.isCachable() || a.canBeSent()) && (this.cache[a.getConferenceId()] || (this.cache[a.getConferenceId()] = new i.Cache()), 
                    this.cache[a.getConferenceId()].add(a, a.isPriority()), this.trySend());
                }
            }, {
                key: "trySend",
                value: function() {
                    if (!this.connectionManager.isReady()) return void this.setupConnection();
                    if (!this.timerStarted) return this.timeToSend() ? void (this.sendMessage() && this.startTimer()) : void (this.getCacheLength() > 0 && this.startTimer());
                }
            }, {
                key: "setupConnection",
                value: function() {
                    this.connectionManager.setup().then(function() {
                        n.log("Connected to connectionManager");
                    }).catch(function(a) {
                        return n.log("Could not connect to connectionManager", a);
                    });
                }
            }, {
                key: "sendMessage",
                value: function() {
                    var a = void 0, b = void 0;
                    if (0 === this.getCacheLength()) return !1;
                    for (var c in this.cache) if (this.cache.hasOwnProperty(c) && (b = c, (a = this.cache[b].peak()) && a.canBeSent())) break;
                    return !(!a || !a.canBeSent()) && (n.log("sending message type :", a.toJson().action, a.toJson()), 
                    a = this.cache[b].pop(), this.lastTS = h.getCurrent(), this.connectionManager.send(a.toJson()), 
                    !0);
                }
            }, {
                key: "startTimer",
                value: function() {
                    var a = this;
                    this.timerStarted || 0 != this.getCacheLength() && (this.timerStarted = !0, setTimeout(function() {
                        a.timerStarted = !1, a.trySend();
                    }, 200));
                }
            }, {
                key: "timeToSend",
                value: function() {
                    return h.getCurrent() >= this.lastTS + 200;
                }
            }, {
                key: "getCacheLength",
                value: function() {
                    var a = 0;
                    for (var b in this.cache) this.cache.hasOwnProperty(b) && (a += this.cache[b].length());
                    return a;
                }
            }, {
                key: "updateConferenceId",
                value: function(a) {
                    var b = l.tmpConferenceId;
                    this.cache[b] && this.cache[b].updateConferenceId(a);
                }
            } ]), a;
        }();
        c.TransmissionManager = o;
    }, {
        "../collections/cache": 25,
        "../config/constants": 33,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "../utility/timestamps": 99
    } ],
    57: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function g(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.WsCollectorConnection = void 0;
        var h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = a("../config/callstatserrors"), j = d(i), k = a("../config/constants"), l = d(k), m = a("../config/settings"), n = d(m), o = a("../utility/registry"), p = a("../utility/csiologger"), q = d(p), r = a("./collectorconnection"), s = function(a) {
            function b() {
                e(this, b);
                var a = f(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this));
                return a.wsConnection = null, a.wsConnectionState = l.wsConnectionState.closed, 
                a.connected = !1, a.reconnected = !1, a;
            }
            return g(b, a), h(b, [ {
                key: "onOpenHandler",
                value: function() {
                    var a = this;
                    a.wsConnectionState = l.wsConnectionState.connected, a.connected ? a.reconnected = !0 : a.connected = !0, 
                    a.reconnected = !1;
                }
            }, {
                key: "onCloseHandler",
                value: function() {
                    var a = this;
                    a.wsConnectionState = l.wsConnectionState.closed, q.log("**** Connection to the backend closed."), 
                    a.wsConnection && (a.wsConnection = null);
                }
            }, {
                key: "onErrorHandler",
                value: function(a) {
                    var b = this;
                    b.wsConnectionState = l.wsConnectionState.closed, q.log("**** Connection establishment to the backend failed."), 
                    b.callback && b.callback(j.csError.wsChannelFailure, "WebSocket establishment failed.", a);
                }
            }, {
                key: "onMessageHandler",
                value: function(a) {
                    var b = a.data, c = JSON.parse(b);
                    if ("200 OK" === c.status) {
                        if ("feedback" === c.event) window.localStorage.removeItem("feedback"); else if (c.event === l.internalFabricEvent.userJoined) {
                            var d = o.Registry.getConferenceManager().get(decodeURIComponent(c.conferenceID));
                            d && d.setUcId(c.ucID), q.log("UcId =", c.ucID), o.Registry.getTransmissionManager().trySend();
                        }
                    } else q.error("Collector error:", c.reason);
                }
            }, {
                key: "setup",
                value: function() {
                    var a = this;
                    return new Promise(function(b, c) {
                        if (a.wsConnectionState === l.wsConnectionState.initiated || a.wsConnectionState === l.wsConnectionState.connected) return q.log("setupWebSocketConnection is called when already connected!"), 
                        a.callback && a.callback(j.csError.success, l.csCallBackMessages.wsConnected), void b();
                        a.wsConnectionState = l.wsConnectionState.initiated, q.log("creating new WebSocket", n.wsUrl), 
                        a.wsConnection = new WebSocket(n.wsUrl, "echo-protocol"), a.wsConnection.onopen = function() {
                            b(), a.onOpenHandler();
                        }, a.wsConnection.onclose = function() {
                            a.onCloseHandler();
                        }, a.wsConnection.onerror = function(b) {
                            c(b), a.onErrorHandler(b);
                        }, a.wsConnection.onmessage = function(b) {
                            a.onMessageHandler(b);
                        };
                    });
                }
            }, {
                key: "isReady",
                value: function() {
                    var a = this;
                    return !(!a.wsConnection || 1 !== a.wsConnection.readyState);
                }
            }, {
                key: "getState",
                value: function() {
                    var a = this;
                    return a.wsConnection ? a.wsConnection.readyState : -1;
                }
            }, {
                key: "send",
                value: function(a) {
                    this.wsConnection.send(JSON.stringify(a));
                }
            } ]), b;
        }(r.CollectorConnection);
        c.WsCollectorConnection = s;
    }, {
        "../config/callstatserrors": 32,
        "../config/constants": 33,
        "../config/settings": 34,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "./collectorconnection": 47
    } ],
    58: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f(a, b, c, d, e) {
            return new Promise(function(f, g) {
                var h = null, i = null, j = null, l = new XMLHttpRequest(), p = n.Registry.getEndpoint().getBrowserName();
                if (!l) return void g(new Error("creating instance failed"));
                h = k.getCurrent(), l.open(a, b), p !== m.browserName.msie && (l.timeout = d);
                for (var q in c) c.hasOwnProperty(q) && l.setRequestHeader(q, c[q]);
                var r = null;
                if ("POST" === a) {
                    if ("application/x-www-form-urlencoded" === c["Content-Type"]) {
                        var s = [];
                        for (var t in e) e.hasOwnProperty(t) && s.push(encodeURIComponent(t) + "=" + encodeURIComponent(e[t]));
                        r = s.join("&");
                    }
                    "application/json" === c["Content-Type"] && (r = JSON.stringify(e));
                }
                l.onload = function() {
                    i = k.getCurrent(), j = i - h;
                    var a = new o(l, j);
                    f(a);
                }, l.ontimeout = function() {
                    g(new Error("connection timeout"));
                }, l.onreadystatechange = function() {
                    4 === l.readyState && 0 === l.status && g(new Error("no server response received"));
                }, l.send(r);
            });
        }
        function g(a, b, c) {
            return f("GET", a, b, c, null);
        }
        function h(a, b, c, d) {
            return f("POST", a, b, c, d);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var i = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }();
        c.sendGetRequest = g, c.sendPostRequest = h;
        var j = a("../utility/timestamps"), k = d(j), l = a("../config/constants"), m = d(l), n = a("../utility/registry"), o = function() {
            function a(b, c) {
                e(this, a), this.xhr = b, this.elapsed = c;
            }
            return i(a, [ {
                key: "getXhr",
                value: function() {
                    return this.xhr;
                }
            }, {
                key: "getElapsed",
                value: function() {
                    return this.elapsed;
                }
            } ]), a;
        }();
    }, {
        "../config/constants": 33,
        "../utility/registry": 95,
        "../utility/timestamps": 99
    } ],
    59: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.XMLHttpService = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("../utility/sigmoid"), g = a("../utility/csiologger"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = 100, j = 1e4, k = function() {
            function a() {
                var b = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "XMLHttpService", c = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : i, e = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : j;
                d(this, a), this.name = b, this.minRetryTimeout = c, this.sigmoid = new f.Sigmoid(e - c, 15, .5), 
                this.reset();
            }
            return e(a, [ {
                key: "reset",
                value: function() {
                    this.inProgress = !1, this.completed = !1, this.resolveCb && this.rejectCb(new Error(this.name + ": resetting")), 
                    this.resolveCb = null, this.rejectCb = null;
                }
            }, {
                key: "initiate",
                value: function() {
                    var a = this;
                    if (this.inProgress) return new Promise(function(b, c) {
                        c(new Error(a.name + ": in progress"));
                    });
                    var b = new Promise(function(b, c) {
                        a.resolveCb = b, a.rejectCb = c;
                    });
                    return this.inProgress = !0, this.sendRequest(), b;
                }
            }, {
                key: "isCompleted",
                value: function() {
                    return this.completed;
                }
            }, {
                key: "handleSendError",
                value: function(a) {
                    h.log(this.name + ": send next request (" + a + ")"), this.sendNextRequest();
                }
            }, {
                key: "handleResponseProxy",
                value: function(a) {
                    this.handleResponse(a), this.resetTimeout();
                }
            }, {
                key: "handleResponse",
                value: function(a) {
                    h.error(this.name + ": handleResponse() not implemented"), this.completeProcess();
                }
            }, {
                key: "completeProcess",
                value: function() {
                    this.inProgress = !1, this.completed = !0, this.resolveCb.apply(this, arguments);
                }
            }, {
                key: "request",
                value: function() {
                    return h.error(this.name + ": request() not implemented!"), new Promise(function(a, b) {
                        a();
                    });
                }
            }, {
                key: "sendRequest",
                value: function() {
                    if (this.inProgress) {
                        var a = this.request();
                        a && a.then(this.handleResponseProxy.bind(this), this.handleSendError.bind(this));
                    }
                }
            }, {
                key: "sendNextRequest",
                value: function() {
                    setTimeout(this.sendRequest.bind(this), this.getTimeout());
                }
            }, {
                key: "resetTimeout",
                value: function() {
                    this.sigmoid.reset();
                }
            }, {
                key: "getTimeout",
                value: function() {
                    return this.minRetryTimeout + this.sigmoid.getActual();
                }
            } ]), a;
        }();
        c.XMLHttpService = k;
    }, {
        "../utility/csiologger": 88,
        "../utility/sigmoid": 97
    } ],
    60: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Measurement = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./resolution"), g = a("./validator"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = function() {
            function a() {
                d(this, a), this.pcHash = null, this.ssrc = null, this.streamType = null, this.mediaType = null, 
                this.resolution = null, this.frameRateReceived = null, this.frameHeight = null, 
                this.frameWidth = null, this.droppedFramesNum = null, this.framesReceived = null, 
                this.rtt = null, this.jitter = null, this.lostPackets = -1, this.receivedPackets = -1, 
                this.sentPackets = -1, this.discardedPackets = -1, this.sentBytes = -1, this.receivedBytes = -1, 
                this.track = null, this.fractionLost = 0;
            }
            return e(a, null, [ {
                key: "make",
                value: function(b, c, d, e, f, g, i, j, k, l, m, n, o, p, q, r, s, t) {
                    var u = new a(), v = function(a, b) {
                        -1 === [ void 0, null ].indexOf(b) && (u[a] = b);
                    };
                    return v("pcHash", b), v("ssrc", c), v("streamType", d), v("mediaType", e), v("frameRateReceived", f), 
                    v("frameHeight", h.checkForNan(parseInt(g, 10))), v("frameWidth", h.checkForNan(parseInt(i, 10))), 
                    v("droppedFramesNum", j), v("framesReceived", k), v("rtt", l), v("jitter", m), v("lostPackets", n), 
                    v("receivedPackets", o), v("sentPackets", p), v("discardedPackets", q), v("sentBytes", r), 
                    v("receivedBytes", s), v("track", t), u.setFrameRateReceived(f), u;
                }
            } ]), e(a, [ {
                key: "getPcHash",
                value: function() {
                    return this.pcHash;
                }
            }, {
                key: "getSSRC",
                value: function() {
                    return this.ssrc;
                }
            }, {
                key: "getStreamType",
                value: function() {
                    return this.streamType;
                }
            }, {
                key: "getMediaType",
                value: function() {
                    return this.mediaType;
                }
            }, {
                key: "getResolution",
                value: function() {
                    return this.resolution ? this.resolution.toString() : null;
                }
            }, {
                key: "getFrameRateReceived",
                value: function() {
                    return this.frameRateReceived;
                }
            }, {
                key: "getFrameHeight",
                value: function() {
                    return this.frameHeight;
                }
            }, {
                key: "getFrameWidth",
                value: function() {
                    return this.frameWidth;
                }
            }, {
                key: "getDroppedFramesNum",
                value: function() {
                    return this.droppedFramesNum;
                }
            }, {
                key: "getFramesReceived",
                value: function() {
                    return this.framesReceived;
                }
            }, {
                key: "setFrameRateReceived",
                value: function(a) {
                    this.frameRateReceived = a, void 0 !== this.frameRateReceived && void 0 !== this.frameWidth && void 0 !== this.frameHeight && this.frameWidth > 0 && this.frameHeight > 0 ? this.resolution = new f.Resolution(this.frameWidth, this.frameHeight, this.frameRateReceived) : this.resolution = null;
                }
            }, {
                key: "getJitter",
                value: function() {
                    return this.jitter;
                }
            }, {
                key: "getRTT",
                value: function() {
                    return this.rtt;
                }
            }, {
                key: "getLostPackets",
                value: function() {
                    return this.lostPackets;
                }
            }, {
                key: "getDiscardedPackets",
                value: function() {
                    return this.discardedPackets;
                }
            }, {
                key: "getReceivedPackets",
                value: function() {
                    return this.receivedPackets;
                }
            }, {
                key: "getSentPackets",
                value: function() {
                    return this.sentPackets;
                }
            }, {
                key: "getSentBytes",
                value: function() {
                    return this.sentBytes;
                }
            }, {
                key: "getReceivedBytes",
                value: function() {
                    return this.receivedBytes;
                }
            }, {
                key: "setFractionLost",
                value: function(a) {
                    this.fractionLost = void 0 === a ? null : a;
                }
            }, {
                key: "getFractionLost",
                value: function() {
                    return this.fractionLost;
                }
            }, {
                key: "extractTrack",
                value: function() {
                    var a = this.track;
                    return this.track = null, a;
                }
            }, {
                key: "toString",
                value: function() {
                    return "pcHash: " + this.pcHash + ", ssrc: " + this.ssrc + ", streamType: " + this.streamType + ", mediaType: " + this.mediaType + ", frameRateReceived: " + this.frameRateReceived + ", frameHeight: " + this.frameHeight + ", frameWidth: " + this.frameWidth + ", droppedFramesNum: " + this.droppedFramesNum + ", rtt: " + this.rtt + ", jitter: " + this.jitter + ", lostPackets: " + this.lostPackets + ", receivedPackets: " + this.receivedPackets + ", sentPackets: " + this.sentPackets + ", discardedPackets: " + this.discardedPackets + ", sentBytes: " + this.sentBytes + ", receivedBytes: " + this.receivedBytes;
                }
            } ]), a;
        }();
        c.Measurement = i;
    }, {
        "./resolution": 68,
        "./validator": 83
    } ],
    61: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.CPULimitationObserver = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../../config/constants"), h = d(g), i = a("../../utility/timestamps"), j = d(i), k = function() {
            function a() {
                e(this, a), this.ewmaDiscardedPackets = 0, this.ewmaLostPackets = 0, this.ewmaDroppedFrames = 0, 
                this.last = 0, this.noticed = 0;
            }
            return f(a, [ {
                key: "test",
                value: function(a) {
                    var b = a.discardedPackets, c = a.lostPackets;
                    if (!c || c < 1 || !b || b < 1) return !1;
                    if (0 === this.last) return this.last = j.getCurrent(), this.ewmaLostPackets = c, 
                    this.ewmaDiscardedPackets = b, !1;
                    var d = j.getCurrent(), e = Math.max(d - this.last, 1), f = Math.min((5e3 - e) / 5e3, .9), g = a.droppedFrames;
                    return this.ewmaLostPackets = this.ewmaLostPackets * f + c, this.ewmaDroppedFrames = this.ewmaDroppedFrames * f + g, 
                    this.ewmaDiscardedPackets = this.ewmaDiscardedPackets * f + b, !(!g || g < 1) && (!(1 < this.ewmaLostPackets || 1 < this.ewmaDiscardedPackets) && (!(d - this.noticed < 1e4) && (!(this.ewmaDroppedFrames < 1) && (this.noticed = d, 
                    !0))));
                }
            } ]), a;
        }(), l = function() {
            function a(b) {
                e(this, a), this.notifyCallback = b, this.inbVideoTesters = new Map();
            }
            return f(a, [ {
                key: "accept",
                value: function(a) {
                    for (var b = a.filter(function(a) {
                        return a.getMediaType() === h.mediaType.video && a.getStreamType() === h.streamType.inbound;
                    }), c = 0; c < b.length; ++c) {
                        var d = b[c];
                        this.checkInboundVideo(d);
                    }
                }
            }, {
                key: "checkInboundVideo",
                value: function(a) {
                    var b = a.peek(), c = a.getSSRC();
                    if (this.inbVideoTesters.has(c) || this.inbVideoTesters.set(c, new k()), this.inbVideoTesters.get(c).test(b)) {
                        var d = {
                            reason: h.limitationType.cpu,
                            ssrc: c
                        };
                        this.notifyCallback(d);
                    }
                }
            }, {
                key: "toString",
                value: function() {
                    return "CPULimitationObserver";
                }
            } ]), a;
        }();
        c.CPULimitationObserver = l;
    }, {
        "../../config/constants": 33,
        "../../utility/timestamps": 99
    } ],
    62: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.OneWayMediaObserver = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../../config/constants"), h = d(g), i = a("../onewaymediadisruption"), j = a("../../utility/timestamps"), k = d(j), l = function() {
            function a(b) {
                e(this, a), this.notifierCallback = b, this.inbOneWayAudioDisruption = {
                    sent: !1,
                    started: 0,
                    hasTrafficTs: 0
                }, this.outbOneWayAudioDisruption = {
                    sent: !1,
                    started: 0,
                    hasTrafficTs: 0
                };
            }
            return f(a, [ {
                key: "accept",
                value: function(a) {
                    var b = a.filter(function(a) {
                        return a.getMediaType() == h.mediaType.audio && a.getStreamType() === h.streamType.inbound;
                    }), c = a.filter(function(a) {
                        return a.getMediaType() == h.mediaType.audio && a.getStreamType() === h.streamType.outbound;
                    }), d = [ this.getInbOneWayAudioDisruption(b, c), this.getOutbOneWayAudioDisruption(b, c) ], e = d.filter(function(a) {
                        return null !== a;
                    });
                    0 < e.length && this.notifierCallback(e);
                }
            }, {
                key: "toString",
                value: function() {
                    return "DisruptionObserver";
                }
            }, {
                key: "getInbOneWayAudioDisruption",
                value: function(a, b) {
                    var c = this.inbOneWayAudioDisruption;
                    if (c.sent) return null;
                    var d = b.filter(function(a) {
                        return 0 === a.getStartTime();
                    }).length < 1, e = b.filter(function(a) {
                        return !a.hasTraffic();
                    }).length < 1;
                    if (!d || e) return null;
                    var f = a.filter(function(a) {
                        return !a.hasTraffic();
                    }).length < 1;
                    return 0 < a.length && f ? (c.started = 0, null) : 0 === c.started ? (c.started = k.getCurrent(), 
                    null) : k.getCurrent() - 5e3 < c.started ? null : (c.sent = !0, new i.OneWayMediaDisruption(h.oneWayMediaTypes.audio));
                }
            }, {
                key: "getOutbOneWayAudioDisruption",
                value: function(a, b) {
                    var c = this.outbOneWayAudioDisruption;
                    if (c.sent) return null;
                    var d = a.filter(function(a) {
                        return 0 === a.getStartTime();
                    }).length < 1, e = a.filter(function(a) {
                        return !a.hasTraffic();
                    }).length < 1;
                    if (!d || !e) return null;
                    var f = b.filter(function(a) {
                        return !a.hasTraffic();
                    }).length < 1;
                    return 0 < b.length && f ? (c.started = 0, null) : 0 === c.started ? (c.started = k.getCurrent(), 
                    null) : k.getCurrent() - 5e3 < c.started ? null : (c.sent = !0, new i.OneWayMediaDisruption(h.oneWayMediaTypes.audio));
                }
            } ]), a;
        }();
        c.OneWayMediaObserver = l;
    }, {
        "../../config/constants": 33,
        "../../utility/timestamps": 99,
        "../onewaymediadisruption": 66
    } ],
    63: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.QPSumObserver = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../../config/constants"), h = d(g), i = a("../../utility/timestamps"), j = d(i), k = function() {
            function a(b) {
                e(this, a), this.lastQpSum = null, this.qpAvg = null, this.noticed = 0;
            }
            return f(a, [ {
                key: "test",
                value: function(a) {
                    var b = a.getTrack();
                    if (!b || !b.data || !b.data.qpSum) return !1;
                    if (!this.lastQpSum) return this.lastQpSum = b.data.qpSum, !1;
                    var c = b.data.qpSum - this.lastQpSum;
                    if (this.lastQpSum = b.data.qpSum, null === this.qpAvg) this.qpAvg = c; else {
                        this.qpAvg = .2 * c + .8 * this.qpAvg;
                    }
                    var d = Math.max(2 * this.qpAvg, 1);
                    if (c < this.qpAvg + d) return !1;
                    var e = j.getCurrent();
                    return this.noticed < e - 1e4;
                }
            } ]), a;
        }(), l = function() {
            function a(b) {
                e(this, a), this.notifyCallback = b, this.testers = new Map();
            }
            return f(a, [ {
                key: "accept",
                value: function(a) {
                    for (var b = 0; b < a.length; ++b) {
                        var c = a[b];
                        if (c.getMediaType() === h.mediaType.video) {
                            var d = c.getSSRC();
                            this.testers.has(d) || this.testers.set(d, new k(c));
                            if (this.testers.get(d).test(c)) {
                                var e = {
                                    reason: h.qualityDisruptionTypes.qpchange
                                };
                                this.notifyCallback(e);
                            }
                        }
                    }
                }
            }, {
                key: "toString",
                value: function() {
                    return "QPSumObserver";
                }
            } ]), a;
        }();
        c.QPSumObserver = l;
    }, {
        "../../config/constants": 33,
        "../../utility/timestamps": 99
    } ],
    64: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.SendingTrigger = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../../utility/timestamps"), h = d(g), i = a("../validator"), j = d(i), k = 1e3, l = 3e4, m = function() {
            function a(b, c, d) {
                e(this, a), this.last = null, this.actual = 0, this.name = b, this.alpha = c, this.supplier = d;
            }
            return f(a, [ {
                key: "update",
                value: function(a) {
                    if (null === this.last) return void (this.last = a);
                    var b = Math.abs(a - this.last);
                    this.actual = b * this.alpha + this.actual * (1 - this.alpha), this.last = a;
                }
            }, {
                key: "doTest",
                value: function(a) {
                    var b = this.last;
                    return this.update(a), null !== b && b + this.supplier(this.actual) < a;
                }
            } ]), a;
        }(), n = function() {
            function a() {
                e(this, a);
                var b = this;
                this.marginFactor = 1, this.rttTester = new m("RTT Tester", .2, function(a) {
                    return Math.max(50, a) * b.marginFactor;
                }), this.throughputTester = new m("Throughput Tester", .1, function(a) {
                    return Math.max(100, a) * b.marginFactor;
                }), this.FLTester = new m("FL Tester", .1, function(a) {
                    return Math.max(.2, a) * b.marginFactor;
                }), this.lastDecreased = h.getCurrent();
            }
            return f(a, [ {
                key: "test",
                value: function(a) {
                    var b = a.peek();
                    if (!b) return !1;
                    var c = a.getTrack(), d = c.data, e = b.getRTT(), f = j.checkForNan(parseInt(d.csioIntBRKbps, 10)), g = b.getFractionLost();
                    if (this.rttTester.doTest(e) || this.throughputTester.doTest(f) || this.FLTester.doTest(g)) return this.marginFactor = Math.min(2 * this.marginFactor, 15), 
                    !0;
                    var i = h.getCurrent();
                    return 3e3 < i - this.lastChanged && (this.marginFactor = Math.max(this.marginFactor - .5, 1), 
                    this.lastDecreased = i), !1;
                }
            } ]), a;
        }(), o = function() {
            function a(b) {
                e(this, a), this.notifyCallback = b, this.minInterval = k, this.maxInterval = l, 
                this.notified = 0, this.testers = new Map();
            }
            return f(a, [ {
                key: "setup",
                value: function(a, b) {
                    this.minInterval = a, this.maxInterval = b;
                }
            }, {
                key: "accept",
                value: function(a) {
                    var b = h.getCurrent(), c = b - this.notified;
                    if (this.minInterval === this.maxInterval) return void (this.minInterval <= c && (this.notifyCallback(), 
                    this.notified = b));
                    if (!(c < this.minInterval)) {
                        if (c < this.maxInterval) {
                            if (!1 === this.doSend(a)) return;
                        }
                        this.notifyCallback(), this.notified = b;
                    }
                }
            }, {
                key: "setIntervals",
                value: function(a, b) {
                    this.minInterval = a, this.maxInterval = b;
                }
            }, {
                key: "toString",
                value: function() {
                    return "SendingTrigger";
                }
            }, {
                key: "doSend",
                value: function(a) {
                    for (var b = 0; b < a.length; ++b) {
                        var c = a[b], d = c.getSSRC();
                        this.testers.has(d) || this.testers.set(d, new n());
                        if (this.testers.get(d).test(c)) return !0;
                    }
                    return !1;
                }
            } ]), a;
        }();
        c.SendingTrigger = o;
    }, {
        "../../utility/timestamps": 99,
        "../validator": 83
    } ],
    65: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.ThroughputObserver = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../../config/constants"), h = d(g), i = a("../../utility/timestamps"), j = d(i), k = function() {
            function a(b) {
                e(this, a), this.notifierCallback = b, this.observations = new Map();
            }
            return f(a, [ {
                key: "accept",
                value: function(a) {
                    var b = a.filter(function(a) {
                        return a.getMediaType() === h.mediaType.video && a.getStreamType() === h.streamType.outbound;
                    });
                    if (!(b.length < 1)) {
                        var c = this;
                        b.forEach(function(a) {
                            c.observe(a);
                        });
                    }
                }
            }, {
                key: "toString",
                value: function() {
                    return "ThroughputObserver";
                }
            }, {
                key: "getObservations",
                value: function(a) {
                    if (this.observations.has(a)) return this.observations.get(a);
                    var b = {
                        ssrc: 0,
                        started: 0,
                        max: 0,
                        maxTs: 0,
                        stable: 0,
                        stableTs: 0,
                        ready: !1,
                        maxVerified: !1,
                        stableVerified: !1
                    };
                    return this.observations.set(a, b), this.observations.get(a);
                }
            }, {
                key: "observe",
                value: function(a) {
                    var b = a.getSSRC(), c = this.getObservations(b), d = j.getCurrent();
                    if (!0 !== c.ready) {
                        if (0 === c.started) return c.ssrc = b, void (c.started = d);
                        var e = a.getTrack(), f = e.data, g = f.csioIntBRKbps, h = Math.min(50, .05 * g);
                        if (c.max < g ? (c.max = g, c.maxTs = d) : 1e4 < d - c.maxTs && (c.maxVerified = !0), 
                        !(d - c.started < 15e3) && (g - h < f.csioAvgBRKbps && f.csioAvgBRKbps < g + h && (c.stableTs = d, 
                        c.stable = g, c.stableVerified = !0), c.stableVerified && c.maxVerified)) {
                            var i = {
                                ssrc: String(c.ssrc),
                                maxsendingKBitrate: c.max,
                                timeToMaxSendingKBitrate: c.maxTs - c.started,
                                stablesendingKBitrate: c.stable,
                                timeToStableSendingKBitrate: c.stableTs - c.started
                            };
                            this.notifierCallback(i), c.ready = !0;
                        }
                    }
                }
            } ]), a;
        }();
        c.ThroughputObserver = k;
    }, {
        "../../config/constants": 33,
        "../../utility/timestamps": 99
    } ],
    66: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a(b) {
                var c = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "0";
                d(this, a), this.mediaType = b, this.ssrc = c;
            }
            return e(a, [ {
                key: "getContent",
                value: function() {
                    var a = this;
                    return {
                        mediaType: a.mediaType,
                        ssrc: a.ssrc
                    };
                }
            } ]), a;
        }();
        c.OneWayMediaDisruption = f;
    }, {} ],
    67: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a(b, c, e, f, g, h) {
                d(this, a), this.candidatePair = b, this.codec = c, this.pcHash = e, this.trackStats = f, 
                this.transportStats = g, this.measurements = h;
            }
            return e(a, [ {
                key: "getCandidatePair",
                value: function() {
                    return this.candidatePair;
                }
            }, {
                key: "getCodec",
                value: function() {
                    return this.codec;
                }
            }, {
                key: "getPcHash",
                value: function() {
                    return this.pcHash;
                }
            }, {
                key: "getTrackStats",
                value: function() {
                    return this.trackStats;
                }
            }, {
                key: "getTransportStats",
                value: function() {
                    return this.transportStats;
                }
            }, {
                key: "getMeasurements",
                value: function() {
                    return this.measurements;
                }
            } ]), a;
        }();
        c.PcStats = f;
    }, {} ],
    68: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a(b, c, e) {
                d(this, a), this.width = b, this.height = c, this.frameRate = e;
            }
            return e(a, [ {
                key: "getWidth",
                value: function() {
                    return this.width;
                }
            }, {
                key: "getHeight",
                value: function() {
                    return this.height;
                }
            }, {
                key: "getFrameRate",
                value: function() {
                    return this.frameRate;
                }
            }, {
                key: "toString",
                value: function() {
                    return this.width && this.height && this.frameRate ? this.width.toString() + "X" + this.height.toString() + "X" + this.frameRate.toString() : null;
                }
            } ]), a;
        }();
        c.Resolution = f;
    }, {} ],
    69: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function g(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.StatsAdapter = c.StatsAdapterIO = void 0;
        var h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = a("../config/constants"), j = d(i), k = a("../collections/component"), l = a("../utility/registry"), m = a("../utility/hash"), n = d(m), o = c.StatsAdapterIO = {
            RawStatsIn: "RawStatsIn",
            RawStatsOut: "RawStatsOut",
            UnprocessedOut: "UnprocessedOut"
        }, p = function(a) {
            function b(a, c) {
                e(this, b);
                var d = f(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, "StatsAdapter"));
                return d.bindPort(o.RawStatsIn, d.receiveRawData, d), d.declarePort(o.RawStatsOut), 
                d.declarePort(o.UnprocessedOut), d.codeBase = a, d.browser = c, d;
            }
            return g(b, a), h(b, [ {
                key: "receiveRawData",
                value: function(a, b) {
                    if (a) {
                        var c = this.extractRawStats(a);
                        if (c) {
                            window && window.csioReactNative && (c = this.removeValues(c)), this.isConnected(o.UnprocessedOut) && this.transmit(o.UnprocessedOut, c, b);
                            var d = this.processRawStats(c, b);
                            if (d && d.transportStats) for (var e = 0; e < d.transportStats.length; e++) d.transportStats[e].hash = this.getTransportHash(d.transportStats[e]);
                            d && d.transportStats && this.checkTransportStatsUpdates(d.transportStats, b), d && d.trackStats && (d = this.backFillTrackStats(d)), 
                            d && d.transportStats && d.candidatePair && (d = this.backFillCandidatePairStats(d)), 
                            d.pcHash = b, this.transmit(o.RawStatsOut, d);
                        }
                    }
                }
            }, {
                key: "removeValues",
                value: function(a) {
                    for (var b = 0; b < a.length; ++b) {
                        var c = a[b];
                        if (c && c.values) {
                            for (var d = 0; d < c.values.length; ++d) Object.assign(c, c.values[d]);
                            delete c.values;
                        }
                    }
                    return a;
                }
            }, {
                key: "getIceCandidates",
                value: function(a) {
                    if (!a) return {
                        localIceCandidates: [],
                        remoteIceCandidates: [],
                        iceCandidatePairs: []
                    };
                    var b = this.extractRawStats(a);
                    return this.processRawStatsForIceInfo(b);
                }
            }, {
                key: "extractRawStats",
                value: function(a) {
                    var b = [];
                    if (a && a.result) b = a.result(); else if (a && a.forEach) a.forEach(function(a) {
                        b.push(a);
                    }); else for (var c in a) a.hasOwnProperty(c) && b.push(a[c]);
                    return b;
                }
            }, {
                key: "normalizeIceCandidates",
                value: function(a) {
                    for (var b = 0; b < a.length; b += 1) {
                        var c = a[b];
                        c.transport = c.protocol ? c.protocol : "udp", c.ip = c.ip ? c.ip : c.ipAddress, 
                        c.port = c.portNumber ? Number(c.portNumber) : c.port, "ssltcp" === c.transport && (c.transport = "tcp"), 
                        c.id || (c.id = "csio" + c.port);
                    }
                    return a;
                }
            }, {
                key: "normalizeCanidatePairs",
                value: function(a) {
                    for (var b = 0; b < a.length; b += 1) {
                        var c = a[b];
                        "in-progress" === c.state && (c.state = "inprogress"), c.state || (c.state = "succeeded"), 
                        c.nominated || (c.nominated = "true" === c.googActiveConnection), c.priority || (c.priority = 123), 
                        c.id || (c.id = "csio" + c.priority);
                    }
                    return a;
                }
            }, {
                key: "processRawStatsForIceInfo",
                value: function(a) {
                    var b = [], c = [], d = [], e = void 0;
                    if (!a) return {
                        localIceCandidates: b,
                        remoteIceCandidates: c,
                        iceCandidatePairs: d
                    };
                    for (var f = 0; f < a.length; ++f) {
                        var g = this.getParsedStats(a[f]), h = this.statsClassifier(g);
                        if (h.candidatePair) d.push(h.candidatePair); else if (h.transportStats) {
                            if ("transport" === h.transportStats.type) {
                                e = h.transportStats.selectedCandidatePairId;
                                continue;
                            }
                            d.push(h.transportStats);
                        } else h.localCandidate ? b.push(h.localCandidate) : h.remoteCandidate && c.push(h.remoteCandidate);
                    }
                    if (e) for (var i = 0; i < d.length; ++i) d[i].id === e && (d[i].googActiveConnection = "true");
                    return {
                        localIceCandidates: this.normalizeIceCandidates(b),
                        remoteIceCandidates: this.normalizeIceCandidates(c),
                        iceCandidatePairs: this.normalizeCanidatePairs(d)
                    };
                }
            }, {
                key: "processRawStats",
                value: function(a, b) {
                    var c = {}, d = {}, e = {};
                    c.tracks = [], c.candidatePair = [], c.transportStats = [], c.trackStats = [], c.codec = [];
                    for (var f = 0; f < a.length; f++) {
                        var g = this.getParsedStats(a[f]), h = this.statsClassifier(g);
                        h.tracks ? c.tracks.push(h.tracks) : h.candidatePair ? c.candidatePair.push(h.candidatePair) : h.transportStats ? this.codeBase !== j.codeBaseType.firefox ? (parseInt(h.transportStats.bytesReceived, 10) > 0 || parseInt(h.transportStats.bytesSent, 10) > 0) && (c.transportStats.push(h.transportStats), 
                        "true" !== h.transportStats.googActiveConnection && !0 !== h.transportStats.googActiveConnection || (c.activeConnectionIndex = h.transportStats.length)) : "true" !== h.transportStats.selected && !0 !== h.transportStats.selected || (c.transportStats.push(h.transportStats), 
                        c.activeConnectionIndex = h.transportStats.length) : h.bwe ? c.bwe = h.bwe : h.trackStats ? c.trackStats.push(h.trackStats) : h.codec ? c.codec.push(h.codec) : h.localCandidate ? d[h.localCandidate.id] = h.localCandidate : h.remoteCandidate && (e[h.remoteCandidate.id] = h.remoteCandidate);
                    }
                    if (c.tracks) {
                        var i = l.Registry.getConferenceManager().getConferenceForPcHash(b), k = void 0;
                        i && (k = i.getPeerConnectionManager().getPcHandlerByHash(b)), c.tracks.forEach(function(a) {
                            var b = k.getSSRCInfo(a.data.ssrc);
                            void 0 !== b && b.localStartTime || k && (k.updateSDP(c.tracks), b = k.getSSRCInfo(a.data.ssrc)), 
                            b && (a.cname = b.cname, a.msid = b.msid, a.associatedVideoTag = b.associatedVideoTag, 
                            a.usageLabel = b.usageLabel);
                        });
                    }
                    return c.transportStats && this.codeBase === j.codeBaseType.firefox && (c.transportStats = this.getAddressInfoFromCandidates(c.transportStats, d, e)), 
                    c;
                }
            }, {
                key: "getParsedStats",
                value: function(a) {
                    var b = {};
                    if (a.timestamp instanceof Date && (b.timestamp = a.timestamp.getTime().toString()), 
                    a.type && (b.type = a.type), a.names) {
                        for (var c = a.names(), d = 0; d < c.length; ++d) b[c[d]] = a.stat(c[d]);
                        a.id && (b.id = a.id);
                    } else Object.assign(b, a);
                    if (b.values) {
                        for (var e = 0; e < b.values.length; ++e) Object.assign(b, b.values[e]);
                        delete b.values;
                    }
                    return b;
                }
            }, {
                key: "statsClassifier",
                value: function(a) {
                    var b = {}, c = function() {
                        for (var b = arguments.length, c = Array(b), d = 0; d < b; d++) c[d] = arguments[d];
                        return -1 !== c.indexOf(a.type);
                    }, d = c("inbound-rtp", "inboundrtp", "remote-inbound-rtp"), e = "true" === a.isRemote || !0 === a.isRemote;
                    return d || c("outbound-rtp", "outboundrtp", "remote-outbound-rtp") ? (b.tracks = {}, 
                    b.tracks.data = a, b.tracks.ssrc = a.ssrc, b.tracks.streamType = d ? "inbound" : "outbound", 
                    b.tracks.reportType = "local", void 0 !== a.isRemote && (b.tracks.reportType = e ? "remote" : "local")) : c("candidatepair") && a.selected ? b.transportStats = a : c("localcandidate", "local-candidate") ? b.localCandidate = a : c("remotecandidate", "remote-candidate") ? b.remoteCandidate = a : c("transport", "googCandidatePair") ? b.transportStats = a : c("VideoBwe") ? b.bwe = a : c("track") ? b.trackStats = a : c("candidate-pair") ? b.candidatePair = a : c("codec") ? b.codec = a : c("ssrc") && (b.tracks = {}, 
                    b.tracks.data = a, b.tracks.ssrc = a.ssrc, b.tracks.reportType = "local", b.tracks.streamType = a.bytesSent ? "outbound" : "inbound"), 
                    b;
                }
            }, {
                key: "getAddressInfoFromCandidates",
                value: function(a, b, c) {
                    for (var d = void 0, e = void 0, f = 0; f < a.length; f++) d = b[a[f].localCandidateId], 
                    e = c[a[f].remoteCandidateId], d && e && (a[f].localAddr = d.ipAddress + ":" + d.portNumber, 
                    a[f].remoteAddr = e.ipAddress + ":" + e.portNumber, a[f].localAddrType = d.candidateType, 
                    a[f].remoteAddrType = e.candidateType, a[f].transportType = d.transport);
                    return a;
                }
            }, {
                key: "getTransportHash",
                value: function(a) {
                    var b = void 0;
                    return a && (this.codeBase === j.codeBaseType.chrome ? a.googLocalAddress ? (b = a.googLocalAddress, 
                    b.concat(":", a.googRemoteAddress)) : a.selectedCandidatePairId && (b = a.selectedCandidatePairId) : this.codeBase === j.codeBaseType.firefox && (b = a.localAddr, 
                    b.concat(":", a.remoteAddr))), n.generateHash(b);
                }
            }, {
                key: "backFillTrackStats",
                value: function(a) {
                    for (var b = a.tracks.length, c = void 0, d = void 0, e = void 0, f = 0; f < b; f++) c = a.tracks[f], 
                    c.data.trackId && (d = this.getStatsForId(a.trackStats, c.data.trackId)) && (a.tracks[f].data = this.mergeObjects(a.tracks[f].data, d)), 
                    c.data.codecId && (e = this.getStatsForId(a.codec, c.data.codecId)) && (a.tracks[f].data = this.mergeObjects(a.tracks[f].data, e));
                    return a;
                }
            }, {
                key: "backFillCandidatePairStats",
                value: function(a) {
                    for (var b = a.transportStats.length, c = void 0, d = void 0, e = 0; e < b; e++) d = a.transportStats[e], 
                    d.selectedCandidatePairId && (c = this.getStatsForId(a.candidatePair, d.selectedCandidatePairId)) && (a.transportStats[e] = this.mergeObjects(a.transportStats[e], c));
                    return a;
                }
            }, {
                key: "mergeObjects",
                value: function(a, b) {
                    for (var c in b) b.hasOwnProperty(c) && "id" !== c && "type" !== c && (a[c] = b[c]);
                    return a;
                }
            }, {
                key: "getStatsForId",
                value: function(a, b) {
                    if (a) {
                        var c = a.filter(function(a) {
                            return a.id === b;
                        });
                        if (c.length > 0) return c[0];
                    }
                }
            }, {
                key: "formatRelayType",
                value: function(a) {
                    var b = "None";
                    switch (a) {
                      case 0:
                        b = "TURN/TLS";
                        break;

                      case 1:
                        b = "TURN/TCP";
                        break;

                      case 2:
                        b = "TURN/UDP";
                    }
                    return b;
                }
            }, {
                key: "getRelayType",
                value: function(a, b) {
                    var c = this, d = void 0, e = function(b) {
                        if (b.typePreference) {
                            var e = b.typePreference >> 24;
                            return "rtp" === b.protocol && b.address === a && (e >= 0 && e <= 2 && (d = c.formatTypePreference(e)), 
                            !0);
                        }
                        return !1;
                    };
                    return b.getIceCandidates().some(e), d;
                }
            }, {
                key: "getTransportInfo",
                value: function(a, b) {
                    for (var c = {}, d = !1, e = 0; e < a.length; e++) {
                        var f = a[e];
                        if (navigator.mozGetUserMedia && "candidatepair" === f.type && ("true" === f.selected || !0 === f.selected)) {
                            c.foundActive = !0, c.localAddr = f.localAddr, c.remoteAddr = f.remoteAddr, c.localAddrType = f.localAddrType, 
                            c.remoteAddrType = f.remoteAddrType, c.transportType = f.transportType, c.localCandidateId = f.localCandidateId, 
                            c.remoteCandidateId = f.remoteCandidateId;
                            break;
                        }
                        if ("googCandidatePair" === f.type && ("true" === f.googActiveConnection || !0 === f.googActiveConnection)) {
                            c.foundActive = !0, c.localAddr = f.googLocalAddress, c.remoteAddr = f.googRemoteAddress, 
                            c.localAddrType = f.googLocalCandidateType, c.remoteAddrType = f.googRemoteCandidateType, 
                            c.transportType = f.googTransportType;
                            break;
                        }
                        if ("transport" === f.type) {
                            d = !0, f.selectedCandidatePairId && (c.selectedCandidatePairId = f.selectedCandidatePairId);
                            break;
                        }
                    }
                    return d && c.localAddr && (c.ipv6 = 0 === c.localAddr.indexOf("["), c.relayType = getRelayType(c.localAddr, b)), 
                    c;
                }
            }, {
                key: "sendFabricTransportSwitch",
                value: function(a, b) {
                    a.sendFabricTransportSwitch(b);
                }
            }, {
                key: "checkTransportStatsUpdates",
                value: function(a, b) {
                    var c = l.Registry.getConferenceManager().getConferenceForPcHash(b);
                    if (c) {
                        var d = c.getPeerConnectionManager().getPcHandlerByHash(b);
                        if (d) {
                            var e = this.getTransportInfo(a, d), f = d.getTransportInfo();
                            f && (f.localAddr === e.localAddr && f.remoteAddr === e.remoteAddr && f.transportType === e.transportType && f.selectedCandidatePairId === e.selectedCandidatePairId && f.localCandidateId === e.localCandidateId && f.remoteCandidateId === e.remoteCandidateId || (d.setTransportInfo(e), 
                            this.sendFabricTransportSwitch(d, e.relayType)));
                        }
                    }
                }
            } ]), b;
        }(k.Component);
        c.StatsAdapter = p;
    }, {
        "../collections/component": 26,
        "../config/constants": 33,
        "../utility/hash": 92,
        "../utility/registry": 95
    } ],
    70: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.StatsAssembler = c.StatsAssemblerIO = void 0;
        var g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = a("../collections/component"), i = c.StatsAssemblerIO = {
            StatsTupleIn: "StatsTupleIn",
            CallstatsOut: "CallstatsOut"
        }, j = function(a) {
            function b() {
                d(this, b);
                var a = e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, "StatsAssembler"));
                return a.pcHashes = [], a.bindPort(i.StatsTupleIn, a.receiveStats, a), a.declarePort(i.CallstatsOut), 
                a;
            }
            return f(b, a), g(b, [ {
                key: "receiveStats",
                value: function(a) {
                    for (var b = this, c = 0; c < a.tracks.length; c++) {
                        (function(c) {
                            var d = a.tracks[c];
                            if (b.pcHashes.find(function(a) {
                                return a === d.pcHash;
                            })) return "continue";
                            b.pcHashes.push(d.pcHash);
                        })(c);
                    }
                    for (var d = a.getTransportStats(), c = 0; c < this.pcHashes.length; c++) {
                        var e = this.pcHashes[c], f = {};
                        f.codec = a.getCodec(), f.trackStats = a.getTrackStats(), f.tracks = [];
                        for (var g = 0; g < a.tracks.length; g++) {
                            var h = a.tracks[g];
                            h.pcHash === e && f.tracks.push(h);
                        }
                        var j = d.get(e);
                        1 == j.length ? f.Transport = j[0] : f.Transport = j, this.transmit(i.CallstatsOut, e, f);
                    }
                }
            } ]), b;
        }(h.Component);
        c.StatsAssembler = j;
    }, {
        "../collections/component": 26
    } ],
    71: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.StatsCallbackBuilder = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("../utility/registry"), g = function() {
            function a() {
                d(this, a), this.callback = null;
            }
            return e(a, [ {
                key: "setCallback",
                value: function(a) {
                    this.callback = a;
                }
            }, {
                key: "buildStats",
                value: function(a, b) {
                    this.callback && this.buildFromUnifiedFormat(a, b);
                }
            }, {
                key: "getConnectionState",
                value: function() {
                    return !0 === navigator.onLine ? "online" : "offline";
                }
            }, {
                key: "buildConferenceUrl",
                value: function(a) {
                    var b = a.getConferenceId(), c = f.Registry.getConferenceManager().get(b);
                    return c ? c.getUrl() : null;
                }
            }, {
                key: "buildFromUnifiedFormat",
                value: function(a, b) {
                    var c = {};
                    c.connectionState = this.getConnectionState(), c.conferenceURL = this.buildConferenceUrl(b), 
                    c.fabricState = b.getPcState(), c.streams = {}, c.mediaStreamTracks = [];
                    for (var d = 0; d < a.length; d++) {
                        var e = a[d];
                        if ("inbound-rtp" === e.type || "outbound-rtp" === e.type || "ssrc" === e.type || "inboundrtp" === e.type || "outboundrtp" === e.type) {
                            var f = {
                                ssrc: e.ssrc,
                                statsType: e.type,
                                fractionLoss: e.csioIntFL,
                                bitrate: e.csioIntBRKbps,
                                quality: e.csioMark,
                                mediaType: e.csioMediaType,
                                jitter: e.jitter,
                                audioOutputLevel: e.audioOutputLevel,
                                audioIntputLevel: e.audioInputLevel,
                                audioLevel: e.audioLevel,
                                averageRTT: e.csioAvgRtt,
                                averageJitter: e.csioAvgJitter,
                                packetLossPercentage: e.csioPktLossPercentage,
                                rtt: e.roundTripTime,
                                packetRate: e.csioIntPR,
                                remoteUserID: b.getRemoteId()
                            }, g = b.getSSRCInfo(e.ssrc + "");
                            if (g && (f.cname = g.cname, f.msid = g.msid, f.usageLabel = g.usageLabel, f.associatedVideoTag = g.associatedVideoTag), 
                            e.hasOwnProperty("googRtt") && (f.rtt = e.googRtt), e.hasOwnProperty("mozRtt") && (f.rtt = e.mozRtt), 
                            e.hasOwnProperty("googJitterReceived") && (f.jitter = e.googJitterReceived), "inboundrtp" === f.statsType) f.statsType = "inbound-rtp"; else if ("outboundrtp" === f.statsType) f.statsType = "outbound-rtp"; else if ("ssrc" === f.statsType) {
                                var h = e.id;
                                h.indexOf("send") > 0 ? f.statsType = "outbound-rtp" : f.statsType = "inbound-rtp";
                            }
                            "remote-inbound-rtp" !== f.statsType && "remote-outbound-rtp" !== f.statsType && (!0 !== e.isRemote && "true" !== e.isRemote || (f.statsType = "remote-" + f.statsType)), 
                            c.streams[e.ssrc] = f, c.mediaStreamTracks.push(f);
                        }
                    }
                    this.callback(c);
                }
            } ]), a;
        }();
        c.StatsCallbackBuilder = g;
    }, {
        "../utility/registry": 95
    } ],
    72: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function g(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.StatsMonitor = c.StatsMonitorIO = void 0;
        var h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = a("../collections/component"), j = a("./tracksmonitor"), k = a("./transportsmonitor"), l = a("./statstuple"), m = a("../utility/registry"), n = a("./monitorhooks/sendingtrigger"), o = a("./monitorhooks/onewaymediaobserver"), p = a("./monitorhooks/throughputobserver"), q = a("./monitorhooks/cpulimitationobserver"), r = a("./monitorhooks/qpsumobserver"), s = a("../config/constants"), t = d(s), u = a("../utility/csiologger"), v = d(u), w = c.StatsMonitorIO = {
            PcStatsTupleIn: "PcStatsTupleIn",
            StatsTupleOut: "StatsTupleOut"
        }, x = function(a) {
            function b(a) {
                e(this, b);
                var c = f(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, "StatsMonitor"));
                return c.bindPort(w.PcStatsTupleIn, c.receive, c), c.declarePort(w.StatsTupleOut), 
                c.lastPcStats = null, c.lastPcHash = null, c.tracksmonitor = new j.TracksMonitor(), 
                c.transportsmonitor = new k.TransportsMonitor(a), c.candidatepairs = new Map(), 
                c.monitorhooks = [], c.sendingTrigger = new n.SendingTrigger(c.sendStatsTuple.bind(c)), 
                c.oneWayMediaObserver = new o.OneWayMediaObserver(c.sendDisruptions.bind(c)), c.throughputObserver = new p.ThroughputObserver(c.sendThroughputObservations.bind(c)), 
                c.cpuLimitationObserver = new q.CPULimitationObserver(c.sendCPULimitationObservations.bind(c)), 
                c.qpSumObserver = new r.QPSumObserver(c.sendQPSumDistortions.bind(c)), c.setupHooks(), 
                c;
            }
            return g(b, a), h(b, [ {
                key: "setupHooks",
                value: function() {
                    this.monitorhooks.push(this.sendingTrigger.accept.bind(this.sendingTrigger)), this.monitorhooks.push(this.oneWayMediaObserver.accept.bind(this.oneWayMediaObserver)), 
                    this.monitorhooks.push(this.throughputObserver.accept.bind(this.throughputObserver)), 
                    this.monitorhooks.push(this.cpuLimitationObserver.accept.bind(this.cpuLimitationObserver)), 
                    this.monitorhooks.push(this.qpSumObserver.accept.bind(this.qpSumObserver));
                }
            }, {
                key: "setIntervals",
                value: function(a, b) {
                    this.sendingTrigger.setup(a, b);
                }
            }, {
                key: "receive",
                value: function(a) {
                    var b = a.getPcHash(), c = a.getMeasurements();
                    this.candidatepairs.set(b, a.getCandidatePair()), this.transportsmonitor.set(b, a.getTransportStats());
                    for (var d = 0; d < c.length; d++) {
                        var e = c[d], f = this.tracksmonitor.getMonitor(e);
                        f ? f.add(e) : v.warn("No monitor for ssrc " + e.getSSRC());
                    }
                    this.lastPcStats = a, this.lastPcHash = b;
                    for (var g = this.tracksmonitor.getMonitors(), h = this.monitorhooks, i = 0; i < h.length; i++) {
                        (0, h[i])(g);
                    }
                }
            }, {
                key: "getCandidatePairs",
                value: function() {
                    var a = [];
                    return this.candidatepairs.forEach(function(b, c) {
                        var d = [ c, b ];
                        a.push(d);
                    }), a;
                }
            }, {
                key: "sendStatsTuple",
                value: function() {
                    var a = new l.StatsTuple(this.getCandidatePairs(), this.lastPcStats.getCodec(), this.lastPcStats.getTrackStats(), this.transportsmonitor.getIntervalStats(), this.tracksmonitor.extractTracks());
                    this.transmit(w.StatsTupleOut, a);
                }
            }, {
                key: "sendDisruptions",
                value: function(a) {
                    var b = this;
                    a.forEach(function(a) {
                        b.sendEventMsg(t.internalFabricEvent.oneWayMedia, a.getContent());
                    });
                }
            }, {
                key: "sendCPULimitationObservations",
                value: function(a) {}
            }, {
                key: "sendQPSumDistortions",
                value: function(a) {}
            }, {
                key: "sendThroughputObservations",
                value: function(a) {
                    this.sendEventMsg(t.internalFabricEvent.sendingThroughputObservations, a);
                }
            }, {
                key: "sendEventMsg",
                value: function(a, b) {
                    if (this.lastPcHash) {
                        var c = m.Registry.getConferenceManager().getConferenceForPcHash(this.lastPcHash);
                        if (c) {
                            var d = c.getPeerConnectionManager().getPcHandlerByHash(this.lastPcHash), e = d.getPeerConnection(), f = d.getConferenceId();
                            m.Registry.getEventMessageBuilder().make(a, f, e, b);
                        }
                    }
                }
            } ]), b;
        }(i.Component);
        c.StatsMonitor = x;
    }, {
        "../collections/component": 26,
        "../config/constants": 33,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "./monitorhooks/cpulimitationobserver": 61,
        "./monitorhooks/onewaymediaobserver": 62,
        "./monitorhooks/qpsumobserver": 63,
        "./monitorhooks/sendingtrigger": 64,
        "./monitorhooks/throughputobserver": 65,
        "./statstuple": 75,
        "./tracksmonitor": 81,
        "./transportsmonitor": 82
    } ],
    73: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function g(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.StatsParser = c.StatsParserIO = void 0;
        var h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = a("../collections/component"), j = a("./measurement"), k = a("./pcstats"), l = a("../utility/rttregistry"), m = a("./validator"), n = d(m), o = a("../config/constants"), p = d(o), q = a("../utility/csiologger"), r = d(q), s = c.StatsParserIO = {
            RawStatsIn: "RawStatsIn",
            PcStatsTupleOut: "PcStatsTupleOut"
        }, t = function(a) {
            function b() {
                e(this, b);
                var a = f(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, "StatsParser"));
                return a.bindPort(s.RawStatsIn, a.receive, a), a.declarePort(s.PcStatsTupleOut), 
                a;
            }
            return g(b, a), h(b, [ {
                key: "receive",
                value: function(a) {
                    if (null === a) return void r.warn("Stats object can not be null");
                    for (var b = a.tracks, c = [], d = 0; d < b.length; ++d) {
                        var e = b[d];
                        if (e && e.data) {
                            var f = j.Measurement.make(a.pcHash, this.getSSRC(e), this.getStreamType(e), this.getMediaType(e), this.getFrameRateReceived(e), this.getFrameHeight(e), this.getFrameWidth(e), this.getDroppedFramesNum(e), this.getFramesReceived(e), this.getRTT(e), this.getJitter(e), this.getLostPackets(e), this.getReceivedPackets(e), this.getSentPackets(e), this.getDiscardedPackets(e), this.getSentBytes(e), this.getReceivedBytes(e), e);
                            c.push(f);
                        } else r.log("No track or track.data.");
                    }
                    var g = new k.PcStats(a.candidatePair, a.codec, a.pcHash, a.trackStats, a.transportStats, c);
                    this.transmit(s.PcStatsTupleOut, g);
                }
            }, {
                key: "getSSRC",
                value: function(a) {
                    return a.ssrc;
                }
            }, {
                key: "getStreamType",
                value: function(a) {
                    return a.streamType === p.streamType.inbound ? p.streamType.inbound : a.streamType === p.streamType.outbound ? p.streamType.outbound : void 0;
                }
            }, {
                key: "getSentBytes",
                value: function(a) {
                    if (void 0 === a.data.bytesSent) return -1;
                    var b = n.checkForNan(parseInt(a.data.bytesSent, 10));
                    return null !== b ? b : -1;
                }
            }, {
                key: "getReceivedBytes",
                value: function(a) {
                    if (void 0 === a.data.bytesReceived) return -1;
                    var b = n.checkForNan(parseInt(a.data.bytesReceived, 10));
                    return null !== b ? b : -1;
                }
            }, {
                key: "getReceivedPackets",
                value: function(a) {
                    if (void 0 === a.data.packetsReceived) return -1;
                    var b = n.checkForNegativeValue(parseInt(a.data.packetsReceived, 10));
                    return null !== b ? b : -1;
                }
            }, {
                key: "getSentPackets",
                value: function(a) {
                    if (void 0 === a.data.packetsSent) return -1;
                    var b = n.checkForNegativeValue(parseInt(a.data.packetsSent, 10));
                    return null !== b ? b : -1;
                }
            }, {
                key: "getDiscardedPackets",
                value: function(a) {
                    if (void 0 === a.data.discardedPackets) return -1;
                    var b = n.checkForNan(parseInt(a.data.discardedPackets, 10));
                    return null !== b ? b : -1;
                }
            }, {
                key: "getLostPackets",
                value: function(a) {
                    if (void 0 === a.data.packetsLost) return -1;
                    var b = n.checkForNegativeValue(parseInt(a.data.packetsLost, 10));
                    return null !== b ? b : -1;
                }
            }, {
                key: "getDroppedFramesNum",
                value: function(a) {
                    if (void 0 === a.data.droppedFrames) return -1;
                    var b = n.checkForNegativeValue(parseInt(a.data.droppedFrames, 10));
                    return null !== b ? b : -1;
                }
            }, {
                key: "getFramesReceived",
                value: function(a) {
                    if (void 0 === a.data.framesReceived) return -1;
                    var b = n.checkForNegativeValue(parseInt(a.data.framesReceived, 10));
                    return null !== b ? b : -1;
                }
            }, {
                key: "getFrameRateReceived",
                value: function(a) {
                    var b = null;
                    return void 0 !== a.data.googFrameRateOutput ? b = parseInt(a.data.googFrameRateOutput, 10) : void 0 !== a.data.googFrameRateDecoded ? b = parseInt(a.data.googFrameRateDecoded, 10) : void 0 !== a.data.googFrameRateReceived ? b = parseInt(a.data.googFrameRateReceived, 10) : void 0 !== a.data.googFrameRateSent ? b = parseInt(a.data.googFrameRateSent, 10) : void 0 !== a.data.framerateMean ? b = parseInt(a.data.framerateMean, 10) : void 0 !== a.data.framesPerSecond && (b = parseInt(a.data.framesPerSecond, 10)), 
                    void 0 !== b && (b = n.checkForNegativeValue(b)), b;
                }
            }, {
                key: "getFrameHeight",
                value: function(a) {
                    var b = void 0;
                    return void 0 !== a.data.googFrameHeightReceived ? b = a.data.googFrameHeightReceived : void 0 !== a.data.googFrameHeightSent ? b = a.data.googFrameHeightSent : void 0 !== a.data.frameHeight && (b = a.data.frameHeight), 
                    b;
                }
            }, {
                key: "getJitter",
                value: function(a) {
                    return void 0 !== a.data.googJitterReceived ? n.checkForNan(parseFloat(a.data.googJitterReceived, 10)) : void 0 !== a.data.jitter ? n.checkForNan(parseFloat(a.data.jitter, 10)) : void 0;
                }
            }, {
                key: "getFrameWidth",
                value: function(a) {
                    return void 0 !== a.data.googFrameWidthReceived ? a.data.googFrameWidthReceived : void 0 !== a.data.googFrameWidthSent ? a.data.googFrameWidthSent : void 0 !== a.data.frameWidth ? a.data.frameWidth : void 0;
                }
            }, {
                key: "getRTT",
                value: function(a) {
                    var b = function(a) {
                        return isNaN(a) || a < 0 ? null : a;
                    };
                    if (void 0 !== a.data.googRtt) return b(parseFloat(a.data.googRtt, 10));
                    if (void 0 !== a.data.mozRtt) return b(parseFloat(a.data.mozRtt, 10));
                    if (a.data.roundTripTime) return b(parseFloat(a.data.roundTripTime, 10));
                    var c = this.getSSRC(a), d = (0, l.getRTTRegistry)().getRTT(c);
                    return d && (a.data.roundTripTime = d), d;
                }
            }, {
                key: "getMediaType",
                value: function(a) {
                    var b = p.mediaType.unknown;
                    return a.data && void 0 !== a.data.mediaType ? a.data.mediaType : (void 0 !== a.data.googFrameRateReceived || void 0 !== a.data.googFrameRateSent ? b = p.mediaType.video : void 0 !== a.data.audioInputLevel || void 0 !== a.data.audioOutputLevel ? b = p.mediaType.audio : a.data.mediaType ? b = a.data.mediaType : void 0 !== a.data.framerateMean && (b = p.mediaType.video), 
                    b);
                }
            } ]), b;
        }(i.Component);
        c.StatsParser = t;
    }, {
        "../collections/component": 26,
        "../config/constants": 33,
        "../utility/csiologger": 88,
        "../utility/rttregistry": 96,
        "./measurement": 60,
        "./pcstats": 67,
        "./validator": 83
    } ],
    74: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function f(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function g(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.StatsTransmitter = c.StatsTransmitterIO = void 0;
        var h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = a("../collections/component"), j = a("../utility/registry"), k = a("../config/constants"), l = d(k), m = a("../utility/csiologger"), n = d(m), o = c.StatsTransmitterIO = {
            CallstatsIn: "CallstatsIn",
            UnprocessedIn: "UnprocessedIn"
        }, p = function(a) {
            function b() {
                e(this, b);
                var a = f(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, "StatsTransmitter"));
                return a.battery = j.Registry.getBattery(), a.lastUnprocessedStats = {}, a.bindPort(o.CallstatsIn, a.receiveCallstats, a), 
                a.bindPort(o.UnprocessedIn, a.receiveUnprocessed, a), a;
            }
            return g(b, a), h(b, [ {
                key: "receiveUnprocessed",
                value: function(a, b) {
                    this.lastUnprocessedStats[b] = a;
                }
            }, {
                key: "receiveCallstats",
                value: function(a, b) {
                    var c = null;
                    if (!(c = this.getUnifiedFormat(b, a))) return void n.warn("Content can not be sent");
                    this.send(a, c);
                }
            }, {
                key: "send",
                value: function(a, b) {
                    var c = j.Registry.getConferenceManager().getConferenceForPcHash(a);
                    if (c) {
                        var d = c.getPeerConnectionManager().getPcHandlerByHash(a);
                        if (d) {
                            var e = d.getPcState();
                            if (e !== l.fabricState.terminated && e !== l.fabricState.hold) {
                                j.Registry.getEventMessageBuilder().make(l.callstatsChannels.processedStats, d.getConferenceId(), d.getPeerConnection(), b), 
                                this.sendToStatsCallback(b.stats, d);
                            }
                        }
                    }
                }
            }, {
                key: "sendToStatsCallback",
                value: function(a, b) {
                    var c = j.Registry.getStatsCallbackBuilder();
                    c && c.buildStats(a, b);
                }
            }, {
                key: "getUnifiedFormat",
                value: function(a, b) {
                    for (var c = this.lastUnprocessedStats[b], d = [], e = 0; e < c.length; e++) {
                        var f = c[e], g = {};
                        if (f.id && (g.id = f.id), f.timestamp && (g.timestamp = f.timestamp), f.type && (g.type = f.type), 
                        f.names) for (var h = f.names(), i = 0; i < h.length; ++i) g[h[i]] = f.stat(h[i]); else Object.assign(g, f);
                        if (g.values) {
                            for (var k = 0; k < g.values.length; ++k) Object.assign(g, g.values[k]);
                            delete g.values;
                        }
                        var l = function(b) {
                            for (var c = 0; c < a.tracks.length; c++) {
                                var d = a.tracks[c];
                                if (d.data.id === b.id && d.data.type === b.type) return d.data;
                            }
                            return b.id === a.Transport.id && b.type === a.Transport.type ? a.Transport : null;
                        }(f);
                        if (l) {
                            for (var m in l) if (l.hasOwnProperty(m)) {
                                if ("id" === m || "type" === m || "timestamp" === m) continue;
                                g[m] = l[m];
                            }
                            d.push(g);
                        } else d.push(g);
                    }
                    var n = {
                        stats: d
                    };
                    return n.wifiStats = j.Registry.getWifiStatsExecutor().getWifiStats(), n.batteryStatus = {}, 
                    n.batteryStatus.batteryLevel = this.battery.getLevel(), n.batteryStatus.isBatteryCharging = this.battery.getCharging(), 
                    n;
                }
            } ]), b;
        }(i.Component);
        c.StatsTransmitter = p;
    }, {
        "../collections/component": 26,
        "../config/constants": 33,
        "../utility/csiologger": 88,
        "../utility/registry": 95
    } ],
    75: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a(b, c, e, f, g) {
                d(this, a), this.candidatePairs = b, this.codec = c, this.trackStats = e, this.transportStats = f, 
                this.tracks = g;
            }
            return e(a, [ {
                key: "getCandidatePairs",
                value: function() {
                    return this.candidatePairs;
                }
            }, {
                key: "getCodec",
                value: function() {
                    return this.codec;
                }
            }, {
                key: "getTrackStats",
                value: function() {
                    return this.trackStats;
                }
            }, {
                key: "getTransportStats",
                value: function() {
                    return this.transportStats;
                }
            }, {
                key: "getTracks",
                value: function() {
                    return this.tracks;
                }
            } ]), a;
        }();
        c.StatsTuple = f;
    }, {} ],
    76: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.SWAvg = void 0;
        var g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = a("./swplugin"), i = function(a) {
            function b(a, c) {
                var f = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                d(this, b);
                var g = e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, a, c, f));
                return g.sum = 0, g.counter = 0, g;
            }
            return f(b, a), g(b, [ {
                key: "add",
                value: function(a) {
                    this.filter(a) && (this.sum += this.extract(a), ++this.counter, this.calculate());
                }
            }, {
                key: "remove",
                value: function(a) {
                    this.filter(a) && (this.sum -= this.extract(a), --this.counter, this.calculate());
                }
            }, {
                key: "calculate",
                value: function() {
                    var a = 0;
                    if (this.counter < 1) return void this.notify(a);
                    a = this.sum / this.counter, this.notify(a);
                }
            } ]), b;
        }(h.SWPlugin);
        c.SWAvg = i;
    }, {
        "./swplugin": 79
    } ],
    77: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.SWBTreePercentile = void 0;
        var g = function() {
            function a(a, b) {
                var c = [], d = !0, e = !1, f = void 0;
                try {
                    for (var g, h = a[Symbol.iterator](); !(d = (g = h.next()).done) && (c.push(g.value), 
                    !b || c.length !== b); d = !0) ;
                } catch (a) {
                    e = !0, f = a;
                } finally {
                    try {
                        !d && h.return && h.return();
                    } finally {
                        if (e) throw f;
                    }
                }
                return c;
            }
            return function(b, c) {
                if (Array.isArray(b)) return b;
                if (Symbol.iterator in Object(b)) return a(b, c);
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            };
        }(), h = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), i = a("./swplugin"), j = a("../../collections/binarytree"), k = function(a) {
            function b(a, c, f, g) {
                var h = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : null, i = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : null, k = arguments.length > 6 && void 0 !== arguments[6] ? arguments[6] : null;
                d(this, b);
                var l = e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, f, g, i));
                if (99 < a || a < 1) throw new RangeError("Percentile parameter must be between 1 and 99");
                return l.comparator = c, l.percentile = a, l.meanCalcer = k, l.estimator = h, l.ratio = a / (100 - a), 
                l.maxtree = new j.BinaryTree(c), l.mintree = new j.BinaryTree(c), l.ratio < 1 ? l.required = 1 / l.ratio + 1 : 1 < l.ratio ? l.required = l.ratio + 1 : l.required = 2, 
                l.result = null, l;
            }
            return f(b, a), h(b, [ {
                key: "add",
                value: function(a) {
                    if (this.filter(a)) {
                        if (this.maxtree.getNodeCounter() < 1) return this.maxtree.insert(a), void this.calculate();
                        this.comparator(a, this.maxtree.getTopValue()) <= 0 ? this.maxtree.insert(a) : this.mintree.insert(a), 
                        this.balancing(), this.calculate();
                    }
                }
            }, {
                key: "remove",
                value: function(a) {
                    if (this.filter(a)) {
                        var b = this.mintree.getNodeCounter();
                        this.maxtree.getNodeCounter() < 1 ? this.mintree.delete(a) : b < 1 ? this.maxtree.delete(a) : this.comparator(a, this.maxtree.getTopValue()) <= 0 ? this.maxtree.delete(a) : this.mintree.delete(a), 
                        this.calculate();
                    }
                }
            }, {
                key: "getThresholds",
                value: function() {
                    var a = this.mintree.getSize(), b = this.maxtree.getSize(), c = a + 1, d = b + 1;
                    return 1 < this.ratio ? (c = Math.ceil(a * this.ratio), d = Math.floor(b / this.ratio) + 1) : this.ratio < 1 && (c = Math.floor(a * this.ratio) + 1, 
                    d = Math.ceil(b / this.ratio)), [ c, d ];
                }
            }, {
                key: "balancing",
                value: function() {
                    var a = this.mintree, b = this.maxtree, c = a.getSize(), d = b.getSize();
                    if (!(d + c < this.required)) {
                        if (c < 1) return void a.insertNodeAtBottom(b.popTopNode());
                        for (d < 1 && b.insertNodeAtTop(a.popBottomNode()); ;) {
                            var e = 1 < a.getNodeCounter(), f = 1 < b.getNodeCounter(), h = a.getBottomNode().getLength(), i = b.getTopNode().getLength();
                            if (a.getNodeCounter() < 1 || b.getNodeCounter() < 1) break;
                            var j = this.getThresholds(), k = g(j, 2), l = k[0], m = k[1];
                            if (f &= c + i <= m, e &= d + h <= l, c = a.getSize(), d = b.getSize(), l < d && f) a.insertNodeAtBottom(b.popTopNode()); else {
                                if (!(m < c && e)) break;
                                b.insertNodeAtTop(a.popBottomNode());
                            }
                        }
                    }
                }
            }, {
                key: "getMean",
                value: function(a, b) {
                    return this.meanCalcer ? this.meanCalcer(a, b) : a;
                }
            }, {
                key: "estimate",
                value: function(a, b) {
                    return this.estimator ? this.estimator(a, b) : null;
                }
            }, {
                key: "calculate",
                value: function() {
                    var a = null, b = this.mintree, c = this.maxtree, d = b.getSize(), e = c.getSize(), f = e + d;
                    if (!(f < 1)) {
                        if (f < this.required || d < 1 || e < 1) {
                            if (0 == f) return;
                            var g = void 0, h = void 0;
                            d < 1 ? (g = this.maxtree.getBottomValue(), h = this.maxtree.getTopValue()) : e < 1 ? (g = this.mintree.getBottomValue(), 
                            h = this.mintree.getTopValue()) : (h = this.mintree.getTopValue(), g = this.maxtree.getBottomValue());
                            var i = this.estimate(g, h);
                            return void this.notify(i);
                        }
                        var j = c.getTopNode(), k = b.getBottomNode();
                        if (j || k) {
                            if (!j) {
                                var l = this.extract(k);
                                return void this.notify(l);
                            }
                            if (!k) {
                                var m = this.extract(j);
                                return void this.notify(m);
                            }
                            var n = f * (this.percentile / 100);
                            if (!Number.isInteger(n)) {
                                var o = e / d;
                                a = this.ratio < o ? j.peek() : o < this.ratio ? k.peek() : this.ratio < 1 ? k.peek() : j.peek();
                            } else {
                                var p = Math.floor(n);
                                a = Math.ceil(n + 1) <= e ? j.peek() : p <= e ? this.getMean(j.peek(), k.peek()) : k.peek();
                            }
                            var q = this.extract(a);
                            this.notify(q);
                        }
                    }
                }
            } ]), b;
        }(i.SWPlugin);
        c.SWBTreePercentile = k;
    }, {
        "../../collections/binarytree": 23,
        "./swplugin": 79
    } ],
    78: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.SWFunctor = void 0;
        var g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = a("./swplugin"), i = function(a) {
            function b(a, c) {
                var f = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                d(this, b);
                var g = e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, null, null, f));
                return g.addFunc = a, g.remFunc = c, g;
            }
            return f(b, a), g(b, [ {
                key: "add",
                value: function(a) {
                    this.filter(a) && this.addFunc && this.addFunc(a);
                }
            }, {
                key: "remove",
                value: function(a) {
                    this.filter(a) && this.remFunc && this.remFunc(a);
                }
            }, {
                key: "toString",
                value: function() {
                    return "SWFuncPlugin";
                }
            } ]), b;
        }(h.SWPlugin);
        c.SWFunctor = i;
    }, {
        "./swplugin": 79
    } ],
    79: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.SWPlugin = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("../../utility/csiologger"), g = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(f), h = function() {
            function a(b, c) {
                var e = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                d(this, a), this.extractorFnc = b, this.notifierFnc = c, this.filterFunc = e;
            }
            return e(a, [ {
                key: "notify",
                value: function(a) {
                    if (!this.notifierFnc) return void g.warn("Failed notification for " + this.toString());
                    this.notifierFnc(a);
                }
            }, {
                key: "extract",
                value: function(a) {
                    return this.extractorFnc ? this.extractorFnc(a) : (g.warn(this.toString() + " tried to extract without extractorFnc"), 
                    null);
                }
            }, {
                key: "filter",
                value: function(a) {
                    return !this.filterFunc || this.filterFunc(a);
                }
            }, {
                key: "add",
                value: function(a) {
                    g.log("Abstract method is called width value: " + a);
                }
            }, {
                key: "remove",
                value: function(a) {
                    g.log("Abstract method is called with value: " + a);
                }
            }, {
                key: "toString",
                value: function() {
                    return "SWPlugin";
                }
            } ]), a;
        }();
        c.SWPlugin = h;
    }, {
        "../../utility/csiologger": 88
    } ],
    80: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !b || "object" != typeof b && "function" != typeof b ? a : b;
        }
        function f(a, b) {
            if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
            a.prototype = Object.create(b && b.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), b && (Object.setPrototypeOf ? Object.setPrototypeOf(a, b) : a.__proto__ = b);
        }
        function g(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function h(a, b) {
            return b.green <= a ? t.avQualityRatings.excellent : b.red < a ? t.avQualityRatings.fair : t.avQualityRatings.bad;
        }
        function i(a, b) {
            return b.red < a ? t.avQualityRatings.bad : b.green <= a ? t.avQualityRatings.fair : t.avQualityRatings.excellent;
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.TrackMonitor = void 0;
        var j = function a(b, c, d) {
            null === b && (b = Function.prototype);
            var e = Object.getOwnPropertyDescriptor(b, c);
            if (void 0 === e) {
                var f = Object.getPrototypeOf(b);
                return null === f ? void 0 : a(f, c, d);
            }
            if ("value" in e) return e.value;
            var g = e.get;
            if (void 0 !== g) return g.call(d);
        }, k = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), l = a("../utility/registry"), m = a("../collections/slidingwindow"), n = a("../statspipeline/swplugins/swavg"), o = a("../statspipeline/swplugins/swbtreepercentile"), p = a("../statspipeline/swplugins/swfunctor"), q = a("../utility/timestamps"), r = d(q), s = a("../config/constants"), t = d(s), u = a("../utility/csiologger"), v = d(u), w = a("../utility/rttregistry"), x = function() {
            function a() {
                g(this, a), this.evaluators = [];
            }
            return k(a, [ {
                key: "addEvaluator",
                value: function(a) {
                    var b = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1, c = {
                        processFnc: a,
                        weight: b
                    };
                    this.evaluators.push(c);
                }
            }, {
                key: "getQuality",
                value: function(a) {
                    for (var b = 0, c = [], d = 0, e = 0; e < this.evaluators.length; e++) {
                        var f = this.evaluators[e], g = 0, h = f.processFnc ? f.processFnc(a) : 0;
                        if (h) {
                            if (h === t.avQualityRatings.bad) g = t.qualityRating.bad; else if (h === t.avQualityRatings.fair) g = t.qualityRating.fair; else if (h === t.avQualityRatings.excellent) g = t.qualityRating.excellent; else if (h === t.avQualityRatings.unknown) continue;
                            b += f.weight, c.push({
                                result: g,
                                weight: f.weight
                            });
                        }
                    }
                    for (var i = 0; i < c.length; i++) {
                        var j = c[i];
                        d += j.result * (j.weight / b);
                    }
                    return d = Math.floor(d), d === t.qualityRating.excellent ? t.avQualityRatings.excellent : d === t.qualityRating.good ? t.avQualityRatings.fair : d === t.qualityRating.fair ? t.avQualityRatings.fair : d === t.qualityRating.poor ? t.avQualityRatings.fair : d === t.qualityRating.bad ? t.avQualityRatings.bad : void 0;
                }
            } ]), a;
        }(), y = function(a) {
            function b(a, c, d, f) {
                g(this, b);
                var h = e(this, (b.__proto__ || Object.getPrototypeOf(b)).call(this, a, c));
                return h.thresholds = [], h.enableThresholds = !1, h.requestTime = 0, h.started = 0, 
                h.created = r.getCurrent(), h.mediaType = f, h.streamType = d, h.qualityHelper = new x(), 
                h.metrics = h.makeTrack(), h.lastTrack = {}, h.prevFrameRateMean = null, h.ssrc = null, 
                h.scsHelper = {
                    total: 0,
                    above: 0,
                    ccDriven: 0,
                    sumMaxBitrateDiff: 0,
                    sumThroughputDiff: 0,
                    prevCsioAvgBRKbps: 0
                }, h;
            }
            return f(b, a), k(b, null, [ {
                key: "make",
                value: function(a, c, d, e) {
                    var f = new b(a, c, d, e), g = f.metrics;
                    return f.attach(new n.SWAvg(function(a) {
                        return a.getJitter();
                    }, function(a) {
                        g.csioAvgJitter = a;
                    }, function(a) {
                        var b = a.getJitter();
                        return null !== b && void 0 !== b;
                    })), f.attach(new n.SWAvg(function(a) {
                        return a.getRTT();
                    }, function(a) {
                        g.csioAvgRtt = a;
                    }, function(a) {
                        var b = a.getRTT();
                        return null !== b && void 0 !== b;
                    })), f.attach(new o.SWBTreePercentile(95, function(a, b) {
                        var c = a.getJitter(), d = b.getJitter();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getJitter();
                    }, function(a) {
                        g.csioPercentileJitter = a;
                    }, function(a, b) {
                        return b ? b.getJitter() : a ? a.getJitter() : void 0;
                    }, function(a) {
                        var b = a.getJitter();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    })), f.attach(new o.SWBTreePercentile(95, function(a, b) {
                        var c = a.getRTT(), d = b.getRTT();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getRTT();
                    }, function(a) {
                        g.csioSig2Latency = a, g.csioeM = a + 40;
                    }, function(a, b) {
                        return b ? b.getRTT() : a ? a.getRTT() : void 0;
                    }, function(a) {
                        var b = a.getRTT();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    })), d === t.streamType.inbound ? b.setupInboundMonitor(f) : d === t.streamType.outbound ? b.setupOutboundMonitor(f) : v.warn("Unrecognized streamType (" + d + ") at TrackMonitor"), 
                    e === t.mediaType.audio ? b.setupAudioMonitor(f) : e === t.mediaType.video ? b.setupVideoMonitor(f) : v.warn("Unrecognized mediaType (" + e + ") at TrackMonitor"), 
                    d === t.streamType.inbound && e === t.mediaType.audio ? b.setupInbAudioQualityEvaluator(f) : d === t.streamType.inbound && e === t.mediaType.video ? b.setupInbVideoQualityEvaluator(f) : d === t.streamType.outbound && e === t.mediaType.audio ? b.setupOutbAudioQualityEvaluator(f) : d === t.streamType.outbound && e === t.mediaType.video && (b.setupOutbVideoQualityEvaluator(f), 
                    b.setupSCSValidator(f)), f.addPostProcess(function(a) {
                        g.csioMark = f.getQuality(a);
                    }), f;
                }
            }, {
                key: "setupInbAudioQualityEvaluator",
                value: function(a) {
                    var b = a.metrics;
                    a.addQualityEvaluator(function(a) {
                        return void 0 === b.csioIntBRKbps || null === b.csioIntBRKbps || b.csioIntBRKbps < 0 ? t.avQualityRatings.unknown : h(b.csioIntBRKbps, t.throughputThreshold.audio);
                    }), a.addQualityEvaluator(function(a) {
                        return void 0 === b.csioIntFL || null === b.csioIntFL || b.csioIntFL < 0 ? t.avQualityRatings.unknown : i(b.csioIntFL, t.fractionalLossThreshold.audio);
                    }), a.addQualityEvaluator(function(a) {
                        return void 0 === b.csioeM || null === b.csioeM ? t.avQualityRatings.unknown : i(b.csioeM, t.eModelThreshold.audio);
                    });
                }
            }, {
                key: "setupOutbAudioQualityEvaluator",
                value: function(a) {
                    var b = a.metrics;
                    a.addQualityEvaluator(function(a) {
                        return void 0 === b.csioIntBRKbps || null === b.csioIntBRKbps || b.csioIntBRKbps < 0 ? t.avQualityRatings.unknown : h(b.csioIntBRKbps, t.throughputThreshold.audio);
                    }), a.addQualityEvaluator(function(a) {
                        return void 0 === b.csioeM || null === b.csioeM ? t.avQualityRatings.unknown : i(b.csioeM, t.eModelThreshold.audio);
                    });
                }
            }, {
                key: "setupInbVideoQualityEvaluator",
                value: function(a) {
                    var b = a.metrics;
                    a.addQualityEvaluator(function(a) {
                        return void 0 === b.csioIntBRKbps || null === b.csioIntBRKbps || b.csioIntBRKbps < 0 ? t.avQualityRatings.unknown : h(b.csioIntBRKbps, t.throughputThreshold.video);
                    }), a.addQualityEvaluator(function(c) {
                        return void 0 === b.csioFrameRateMean || null === b.csioFrameRateMean ? t.avQualityRatings.unknown : b.csioFrameRateMean && a.prevFrameRateMean ? h(b.csioFrameRateMean / a.prevFrameRateMean, t.currOverPrevFrameRateThreshold.video) : t.avQualityRatings.bad;
                    }), a.addQualityEvaluator(function(a) {
                        return void 0 === b.csioSig2Latency || null === b.csioSig2Latency ? t.avQualityRatings.unknown : i(b.csioSig2Latency, t.rttThreshold.video);
                    });
                }
            }, {
                key: "setupOutbVideoQualityEvaluator",
                value: function(a) {
                    var b = a.metrics;
                    a.addQualityEvaluator(function(a) {
                        return void 0 == b.csioIntBRKbps || null == b.csioIntBRKbps ? t.avQualityRatings.unknown : h(b.csioIntBRKbps, t.throughputThreshold.video);
                    }), a.addQualityEvaluator(function(c) {
                        return void 0 === b.csioFrameRateMean || null === b.csioFrameRateMean ? t.avQualityRatings.unknown : b.csioFrameRateMean && a.prevFrameRateMean ? h(b.csioFrameRateMean / a.prevFrameRateMean, t.currOverPrevFrameRateThreshold.video) : t.avQualityRatings.bad;
                    }), a.addQualityEvaluator(function(a) {
                        return void 0 === b.csioSig2Latency || null === b.csioSig2Latency ? t.avQualityRatings.unknown : i(b.csioSig2Latency, t.rttThreshold.video);
                    });
                }
            }, {
                key: "setupInboundMonitor",
                value: function(a) {
                    var b = a.metrics;
                    a.addPreProcess(function(c) {
                        var d = c.getLostPackets(), e = c.getReceivedPackets(), f = a.getRequestedMeasurement(), g = 0, h = 0;
                        f ? (g = d - f.getLostPackets(), h = e - f.getReceivedPackets()) : (g = d, h = e);
                        var i = 0;
                        if ((0 < g || 0 < h) && (i = g / (h + g)), b.csioIntPktLoss = g, b.csioIntFL = i, 
                        c.setFractionLost(i), !c.getFrameRateReceived() && c.getFramesReceived() && 0 < a.started) {
                            var j = c.getFramesReceived(), k = r.getCurrent() - a.started;
                            b.csioEstFrameRatePerSecond = 1e3 * j / k;
                            var l = c.getSSRC(), m = (0, w.getRTTRegistry)().getFrameRate(l);
                            m && (b.legacyFrameRatePerSecond = m);
                        }
                    }), a.attach(new p.SWFunctor(function(c) {
                        var d = r.getCurrent(), e = c.getResolution(), f = a.getRequestedMeasurement(), g = a.getRequestTime(), h = c.getLostPackets(), i = 8 * c.getReceivedBytes(), j = c.getReceivedPackets(), k = d - a.getStartTime(), m = 0, n = 0, o = 0, p = 0, q = 1e3, s = Math.max(d - a.getStartTime(), q);
                        f ? (p = j - f.getReceivedPackets(), m = i - 8 * f.getReceivedBytes(), n = h - f.getLostPackets(), 
                        o = Math.max(d - g, q)) : (q = (l.Registry.getCredentials().getAdaptiveInterval(), 
                        l.Registry.getCredentials().getStatsSubmissionInterval()), s = Math.max(d - a.getStartTime(), q), 
                        p = j, m = i, n = h, o = Math.max(s, q)), b.csioIntPktRcv = p, b.csioIntPR = p / (o / 1e3), 
                        b.csioAvgBRKbps = i / s, b.csioIntBRKbps = m / o, b.csioAvgPacketSize = c.getReceivedBytes() / j, 
                        b.csioIntMs = k, b.csioTimeElapseMs = o, b.csiores = e, b.csioPktLostPercentage = n / m * 100;
                    }, null, null)), a.attach(new o.SWBTreePercentile(95, function(a, b) {
                        var c = a.getFractionLost(), d = b.getFractionLost();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getFractionLost();
                    }, function(a) {
                        b.csioPercentileFl = a;
                    }, function(a, b) {
                        return b ? b.getFractionLost() : a ? a.getFractionLost() : void 0;
                    }, function(a) {
                        var b = a.getFractionLost();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    }));
                }
            }, {
                key: "setupOutboundMonitor",
                value: function(a) {
                    var b = a.metrics;
                    a.addPreProcess(function(c) {
                        var d = c.getLostPackets(), e = c.getSentPackets(), f = a.getRequestedMeasurement(), g = 0, h = 0;
                        f ? (g = d - f.getLostPackets(), h = e - f.getSentPackets()) : (g = d, h = e);
                        var i = 0;
                        (0 < g || 0 < h) && (i = g / (h + g)), b.csioIntPktLoss = g, b.csioIntFL = i, c.setFractionLost(i);
                    }), a.attach(new p.SWFunctor(function(c) {
                        var d = r.getCurrent(), e = c.getResolution(), f = a.getRequestedMeasurement(), g = a.getRequestTime(), h = c.getLostPackets(), i = 8 * c.getSentBytes(), j = c.getSentPackets(), k = d - a.getStartTime(), m = 0, n = 0, o = 0, p = 0, q = 1e3, s = Math.max(d - a.getStartTime(), q);
                        f ? (p = j - f.getSentPackets(), m = i - 8 * f.getSentBytes(), n = h - f.getLostPackets(), 
                        o = Math.max(d - g, q)) : (q = (l.Registry.getCredentials().getAdaptiveInterval(), 
                        l.Registry.getCredentials().getStatsSubmissionInterval()), s = Math.max(d - a.getStartTime(), q), 
                        p = j, m = i, n = h, o = Math.max(s, q)), b.csioIntPktRcv = p, b.csioAvgBRKbps = i / s, 
                        b.csioIntBRKbps = m / o, b.csioIntPR = p / (o / 1e3), b.csioAvgPacketSize = c.getSentBytes() / j, 
                        b.csioIntMs = k, b.csioTimeElapseMs = o, b.csiores = e, b.csioPktLostPercentage = n / m * 100;
                    }, null, null)), a.attach(new o.SWBTreePercentile(95, function(a, b) {
                        var c = a.getFractionLost(), d = b.getFractionLost();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getFractionLost();
                    }, function(a) {
                        b.csioPercentileFl = a;
                    }, function(a, b) {
                        return b ? b.getFractionLost() : a ? a.getFractionLost() : void 0;
                    }, function(a) {
                        var b = a.getFractionLost();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    }));
                }
            }, {
                key: "setupAudioMonitor",
                value: function(a) {
                    var b = a.metrics;
                    a.attach(new p.SWFunctor(function(a) {
                        b.csioMediaType = t.mediaType.audio;
                    }, null, null));
                }
            }, {
                key: "setupVideoMonitor",
                value: function(a) {
                    var b = a.metrics;
                    a.attach(new n.SWAvg(function(a) {
                        return a.getFrameRateReceived();
                    }, function(c) {
                        a.prevFrameRateMean = b.csioFrameRateMean, b.csioFrameRateMean = c;
                    }, function(a) {
                        var b = a.getFrameRateReceived();
                        return null !== b && void 0 !== b;
                    })), a.attach(new n.SWAvg(function(a) {
                        return a.getFrameHeight();
                    }, function(a) {
                        b.csioFrameHeightMean = a;
                    }, function(a) {
                        var b = a.getFrameHeight();
                        return null !== b && void 0 !== b;
                    })), a.attach(new n.SWAvg(function(a) {
                        return a.getFrameWidth();
                    }, function(a) {
                        b.csioFrameWidthMean = a;
                    }, function(a) {
                        var b = a.getFrameWidth();
                        return null !== b && void 0 !== b;
                    })), a.attach(new o.SWBTreePercentile(95, function(a, b) {
                        var c = a.getFrameRateReceived(), d = b.getFrameRateReceived();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getFrameRateReceived();
                    }, function(a) {
                        b.csioFrameRate95Percentile = a;
                    }, function(a, b) {
                        return b ? b.getFrameRateReceived() : a ? a.getFrameRateReceived() : void 0;
                    }, function(a) {
                        var b = a.getFrameRateReceived();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    })), a.attach(new o.SWBTreePercentile(50, function(a, b) {
                        var c = a.getFrameRateReceived(), d = b.getFrameRateReceived();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getFrameRateReceived();
                    }, function(a) {
                        b.csioFrameRate50Percentile = a;
                    }, function(a, b) {
                        return b ? b.getFrameRateReceived() : a ? a.getFrameRateReceived() : void 0;
                    }, function(a) {
                        var b = a.getFrameRateReceived();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    })), a.attach(new o.SWBTreePercentile(95, function(a, b) {
                        var c = a.getFrameHeight(), d = b.getFrameHeight();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getFrameHeight();
                    }, function(a) {
                        b.csioFrameHeight95Percentile = a;
                    }, function(a, b) {
                        return b ? b.getFrameHeight() : a ? a.getFrameHeight() : void 0;
                    }, function(a) {
                        var b = a.getFrameHeight();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    })), a.attach(new o.SWBTreePercentile(50, function(a, b) {
                        var c = a.getFrameHeight(), d = b.getFrameHeight();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getFrameHeight();
                    }, function(a) {
                        b.csioFrameHeight50Percentile = a;
                    }, function(a, b) {
                        return b ? b.getFrameHeight() : a ? a.getFrameHeight() : void 0;
                    }, function(a) {
                        var b = a.getFrameHeight();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    })), a.attach(new o.SWBTreePercentile(95, function(a, b) {
                        var c = a.getFrameWidth(), d = b.getFrameWidth();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getFrameWidth();
                    }, function(a) {
                        b.csioFrameWidth95Percentile = a;
                    }, function(a, b) {
                        return b ? b.getFrameWidth() : a ? a.getFrameWidth() : void 0;
                    }, function(a) {
                        var b = a.getFrameWidth();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    })), a.attach(new o.SWBTreePercentile(50, function(a, b) {
                        var c = a.getFrameWidth(), d = b.getFrameWidth();
                        return c == d ? 0 : c < d ? -1 : 1;
                    }, function(a) {
                        return a.getFrameWidth();
                    }, function(a) {
                        b.csioFrameWidth50Percentile = a;
                    }, function(a, b) {
                        return b ? b.getFrameWidth() : a ? a.getFrameWidth() : void 0;
                    }, function(a) {
                        var b = a.getFrameWidth();
                        return null !== b && void 0 !== b;
                    }, function(a, b) {
                        return a;
                    })), a.attach(new p.SWFunctor(function(a) {
                        b.csioMediaType = t.mediaType.video;
                    }, null, null));
                }
            }, {
                key: "setupSCSValidator",
                value: function(a) {
                    var b = a.metrics;
                    a.attach(new p.SWFunctor(function(c) {
                        var d = l.Registry.getConfigServiceWrapper().getSenderConfig();
                        if (!d || !d.rtc_rtp_parameters || !d.rtc_rtp_parameters.encodings) return b.csioSCSValidationSampleCount = null, 
                        b.csioAvgMaxBitrateDiff = null, b.csioAvgDeltaThroughput = null, b.csioMaxBitrateAboveRatio = null, 
                        void (b.csioCCDrivenRatio = null);
                        var e = 0;
                        d.rtc_rtp_parameters.encodings.forEach(function(a) {
                            a && (e = Math.max(e, a.maxBitrate));
                        });
                        var f = 0, g = l.Registry.getConfigServiceWrapper().getDefaultSenderConfig();
                        if (g && g.encodings) {
                            g.encodings.forEach(function(a) {
                                f = Math.max(f, a.maxBitrate);
                            });
                            var h = 0, i = 0, j = null, k = null, m = a.getSCSHelper();
                            0 < f && .9 * f < 1e3 * b.csioAvgBRKbps ? (h = e - f, k = !1) : (h = e - 1e3 * b.csioAvgBRKbps, 
                            k = !0), j = 0 < h, i = b.csioAvgBRKbps - b.prevCsioAvgBRKbps, m.prevCsioAvgBRKbps = b.csioAvgBRKbps, 
                            b.csioSCSValidationSampleCount = ++m.total, m.sumMaxBitrateDiff += h, b.csioAvgMaxBitrateDiff = m.sumMaxBitrateDiff / m.total, 
                            m.sumThroughputDiff += i, b.csioAvgDeltaThroughput = m.sumThroughputDiff / m.total, 
                            j && (m.above += 1), b.csioMaxBitrateAboveRatio = m.above / m.total, k && (m.ccDriven += 1), 
                            b.csioCCDrivenRatio = m.ccDriven / m.total;
                        }
                    }, null, null));
                }
            } ]), k(b, [ {
                key: "makeTrack",
                value: function() {
                    var a = {};
                    return a.csioMediaType = void 0, a.csioMark = void 0, a.csioIntBRKbps = void 0, 
                    a.csioAvgBRKbps = void 0, a.csioIntFL = void 0, a.csioIntMs = void 0, a.csioIntPR = void 0, 
                    a.csioPercentileFl = void 0, a.csioAvgJitter = void 0, a.csioAvgRtt = void 0, a.csioPercentileJitter = void 0, 
                    a.csioSig2Latency = void 0, a.csioTimeElapseMs = void 0, a.csioeM = void 0, a.csiores = void 0, 
                    a.csioFrameWidth95Percentile = void 0, a.csioFrameWidth50Percentile = void 0, a.csioFrameHeight95Percentile = void 0, 
                    a.csioFrameHeight50Percentile = void 0, a.csioFrameRate95Percentile = void 0, a.csioFrameRate50Percentile = void 0, 
                    a.csioFrameWidthMean = void 0, a.csioFrameHeightMean = void 0, a.csioFrameRateMean = void 0, 
                    a.csioIntPktRcv = void 0, a.csioSCSValidationSampleCount = null, a.csioAvgMaxBitrateDiff = null, 
                    a.csioAvgDeltaThroughput = null, a.csioMaxBitrateAboveRatio = null, a.csioCCDrivenRatio = null, 
                    a;
                }
            }, {
                key: "getSSRC",
                value: function() {
                    return this.ssrc;
                }
            }, {
                key: "add",
                value: function(a) {
                    this.ssrc = a.getSSRC(), this.lastTrack = a.extractTrack(), this.lastTrack.pcHash = a.getPcHash(), 
                    0 === this.started && (this.started = r.getCurrent()), j(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "add", this).call(this, a);
                }
            }, {
                key: "hasTraffic",
                value: function() {
                    return 0 < this.metrics.csioIntBRKbps;
                }
            }, {
                key: "getTrack",
                value: function() {
                    var a = this.lastTrack;
                    return Object.assign(a.data, this.metrics), a;
                }
            }, {
                key: "extractTrack",
                value: function() {
                    var a = this.lastTrack;
                    return Object.assign(a.data, this.metrics), this.requestTime = r.getCurrent(), this.requestedMeasurement = this.peek(), 
                    a;
                }
            }, {
                key: "getMediaType",
                value: function() {
                    return this.mediaType;
                }
            }, {
                key: "getStreamType",
                value: function() {
                    return this.streamType;
                }
            }, {
                key: "getStartTime",
                value: function() {
                    return this.started;
                }
            }, {
                key: "getCreationTime",
                value: function() {
                    return this.created;
                }
            }, {
                key: "getRequestTime",
                value: function() {
                    return Math.max(this.started, this.requestTime);
                }
            }, {
                key: "getRequestedMeasurement",
                value: function() {
                    return this.requestedMeasurement;
                }
            }, {
                key: "getSCSHelper",
                value: function() {
                    return this.scsHelper;
                }
            }, {
                key: "addQualityEvaluator",
                value: function(a) {
                    var b = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1;
                    this.qualityHelper.addEvaluator(a, b);
                }
            }, {
                key: "getQuality",
                value: function(a) {
                    return this.qualityHelper.getQuality(a);
                }
            }, {
                key: "addPreProcess",
                value: function(a) {
                    j(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "addPreProcess", this).call(this, a);
                }
            }, {
                key: "addPostProcess",
                value: function(a) {
                    j(b.prototype.__proto__ || Object.getPrototypeOf(b.prototype), "addPostProcess", this).call(this, a);
                }
            } ]), b;
        }(m.SlidingWindow);
        c.TrackMonitor = y;
    }, {
        "../collections/slidingwindow": 28,
        "../config/constants": 33,
        "../statspipeline/swplugins/swavg": 76,
        "../statspipeline/swplugins/swbtreepercentile": 77,
        "../statspipeline/swplugins/swfunctor": 78,
        "../utility/csiologger": 88,
        "../utility/registry": 95,
        "../utility/rttregistry": 96,
        "../utility/timestamps": 99
    } ],
    81: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.TracksMonitor = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./trackmonitor"), g = a("../config/constants"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = function() {
            function a() {
                d(this, a), this.inbMonitors = new Map(), this.outbMonitors = new Map();
            }
            return e(a, [ {
                key: "getMonitor",
                value: function(a) {
                    var b = a.getStreamType(), c = a.getMediaType(), d = a.getSSRC(), e = null;
                    return b === h.streamType.inbound ? c === h.mediaType.audio ? e = this.getInbAudioMonitor(d) : c === h.mediaType.video && (e = this.getInbVideoMonitor(d)) : b === h.streamType.outbound && (c === h.mediaType.audio ? e = this.getOutbAudioMonitor(d) : c === h.mediaType.video && (e = this.getOutbVideoMonitor(d))), 
                    e;
                }
            }, {
                key: "extractTracks",
                value: function() {
                    var a = [];
                    return this.outbMonitors.forEach(function(b, c) {
                        a.push(b.extractTrack());
                    }), this.inbMonitors.forEach(function(b, c) {
                        a.push(b.extractTrack());
                    }), a;
                }
            }, {
                key: "getTracks",
                value: function() {
                    var a = [];
                    return this.outbMonitors.forEach(function(b, c) {
                        a.push(b.getTrack());
                    }), this.inbMonitors.forEach(function(b, c) {
                        a.push(b.getTrack());
                    }), a;
                }
            }, {
                key: "getMonitors",
                value: function() {
                    var a = [];
                    return this.outbMonitors.forEach(function(b, c) {
                        a.push(b);
                    }), this.inbMonitors.forEach(function(b, c) {
                        a.push(b);
                    }), a;
                }
            }, {
                key: "getInbAudioMonitor",
                value: function(a) {
                    var b = this.inbMonitors.get(a);
                    return b || (b = f.TrackMonitor.make(1e3, 3e4, h.streamType.inbound, h.mediaType.audio), 
                    this.inbMonitors.set(a, b)), b;
                }
            }, {
                key: "getInbVideoMonitor",
                value: function(a) {
                    var b = this.inbMonitors.get(a);
                    return b || (b = f.TrackMonitor.make(1e3, 3e4, h.streamType.inbound, h.mediaType.video), 
                    this.inbMonitors.set(a, b)), b;
                }
            }, {
                key: "getOutbAudioMonitor",
                value: function(a) {
                    var b = this.outbMonitors.get(a);
                    return b || (b = f.TrackMonitor.make(1e3, 3e4, h.streamType.outbound, h.mediaType.audio), 
                    this.outbMonitors.set(a, b)), b;
                }
            }, {
                key: "getOutbVideoMonitor",
                value: function(a) {
                    var b = this.outbMonitors.get(a);
                    return b || (b = f.TrackMonitor.make(1e3, 3e4, h.streamType.outbound, h.mediaType.video), 
                    this.outbMonitors.set(a, b)), b;
                }
            } ]), a;
        }();
        c.TracksMonitor = i;
    }, {
        "../config/constants": 33,
        "./trackmonitor": 80
    } ],
    82: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.TransportsMonitor = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../config/constants"), h = d(g), i = a("../utility/timestamps"), j = d(i), k = a("../utility/rttregistry"), l = function() {
            function a(b) {
                e(this, a), this.previous = b, this.actual = b, this.outdated = j.getCurrent();
            }
            return f(a, [ {
                key: "setActual",
                value: function(a) {
                    this.actual = a;
                }
            }, {
                key: "outdate",
                value: function() {
                    this.previous = this.actual, this.outdated = j.getCurrent();
                }
            }, {
                key: "getActual",
                value: function() {
                    return this.actual;
                }
            }, {
                key: "getPrevious",
                value: function() {
                    return this.previous;
                }
            }, {
                key: "getElapsedTime",
                value: function() {
                    return j.getCurrent() - this.outdated;
                }
            } ]), a;
        }(), m = function() {
            function a(b) {
                e(this, a), this.stats = new Map(), this.codeBase = b;
            }
            return f(a, [ {
                key: "set",
                value: function(a, b) {
                    var c = this.stats.get(a);
                    if (!c) return void this.stats.set(a, new l(b));
                    c.setActual(b);
                }
            }, {
                key: "getIntervalStats",
                value: function() {
                    var a = this, b = new Map();
                    return this.stats.forEach(function(c, d) {
                        b.set(d, a.getIntervalStat(c)), c.outdate();
                    }), b;
                }
            }, {
                key: "getIntervalStat",
                value: function(a) {
                    var b = null;
                    switch (this.codeBase) {
                      case h.codeBaseType.chrome:
                        b = this.getIntervalStatForChrome(a);
                        break;

                      default:
                        b = a.getActual();
                    }
                    return b;
                }
            }, {
                key: "getIntervalStatForChrome",
                value: function(a) {
                    var b = a.getActual(), c = a.getPrevious(), d = a.getElapsedTime();
                    if (!c) return actual;
                    for (var e = 0; e < b.length; ++e) {
                        var f = b[e], g = c[e];
                        if (!g || !f) return b;
                        var i = parseInt(g.bytesReceived, 10), j = parseInt(g.bytesSent, 10);
                        f.csioReceivedBwKbps = 8 * (parseInt(f.bytesReceived, 10) - i) / d, f.csioSentBwKbps = 8 * (parseInt(f.bytesSent, 10) - j) / d, 
                        f.csioIntBytesReceived = parseInt(f.bytesReceived, 10) - i, f.csioIntBytesSent = parseInt(f.bytesSent, 10) - j, 
                        void 0 !== g.packetsSent && void 0 !== f.packetsSent && (f.csioSentPacketRate = (parseInt(f.packetsSent, 10) - parseInt(g.packetsSent, 10)) / (d / 1e3), 
                        f.csioIntPacketsSent = parseInt(f.packetsSent, 10) - parseInt(g.packetsSent, 10)), 
                        void 0 !== g.packetsReceived && void 0 !== f.packetsReceived && (f.csioReceivedPacketRate = (parseInt(f.packetsReceived, 10) - parseInt(g.packetsReceived, 10)) / (d / 1e3), 
                        f.csioIntPacketsReceived = parseInt(f.packetsReceived, 10) - parseInt(g.packetsReceived, 10)), 
                        this.codeBase == h.codeBaseType.chrome && (f.currentRoundTripTime = (0, k.getRTTRegistry)().getTransportRTT());
                    }
                    return b;
                }
            } ]), a;
        }();
        c.TransportsMonitor = m;
    }, {
        "../config/constants": 33,
        "../utility/rttregistry": 96,
        "../utility/timestamps": 99
    } ],
    83: [ function(a, b, c) {
        "use strict";
        function d(a) {
            return isNaN(a) ? null : a;
        }
        function e(a) {
            return null !== d(a) && 0 < a ? a : null;
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.checkForNan = d, c.checkForNegativeValue = e;
    }, {} ],
    84: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a() {
                d(this, a), this.getWifiStatsMethod = null, this.wifiStats = null, this.interval = 1e4;
            }
            return e(a, [ {
                key: "setGetWifiStatsMethod",
                value: function(a) {
                    this.getWifiStatsMethod = a, this.wifiStatsHandler();
                }
            }, {
                key: "getWifiStats",
                value: function() {
                    return this.wifiStats;
                }
            }, {
                key: "wifiStatsHandler",
                value: function() {
                    var a = this;
                    a.getWifiStatsMethod && a.getWifiStatsMethod().then(function(b) {
                        a.wifiStats = JSON.parse(b), setTimeout(function() {
                            a.wifiStatsHandler();
                        }, a.interval);
                    }).catch(function() {
                        setTimeout(function() {
                            a.wifiStatsHandler();
                        }, a.interval);
                    });
                }
            } ]), a;
        }();
        c.WifiStatsExecutor = f;
    }, {} ],
    85: [ function(a, b, c) {
        "use strict";
        function d(a) {
            return window.btoa(a);
        }
        function e(a) {
            return window.atob(a);
        }
        function f(a) {
            return d(encodeURIComponent(a).replace(/%([0-9A-F]{2})/g, function(a, b) {
                return String.fromCharCode("0x" + b);
            }));
        }
        function g(a) {
            return d(a).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");
        }
        function h(a) {
            return f(a).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");
        }
        function i(a) {
            for (var b = e(a.replace(/[ \r\n]+$/, "")), c = [], d = 0; d < b.length; ++d) {
                var f = b.charCodeAt(d).toString(16);
                1 === f.length && (f = "0" + f), c.push(f);
            }
            return c.join("");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.encode = d, c.decode = e, c.urlencode = g, c.urlencodeUnicode = h, c.strtohex = i;
    }, {} ],
    86: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Callbacks = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../config/constants"), h = d(g), i = a("./registry"), j = a("./csiologger"), k = d(j), l = function() {
            function a() {
                e(this, a), this.callbacks = {};
            }
            return f(a, [ {
                key: "set",
                value: function(a, b) {
                    if ("function" == typeof b) return h.callbackFunctions.hasOwnProperty(a) ? (this.callbacks[a] = b, 
                    void (a === h.callbackFunctions.stats && i.Registry.getStatsCallbackBuilder().setCallback(b))) : void k.error("Couldn't set callback: " + a);
                }
            }, {
                key: "get",
                value: function(a) {
                    return this.callbacks.hasOwnProperty(a) ? this.callbacks[a] : null;
                }
            } ]), a;
        }();
        c.Callbacks = l;
    }, {
        "../config/constants": 33,
        "./csiologger": 88,
        "./registry": 95
    } ],
    87: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Credentials = void 0;
        var f = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
            return typeof a;
        } : function(a) {
            return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a;
        }, g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = a("../config/constants"), i = d(h), j = a("./csiologger"), k = d(j), l = function() {
            function a() {
                e(this, a), this.appId = null, this.userId = null, this.userIdObject = null, this.deviceId = null, 
                this.statsSubmissionInterval = 15e3, this.collectSDP = !1, this.transportType = i.transportType.rest, 
                this.adaptiveInterval = !1;
            }
            return g(a, [ {
                key: "getAppId",
                value: function() {
                    return this.appId;
                }
            }, {
                key: "setAppId",
                value: function(a) {
                    this.appId = "string" == typeof a ? parseInt(a, 10) : a;
                }
            }, {
                key: "getUserId",
                value: function() {
                    return this.userId;
                }
            }, {
                key: "setUserId",
                value: function(a) {
                    "object" === (void 0 === a ? "undefined" : f(a)) ? (this.userId = a.aliasName, this.setUserIdObject(a)) : this.userId = a;
                }
            }, {
                key: "getUserIdObject",
                value: function() {
                    return this.userIdObject;
                }
            }, {
                key: "setUserIdObject",
                value: function(a) {
                    this.userIdObject = a;
                }
            }, {
                key: "getStatsSubmissionInterval",
                value: function() {
                    return this.statsSubmissionInterval;
                }
            }, {
                key: "setStatsSubmissionInterval",
                value: function(a) {
                    k.log("setStatsSubmissionInterval is ", a), this.statsSubmissionInterval = a;
                }
            }, {
                key: "getCollectSDP",
                value: function() {
                    return this.collectSDP;
                }
            }, {
                key: "setCollectSDP",
                value: function(a) {
                    this.collectSDP = a;
                }
            }, {
                key: "getTransportType",
                value: function() {
                    return this.transportType;
                }
            }, {
                key: "setTransportType",
                value: function(a) {
                    this.transportType = a;
                }
            }, {
                key: "getAdaptiveInterval",
                value: function() {
                    return this.adaptiveInterval;
                }
            }, {
                key: "setAdaptiveInterval",
                value: function(a) {
                    this.adaptiveInterval = a;
                }
            } ]), a;
        }();
        c.Credentials = l;
    }, {
        "../config/constants": 33,
        "./csiologger": 88
    } ],
    88: [ function(a, b, c) {
        "use strict";
        function d() {
            if ("true" === i.csioDebug) {
                var a;
                (a = console).info.apply(a, arguments);
            }
        }
        function e() {
            if ("true" === i.csioDebug) {
                var a;
                (a = console).log.apply(a, arguments);
            }
        }
        function f() {
            if ("true" === i.csioDebug) {
                var a;
                (a = console).warn.apply(a, arguments);
            }
        }
        function g() {
            var a;
            (a = console).warn.apply(a, arguments);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.info = d, c.log = e, c.warn = f, c.error = g;
        var h = a("../config/settings"), i = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(h);
    }, {
        "../config/settings": 34
    } ],
    89: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Endpoint = void 0;
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = a("../browserapi/localstorage"), h = d(g), i = a("../browserapi/detectbrowser"), j = d(i), k = a("../utility/timestamps"), l = d(k), m = a("../utility/hash"), n = d(m), o = function() {
            function a() {
                e(this, a), this.id = null, this.appversion = null, this.magicKey = Math.floor(4294967296 * Math.random()), 
                this.browserName = null, this.browserVersion = null, this.osName = null, this.osVersion = null, 
                this.codeBase = null, this.userAgent = null, this.retrieveId();
            }
            return f(a, [ {
                key: "setup",
                value: function() {
                    var a = j.detect();
                    this.browserName = a.browserName, this.browserVersion = a.browserVersion, this.osName = a.os, 
                    this.osVersion = a.osVersion, this.codeBase = a.codeBase, this.userAgent = a.userAgent;
                }
            }, {
                key: "retrieveId",
                value: function() {
                    var a = this, b = h.get("endpointID");
                    if (null === b) {
                        var c = l.getCurrent(), d = Math.random() * c;
                        n.generateSHA256(d.toString(), function(b) {
                            a.id = b, h.store("endpointID", b);
                        });
                    } else this.id = b;
                }
            }, {
                key: "getId",
                value: function() {
                    return this.id;
                }
            }, {
                key: "getAppVersion",
                value: function() {
                    return this.appversion;
                }
            }, {
                key: "setAppVersion",
                value: function(a) {
                    this.appversion = a;
                }
            }, {
                key: "getMagicKey",
                value: function() {
                    return this.magicKey;
                }
            }, {
                key: "getBrowserName",
                value: function() {
                    return this.browserName;
                }
            }, {
                key: "getBrowserVersion",
                value: function() {
                    return this.browserVersion;
                }
            }, {
                key: "getOsName",
                value: function() {
                    return this.osName;
                }
            }, {
                key: "getOsVersion",
                value: function() {
                    return this.osVersion;
                }
            }, {
                key: "getCodeBase",
                value: function() {
                    return this.codeBase;
                }
            }, {
                key: "getUserAgent",
                value: function() {
                    return this.userAgent;
                }
            }, {
                key: "serialize",
                value: function() {
                    return {
                        type: "browser",
                        buildName: this.browserName,
                        buildVersion: this.browserVersion,
                        appVersion: this.appversion,
                        os: this.osName,
                        osVersion: this.osVersion,
                        userAgent: this.userAgent
                    };
                }
            } ]), a;
        }();
        c.Endpoint = o;
    }, {
        "../browserapi/detectbrowser": 18,
        "../browserapi/localstorage": 20,
        "../utility/hash": 92,
        "../utility/timestamps": 99
    } ],
    90: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.EventMessage = void 0;
        var f = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
            return typeof a;
        } : function(a) {
            return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a;
        }, g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = a("../config/constants"), i = d(h), j = a("../config/settings"), k = d(j), l = a("./registry"), m = a("./csiologger"), n = d(m), o = function() {
            function a(b, c, d, f) {
                e(this, a), this.eventType = b, this.customEntries = d, this.pcHandler = f, this.auth = l.Registry.getAuthenticator(), 
                this.clocksync = l.Registry.getClockSync(), this.timestamp = this.clocksync.getSynchronizedTimestamp(), 
                this.conferenceId = c, this.clockUnSynced = !this.clocksync.isCompleted();
            }
            return g(a, [ {
                key: "updateConferenceId",
                value: function(a) {
                    n.log("updating conferenceId to ", this.eventType, this.conferenceId, a), this.conferenceId = a;
                }
            }, {
                key: "toJson",
                value: function() {
                    if (!this.canBeSent()) return null;
                    var a = this.getCommonHeader();
                    return Object.assign(a, this.customEntries), this.eventType === i.internalFabricEvent.userJoined && delete a.connectionID, 
                    a;
                }
            }, {
                key: "getCallback",
                value: function() {
                    return this.pcHandler ? this.pcHandler.getCallback() : null;
                }
            }, {
                key: "canBeSent",
                value: function() {
                    var a = void 0, b = i.tmpConferenceId;
                    if (this.conferenceId === b) return !1;
                    if (this.pcHandler && !this.pcHandler.getRemoteId()) return !1;
                    if (this.eventType !== i.precalltestEvents.results) {
                        var c = l.Registry.getConferenceManager().get(this.conferenceId);
                        if (!c) return !1;
                        a = c.getUcId();
                    }
                    return !!this.auth.getToken() && (this.auth.isTokenValid() ? !!(this.isPriority() || this.clocksync.isCompleted() && a) && !(this.eventType === i.internalFabricEvent.userAlive && !a) : (this.auth.reAuthenticate(), 
                    !1));
                }
            }, {
                key: "isCachable",
                value: function() {
                    return -1 === [ i.internalFabricEvent.userAlive ].indexOf(this.eventType);
                }
            }, {
                key: "isPriority",
                value: function() {
                    var a = !1;
                    return this.eventType !== i.internalFabricEvent.userJoined && this.eventType !== i.precalltestEvents.results && this.eventType !== i.internalFabricEvent.userAlive || (a = !0), 
                    a;
                }
            }, {
                key: "getConferenceId",
                value: function() {
                    return this.conferenceId;
                }
            }, {
                key: "getCommonHeader",
                value: function() {
                    var a = {
                        version: k.version,
                        callstatsVersion: k.version,
                        channel: this.decideChannel(),
                        timestamp: this.timestamp,
                        action: this.eventType,
                        eventType: this.eventType,
                        localID: encodeURIComponent(l.Registry.getCredentials().getUserId()),
                        timeShift: 0,
                        appID: l.Registry.getCredentials().getAppId(),
                        deviceID: l.Registry.getEndpoint().getId(),
                        token: this.auth.getToken(),
                        confID: encodeURIComponent(this.conferenceId)
                    };
                    this.clockUnSynced && (a.timestamp += this.clocksync.getOffset());
                    var b = l.Registry.getConferenceManager().get(this.conferenceId);
                    return a.ucID = b ? b.getUcId() : null, this.pcHandler ? (a.remoteID = encodeURIComponent(this.pcHandler.getRemoteId()), 
                    a.connectionID = this.pcHandler.getPcHash()) : (a.remoteID = encodeURIComponent(l.Registry.getCredentials().getUserId()), 
                    a.connectionID = encodeURIComponent(l.Registry.getCredentials().getUserId())), a.remoteID || (a.remoteID = encodeURIComponent(l.Registry.getCredentials().getUserId())), 
                    a;
                }
            }, {
                key: "decideChannel",
                value: function() {
                    if (this.eventType == i.callstatsChannels.sdpSubmission) return i.callstatsChannels.sdpSubmission;
                    if (this.eventType == i.callstatsChannels.userFeedback) return i.callstatsChannels.userFeedback;
                    if (this.eventType == i.callstatsChannels.processedStats) return i.callstatsChannels.processedStats;
                    for (var a in i.precalltestEvents) if (this.eventType == i.precalltestEvents[a]) return i.callstatsChannels.preCallTest;
                    return i.callstatsChannels.callstatsEvent;
                }
            } ], [ {
                key: "checkCustomEntries",
                value: function(a, b) {
                    if (!p[a]) return n.error("eventType not recognized:", a), !1;
                    var c = p[a];
                    for (var d in c) if (!b.hasOwnProperty(d) || f(b[d]) !== c[d]) return n.error("customEntries for", a, "should have", d, "of type", c[d]), 
                    !1;
                    return !0;
                }
            } ]), a;
        }(), p = {};
        p[i.internalFabricEvent.userJoined] = {
            endpointInfo: "object"
        }, p[i.internalFabricEvent.userLeft] = {}, p[i.internalFabricEvent.userAlive] = {}, 
        p[i.internalFabricEvent.userDetails] = {
            userName: "string"
        }, p[i.internalFabricEvent.connectedDeviceList] = {
            mediaDeviceList: "object"
        }, p[i.fabricEvent.activeDeviceList] = {
            mediaDeviceList: "object"
        }, p[i.fabricEvent.audioMute] = {}, p[i.fabricEvent.audioUnmute] = {}, p[i.fabricEvent.videoPause] = {}, 
        p[i.fabricEvent.videoResume] = {}, p[i.fabricEvent.screenShareStart] = {}, p[i.fabricEvent.screenShareStop] = {}, 
        p[i.internalFabricEvent.mediaPlaybackStart] = {
            ssrc: "string"
        }, p[i.internalFabricEvent.mediaPlaybackSuspended] = {
            ssrc: "string"
        }, p[i.internalFabricEvent.mediaPlaybackStalled] = {
            ssrc: "string"
        }, p[i.internalFabricEvent.oneWayMedia] = {
            mediaType: "string",
            ssrc: "string"
        }, p[i.internalFabricEvent.fabricSetup] = {
            localIceCandidates: "object",
            remoteIceCandidates: "object",
            iceCandidatePairs: "object"
        }, p[i.fabricEvent.fabricSetupFailed] = {
            failureDelay: "number",
            reason: "string",
            function: "string",
            endpoint: "object"
        }, p[i.internalFabricEvent.fabricStateChange] = {
            changedState: "string",
            prevState: "string",
            newState: "string"
        }, p[i.internalFabricEvent.fabricDropped] = {
            prevIceConnectionState: "string",
            currIceConnectionState: "string",
            currIceCandidatePair: "object",
            failureDelay: "number"
        }, p[i.internalFabricEvent.iceConnectionDisruptionStart] = {
            prevIceConnectionState: "string",
            currIceConnectionState: "string",
            prevIceConnectionStateTs: "number",
            currIceCandidatePair: "object"
        }, p[i.internalFabricEvent.iceConnectionDisruptionEnd] = {
            prevIceConnectionState: "string",
            currIceConnectionState: "string",
            delay: "number"
        }, p[i.internalFabricEvent.iceDisruptionStart] = {
            prevIceConnectionState: "string",
            currIceConnectionState: "string",
            prevIceConnectionStateTs: "number",
            currIceCandidatePair: "object"
        }, p[i.internalFabricEvent.iceDisruptionEnd] = {
            prevIceConnectionState: "string",
            currIceConnectionState: "string",
            prevIceCandidatePair: "object"
        }, p[i.internalFabricEvent.iceFailed] = {
            localIceCandidates: "object",
            prevIceConnectionState: "string",
            currIceConnectionState: "string",
            currIceCandidatePair: "object",
            failureDelay: "number"
        }, p[i.internalFabricEvent.iceAborted] = {
            prevIceConnectionState: "string",
            currIceConnectionState: "string"
        }, p[i.internalFabricEvent.iceRestarted] = {
            prevIceConnectionState: "string",
            currIceConnectionState: "string",
            prevIceCandidatePair: "object"
        }, p[i.internalFabricEvent.fabricTransportSwitch] = {
            prevIceCandidatePair: "object",
            currIceCandidatePair: "object"
        }, p[i.internalFabricEvent.iceTerminated] = {
            prevIceConnectionState: "string",
            currIceConnectionState: "string"
        }, p[i.fabricEvent.fabricTerminated] = {}, p[i.fabricEvent.fabricHold] = {}, p[i.fabricEvent.fabricResume] = {}, 
        p[i.callstatsChannels.sdpSubmission] = {
            localSDP: "string",
            remoteSDP: "string"
        }, p[i.internalFabricEvent.ssrcMap] = {
            ssrcData: "object"
        }, p[i.callstatsChannels.userFeedback] = {
            feedback: "object"
        }, p[i.internalFabricEvent.sendingThroughputObservations] = {
            ssrc: "string",
            maxsendingKBitrate: "number",
            timeToMaxSendingKBitrate: "number",
            stablesendingKBitrate: "number",
            timeToStableSendingKBitrate: "number"
        }, p[i.fabricEvent.dominantSpeaker] = {}, p[i.fabricEvent.applicationErrorLog] = {
            message: "string",
            messageType: "string"
        }, p[i.callstatsChannels.processedStats] = {
            stats: "object"
        }, p[i.callstatsChannels.senderConfiguration] = {
            rtc_rtp_parameters: "object"
        }, p[i.internalFabricEvent.limitationObservations] = {
            reason: "string"
        }, p[i.qualityDisruptionTypes.qpchange] = {
            reason: "string"
        }, p[i.precalltestEvents.results] = {
            results: "object"
        }, p[i.precalltestEvents.associate] = {
            ids: "object"
        }, c.EventMessage = o;
    }, {
        "../config/constants": 33,
        "../config/settings": 34,
        "./csiologger": 88,
        "./registry": 95
    } ],
    91: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.EventMessageBuilder = void 0;
        var f = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
            return typeof a;
        } : function(a) {
            return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a;
        }, g = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), h = a("./eventmessage"), i = a("../config/constants"), j = d(i), k = a("./registry"), l = a("./csiologger"), m = d(l), n = function() {
            function a() {
                e(this, a), this.transmissionmanager = k.Registry.getTransmissionManager();
            }
            return g(a, [ {
                key: "make",
                value: function(a, b, c) {
                    var d = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
                    if ("string" != typeof a || null === d || "object" !== (void 0 === d ? "undefined" : f(d))) return m.error("failed typeof checks:", a, void 0 === a ? "undefined" : f(a), void 0 === d ? "undefined" : f(d), d), 
                    k.Registry.getGenericEventHandler().sendEvent(j.logEvents.error, {
                        msg: "failed typeof checks:" + a + ":" + (void 0 === d ? "undefined" : f(d)) + ":" + (void 0 === a ? "undefined" : f(a))
                    }), !1;
                    if (null === b && a !== j.precalltestEvents.results) return m.error("failed conferenceId checks:", a, b), 
                    k.Registry.getGenericEventHandler().sendEvent(j.logEvents.error, {
                        msg: "failed conferenceId checks:" + a
                    }), !1;
                    if (!c && a !== j.callstatsChannels.userFeedback && a !== j.fabricEvent.applicationErrorLog && a !== j.fabricEvent.fabricSetupFailed && a !== j.internalFabricEvent.userJoined && a !== j.precalltestEvents.results) return m.error("peerconnection cannot be null", a), 
                    k.Registry.getGenericEventHandler().sendEvent(j.logEvents.error, {
                        msg: "peerconnection cannot be null" + a
                    }), !1;
                    if (!h.EventMessage.checkCustomEntries(a, d)) return m.error("failed checks:", a, d), 
                    k.Registry.getGenericEventHandler().sendEvent(j.logEvents.error, {
                        msg: "failed customEntries checks:" + a
                    }), !1;
                    var e = void 0;
                    if (b) {
                        var g = k.Registry.getConferenceManager().get(b);
                        g && c && (e = g.getPeerConnectionManager().getPcHandler(c));
                    }
                    var i = new h.EventMessage(a, b, d, e);
                    return this.transmissionmanager.send(i), !0;
                }
            } ]), a;
        }();
        c.EventMessageBuilder = n;
    }, {
        "../config/constants": 33,
        "./csiologger": 88,
        "./eventmessage": 90,
        "./registry": 95
    } ],
    92: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            var c = {
                name: "SHA-256"
            };
            if (window.crypto) {
                var d = window.crypto.subtle || window.crypto.webkitSubtle;
                if (!d) return void e(a, b);
                d.digest(c, f(a)).then(function(a) {
                    b(g(a));
                }).catch(function() {
                    e(a, b);
                });
            } else if (window.msCrypto) {
                if (!window.msCrypto.subtle) return void e(a, b);
                var h = window.msCrypto.subtle.digest(c, f(a));
                h.oncomplete = function(a) {
                    a.target && b(g(a.target.result));
                }, h.onerror = function() {
                    e(a, b);
                };
            } else e(a, b);
        }
        function e(a) {
            var b = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null, c = 0;
            if (!a) return c;
            for (var d = 0, e = a.length; d < e; d++) {
                c = (c << 5) - c + a.charCodeAt(d), c |= 0;
            }
            return b && b(c + ""), c + "";
        }
        function f(a) {
            for (var b = [], c = 0; c < a.length; ++c) {
                var d = a.charCodeAt(c);
                d < 128 ? b[b.length] = d : d > 127 && d < 2048 ? (b[b.length] = d >> 6 | 192, b[b.length] = 63 & d | 128) : (b[b.length] = d >> 12 | 224, 
                b[b.length] = d >> 6 & 63 | 128, b[b.length] = 63 & d | 128);
            }
            return new Uint8Array(b).buffer;
        }
        function g(a) {
            for (var b = new DataView(a), c = "", d = void 0, e = 0; e < b.byteLength; e++) d = b.getUint8(e).toString(16), 
            d.length < 2 && (d = "0" + d), c += d;
            return c;
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.generateSHA256 = d, c.generateHash = e;
    }, {} ],
    93: [ function(a, b, c) {
        "use strict";
        function d(a) {
            return !!/^[\],:{}\s]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""));
        }
        function e(a) {
            var b = null;
            return null === a ? b : (d(a) && (b = JSON.parse(a)), b);
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.isValid = d, c.parse = e;
    }, {} ],
    94: [ function(a, b, c) {
        "use strict";
        function d(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }
        function e() {
            window && window.addEventListener && window.addEventListener("error", function(a) {
                var b = f.Registry.getGenericEventHandler();
                if (a && a.filename && a.filename.indexOf("callstats") > -1) {
                    for (var c = !1, d = {
                        fileName: a.filename,
                        line: a.lineno,
                        col: a.colno,
                        jsVersion: h.version,
                        eventType: "error",
                        message: a.message,
                        pageURL: window.location.href
                    }, e = f.Registry.getConferenceManager().getConferenceIds(), g = 0; g < e.length; g++) d.conferenceID = e[g], 
                    b.sendEvent(j.logEvents.error, d), c = !0;
                    c || b.sendEvent(j.logEvents.error, d);
                }
            });
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.setErrorEventListener = e;
        var f = a("./registry"), g = a("../config/settings"), h = d(g), i = a("../config/constants"), j = d(i);
    }, {
        "../config/constants": 33,
        "../config/settings": 34,
        "./registry": 95
    } ],
    95: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.Registry = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("../services/clocksync"), g = a("../services/configservice/configservicewrapper"), h = a("../services/authenticator"), i = a("../services/backendlog"), j = a("../services/transmissionmanager"), k = a("./eventmessagebuilder"), l = a("../conference/conferencemanager"), m = a("../utility/credentials"), n = a("../statspipeline/statsadapter"), o = a("../statspipeline/statsparser"), p = a("../statspipeline/statsmonitor"), q = a("../statspipeline/statstransmitter"), r = a("../statspipeline/statsassembler"), s = a("../utility/endpoint"), t = a("../browserapi/battery"), u = a("precalltest"), v = a("../statspipeline/wifistatsexecutor"), w = a("./callbacks"), x = a("../statspipeline/statscallbackbuilder"), y = a("../services/connectionmanager"), z = null, A = null, B = null, C = null, D = null, E = null, F = null, G = null, H = null, I = null, J = null, K = null, L = null, M = null, N = null, O = null, P = null, Q = null, R = null, S = null, T = function() {
            function a() {
                d(this, a);
            }
            return e(a, null, [ {
                key: "getConferenceManager",
                value: function() {
                    return O || (O = new l.ConferenceManager()), O;
                }
            }, {
                key: "getStatsCallbackBuilder",
                value: function() {
                    return R || (R = new x.StatsCallbackBuilder()), R;
                }
            }, {
                key: "getClockSync",
                value: function() {
                    return A || (A = new f.ClockSync()), A;
                }
            }, {
                key: "getWifiStatsExecutor",
                value: function() {
                    return P || (P = new v.WifiStatsExecutor()), P;
                }
            }, {
                key: "getAuthenticator",
                value: function() {
                    return B || (B = new h.Authenticator()), B;
                }
            }, {
                key: "getConfigServiceWrapper",
                value: function() {
                    return C || (C = new g.ConfigServiceWrapper()), C;
                }
            }, {
                key: "getGenericEventHandler",
                value: function() {
                    return D || (D = new i.GenericEventHandler(), D.enable()), D;
                }
            }, {
                key: "getConnectionManager",
                value: function() {
                    return S || (S = new y.ConnectionManager()), S;
                }
            }, {
                key: "getTransmissionManager",
                value: function() {
                    return E || (E = new j.TransmissionManager()), E;
                }
            }, {
                key: "getEventMessageBuilder",
                value: function() {
                    return F || (F = new k.EventMessageBuilder()), F;
                }
            }, {
                key: "getCredentials",
                value: function() {
                    return G || (G = new m.Credentials()), G;
                }
            }, {
                key: "getEndpoint",
                value: function() {
                    return H || (H = new s.Endpoint()), H;
                }
            }, {
                key: "getStatsAdapter",
                value: function() {
                    if (!I) {
                        var b = a.getEndpoint().getCodeBase(), c = a.getEndpoint().getBrowserName();
                        I = new n.StatsAdapter(b, c);
                    }
                    return I;
                }
            }, {
                key: "getPreCallTest",
                value: function() {
                    return z || (z = new u.PreCallTest()), z;
                }
            }, {
                key: "getStatsParser",
                value: function() {
                    return J || (J = new o.StatsParser()), J;
                }
            }, {
                key: "getStatsMonitor",
                value: function() {
                    if (!K) {
                        var b = a.getEndpoint().getCodeBase();
                        K = new p.StatsMonitor(b);
                    }
                    return K;
                }
            }, {
                key: "getStatsTransmitter",
                value: function() {
                    return L || (L = new q.StatsTransmitter()), L;
                }
            }, {
                key: "getStatsAssembler",
                value: function() {
                    return M || (M = new r.StatsAssembler()), M;
                }
            }, {
                key: "getBattery",
                value: function() {
                    return N || (N = new t.Battery()), N;
                }
            }, {
                key: "getCallbacks",
                value: function() {
                    return Q || (Q = new w.Callbacks()), Q;
                }
            } ]), a;
        }();
        c.Registry = T;
    }, {
        "../browserapi/battery": 17,
        "../conference/conferencemanager": 31,
        "../services/authenticator": 44,
        "../services/backendlog": 45,
        "../services/clocksync": 46,
        "../services/configservice/configservicewrapper": 50,
        "../services/connectionmanager": 51,
        "../services/transmissionmanager": 56,
        "../statspipeline/statsadapter": 69,
        "../statspipeline/statsassembler": 70,
        "../statspipeline/statscallbackbuilder": 71,
        "../statspipeline/statsmonitor": 72,
        "../statspipeline/statsparser": 73,
        "../statspipeline/statstransmitter": 74,
        "../statspipeline/wifistatsexecutor": 84,
        "../utility/credentials": 87,
        "../utility/endpoint": 89,
        "./callbacks": 86,
        "./eventmessagebuilder": 91,
        precalltest: 2
    } ],
    96: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        function e() {
            return null === i && (i = new j()), i;
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }();
        c.getRTTRegistry = e;
        var g = a("../statspipeline/validator"), h = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(g), i = null, j = function() {
            function a() {
                d(this, a), this.rtts = new Map(), this.frameRates = new Map(), this.transportRTT = null;
            }
            return f(a, [ {
                key: "getFrameRateReceived",
                value: function(a) {
                    for (var b = null, c = [ "googFrameRateOutput", "googFrameRateDecoded", "googFrameRateReceived", "googFrameRateSent", "framerateMean", "framesPerSecond" ], d = 0, e = c.length; d < e; d++) {
                        var f = c[d];
                        if (void 0 !== (b = a.stat(f))) break;
                    }
                    return b;
                }
            }, {
                key: "update",
                value: function(a) {
                    var b = this;
                    a.getStats(function(a) {
                        for (var c = [], d = a.result(), e = 0; e < d.length; ++e) {
                            var f = d[e];
                            if ("googCandidatePair" !== f.type) {
                                if ("ssrc" === f.type) {
                                    var g = b.getFrameRateReceived(f), i = f.stat("googRtt"), j = f.stat("ssrc");
                                    i && b.rtts.set(h.checkForNan(parseInt(j, 10)), h.checkForNan(parseInt(i, 10))), 
                                    g && b.frameRates.set(h.checkForNan(parseInt(j, 10)), h.checkForNan(parseInt(g, 10)));
                                }
                            } else {
                                var k = f.stat("googRtt");
                                c.push(k);
                            }
                        }
                        b.transportRTT = Math.max.apply(Math, c);
                    });
                }
            }, {
                key: "getTransportRTT",
                value: function() {
                    return this.transportRTT;
                }
            }, {
                key: "getRTT",
                value: function(a) {
                    var b = h.checkForNan(parseInt(a, 10));
                    return this.rtts.has(b) ? this.rtts.get(b) : null;
                }
            }, {
                key: "getFrameRate",
                value: function(a) {
                    var b = h.checkForNan(parseInt(a, 10));
                    return this.frameRates.has(b) ? this.frameRates.get(b) : null;
                }
            } ]), a;
        }();
    }, {
        "../statspipeline/validator": 83
    } ],
    97: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = function() {
            function a(b, c, e) {
                d(this, a), this.max = b, this.midpoint = c, this.stepness = e, this.actualStep = 0, 
                this.reset();
            }
            return e(a, [ {
                key: "reset",
                value: function() {
                    this.actualStep = 0;
                }
            }, {
                key: "setMidpoint",
                value: function(a) {
                    this.midpoint = a;
                }
            }, {
                key: "setMax",
                value: function(a) {
                    this.max = a;
                }
            }, {
                key: "setStepness",
                value: function(a) {
                    this.stepness = a;
                }
            }, {
                key: "increaseActualStep",
                value: function(a) {
                    this.actualStep += a;
                }
            }, {
                key: "getActual",
                value: function() {
                    var a = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1;
                    return this.actualStep += a, this.max / (1 + Math.exp(-1 * this.stepness * (this.actualStep - this.midpoint)));
                }
            } ]), a;
        }();
        c.Sigmoid = f;
    }, {} ],
    98: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.TimeoutProcess = void 0;
        var e = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), f = a("./csiologger"), g = function(a) {
            if (a && a.__esModule) return a;
            var b = {};
            if (null != a) for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (b[c] = a[c]);
            return b.default = a, b;
        }(f), h = function() {
            function a(b) {
                d(this, a), this.interval = b, this.timerId = null, this.callback = function() {
                    g.warn("no callback function set", this);
                };
            }
            return e(a, [ {
                key: "setCallback",
                value: function(a) {
                    this.callback = a;
                }
            }, {
                key: "start",
                value: function() {
                    var a = this;
                    this.timerId = setInterval(function() {
                        a.callback();
                    }, this.interval);
                }
            }, {
                key: "stop",
                value: function() {
                    clearInterval(this.timerId), this.timerId = null;
                }
            }, {
                key: "isStarted",
                value: function() {
                    return null !== this.timerId;
                }
            } ]), a;
        }();
        c.TimeoutProcess = h;
    }, {
        "./csiologger": 88
    } ],
    99: [ function(a, b, c) {
        "use strict";
        function d() {
            return window && window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
        }
        function e() {
            return window && window.performance && window.performance.now ? window.performance.now() : null;
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.getCurrent = d, c.getSinceOrigin = e;
    }, {} ],
    100: [ function(a, b, c) {
        "use strict";
        function d(a, b) {
            if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        });
        var e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
            return typeof a;
        } : function(a) {
            return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a;
        }, f = function() {
            function a(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            return function(b, c, d) {
                return c && a(b.prototype, c), d && a(b, d), b;
            };
        }(), g = function() {
            function a(b) {
                d(this, a), this.base = b;
                for (var c = arguments.length, e = Array(c > 1 ? c - 1 : 0), f = 1; f < c; f++) e[f - 1] = arguments[f];
                this.appendixes = e;
            }
            return f(a, null, [ {
                key: "concat",
                value: function(a, b) {
                    if (!b) return a;
                    if (!a) return b;
                    var c = "/" === a.substr(a.length - 1), d = "/" === b.substring(0, 1);
                    return c || d ? c && d ? a + b.substring(1) : a + b : a + "/" + b;
                }
            } ]), f(a, [ {
                key: "append",
                value: function(a) {
                    this.appendixes.push(a);
                }
            }, {
                key: "toString",
                value: function() {
                    var b = this.getString(this.base), c = this;
                    return this.appendixes.forEach(function(d) {
                        if (null !== d && void 0 !== d) {
                            var e = c.getString(d);
                            b = a.concat(b, e);
                        }
                    }), b;
                }
            }, {
                key: "getString",
                value: function(a) {
                    switch (void 0 === a ? "undefined" : e(a)) {
                      case "function":
                        return this.getString(a());

                      case "number":
                        return a + "";

                      case "string":
                      default:
                        return a;
                    }
                }
            } ]), a;
        }();
        c.Url = g;
    }, {} ],
    101: [ function(a, b, c) {
        "use strict";
        function d(a) {
            var b = [];
            if (!a) return b;
            for (var c = 0; c < a.length; c++) {
                var d = {};
                d.mediaDeviceID = a[c].deviceId, d.groupID = a[c].groupId, d.kind = a[c].kind, d.label = a[c].label, 
                b.push(d);
            }
            return b;
        }
        function e() {
            Number.isInteger || (Number.isInteger = Number.isInteger || function(a) {
                return "number" == typeof a && isFinite(a) && Math.floor(a) === a;
            });
        }
        function f() {
            "function" != typeof Object.assign && Object.defineProperty(Object, "assign", {
                value: function(a, b) {
                    if (null == a) throw new TypeError("Cannot convert undefined or null to object");
                    for (var c = Object(a), d = 1; d < arguments.length; d++) {
                        var e = arguments[d];
                        if (null != e) for (var f in e) Object.prototype.hasOwnProperty.call(e, f) && (c[f] = e[f]);
                    }
                    return c;
                },
                writable: !0,
                configurable: !0
            });
        }
        Object.defineProperty(c, "__esModule", {
            value: !0
        }), c.normalizeMediaDeviceList = d, c.isIntegerPollyfill = e, c.assignPollyfill = f;
    }, {} ]
}, {}, [ 22 ]);