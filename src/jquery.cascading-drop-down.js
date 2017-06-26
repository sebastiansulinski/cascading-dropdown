/*
 * ssdCascadingDropDown jQuery plugin
 * Examples and documentation at: https://github.com/sebastiansulinski/cascading-dropdown
 * Copyright (c) 2016 Sebastian Sulinski
 * Version: 1.4.3 (26-JUN-2017)
 * Licensed under the MIT.
 * Requires: jQuery v1.9 or later
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define(['jquery'], function($) {
            return factory($, root);
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else {
        return factory(root.jQuery || root.$, root);
    }
}(this, function ($) {

    (function() {

        $.fn.ssdCascadingDropDown = function(options) {

            "use strict";

            var self = this,
                settings = $.extend({

                    attrDataGroup                   : 'group',
                    attrDataId                      : 'id',
                    attrDataUrl                     : 'url',
                    attrDataTarget                  : 'target',
                    attrDataDefaultLabel            : 'default-label',
                    attrDataReplacement             : 'replacement',

                    attrDataReplacementContainer    : 'replacement-container',
                    attrDataReplacementDefault      : 'default-content',

                    classReplacementContainer       : 'cascadingContainer',

                    indexSuccess                    : 'success',
                    indexError                      : 'error',
                    indexMenu                       : 'menu',
                    indexReplacement                : 'replacement',

                    verify                          : true,

                    startCall                       : function(trigger, props) {},
                    endCall                         : function(trigger, props) {},

                    nonFinalCallback                : function(trigger, props, data, self) {},
                    nonFinalEmptyCallback           : function(trigger, props, self) {},
                    finalCallback                   : function(trigger, props, data, self) {},
                    finalEmptyCallback              : function(trigger, props, self) {},
                    errorCallback                   : function(message, data) { console.warn(message); }

                }, options);


            function isEmpty(value) {

                "use strict";

                return (
                    value === undefined ||
                    value === '' ||
                    value === false ||
                    value.length < 1
                );

            }

            function indexExists(index, collection) {

                "use strict";

                return (
                    index in collection
                );

            }

            function preventStop(event) {

                "use strict";

                event.preventDefault();
                event.stopPropagation();

            }

            function objectGroup(group) {

                "use strict";

                return $('[data-' + settings.attrDataGroup + '="' + group + '"]');

            }

            function objectId(group, id) {

                "use strict";

                return $('[data-' + settings.attrDataGroup + '="' + group + '"][data-' + settings.attrDataId + '="' + id + '"]');

            }

            function objectTarget(group, id) {

                "use strict";

                return $('[data-' + settings.attrDataGroup + '="' + group + '"][data-' + settings.attrDataTarget + '="' + id + '"]');

            }

            function objectContainer(id) {

                "use strict";

                return $('[data-' + settings.attrDataReplacementContainer + '="' + id + '"]');

            }

            function getProperties(instance) {

                "use strict";

                var props = {
                    group : instance.data(settings.attrDataGroup),
                    id : instance.data(settings.attrDataId),
                    target : instance.data(settings.attrDataTarget),
                    url : instance.data(settings.attrDataUrl),
                    value : instance.val(),
                    isValueEmpty : function() {

                        "use strict";
                        return isEmpty(this.value)

                    },
                    replacementContainer : instance.data(settings.attrDataReplacement),
                    final : instance.data('final'),
                    isFinal : function() {

                        "use strict";
                        return this.final !== undefined;

                    }
                };

                props.targetObject = objectId(props.group, props.target);
                props.targetDefaultLabel = props.targetObject.data(settings.attrDataDefaultLabel);
                props.parent = objectTarget(props.group, props.id);
                props.parentUrl = props.parent.data(settings.attrDataUrl);

                return props;

            }

            function optionTag() {

                "use strict";

                var out  = '<option value="';
                out += isEmpty(arguments[1]) ? '' : arguments[1];
                out += '">';
                out += isEmpty(arguments[0]) ? 'Select one' : arguments[0];
                out += '</option>';

                return out;

            }

            function defaultOptionTag(label) {

                "use strict";

                return optionTag(label);

            }

            this.formatOptions = function(defaultLabel, collection) {

                "use strict";

                var oDeferred = $.Deferred(),
                    out = defaultOptionTag(defaultLabel);

                $.each(collection, function(key, value) {

                    out += optionTag(value.name, value.value);

                    if ((key + 1) === collection.length) {

                        oDeferred.resolve(out);

                    }

                });

                return oDeferred.promise();

            };

            function formatData(defaultLabel, data) {

                "use strict";

                return self.formatOptions(defaultLabel, data[settings.indexMenu]);

            }

            function replaceData(container, replacement) {

                "use strict";

                var object = objectContainer(container);

                if (object.length === 0) {

                    return;

                }

                if (isEmpty(replacement)) {

                    replacement = object.data(settings.attrDataReplacementDefault);

                }

                object.html(replacement);

            }

            function resetCascade(group, target, defaultLabel) {

                "use strict";

                target.html(defaultOptionTag(defaultLabel)).prop('disabled', true);

                var newTarget = target.data(settings.attrDataTarget);

                if (isEmpty(newTarget)) {

                    return;

                }

                var targetObject = objectId(group, newTarget),
                    targetDefaultLabel = targetObject.data(settings.attrDataDefaultLabel);

                if (targetObject.length > 0) {

                    resetCascade(group, targetObject, targetDefaultLabel);

                }

            }

            function fetchSelectedData(trigger) {

                "use strict";

                var group = trigger.data(settings.attrDataGroup),
                    items = objectGroup(group).not(':disabled'),
                    values = [];

                $.each(items, function() {

                    var value = $(this).val();

                    if ( ! isEmpty(value)) {

                        values.push({
                            "name" : $(this).prop('name'),
                            "value" : $(this).val()
                        });

                    }

                });

                return values;

            }

            function formatQuery(data) {

                "use strict";

                return $.param(data);

            }

            function isDataValid(data) {

                "use strict";

                if ( ! data) {

                    throw new Error('Invalid data received!');

                }

                if ( ! data.success) {

                    if ( ! indexExists(settings.indexError, data)) {

                        throw new Error('There was a problem with the request!');

                    }

                    settings.errorCallback(data[settings.indexError], data);

                    return false;

                }

                return true;

            }

            function emptyCallback(trigger, props) {

                "use strict";

                if (props.isFinal()) {

                    return settings.finalEmptyCallback(trigger, props, self);

                }

                return settings.nonFinalEmptyCallback(trigger, props, self);

            }

            function emptyRequest(trigger, props) {

                "use strict";

                emptyCallback(trigger, props);

                if ( ! isEmpty(props.parent) && ! isEmpty(props.parentUrl)) {

                    $.getJSON(props.parentUrl + '?' + formatQuery(props.selection), function(data) {

                        if ( ! isDataValid(data)) {

                            return;

                        }

                        callback(trigger, props, data);

                        replaceData(
                            props.replacementContainer,
                            data[settings.indexReplacement]
                        );

                    });

                    return;

                }

                replaceData(props.replacementContainer, '');

            }

            function callback(trigger, props, data) {

                "use strict";

                if (props.isFinal()) {

                    return settings.finalCallback(trigger, props, data, self);

                }

                return settings.nonFinalCallback(trigger, props, data, self);

            }

            function request(trigger, props) {

                "use strict";

                settings.startCall(trigger, props);

                $.ajax({
                    dataType: "json",
                    url: props.url + '?' + formatQuery(props.selection),
                    success: function (data) {

                        settings.endCall(trigger, props);

                        if (!isDataValid(data)) {
                            return;
                        }

                        callback(trigger, props, data);

                        if (indexExists(settings.indexMenu, data)) {

                            $.when(formatData(props.targetDefaultLabel, data))
                                .then(function (items) {

                                    props.targetObject
                                        .html(items)
                                        .prop('disabled', false);

                                });

                        }

                        if (indexExists(settings.indexReplacement, data)) {

                            replaceData(
                                props.replacementContainer,
                                data[settings.indexReplacement]
                            );

                        }

                    },
                    error: function(jqXHR, textStatus, errorThrown) {

                        settings.endCall(trigger, props);

                        throw new Error(errorThrown);

                    }
                });

            }

            function applyEvent(trigger) {

                "use strict";

                trigger.on('change', function(event) {

                    preventStop(event);

                    var trigger = $(this);

                    if (trigger.is(':disabled')) {
                        return;
                    }

                    var props = getProperties(trigger);

                    if (isEmpty(props.url)) {
                        return;
                    }

                    if ( ! isEmpty(props.target)) {

                        resetCascade(
                            props.group,
                            props.targetObject,
                            props.targetDefaultLabel
                        );

                    }

                    props.selection = fetchSelectedData(trigger);

                    if (isEmpty(props.value)) {

                        emptyRequest(trigger, props);

                        return;

                    }

                    request(trigger, props);

                });

            }

            function hasAttribute(attr, instance) {

                "use strict";

                return ( ! isEmpty(instance.attr(attr)) );

            }

            function verify(instance) {

                "use strict";

                var oDeferred = $.Deferred(),
                    attributes = [
                        settings.attrDataGroup,
                        settings.attrDataId,
                        settings.attrDataUrl,
                        settings.attrDataTarget,
                        settings.attrDataDefaultLabel,
                        settings.attrDataReplacement
                    ];

                if ( ! settings.verify) {

                    oDeferred.resolve();

                } else {

                    $.each(attributes, function (key, value) {

                        value = 'data-' + value;

                        if ( ! hasAttribute(value, instance)) {

                            console.log(
                                instance.prop('name') +
                                ' is missing attribute ' +
                                value
                            );

                        }

                        if ((key + 1) === attributes.length) {

                            oDeferred.resolve();

                        }

                    });

                }

                return oDeferred.promise();

            }

            function setUp(trigger) {

                "use strict";

                trigger
                    .html(defaultOptionTag(trigger.data(settings.attrDataDefaultLabel)))
                    .prop('disabled', true);

            }

            function setUpContainers() {

                "use strict";

                var container = $('.' + settings.classReplacementContainer);

                $.each(container, function () {

                    $(this).html($(this).data(settings.attrDataReplacementDefault));

                });

            }

            setUpContainers();

            return this.each(function() {

                "use strict";

                var selfInstance = $(this);

                setUp(selfInstance.not(':enabled'));

                $.when(verify(selfInstance)).then(function() {

                    applyEvent(selfInstance);

                });

            });

        };

    })();

}));