var path = require('path');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['./src/'],
        alias: {
          lodash: path.resolve(__dirname, 'node_modules/lodash'),
        },
      },
    ],
  ],
};
