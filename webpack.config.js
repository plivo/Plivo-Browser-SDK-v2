const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const CreateFileWebpack = require('create-file-webpack')
const package = require("./package");
const version = package.version;

module.exports = (env) => {
  const plugins = [
    new webpack.BannerPlugin(fs.readFileSync("./LICENSE", "utf8")),
    new webpack.EnvironmentPlugin({
      PLIVO_ENV: env.PLIVO_ENV,
    }),
    // new CreateFileWebpack({
    //   // path to folder in which the file will be created
    //   path: './dist',
    //   // file name
    //   fileName: 'hash.json',
    //   // content of the file
    //   content: '{"version": "'+ version +'", "hash": "hash"}'
    // })
  ];
  if (env.production) {
    plugins.push(new DtsBundlePlugin());
    plugins.push(function () {
      this.hooks.afterEmit.tap("IncludeHashPlugin", (stats) => {
        var replaceInFile = function (filePath, toReplace, replacement) {
          var str;
          try {
            str = fs.readFileSync(filePath, "utf8");
          } catch (e) {
            console.log("error during replace", e);
          }
          var out = str.replace(new RegExp(toReplace, "g"), replacement);
          fs.writeFileSync(filePath, out);
        };
        var hash = stats.hash;
        replaceInFile(
          path.join(
            path.join(path.resolve(__dirname, "dist"), "plivobrowsersdk.min.js")
          ),
          "sdk_signature",
          hash
        );
      });
    });

    plugins.push(function () {
      this.hooks.afterEmit.tap("IncludeHashPlugin", (stats) => {
        fs.appendFile(
          path.join(
            path.join(path.resolve(__dirname, "dist"), "hash.json")
          ),
          '{"'+ version +'": "'+ stats.hash +'"}',
          () => {}
        )
      });
    });
  }
  if (env.development) plugins.push(new webpack.NamedModulesPlugin());
  return {
    mode:
      env.development || env.nominify || env.npm ? "development" : "production",
    entry: env.npm
      ? ["./lib/index.ts"]
      : ["./lib/stats/callstatsio.js", "./lib/index.ts"],
    devtool:
      env.development || env.nominify ? "eval" : env.npm ? "none" : false,
    node: {
      console: false,
      fs: "empty",
      net: "empty",
      tls: "empty",
      child_process: "empty",
      module: "empty",
    },
    module: {
      rules: [
        !env.npm
          ? {
              test: path.resolve(__dirname, "./lib/stats/callstatsio.js"),
              use: ["script-loader"],
            }
          : {},
        {
          test: /\.ts$/,
          loader: "string-replace-loader",
          options: {
            multiple: [
              // { search: 'require.*debug.*JsSIP', replace: "require('debug')('JsSIP", flags: 'g' },
              { search: 'jssip_id', replace: 'plivosip_id', flags: 'g' },
              { search: '"version.*.3.0.*"', replace: `"version": ${version}"`, flags: 'g' },
              { search: 'PLIVO_LIB_VERSION', replace: version, flags: 'g' },
              { search: 'this.useColors', replace: 'window._PlivoUseColorLog', flags: 'g' },
              { search: 'shimCreateObjectURL: .* {', replace: 'shimCreateObjectURL: function() { \n if(true)return;', flags: 'g' },
            ],
          },
        },
        // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
        { test: /\.ts?$/, loader: "awesome-typescript-loader" },

        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        { test: /\.js$/, loader: "source-map-loader" },
        {
          test: /.node$/,
          loader: "node-loader",
        },
      ],
    },
    output: env.npm
      ? {
          filename: "plivobrowsersdk.js",
          path: path.resolve(__dirname, "dist"),
          library: "Plivo",
          libraryTarget: "umd",
        }
      : {
          filename:
            env.production && !env.nominify
              ? "plivobrowsersdk.min.js"
              : "plivobrowsersdk.js",
          path: path.resolve(__dirname, "dist"),
          library: "Plivo",
        },
    watch: !env.production,
    plugins: plugins,
    devServer: env.development
      ? {
          contentBase: path.join(__dirname, "dist"),
          compress: true,
          port: 9000,
        }
      : {},
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
            },
          },
        }),
      ],
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
    },
  };
};

function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function (compiler) {
  compiler.plugin("done", function () {
    var dts = require("dts-bundle");

    dts.bundle({
      name: 'plivo-browser-sdk',
      main: 'types/lib/index.d.ts',
      out: '../../index.d.ts',
      outputAsModuleFolder: false
    });
  });
};
