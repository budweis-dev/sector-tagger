// webpack.config.js

const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'sector-tagger.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'SectorTagger', 
    libraryTarget: 'umd', 
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
