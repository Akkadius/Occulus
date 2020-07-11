module.exports = {
  isWindows: () => {
    return process.platform === 'win32';
  },
  isLinux: () => {
    return process.platform === 'linux';
  }
};
