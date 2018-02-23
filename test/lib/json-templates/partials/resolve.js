const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");
const url = require("url");
const sinon = require("sinon");

const resolvePartials = require("../../../../src/lib/json-templates/partials/resolve");

function getStubSourceReference(stubName) {
  switch (stubName) {
  case "fs":
    return fs;
  case "resolvePartials":
    return resolvePartials;
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
          path.resolve(process.cwd(), "f1", "f2"),
          path.resolve(process.cwd(), "f1", "f2", resolvePartials.partialDirectory),
          path.resolve(process.cwd(), "f1"),
          path.resolve(process.cwd(), "f1", resolvePartials.partialDirectory),
          path.resolve(process.cwd()),
          path.resolve(process.cwd(), resolvePartials.partialDirectory),
          resolvePartials.lynxDocsPartialDirectory
        ]
      },
      {
        partialUrl: "./f1/template.lynx.yml?partial=part",
        expected: [
          path.resolve(process.cwd(), "f1"),
          path.resolve(process.cwd(), "f1", resolvePartials.partialDirectory),
          path.resolve(process.cwd()),
          path.resolve(process.cwd(), resolvePartials.partialDirectory),
          resolvePartials.lynxDocsPartialDirectory
        ]
      },
      {
        partialUrl: "./template.lynx.yml?partial=part",
        expected: [
          path.resolve(process.cwd()),
          path.resolve(process.cwd(), resolvePartials.partialDirectory),
          resolvePartials.lynxDocsPartialDirectory
        ]
      }
    ];

    function runTest(test) {
      let parsed = url.parse(test.partialUrl);
      let result = resolvePartials.calculateSearchDirectories(parsed.path);
      expect(result).to.deep.equal(test.expected);
    }

    getTests(tests).forEach(test => {
      describe("when calculating directories for partial '" + test.partialUrl + "'", function () {
        it("should result in directories \n'" + test.expected.join("'\n'") + "'", function () {
          runTest(test);
        });
      });
    });
  });
  describe("when scanning directories for partials", function () {
    let tests = [{
        description: "directory does not exist",
        should: "return null",
        directory: "doesNotMatter",
        partialName: "doesNotMatter",
        stubs: { fs: { existsSync: false } },
        expected: null
      },
      {
        description: "path is not a directory",
        should: "return null",
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
        description: "directory contains no files",
        should: "return null",
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
        description: "directory contains no matching files",
        should: "return null",
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
        description: "directory contains file with matching name but no matching extension",
        should: "return null",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial.one", "partial.two", "partial.whatever"]
          }
        },
        expected: null
      },
      {
        description: "directory contains directory with matching name",
        should: "return null",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial"]
          }
        },
        expected: null
      },
      {
        description: "partial directory contains one matching .yml file",
        should: "return file name",
        directory: resolvePartials.partialDirectory,
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
        description: "non partial directory contains one matching .partial.yml file",
        should: "return file name",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial.partial.yml"]
          }
        },
        expected: "partial.partial.yml"
      },
      {
        description: "non partial directory contains one matching .partial.yml file and folder matching partial name",
        should: "return matching .partial.yml name",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial", "partial.partial.yml"]
          }
        },
        expected: "partial.partial.yml"
      },
      {
        description: "partial directory contains one matching .js file",
        should: "return file name",
        directory: resolvePartials.partialDirectory,
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
        description: "non partial directory contains one matching .partial.js file",
        should: "return file name",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial.partial.js"]
          }
        },
        expected: "partial.partial.js"
      },
      {
        description: "partial directory contains matching .yml and .js file",
        should: "return first matching file name (.yml)",
        directory: resolvePartials.partialDirectory,
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
        description: "non partials directory contains matching .partial.yml and partial.js file",
        should: "return first matching file name (.partial.yml)",
        directory: "doesNotMatter",
        partialName: "partial",
        stubs: {
          fs: {
            existsSync: true,
            statSync: { isDirectory: () => true },
            readdirSync: ["partial.partial.yml", "partial.partial.js"]
          }
        },
        expected: "partial.partial.yml"
      },
      {
        description: "partial directory contains matching .js and .yml file",
        should: "return first matching file name (.js)",
        directory: resolvePartials.partialDirectory,
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
      expect(resolvePartials.scanDirectoryForPartial(test.directory, test.partialName)).to.equal(test.expected);
    }

    getTests(tests).forEach(test => {
      describe("when " + test.description, function () {
        beforeEach(function () {
          setupStubs(test.stubs);
        });
        afterEach(function () {
          restoreStubs(test.stubs);
        });
        it("should " + test.should, function () {
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
          resolvePartials: {
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
          resolvePartials: {
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
          resolvePartials: {
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
      if (test.include || test.log) console.log("patial url:", partialUrl);
      var partial = resolvePartials.resolve(test.partialUrl);
      if (test.include || test.log) console.log("partial", "\n" + JSON.stringify(partial, null, 2));
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
