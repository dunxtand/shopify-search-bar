"use strict";

var searchAPI = (function ($, window, document, undefined) {
  function configureSearch (urlOpts, cb) {
    return function (query) {
      var url, request;
      url = createUrl(urlOpts, query);
      if (!!cb.before) { cb.before() }
      request = $.getJSON(url, cb.handleSuccess);
      attachCallbacks(request, cb);
    }
  }

  function attachCallbacks (request, cb) {
    if (!!cb.handleFailure) { request.fail(cb.handleFailure); }
    if (!!cb.then)          { request.then(cb.then);          }
    if (!!cb.done)          { request.done(cb.done);          }
    if (!!cb.always)        { request.always(cb.always);      }
  }

  function createUrl (urlOpts, query) {
    var searchSegment = "/search?",
        querySegment = "&q=" + query;
    return window.location.origin + searchSegment + createUrlSegment(urlOpts) + querySegment;
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

  function checkCallbacks (callbacks) {
    if (!callbacks) {
      throw new Error("You must provide a 'callbacks' object to the 'new' method");
    }
    if (!callbacks.handleSuccess) {
      throw new Error("You must define a 'handleSuccess' callback in the 'callbacks' object");
    }
    if (!callbacks.handleFailure) {
      window.console.warn("You have not provided a 'handleFailure' method to the 'callbacks' object");
    }
  }

  return {
    new: function (urlOptions, callbacks) {
      checkCallbacks(callbacks);
      return {
        search: configureSearch((urlOptions || {}), callbacks),
        url: createUrl(urlOptions, "<YOUR_QUERY>"),
        callbacks: callbacks
      }
    }
  }
})(jQuery, window, document);
