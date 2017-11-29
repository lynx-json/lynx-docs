# @lynx-json/lynx-docs

[![Build Status](https://travis-ci.org/lynx-json/lynx-docs.svg?branch=master)](https://travis-ci.org/lynx-json/lynx-docs)

## Installation

`npm install -g @lynx-json/lynx-docs`

## Starting the server

`lynx-docs start --root ./templates`

Use `lynx-docs --help` to get help or review [command line parameters reference](https://github.com/lynx-json/lynx-docs/wiki/Command-Line-Parameters)

## Philosophy

Lynx ([application/lynx+json](http://lynx-json.org/specification/)) is a hypertext media type that was created to fit a perceived space between data formats with no connections (.json, .xml, etc.) and display formats (HTML, iOS, Android, etc.). A primary goal of Lynx is to separate process (hypertext) and information (data, metadata) from display, thereby allowing different display contexts (web, mobile, desktop, other) to present the information in a way appropriate for that medium. The separation further allows for the process and information to change separately from the display.

lynx-docs assists in creating application/lynx+json documents, the various states of those documents, and the connections between them.

## Features
- Model and understand an entire application before incurring the cost of building a dynamic server or integrating back-end systems.
- Create templates and mock data that results in documents users will interact with using ONLY the file system.
- Create multiple mock data sources for each template to understand all states of an application.
- Move quickly to the dynamic application.
  - Templates are exported and used directly on a dynamic server ... no translation. Design artifacts are run-time artifacts.
  - Mock data identifies data requirements the dynamic server needs to fulfill. 
- Cheaply, quickly, and easily experiment with different application flows.

## Docs and Community

- lynx-docs [wiki](./wiki)
- application/lynx+json [media type specification](http://lynx-json.org/specification/)

## Quick start

Coming soon