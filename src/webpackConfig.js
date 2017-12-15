const path = require("path");
const url = require("url");
const cssNext = require("postcss-cssnext");
const cssImport = require("postcss-import");
const cssNano = require("cssnano");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlHarddiskPlugin = require("html-webpack-harddisk-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const cleanup = require("node-cleanup");
const webpack = require("webpack");
const fs = require("fs");
const _ = require("lodash");
const rimraf = require("rimraf");
const chalk = require("chalk");
const express = require("express");
const publicPath = path.join(process.cwd(), "public");
const buildPath = path.join(process.cwd(), "build");
const distPath = path.join(process.cwd(), "dist");
const pathsToCheck = {
  babel: path.join(process.cwd(), ".babelrc"),
  html: path.join(process.cwd(), "index.html"),
  public: path.join(process.cwd(), "public/")
};
const isDev = process.env.NODE_ENV === "development";
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
let indexFile;
const loadingFile = fs.readFileSync(path.join(__dirname, "loading.html"));

const htmlMinOptions = {
  collapseWhitespace: true,
  sortAttributes: true,
  sortClassName: true
};

const indexHtmlExists = fs.existsSync(pathsToCheck.html);
const htmlOptions = indexHtmlExists
  ? {
      inject: true,
      template: pathsToCheck.html,
      filename: isDev ? "../../.tmp/index.html" : "../index.html",
      minify: isDev ? false : htmlMinOptions,
      alwaysWriteToDisk: true,
      inlineSource: "sfo-client-dev.js$",
      title: "sfo"
    }
  : {
      inject: false,
      template: "../index.ejs",
      filename: isDev ? "../../.tmp/index.html" : "../index.html",
      minify: isDev ? false : htmlMinOptions,
      alwaysWriteToDisk: true,
      title: "sfo"
    };
// get configs
const babelConfig = fs.existsSync(pathsToCheck.babel)
  ? {
      babelrc: true
    }
  : require("./generate-babel-config");

const eslintLoader = {
  enforce: "pre",
  test: /\.jsx?$/,
  loader: "eslint-loader",
  exclude: /node_modules/,
  options: {
    configFile: path.resolve(__dirname, "../.eslintrc.json")
  }
};

let servedFromPath = "/";
if (!isDev) {
  const packageBuffer = fs.readFileSync(
    path.join(process.cwd(), "package.json")
  );
  if (packageBuffer) {
    try {
      const packageJson = JSON.parse(packageBuffer);
      servedFromPath = _.get(packageJson, "homepage", servedFromPath);
    } catch (e) {}
  }
}

const sizeAnalysisPlugin = new BundleAnalyzerPlugin({
  defaultSizes: "gzip"
});

const config = {
  context: __dirname,
  entry: "TO BE REPLACED",
  devtool: isDev ? "cheap-eval-source-map" : false,
  output: {
    path: path.join(process.cwd(), "build/dist"),
    filename: "bundle.js",
    publicPath: url.resolve(servedFromPath, "dist/")
  },
  devServer: {
    contentBase: distPath,
    publicPath: "/dist/",
    historyApiFallback: true,
    before(app) {
      app.use("/public", express.static(publicPath));
      app.get(/^(?!\/(public|dist)\/.*)/gi, function(req, res) {
        if (!indexFile) {
          fs.readFile(
            path.join(process.cwd(), ".tmp/index.html"),
            (err, file) => {
              if (err) {
                console.log(
                  chalk.red(
                    "received request before index.html was ready, page will automatically try again"
                  )
                );
                console.error(err);
                res.status(500).end(loadingFile);
              } else {
                indexFile = file.toString();
                res.end(indexFile);
              }
            }
          );
        } else {
          res.end(indexFile);
        }
      });
    }
  },
  resolve: {
    extensions: [".js", ".jsx", ".vue", ".json"],
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
  resolveLoader: {
    alias: {
      "buble-loader": path.dirname(
        require.resolve("buble-loader/package.json")
      ),
      "css-loader": path.dirname(require.resolve("css-loader/package.json")),
      "vue-style-loader": path.dirname(
        require.resolve("vue-style-loader/package.json")
      )
    }
  },
  stats: {
    colors: true,
    reasons: true,
    chunks: true
  },
  plugins: [
    new ExtractTextPlugin("style.css"),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
  ],
  module: {
    rules: [
      {
        test: /\.vue?$/,
        loader: require.resolve("vue-loader"),
        options: {
          loaders: {
            js: "buble-loader"
          },
          extractCSS: true
        }
      },
      {
        test: /\.jsx?$/,
        loader: require.resolve("babel-loader"),
        options: babelConfig
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
                cssNext({ warnForDuplicates: false }),
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
    new UglifyJSPlugin()
  );

  if (fs.existsSync(pathsToCheck.public)) {
    config.plugins.push(
      new CopyPlugin([{ from: publicPath, to: path.join(buildPath, "public") }])
    );
  }
} else {
  if (indexHtmlExists) {
    config.plugins.push(new HtmlWebpackInlineSourcePlugin());
  }
}

cleanup(
  function(exitCode, signal) {
    rimraf(path.join(process.cwd(), ".tmp"), () => {
      process.kill(process.pid, signal);
    });
    cleanup.uninstall();
    return false;
  },
  {
    ctrl_C: "{^C}",
    uncaughtException: "Uh oh. Look what happened:"
  }
);

module.exports = (entry, options) => {
  if (indexHtmlExists && isDev) {
    config.entry = [path.join(__dirname, "sfo-client-dev.js"), entry];
  } else {
    config.entry = entry;
  }

  if (!options.noEslint) {
    config.module.rules.push(eslintLoader);
  }

  if (options.isSizeAnalysis) {
    config.plugins.push(sizeAnalysisPlugin);
  }

  if (options.title) {
    htmlOptions.title = options.title;
  }

  config.plugins.push(
    new HtmlWebpackPlugin(htmlOptions),
    new HtmlHarddiskPlugin()
  );

  return config;
};
