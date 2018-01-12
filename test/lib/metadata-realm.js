"use strict";

const mime = require("mime");
const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const types = require("../../src/types");
const getRealms = require("../../src/lib/metadata-realm");
const path = require("path");
const YAML = require("yamljs");

function statsFake(isDirectory) {
  return {
    isDirectory: function () {
      return isDirectory;
    },
    isFile: function () {
      return !isDirectory;
    }
  };
}

function toYamlBuffer(value) {
  return new Buffer(YAML.stringify(value, null));
}

var tests = [{
    description: "an empty folder",
    root: "/root",
    fs: {
      dirs: {
        "/root": []
      },
      files: {}
    },
    assertions: [
      countOf(1),
      containsRealm("/")
    ]
  },
  {
    description: "an empty folder with a base realm",
    root: "/root",
    realm: "http://example.com",
    fs: {
      dirs: {
        "/root": []
      },
      files: {}
    },
    assertions: [
      countOf(1),
      containsRealm("http://example.com/")
    ]
  },
  {
    description: "a folder with one template",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.lynx.yml"]
      },
      files: {
        "/root/default.lynx.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.lynx.yml")
    ]
  },
  {
    description: "a folder with one template (.template.yml)",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.template.yml"]
      },
      files: {
        "/root/default.template.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.template.yml")
    ]
  },
  {
    description: "a folder with one template and one data file",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.lynx.yml", "default.data.yml"]
      },
      files: {
        "/root/default.lynx.yml": null,
        "/root/default.data.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.lynx.yml", "/root/default.data.yml")
    ]
  },
  {
    description: "a folder with one template (.template.yml) and one data file",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.template.yml", "default.data.yml"]
      },
      files: {
        "/root/default.template.yml": null,
        "/root/default.data.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.template.yml", "/root/default.data.yml")
    ]
  },
  {
    description: "a folder with one template and two data files",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.lynx.yml", "default.data.yml", "default.other.data.yml"]
      },
      files: {
        "/root/default.lynx.yml": null,
        "/root/default.data.yml": null,
        "/root/default.other.data.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.lynx.yml", "/root/default.data.yml"),
      containsVariant("/", "default-other", "/root/default.lynx.yml", "/root/default.other.data.yml")
    ]
  },
  {
    description: "a folder with one template (.template.yml) and two data files",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.template.yml", "default.data.yml", "default.other.data.yml"]
      },
      files: {
        "/root/default.template.yml": null,
        "/root/default.data.yml": null,
        "/root/default.other.data.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.template.yml", "/root/default.data.yml"),
      containsVariant("/", "default-other", "/root/default.template.yml", "/root/default.other.data.yml")
    ]
  },
  {
    description: "a folder with one template and a data folder with one data file",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.lynx.yml", "default.data"],
        "/root/default.data": ["default.yml"]
      },
      files: {
        "/root/default.lynx.yml": null,
        "/root/default.data/default.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.lynx.yml", "/root/default.data/default.yml")
    ]
  },
  {
    description: "a folder with one template (.template.yml) and a data folder with one data file",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.template.yml", "default.data"],
        "/root/default.data": ["default.yml"]
      },
      files: {
        "/root/default.template.yml": null,
        "/root/default.data/default.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.template.yml", "/root/default.data/default.yml")
    ]
  },
  {
    description: "a folder with one template and a data folder with two data files",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.lynx.yml", "default.data"],
        "/root/default.data": ["default.yml", "other.yml"]
      },
      files: {
        "/root/default.lynx.yml": null,
        "/root/default.data/default.yml": null,
        "/root/default.data/other.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.lynx.yml", "/root/default.data/default.yml"),
      containsVariant("/", "default-other", "/root/default.lynx.yml", "/root/default.data/other.yml")
    ]
  },
  {
    description: "a folder with one template (.template.yml) and a data folder with two data files",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["default.template.yml", "default.data"],
        "/root/default.data": ["default.yml", "other.yml"]
      },
      files: {
        "/root/default.template.yml": null,
        "/root/default.data/default.yml": null,
        "/root/default.data/other.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "default", "/root/default.template.yml", "/root/default.data/default.yml"),
      containsVariant("/", "default-other", "/root/default.template.yml", "/root/default.data/other.yml")
    ]
  },
  {
    description: "a folder with two templates",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["a.lynx.yml", "b.lynx.yml"]
      },
      files: {
        "/root/a.lynx.yml": null,
        "/root/b.lynx.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "a", "/root/a.lynx.yml"),
      containsVariant("/", "b", "/root/b.lynx.yml")
    ]
  },
  {
    description: "a folder with two templates (.lynx.yml & .template.yml)",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["a.lynx.yml", "b.template.yml"]
      },
      files: {
        "/root/a.lynx.yml": null,
        "/root/b.template.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "a", "/root/a.lynx.yml"),
      containsVariant("/", "b", "/root/b.template.yml")
    ]
  },
  {
    description: "a folder with two templates each with one data file",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["a.lynx.yml", "a.data.yml", "b.lynx.yml", "b.data.yml"]
      },
      files: {
        "/root/a.lynx.yml": null,
        "/root/b.lynx.yml": null,
        "/root/a.data.yml": null,
        "/root/b.data.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "a", "/root/a.lynx.yml", "/root/a.data.yml"),
      containsVariant("/", "b", "/root/b.lynx.yml", "/root/b.data.yml")
    ]
  },
  {
    description: "a folder with two templates each with two data files",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["a.lynx.yml", "a.data.yml", "a.2.data.yml",
          "b.lynx.yml", "b.data.yml", "b.2.data.yml"
        ]
      },
      files: {
        "/root/a.lynx.yml": null,
        "/root/b.lynx.yml": null,
        "/root/a.data.yml": null,
        "/root/b.data.yml": null,
        "/root/b.2.data.yml": null,
        "/root/a.2.data.yml": null
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/"),
      containsVariant("/", "a", "/root/a.lynx.yml", "/root/a.data.yml"),
      containsVariant("/", "b", "/root/b.lynx.yml", "/root/b.data.yml"),
      containsVariant("/", "a-2", "/root/a.lynx.yml", "/root/a.2.data.yml"),
      containsVariant("/", "b-2", "/root/b.lynx.yml", "/root/b.2.data.yml")
    ]
  },
  {
    description: "a content file",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["funny-cat.gif"]
      },
      files: {
        "/root/funny-cat.gif": null
      }
    },
    assertions: [
      countOf(2),
      containsRealm("/"),
      containsRealm("/funny-cat.gif"),
      containsContentVariant("/funny-cat.gif", "funny-cat.gif", "/root/funny-cat.gif")
    ]
  },
  {
    description: "a content file with a base realm",
    root: "/root",
    realm: "http://example.com/",
    fs: {
      dirs: {
        "/root": ["funny-cat.gif"]
      },
      files: {
        "/root/funny-cat.gif": null
      }
    },
    assertions: [
      countOf(2),
      containsRealm("http://example.com/"),
      containsRealm("http://example.com/funny-cat.gif"),
      containsContentVariant("http://example.com/funny-cat.gif", "funny-cat.gif", "/root/funny-cat.gif")
    ]
  },
  {
    description: "a meta file with one realm",
    root: "/root",
    fs: {
      dirs: {
        "/root": [".meta.yml"]
      },
      files: {
        "/root/.meta.yml": realmObject("/foo")
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/foo/")
    ]
  },
  {
    description: "a meta file with two realms",
    root: "/root",
    fs: {
      dirs: {
        "/root": [".meta.yml"]
      },
      files: {
        "/root/.meta.yml": toYamlBuffer([
          { realm: "/foo" },
          { realm: "/bar" }
        ])
      }
    },
    assertions: [
      countOf(2),
      containsRealm("/foo/"),
      containsRealm("/bar/"),
    ]
  },
  {
    description: "a meta file with one realm",
    root: "/root",
    fs: {
      dirs: {
        "/root": [".meta.yml"]
      },
      files: {
        "/root/.meta.yml": realmObject("/foo",
          variant("a", "/root/a.lynx.yml"))
      }
    },
    assertions: [
      countOf(1),
      containsRealm("/foo/"),
      containsVariant("/foo/", "a", "/root/a.lynx.yml")
    ]
  },
  {
    description: "a meta with a variant using a template from another folder",
    root: "/root",
    fs: {
      dirs: {
        "/root": ["form"],
        "/root/form": ["default.lynx.yml", "processor"],
        "/root/form/processor": [".meta.yml", "invalid.data.yml"]
      },
      files: {
        "/root/form/default.lynx.yml": null,
        "/root/form/processor/invalid.data.yml": null,
        "/root/form/processor/.meta.yml": realmObject(null,
          variant(null, "/root/form/default.lynx.yml", "/root/form/processor/invalid.data.yml"))
      }
    },
    assertions: [
      countOf(3),
      containsRealm("/"),
      containsRealm("/form/"),
      containsRealm("/form/processor/"),
      containsVariant("/form/", "default", "/root/form/default.lynx.yml"),
      containsVariant("/form/processor/", "default-invalid", "/root/form/default.lynx.yml", "/root/form/processor/invalid.data.yml")
    ]
  },
  {
    description: "a meta file with two realms with a template in second realm",
    root: "/root",
    fs: {
      dirs: {
        "/root": [".meta.yml", "bar.lynx.yml", "bar.data.yml", "bar.2.data.yml"]
      },
      files: {
        "/root/.meta.yml": toYamlBuffer([
          { realm: "/" },
          { realm: "/bar", templates: ["bar.lynx.yml"] }
        ]),
        "/root/bar.lynx.yml": null,
        "/root/bar.data.yml": null,
        "/root/bar.2.data.yml": null
      }
    },
    assertions: [
      countOf(2),
      containsRealm("/"),
      containsRealm("/bar/"),
      containsVariant("/bar/", "bar", "/root/bar.lynx.yml", "/root/bar.data.yml"),
      containsVariant("/bar/", "bar-2", "/root/bar.lynx.yml", "/root/bar.2.data.yml")
    ]
  }
];

