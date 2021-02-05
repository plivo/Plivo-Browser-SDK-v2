# Plivo-BrowserSDK-v2

## Introduction

The Plivo BrowserSDK codebase wraps the functions of BrowserSDK as an ES module. To get started, see the [SDK overview](https://www.plivo.com/docs/sdk/client/browser/overview) and [SDK reference](https://www.plivo.com/docs/sdk/client/browser/reference/) docs. For release notes, see the [Changelog](https://www.plivo.com/docs/sdk/client/browser/changelog/).

## Installation

### NPM

You can include the [Plivo-Browser-SDK](https://www.npmjs.com/package/plivo-browser-sdk) NPM package as a dependency in your project. To do this, use the command

```shell
npm install plivo-browser-sdk --save 
```

### Usage

You can import BrowserSDK using ES module or TypeScript syntax

```javascript
import Plivo from 'plivo-browser-sdk'
```

or using commonJS

```javascript
const Plivo = require('plivo-browser-sdk');
```

### CDN

You can also include the Plivo JavaScript file shown below directly on your webpage if you don&#39;t want to include the package as a dependency.

```javascript
<script type="text/javascript" src="https://cdn.plivo.com/sdk/browser/v2/plivo.min.js"></script>
```

## TypeScript Support

This BrowserSDK package includes TypeScript declarations for Plivo BrowserSDK. We support projects using TypeScript versions &gt;= 4.0.3. Read more about the benefits of TypeScript support in [this FAQ](https://support.plivo.com/hc/en-us/articles/360055776291).

## Set Up Development Environment

### Install dependencies

```shell
npm install
```

### Build

You can create a minified or non-minified build:

```shell
npm run build
```

This command creates a minified, production-ready build at dist/plivobrowsersdk.min.js.

```shell
npm run build:nominify
```

This command creates a non-minified version of the build file at dist/plivobrowsersdk.js.

### Start the development server

```shell
npm start
```

This command builds the SDK file and attaches it to port 9000 — http://localhost:9000/plivobrowsersdk.js. The project uses a [webpack-dev-server](https://github.com/webpack/webpack-dev-server) that helps with live reloading. Whenever there is a change in any file, it auto builds.

If you use this server in [plivo-browser-sdk2-examples](https://github.com/plivo/plivo-browser-sdk2-examples), the app will auto-reload the build with the latest changes.

## Testing

### Unit tests

No extra setup is required for running unit tests. You can run unit tests with the command

```shell
npm run test:unit
```

### Integration tests

Running integration tests requires some setup:

- To perform test calls, you need two users. Create a .env file in the root directory of this repository and update it with primary and secondary user details as below:

```shell
PLIVO_ENDPOINT1_USERNAME=<Endpoint-1 Username>
PLIVO_ENDPOINT1_PASSWORD=<Endpoint-1 Password>
PLIVO_ENDPOINT2_USERNAME=<Endpoint-2 Username>
PLIVO_ENDPOINT2_PASSWORD=<Endpoint-2 Password>
```

- After the setup, you can run integration tests by running the command

```shell
npm run test:integration
```

## License

See [LICENSE](https://github.com/plivo/Plivo-Browser-SDK-v2/blob/master/LICENSE)