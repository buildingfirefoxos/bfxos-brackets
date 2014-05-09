/*
 * Copyright (c) 2013 Glenn Ruehle
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/*
TODO:
- package.json
*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true,  regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window */

define(function (require, exports, module) {
    "use strict";

    // Brackets modules
    var CommandManager      = brackets.getModule("command/CommandManager"),
        EditorManager       = brackets.getModule("editor/EditorManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        KeyBindingManager   = brackets.getModule("command/KeyBindingManager"),
        Menus               = brackets.getModule("command/Menus"),
        NativeApp           = brackets.getModule("utils/NativeApp"),
        PanelManager        = brackets.getModule("view/PanelManager");

    // Local modules
    var panelHTML   = require("text!panel.html");

    // jQuery objects
    var $icon,
        $iframe;

    // Other vars
    var panel,
        visible = false,
        realVisibility = false;

    function _resizeIframe() {
        if (visible && $iframe) {
            var iframeWidth = panel.$panel.innerWidth();
            $iframe.attr("width", iframeWidth + "px");
        }
    }

    function _loadDocumentation() {
        var url = "http://buildingfirefoxos.com/building-blocks/";


        $iframe.attr("src", url);
        $iframe.load(function () {
            var elDiv = document.createElement('div');
            var elInput = document.createElement('input');

            $(elInput).attr('id','fakeInput');
            $(elDiv).css({
                'width'     :'0',
                'height'    :'0',
                'overflow'  :'hidden',
                'position'  : 'fixed',
                'top'       : '50%'
            });
            $(elDiv).append(elInput);

            $iframe.contents().find("body").append(elDiv);
            $iframe.contents().find("html").mousedown(function(){
                $(elInput).focus();
            });
          
            $iframe.contents().get(0).addEventListener("click", function (e) {
                if (e.target && e.target.href) {
                    if (e.target.href.indexOf("http://buildingfirefoxos.com") !== 0) {
                        // Open external links in the default browser
                        NativeApp.openURLInDefaultBrowser(e.target.href);
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                }
            }, true);
            $iframe.contents().get(0).addEventListener("keydown", function (e) {
                if (e.keyCode === 27) { // ESC key
                    EditorManager.focusEditor();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }, true);
        });
    }

    function _setPanelVisibility(isVisible) {
        if (isVisible === realVisibility) {
            return;
        }

        realVisibility = isVisible;
        if (isVisible) {
            if (!panel) {
                var $panel = $(panelHTML);
                $iframe = $panel.find("#bfxos-iframe");

                panel = PanelManager.createBottomPanel("bfxos-panel", $panel);
                $panel.on("panelResizeUpdate", function (e, newSize) {
                    $iframe.attr("height", newSize);
                });
                $iframe.attr("height", $panel.height());

                _loadDocumentation();

                window.setTimeout(_resizeIframe);
            }
            $icon.toggleClass("active");
            panel.show();
        } else {
            $icon.toggleClass("active");
            panel.hide();
        }
    }

    function _toggleVisibility() {
        visible = !visible;
        _setPanelVisibility(visible);
    }

    // Insert CSS for this extension
    ExtensionUtils.loadStyleSheet(module, "icon.css");

    // Add toolbar icon
    $icon = $("<a>")
        .attr({
            id: "bfxos-icon",
            href: "#",
            title: "Building Firefox OS"
        })
        .click(_toggleVisibility)
        .appendTo($("#main-toolbar .buttons"));

    // Listen for resize events
    $(PanelManager).on("editorAreaResize", _resizeIframe);
    $("#sidebar").on("panelCollapsed panelExpanded panelResizeUpdate", _resizeIframe);

});
