# PlivoWebSDK

A pure javascript webRTC-SIP library

## Getting Started

* [Documentation](https://www.plivo.com/docs/sdk/web/)
* [Example App Repo](https://github.com/plivo/plivo-websdk-2.0-example)
* [Hosted App Link](https://s3.amazonaws.com/plivobrowsersdk/v2/example.html)

## Installation

### NPM

```npm install plivo-browser-sdk --save```

#### Usage:

```const Plivo = require('plivo-browser-sdk');```

or

```import Plivo from 'plivo-browser-sdk'```
 
### CDN

```html
<script type="text/javascript" src="https://cdn.plivo.com/sdk/browser/v2/plivo.min.js"></script>
```

## Setup Development Environment

### Install dependencies

`npm install`

### Build

`npm run build`

Minified, production-ready build is created at `dist/plivowebsdk.min.js`

`npm run build:nominify`

A non-minified version of the build file is created `dist/plivowebsdk.js`

### Start development server

`npm start`

This builds the SDK file and attaches it to the port 9000 - `http://localhost:9000/plivowebsdk.js`

This uses [webpack-dev-server](https://github.com/webpack/webpack-dev-server) so, when there is a change in any file, the build file is auto build,
When this is used in [plivo-websdk-2.0-example](https://github.com/plivo/plivo-websdk-2.0-example), the app will auto reload with the build with latest changes

## Testing

### Unit tests

There is no extra setup required for running unit tests. You can run unit tests using:

`npm run test:unit`

### Integration tests

Running integration tests require some setup:
* Replace master and slave user login details in [spec.js](https://github.com/plivo/plivo-websdk-2.0/blob/master/test/spec.js)

After the setup, you can run integration tests using:

`npm run test:integration`
