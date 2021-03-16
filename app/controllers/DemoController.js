const vwoHelper = require('../vwo-helper');

const {
  accountId,
  sdkKey,
  abCampaignKey,
  abCampaigngoalIdentifier,
  customVariables,
  variationTargetingVariables
} = require('../config');

function DemoController(_req, res) {
  res.render('demo', {
    title: `VWO | Server-side Node.js SDK Example`,
    accountId,
    sdkKey
  });
}

function ActivateController(req, res) {
  const { campaignKey, userId } = req.query;
  let variationName;
  let recommendations;

  if (vwoHelper.get('vwoClientInstance')) {
    variationName = vwoHelper.get('vwoClientInstance').activate(campaignKey, userId, {
      customVariables,
      variationTargetingVariables
    });

    if (variationName === 'Control') {
      recommendations = [];
    } else if (variationName === 'Variation-1') {
      recommendations = [{
        name: 'Cap VI',
        src: 'public/images/cap.svg',
        price: '$10.22',
        stars: 3
      }, {
        name: 'Cap XXII',
        src: 'public/images/cap1.svg',
        price: '$8.98',
        stars: 4
      }];
    }
  }

  res.end(JSON.stringify({
    status: 'success',
    message: 'user activated',
    variationName,
    recommendations
  }));
}

function TrackController(req, res) {
  const { campaignKey, userId, goalIdentifier } = req.query;

  vwoHelper.get('vwoClientInstance').track(campaignKey, userId, goalIdentifier, {
    customVariables,
    variationTargetingVariables
  });

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'success', message: 'goal tracked' }));
}

module.exports = {
  DemoController,
  ActivateController,
  TrackController
}
