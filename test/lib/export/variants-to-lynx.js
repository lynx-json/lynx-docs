"use strict";

const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const types = require("../../../src/types");
const variantsToLynx = require("../../../src/lib/export/variants-to-lynx");

describe("variants to lynx module", function () {
  describe("when exporting templates to lynx", function () {
    var tests = [{
        realms: [{
          root: "/src/",
          realm: "/src/folder-one/",
          variants: [{
            template: "/src/folder-one/default.lynx.yml",
            name: "default"
          }]
        }],
        options: {},
        files: [
          path.join("folder-one", "default.lnx")
        ],
        description: "when realm with one template variant",
        should: "should emit one lnx file with path relative to root"
      },
      {
        realms: [{
          root: "/src/",
          realm: "/src/folder-one/",
          variants: [{
              template: "/src/folder-one/default.lynx.yml",
              name: "default"
            },
            {
              template: "/src/folder-one/default.invalid.lynx.yml",
              name: "default-invalid"
            }
          ]
        }],
        options: {},
        files: [
          path.join("folder-one", "default.lnx"),
          path.join("folder-one", "default-invalid.lnx")
        ],
        description: "when realm with multiple template variants",
        should: "should emit lnx file for each template variant with path relative to root"
      },
      {
        realms: [{
          root: "/src/",
          realm: "/src/folder-one/",
          variants: [{
            content: "/src/folder-one/file.ext",
            name: "file.ext"
          }]
        }],
        options: {},
        files: [],
        description: "when realm with content variant",
        should: "should ignore content variant"
      }
    ];

    function getTests() {
      let filtered = tests.filter(test => test.include === true);
      return filtered.length > 0 ? filtered : tests;
    }

    function runTest(test) {
      var count = 0;

      function onFile(path, content) {
        if (test.files) path.should.equal(test.files[count]);
        if (test.expected) {
          let parsed = JSON.parse(content);
          expect(parsed).to.deep.equal(test.expected[count]);
        }

        count++;
      }

      variantsToLynx.all(test.realms, onFile, test.options);
    }

    getTests().forEach(test => {
      describe(test.description, function () {
        beforeEach(function () {
          var stub;
          test.realms.forEach(realm => {
            realm.variants.forEach(variant => {
              if (types.isString(variant.template)) {
                stub = stub || sinon.stub(fs, "readFileSync");
                stub.withArgs(variant.template)
                  .returns(test.template || "foo: Hello World!");
              }
            });
          });
        });

        afterEach(function () {
          if (fs.readFileSync.restore) fs.readFileSync.restore();
        });

        it(test.should, function () {
          runTest(test);
        });
      });
    });
  });
  describe("when escaping values during binding data", function () {
    let tests = [{
        description: "When expression contains characters that should be escaped",
        input: 'to "escape"',
        should: "should escape",
        expected: 'to \\\"escape\\\"'
      },
      {
        description: "When expression does not contain characters that should be escaped",
        input: `don't escape`,
        should: "should not escape",
        expected: "don't escape"
      }
    ];

    function runTest(test) {
      let result = variantsToLynx.handlebarsEscapeExpression(test.input);
      expect(test.expected).to.equal(result);
    }

    tests.forEach(test => {
      describe(test.description, function () {
        it(test.should, function () {
          runTest(test);
        });
      });
    });
  });
  describe("when testing for empty values during binding data", function () {
    let tests = [{
        input: [],
        expected: true
      },
      {
        input: null,
        expected: true
      },
      {
        input: undefined,
        expected: true
      },
      {
        input: false,
        expected: true
      },
      {
        input: {},
        expected: false
      },
      {
        input: { key: "Not empty" },
        expected: false
      },
      {
        input: ["Not empty"],
        expected: false
      },
      {
        input: 0,
        expected: false
      },
      {
        input: 10,
        expected: false
      },
      {
        input: -10,
        expected: false
      },
      {
        input: "",
        expected: false
      },
      {
        input: "Not empty",
        expected: false
      }
    ];

    function runTest(test) {
      let result = variantsToLynx.handlebarsIsEmpty(test.input);
      expect(test.expected).to.equal(result);
    }

    tests.forEach(test => {
      describe(`When value is '${JSON.stringify(test.input)}'`, function () {
        it(`Result should be '${test.expected}'`, function () {
          runTest(test);
        });
      });
    });
  });
});
