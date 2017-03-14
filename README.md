# Shopify Search Bar

### Summary

A jQuery plugin (and Liquid JSON file) that lets you quickly build out search functionality on a Shopify storefront.

### Motivation

There are plenty of apps on the [Shopify App Store](https://apps.shopify.com/), but not many of them are very customizable. This plugin just takes care of the boilerplate JS and lets you define your own behavior if you like.

### Installation

Make sure you have jQuery enabled on your site:

````html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>
````

Copy ssb.min.js straight into a script tag, or to a file on your site and reference it:

````html
<script src="/path/to/ssb.min.js"></script>
````

### Configuration Requirements

1. You must make a **liquid search template** that returns an object with at least a **results** property that contains an array. Each item in the array must at least have **title** and **url** properties. Copy the [example](https://github.com/dunxtand/shopify-search-bar/blob/master/example/search.example.liquid) and customize what kind of info you get about the returned items. Check Shopify's [documentation](https://help.shopify.com/themes/liquid/objects/search#search-results) for more about returned items.
2. The **input** element you set as your search bar must be within a **form** element, and must be of type="**text**".

## Usage

Select the **input** element that will collect the search term, and call the **#shopifySearchBar** method on it, passing in the urlOpts and containerId args:

````javascript
var urlOpts = {view: "example", type: "product"};
var containerId = "#search-container";
var input = $("#search-bar");
input.shopifySearchBar(urlOpts, containerId);
````

##### urlOpts (object)

* Must have a "**view**" property. This specifies the Liquid template to query; if this is set to "**example**", your search will query **search.example.liquid**.
* Optionally can have a "**type**" property. This restricts the search to only that type of Shopify object. Options are ["**page**"](https://help.shopify.com/themes/liquid/objects/page), ["**product**"](https://help.shopify.com/themes/liquid/objects/product), and [**article**](https://help.shopify.com/themes/liquid/objects/article).

##### containerId (string)

* Must be the **id** of the element into which your search will be appended (i.e. a div), with the "#" at the front.

That's all you need to get the default behavior going.

## Defaults

As is, each time a search is performed:

* if there are results, they will be appended into the container in the format:
  ````html
  <p class="ssb-item">
    <a href="/path/to/item">Item Title</a>
  </p>
  ````
* if there are no results, this p tag will be appended to the container:
  ````html
  <p class="ssb-failure">
    No results were found.
  </p>
  ````
* if something went wrong with the request, this p tag will be appended to the container:
  ````html
  <p class="ssb-failure">
    Sorry, something went wrong.
  </p>
  ````

The container will be cleared of all elements before each new request.

## Customization

Any of these methods can be called on the **input** element you set as your search bar. You have to initialize the element, as shown above, to use any of these.

#### #messages

Pass in an object with the error messages you want. The object can have properties **noResults** and **searchFailure**, which contain the relevant messages to display.

````javascript
input.messages({noResults: "Sorry, we couldn't find anything!", searchFailure: "Oh no, something's up."});
````

#### #before

Pass in a function that will be always called before the request begins. The argument to this function is the results container.

````javascript
input.before(function (container) {
  // do something here
});
````

#### #after

Pass in a function that will be always called after the request has ended. The argument to this function is the results container.

````javascript
input.after(function (container) {
  // do something here
});
````

#### #success

Pass in a function that will only be called if the result succeeds. The arguments to this function are the results container and the response from the request.

````javascript
input.success(function (container, res) {
  // do something here
});
````

#### #failure

Pass in a function that will only be called if the result fails. The arguments to this function are the results container and the response from the request. *This overrides the default behavior for a request failure specified above.*

````javascript
input.failure(function (container, res) {
  // do something here
});
````

#### #displayItem

Pass in a function that will be called on each item object in the returned "results" array. The argument to this function is the current item object.
*This overrides the default behavior for individual item appending specified above.*

````javascript
input.displayItem(function (item) {
  // do something here
});
````

#### #noResults

Pass in a function that will be called in the event that there are no search results. The argument to this function is the results container.
*This overrides the default behavior for a a search with no results specified above.*

````javascript
input.noResults(function (container) {
  // do something here
});
````

#### Chaining

All of the above methods can be called fluidly:

````javascript
input.before(beforeFn).success(successFn).after(afterFn); // etc
````

## License

[MIT](https://opensource.org/licenses/MIT)
