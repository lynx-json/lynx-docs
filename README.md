# lynx-docs
Tools for writing Lynx templates in YAML and converting to other template formats.

Modeling a Server Application
-------------------------------------------------

Consider the following folder:

```
./
├── search/
│   ├── default.yml
```
  
And the following content (in `default.yml`):
  
```YAML
Hello, World!
```
  
The `/search/` folder represents a search form, and its lone document provides its default, and only, state. The Lynx Docs server will return a lynx document representing that state when a request is made to the URL `/search/`:

Resource States:

- default

### Document Templates with Many Possible States

Let's turn the `default.yml` document into a document template, so we can begin to model more than one resource state:

```YAML
"Hello, {{{name}}}"
```

Now, this document template may represent any number of states, so we need a way to model them. Let's add a folder called `_default.data` to hold any data files intended to be bound to the `default.yml` template.

```
./
├── search/
│   ├── _default.data/
│   │   ├── default.yml
│   │   ├── no-name.yml
│   │   ├── long-name.yml
│   ├── default.yml
```

Each of the data files in the `_default.data` folder, when bound to the `default.yml` document template, results in a new document. Since there are three data files, we've now modeled three resource states that might be returned when a request is made to the `/search/` URL.

Resource States:

- default
- no name
- long name
 
Since our search form resource now has more than one anticipated state, we need to decide which state to return when a request is made to the URL `/search/`. Since one of the states is named `default`, the Lynx Docs server will return a lynx document representing the default state. But we also need to allow the user to select alternate states, so along with the default document, the Lynx Docs server will return a set of links to alternate documents.

> Note: If there is no `default` state, the Lynx Docs server will return a list of links to available states.

### Dynamic Handlers

In some cases, it becomes necessary to provide additional logic to properly model a dynamic response. For example, the response to an invalid form submission may be the original form with an error message and an appropriate HTTP status code. Since it would be difficult to model all of that with a simple document template, lets add a dynamic handler to our example:

```
./
├── search/
│   ├── default.data/
│   │   ├── default.yml
│   │   ├── no-name.yml
│   ├── results/
│   │   ├── invalid.js
│   │   ├── success.yml
│   ├── default.yml
```

In the `/search/results/` folder, we've defined two files to handle various states, `success.yml` and `invalid.js`. The `success.yml` document (or template) will be handled as we saw in the previous section, resulting in one or more resource states. The `invalid.js` file is our default handler for an invalid state. The contents of `invalid.js` is quite simple:

```js
module.exports = ctx => {
  ctx.response.status = 400;
  
  // Display the original form with an error message.
  ctx.response.template = "../default.yml";
  ctx.response.data = {
    query: {
      state: "invalid",
      message: "Please enter a search term."
    }
  };
};
```

> Note: We could use (req, res) instead of ctx, but I have some use cases in mind where we might want to add something not clearly related to the request or the response.
