var proxyquire = require("proxyquire");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sutPath = "../../../src/server/serve-realm";

function getStubs(assertions) {
  return {
    './redirect-to-search': function (options) {
      return function (req, res, next) {
        if (assertions.redirectToSearch) assertions.redirectToSearch(options, req, res, next);
        else throw new Error("Redirect to search should not be called");
      };
    },
    './serve-template': function (options) {
      return function (template, realm) {
        return function (req, res, next) {
          if (assertions.serveTemplate) assertions.serveTemplate(options, template, realm, req, res, next);
          else throw new Error("Serve template should not be called");
        };
      };
    },
    './serve-variant': function (options) {
      return function (variant, realm) {
        return function (req, res, next) {
          if (assertions.serveVariant) assertions.serveVariant(options, variant, realm, req, res, next);
          else throw new Error("Serve variant should not be called");
        };
      };
    },
    './serve-variant/meta-index': function (options) {
      return function (realms) {
        return function (req, res, next) {
          if (assertions.serveVariantIndex) assertions.serveVariantIndex(options, realms, req, res, next);
          else throw new Error("Serve variant index should not be called");
        };
      };
    },
    '../serve-file': function (options) {
      return function (filename) {
        return function (req, res, next) {
          if (assertions.serveFile) assertions.serveFile(options, filename, req, res, next);
          else throw new Error("Serve variant index should not be called");
        };
      };
    }
  };
}

