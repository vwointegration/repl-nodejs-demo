const express = require('express');
const vwoSDK = require('../../vwo-node-sdk');
const vwoHelper = require('./vwo-helper');
const { DemoController, TrackController, ActivateController } = require('./controllers/DemoController');
const capList = require('./data');

const app = express();

app.set('view engine', 'ejs');
app.set('views', './app/views');
app.use('/public', express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.use(express.json());

let currentSettingsFile = {};

function getSettingsFile(req, res) {
  const { accountId, sdkKey } = req.query;

  return vwoSDK.getSettingsFile(accountId, sdkKey)
    .then(latestSettingsFile => {
      currentSettingsFile = latestSettingsFile;

      return res.end(JSON.stringify(latestSettingsFile));
    })
    .catch(err => {
      console.error('Something went wrong in fetching account settings.', err);
      return res.end(JSON.stringify({error: 'Something went wrong. Please check accountId and sdkKey.'}));
    });
}

function launch(_req, res) {
  const vwoClientInstance = vwoSDK.launch({
    isDevelopmentMode: false,
    settingsFile: currentSettingsFile
  });

  vwoHelper.set('vwoClientInstance', vwoClientInstance);

  return res.end(JSON.stringify({message: currentSettingsFile ? 'SDK initialized' : 'SDK not initialized', capList}));
}

app.get('/', DemoController);

app.get('/settings', getSettingsFile);
app.get('/launch', launch);

app.get('/activate', ActivateController);
app.get('/track', TrackController);

app.listen(process.env.PORT || 4000, () => {});
