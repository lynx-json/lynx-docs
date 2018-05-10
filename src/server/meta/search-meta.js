const path = require("path");
const finder = require("./finder");
const variantToLynx = require("../../lib/export/variants-to-lynx").one;

module.exports = exports = function createSearchHandler(options) {
  return function searchRealms(req, res, next) {

    function renderVariant(res, variant) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-Control", "no-cache");

      var variantOptions = Object.assign({}, options, {
        realm: {
          realm: "http://lynx-json.org/docs/meta/search/",
          folder: path.resolve(options.root[0])
        },
        spec: undefined
      });

      res.write(variantToLynx(variant, variantOptions));
      res.end();
    }

    function renderResults(results) {
      var variant = {
        template: { ">.meta.search": null },
        data: {
          q: req.query.q,
          pageHeading: "Search This Domain",
          description: "By default, realms will be searched. Add 'kind:variant' to search variants.",
          resultsHeading: `Search Results (${results.length})`,
          results: results
        }
      };

      renderVariant(res, variant);
    }

    if (req.url.indexOf("/meta/search") !== 0) return next();

    var q = req.query ? req.query.q : "";
    var results = finder.find(q, req.realms);

    renderResults(results);
  };
};
