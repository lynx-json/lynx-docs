const chai = require("chai");
const expect = chai.expect;

const lynxExport = require("../../../../src/lib/export/lynx");

describe("lynx export module", function () {
  describe("when determining if a value is a lynx value", function () {
    let tests = [{
        description: "when value is a string",
        should: "not be a lynx value",
        value: "test",
        expected: false
      },
      {
        description: "when value is an array",
        should: "not not be a lynx value",
        value: [],
        expected: false
      },
      {
        description: "when value is an empty object",
        should: "not not be a lynx value",
        value: {},
        expected: false
      },
      {
        description: "when value is an object without a 'spec' key",
        should: "not not be a lynx value",
        value: { value: "Hello" },
        expected: false
      },
      {
        description: "when value is an object with a 'spec' key and no 'value' key",
        should: "be a lynx value",
        value: { spec: {} },
        expected: true
      },
      {
        description: "when value is an object with a 'spec' key and a 'value' key",
        should: "be a lynx value",
        value: { spec: {}, value: "Hello" },
        expected: true
      }
    ];
    tests.forEach(test => {
      describe(test.description, function () {
        it("should " + test.should, function () {
          expect(lynxExport.isLynxValue(test.value)).to.equal(test.expected);
        });
      });
    });
  });
  describe("when getting value portion of lynx value", function () {
    let tests = [{
        description: "when object has 'value' key",
        should: "return value of 'value' key",
        value: { value: "Hello" },
        expected: "Hello"
      },
      {
        description: "when object does not have 'value' key",
        should: "return object",
        value: { one: "Hello", two: "There" },
        expected: { one: "Hello", two: "There" }
      }
    ];
    tests.forEach(test => {
      describe(test.description, function () {
        it("should " + test.should, function () {
          expect(lynxExport.getValuePortionOfLynxValue(test.value)).to.deep.equal(test.expected);
        });
      });
    });
  });
  describe("when determining if something results in lynx node", function () {
    let tests = [{
        description: "when value is a string",
        should: "be false",
        value: "test",
        expected: false
      },
      {
        description: "when value is an array",
        should: "be false",
        value: [],
        expected: false
      },
      {
        description: "when value is an empty object",
        should: "be false",
        value: {},
        expected: false
      },
      {
        description: "when value is a template for lynx value",
        should: "be true",
        value: { "": { spec: {}, value: {} } },
        expected: true
      },
      {
        description: "when value contains two sections that are templates for lynx values",
        should: "be true",
        value: { "#true": { spec: {}, value: {} }, "#false": { spec: {}, value: {} } },
        expected: true
      },
      {
        description: "when value contains one section that is template for lynx value and another section that is null",
        should: "be true",
        value: { "#true": { spec: {}, value: {} }, "#false": null },
        expected: true
      },
      {
        description: "when value contains one section that is template for lynx value and another section that is not null and not a lynx value",
        should: "be false",
        value: { "#true": { spec: {}, value: {} }, "#false": "foo" },
        expected: false
      },
      {
        description: "when value contains two sections that are templates for lynx values and another key",
        should: "be false",
        value: { "#true": { spec: {}, value: {} }, "#false": { spec: {}, value: {} }, "other": "foo" },
        expected: false
      }
    ];
    tests.forEach(test => {
      describe(test.description, function () {
        it("should " + test.should, function () {
          expect(lynxExport.resultsInLynxNode(test.value)).to.equal(test.expected);
        });
      });
    });
  });
  describe("when accumulating lynx children of a value", function () {
    let tests = [{
        description: "when value is a string",
        should: "be empty",
        value: "test",
        expected: []
      },
      {
        description: "when value is an array",
        should: "be empty",
        value: [],
        expected: []
      },
      {
        description: "when value is an empty object",
        should: "be empty",
        value: {},
        expected: []
      },
      {
        description: "when value is an lynx value with spec and null value",
        should: "be empty",
        value: { spec: {}, value: null },
        expected: []
      },
      {
        description: "when value is an lynx value with spec and array value",
        should: "be empty",
        value: { spec: {}, value: [] },
        expected: []
      },
      {
        description: "when value is an lynx value with spec and string value",
        should: "be empty",
        value: { spec: {}, value: "Hello" },
        expected: []
      },
      {
        description: "when value is an object with no lynx values",
        should: "be empty",
        value: { one: "one", two: "two" },
        expected: []
      },
      {
        description: "when value contains incompatible sections for lynx value",
        should: "throw error",
        value: {
          "#foo": {
            one: {
              spec: {}
            }
          },
          "^foo": {
            two: {
              spec: {}
            }
          }
        },
        throws: Error
      }
    ];

    tests.forEach(test => {
      describe(test.description, function () {
        it("should " + test.should, function () {
          if (test.throws) {
            return expect(function () { lynxExport.accumulateLynxChildren(test.value); }).to.throw(test.throws);
          } else {
            let children = lynxExport.accumulateLynxChildren(test.value);
            if (test.log) console.log(JSON.stringify(children, null, 2));
            expect(children.map(child => child.meta.name)).to.deep.equal(test.expected);
            children.forEach(child => expect(child).itself.to.respond.respondTo("update"));
          }
        });
      });
    });
  });
});
