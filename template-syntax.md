# Documentation moved to wiki
[View documentation on wiki](https://github.com/lynx-json/lynx-docs/wiki)

# Scratch Area for Lynx YAML Template Rules
- Names should be resolved recursively. Will need rules for this.
- If engine does not support recursive resolution than data needs to be structured so the name evaluates in the current context

## Object template conditionals `#`
- Allowed values are true, false, null, undefined, string, or an object
- True and object result is rendering of template
- All other values are interpreted as falsey and result it template not being rendered
- If value is an object then it is set as the data context for the section

## List binding `@`
- Allowed values are arrays(lists), null, or undefined
- Each item in the list is set as the binding context for the item template
### Potential future list binding rules. Support for mustache
- ??Each item must have a key named "xxxx" which evaluates to true only for last item in the list??

## Quoted `<` and unquoted `=` literal binding
- Allowed values are true, false, null, undefined, string, or number

# Proposed syntax examples for YAML JSON Templates
```YAML
stringsNumbersAndLiterals:
  static:
    - description: static string value
      template:
        foo: bar
    - description: static literal
      template:
        foo: true
    - description: static number
      template:
        foo: 123
  dynamic:
    - description: Bind quoted `foo` value and provide default
      template:
        foo<: No Foo
    - description: Bind unquoted `foo` value and provide default
      template:
        foo=: 123
    - description: Bind quoted `bar` value and provide default
      template:
        foo<bar: No bar
    - description: Bind unquoted `bar` value and provide default
      template:
        foo=bar: \"No bar\"
objects:
  static:
    - description: Empty objects
      template:
        foo: {}
    - description: Standard object
      template:
        foo:
          bar: Bar
          baz: Baz
  dynamic:
    - description: short hand for null inverse
      template:
        foo#:
          header: Foo exists
    - description: intermediate syntax for null inverse
      template:
        foo#: #
          header: Foo exists
        foo^: null
    - description: full syntax for null inverse
      template:
        foo:
          "#foo":
            header: Foo exists
          "^foo": null
    - description: short hand for inverse with value
      template:
        foo#:
          header: Foo exists
        foo^:
          message: Foo does not exist
    - description: full syntax for inverse with value
      template:
        foo:
          "#foo":
            header: Foo exists
          "^foo":
            message: Foo does not exist
    - description: short hand for null inverse
      template:
        foo#bar:
          header: Bar exists
    - description: intermediate syntax for null inverse
      template:
        foo#bar:
          header: Bar exists
        foo^bar: null
    - description: full syntax for null inverse
      template:
        foo:
          "#bar":
            header: Bar exists
          "^bar": null
    - description: short hand for inverse with value
      template:
        foo#bar:
          header: Bar exists
        foo^bar:
          message: Bar does not exist
    - description: full syntax for inverse with value
      template:
        foo:
          "#bar":
            header: Bar exists
          "^bar":
            message: Bar does not exist
arrays:
  static:
    - description: Empty array
      template:
        foo: []
    - description: String array
      template:
        foo:
          - bar
          - baz
    - description: Object array
      template:
        foo:
          - bar:
              baz: baz
    - description: Mixed array
      template:
        foo:
          - bar:
              baz: baz
          - qux
  dynamic: #is there a scenario where an iterator has a key?
    - description: iterator creates object values
      template:
        - @items:
            header: Object with a header key
    - description: iterator creates string values
      template:
        - @items:
            <name: String array since only value is bound
    - description: iterator calls creates result of group partial
      template:
        - @items:
            >group:
              message: Group partial called with object that contains description key
```
