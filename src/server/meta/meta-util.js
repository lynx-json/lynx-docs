var variantDetailKeys = ["template", "data", "jsmodule", "function", "content", "type" ];

var realmDetailKeys = ["realm"];

function getObjectDetails(variant, objectDetailKeys) {
  return objectDetailKeys.map(function (detail) {
    if (typeof variant[detail] === "string") return detail + ": " + variant[detail];
  }).filter(function (detail) {
    return detail !== undefined;
  });
}


exports.variantDetailKeys = variantDetailKeys;
exports.realmDetailKeys = realmDetailKeys;
exports.getObjectDetails = getObjectDetails;
