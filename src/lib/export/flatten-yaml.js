var getMetadata = require("../metadata-yaml");

function isNode(meta) {
  return meta.children && meta.children.spec && meta.children.value;
}

function flattenSpecForKvp(kvp, parentSpec) {
  var meta = getMetadata(kvp);
  
  if (!isNode(meta)) return; // only process nodes
  if (meta.template) return; // we cannot flatten dynamic nodes
  if (meta.children.value.length !== 1) return; // I think this is wrong. 1 spec, * values should be okay/flattened
  if (meta.children.spec[0].template) return; // we cannot flatten dynamic specs
  
  var specMeta = meta.children.spec[0].more();
  var valueMeta = meta.children.value[0].more();
  
  function processObjectChildMeta(childMeta) {    
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
    valueMeta.children[child].forEach(processObjectChildMeta);
  }
  
  if (!parentSpec) return kvp;
  
  if (!parentSpec.children || !Array.isArray(parentSpec.children)) 
    throw new Error("Parent spec for key '" + meta.key + "' does not have a 'children' array.");
    
  var childSpecInParent = parentSpec.children.find(cs => cs.name === meta.key);  
  var childSpec = specMeta.src.value;
  if (!childSpecInParent) throw new Error("Cannot find a spec in the parent's 'children' array with name of: " + meta.key);
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
