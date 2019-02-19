(function () {
    'use strict';

    var Editor = zeta.Editor;
    var helper = zeta.helper;
    var getRect = helper.getRect;
    var containsOrEquals = helper.containsOrEquals;
    var closest = Editor.prototype.closest;
    var activeNode;
    var insertPoint;

    var handle = Editor.handle('move', function () {
        if (activeNode && insertPoint) {
            activeNode.typer.invoke(function (tx) {
                tx.selection.select(insertPoint);
                tx.insertHtml(activeNode.element);
            });
        }
    });
    Editor.addLayer('dragWidget', function (canvas) {
        var hoverNode = canvas.hoverNode;
        if (handle.active) {
            var node = closest(hoverNode, Editor.NODE_PARAGRAPH | Editor.NODE_WIDGET);
            insertPoint = null;
            if (node && !containsOrEquals(activeNode, node)) {
                var rectA = getRect(node);
                var rectC = getRect(closest(node, Editor.NODE_EDITABLE));
                var before = canvas.pointerY < rectA.centerY;
                var nextNode = before ? node.previousSibling : node.nextSibling;
                if (nextNode !== activeNode && canvas.typer.widgetAllowed(activeNode.widget.id, node)) {
                    var y;
                    if (nextNode) {
                        var rectB = getRect(nextNode);
                        y = (rectA.bottom <= rectB.top ? rectA.bottom + rectB.top : rectB.bottom + rectA.top) / 2;
                    } else {
                        y = getRect(node, true)[before ? 'top' : 'bottom'];
                    }
                    canvas.drawLine(rectC.left, y, rectC.right, y, 1, 'red', 'dashed');
                    insertPoint = canvas.typer.createCaret(node.element, before);
                }
            }
            canvas.fill(activeNode.element);
        } else if (hoverNode && (!activeNode || containsOrEquals(activeNode, hoverNode) || !helper.pointInRect(canvas.pointerX, canvas.pointerY, getRect(activeNode), 10))) {
            activeNode = closest(hoverNode, Editor.NODE_WIDGET);
        }
        if (activeNode) {
            canvas.drawHandle(activeNode, 'left top', 11, 'data:image/gif;base64,R0lGODlhCwALAKEBAE1PUP///////////yH5BAEKAAIALAAAAAALAAsAAAIUjI8ZoAffDFOzuoexk5zGBUXTlxQAOw==', handle);
        }
    });

})();
