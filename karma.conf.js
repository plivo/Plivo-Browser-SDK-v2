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
            debug: true,
            transform: [ ["envify", env], [["babelify", { extensions: [ '.ts', '.js' ]}]] ],
            plugin: [ ["tsify",{target: 'es6'}] ]
        },
        reporters: ['progress', 'html'],
        htmlReporter: {
            outputDir: 'report', // where to put the reports 
            templatePath: null, // set if you moved jasmine_template.html
            focusOnFailures: false, // reports show failures on start
            namedFiles: false, // name files instead of creating sub-directories
            pageTitle: null, // page title for reports; browser info by default
            urlFriendlyName: false, // simply replaces spaces with _ for files/dirs
            reportName: 'integrations', // report summary filename; browser info by default
            
            
            // experimental
            preserveDescribeNesting: false, // folded suites stay folded 
            foldAll: false, // reports start folded (only with preserveDescribeNesting)
        },
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
                    '--enable-blink-features=RTCRtpSender', 
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]
            },
        },
        client: {
            captureConsole: true,
            mocha: {
                timeout: '60000'
            },
            captureConsole: true
        },
        captureTimeout: 210000,
        browserDisconnectTolerance: 5,
        browserDisconnectTimeout : 10000,
        browserNoActivityTimeout : 210000,
        restartOnFileChange: true
    })
}
