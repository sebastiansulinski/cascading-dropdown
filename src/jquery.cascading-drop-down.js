/*
 * ssdCascadingDropDown jQuery plugin
 * Examples and documentation at: https://github.com/sebastiansulinski/cascading-dropdown
 * Copyright (c) 2016 Sebastian Sulinski
 * Version: 1.3.0 (25-FEB-2016)
 * Licensed under the MIT.
 * Requires: jQuery v1.9 or later
 */
;(function($, undefined) {

    $.fn.ssdCascadingDropDown = function(options) {

        "use strict";

        var settings = $.extend({

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

            nonFinalCallback                : function(trigger, props, data) {},
            finalCallback                   : function(trigger, props, data) {},
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

        function formatData(defaultLabel, data) {

            "use strict";

            var oDeferred = $.Deferred(),
                collection = data[settings.indexMenu],
                out = defaultOptionTag(defaultLabel);

            $.each(collection, function(key, value) {

                out += optionTag(value.name, value.value);

                if ((key + 1) === collection.length) {

                    oDeferred.resolve(out);

                }

            });

            return oDeferred.promise();

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

        function emptyRequest(trigger, props) {

            "use strict";

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

                return settings.finalCallback(trigger, props, data);

            }

            return settings.nonFinalCallback(trigger, props, data);

        }

        function request(trigger, props) {

            "use strict";

            $.getJSON(props.url + '?' + formatQuery(props.selection), function(data) {

                if ( ! isDataValid(data)) {

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


            });

        }

        function applyEvent(trigger) {

            "use strict";

            trigger.on('change', function(event) {

                preventStop(event);

                if ($(this).is(':disabled')) {

                    return;

                }

                var props = getProperties($(this));

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

                props.selection = fetchSelectedData($(this));

                if (isEmpty(props.value)) {

                    emptyRequest($(this), props);

                    return;

                }

                request($(this), props);

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

    }

}(jQuery));