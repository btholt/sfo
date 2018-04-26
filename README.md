# Deprecated

This library was a ton of fun to create and I think had a pretty good developer experience. However I don't have the time or the use case anymore to devote to curating an ongoing great experience around it. In light of that, I'd say [Parcel](http://parceljs.org/) achieves the same goals that sfo aspired to. Highly recommended!

<h1 align="center">sfo</h1> <br>
<p align="center">
    <img alt="kick-ass-logo-eventually" title="Placeholder" src="https://drive.google.com/uc?id=1eNNthq-OAURyRVIdBj3D-Qh3ow5y7dWL" width="150">
</p>

<p align="center">
  Your build process within a single command
</p>

## Table of Contents

* [Introduction](#introduction)
* [How to use](#use)
* [Commands](#commands)
* [Future](#future)

## Introduction

A build process in a command. Just run:

`npx sfo dev <your entry file>`

and SFO takes care of spinning up a build process and dev server for you!

If you don't want to use npx, run:

`npm install --global sfo` then run

`sfo dev <your entry file>`.

But you say you use Angular/Ember/Vue/React etc...No problem. sfo with work with your framework of choice.

## What am I getting?

* Webpack
* Babel
  * preset-env
  * Flow annotation removal
  * JSX
* Importable CSS which is run through PostCSS
  * cssnano
  * postcss-import
  * cssnext
* ESLint with rules for Flow, Airbnb, and Prettier
* vue-loader with buble for Vue users (doesn't affect you if you don't use `.vue` files.)

## Use

In your entry file, just export a default function that accepts a DOM node. It's then up to you to render whatever you want to the DOM!

## React Example

```es6
import React from 'react';
import { render } from 'react-dom';
import './my-styles.css';

const App = () => <h1>Hello World!</h1>;

export default function (node) {
  render(<App />, node);
}
```

## Commands

* `sfo dev <entry file>` - Runs the dev process with nice debugging features.
* `sfo bundle <entry file>` - Outputs a production build to the `./build` directory. You can take this and then deploy it easily.
* `sfo size <entry file>` - Get a nice visualization of your production bundle to see where you can cut down on file size.

## Flags

* `--no-eslint` - Run sfo without the Airbnb eslint rules

## Shadowing

Sometimes you need a bit more customization than sfo initially allows. sfo has a "shadowing" feature that if it detects that you have your own configuration for one of the tools, it'll use your config instead of its own. Shadowing works for the following:

* `./index.html` - sfo has its own index.html that it uses for your default page but it will use your index.html if it finds it. sfo will smartly inject the built CSS and JS so you don't have to worry about those. Its only requirement is that you have a `#root` element somewhere that it provide that element to the exported function.
* `./.babelrc` - If you have a different config for Babel than what's provided then it will use that. For now, only `./.babelrc` works and other locations of Babel configs (like package.json) don't work.

Due to how ESLint loads plugins, it cannot be shadowed. Use `--no-eslint` for now instead.

## This isn't very configurable.

Feature-not-a-bug.

## Future

Lots to do here. This is just the start and we would love your feedback and help to make it happen. Look at the issues if you want to see my roadmap.
