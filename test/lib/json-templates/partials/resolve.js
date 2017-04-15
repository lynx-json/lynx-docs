const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");
const url = require("url");
const sinon = require("sinon");

const resolve = require("../../../../src/lib/json-templates/partials/resolve");

function getStubSourceReference(stubName) {
  switch (stubName) {
  case "fs":
    return fs;
  case "resolve":
    return resolve;
  }
}

function setupStubs(stubs) {
  if (!stubs) return;
  Object.keys(stubs).forEach(stub => {
    Object.keys(stubs[stub]).forEach(key => {
      sinon.stub(getStubSourceReference(stub), key).returns(stubs[stub][key]);
    });
  });
}

function restoreStubs(stubs) {
  if (!stubs) return;
  Object.keys(stubs).forEach(stub => {
    Object.keys(stubs[stub]).forEach(key => {
      getStubSourceReference(stub)[key].restore();
    });
  });
}

function getTests(tests) {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

describe("resolve partials module", function () {
  describe("when calculating directories to scan for partials", function () {
    let tests = [{
        partialUrl: "./f1/f2/template.lynx.yml?partial=part",
        expected: [
          path.resolve(process.cwd(), "f1", "f2", resolve.partialDirectory),
          path.resolve(process.cwd(), "f1", resolve.partialDirectory),
          path.resolve(process.cwd(), resolve.partialDirectory),
          resolve.lynxDocsPartialDirectory
        ]
      },
      {
        partialUrl: "./f1/template.lynx.yml?partial=part",
        expected: [
          path.resolve(process.cwd(), "f1", resolve.partialDirectory),
          path.resolve(process.cwd(), resolve.partialDirectory),
          resolve.lynxDocsPartialDirectory
        ]
      },
      {
        partialUrl: "./template.lynx.yml?partial=part",
        expected: [
          path.resolve(process.cwd(), resolve.partialDirectory),
          resolve.lynxDocsPartialDirectory
        ]
      }
    ];

    function runTest(test) {
      let parsed = url.parse(test.partialUrl);
      let result = resolve.calculateSearchDirectories(parsed.path);
      expect(result).to.deep.equal(test.expected);
    }

    getTests(tests).forEach(test => {
      describe("when calculating directories for partial '" + test.partialUrl + "'", function () {
        it("should result in expected directories", function () {
          runTest(test);
        });
      });
    });
  });
  describe("when scanning directories for partials", function () {
    let tests = [{
        description: "When directory does not exist",
        should: "Return null",
        directory: "doesNotMatter",
        partialName: "doesNotMatter",
        stubs: { fs: { existsSync: false } },
        expected: null
      },
      {
        description: "When path is not a directory",
        should: "Return null",
        directory: "doesNotMatter",
        partialName: "doesNotMatter",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => false }
          }
        },
        expected: null
      },
      {
        description: "When directory contains no files",
        should: "Return null",
        directory: "doesNotMatter",
        partialName: "doesNotMatter",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: []
          }
        },
        expected: null
      },
      {
        description: "When directory contains no matching files",
        should: "Return null",
        directory: "doesNotMatter",
        partialName: "doesNotMatter",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["foo.one", "foo.two", "whatever.whatever"]
          }
        },
        expected: null
      },
      {
        description: "When directory contains one matching .yaml file",
        should: "Returns file",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial.yml"]
          }
        },
        expected: "partial.yml"
      },
      {
        description: "When directory contains one matching .js file",
        should: "Returns file",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial.js"]
          }
        },
        expected: "partial.js"
      },
      {
        description: "When directory contains matching .js and .yml file",
        should: "Returns first matching file",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial.yml", "partial.js"]
          }
        },
        expected: "partial.yml"
      },
      {
        description: "When directory contains matching .js and .yml file",
        should: "Returns first matching file",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial.js", "partial.yml"]
          }
        },
        expected: "partial.js"
      }
    ];

    function runTest(test) {
      expect(resolve.scanDirectoryForPartial(test.directory, test.partialName)).to.equal(test.expected);
    }

    getTests(tests).forEach(test => {
      describe(test.description, function () {
        beforeEach(function () {
          setupStubs(test.stubs);
        });
        afterEach(function () {
          restoreStubs(test.stubs);
        });
        it(test.should, function () {
          runTest(test);
        });
      });
    });
  });
  describe("when resolving partials", function () {
    var dummyFn = (value) => value;
    var tests = [{
        description: "when javascript partial",
        should: "convert javascript file to function",
        partialUrl: "./partial.js?partial=something",
        expected: dummyFn,
        stubs: {
          resolve: {
            scanDirectoryForPartial: "partial.js",
            convertJsPartialToFunction: dummyFn
          }
        }
      },
      {
        description: "when yaml partial",
        should: "convert yaml file to function",
        partialUrl: "./partial.yml?partial=something",
        expected: dummyFn,
        stubs: {
          resolve: {
            scanDirectoryForPartial: "partial.yml",
            convertYamlPartialToFunction: dummyFn
          }
        }
      },
      {
        description: "when no partial",
        should: "throw Error",
        partialUrl: "./partial.yml?partial=something",
        throws: Error,
        stubs: {
          resolve: {
            scanDirectoryForPartial: null
          }
        }
      },
      {
        description: "when no partial name specified",
        should: "throw Error",
        partialUrl: "partial.yml",
        throws: Error
      },
      {
        description: "when no partial url",
        should: "throw Error",
        partialUrl: null,
        throws: Error
      }
    ];

    function runTest(test) {
      var partial = resolve.resolvePartial(test.partialUrl);
      expect(partial).to.equal(test.expected);
    }

    getTests(tests).forEach(test => {
      describe(test.description, function () {
        beforeEach(function () {
          setupStubs(test.stubs);
        });
        afterEach(function () {
          restoreStubs(test.stubs);
        });

        it(test.should, function () {
          if (test.throws) {
            expect(() => runTest(test)).to.throw(test.throws);
          } else runTest(test);
        });
      });
    });
  });
});