let tests = [{
    description: "no matching realms and request url === '/'",
    should: "call redirect to search handler",
    stubs: getStubs({
      redirectToSearch: function (options, req, res, next) {
        expect(req.url).to.equal("/");
      }
    }),
    options: {},
    req: {
      url: "/",
      realms: [],
    }
  },
  {
    description: "no matching realms and request url === ''",
    should: "call redirect to search handler",
    stubs: getStubs({
      redirectToSearch: function (options, req, res, next) {
        expect(req.url).to.equal("");
      }
    }),
    options: {},
    req: {
      url: "",
      realms: [],
    }
  },
  {
    description: "no matching realms and request has path",
    should: "call next function",
    stubs: getStubs(),
    options: {},
    req: {
      url: "/some-path/",
      realms: [],
    },
    next: function () {
      //no-op. Test will fail if this function is not called because one of
      //the other handlers would be called and the stubs throw an error if
      //they are called
    }
  },
  {
    description: "request for template that exists in realms",
    should: "call serve template",
    stubs: getStubs({
      serveTemplate: function (options, template, realm, req, res, next) {
        expect(template.path).to.equal("/path-to-template/template.lynx.yml");
      }
    }),
    options: {},
    req: {
      url: "/",
      query: { template: "/path-to-template/template.lynx.yml" },
      realms: [{
        url: "/",
        templates: [
          { path: "/path-to-template/template.lynx.yml" }
        ]
      }],
    }
  },
  {
    description: "request for template that doesn't exists in realms",
    should: "call serve variant index",
    stubs: getStubs({
      serveVariantIndex: function (options, realms, req, res, next) {
        expect(realms.length).to.equal(1);
      }
    }),
    options: {},
    req: {
      url: "/",
      query: { template: "/path-to-template-that-doesnt-exist/template.lynx.yml" },
      realms: [{
        url: "/",
        templates: [
          { path: "/path-to-template/template.lynx.yml" }
        ]
      }],
    }
  },
  {
    description: "request for realm with default variant",
    should: "call serve variant with default",
    stubs: getStubs({
      serveVariant: function (options, variant, realm, req, res, next) {
        expect(variant.template).to.equal("default.lynx.yml");
        expect(variant.data).to.equal("default.data.yml");
      }
    }),
    options: {},
    req: {
      url: "/",
      query: {},
      realms: [{
        url: "/",
        variants: [{
          name: "default",
          template: "default.lynx.yml",
          data: "default.data.yml"
        }]
      }],
    }
  },
  {
    description: "request for realm with default variant using path",
    should: "call serve variant with default",
    stubs: getStubs({
      serveVariant: function (options, variant, realm, req, res, next) {
        expect(variant.template).to.equal("default.lynx.yml");
        expect(variant.data).to.equal("default.data.yml");
      }
    }),
    options: {},
    req: {
      url: "/default",
      query: {},
      realms: [{
        url: "/",
        variants: [{
          name: "default",
          template: "default.lynx.yml",
          data: "default.data.yml"
        }]
      }],
    }
  },
  {
    description: "request for realm with explicit variant",
    should: "call serve variant with explicit",
    stubs: getStubs({
      serveVariant: function (options, variant, realm, req, res, next) {
        expect(variant.template).to.equal("explicit.lynx.yml");
        expect(variant.data).to.equal("explicit.data.yml");
      }
    }),
    options: {},
    req: {
      url: "/",
      query: { variant: "explicit" },
      realms: [{
        url: "/",
        variants: [{
          name: "explicit",
          template: "explicit.lynx.yml",
          data: "explicit.data.yml"
        }]
      }],
    }
  },
  {
    description: "request for realm with explicit variant using path",
    should: "call serve variant with explicit",
    stubs: getStubs({
      serveVariant: function (options, variant, realm, req, res, next) {
        expect(variant.template).to.equal("explicit.lynx.yml");
        expect(variant.data).to.equal("explicit.data.yml");
      }
    }),
    options: {},
    req: {
      url: "/explicit",
      query: {},
      realms: [{
        url: "/",
        variants: [{
          name: "explicit",
          template: "explicit.lynx.yml",
          data: "explicit.data.yml"
        }]
      }],
    }
  },
  {
    description: "request results in multiple matching realms with matching variants",
    should: "call serve variant index",
    stubs: getStubs({
      serveVariantIndex: function (options, realms, req, res, next) {
        expect(realms.length).to.equal(2);
      }
    }),
    options: {},
    req: {
      url: "/",
      query: {},
      realms: [{
          url: "/",
          variants: [{
            name: "default",
            template: "default.lynx.yml",
            data: "default.data.yml"
          }]
        },
        {
          url: "/",
          variants: [{
            name: "default",
            template: "default.lynx.yml",
            data: "default.data.yml"
          }]
        }
      ],
    }
  },
  {
    description: "request results in multiple matching realms but only one matching variant",
    should: "call serve variant with matching variant",
    stubs: getStubs({
      serveVariant: function (options, variant, realm, req, res, next) {
        expect(variant.template).to.equal("default.lynx.yml");
        expect(variant.data).to.equal("default.data.yml");
      }
    }),
    options: {},
    req: {
      url: "/",
      query: {},
      realms: [{
          url: "/",
          variants: [{
            name: "default",
            template: "default.lynx.yml",
            data: "default.data.yml"
          }]
        },
        {
          url: "/",
          variants: [{
            name: "not-default",
            template: "not-default.lynx.yml",
            data: "not-default.data.yml"
          }]
        }
      ],
    }
  },
  {
    description: "request for realm with index variant",
    should: "call serve variant index",
    stubs: getStubs({
      serveVariantIndex: function (options, realms, req, res, next) {
        expect(realms.length).to.equal(1);
      }
    }),
    options: {},
    req: {
      url: "/",
      query: { variant: "index" },
      realms: [{
        url: "/",
        variants: [{
          name: "default",
          template: "default.lynx.yml",
          data: "default.data.yml"
        }]
      }],
    }
  },
  {
    description: "request for realm with index variant using path",
    should: "call serve variant index",
    stubs: getStubs({
      serveVariantIndex: function (options, realms, req, res, next) {
        expect(realms.length).to.equal(1);
      }
    }),
    options: {},
    req: {
      url: "/index",
      query: {},
      realms: [{
        url: "/",
        variants: [{
          name: "default",
          template: "default.lynx.yml",
          data: "default.data.yml"
        }]
      }],
    }
  },
  {
    description: "request results in multiple matching realms with index variant",
    should: "call serve variant index",
    stubs: getStubs({
      serveVariantIndex: function (options, realms, req, res, next) {
        expect(realms.length).to.equal(2);
      }
    }),
    options: {},
    req: {
      url: "/",
      query: { variant: "index" },
      realms: [{
          url: "/",
          variants: [{
            name: "default",
            template: "default.lynx.yml",
            data: "default.data.yml"
          }]
        },
        {
          url: "/",
          variants: [{
            name: "not-default",
            template: "not-default.lynx.yml",
            data: "not-default.data.yml"
          }]
        }
      ],
    }
  },
  {
    description: "request for realm with content variant",
    should: "call serve file with content path",
    stubs: getStubs({
      serveFile: function (options, filename, req, res, next) {
        expect(filename).to.equal("a-content-file.pdf");
      }
    }),
    options: {},
    req: {
      url: "/a-content-file.pdf",
      query: {},
      realms: [{
        url: "/a-content-file.pdf",
        variants: [{
          content: "a-content-file.pdf"
        }]
      }],
    }
  },
];

describe("serve realm (router)", function () {
  tests.forEach(test => {
    describe(`when ${test.description}`, function () {
      let sut = proxyquire(sutPath, test.stubs);
      let handler = sut(test.options);
      it(test.should, function () {
        handler(test.req, test.res, test.next || function () {
          throw new Error("next shouldn't be called");
        });
      });
    });
  });
});
