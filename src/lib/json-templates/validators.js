const templateKey = require("./template-key");

function validateCompatibleSections(metas) {
  let sections = metas.filter(meta => meta.binding && templateKey.sectionTokens.includes(meta.binding.token));
  if (sections.length === 0) return { valid: true };

  let positives = sections
    .filter(meta => meta.binding.token === templateKey.positiveSectionToken)
    .map(meta => meta.binding.variable);
  let negatives = sections
    .filter(meta => meta.binding.token === templateKey.negativeSectionToken)
    .map(meta => meta.binding.variable);

  let pass = positives.length === negatives.length && positives.every(name => negatives.includes(name));
  if (!pass) {
    let message = "Detected section(s) without matching inverse.\n";
    message += "Positive section(s): '" + (positives.length === 0 ? "[none]" : positives.join("','")) + "'\n";
    message += "Negative section(s): '" + (negatives.length === 0 ? "[none]" : negatives.join("','")) + "'\n";
    return { valid: false, message: message };
  }
  return { valid: true };
}

exports.validateCompatibleSections = validateCompatibleSections;
