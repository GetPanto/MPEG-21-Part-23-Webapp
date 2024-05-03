module.exports = {
  port: 8022, //process.env.PORT,
  files: ['archive/src/**/*.{html,htm,css,js,ttl}'],
  server: {
    baseDir: ['archive/src'],
  },
  ghostMode: false,
  open: false,
};
