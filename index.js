var protoMethod = require("./src/protoMethod");
try {
  var constructor = window.HTMLInputElement || window.document.createElement("INPUT").constructor;
  constructor.prototype.shopifySearchBar = protoMethod;
} catch (error) {
  console.error(
    "shopify-search-bar will not work in here!",
    "Cannot access HTMLInputElement prototype:",
    error
  );
}