function realmObject(realm, variants) {
  if (variants && !types.isArray(variants)) {
    variants = [variants];
  }

  var realmObj = {};
  if (realm) realmObj.realm = realm;
  realmObj.variants = variants || [];

  return toYamlBuffer(realmObj);
}

function variant(name, pathToTemplateFile, pathToDataFile) {
  var variant = { type: "application/lynx+json" };
  if (name) variant.name = name;
  if (pathToTemplateFile) variant.template = pathToTemplateFile;
  if (pathToDataFile) variant.data = pathToDataFile;
  return variant;
}

function countOf(n) {
  var assertion = function (realms) {
    realms.length.should.equal(n);
  };
  assertion.should = "should have a count of " + n.toString();
  return assertion;
}

function containsRealm(realmUri) {
  var assertion = function (realms) {
    var result = realms.some(realm => realm.realm === realmUri);
    result.should.equal(true);
  };
  assertion.should = "should contain realm '" + realmUri + "'";
  return assertion;
}

function containsVariant(realmUri, name, pathToTemplateFile, pathToDataFile) {
  var assertion = function (realms) {
    var result = realms.some(
      r => r.variants.some(
        v => r.realm === realmUri &&
        v.name === name &&
        v.template === path.resolve(pathToTemplateFile) &&
        v.type === "application/lynx+json" &&
        (!pathToDataFile || v.data === path.resolve(pathToDataFile))));

    result.should.equal(true);
  };

  var desc = "should contain a variant in realm '" + realmUri + "'";
  desc += ", with name '" + name + "'";
  desc += ", with template '" + pathToTemplateFile + "'";

  if (pathToDataFile) {
    desc += ", with data '" + pathToDataFile + "'";
  }

  desc += ", with type 'application/lynx+json'";

  assertion.should = desc;

  return assertion;
}

