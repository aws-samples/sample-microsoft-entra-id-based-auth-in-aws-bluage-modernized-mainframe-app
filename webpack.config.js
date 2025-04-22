// Webpack configuration file

module.exports = {
  resolve: {
    fallback: { "url": require.resolve("url/") }
  }
};
