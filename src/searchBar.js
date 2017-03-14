"use strict";

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

module.exports = searchBar;
