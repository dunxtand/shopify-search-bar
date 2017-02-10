"use strict";

var searchResults = (function ($, window, document, undefined) {
  function configureObject (selectors, messages) {
    var container            = $(selectors.container),
        loadDisplay          = $(selectors.loadDisplay);
    var noResultsMessage     = messages.noResults,
        noResultsClass       = messages.noResultsClass;
    var searchFailureMessage = messages.searchFailure,
        searchFailureClass   = messages.searchFailureClass;
    var parent = {
      clear: function () { container.empty(); },
      toggleLoadDisplay: toggleLoadDisplay,
      displayResults: displayResults,
      displayItem: displayItem,
      displaySearchFailure: displaySearchFailure,
      displayNoResults: displayNoResults
    };
    var that;

    function displayResults (data) {
      // results should be an array of objects
      if (data.length < 1) {
        that.displayNoResults();
      }
      else {
        data.results.forEach(that.displayItem)
      }
    }

    function displayItem (item) {
      var link = $("<a></a>").attr("href", item.url).text(item.title)
      var p = $("<p></p>").append(link)
      container.append(p)
    }

    function displayNoResults () {
      var message = $("<p></p>").addClass(noResultsClass).text(noResultsMessage)
      container.append(message)
    }

    function displaySearchFailure () {
      var message = $("<p></p>").addClass(searchFailureClass).text(searchFailureMessage)
      container.append(message)
    }

    function toggleLoadDisplay () {
      if (loadDisplay.is(":hidden")) {
        loadDisplay.show();
      }
      else if (loadDisplay.is(":visible")) {
        loadDisplay.hide();
      }
    }

    that = Object.create(parent);
    return that;
  }

  function checkArgs (selectors, messages) {
    if (!selectors || !messages) {
      throw new Error("You must provide 'selectors' and 'messages' objects to the 'new' method");
    }
    if (!selectors.container || !selectors.loadDisplay) {
      throw new Error("You must provide 'container' and 'loadDisplay' selectors in the 'selectors' object");
    }
    if (!messages.noResults || !messages.noResultsClass) {
      throw new Error("You must provide a 'noResults' message and a corresponding 'noResultsClass' in the 'messages' object");
    }
    if (!messages.searchFailure || !messages.searchFailureClass) {
      throw new Error("You must provide a 'searchFailure' message and a corresponding 'searchFailureclass' to the 'messages' object");
    }
  }

  return {
    new: function (selectors, messages) {
      checkArgs(selectors, messages);
      return configureObject(selectors, messages);
    }
  }
})(jQuery, window, document);
