(function (window, document, undefined) {
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
        !!results[fnName] && results[fnName]();
      }
    }

    function initializeObject (urlOpts, results) {
      var invoke = createInvoke(results);

      function getJSON (url) {
        var xhr = new window.XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function (e) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var data = window.JSON.parse(xhr.responseText);
              invoke("success");
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
        var url = createUrl(urlOpts, query);
        results.clear();
        invoke("before");
        getJSON(url);
      }

      return {
        search: search,
      }
    }

    return {
      new: initializeObject
    }
  })();

  var searchBar = (function () {
    function findParentForm (el) {
      var node = el;
      while (node) {
        if (node.nodeName === "FORM") break;
        node = node.parentNode;
      }
      return node;
    }

    function attachSubmitListener (input, api) {
      var form = findParentForm(input);
      form.onsubmit = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var query = input.value;
        api.search(query);
      }
    }

    return {
      new: function (input, api) {
        return {
          init: function () {
            attachSubmitListener(input, api);
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

  try {
    var constructor = window.HTMLInputElement || window.document.createElement("INPUT").constructor;
    constructor.prototype.shopifySearchBar = protoMethod;
  } catch (error) {
    window.console.error(
      "shopify-search-bar will not work in this browser!",
      "Cannot access HTMLInputElement prototype:",
      error
    );
  }
})(window, document);
