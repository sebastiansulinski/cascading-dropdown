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
- All selects should have the following `data-*` attributes:
    - `data-group` : indicates association of the select elements and helps distinguish between different groups where multiple blocks of cascading drop-downs are used.
    - `data-target` : indicates the select element that should be affected by the value selected from its originator
- All selects except the last one should have the following `data-*` attribute:
    - `data-url` : url that needs to be called when the `change` event is triggered on the given select ( should also be applied to the last one if selection includes the replacement of the container - see below )
- All selects except the first one are also required to have the following `data-*` attributes:
    - `data-id` : the id of the element corresponds to the `data-trigger` of the previous element
    - `data-default-label` : the default label for the first `option` item
- Optional `data-*` attributes:
    - `data-replacement` : corresponding container with `data-replacement-container` - used for replacing additional content with each selection.


