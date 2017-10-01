#!/usr/bin/env node
const DevServer = require("webpack-dev-server");
const webpack = require("webpack");
const path = require("path");
const webpackConfig = require("./src/webpackConfig");
const _ = require("lodash");
const fs = require("fs");
const tmp = require("tmp");

const tempDir = path.resolve(process.cwd(), ".tmp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const entry = path.resolve(process.cwd(), process.argv[2]);
const templateString = fs.readFileSync(
  path.resolve(__dirname, "./src/client.js")
);
const tempPath = path.resolve(tempDir, "webpackEntry.js");
const templatedEntry = _.template(templateString)({
  USER_FN: path.relative(tempDir, entry)
});
fs.writeFileSync(tempPath, templatedEntry);

webpackConfig.entry = tempPath;

const compiler = webpack(webpackConfig);

const server = new DevServer(compiler, webpackConfig.devServer);

server.listen(8080, "127.0.0.1", () => {
  console.log("Starting server on http://localhost:8080");
});
