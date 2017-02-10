"use strict";

// a file like this should be included
// in the relevant template/snippet for your site.

$(function () {
  var resultsSelectors, resultsMessages, results;
  var apiUrlOpts, apiCallbacks, api;
  var barSelectors, bar;

  resultsSelectors = {
    container: "#example-search-results",
    loadDisplay: "#example-search-load"
  }
  resultsMessages = {
    searchFailure: "Sorry, something went wrong.",
    searchFailureClass: "example-search-failure",
    noResults: "No results were found.",
    noResultsClass: "example-search-noresults"
  }

  // make a new searchResults object
  // with the defined selectors/options
  results = searchResults.new(resultsSelectors, resultsMessages);

  // 'example' directs the api to 'search.example.liquid'
  // 'product' tells the api to only search Product objects at this endpoint
  apiUrlOpts = {
    view: "example",
    type: "product"
  }
  apiCallbacks = {
    handleSuccess: results.displayResults,
    handleFailure: results.displaySearchFailure,
    before: results.clear,
    always: results.toggleLoadDisplay
  }

  // make a new searchAPI object
  // with the defined options
  // and the searchResults object callbacks
  api = searchAPI.new(apiUrlOpts, apiCallbacks);

  barSelectors = {
    form: ".site-search-form",
    input: ".site-search-input"
  }

  // make a new searchBar object
  // with the defined selectors
  // and the searchAPI object
  bar = searchBar.new(barSelectors, api);

  // add event listener to search form submission
  bar.init();
});
