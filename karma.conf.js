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
        reporters: ['progress', 'mocha', 'junit'],
        junitReporter: {
            outputDir: 'reports', // results will be saved as $outputDir/$browserName.xml
            outputFile: 'integrationTests.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
            suite: '', // suite will become the package name attribute in xml testsuite element
            useBrowserName: false, // add browser name to report and classes names
            nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
            classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
            properties: {}, // key value pair of properties to add to the <properties> section of the report
            xmlVersion: null // use '1' if reporting to be per SonarQube 6.2 XML format
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
