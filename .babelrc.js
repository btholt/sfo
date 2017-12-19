const presets = [
  "@babel/preset-flow",
  [
    "@babel/preset-env",
    {
      "targets": {
        "browsers": "last 2 versions"
      },
      "loose": true,
      "modules": false
    }
  ]
];

const plugins = [
  "@babel/plugin-syntax-jsx",
  "@babel/plugin-transform-react-jsx",
  "@babel/plugin-proposal-class-properties"
];

module.exports = {
  presets,
  plugins

  env: {
    server: {
      plugins: ["@babel/transform-modules-commonjs"]
    },
    test: {
      plugins: ["@babel/transform-modules-commonjs"]
    }
  }
}