function containsContentVariant(realmUri, name, pathToContentFile) {
  var contentType = mime.lookup(pathToContentFile);

  var assertion = function (realms) {
    var result = realms.some(
      r => r.variants.some(
        v => r.realm === realmUri &&
        v.name === name &&
        v.content === path.resolve(pathToContentFile) &&
        v.type === contentType));

    result.should.equal(true);
  };

  var desc = "should contain a content variant in realm '" + realmUri + "'";
  desc += ", with name '" + name + "'";
  desc += ", with content file '" + pathToContentFile + "'";
  desc += ", with type '" + contentType + "'";

  assertion.should = desc;

  return assertion;
}

describe("metadata-realm module", function () {
  describe("when getting realm metadata", function () {
    tests.forEach(function (test) {
      describe(test.description, function () {
        var realms;

        beforeEach(function () {
          var readdirStub = sinon.stub(fs, "readdirSync");
          var readFileStub = sinon.stub(fs, "readFileSync");
          var existsSyncStub = sinon.stub(fs, "existsSync");
          var statStub = sinon.stub(fs, "statSync");

          Object.getOwnPropertyNames(test.fs.dirs).forEach(function (dir) {
            var rdir = path.resolve(dir);
            existsSyncStub.withArgs(rdir).returns(true);
            readdirStub.withArgs(rdir).returns(test.fs.dirs[dir]);
            statStub.withArgs(rdir).returns(statsFake(true));
          });

          Object.getOwnPropertyNames(test.fs.files).forEach(function (file) {
            var rfile = path.resolve(file);
            existsSyncStub.withArgs(rfile).returns(true);
            readFileStub.withArgs(rfile).returns(test.fs.files[file]);
            statStub.withArgs(rfile).returns(statsFake(false));
          });

          realms = getRealms(test.root, test.realm);
        });

        afterEach(function () {
          fs.readdirSync.restore();
          fs.readFileSync.restore();
          fs.existsSync.restore();
          if (fs.statSync.restore) fs.statSync.restore();
        });

        test.assertions.forEach(function (assertion) {
          it(assertion.should, function () {
            assertion(realms);
          });
        });
      });
    });
  });
});
