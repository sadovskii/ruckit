import type { Configuration } from 'webpack';

const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: { 
    background: { import: 'src/extension/background.ts', runtime: false } ,
    "black-list/black-list-search-page": { import: 'src/extension/black-list/black-list-search-page.ts', runtime: false },
    "black-list/black-list-storage": { import: 'src/extension/black-list/black-list-storage.ts', runtime: false },
  },
  plugins:[
    new CopyPlugin({
      patterns: [
        {from: "assets", to: "assets"},
      ]
    })
  ]
} as Configuration;