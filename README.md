![](./src/images/sm_ext128.png)

# Shadowmute Browser Extensions
Browser extensions for [Shadowmute](https://shadowmute.com) Identity-as-a-Service.


[![GitHub license](https://img.shields.io/github/license/SrsBiznas/shadowmute-browser-extensions)](LICENSE)

## Getting Started

### Prerequisites

* yarn

### Environment Variables

* `ENV` : This can be `prod` or `dev`. This will default to `dev`
* `AUTH_SERVER` : This is the location of the OAuth server for generating authentication tokens.
* `API_SERVER` : This is the location of the extension API server.
* `CLIENT_ID` : The extension client ID.

### Building

The following commands are supported:

* `firefox` : Build the Firefox browser extension
* `chrome` : Build the Chrome browser extension
* `release` : Build both the Firefox and Chrome extension in `prod` mode
  * The `release` command requires the following environment variables to be set: `CHROME_CLIENT_ID`, `FIREFOX_CLIENT_ID`

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](./LICENSE) file for details

## Acknowledgements

### Fonts

The following fonts are included in this browser extension:

* Gidole
  * http://gidole.github.io/
  * https://github.com/larsenwork/Gidole
* SpecialElite
  * http://www.astigmatic.com
  * https://fonts.google.com/specimen/Special+Elite
