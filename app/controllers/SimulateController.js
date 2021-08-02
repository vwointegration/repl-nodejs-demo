const vwoSDK = require('vwo-node-sdk');

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0;
    var v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function SimulateController(req, res) {
  const dummySettings = {
    accountId: 111111,
    version: 1,
    sdkKey: '012345678d94079aa190bc7c987654321',
    campaigns: [
      {
        isForcedVariationEnabled: false,
        percentTraffic: 100,
        status: 'RUNNING',
        segments: {},
        id: 231,
        type: 'VISUAL_AB',
        variations: [],
        key: 'simulate',
        name: 'Simulation',
        goals: [
          {
            id: 214,
            type: 'CUSTOM_GOAL',
            identifier: 'CUSTOM'
          }
        ]
      }
    ]
  };

  const campaign = dummySettings.campaigns[0];

  const { v = 2, t, u = 10 } = req.query;
  const variationCount = v;
  const campaignTraffic = t;
  const userCount = u;

  campaign.percentTraffic = typeof campaignTraffic !== 'undefined' ? +campaignTraffic : 100;

  let data = {};

  for (let i = 0; i < variationCount; i++) {
    campaign.variations.push({
      id: i + 1,
      changes: {},
      name: i === 0 ? `Control` : `Variation-${i}`,
      weight: 100 / variationCount
    });
  }

  const vwoInstance = vwoSDK.launch({
    settingsFile: dummySettings,
    isDevelopmentMode: true
  });

  for (let j = 0; j < userCount; j++) {
    const userId = uuidv4();

    let variationName = vwoInstance.activate(campaign.key, userId);

    variationName = variationName || 'not-part-of-campaign';

    if (data[variationName]) {
      data[variationName] = data[variationName] + 1;
    } else {
      data[variationName] = 1;
    }
  }

  res.end(
    JSON.stringify({
      status: 'success',
      message:
        'Help: Add ?u=10&t=90&v=3 in the url. u for count of visitors, t for campaign traffic, and v for number of equally weighted variations',
      defaults: 'u=10  t=100  v=2',
      data
    })
  );
}

module.exports = {
  SimulateController
};
