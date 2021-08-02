const vwoSDK = require('vwo-node-sdk');

function MegController(req, res) {
  let { settings, userStorageData, userId, key } = req.query;
  // const campaign = settings.campaigns.find(el => el.key == key);

  userStorageData = JSON.parse(userStorageData);
  settings = JSON.parse(settings);

  let logs = [];

  const vwoInstance = vwoSDK.launch({
    settingsFile: settings,
    userStorageService: {
      get: (userId, campaignKey) => {
        return userStorageData.find(item => item.userId === userId && item.campaignKey === campaignKey);
      },
      set: _data => {}
    },
    // isDevelopmentMode: true,
    logging: {
      logger: {
        log: (_level, message) => {
          if (message.match(/eligible|ineligible|mutuallyx|exclusive|winner/gi)) {
            message = message.replace(/\(.*\):\s/gi, '').replace(/(and)? for (the\s)?User ID:.*/gi, '');
            logs.push(`${message}`);
          }
        }
      },
      level: vwoSDK.logging.LogLevelEnum.DEBUG
    }
  });

  const variationName = vwoInstance.activate(`campaign-${key}`, userId, {
    variationTargetingVariables: { userId }
  });

  res.end(
    JSON.stringify({
      title: `VWO | MEG | Node-sdk example`,
      variationName,
      logs: logs.length ? logs : ['Campaign not part of group, evaluated independently.']
    })
  );
}

module.exports = MegController;
