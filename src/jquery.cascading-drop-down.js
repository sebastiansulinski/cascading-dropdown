/*
 * ssdCascadingDropDown jQuery plugin
 * Examples and documentation at: https://github.com/sebastiansulinski/cascading-dropdown
 * Copyright (c) 2015 Sebastian Sulinski
 * Version: 1.0.0 (03-MAR-2015)
 * Licensed under the MIT.
 * Requires: jQuery v1.9 or later
 */
;(function($) {

    $.fn.ssdCascadingDropDown = function(options) {

        "use strict";

        var settings = $.extend({

            dataId              : 'id',
            dataUrl             : 'url',
            dataTarget          : 'target',
            dataDefaultLabel    : 'default-label'


        }, options);


        function isEmpty(value) {

            "use strict";

            return (
            typeof value === 'undefined' ||
            value === '' ||
            value === false
            );

        }

        function preventStop(event) {

            "use strict";

            event.preventDefault();
            event.stopPropagation();

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
                out = defaultOptionTag(defaultLabel);

            $.each(data, function(key, value) {

                out += optionTag(value.name, value.value);

                if ((key + 1) === data.length) {

                    oDeferred.resolve(out);

                }

            });

            return oDeferred.promise();

        }

        function resetCascade(target, defaultLabel) {

            "use strict";

            target.html(defaultOptionTag(defaultLabel)).prop('disabled', true);

            var newTarget = target.data(settings.dataTarget);

            if (isEmpty(newTarget)) {

                return;

            }

            var targetObject = $('[data-' + settings.dataId + '="' + newTarget + '"]'),
                targetDefaultLabel = targetObject.data(settings.dataDefaultLabel);

            if (targetObject.length > 0) {

                resetCascade(targetObject, targetDefaultLabel);

            }

        }

        function applyEvent(trigger) {

            "use strict";

            trigger.on('change', function(event) {

                preventStop(event);

                if ($(this).is(':disabled')) {

                    return;

                }

                var target = $(this).data(settings.dataTarget),
                    url = $(this).data(settings.dataUrl),
                    value = $(this).val();

                if (isEmpty(target)) {

                    return;

                }

                var targetObject = $('[data-' + settings.dataId + '="' + target + '"]'),
                    targetDefaultLabel = targetObject.data(settings.dataDefaultLabel);

                if (isEmpty(value)) {

                    resetCascade(targetObject, targetDefaultLabel);

                    return;

                }

                $.getJSON(url + value, function(data) {

                    if (!data) {

                        throw new Error('Invalid data received!');

                    }

                    $.when(formatData(targetDefaultLabel, data)).then(function(items) {

                        targetObject
                            .html(items)
                            .prop('disabled', false);

                        target = targetObject.data(settings.dataTarget);

                        if (isEmpty(target)) {

                            return;

                        }

                        targetObject = $('[data-' + settings.dataId + '="' + target + '"]'),
                            targetDefaultLabel = targetObject.data(settings.dataDefaultLabel);

                        resetCascade(
                            targetObject,
                            targetDefaultLabel
                        );

                    });

                });


            });

        }

        function setUp(trigger) {

            "use strict";

            trigger
                .html(defaultOptionTag(trigger.data(settings.dataDefaultLabel)))
                .prop('disabled', true);

        }

        return this.each(function() {

            "use strict";

            setUp($(this).not(':enabled'));

            applyEvent($(this));

        });

    }

}(jQuery));