const path = require("path");
const cssNext = require("postcss-cssnext");
const cssImport = require("postcss-import");
const cssNano = require("cssnano");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const fs = require("fs");
const express = require("express");
const publicPath = path.join(process.cwd(), "public");
const buildPath = path.join(process.cwd(), "build");
const distPath = path.join(process.cwd(), "dist");

const htmlMinOptions = {
  collapseWhitespace: true,
  sortAttributes: true,
  sortClassName: true
};

const babelrc = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../.babelrc"))
);

const isDev = process.env.NODE_ENV === "development";

const config = {
  context: __dirname,
  entry: "TO BE REPLACED",
  devtool: isDev ? "cheap-eval-source-map" : false,
  output: {
    path: path.join(process.cwd(), "build/dist"),
    filename: "bundle.js",
    publicPath: "/dist/"
  },
  devServer: {
    contentBase: distPath,
    publicPath: "/dist/",
    historyApiFallback: true,
    before(app) {
      app.use("/public", express.static(publicPath));
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
  plugins: [
    new ExtractTextPlugin("style.css"),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    }),
    new HtmlWebpackPlugin({
      inject: false,
      template: "../index.ejs",
      title: "SFO",
      filename: "../index.html",
      minify: isDev ? false : htmlMinOptions
    })
  ],
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

if (!isDev) {
  config.plugins.push(
    new CleanWebpackPlugin(["./build"], {
      verbose: true,
      dry: false,
      root: process.cwd()
    }),
    new UglifyJSPlugin(),
    new CopyPlugin([{ from: publicPath, to: path.join(buildPath, "public") }])
  );
}

module.exports = config;
