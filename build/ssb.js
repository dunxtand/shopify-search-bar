(function ($, window, document, undefined) {
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

  var searchAPI = (function () {
    function createUrl (urlOpts, query) {
      var searchSegment = "/search?",
          querySegment = "&q=" + query,
          allSegments = searchSegment + createUrlSegment(urlOpts) + querySegment;
      return window.location.origin + allSegments;
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
      var invoke = createInvoke(results);

      function search (query) {
        results.clear();
        invoke("before");
        var url = createUrl(urlOpts, query);
        var req = $.getJSON(url, results.displayResults);
        attachCallbacks(results, invoke)(req);
      }

      return {
        search: search
      }
    }

    return {
      new: initializeObject
    }
  })();

  var searchBar = (function () {
    function findParentForm (el) {
      var node = el.get(0);
      while (node) {
        if (node.nodeName === "FORM") break;
        node = node.parentNode;
      }
      return $(node);
    }

    function attachSubmitListener (input, api) {
      var form = findParentForm(input);

      form.submit(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var query = input.val();
        api.search(query);
      })
    }

    return {
      new: function (input, api) {
        return {
          init: function () {
            attachSubmitListener(input, api)
          }
        }
      }
    }
  })();

  var checks = (function () {
    function err (msg) {
      throw new Error(msg);
    }

    function checkInputType (el) {
      if (el.nodeName !== "INPUT") {
        err("search bar must be an input element");
      }
      if (!el.type || el.type !== "text") {
        err("search bar must be of type='text'");
      }
    }

    function checkForParentForm (el) {
      var node = el;
      while (node) {
        if (node.nodeName === "FORM") break;
        node = node.parentNode;
      }
      if (!node) {
        err("search bar must be nested within a form element");
      }
    }

    function checkUrlOpts (urlOpts) {
      if (!urlOpts) {
        err("Must provide a urlOpts arg");
      }
      if (typeof urlOpts !== "object") {
        err("urlOpts must be an object");
      }
      if (!urlOpts.view || typeof urlOpts.view !== "string") {
        err("urlOpts must have string 'view' property")
      }
    }

    function checkContainerId (containerId) {
      if (!containerId) {
        err("Must provide a containerId arg");
      }
      if (typeof containerId !== "string") {
        err("containerId must be a string");
      }
    }

    return function (el, urlOpts, containerId) {
      checkInputType(el);
      checkForParentForm(el);
      checkUrlOpts(urlOpts);
      checkContainerId(containerId);
    }
  })();

  var extension = (function () {
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
      }

      container = $(containerId);
      results = searchResults.new(container);
      api     = searchAPI.new(urlOpts, results);
      bar     = searchBar.new(input, api);
      setNewAttributes();
      bar.init();
      return input;
    }

    return {
      shopifySearchBar: function (urlOpts, containerId) {
        checks(this.get(0), urlOpts, containerId);
        return createContext(this, urlOpts, containerId);
      }
    }
  })();

  $.fn.extend(extension);
})(jQuery, window, document);
