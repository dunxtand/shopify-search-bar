"use strict";

var searchResults = (function ($, window, document, undefined) {
<<<<<<< HEAD
  function initializeObject (selectors, messages) {
    var container   = $(selectors.container),
        loadDisplay = $(selectors.loadDisplay);

    function createMessageAdder (message, messageClass) {
      return function () {
        var msg = $("<p></p>").addClass(messageClass).text(message);
        container.append(msg);
      }
    }

    var _this = Object.create({
      clear: function () {
        container.empty();
      },
      toggleLoadDisplay: function () {
        loadDisplay.toggle();
      },
      displayResults: function (data) {
        // expect 'data' to have 'results' array property
        if (data.results.length < 1) {
          _this.displayNoResults();
        } else {
          _this.displayItems(data.results);
        }
      },
      displayItems: function (items) {
        items.forEach(_this.displayItem);
      },
      displayItem: function (item) {
        var link = $("<a></a>").attr("href", item.url).text(item.title)
        var p = $("<p></p>").append(link)
        container.append(p)
      },
      displaySearchFailure: createMessageAdder(messages.searchFailure, messages.searchFailureClass),
      displayNoResults: createMessageAdder(messages.noResults, messages.noResultsClass)
    });

    return _this;
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
      return initializeObject(selectors, messages);
    }
  }
})(jQuery, window, document);
