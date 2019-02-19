(function () {
    'use strict';

    var Editor = zeta.Editor;
    var helper = zeta.helper;
    var bind = helper.bind;
    var each = helper.each;
    var extend = helper.extend;
    var getRect = helper.getRect;
    var isFunction = helper.isFunction;
    var matchWord = helper.matchWord;
    var toPlainRect = helper.toPlainRect;

    var container = $('<div style="position:absolute;top:0;left:0;">')[0];
    var root = document.documentElement;
    var handles = new shim.WeakMap();
    var allLayers = {};
    var freeDiv = [];
    var state = {};
    var lastState = {};
    var mousedown = false;
    var inited;
    var activeTyper;
    var activeHandle;
    var hoverNode;
    var oldLayers;
    var newLayers;
    var timeout;

    function TyperCanvas() {
        state.timestamp = activeTyper.getSelection().timestamp;
        state.rect = getRect(activeTyper).translate(root.scrollLeft, root.scrollTop);
        extend(this, {
            typer: activeTyper,
            pointerX: state.x || 0,
            pointerY: state.y || 0,
            mousedown: mousedown,
            hoverNode: hoverNode || null,
            activeHandle: activeHandle || null,
            editorReflow: !lastState.rect || !helper.rectEquals(lastState.rect, state.rect),
            pointerMoved: lastState.x != state.x || lastState.y != state.y,
            selectionChanged: lastState.timestamp !== state.timestamp
        });
        extend(lastState, state);
    }

    function TyperCanvasHandle(cursor, done) {
        this.cursor = cursor || 'pointer';
        this.done = done;
        this.active = false;
    }

    function init() {
        var repl = {
            N: 'typer-visualizer',
            G: 'background',
            S: 'selection',
            X: 'transparent'
        };
        var style = '<style>.has-N{caret-color:X;}.has-N:focus{outline:none;}.has-N::S,.has-N ::S{G:X;}.has-N::-moz-S,.has-N ::-moz-S{G:X;}@keyframes caret{0%{opacity:1;}100%{opacity:0;}}</style>';
        $(document.body).append(style.replace(/\b[A-Z]/g, function (v) {
            return repl[v] || v;
        })).append(container);

        bind(container, 'mousedown', function (e) {
            if (e.buttons & 1) {
                (activeHandle || {}).active = false;
                activeHandle = handles.get(e.target);
                activeHandle.active = true;
                helper.always(zeta.dom.drag(e, activeTyper.element), function () {
                    (activeHandle.done || helper.noop).call(activeHandle);
                    activeHandle.active = false;
                    activeHandle = null;
                    activeTyper.focus();
                    refresh(true);
                });
                e.preventDefault();
            }
        });
        bind(window, 'mousedown mousemove mouseup', function (e) {
            state.x = e.clientX;
            state.y = e.clientY;
            hoverNode = activeTyper && activeTyper.nodeFromPoint(state.x, state.y);
            clearTimeout(timeout);
            if (e.type === 'mousemove') {
                timeout = setTimeout(refresh, 0);
            } else {
                mousedown = e.buttons & 1;
                timeout = setTimeout(refresh, 0, true);
            }
        });
        bind(window, 'scroll resize orientationchange focus', refresh);
    }

    function addLayer(name, callback) {
        allLayers[name] = [callback, [], {}, true];
    }

    function addObject(kind, state, rect, css, handle) {
        for (var i = 0, len = oldLayers.length; i < len; i++) {
            if (oldLayers[i].state === state && oldLayers[i].kind === kind) {
                newLayers[newLayers.length] = oldLayers.splice(i, 1)[0];
                return;
            }
        }
        newLayers[newLayers.length] = {
            kind: kind,
            state: state,
            rect: rect || ('top' in state ? state : getRect),
            css: css,
            handle: handle
        };
    }

    function refresh(force) {
        force = force === true;
        clearTimeout(timeout);
        if (activeTyper && (force || activeTyper.focused())) {
            var canvas = new TyperCanvas();
            if (force || canvas.editorReflow || canvas.selectionChanged || canvas.pointerMoved) {
                each(allLayers, function (i, v) {
                    newLayers = v[1];
                    oldLayers = newLayers.splice(0);
                    if (v[3] !== false) {
                        v[0].call(null, canvas, v[2]);
                    }
                    oldLayers.forEach(function (v) {
                        freeDiv[freeDiv.length] = $(v.dom).detach().removeAttr('style')[0];
                        handles.delete(v.dom);
                    });
                    newLayers.forEach(function (v) {
                        if (force || !v.dom || canvas.editorReflow || isFunction(v.rect)) {
                            var dom = v.dom || (v.dom = $(freeDiv.pop() || document.createElement('div'))[0]);
                            $(dom).appendTo(container).css(extend({
                                position: 'absolute',
                                cursor: (v.handle || '').cursor,
                                pointerEvents: v.handle ? 'all' : 'none'
                            }, v.css, helper.cssFromRect('top' in v.rect ? v.rect : v.rect(v.state), container)));
                            handles.set(dom, v.handle);
                        }
                    });
                });
            }
        }
    }

    function setActive(typer) {
        activeTyper = typer;
        if (typer) {
            helper.setZIndexOver(container, typer.element);
            typer.retainFocus(container);
            refresh(true);
        } else {
            $(container).children().detach();
        }
    }

    helper.definePrototype(TyperCanvas, {
        refresh: function () {
            setTimeout(refresh, 0, true);
        },
        toggleLayer: function (name, visible) {
            var needRefresh = false;
            name.split(' ').forEach(function (v) {
                needRefresh |= visible ^ (allLayers[v] || '')[3];
                (allLayers[v] || {})[3] = visible;
            });
            if (needRefresh) {
                setTimeout(refresh, 0, true);
            }
        },
        fill: function (range, color, handle) {
            var style = {};
            style.background = color || 'rgba(0,31,81,0.2)';
            each(helper.makeArray(range), function (i, v) {
                addObject('f', v, null, style, handle);
            });
        },
        drawCaret: function (caret) {
            addObject('k', caret, null, {
                animation: 'caret 0.5s infinite alternate ease-in',
                outline: '1px solid rgba(0,31,81,0.8)'
            });
        },
        drawBorder: function (element, width, color, lineStyle, inset) {
            var style = {};
            style.border = parseFloat(width) + 'px ' + (lineStyle || 'solid') + ' ' + (color || 'black');
            style.margin = inset ? '0px' : -parseFloat(width) + 'px';
            style.boxSizing = inset ? 'border-box' : 'auto';
            addObject('b', element, null, style);
        },
        drawLine: function (x1, y1, x2, y2, width, color, lineStyle, handle) {
            if (x1.left !== undefined) {
                x1 = x1.collapse(y1);
                return this.drawLine(x1.left, x1.top, x1.right, x1.bottom, x2, y2, width, color);
            }
            var dx = x2 - x1;
            var dy = y2 - y1;
            var style = {};
            style.borderTop = parseFloat(width) + 'px ' + (lineStyle || 'solid') + ' ' + (color || 'black');
            style.transformOrigin = '0% 50%';
            style.transform = 'translateY(-50%) rotate(' + Math.atan2(dy, dx) + 'rad)';
            addObject('l', toPlainRect(x1, y1, x1 + (Math.sqrt(dy * dy + dx * dx)), y1), null, style, handle);
        },
        drawHandle: function (element, pos, size, image, handle) {
            var style = {};
            style.border = '1px solid #999';
            style.background = 'white' + (image ? ' url("' + image + '")' : '');
            size = size || 8;
            addObject('c', element, function () {
                var r = getRect(element);
                var x = matchWord(pos, 'left right') || 'centerX';
                var y = matchWord(pos, 'top bottom') || 'centerY';
                r.left -= size;
                r.top -= size;
                return toPlainRect(r[x], r[y], r[x] + size, r[y] + size);
            }, style, handle);
        }
    });

    addLayer('selection', function (canvas) {
        var selection = canvas.typer.getSelection();
        if (!selection.isCaret) {
            canvas.fill(selection.getRects());
        } else if ('caretColor' in root.style) {
            canvas.drawCaret(selection.baseCaret);
        }
    });

    Editor.widgets.visualizer = {
        init: function (e) {
            $(e.typer.element).addClass('has-typer-visualizer');
            if (!inited) {
                init();
                inited = true;
            }
        },
        focusin: function (e) {
            setActive(e.typer);
        },
        focusout: function (e) {
            setActive(null);
        },
        contentChange: function (e) {
            refresh(true);
        },
        stateChange: function (e) {
            if (!e.typer.enabled()) {
                setActive(null);
            } else if (activeTyper === e.typer) {
                refresh();
            } else if (e.typer.focused()) {
                setActive(e.typer);
            }
        }
    };

    Editor.defaultOptions.visualizer = true;

    extend(Editor, {
        addLayer: addLayer,
        handle: function (cursor, done) {
            return new TyperCanvasHandle(cursor, done);
        }
    });

})();
