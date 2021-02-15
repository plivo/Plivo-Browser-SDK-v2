const env = require('./env');
module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'browserify', 'sinon'],
        files: [
            'lib/**',
            'test/integration/*.js'
        ],
        preprocessors: {
            'test/integration/*.js': [ 'browserify' ],
            'lib/**': [ 'browserify' ],
        },
        browserify: {
            transform: [ ["envify", env], [["babelify", { extensions: [ '.ts', '.js' ]}]] ],
            plugin: [ ["tsify",{target: 'es6'}] ]
        },
        reporters: ['progress', 'mocha'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_DEBUG,
        autoWatch: false,
        concurrency: 1,
        customLaunchers: {
            ChromeWebRTC: {
                base: 'ChromeHeadless',
                flags: [
                    '--use-fake-device-for-media-stream',
                    '--use-fake-ui-for-media-stream',
                    '--enable-blink-features=RTCRtpSender'
                ]
            },
        },
        client: {
            mocha: {
                timeout: '60000'
            },
            captureConsole: true
        },
        captureTimeout: 210000,
        browserDisconnectTolerance: 3,
        // browserDisconnectTimeout : 210000,
        browserNoActivityTimeout : 210000,
    })
}
