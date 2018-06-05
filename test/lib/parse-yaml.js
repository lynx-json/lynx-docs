const chai = require("chai");
const expect = chai.expect;

parseYAML = require("../../src/lib/parse-yaml");

describe("parse yaml module", function () {
  describe("when mutating a value on the anchor", function () {
    it("should only modify that object reference", function () {
      let template = `
        foo: &baz
          spec:
            hints:
              - text
          value: first
        bar: *baz
      `;
      let parsed = parseYAML(template);
      parsed.foo.value = "second";
      expect(parsed.bar.value).to.not.equal("second");
    });
    it("should allow empty content", function () {
      let template = ``;
      let parsed = parseYAML(template);
      expect(parsed).to.deep.equal({});
    });
  });
});
