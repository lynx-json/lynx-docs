module.exports = exports = function(lynxDocs) {
  var finishYaml = lynxDocs.lib.finish;

  for (var p in finishYaml) {
    if (!finishYaml.hasOwnProperty(p) || p === "add" || p === "clear" || typeof finishYaml[p] !== "function") continue;
    finishYaml.add(finishYaml[p]);
  }
}