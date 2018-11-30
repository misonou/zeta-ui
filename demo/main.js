/* globals hljs,HTMLConsole */
(function () {

    var ui = new zeta.UI();
    var consoleInput;

    function runWithGlobals(script, globals) {
        // jshint -W054
        var limit = Error.stackTraceLimit;
        try {
            Error.stackTraceLimit = Infinity;
            return (new Function('globals', 'with (globals) {\n' + script + '\n}'))(globals);
        } finally {
            Error.stackTraceLimit = limit;
        }
    }

    function runInConsole(context, str) {
        var console = context.console;
        console.log(str);
        $('>:last-child', console.element).addClass('in');
        try {
            console.log(runWithGlobals('return ' + str, context.globals));
            $('>:last-child', console.element).addClass('out');
        } catch (e) {
            console.error(e);
        }
    }

    function initSection(v) {
        consoleInput = consoleInput || ui.textbox({
            upArrow: function () {
                if (this.history && this.historyIndex < this.history.length - 1) {
                    this.editor.setValue(this.history[++this.historyIndex]);
                }
            },
            downArrow: function () {
                if (this.history && this.historyIndex >= 0) {
                    this.editor.setValue(this.history[--this.historyIndex] || '');
                }
            },
            enter: function () {
                if (this.value) {
                    runInConsole(this.context, this.value);
                    (this.history || (this.history = [])).unshift(this.value);
                    this.historyIndex = -1;
                    this.editor.setValue('');
                }
            }
        });

        $('.desc', v).each(function (i, v) {
            if (v.textContent.indexOf('`') >= 0) {
                v.innerHTML = v.innerHTML.replace(/`([^`]+)`/g, '<pre><code class="js">$1</code></pre>');
            }
        });
        $('.example', v).each(function (i, v) {
            var script = v.textContent.replace(/^\s+|\s+$/g, '').replace(/\n\ {12}/g, '\n');
            $(v).html('<div class="split"><div class="source"><pre><code class="js"></code></pre></div><div class="result"></div></div><div class="log"></div><div class="input"></div>');
            $('code', v).text(script);

            var result = $('.result', v)[0];
            var input = $('.input', v)[0];
            var log = $('.log', v)[0];

            var variables = [];
            script.replace(/(?:^|\n)var\s+([$_a-zA-Z][$_a-zA-Z0-9]*)(?=\s|=)/g, function (v, a) {
                variables.push(a);
            });
            script += '\nreturn { ' + variables.map(function (v, i) {
                return (i ? ' ' : '') + v + ': ' + v;
            }) + ' };';

            var console = new HTMLConsole(log);
            var globals = {
                console: console,
                div: result,
                delay: function (ms, data) {
                    var d = $.Deferred();
                    setTimeout(function () {
                        d.resolve(data);
                    }, ms);
                    return d.promise();
                }
            };
            try {
                $.extend(globals, runWithGlobals(script, globals));
                consoleInput.render(input, {
                    globals: globals,
                    console: console
                });
            } catch (e) {
                console.error(e);
            }
        });
        $('pre code', v).each(function () {
            hljs.highlightBlock(this);
        })
        $('.source .hljs-comment', v).each(function () {
            if (/([=#]\[([^\]]+)\])/.test(this.innerHTML)) {
                this.innerHTML = this.innerHTML.replace(RegExp.$1, '<a href="javascript:void 0;" data-mode="' + RegExp.$1[0] + '">' + RegExp.$2 + '</a>');
                if (RegExp.$1[0] === '=') {
                    $(this).addClass('try');
                    this.childNodes[0].data = this.childNodes[0].data.replace(/^\/\/\s*/, '');
                    $(this.childNodes[0]).wrap('<span>');
                }
            }
        });
        $('.source .try', v).click(function () {
            var input = $(this).closest('.example').find('.input')[0];
            runInConsole(zeta.dom.getContext(input), $(this).children('a')[0].textContent);
        });
        $('.source a[data-mode="#"]', v).click(function () {
            goto(this.textContent);
        });
    }

    function gotoSection(w) {
        if (!$(w).hasClass('inited')) {
            initSection(w);
            $(w).addClass('inited');
        }
        $(w).addClass('active').siblings().removeClass('active');
        $('#navigation-inner').empty();

        $('h1', w).each(function (i, v) {
            var ul = $('<li><span>' + v.textContent + '</span><ul></ul></li>').appendTo('#navigation-inner').children('ul');
            $(v).nextUntil('h1').filter('h2').each(function (i, v) {
                $('<li><a href="javascript:void 0;">' + v.textContent + '</a></li>').appendTo(ul).click(function () {
                    $('#main').scrollable('scrollToElement', v, 'left top-50px', 200);
                });
            });
        });
        $('#main,#navigation').scrollable('refresh');
    }

    var c = ui.buttonset('menu', {
        init: function (e, self) {
            self.append($('.section').map(function (i, w) {
                var name = $('h1', w).eq(0).text();
                return ui.button({
                    label: name,
                    execute: function (self) {
                        $.each(self.all.menu.controls, function (i, v) {
                            v.active = v === self;
                        });
                        gotoSection(w)
                    }
                });
            }));
        }
    }).render($('#topbar-buttons')[0]);

    $('#topbar').scrollable({
        content: '#topbar-buttons',
        hScroll: true,
        vScroll: false,
        handle: 'both',
        scrollbarInset: 0,
        scrollbarSize: 2,
        scrollbarClass: 'scrollbar'
    });
    $('#main').scrollable({
        content: '.section.active',
        hScroll: false,
        vScroll: true,
        scrollbarInset: 0,
        scrollbarSize: 2,
        scrollbarClass: 'scrollbar'
    });
    $('#navigation').scrollable({
        hScroll: false,
        vScroll: true,
        scrollbarInset: 0,
        scrollbarSize: 2,
        scrollbarClass: 'scrollbar'
    });

    c.button();

    zeta.dom.mixin({
        canHandle: function (elm) {
            return !!$(elm).data('xScrollable');
        },
        getUnobscuredRect: function (elm, child) {
            var $child = $(elm).find('.scrollable-target');
            if (!$child.find(child)[0]) {
                return zeta.helper.getRect(elm);
            }
            var r = zeta.helper.getRect(elm);
            var p = $(elm).scrollable('scrollPadding');
            r.top += p.top;
            r.left += p.left;
            r.right -= p.right;
            r.bottom -= p.bottom;
            var f = $('.sticky', elm).filter(child ? function (i, v) {
                return $.contains($(v).data('xScrollableSticky'), child);
            } : ':visible')[0];
            if (f) {
                r.top += $(f).outerHeight();
            }
            return r;
        },
        scrollBy: function (elm, x, y) {
            $(elm).scrollable('stop');
            var origX = $(elm).scrollable('scrollLeft');
            var origY = $(elm).scrollable('scrollTop');
            $(elm).scrollable('scrollTo', origX + x, origY + y, 200);
            return {
                x: $(elm).scrollable('scrollLeft') - origX,
                y: $(elm).scrollable('scrollTop') - origY
            };
        }
    });

}());
