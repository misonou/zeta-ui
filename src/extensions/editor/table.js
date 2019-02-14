(function ($, zeta) {
    'use strict';

    var TD_HTML = '<td></td>';
    var TH_HTML = '<th></th>';
    var TR_HTML = '<tr>%</tr>';
    var TR_SELECTOR = '>tbody>tr';
    var X_ATTR_MODE = 'x-table-copymode';
    var MODE_ROW = 1;
    var MODE_COLUMN = 2;
    var MODE_TABLE = 3;

    var Editor = zeta.Editor;
    var helper = zeta.helper;
    var getRect = helper.getRect;
    var removeNode = helper.removeNode;
    var repeat = helper.repeat;
    var visualRange;

    function CellSelection(widget, minRow, minCol, maxRow, maxCol) {
        var self = this;
        self.widget = widget;
        self.element = widget.element;
        self.minCol = minCol;
        self.minRow = minRow;
        self.maxCol = maxCol;
        self.maxRow = maxRow;
    }

    function getCellSelection(context) {
        var selection = context.typer.getSelection();
        var widget = selection.focusNode.widget;
        if (widget.id === 'table') {
            var $c1 = $(selection.startElement).parentsUntil(widget.element).addBack();
            var $c2 = $(selection.endElement).parentsUntil(widget.element).addBack();
            return new CellSelection(widget, $c1.eq(1).index(), $c1.eq(2).index(), $c2.eq(1).index(), $c2.eq(2).index());
        }
    }

    function getRow(widget, row) {
        return $(TR_SELECTOR, widget.element || widget)[row];
    }

    function getCell(widget, row, col) {
        if (typeof row === 'string') {
            return getCell(widget, Math.min(widget[row + 'Row'], countRows(widget) - 1), Math.min(widget[row + 'Col'], countColumns(widget) - 1));
        }
        return getRow(widget, row).children[col];
    }

    function countRows(widget) {
        return $(TR_SELECTOR, widget.element || widget).length;
    }

    function countColumns(widget) {
        return getRow(widget, 0).childElementCount;
    }

    function hasTableHeader(widget) {
        return !!helper.is(getCell(widget, 0, 0), 'th');
    }

    function tabNextCell(selection, dir, selector) {
        if (selection.isSingleEditable) {
            var nextCell = $(selection.focusNode.element)[dir]()[0] || $(selection.focusNode.element).parent()[dir]().children(selector)[0];
            if (nextCell) {
                selection.moveToText(nextCell, -0);
            }
        }
    }

    function setEditorStyle(widget) {
        $('td,th', widget.element || widget).css({
            outline: '1px dotted rgba(0,0,0,0.3)',
            minWidth: '3em'
        });
    }

    function selectCells(widget, row, col, numRow, numCol) {
        widget.typer.select(new CellSelection(widget, row, col, row + numRow - 1, col + numCol - 1));
    }

    function insertColumn(widget, index, count, before) {
        var s = typeof index === 'string' ? index + '-child' : 'nth-child(' + (index + 1) + ')';
        var m = before ? 'before' : 'after';
        $(widget.element || widget).find(TR_SELECTOR + '>th:' + s)[m](repeat(TH_HTML, count));
        $(widget.element || widget).find(TR_SELECTOR + '>td:' + s)[m](repeat(TD_HTML, count));
        setEditorStyle(widget);
    }

    function insertRow(widget, index, count, before, kind) {
        $(getRow(widget, index === 'last' ? countRows(widget) - 1 : index))[before ? 'before' : 'after'](repeat(TR_HTML.replace('%', repeat(kind || TD_HTML, countColumns(widget))), count));
        setEditorStyle(widget);
    }

    function toggleHeader(widget, value) {
        var hasHeader = hasTableHeader(widget);
        if (hasHeader && !value) {
            $('>th', getRow(widget, 0)).wrapInner('<p>').each(function (i, v) {
                $(v).replaceWith($(TD_HTML).append(v.childNodes));
            });
            setEditorStyle(widget);
        } else if (!hasHeader && (value || value === undefined)) {
            insertRow(widget, 0, 1, true, TH_HTML);
        }
    }

    function findIndex(widget, isColumn, pos) {
        var $cell = $(isColumn ? TR_SELECTOR + ':first>*' : TR_SELECTOR, widget.element);
        for (var i = $cell.length - 1; i >= 0; i--) {
            var r = getRect($cell[i]);
            if ((isColumn ? r.left : r.top) < pos) {
                return i;
            }
        }
        return 0;
    }

    CellSelection.prototype = {
        get numCol() {
            return Math.abs(this.maxCol - this.minCol) + 1;
        },
        get numRow() {
            return Math.abs(this.maxRow - this.minRow) + 1;
        },
        get mode() {
            return (this.numCol === countColumns(this)) + (this.numRow === countRows(this)) * 2;
        },
        rows: function (callback) {
            $(TR_SELECTOR, this.element).splice(this.minRow, this.numRow).forEach(callback);
        },
        cells: function (callback) {
            var self = this;
            self.rows(function (v, i) {
                $(v.children).splice(self.minCol, self.numCol).forEach(function (v, j) {
                    callback(v, i, j);
                });
            });
        },
        getRange: function () {
            return helper.createRange(getCell(this, 'min'), 0, getCell(this, 'max'), -0);
        },
        acceptNode: function (node) {
            var result = false;
            if (node.element === this.element) {
                return 1;
            }
            this.cells(function (v) {
                result |= helper.containsOrEquals(v, node.element);
            });
            return result || 2;
        },
        remove: function (mode) {
            var self = this;
            if (mode === MODE_ROW) {
                self.rows(removeNode);
            } else if (mode === MODE_COLUMN) {
                self.cells(removeNode);
            }
            self.widget.typer.select(getCell(self, 'min'), -0);
        }
    };

    Editor.widgets.table = {
        element: 'table',
        editable: 'th,td',
        create: function (tx, options) {
            options = options || {};
            tx.insertHtml('<table>' + repeat(TR_HTML.replace('%', repeat(TD_HTML, options.columns || 2)), options.rows || 2) + '</table>');
        },
        init: function (e) {
            $(e.widget.element).removeAttr(X_ATTR_MODE);
            setEditorStyle(e.widget);
        },
        extract: function (e) {
            var src = e.widget.element;
            var dst = e.extractedNode;
            if (visualRange && visualRange.widget === e.widget) {
                var mode = visualRange.mode;
                if (mode === MODE_ROW || mode === MODE_COLUMN) {
                    $(dst).attr(X_ATTR_MODE, mode);
                    if (e.source === 'paste' || e.source === 'cut') {
                        visualRange.remove(mode);
                    }
                }
            } else if (countRows(dst) > 1) {
                var count = countColumns(src);
                $(TR_SELECTOR, dst).each(function (i, v) {
                    if (v.childElementCount < count) {
                        $(repeat($('>th', v)[0] ? TH_HTML : TD_HTML, count - v.childElementCount))[i ? 'appendTo' : 'prependTo'](v);
                    }
                });
            }
        },
        receive: function (e) {
            var mode = +$(e.receivedNode).attr(X_ATTR_MODE);
            if (!mode && e.source !== 'paste') {
                return;
            }

            var selection = e.typer.getSelection();
            var info = visualRange && visualRange.widget === e.widget ? visualRange : getCellSelection(selection);
            var src = e.widget.element;
            var dst = e.receivedNode;
            var hasHeader = hasTableHeader(src);
            toggleHeader(dst, mode === MODE_ROW ? false : mode === MODE_COLUMN ? hasHeader : info.minRow === 0 && hasHeader);

            var dstRows = countRows(dst);
            var dstCols = countColumns(dst);
            var srcRows = countRows(src);
            var srcCols = countColumns(src);
            var insertAfter = mode === MODE_ROW ? info.minRow === srcRows : info.minCol === srcCols;

            if (mode === MODE_COLUMN) {
                insertRow(dstRows > srcRows ? src : dst, 'last', Math.abs(dstRows - srcRows), false);
                $(TR_SELECTOR, dst).each(function (i, v) {
                    $(v.children)[insertAfter ? 'insertAfter' : 'insertBefore'](getCell(src, i, info.minCol - insertAfter));
                });
                selectCells(e.widget, 0, info.minCol, countRows(src), dstCols);
            } else if (mode === MODE_ROW) {
                if (info.minRow === 0 && hasHeader) {
                    info.minRow++;
                }
                insertColumn(dstCols > srcCols ? src : dst, 'last', Math.abs(dstCols - srcCols), false);
                $(TR_SELECTOR, dst)[insertAfter ? 'insertAfter' : 'insertBefore'](getRow(src, info.minRow - insertAfter));
                selectCells(e.widget, info.minRow, 0, dstRows, countColumns(src));
            } else {
                if (info.numRow === 1 && info.numCol === 1) {
                    info.maxCol = info.minCol + dstCols - 1;
                    info.maxRow = info.minRow + dstRows - 1;
                    if (info.maxRow > srcRows - 1) {
                        insertRow(src, 'last', info.maxRow - srcRows + 1, false);
                    }
                    if (info.maxCol > srcCols - 1) {
                        insertColumn(src, 'last', info.maxCol - srcCols + 1, false);
                    }
                }
                info.cells(function (v, i, j) {
                    $(v).replaceWith(getCell(dst, i % dstRows, j % dstCols).cloneNode(true));
                });
                selection.select(info);
            }
            setEditorStyle(src);
            e.handled();
        },
        tab: function (e) {
            tabNextCell(e.typer.getSelection(), 'next', ':first-child');
            e.handled();
        },
        shiftTab: function (e) {
            tabNextCell(e.typer.getSelection(), 'prev', ':last-child');
            e.handled();
        },
        keystroke: function (e) {
            if (visualRange && visualRange.widget === e.widget && (e.data === 'backspace' || e.data === 'delete')) {
                var mode = visualRange.mode;
                if (mode === MODE_ROW || mode === MODE_COLUMN) {
                    visualRange.remove(mode);
                    e.handled();
                }
            }
        },
        commands: {
            addColumnBefore: function (tx) {
                var info = getCellSelection(tx);
                insertColumn(tx.widget, info.minCol, info.numCol, true);
            },
            addColumnAfter: function (tx) {
                var info = getCellSelection(tx);
                insertColumn(tx.widget, info.maxCol, info.numCol, false);
            },
            addRowAbove: function (tx) {
                var info = getCellSelection(tx);
                insertRow(tx.widget, info.minRow, info.numRow, true);
            },
            addRowBelow: function (tx) {
                var info = getCellSelection(tx);
                insertRow(tx.widget, info.maxRow, info.numRow, false);
            },
            removeColumn: function (tx) {
                var info = getCellSelection(tx);
                info.remove(MODE_COLUMN);
            },
            removeRow: function (tx) {
                var info = getCellSelection(tx);
                info.remove(MODE_ROW);
            },
            toggleTableHeader: function (tx) {
                toggleHeader(tx.widget);
                $('>th', getRow(tx.widget, 0)).text(function (i, v) {
                    return v || 'Column ' + (i + 1);
                });
            }
        }
    };

    zeta.UI.define('tableGrid', {
        template: '<div class="zeta-grid"><div class="zeta-grid-wrapper"></div><z:label/></div>',
        init: function (e, self) {
            var $self = $(self.element);
            $self.find('.zeta-grid-wrapper').append(repeat('<div class="zeta-grid-row">' + repeat('<div class="zeta-grid-cell"></div>', 7) + '</div>', 7));
            $self.find('.zeta-grid-cell').mouseover(function () {
                self.value.rows = $(this).parent().index() + 1;
                self.value.columns = $(this).index() + 1;
                self.label = self.value.rows + ' \u00d7 ' + self.value.columns;
                $self.find('.zeta-grid-cell').removeClass('active');
                $self.find('.zeta-grid-row:lt(' + self.value.rows + ')').find('.zeta-grid-cell:nth-child(' + self.value.columns + ')').prevAll().addBack().addClass('active');
            });
            self.label = '0 \u00d7 0';
            self.value = {};
        },
        click: function (e, self) {
            return self.execute();
        }
    });

    var ui = new zeta.UI('zeta.editor.table', {
        contextChange: function (e, self) {
            var selection = self.context.typer.getSelection();
            self.widget = selection.getWidget('table');
            self.widgetAllowed = selection.widgetAllowed('table');
        }
    });
    ui.export('zeta.editor.insertMenu',
        ui.callout('insertTable',
            ui.tableGrid({
                realm: 'widgetAllowed',
                execute: function (self) {
                    self.context.typer.invoke(function (tx) {
                        tx.insertWidget('table', self.value);
                    });
                }
            })
        )
    );
    ui.export('zeta.editor.contextmenu',
        ui.callout('modifyTable',
            ui.checkbox('showHeader', {
                realm: 'widget',
                execute: 'toggleTableHeader',
                contextChange: function (e, self) {
                    self.value = hasTableHeader(self.state.widget);
                }
            }),
            ui.dropdown('style', {
                realm: 'widget',
                valueAsLabel: false,
                init: function (e, self) {
                    self.choices = self.context.options.tableStyles;
                    self.append(ui.button('styleDefault', { after: '*' }));
                },
                execute: function (self) {
                    self.state.widget.element.className = self.value || '';
                },
                contextChange: function (e, self) {
                    self.value = self.state.widget.element.className || '';
                }
            }),
            ui.dropdown('tableWidth', {
                realm: 'widget',
                valueAsLabel: false,
                choices: {
                    '': 'fitContent',
                    '100%': 'fullWidth'
                },
                execute: function (self) {
                    $(self.state.widget.element).attr('width', self.value || null);
                },
                contextChange: function (e, self) {
                    self.value = $(self.state.widget.element).attr('width') || '';
                }
            }),
            ui.buttonlist('addRemoveCell',
                ui.button('addColumnBefore', {
                    realm: 'widget',
                    execute: 'addColumnBefore'
                }),
                ui.button('addColumnAfter', {
                    realm: 'widget',
                    execute: 'addColumnAfter'
                }),
                ui.button('addRowAbove', {
                    realm: 'widget',
                    execute: 'addRowAbove',
                    enabled: function (self) {
                        return !hasTableHeader(self.state.widget) || getCellSelection(self.context).minRow > 0;
                    }
                }),
                ui.button('addRowBelow', {
                    realm: 'widget',
                    execute: 'addRowBelow'
                }),
                ui.button('removeColumn', {
                    realm: 'widget',
                    execute: 'removeColumn'
                }),
                ui.button('removeRow', {
                    realm: 'widget',
                    execute: 'removeRow'
                })
            ), {
                hiddenWhenDisabled: true
            }
        )
    );

    ui.i18n('en', {
        insertTable: 'Table',
        modifyTable: 'Modify table',
        showHeader: 'Show header',
        style: 'Table style',
        styleDefault: 'Default',
        addColumnBefore: 'Add column before',
        addColumnAfter: 'Add column after',
        addRowAbove: 'Add row above',
        addRowBelow: 'Add row below',
        removeColumn: 'Remove column',
        removeRow: 'Remove row',
        tableWidth: 'Table width',
        fitContent: 'Fit to content',
        fullWidth: 'Full width'
    });

    var selectHandleX = Editor.handle('cell');
    var selectHandleY = Editor.handle('cell');
    var updateOnMouseup;

    Editor.addLayer('table', function (canvas) {
        var widget = canvas.hoverNode && canvas.hoverNode.widget;
        if (widget && widget.id === 'table') {
            var rect = getRect(widget);
            canvas.drawLine(rect, 'top', 10, 'transparent', 'solid', selectHandleX);
            canvas.drawLine(rect, 'left', 10, 'transparent', 'solid', selectHandleY);
        }

        var selection = canvas.typer.getSelection();
        var handle = canvas.activeHandle;
        if (handle === selectHandleX || handle === selectHandleY) {
            var isColumnMode = handle === selectHandleX;
            var index = findIndex(updateOnMouseup ? visualRange : widget, isColumnMode, isColumnMode ? canvas.pointerX : canvas.pointerY);
            if (!updateOnMouseup) {
                visualRange = new CellSelection(widget, 0, 0, countRows(widget) - 1, countColumns(widget) - 1);
                visualRange[isColumnMode ? 'minCol' : 'minRow'] = index;
            }
            visualRange[isColumnMode ? 'maxCol' : 'maxRow'] = index;
            updateOnMouseup = true;
        } else if (canvas.selectionChanged) {
            visualRange = getCellSelection(canvas);
            if (!visualRange || (visualRange.numRow === 1 && visualRange.numCol === 1)) {
                visualRange = null;
                updateOnMouseup = false;
            } else {
                updateOnMouseup = true;
            }
        }
        if (updateOnMouseup && !canvas.mousedown) {
            updateOnMouseup = false;
            if (visualRange.mode === MODE_TABLE) {
                canvas.typer.select(visualRange.element);
                visualRange = null;
            } else {
                selectCells(visualRange.widget, Math.min(visualRange.minRow, visualRange.maxRow), Math.min(visualRange.minCol, visualRange.maxCol), visualRange.numRow, visualRange.numCol);
            }
        }

        if (visualRange) {
            var c1 = getCell(visualRange, 'min');
            var c2 = getCell(visualRange, 'max');
            canvas.fill(helper.mergeRect(getRect(c1), getRect(c2)));
        }
        canvas.toggleLayer('selection', !visualRange);
    });

}(jQuery, zeta));
