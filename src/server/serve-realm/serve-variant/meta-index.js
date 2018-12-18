const serveTemplateDataVariant = require('./lynx-content');

function serveVariantIndex(options) {
  let templateVariantHandler = serveTemplateDataVariant(options);

  return function (realms) {
    return function (req, res, next) {
      function reduceToResults(accumulator, currentRealm) {
        accumulator.push({
          icon: '/meta/icons/meta-here.svg',
          title: currentRealm.title || 'Untitled',
          urls: {
            self: currentRealm.metaURL
          },
          details: [`realm: ${currentRealm.realm}`]
        });

        if (currentRealm.variants.length > 0) {
          accumulator.push({
            isHeader: true,
            label: 'Variants'
          });
        }

        currentRealm.variants.forEach(function (currentVariant) {
          accumulator.push({
            icon: '/meta/icons/app.svg',
            title: currentVariant.title || 'Untitled',
            urls: {
              self: currentVariant.url,
              template: currentVariant.url + "&ld-content=template",
              data: currentVariant.url + "&ld-content=data",
            },
          });
        });

        return accumulator;
      }

      let variant = {
        template: { '>.meta.variants': null },
        data: {
          realm: realms[0].realm,
          pageHeading: 'Choose a Variant',
          resultsHeading: '',
          results: realms.reduce(reduceToResults, [])
        }
      };

      templateVariantHandler(variant, realms[0])(req, res, next);
    };
  };
}

module.exports = exports = serveVariantIndex;
