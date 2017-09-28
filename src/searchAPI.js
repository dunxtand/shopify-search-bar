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

  function initializeObject (urlOpts, results) {
    var shouldCleanQuery = false;
    function setCleanQuery (bool) {
      return shouldCleanQuery = bool;
    }

    var invoke = createInvoke(results);

    function getJSON (url) {
      var xhr = new window.XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var data = window.JSON.parse(xhr.responseText);
            invoke("success", xhr);
            results.displayResults(data);
            invoke("after");
          } else {
            results.failure(xhr);
            invoke("after");
          }
        }
      }
      xhr.onerror = function (e) {
        results.failure(xhr);
        invoke("after");
      }
      xhr.send();
    }

    function search (query) {
      var url = createUrl(urlOpts, query, shouldCleanQuery);
      results.clear();
      invoke("before");
      getJSON(url);
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
