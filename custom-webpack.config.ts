import type { Configuration } from 'webpack';

const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: { 
    background: { import: 'src/extension/background.ts', runtime: false },
    "black-list/channel/black-list-channel": { import: 'src/extension/black-list/channel/black-list-channel.ts', runtime: false },
    "black-list/video/black-list-video": { import: 'src/extension/black-list/video/black-list-video.ts', runtime: false },
    "black-list/search-page/black-list-search-page": { import: 'src/extension/black-list/search-page/black-list-search-page.ts', runtime: false },
    "black-list/search-page/black-list-script-manipulations": { import: 'src/extension/black-list/search-page/black-list-script-manipulations.ts', runtime: false },
    "black-list/search-page/black-list-script-mutations": { import: 'src/extension/black-list/search-page/black-list-script-mutations.ts', runtime: false },
    "black-list/common/black-list-remove-prohibitive-element": { import: 'src/extension/black-list/common/black-list-remove-prohibitive-element.ts', runtime: false },
    "black-list/button/black-list-button": { import: 'src/extension/black-list/button/black-list-button.ts', runtime: false },
    "black-list/black-list-heartbeat": { import: 'src/extension/black-list/black-list-heartbeat.ts', runtime: false },
  },
  plugins:[
    new CopyPlugin({
      patterns: [
        {from: "assets", to: "assets"},
        {from: "styles", to: "styles"},
      ]
    })
  ]
} as Configuration;