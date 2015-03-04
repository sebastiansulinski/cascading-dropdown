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

            attrDataGroup           : 'group',
            attrDataId              : 'id',
            attrDataUrl             : 'url',
            attrDataTarget          : 'target',
            attrDataDefaultLabel    : 'default-label'

        }, options);


        function isEmpty(value) {

            "use strict";

            return (
            typeof value === 'undefined' ||
            value === '' ||
            value === false ||
            value.length < 1
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

            var newTarget = target.data(settings.attrDataTarget);

            if (isEmpty(newTarget)) {

                return;

            }

            var targetObject = $('[data-' + settings.attrDataId + '="' + newTarget + '"]'),
                targetDefaultLabel = targetObject.data(settings.attrDataDefaultLabel);

            if (targetObject.length > 0) {

                resetCascade(targetObject, targetDefaultLabel);

            }

        }

        function fetchSelectedData(trigger) {

            "use strict";

            var group = trigger.data(settings.attrDataGroup),
                items = $('[data-' + settings.attrDataGroup + '="' + group + '"]').not(':disabled'),
                values = [];

            $.each(items, function() {

                var value = $(this).val();

                if (!isEmpty(value)) {

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

        function applyEvent(trigger) {

            "use strict";

            trigger.on('change', function(event) {

                preventStop(event);

                if ($(this).is(':disabled')) {

                    return;

                }

                var group = $(this).data(settings.attrDataGroup),
                    target = $(this).data(settings.attrDataTarget),
                    url = $(this).data(settings.attrDataUrl),
                    value = $(this).val();

                if (isEmpty(url)) {

                    return;

                }

                if (isEmpty(target)) {

                    return;

                }

                var targetObject = $('[data-' + settings.attrDataGroup + '="' + group + '"][data-' + settings.attrDataId + '="' + target + '"]'),
                    targetDefaultLabel = targetObject.data(settings.attrDataDefaultLabel);


                resetCascade(targetObject, targetDefaultLabel);


                if (isEmpty(value)) {

                    return;

                }

                var selection = fetchSelectedData($(this));

                $.getJSON(url + '?' + formatQuery(selection), function(data) {

                    if (!data) {

                        throw new Error('Invalid data received!');

                    }

                    $.when(formatData(targetDefaultLabel, data)).then(function(items) {

                        targetObject
                            .html(items)
                            .prop('disabled', false);

                    });

                });


            });

        }

        function setUp(trigger) {

            "use strict";

            trigger
                .html(defaultOptionTag(trigger.data(settings.attrDataDefaultLabel)))
                .prop('disabled', true);

        }

        return this.each(function() {

            "use strict";

            setUp($(this).not(':enabled'));

            applyEvent($(this));

        });

    }

}(jQuery));