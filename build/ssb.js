(function (window, document, undefined) {
  var searchResults = (function () {
    var defaultMessages = {
      noResults: "No results were found",
      searchFailure: "sorry, something went wrong."
    };
    function createElement (type, text) {
      var el = document.createElement("type");
      !!text && (el.textContent = text);
      return el;
    }
    function itemElement (item) {
      var el = createElement("DIV");
      var linkStr = "<a href='" + item.url + "'>" + item.title + "</a>";
      el.innerHTML = linkStr;
      return el;
    }

    function initializeObject (container) {
      var noResultsEl = createElement("P", defaultMessages.noResults);
      var searchFailureEl = createElement("P", defaultMessages.searchFailure);

      var _this = window.Object.create({
        clear: function () {
          container.innerHTML = "";
        },
        displayResults: function (data) {
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
          container.appendChild(itemElement(item));
        },
        displaySearchFailure: function () {
          container.appendChild(noResultsEl);
        },
        displayNoResults: function () {
          container.appendChild(searchFailureEl);
        }
      });

      return _this;
    }

    return {
      new: initializeObject
    }
  })();

  var searchAPI = (function () {
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

    return {
      new: function (urlOptions, callbacks) {
        return {
          search: configureSearch((urlOptions || {}), callbacks),
          url: createUrl(urlOptions, "<YOUR_QUERY>"),
          callbacks: callbacks
        }
      }
    }
  })();

  var searchBar = (function () {
    function attachSubmitListener (selectors, api) {
      var form  = $(selectors.form),
          input = $(selectors.input);
      form.submit(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var query = input.val();
        api.search(query);
      })
    }

    return {
      new: function (selectors, api) {
        return {
          init: function () {
            attachSubmitListener(selectors, api)
          },
          form: $(selectors.form),
          input: $(selectors.input)
        }
      }
    }
  })();

  var checks = (function () {
    function err (msg) {
      throw new Error(msg);
    }

    function checkInputType (el) {
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
      results = searchResults.new(container);
      api = searchAPI.new(urlOpts, results);
      bar = searchBar.new(this, api);
      return this;
    }
  })();

  window.HTMLInputElement.prototype.shopifySearchBar = protoMethod;
})(window, document);
