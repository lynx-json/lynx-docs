Partials
=================================================

Referencing Partials
-------------------------------------------------

The following example references a partial called `input` for a property with a key of `firstName`. The parameters `label` and `value` are 
passed to the partial.

```YAML
firstName>input:
  label: First Name
  value: Jim
```

### Keyless References

In some cases (for a document or an item in an array, for example)
we may want to reference a partial without including a key.

```YAML
>page:
  header: Hello, World!
```

Authoring Partials
-------------------------------------------------

### Conditional Placeholders

```YAML
spec:
  validation:
    required~?:
      invalid: requiredInvalidMessage
```

You can also use a regular expression. If the pattern
matches a parameter name, the conditional content
will be included in the partial result.

```YAML
spec:
  validation:
    text~?minLength|maxLength|pattern|format:
      invalid: textInvalidMessage
    
```
