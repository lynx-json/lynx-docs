var tests = [{
    description: "object with text values",
    template: { message: "Hello World!" },
    expected: { message: "Hello World!" }
  },
  {
    description: "Issue #86. Object with null value",
    template: { ">container": null },
    expected: { spec: { hints: ["container"] }, value: null }
  },
  {
    description: "object with text and array values",
    template: { message: "Hello World!", items: [1, 2, 3] },
    expected: { message: "Hello World!", items: [1, 2, 3] }
  },
  {
    description: "static aray with static text",
    template: [{ message: "Hello World!" }],
    expected: [{ message: "Hello World!" }]
  }
];

tests.suite = "static content";

module.exports = tests;
