module.exports = {
  babelrc: false,
  presets: [
    require.resolve("babel-preset-flow"),
    [
      require.resolve("babel-preset-env"),
      {
        targets: {
          browsers: "last 2 versions"
        },
        loose: true,
        modules: false
      }
    ]
  ],
  plugins: [
    require.resolve("babel-plugin-syntax-jsx"),
    require.resolve("babel-plugin-syntax-dynamic-import"),
    require.resolve("babel-plugin-transform-react-jsx"),
    require.resolve("babel-plugin-transform-class-properties")
  ]
};
