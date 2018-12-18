var proxyquire = require("proxyquire");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sutPath = "../../../../src/server/serve-realm/serve-variant";

function getStubs(assertions) {
  return {
    './javascript': function (options, serveVariant) {
      return function (variant, realm) {
        return function (req, res, next) {
          if (assertions.javascript) assertions.javascript(options, variant, realm, req, res, next);
          else throw new Error("Serve JavaScript variant should not be called");
        };
      };
    },
    './lynx-content': function (options) {
      return function (variant, realm) {
        return function (req, res, next) {
          if (assertions.lynx) assertions.lynx(options, variant, realm, req, res, next);
          else throw new Error("Lynx content variant should not be called");
        };
      };
    },
    './template-content': function (options) {
      return function (template, realm) {
        return function (req, res, next) {
          if (assertions.template) assertions.template(options, template, realm, req, res, next);
          else throw new Error("Template content variant should not be called");
        };
      };
    },
    './data-content': function (options) {
      return function (data, realm) {
        return function (req, res, next) {
          if (assertions.data) assertions.data(options, data, realm, req, res, next);
          else throw new Error("Data content variant should not be called");
        };
      };
    },
    './meta-index': function (options, serveVariant) {
      return function (realms) {
        return function (req, res, next) {
          if (assertions.index) assertions.index(options, realms, req, res, next);
          else throw new Error("Serve variant index should not be called");
        };
      };
    }
  };
}

let tests = [{
    description: "lynx variant",
    should: "call lynx variant handler",
    stubs: getStubs({
      lynx: function (options, variant, realm, req, res, next) {
        expect(variant.template).to.equal("default.lynx.yml");
        expect(variant.data).to.equal("default.data.yml");
      }
    }),
    options: {},
    req: {},
    realm: {},
    variant: {
      template: "default.lynx.yml",
      data: "default.data.yml"
    }
  },
  {
    description: "template content variant",
    should: "call template content handler",
    stubs: getStubs({
      template: function (options, template, realm, req, res, next) {
        expect(template).to.equal("default.lynx.yml");
      }
    }),
    options: {},
    req: { query: { "ld-content": "template" } },
    realm: {},
    variant: {
      template: "default.lynx.yml",
      data: "default.data.yml"
    }
  },
  {
    description: "data content variant",
    should: "call data content handler",
    stubs: getStubs({
      data: function (options, data, realm, req, res, next) {
        expect(data).to.equal("default.data.yml");
      }
    }),
    options: {},
    req: { query: { "ld-content": "data" } },
    realm: {},
    variant: {
      template: "default.lynx.yml",
      data: "default.data.yml"
    }
  },
  {
    description: "jsmodule variant",
    should: "call javascript variant handler",
    stubs: getStubs({
      javascript: function (options, variant, realm, req, res, next) {
        expect(realm.folder).to.equal(__dirname);
        expect(variant.jsmodule).to.equal("./dummy");
      }
    }),
    options: {},
    req: {},
    realm: { folder: __dirname },
    variant: {
      jsmodule: "./dummy"
    }
  },
  {
    description: "variant without template or jsmodule keys",
    should: "call serve variant index",
    stubs: getStubs({
      index: function (options, realms, req, res, next) {
        expect(realms.length).to.equal(1);
        expect(realms[0].folder).to.equal(__dirname);
      }
    }),
    options: {},
    req: {},
    realm: { folder: __dirname },
    variant: {
      name: "without template or jsmodule"
    }
  }
];

describe("serve variant (router)", function () {
  tests.forEach(test => {
    describe(`when ${test.description}`, function () {
      let sut = proxyquire(sutPath, test.stubs);
      let variantHandler = sut(test.options);
      let handler = variantHandler(test.variant, test.realm);
      it(test.should, function () {
        handler(test.req, test.res, test.next || function () {
          throw new Error("next shouldn't be called");
        });
      });
    });
  });
});
