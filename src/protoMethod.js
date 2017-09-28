var checks = require("./checks");
var searchResults = require("./searchResults");
var searchAPI = require("./searchAPI");
var searchBar = require("./searchBar");

var protoMethod = (function () {
  var names = {
    before: "before",
    after: "after",
    success: "success",
    failure: "failure",
    displayItem: "displayItem",
    noResults: "noResults"
  };
  function bindToSetMessages (input, results) {
    return function setMessages (messagesObj) {
      if (!!messagesObj.noResults) {
        results.setMessage("noResults", messagesObj.noResults);
      }
      if (!!messagesObj.searchFailure) {
        results.setMessage("searchFailure", messagesObj.searchFailure);
      }
      return input;
    }
  }
  function bindToCreateSetCallback (input, results) {
    return function createSetCallback (cbName) {
      return function setCallback (fn) {
        results.setCallback(cbName, fn);
        return input;
      }
    }
  }
  function createCleanQuery (input, api) {
    return function (bool) {
      if (bool !== true || bool !== false) return Error("Must pass in a boolean value");
      api.setCleanQuery(bool);
      return input;
    }
  }

  function createContext (input, urlOpts, containerId) {
    var container, results, api, bar;

    function setNewAttributes () {
      var createSetCallback = bindToCreateSetCallback(input, results);
      input.messages = bindToSetMessages(input, results);
      [
        names.before, names.after, names.success,
        names.failure, names.displayItem, names.noResults
      ]
      .forEach(function (name) {
        input[name] = createSetCallback(name);
      });
      input.cleanQuery = createCleanQuery(input, api);
    }

    container = document.getElementById(containerId);
    results = searchResults.new(container);
    api     = searchAPI.new(urlOpts, results);
    bar     = searchBar.new(input, api);
    setNewAttributes();
    bar.init();
    return input;
  }

  return function (urlOpts, containerId) {
    checks(this, urlOpts, containerId);
    return createContext(this, urlOpts, containerId);
  }
})();

module.exports = protoMethod;
