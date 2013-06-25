/* Callback and Deferred example */

function callback_example() {
    var login_success_callback = function () {
        var user_data = { user_id: 1 };
        var user_success_callback = function () {
            writeMsg("Got the user data!", "callback");
        };
        var user_error_callback = function () {
            writeMsg("Can't get the user data!", "callback");
        };

        callbackAjaxRequest("GET", "/user_data", user_data, user_success_callback, user_error_callback);
    };

    var error_callback = function () {
        writeMsg("Can't login!", "callback");
    };

    var login_data = { username: $("#callbackUsername").val(), password: $("#callbackPassword").val() };
    callbackAjaxRequest("POST", "/login", login_data, login_success_callback, error_callback);
}

function deferred_example() {
    $.when(login()).then(
        function () {
            getData();
        }
    );
}

function getData() {
    var user_data = { user_id: 1 };
    var request = deferredAjaxRequest("GET", "/user_data", user_data);
    request.done(function () { writeMsg("Got the user data!", "deferred"); })
    request.fail(function () { writeMsg("Can't get the user data!", "deferred"); });
    return request;
}

function login() {
    var login_data = {
        username: $("#deferredUsername").val(),
        password: $("#deferredPassword").val()
    };
    var request = deferredAjaxRequest("POST", "/login", login_data);
    request.done(function () { writeMsg("Logged in!", "deferred"); })
    request.fail(function () { writeMsg("Can't login!", "deferred"); });
    return request;
}

function deferredAjaxRequest(http_verb, path, post_data) {

    writeMsg("Starting Request to " + path, "deferred");
    var deferred = $.Deferred();

    setTimeout(function () {
        if (Math.random() > .95) {
            writeMsg("Ajax call failed " + path, "deferred");
            deferred.reject();
        } else {
            writeMsg("Ajax call succeeded." + path, "deferred");
            deferred.resolve();
        }
    }, 2000);

    return deferred.promise();
}

function callbackAjaxRequest(http_verb, path, post_data, success_callback, failure_callback) {

    writeMsg("Starting Request to " + path, "callback");

    setTimeout(function () {
        if (Math.random() > .95) {
            writeMsg("Ajax call failed " + path, "callback");
            failure_callback.call();
        } else {
            writeMsg("Ajax call succeeded " + path, "callback");
            success_callback.call();
        }
    }, 2000);
}

function writeMsg(message, example) {
    $("#"+example+"Messages").append("<p>" + message + "</p>");
}

/* IDEA Bar */
var formulaRegEx = /[\d\+\-\*\/\(\)\.]/g;
var p = new MathProcessor();
// Keycodes for navigation keys.
var navKey = {
    backspace: 8,
    tab: 9,
    enter: 13,
    esc: 27,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40
};
// All named keycodes including nav keys and letters for shortcuts.
var key = $.extend({}, navKey, {
    c: 67,
    h: 72,
    r: 82,
    v: 86,
    x: 88
});
// Helper function that determines the ASCII code for a given keyup/down/press event.
function getKeycodeFromEvent(e) {
    var code = 0;
    if (!e)
        var e = window.event
    if (e.keyCode)
        code = e.keyCode;
    else if (e.which)
        code = e.which;
    return code;
}
// Restricts user input to globally defined regular expressions.
function restrictCharacters(myfield, e, restrictionType) {
    var code = getKeycodeFromEvent(e);
    var character = String.fromCharCode(code);
    var test;

    // If user pressed ESC, remove focus.
    if (code == navKey.esc) { this.blur(); return false; }

    // Ignore if user pressed invalid keys.
    if (!e.ctrlKey && code != key.backspace && code != key.tab && code != key.home && code != key.left && code != key.up && (code != key.right || (code == key.right && character == "'")) && code != key.down) {
        test = character.match(restrictionType);
    }
    if (test == null || !test)
        return false;
    return true;
}
// For a given DOM element, return a target object that contains the DOM element's row in the grid and zero-based position as an editable field.
function getRowAndIndex(domElement, editableClass) {
    var thisFieldRow = 1; // For this demo...
    var thisFieldIndex = $("#eg-ideabar").find("." + editableClass).index($(domElement));
    return {
        rowId: thisFieldRow,
        cellIndex: thisFieldIndex
    };
}

/* KTS JS */

function view(id) {
    var $eg = $("#eg-" + id);
    $eg.siblings("div").hide();
    $eg.show('slide', { direction: 'right' }, 500); ;
}

if (typeof String.prototype.removeChars !== 'function') {
    String.prototype.removeChars = function () {
        return this.replace(/[^-0-9.]/g, "");
    };
}

$(function () {
    // Syntax highlighting
    hljs.initHighlightingOnLoad();
    // Graph
    $("#graph").visualize({
        "type": "line",
        "appendTitle": false,
        "appendKey": false,
        "width": 500,
        "height": 300
    }).appendTo('#graphContainer').trigger('visualizeRefresh');
    // jQuery UI elements
    $("input[type=button]").button();
    // IDEABar
    IDEABar.init("ideaBar", function (rowId, cellIndex) {
        $("#eg-ideabar").find("input.ideaBar").eq(cellIndex).focus();
    });
    $("input.ideaBar:text").each(function () {
        IDEABar.enable(this, "ideaBar");
    });
    // Init deck
    $.extend(true, $.deck.defaults, {
        countNested: false
    });
    $.deck('.slide');
});