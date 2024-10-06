// webpack.config.js

const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'sector-tagger.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'SectorTagger', // Umožní přístup k třídám z globálního scope
    libraryTarget: 'umd', // UMD formát pro podporu AMD, CommonJS a globálního scope
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'], // Načítání CSS
      },
    ],
  },
};
