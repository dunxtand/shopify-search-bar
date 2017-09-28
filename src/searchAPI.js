"use strict";

var stopWords = require("./stopWords");

var searchAPI = (function () {
  function createUrl (urlOpts, query, shouldCleanQuery) {
    query = !!shouldCleanQuery ? cleanQuery(query) : query;
    var searchSegment = "/search?",
        querySegment = "&q=" + query,
        allSegments = searchSegment + createUrlSegment(urlOpts) + querySegment;
    return window.location.origin + allSegments;
  }
  function cleanQuery (originalQuery) {
    return originalQuery.toLowerCase()
    .split(" ")
    .filter(function (term) {
      return stopWords.indexOf(term) === -1;
    })
    .join(" ");
  }

  function createUrlSegment (urlOpts) {
    var params = [];
    if (!!urlOpts.type) {
      params.push("type=" + urlOpts.type);
    }
    if (!!urlOpts.view) {
      params.push("view=" + urlOpts.view);
    }
    return params.join("&");
  }

  function createInvoke (results) {
    return function (fnName) {
      !!results[fnName] && results[fnName](arguments[1]);
    }
  }

  function attachCallbacks (results, invoke) {
    return function (req) {
      req.fail(function (res) { invoke("failure", res); });
      req.then(function (res) { invoke("success", res); });
      req.done(function ()    { invoke("after");        });
    }
  }

  function initializeObject (urlOpts, results) {
    var shouldCleanQuery = false;
    function setCleanQuery (bool) {
      return shouldCleanQuery = bool;
    }

    var invoke = createInvoke(results);

    function search (query) {
      results.clear();
      invoke("before");
      var url = createUrl(urlOpts, query, shouldCleanQuery);
      var req = $.getJSON(url, results.displayResults);
      attachCallbacks(results, invoke)(req);
    }

    return {
      search: search,
      setCleanQuery: setCleanQuery
    }
  }

  return {
    new: initializeObject
  }
})();

module.exports = searchAPI;
