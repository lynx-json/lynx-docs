const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const templateData = require("../../../src/lib/export/template-data");
const jsonTemplates = require("../../../src/lib/json-templates");

let tests = [{
    description: "processing a *.yml file",
    should: "parse yml content",
    dataFile: "data.yml",
    content: "name: foo",
    expected: {
      name: "foo"
    }
  },
  {
    description: "processing a *.json file",
    should: "parse JSON content",
    dataFile: "data.json",
    content: '{"name":"foo"}',
    expected: {
      name: "foo"
    }
  },
  {
    description: "data contains partial reference",
    should: "expand and resolve partial reference",
    dataFile: "data.json",
    content: '{">partial": null}',
    resolve: function () {
      return { name: "foo" };
    },
    expected: {
      name: "foo"
    }
  },
  {
    description: "data contains partial reference to patch keys",
    should: "patch partial keys into object",
    dataFile: "data.json",
    content: '{">partial": null, "address": "bar"}',
    resolve: function () {
      return { name: "foo" };
    },
    expected: {
      name: "foo",
      address: "bar"
    }
  },
  {
    description: "data contains partial reference in list",
    should: "place partial value in list",
    dataFile: "data.json",
    content: '{"list": [ { ">partial": null}, { "name": "bar" } ]}',
    resolve: function () {
      return { name: "foo" };
    },
    expected: {
      list: [{ name: "foo" }, { name: "bar" }]
    }
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  let result = templateData(test.dataFile);
  expect(result).to.deep.equal(test.expected);
}

describe("template-data module", function () {
  describe("when resolving data files", function () {
    getTests().forEach(function (test) {
      describe("when ".concat(test.description), function () {
        beforeEach(function () {
          sinon.stub(fs, "readFileSync").returns(Buffer.from(test.content));
          if (test.resolve) sinon.stub(jsonTemplates.partials, "resolve").returns(test.resolve);
        });

        afterEach(function () {
          fs.readFileSync.restore();
          if (jsonTemplates.partials.resolve.restore) jsonTemplates.partials.resolve.restore();
        });

        it(test.should, function () {
          runTest(test);
        });
      });
    });
  });
});
