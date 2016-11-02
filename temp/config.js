const util = require("util");
const url = require("url");

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
    if (!util.isObject(kvp.value)) return;
    if (!options || !options.realm) return;

    if (kvp.value.realm) {
      kvp.value.realm = url.resolve(options.realm, kvp.value.realm);
    } else {  
      kvp.value.realm = options.realm;
    }
  });
  
  finishYaml.add(function addSpecChildren(kvp) {
    function isNode(meta) {
      return meta.children && meta.children.spec && meta.children.value;
    }
    
    var meta = lynxDocs.lib.meta(kvp);
    if (!isNode(meta)) return;
    meta = lynxDocs.lib.meta({ key: "value", value: kvp.value.value });
    
    for (var child in meta.children) {
      kvp.value.spec.children = kvp.value.spec.children || [];
      kvp.value.spec.children.push({ name: child });
    }
  });
};
