var checks = require("./checks");
var searchResults = require("./searchResults");
var searchAPI = require("./searchAPI");
var searchBar = require("./searchBar");

var protoMethod = (function () {
  var container, results, api, bar;
  var names = {
    before: "before",
    after: "after",
    success: "success",
    failure: "failure",
    displayItem: "displayItem",
    noResults: "noResults"
  };

  function setMessages (messagesObj) {
    if (!!messagesObj.noResults) {
      results.setMessage("noResults", messagesObj.noResults);
    }
    if (!!messagesObj.searchFailure) {
      results.setMessage("searchFailure", messagesObj.searchFailure);
    }
  }

  function createSetCallback (cbName) {
    return function (fn) {
      api.setCallback(cbName, fn);
    }
  }

  function setNewAttributes (el) {
    el.messages = setMessages;
    el.before = createSetCallback(names.before);
    el.after = createSetCallback(names.after);
    el.success = createSetCallback(names.success);
    el.failure = createSetCallback(names.failure);
    el.displayItem = createSetCallback(names.displayItem);
    el.noResults = createSetCallback(names.noResults);
  }


  return function (urlOpts, containerId) {
    checks(this, urlOpts, containerId);
    container = document.getElementById(containerId);
    setNewAttributes(this);
    // default messages should go in the component
    results = searchResults.new(container, {
      noResults: "No results were found",
      searchFailure: "sorry, something went wrong."
    });
    api = searchAPI.new(urlOpts, results);
    bar = searchBar.new(this, api);
    return this;
  }
})();

module.exports = protoMethod;
