var should = require("chai").should();
var exportYaml = require("../../src/lib/export-yaml");

function runTest(yaml, expected) {
  var output = [];
  function captureOutput(content) {
    output.push(content);
  }
  
  exportYaml("handlebars", { value: yaml }, captureOutput);
  
  var actual = output.join("");
  actual.should.equal(expected);
}

describe("when exporting YAML", function () {
  describe("YAML with a string value", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        value: "foo"
      };
      
      var expected = JSON.stringify(yaml);
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with an array value", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        value: [
          "foo",
          "bar"
        ]
      };
      
      var expected = JSON.stringify(yaml);
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with an object value", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        value: {
          foo: "bar"
        }
      };
      
      var expected = JSON.stringify(yaml);
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with a string value template", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        value: "{{{foo}}}"
      };
      
      var expected = JSON.stringify(yaml);
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with an object value template", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        "value#": {
          greeting: "Hi"
        }
      };
      
      var expected = '{"spec":{},"value": {{#value}} {"greeting":"Hi"} {{/value}} }'
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with two object value templates", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        "value#foo": {
          greeting: "Hi",
          name: "Dan"
        },
        "value#bar": {
          greeting: "Yo",
          name: "John"
        }
      };
      
      var expected = '{"spec":{},"value": {{#foo}} {"greeting":"Hi","name":"Dan"} {{/foo}}  {{#bar}} {"greeting":"Yo","name":"John"} {{/bar}} }'
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with an array item string template", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        "value@": "{{{greeting}}}"
      };
      
      var expected = '{"spec":{},"value":[ {{#value}} "{{{greeting}}}"{{#unless @last}},{{/unless}} {{/value}} ]}'
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with an array item object template", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        "value@": {
          greeting: "{{{greeting}}}"
        }
      };
      
      var expected = '{"spec":{},"value":[ {{#value}} {"greeting":"{{{greeting}}}"}{{#unless @last}},{{/unless}} {{/value}} ]}'
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with two array item string templates", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        "value@foo": "{{{foo-greeting}}}",
        "value@bar": "{{{bar-greeting}}}",
      };
      
      var expected = '{"spec":{},"value":[ {{#foo}} "{{{foo-greeting}}}"{{#unless @last}},{{/unless}} {{/foo}}  {{#bar}} "{{{bar-greeting}}}"{{#unless @last}},{{/unless}} {{/bar}} ]}'
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with two array item object templates", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        "value@foo": {
          greeting: "{{{foo-greeting}}}"
        },
        "value@bar": {
          greeting: "{{{bar-greeting}}}"
        }
      };
      
      var expected = '{"spec":{},"value":[ {{#foo}} {"greeting":"{{{foo-greeting}}}"}{{#unless @last}},{{/unless}} {{/foo}}  {{#bar}} {"greeting":"{{{bar-greeting}}}"}{{#unless @last}},{{/unless}} {{/bar}} ]}'
      
      runTest(yaml, expected);
    });
  });

  describe("YAML with an array item object template with inner template", function () {
    it("should return the correct template", function () {
      var yaml = {
        spec: {},
        "value@": {
          "greeting#": {
            message: "{{{message}}}"
          }
        }
      };
      
      var expected = '{"spec":{},"value":[ {{#value}} {"greeting": {{#greeting}} {"message":"{{{message}}}"} {{/greeting}} }{{#unless @last}},{{/unless}} {{/value}} ]}'
      
      runTest(yaml, expected);
    });
  });
});
