import type { Configuration } from 'webpack';

module.exports = {
  entry: { 
    background: { import: 'src/extension/background.ts', runtime: false } ,
    "black-list/black-list-search-page": { import: 'src/extension/black-list/black-list-search-page.ts', runtime: false },
    "black-list/black-list-storage": { import: 'src/extension/black-list/black-list-storage.ts', runtime: false },
  },
} as Configuration;