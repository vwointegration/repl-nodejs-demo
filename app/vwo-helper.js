let vwoHelper = {
  set: (key, data) => {
    vwoHelper[key] = data;
  },
  get: key => {
    return vwoHelper[key];
  }
};

module.exports = vwoHelper;
