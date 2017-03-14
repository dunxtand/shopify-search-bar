"use strict";

var searchResults = (function () {
  var defaultMessages = {
    noResults: "No results were found.",
    searchFailure: "Sorry, something went wrong."
  };
  var classNames = {
    failure: "ssb-failure",
    item: "ssb-item"
  };
  function createElement (type, className, text) {
    var el = $("<"+type+"></"+type+">");
    el.addClass(className);
    !!text && (el.text(text));
    return el;
  }
  function itemElement (item) {
    var el = createElement("p", classNames.item);
    var link = createElement("a").attr("href", item.url).text(item.title);
    el.append(link);
    return el;
  }

  function initializeObject (container) {
    var noResultsEl = createElement("P", classNames.failure, defaultMessages.noResults),
        searchFailureEl = createElement("P", classNames.failure, defaultMessages.searchFailure);

    function setCallback (name, fn) {
      if (name === "before" || name === "after" || name === "noResults") {
        _this[name] = function () {
          return fn.call(null, container);
        }
      }
      else if (name === "success" || name === "failure") {
        _this[name] = function (xhr) {
          return fn.call(null, container, xhr);
        }
      }
      else if (name === "displayItem") {
        _this[name] = fn;
      }
    }

    function setMessage (name, message) {
      var el;
      if (name === "noResults") {
        el = noResultsEl;
      } else if (name === "searchFailure") {
        el = searchFailureEl;
      }
      el.text(message);
    }

    var _this = Object.create({
      clear: function () {
        container.empty();
      },
      displayResults: function (data) {
        if (data.results.length < 1) {
          _this.noResults();
        } else {
          _this.displayItems(data.results);
        }
      },
      displayItems: function (items) {
        items.forEach(_this.displayItem);
      },
      displayItem: function (item) {
        container.append(itemElement(item));
      },
      failure: function (res) {
        window.console.warn(res);
        container.append(searchFailureEl);
      },
      noResults: function () {
        container.append(noResultsEl);
      },
      setCallback: setCallback,
      setMessage: setMessage
    });

    return _this;
  }

  return {
    new: initializeObject
  }
})();

module.exports = searchResults;
