const chai = require("chai");
const expect = chai.expect;
const handlebars = require("handlebars");

const toHandlebars = require("../../../src/lib/json-templates/to-handlebars");

let tests = [{
    description: "converting literal null",
    template: null,
    data: null,
    expected: null
  },
  {
    description: "converting number",
    template: 12,
    data: null,
    expected: 12
  },
  {
    description: "converting true",
    template: true,
    data: null,
    expected: true
  },
  {
    description: "converting false",
    template: false,
    data: null,
    expected: false
  },
  {
    description: "converting string",
    template: "This is a string",
    data: null,
    expected: "This is a string"
  },
  {
    description: "converting an object with single key",
    template: { foo: "Foo" },
    data: null,
    expected: { foo: "Foo" }
  },
  {
    description: "converting an object with multiple keys",
    template: { foo: "Foo", bar: "Bar" },
    data: null,
    expected: { foo: "Foo", bar: "Bar" }
  },
  {
    description: "converting an array with single value",
    template: ["Foo"],
    data: null,
    expected: ["Foo"]
  },
  {
    description: "converting an array with multiple values",
    template: ["Foo", "Bar"],
    data: null,
    expected: ["Foo", "Bar"]
  },
  {
    description: "converting key with binding token '<' with default null value - if case",
    template: { "foo<": null },
    data: { foo: "bar" },
    expected: { foo: "bar" }
  },
  {
    description: "converting key with binding token '<' with default null value - else case",
    template: { "foo<": null },
    data: {},
    expected: { foo: null }
  },
  {
    description: "converting key with binding token '<' with default boolean value - if case",
    template: { "foo<": true },
    data: { foo: "bar" },
    expected: { foo: "bar" }
  },
  {
    description: "converting key with binding token '<' with default boolean value - else case",
    template: { "foo<": true },
    data: {},
    expected: { foo: true }
  },
  {
    description: "converting key with binding token '<' with default number value - if case",
    template: { "foo<": 2 },
    data: { foo: "bar" },
    expected: { foo: "bar" }
  },
  {
    description: "converting key with binding token '<' with default number value - else case",
    template: { "foo<": 2 },
    data: {},
    expected: { foo: 2 }
  },
  {
    description: "converting key with binding token '<' with default string value - if case",
    template: { "foo<": "No foo" },
    data: { foo: "bar" },
    expected: { foo: "bar" }
  },
  {
    description: "converting key with binding token '<' with default string value - else case",
    template: { "foo<": "No foo" },
    data: {},
    expected: { foo: "No foo" }
  },
  {
    description: "converting dynamic with token '<' and static sibling",
    template: { "foo<": "No foo", bar: "Yes bar" },
    data: {},
    expected: { foo: "No foo", bar: "Yes bar" }
  },
  {
    description: "converting key with binding token '=' with default null value - if case",
    template: { "foo=": null },
    data: { foo: 42 },
    expected: { foo: 42 }
  },
  {
    description: "converting key with binding token '=' with default null value - else case",
    template: { "foo=": null },
    data: {},
    expected: { foo: null }
  },
  {
    description: "converting key with binding token '=' with default boolean value - if case",
    template: { "foo=": true },
    data: { foo: 42 },
    expected: { foo: 42 }
  },
  {
    description: "converting key with binding token '=' with default boolean value - else case",
    template: { "foo=": true },
    data: {},
    expected: { foo: true }
  },
  {
    description: "converting key with binding token '=' with default number value - if case",
    template: { "foo=": 2 },
    data: { foo: 42 },
    expected: { foo: 42 }
  },
  {
    description: "converting key with binding token '=' with default number value - else case",
    template: { "foo=": 2 },
    data: {},
    expected: { foo: 2 }
  },
  {
    description: "converting key with binding token '=' with default string value - if case",
    template: { "foo=": "No foo" },
    data: { foo: 42 },
    expected: { foo: 42 }
  },
  {
    description: "converting key with binding token '=' with default string value - else case",
    template: { "foo=": "No foo" },
    data: {},
    expected: { foo: "No foo" }
  },
  {
    description: "converting dynamic with token '=' and static sibling",
    template: { "foo=": "No foo", bar: "Yes bar" },
    data: {},
    expected: { foo: "No foo", bar: "Yes bar" }
  },
  {
    description: "converting key with binding token '#' with no inverse - truthy case",
    template: { foo: { "#foo": { message: "Yes foo" } } },
    data: { foo: true },
    expected: { foo: { message: "Yes foo" } }
  },
  {
    description: "converting key with binding token '^' with no inverse - falsey case",
    template: { foo: { "^foo": { message: "No foo" } } },
    data: { foo: false },
    expected: { foo: { message: "No foo" } }
  },
  {
    description: "converting key with binding token '#' with null inverse - truthy case",
    template: { foo: { "#foo": { message: "Yes foo" }, "^foo": null } },
    data: { foo: true },
    expected: { foo: { message: "Yes foo" } }
  },
  {
    description: "converting key with binding token '#' with null inverse - falsey case",
    template: { foo: { "#foo": { message: "Yes foo" }, "^foo": null } },
    data: { foo: false },
    expected: { foo: null }
  },
  {
    description: "converting key with binding token '#' with object inverse - truthy case",
    template: { foo: { "#foo": { message: "Yes foo" }, "^foo": { message: "No foo" } } },
    data: { foo: true },
    expected: { foo: { message: "Yes foo" } }
  },
  {
    description: "converting key with binding token '#' with object inverse - falsey case",
    template: { foo: { "#foo": { message: "Yes foo" }, "^foo": { message: "No foo" } } },
    data: { foo: false },
    expected: { foo: { message: "No foo" } }
  },
  {
    description: "converting root with binding token '#' with object inverse - truthy case",
    template: { "#foo": { message: "Yes foo" }, "^foo": { message: "No foo" } },
    data: { foo: true },
    expected: { message: "Yes foo" }
  },
  {
    description: "converting root with binding token '#' with object inverse - falsey case",
    template: { "#foo": { message: "Yes foo" }, "^foo": { message: "No foo" } },
    data: { foo: false },
    expected: { message: "No foo" }
  },
  {
    description: "converting key with nested binding tokens '#' with null inverse - inner truthy case",
    template: { foo: { "#foo": { "#bar": { message: "Yes bar" }, "^bar": null }, "^foo": null } },
    data: { foo: { bar: true } },
    expected: { foo: { message: "Yes bar" } }
  },
  {
    description: "converting key with nested binding tokens '#' with null inverse - inner falsey case",
    template: { foo: { "#foo": { "#bar": { message: "Yes bar" }, "^bar": null }, "^foo": null } },
    data: { foo: { bar: false } },
    expected: { foo: null }
  },
  {
    description: "converting key with nested binding tokens '#' with null inverse - outer falsey case",
    template: { foo: { "#foo": { "#bar": { message: "Yes bar" }, "^bar": null }, "^foo": null } },
    data: { foo: false },
    expected: { foo: null }
  },
  {
    description: "converting iterator token '@' - one item",
    template: [{ "@items": { foo: "Foo" } }],
    data: { items: ["one"] },
    expected: [{ foo: "Foo" }]
  },
  {
    description: "converting iterator token '@' - two items",
    template: [{ "@items": { foo: "Foo" } }],
    data: { items: ["one", "two"] },
    expected: [{ foo: "Foo" }, { foo: "Foo" }]
  },
  {
    description: "converting iterator token '@' - zero items",
    template: [{ "@items": { foo: "Foo" } }],
    data: { items: [] },
    expected: []
  },
  {
    description: "converting iterator token '@' for string array - one item if case",
    template: [{ "@items": { "<name": "Foo" } }],
    data: { items: [{ name: "Bar" }] },
    expected: ["Bar"]
  },
  {
    description: "converting iterator token '@' for string array - one item else case",
    template: [{ "@items": { "<name": "Foo" } }],
    data: { items: [{ noname: true }] },
    expected: ["Foo"]
  },
  {
    description: "converting iterator token '@' for string array - two items if case",
    template: [{ "@items": { "<name": "Foo" } }],
    data: { items: [{ name: "Bar" }, { name: "Qux" }] },
    expected: ["Bar", "Qux"]
  },
  {
    description: "converting iterator token '@' for string array - two item else case",
    template: [{ "@items": { "<name": "Foo" } }],
    data: { items: [{ noname: true }, { alsononame: true }] },
    expected: ["Foo", "Foo"]
  },
  {
    description: "converting iterator token '@' for string array - zero items",
    template: [{ "@items": { "<name": "Foo" } }],
    data: { items: [] },
    expected: []
  }
];

function runTest(test) {
  let result = toHandlebars(test.template);
  let template = handlebars.compile(result);
  let json = template(test.data);
  let parsed = JSON.parse(json);
  expect(parsed).to.deep.equal(test.expected);
}

describe("when converting from templates to handlebars to JSON", function () {
  tests.forEach(function (test) {
    describe("when ".concat(test.description), function () {
      it("should result in expected value", function () {
        runTest(test);
      });
    });
  });
});
