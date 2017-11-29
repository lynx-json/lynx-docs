# @lynx-json/lynx-docs

[![Build Status](https://travis-ci.org/lynx-json/lynx-docs.svg?branch=master)](https://travis-ci.org/lynx-json/lynx-docs)

## Installation

`npm install -g @lynx-json/lynx-docs`

## Starting the server

`lynx-docs start --root ./templates`

Use `lynx-docs --help` to get help or review [command line parameters reference](https://github.com/lynx-json/lynx-docs/wiki/Command-Line-Parameters)

## Origin

lynx-docs is an [NPM package](https://www.npmjs.com/package/@lynx-json/lynx-docs) we made to help us with the following:

* Writing templates for [Lynx documents](http://lynx-json.org/specification/) (or any JSON document) using a [specific YAML syntax](https://github.com/lynx-json/lynx-docs/wiki/dynamic-content).
* Exporting those templates to another template format via the [`export` command](https://github.com/lynx-json/lynx-docs/wiki/Command-Line-Parameters#export-command-parameters) (currently we only support exporting the YAML templates to Handlebars).
* Viewing those templates in a web browser via the [`start` command](https://github.com/lynx-json/lynx-docs/wiki/Command-Line-Parameters#start-command-parameters).

## Benefits

* a better templating language for JSON templates - we didn't find a templating language that worked well with JSON, so we made our own on top of YAML.
* a pre-built web server - verify your static files, templates, forms, and links before you begin to write your real web app.

## Docs and Community

- lynx-docs [wiki](./wiki)
- application/lynx+json [media type specification](http://lynx-json.org/specification/)

## Quick start

Coming soon