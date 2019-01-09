var variantDetailKeys = ['jsmodule', 'function', 'content', 'type'];

var realmDetailKeys = ['realm', 'folder'];

function getObjectDetails(object, objectDetailKeys) {
  return objectDetailKeys.map(function (detail) {
    if (typeof object[detail] === 'string') return detail + ': ' + object[detail];
  }).filter(function (detail) {
    return detail !== undefined;
  });
}

function createRealmResult(realm, icon) {
  let title = realm.title || 'Untitled';
  icon = icon || '/meta/icons/meta.svg';
  return {
    icon: icon,
    title,
    urls: [{ label: title, href: realm.metaURL }],
    details: getObjectDetails(realm, realmDetailKeys)
  };
}

function createVariantResult(variant) {
  let result = {
    icon: "/meta/icons/app.svg",
    title: variant.title || "Untitled",
    urls: [{ label: variant.title || 'Untitled', href: variant.url }],
    details: getObjectDetails(variant, variantDetailKeys)
  }
  if (variant.template) result.urls.push({ label: `template: ${variant.template}`, href: `${variant.url}&ld-content=template` });
  if (variant.data) result.urls.push({ label: `data: ${variant.data}`, href: `${variant.url}&ld-content=data` });

  return result;
}

module.exports = {
  createRealmResult,
  createVariantResult
};
