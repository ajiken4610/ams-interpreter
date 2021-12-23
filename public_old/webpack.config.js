var webpack = require('webpack');
module.exports = {
    // ...
    mode: "development",
    entry: {
        main: './'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default']
        })
    ],
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist',
    },
    resolve: {
        fallback: {
            http: false,
            https: false,
            stream: false,
            string_decoder: false,
            assert: false
        }
    },
    target: 'node'
}