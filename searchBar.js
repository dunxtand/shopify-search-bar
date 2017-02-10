"use strict";

var searchBar = (function ($, window, document, undefined) {
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

  function checkArgs (selectors, api) {
    if (!selectors || !api) {
      throw new Error("You must provide 'selectors' and 'api' objects to the 'init' method");
    }
    if (!selectors.form || !selectors.input) {
      throw new Error("You must provide 'form' and 'input' properties to the 'selectors' object");
    }
  }

  return {
    new: function (selectors, api) {
      checkArgs(selectors, api)
      return {
        init: function () {
          attachSubmitListener(selectors, api)
        },
        form: $(selectors.form),
        input: $(selectors.input)
      }
    }
  }
})(jQuery, window, document);
