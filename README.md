# lynx-docs
The `lynx-docs` repository contains tools for writing Lynx templates in YAML and converting them to other template formats. These tools enable you to model a web server before writing a single line of code in your web server application.

The benefit of modeling your web server before you begin to write the web server application is that you can save a significant amount of time and money by quickly fleshing out your resources and the relationships between them without being required to make changes to every layer of your application architecture.

### Modeling a Web Server

Consider the following folder:

```
./
├── search/
│   ├── default.lynx.yml
```

With the following content in `default.lynx.yml`:
  
```YAML
Hello, World!
```
  
The `/search/` folder represents a search form resource and `default.yml` provides its content.

When `lynx-docs start --root .` is executed, a web server will be started. When a request is made to the URL `/search/`, the web server will respond with a Lynx document representing that resource .

At this point, the `/search/` resource is a static resource. Let's convert it to a dynamic resource with variations.

### Dynamic Resources with Variations

Let's turn the `default.yml` document into a document template so we can begin to model variations:

```YAML
<greeting: Hello, World!
---
```

Now, this document template may represent any number of variations. This template now states that its default value is "Hello, World!" but that value can vary if a variable named `greeting` is provided to the template.

Variations are modeled using data files. The data files are combined with the template to produce content. Data files can be YAML, JSON, or JavaScript files.

To create a variation for this template, add a data file to the `/search/` folder named `default.data.yml`.

```
./
├── search/
│   ├── default.data.yml
│   ├── default.lynx.yml
```

With the following content in `default.data.yml`:

```YAML
<greeting: Hello, Dynamic Resource!
---
```

At this point, the `/search/` resource is a dynamic resource with one variation named "default".

Let's add some more variations to the `/search/` folder:

```
./
├── search/
│   ├── default.data.yml
│   ├── default.long-name.data.yml
│   ├── default.lynx.yml
│   ├── default.short-name.data.yml
```

With the following content in `default.long-name.data.yml`:

```YAML
greeting: Hello, John Jacob Jingleheimer Schmidt!
---
```

And with the following content in `default.short-name.data.yml`:

```YAML
greeting: Hello, John Doe!
---
```

At this point, the `/search/` resource is a dynamic resource with three variations: "default", "default-long-name", and "default-short-name". The variation name is a combination of the template name ("default") and the data file name ("long-name" and "short-name").

When bound to the `default.lynx.yml` document template, each of the data files results in a new document. Since there are three data files, we've now modeled three variations that might be returned when a request is made to the URL `/search/`.

Since our search form resource now has more than one variation, the Lynx Docs web server needs to decide which variation to return when a request is made to the URL `/search/`. Since one of the variations is named "default", the web server will return that variation. The web server also needs to allow the user to select the other variations. To allow the user to do so, the web server will return hyperlinks to the other variations.

> If there is no "default" variation, the web server will return hyperlinks to the variations for the resource.

### Partials

Partials allow you to capture common YAML values in reusable blocks and reference
them from templates or other partials.

To create a partial, place a YAML file in a `_partials` folder somewhere in
the folder ancestry of your template.

> During partial resolution, lynx-docs looks for the referenced partial
in a `_partials` folder in the same folder as the referencing template. 
If it does not find it there, it moves up, until it reaches the current 
working directory, checking for the partial in a `_partials` folder at each 
level. Finally, lynx-docs checks for the partial in its own core `_partials`
folder.
