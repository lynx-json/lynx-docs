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
