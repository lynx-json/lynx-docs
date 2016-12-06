var getMetadata = require("../metadata-yaml");

function flattenSpecForKvp(kvp, parentSpec) {
  var meta = getMetadata(kvp);
  if (!meta.children || !meta.children.spec || !meta.children.value) return;
  if (meta.children.spec.length !== 1 || meta.children.value.length !== 1) return;
  if (meta.children.spec[0].template) return;
  
  var specMeta = meta.children.spec[0].more();
  var valueMeta = meta.children.value[0].more();
  
  function processChildMeta(childMeta) {    
    childMeta = childMeta.more();
    var childKvp = flattenSpecForKvp(childMeta.src, specMeta.src.value);
    if (!childKvp) return;
    
    // assign the child kvp back onto the parent
    valueMeta.src.value[childKvp.key] = childKvp.value;
    
    // if the child's key has changed, then delete the original child kvp
    if (childKvp.key !== childMeta.src.key) {
      delete valueMeta.src.value[childMeta.src.key];
    }
  }
  
  for (var child in valueMeta.children) {
    valueMeta.children[child].forEach(processChildMeta);
  }
  
  if (!parentSpec) return kvp;
  
  var childSpecInParent = parentSpec.children.find(cs => cs.name === meta.key);  
  var childSpec = specMeta.src.value;
  Object.assign(childSpecInParent, childSpec);
  
  if (valueMeta.template) {
    var result = { key: null, value: valueMeta.src.value };
    var template = valueMeta.template;
    
    if (meta.key === template.variable) {
      result.key = meta.key + template.symbol;
    } else {
      result.key = meta.key + template.symbol + template.variable;
    }
    
    return result;
  } else {
    return {
      key: kvp.key,
      value: valueMeta.src.value
    };
  }
}

module.exports = exports = flattenSpecForKvp;
