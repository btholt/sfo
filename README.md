# sfo

## What is it?

A build process in a command. Just run `npx sfo <your entry file>` and SFO takes care of spinning up a build process and dev server for you!

## Use

In your entry file, just export a default function that accepts a DOM node. It's then up to you to render whatever you want to the DOM!

## Is this tied to React/Angular/D3/Ember/etc.

Nope! It works without whatever you want!

## Example

```es6
import React from 'react';
import { render } from 'react-dom;
import './my-styles.css';

const App = () => <h1>Hello World!</h1>;

export default function (node) {
  render(<App />, node);
}
```

## What am I getting?

- Webpack
- Babel
  - preset-env
  - Flow annotation removal
  - JSX
- Importable CSS which is run through PostCSS
  - cssnano
  - postcss-import
  - cssnext
- Flow
- ESLint with rules for Flow, Airbnb, and Prettier

## This isn't very configurable.

Feature-not-a-bug.

## Future

Lots to do here. This is just the start.
