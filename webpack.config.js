const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path');


const isProduction = process.env.NODE_ENV == "production";


const config = {
    mode: 'development',
    //mode: 'production',
    entry: {
        // jquery: 'jquery',
        // bootstrap: 'bootstrap',
        //"bootstrap-css": 'bootstrap/dist/css/bootstrap.css',

        //utils: './lib/utils.ts',
        // windowlib: './lib/windowlib.ts',
        index: './public/index.html.ts'
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                "css-loader"
            ]
        }, {
            test: /\.(scss)$/,
            use: [{
                // inject CSS to page
                loader: 'style-loader'
            }, {
                // translates CSS into CommonJS modules
                loader: 'css-loader'
            }, {
                // Run postcss actions
                loader: 'postcss-loader',
                options: {
                    // `postcssOptions` is needed for postcss 8.x;
                    // if you use postcss 7.x skip the key
                    postcssOptions: {
                        // postcss plugins, can be exported to postcss.config.js
                        plugins: function() {
                            return [
                                require('autoprefixer')
                            ];
                        }
                    }
                }
            }, {
                // compiles Sass to CSS
                loader: 'sass-loader'
            }]
        }, {
            test: require.resolve("jquery"),
            loader: "expose-loader",
            options: {
                exposes: ["$", "jQuery"],
            },
        }, {
            // 対象となるファイルの拡張子
            test: /\.(gif|png|jpg|svg)$/,
            // 画像をBase64として取り込む
            type: "asset/inline",
        }, {
            test: /\.html$/,
            loader: "html-loader"
        }, ],
    },
    resolve: {
        extensions: [
            '.ts', '.js', '.scss',
        ],
    },
    target: ["web", "es5"],
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
            // bootstrap: "bootstrap",
        }),
        new HtmlWebpackPlugin({
            template: "./public/index.ejs",
            scriptLoading: 'defer',
            inject: false
        })
    ],
    optimization: {
        splitChunks: {
            // name: "vendor",
            chunks: 'initial',
        }
    },
    performance: {
        maxEntrypointSize: Infinity,
        maxAssetSize: Infinity
    },
}

module.exports = () => {
    if (isProduction) {
        config.mode = "production";
    } else {
        config.mode = "development";
        config.devtool = "source-map";
    }
    return config;
};