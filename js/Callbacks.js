"use strict";
require('jquery-ui/ui/widgets/autocomplete');
var App = require("./App.js");
var Utils = require("./Utils.js");
var Callbacks = function () {
    var app = false;
    var utils = new Utils();
    var map = false;
    this.start = function () {
        var conf = {};
        if (("localStorage" in window) && window["localStorage"] != null) {
            conf["map_center_lat"] = localStorage.getItem("map_center_lat");
            conf["map_center_lng"] = localStorage.getItem("map_center_lng");
            conf["map_zoom"] = localStorage.getItem("map_zoom");
            conf["map_type"] = localStorage.getItem("map_type");
        }
        var defaultLocation = [parseFloat(conf['map_center_lng']) || 27.3731, parseFloat(conf['map_center_lat']) || 36.0744];
        var zoom = parseFloat(conf['map_zoom']) || 2.0244;
        var styles = ["mapbox://styles/mapbox/navigation-preview-day-v4", "mapbox://styles/mapbox/light-v10", "mapbox://styles/mapbox/navigation-preview-night-v4", "mapbox://styles/mapbox/outdoors-v11", /*"mapbox://styles/mapbox/satellite-v9"*/];
        if (localStorage.getItem('map_style_idx') === null) {
            localStorage.setItem('map_style_idx', 0);
        }
        var idx = parseInt(localStorage.getItem('map_style_idx'));
        if (idx == styles.length - 1) {
            localStorage.setItem('map_style_idx', 0);
        } else {
            localStorage.setItem('map_style_idx', idx + 1);
        }
        map = new mapboxgl.Map({
                container: 'map',
                style: styles[idx],
                center: defaultLocation,
                zoom: zoom
            });
        map.on('style.load', function () {
            var waiting = function () {
                if (!map.isStyleLoaded()) {
                    setTimeout(waiting, 200);
                } else {
                    app = new App(conf, map);
                    bindHandlers();
                    app.startPolling(function () {
                        var callSign = utils.getUrlParam("c", document.URL);
                        if (callSign) {
                            app.searchForCallsign(callSign);
                        }
                    });
                }
            };
            waiting();
        });
    }
    var saveParamsToLocalStorage = function (app, callSign) {
        if (("localStorage" in window) && window["localStorage"] != null && app.getMap()) {
            localStorage.setItem("map_center_lat", app.getMap().getCenter().lat);
            localStorage.setItem("map_center_lng", app.getMap().getCenter().lng);
            localStorage.setItem("map_zoom", app.getMap().getZoom());
            localStorage.setItem("currentCallsign", callSign);
        }
    }
    var getCallsignFromLocalStorage = function () {
        if (("localStorage" in window) && window["localStorage"] != null) {
            var currentCallsign = localStorage.getItem("currentCallsign");
            if (currentCallsign) {
                return currentCallsign;
            }
        }
        return "";
    }
    var bindHandlers = function () {
        var searchrow = $("#searchrow");
        var inputCallsign = $("#inputCallsign");
        var buttonCallsign = $("#buttonCallsign");
        searchrow.removeClass("hidden");
        inputCallsign.val(getCallsignFromLocalStorage());
        app.onOpenInfoWindow = function (client) {
            searchrow.hide();
            if (window && window.history && window.history.replaceState) {
                var callSign = client.callsign;
                if (callSign) {
                    history.replaceState({}, document.title, "?c=" + callSign);
                }
            }
            saveParamsToLocalStorage(app, inputCallsign.val());
        }
        app.onCloseInfoWindow = function () {
            searchrow.show();
            if (window && window.history && window.history.replaceState) {
                history.replaceState({}, document.title, '//' + location.host + location.pathname);
            }
            saveParamsToLocalStorage(app, inputCallsign.val());
        }
        app.onReceiveClientsArray = function (callSignsArray) {
            inputCallsign.autocomplete("option", {
                source: callSignsArray
            });
        }
        inputCallsign.autocomplete({
            source: [],
            delay: 0,
            minLength: 2,
            open: function (result) {
                if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                    $(".ui-autocomplete").off("menufocus hover mouseover");
                }
            },
            select: function (event, ui) {
                setTimeout(function () {
                    document.activeElement.blur();
                    buttonCallsign.click();
                }, 200);
            }
        });
        buttonCallsign.click(function () {
            setTimeout(function () {
                app.searchForCallsign(inputCallsign.val());
            }, 200);
        });
        inputCallsign.keypress(function (e) {
            if (e.which == 13) {
                buttonCallsign.click();
                return false;
            }
        });
        window.onbeforeunload = function (e) {
            saveParamsToLocalStorage(app, inputCallsign.val());
        };

        document.addEventListener("click", function (e) {
            var el = e.target;
            if (el.classList.contains("marker")) {
                var callsign = e.target.getAttribute('data-callsign');
                var cid = e.target.getAttribute('data-cid');
                var longitude = e.target.getAttribute('data-lt');
                var latitude = e.target.getAttribute('data-lg');
                app.requestClientDetails(cid, callsign, function (clientDetails) {
                    app.openInfoWindow(longitude, latitude, clientDetails);
                });
            }
        });
    }
}
module.exports = Callbacks;
