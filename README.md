# Shopify jQuery Search Components

##

### Requirements

These components are dependent on jQuery being enabled on a Shopify storefront.

### Summary

These are three components that enabled quicker development of custom search functionality in a Shopify storefront.

They are:

* a 'results' component that correponds to the elements in which your search results will be rendered.
* an 'api' component that takes a query and calls the appropriate callback functions from the 'results' component
* a 'bar' component that connects a form element to the 'api' component

The three are meant to be used together, but they can also be taken in isolation for other purposes.


### searchResults

This is object has only one method, #new, which returns an object with a set of customized callback methods.

The #new method takes two arguments:

* an object with properties **container** and **loadDisplay**, which contain selectors for the results container and the interim load display
* an object with properties **searchFailure**, **searchFailureClass**, **noResults**, and **noResultsClass**, which contain error messages and the classes to be set on the elements they appear within

These objects are passed into #new:

```javascript
var selectors = {
  container: "#example-search-results",
  loadDisplay: "#example-search-load"
}
var resultsMessages = {
  searchFailure: "Sorry, something went wrong.",
  searchFailureClass: "example-search-failure",
  noResults: "No results were found.",
  noResultsClass: "example-search-noresults"
}

var results = searchResults.new(resultsSelectors, resultsMessages);
```

And the resultant object is configured with the methods:
* **clear** (empties the container)
* **toggleLoadDisplay** (hides and shows the loading display)
* **displayItems** (checks the length of 'results' array property of its only argument, and either calls 'displayNoResults', or calls 'displayItem' on each object in the array)
* **displayNoResults** (displays a message to inform the users that no matches could be found)
* **displayItem** (configures an individual result and displays it in the results container)
* **displayResults** (checks results length and either calls displayNoResults, or calls displayItem on each result)
* **displaySearchFailure** (displays a message if the AJAX request fails)

...any of which may be overridden with a custom function.

### searchAPI

This object has only one method, #new, which returns an object used to query a JSON endpoint on a Shopify storefront.

The #new method takes two arguments:

* an object with properties **view** and **product**, which are used to configure the url endpoint to be requested.
* an object specificying which callbacks should be used in the life cycle of the request:
    * **before** (called before each request begins)
    * **handleSuccess** (called on the data returned from a successful request)
    * **handleFailure** (called in the event of a request failure)
    * **then** (called after handleSuccess in the event of a successful request)
    * **done** (called after the request has either failed or succeeded)
    * **always** (same functionality as 'done')

These callbacks correspond to a number of available callbacks on a [jQuery Deferred Object](https://api.jquery.com/category/deferred-object/).

These objects are passed into #new:

```javascript
var urlOpts = {
  view: "example",
  type: "product"
}
var callbacks = {
  handleSuccess: results.displayResults,
  handleFailure: results.displaySearchFailure,
  before: results.clear,
  always: results.toggleLoadDisplay
}

var api = searchAPI.new(urlOpts, callbacks);
```

And the resultant object has the methods:
* **search** (takes a query string, sends a request to an endpoint, and executes callbacks in the lifecycle of the request)
* **url** (returns a sample version of the requested endpoint)
* **callbacks** (returns an object that shows which functions are attributed to which request lifecycle methods)

### searchBar

This object has only one method, #new, which returns an object that corresponds to the form used to take in a query.

The #new method takes two arguments:
* an object with properties **form** and **input**, which are selectors used to find the form and the query input field
* a predefined **searchAPI** object, to be able to use its 'query' method

These objects are passed into #new:

```javascript
var selectors = {
  form: ".site-search-form",
  input: ".site-search-input"
}

var bar = searchBar.new(selectors, api);
```

And the resultant object has the methods:
* **init** (used to officially connect the search bar to the rest of the functionality)
* **form** (returns a jQuery object that shows you the 'form' element you're using)
* **input** (returns a jQuery object that shows you the 'input' element you're using)

**Call #init on the searchBar instance to start up all the components.**

### Examples

Check exampleConnection.js for an example of how to connect all the components, and check search.example.liquid for an example of how to configure a custom Shopify search endpoint.
