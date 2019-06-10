var path = require('path');

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
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
};
