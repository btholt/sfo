const path = require("path");
const cssNext = require("postcss-cssnext");
const cssImport = require("postcss-import");
const cssNano = require("cssnano");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const FlowtypePlugin = require("flowtype-loader/plugin");
const webpack = require("webpack");
const fs = require("fs");
const indexFile = fs.readFileSync(path.resolve(__dirname, "../index.html"));

const babelrc = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../.babelrc"))
);

const isDev = process.env.NODE_ENV === "development";

const config = {
  context: __dirname,
  entry: "TO BE REPLACED",
  devtool: isDev ? "cheap-eval-source-map" : false,
  output: {
    path: path.resolve(process.cwd(), "public"),
    filename: "bundle.js",
    publicPath: "/public/"
  },
  devServer: {
    contentBase: path.resolve(process.cwd(), "public"),
    publicPath: "/public/",
    // historyApiFallback: true,
    before(app) {
      app.get(/^(?!\/public\/.*)/gi, function(req, res) {
        res.end(indexFile);
      });
    }
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
    modules: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(process.cwd(), "node_modules")
    ],
    alias: {
      "babel-runtime": path.dirname(
        require.resolve("babel-runtime/package.json")
      )
    }
  },
  stats: {
    colors: true,
    reasons: true,
    chunks: false
  },
  plugins: [new FlowtypePlugin(), new ExtractTextPlugin("style.css")],
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.jsx?$/,
        loader: "eslint-loader",
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, "../.eslintrc.json")
        }
      },
      {
        enforce: "pre",
        test: /\.jsx?$/,
        loader: "flowtype-loader"
      },
      {
        test: /\.jsx?$/,
        loader: require.resolve("babel-loader"),
        options: {
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
            require.resolve("babel-plugin-transform-react-jsx"),
            require.resolve("babel-plugin-transform-class-properties")
          ]
          // cacheDirectory: true
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: {
            loader: "postcss-loader",
            options: {
              plugins: () => [
                cssImport({ addDependencyTo: webpack }),
                cssNext(),
                cssNano()
              ],
              sourceMap: isDev ? "inline" : false
            }
          }
        })
      }
    ]
  }
};

module.exports = config;
