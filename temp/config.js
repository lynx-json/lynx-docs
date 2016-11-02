var util = require("util");

module.exports = exports = function(lynxDocs) {
  var finishYaml = lynxDocs.lib.finish;

  finishYaml.add(finishYaml.titles);
  finishYaml.add(finishYaml.labels);
  finishYaml.add(finishYaml.links);
  finishYaml.add(finishYaml.submits);
  finishYaml.add(finishYaml.images);
  finishYaml.add(finishYaml.content);
  finishYaml.add(finishYaml.forms);
  finishYaml.add(finishYaml.sections);
  finishYaml.add(finishYaml.markers);
  finishYaml.add(finishYaml.containers);
  finishYaml.add(finishYaml.text);
  finishYaml.add(finishYaml.dataProperties);
  finishYaml.add(function addRealm(kvp, options) {
    // only do this for the root document kvp
    if (kvp.key) return;
    if (!util.isObject(kvp.value) || !util.isObject(kvp.value.value)) return;
    if (!options.realm) return;
    
    var node = kvp.value;
    
    if (node.value.realm) {
      node.value.realm = url.resolve(options.realm, node.value.realm);
    } else {
      node.value.realm = options.realm;
    }
  });
};
