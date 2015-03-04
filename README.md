# Cascading drop-down menu

jQuery plugin, which allows you to populate a set of form drop-down menus based on the previous selection.

## Basic usage

To use the plugin without overwriting any default settings, you'll need to create a structure of the form with a number of drop-down (select) menus.
In the following example I'm using

```
<form>

    <select
        name="category"
        class="cascadingDropDown"

        data-group="product-1"
        data-target="make"
        data-url="data/make.json"
        data-replacement="container1"

        >
        <option value="">Select category</option>
        <option value="1">Shoes</option>
        <option value="2">T-shirts</option>
        <option value="3">Jeans</option>
        <option value="4">Hats</option>
        <option value="5">Belts</option>
        </select>

    <select
        name="make"
        class="cascadingDropDown"

        data-group="product-1"
        data-id="make"
        data-target="colour"
        data-url="data/colour.json"
        data-replacement="container1"
        data-default-label="Select make"

        disabled
        >
        </select>

    <select
        name="colour"
        class="cascadingDropDown"

        data-group="product-1"
        data-id="colour"
        data-target="size"
        data-url="data/size.json"
        data-replacement="container1"
        data-default-label="Select colour"

        disabled
        >
        </select>

    <select
        name="size"
        class="cascadingDropDown"

        data-group="product-1"
        data-id="size"
        data-default-label="Select size"
        data-replacement="container1"
        data-url="data/final.json"

        disabled
        >
        </select>

</form>
```

### Select attributes

- Each select tag should have a trigger class assigned to it - in the above example I've used `cascadingDropDown`.
- The first select should have all items / options ready for selection.
- All other selects should have the `disabled` attribute.
- All selects should have their `name` attribute.
- All selects should have the following `data-*` attributes:
    - `data-group` : indicates association of the select elements and helps distinguish between different groups where multiple blocks of cascading drop-downs are used.
- All selects except the last one should have the following `data-*` attribute:
    - `data-target` : indicates the select element that should be affected by the value selected from its originator
    - `data-url` : url that needs to be called when the `change` event is triggered on the given select ( should also be applied to the last one if selection includes the replacement of the container - see below )
- All selects except the first one are also required to have the following `data-*` attributes:
    - `data-id` : the id of the element corresponds to the `data-trigger` of the previous element
    - `data-default-label` : the default label for the first `option` item
- Optional `data-*` attributes:
    - `data-replacement` : corresponding container with `data-replacement-container` - used for replacing additional content with each selection.


### Instantiating the plugin

To use the plugin you'll need the latest version of jQuery plus the plugin itself.

To instantiate the plugin without overwriting any default settings simply call it on the element using its class.


```
<script src="js/jquery-2.1.3.min.js"></script>
<script src="js/jquery.cascading-drop-down.js"></script>
<script>
    $('.cascadingDropDown').ssdCascadingDropDown();
</script>
```

## Parameters

You can overwrite the following settings of the plugin:

```
attrDataGroup                   : 'group', // data-group attribute
attrDataId                      : 'id', // data-id attribute
attrDataUrl                     : 'url', // data-url attribute
attrDataTarget                  : 'target', // data-target attribute
attrDataDefaultLabel            : 'default-label', // data-default-label attribute
attrDataReplacement             : 'replacement', // data-replacement attribute

attrDataReplacementContainer    : 'replacement-container', // data-replacement-container attribute
attrDataReplacementDefault      : 'default-content', // data-default-content attribute

classReplacementContainer       : 'cascadingContainer', // class associated with the receiving container

indexSuccess                    : 'success', // json response key to indicate whether the call was successful (true) or not (false)
indexError                      : 'error', // json response key to store the error message
indexMenu                       : 'menu', // json response key to store the new menu items
indexReplacement                : 'replacement', // json response key to store the replacement for the content container

verify                          : true, // whether to run verification with instantiation

errorCallback                   : function(message, data) { console.warn(message); } // method call when json response was not successful { success : false }. It takes the error message plus the all data returned back with the call
```