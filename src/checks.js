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

module.exports = checks;
