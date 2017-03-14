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
    var el = document.createElement(type);
    el.className = className;
    !!text && (el.textContent = text);
    return el;
  }
  function itemElement (item) {
    var el = createElement("P", classNames.item);
    var linkStr = "<a href='" + item.url + "'>" + item.title + "</a>";
    el.innerHTML = linkStr;
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
      el.textContent = message;
    }

    var _this = window.Object.create({
      clear: function () {
        container.innerHTML = "";
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
        container.appendChild(itemElement(item));
      },
      failure: function (xhr) {
        window.console.warn(xhr);
        container.appendChild(searchFailureEl);
      },
      noResults: function () {
        container.appendChild(noResultsEl);
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
