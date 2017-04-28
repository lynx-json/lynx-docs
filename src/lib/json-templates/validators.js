const templateKey = require("./template-key");

function validateCompatibleSections(metas) {
  let sections = metas.filter(meta => meta.binding && templateKey.sectionTokens.includes(meta.binding.token));
  if (sections.length === 0) return { valid: true };

  let positives = sections
    .filter(meta => meta.binding && meta.binding.token === templateKey.positiveSectionToken)
    .map(meta => meta.binding.variable);
  let negatives = sections
    .filter(meta => meta.binding && meta.binding.token === templateKey.negativeSectionToken)
    .map(meta => meta.binding.variable);

  let pass = positives.length === negatives.length && positives.every(name => negatives.includes(name));
  if (!pass) {
    let message = "Incompatible template sections. Every section should have a matching inverse section.\n";
    message += "Positive sections: '" + positives.join("','") + "'\n";
    message += "Negative sections: '" + negatives.join("','") + "'\n";
    return { valid: false, message: message };
  }
  return { valid: true };
}

exports.validateCompatibleSections = validateCompatibleSections;
