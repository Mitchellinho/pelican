const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const zlib = require("zlib");
const zopfli = require("@gfx/zopfli");
const glob = require("glob");
const crypto = require('crypto');
const fs = require('fs');

let hash = crypto.createHash("sha256")
    .update(Buffer.concat(glob.sync("./src/i18n/**/*.json").map(filename => fs.readFileSync(filename))))
    .digest("hex")
    .substring(0, 16);

module.exports = {
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "i18n/**/*",
                    to: `${hash}/[path][name][ext]`,
                    context: "src/",
                    transform: input => {
                        // minify language files
                        return new Buffer.from(JSON.stringify(JSON.parse(input.toString())))
                    },
                },
                {
                    from: "assets/**/*",
                    to: `[path][name][ext]`,
                    context: "src/",
                },
                {
                    from: "*favicon*",
                    to: `[path][name][ext]`,
                    context: "src/",
                },
            ],
        }),
        new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: zopfli.gzip,
            compressionOptions: {
                numiterations: 15,
            },
            minRatio: 0.8,
            deleteOriginalAssets: false,
        }),
        new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            compressionOptions: {
                params: {
                    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
                },
            },
            minRatio: 0.8,
            deleteOriginalAssets: false,
        }),
        new webpack.DefinePlugin({
            "window.ALPHA_URL": JSON.stringify(process.env["ALPHA_URL"]),
            "window.LANGUAGE_HASH": JSON.stringify(hash),
        })
    ]
};
