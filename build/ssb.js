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

  var stopWords = ["a","about","above","across","after","again","against","all","almost","alone","along","already","also","although","always","among","an","and","another","any","anybody","anyone","anything","anywhere","are","area","areas","around","as","ask","asked","asking","asks","at","away","b","back","backed","backing","backs","be","became","because","become","becomes","been","before","began","behind","being","beings","best","better","between","big","both","but","by","c","came","can","cannot","case","cases","certain","certainly","clear","clearly","come","could","d","did","differ","different","differently","do","does","done","down","downed","downing","downs","during","e","each","early","either","end","ended","ending","ends","enough","even","evenly","ever","every","everybody","everyone","everything","everywhere","f","face","faces","fact","facts","far","felt","few","find","finds","first","for","four","from","full","fully","further","furthered","furthering","furthers","g","gave","general","generally","get","gets","give","given","gives","go","going","good","goods","got","great","greater","greatest","group","grouped","grouping","groups","h","had","has","have","having","he","her","here","herself","high","high","high","higher","highest","him","himself","his","how","however","i","if","important","in","interest","interested","interesting","interests","into","is","it","its","itself","j","just","k","keep","keeps","kind","knew","know","known","knows","l","large","largely","last","later","latest","least","less","let","lets","like","likely","longer","longest","m","make","making","man","may","me","member","members","men","might","more","most","mostly","mr","mrs","much","must","my","myself","n","necessary","need","needed","needing","needs","never","new","new","newer","newest","next","no","nobody","non","noone","not","nothing","now","nowhere","number","numbers","o","of","off","often","old","older","oldest","on","once","one","only","open","opened","opening","opens","or","other","others","our","out","over","p","part","parted","parting","parts","per","perhaps","place","places","point","pointed","pointing","points","possible","present","presented","presenting","presents","problem","problems","put","puts","q","quite","r","rather","really","right","right","room","rooms","s","said","same","saw","say","says","second","seconds","see","seem","seemed","seeming","seems","sees","several","shall","she","should","show","showed","showing","shows","side","sides","since","small","smaller","smallest","so","some","somebody","someone","something","somewhere","state","states","still","still","such","sure","t","take","taken","than","that","the","their","them","then","there","therefore","these","they","thing","things","think","thinks","this","those","though","thought","thoughts","three","through","thus","to","today","together","too","took","toward","turn","turned","turning","turns","two","u","under","until","up","upon","us","use","used","uses","v","very","w","want","wanted","wanting","wants","was","way","ways","we","well","wells","went","were","what","when","whether","which","while","who","whole","whose","why","will","with","within","without","work","worked","working","works","would","x","y","year","years","yet","you","young","younger","youngest","your","yours","z"];
  var searchAPI = (function () {
    function createUrl (urlOpts, query, shouldCleanQuery) {
      query = !!shouldCleanQuery ? cleanQuery(query) : query;
      var searchSegment = "/search?",
          querySegment = "&q=" + query,
          allSegments = searchSegment + createUrlSegment(urlOpts) + querySegment;
      return window.location.origin + allSegments;
    }
    function cleanQuery (originalQuery) {
      return originalQuery
      .split("+")
      .filter(function (term) {
        return stopWords.indexOf(term) === -1;
      });
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
        var url = createUrl(urlOpts, query);
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
