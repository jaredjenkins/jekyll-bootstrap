var $currentPageInput;

IDEABar = function () {
    // Private variables
    var _inputClass;
    var _updateFunction;

    // Only show the IDEABar if it is currently hidden.
    function show() {
        if ($("#ideabar").is(":hidden"))
            $("#ideabar").show("drop", { direction: "up" }, 200);
    }

    // Only hide the IDEABar if it is currently visible.
    function hide() {
        if ($("#ideabar").is(":visible"))
            $("#ideabar").hide("drop", { direction: "up" }, 200);
    }

    // Initialize the events related to the IDEABar itself.
    function init(inputClass, updateFunction) {
        _inputClass = inputClass;
        _updateFunction = updateFunction;
        $("#ideabar input").keydown(function (e) {
            if ($currentPageInput != null) {
                var code = getKeycodeFromEvent(e);
                var navKeyPressed = false;
                // We only care about nav keys, pass other keystrokes to the textbox.
                $.each(navKey, function (k, v) {
                    if (v == code) {
                        navKeyPressed = true;
                        return false;
                    }
                });
                // If a navigation key was pressed, move cells.
                if (navKeyPressed) {
                    switch (code) {
                        case navKey.right:
                        case navKey.left:
                        case navKey.backspace:
                            return true;
                        case navKey.enter:
                        case navKey.tab:
                            var $focusedField = e.shiftKey
                                ? $focusedField = getPrevField($currentPageInput)
                                : $focusedField = getNextField($currentPageInput);
                            var target = getRowAndIndex($focusedField, _inputClass);
                            if (typeof _updateFunction === 'function')
                                _updateFunction(target.rowId, target.cellIndex);
                            return false;
                        default:
                            return false;
                    }
                }
            }
        }).keypress(function (e) {
            return restrictCharacters(this, e, formulaRegEx);
        }).keyup(function () {
            try {
                p.parse(this.value.removeNonFormulaCharacters());
                $("#ideabar .formulaError").hide();
                return true;
            }
            catch (error) {
                $("#ideabar .formulaError").show();
                return false;
            }
            finally {
                if ($currentPageInput != null) {
                    $currentPageInput.val(this.value);
                    $currentPageInput.data("formula", this.value);
                }
                return true;
            }
        }).blur(function () {
            // User is leaving the IDEABar, if they are not going back to the current input, hide the IDEABar.
            // Hack to make sure document.activeElement gets updated with the element we are going to, not the one we are blurring from.
            setTimeout(function () {
                if (!$(document.activeElement).hasClass(inputClass)) {
                    hide();
                    $currentPageInput.data("formula", $currentPageInput.val());
                    $currentPageInput.val(p.parse($currentPageInput.val()));
                }
            }, 200);
            return false;
        });
        $("#ideabar").hide();
    }

    /*
    *   Description: Enable the IDEABar for the DOM Element defined as "el".
    *   Parameters:
    *       el (DOM Element):           DOM element for which IDEABar should be enabled.
    *       inputClass (string):        Class given to the inputs which are enabled with IDEABar.
    */
    function enable(el, inputClass) {
        $(el).unbind("blur");
        $(el).focus(function () {
            show();
            $(this).val($(this).data("formula"));
            $("#ideabar input").val($(el).val());
        }).keypress(function (e) {
            return restrictCharacters(this, e, formulaRegEx);
        }).blur(function (e) {
            // Save the current page input for backwards updating.
            $currentPageInput = $(el);
            // Hack to make sure document.activeElement gets updated with the element we are going to, not the one we are blurring from.
            setTimeout(function () {
                if (document.activeElement.className.indexOf("txtIdeabar") === -1 && !$(document.activeElement).hasClass(inputClass))
                    hide();
            }, 400);
            $(this).data("formula", $(this).val());
            $(this).val(p.parse($(this).val()));
        }).keyup(function () {
            try {
                p.parse(this.value.removeNonFormulaCharacters());
                $("#ideabar .formulaError").hide();
                return true;
            }
            catch (error) {
                $("#ideabar .formulaError").show();
                return false;
            }
            finally {
                $("#ideabar input").val(el.value);
                return true;
            }
        });
    }

    function getNextField($currentField) {
        var fields = $("input." + _inputClass + ":visible:text").length - 1;
        var currentField = $("input." + _inputClass + ":visible:text").index($currentField);
        return (currentField != fields)
            ? $("input." + _inputClass + ":visible:text").eq(currentField + 1)
            : $("input." + _inputClass + ":visible:text:first");
    }

    function getPrevField($currentField) {
        var fields = $("input." + _inputClass + ":visible:text").length - 1;
        var currentField = $("input." + _inputClass + ":visible:text").index($currentField);
        return (currentField != fields)
            ? $("input." + _inputClass + ":visible:text").eq(currentField - 1)
            : $("input." + _inputClass + ":visible:text:last");
    }

    // Allow public access to some properties and methods.
    // All other properties and methods are effectively private scoped.
    return {
        init: init,
        enable: enable
    }
} ();