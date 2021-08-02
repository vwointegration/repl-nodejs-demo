$(document).ready(() => {
  $('.tabs').tabs();

  var stepper = document.querySelector('.stepper');
  var stepperInstace = new MStepper(stepper, {
      // options
      firstActive: 0 // this is the default
  });

  $('.slider').slider();
  $('select').formSelect();

  window.goToSecondStep = function goToSecondStep(destroyFeedback) {
    destroyFeedback(true);
  };

  window.goToThirdStep = function goToSecondStep(destroyFeedback) {
    document.querySelector('#settings').innerHTML = JSON.stringify(window.vwoSettings.settings, null, 2);
    document.querySelector('.js-user-id').innerHTML = document.getElementById('user-id').value;
    destroyFeedback(true);
  };

  window.goToFourthStep = function goToFourthStep(destroyFeedback) {
    document.querySelectorAll('.js-user-id')[1].innerHTML = document.getElementById('user-id').value;
    const key = document.getElementById("js-campaign-selection").value;

    const params = [
      `settings=${JSON.stringify(window.vwoSettings.settings)}`,
      `userStorageData=${JSON.stringify(userStorageData)}`,
      `userId=${document.getElementById('user-id').value}`,
      `key=${key}`
    ];

    const query = params.join('&');

    fetch(`/meg-launch-activate?${query}`)
    .then(res => {
      res.json().then(data => {
        console.log(data);
        document.querySelector('#js-variation-output').innerHTML = data.variationName || 'null';
        document.querySelector('#logs').innerHTML = data.logs.join('\n');
        destroyFeedback(true);
      })
    })
  }
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateUserId() {
  const userId = uuidv4();

  document.getElementById('user-id').focus();
  document.getElementById('user-id').value = userId;
};

window.vwoSettings = {
  settings: {}
};

window.vwoSettings.settings = {
  accountId: 12345,
  version: 1,
  sdkKey: '123450ad940ABCDE90bc7c9b8554321',
  campaigns: getCampaigns(),
  campaignGroups: {},
  groups: {
    1: {
      name: 'group1',
      campaigns: []
    }
  }
}

let userStorageData = [];

function getCampaigns() {
  let campaigns = [];

  for (let i = 1; i < 5; i++) {
    let campaign = {
      isForcedVariationEnabled: false,
      status: 'RUNNING',
      variations: [{
        name: 'Control',
        weight: 50,
        id: 1,
        changes: {}
      }, {
        name: 'Variation-1',
        weight: 50,
        id: 2,
        changes: {}
      }],
      segments: {},
      key: `campaign-${i}`,
      name: `Campaign ${i}`,
      goals: [{
        identifier: `goal-${i}`,
        type: 'CUSTOM_GOAL',
        id: 214
      }],
      id: i,
      type: 'VISUAL_AB',
      percentTraffic: 100
    };
    campaigns.push(campaign);
  }

  return campaigns;
}

function updateGroupCampaignsList() {
  let html = '<ul class="collection with-header"><li class="collection-header"><h6>Campaigns</h6></li>';

  if (window.vwoSettings.settings.groups[1].campaigns.length === 0) {
    html += `<li class="collection-item">No campaign added</li>`
  }

  for (var i = 0; i < window.vwoSettings.settings.groups[1].campaigns.length; i++) {
    const id = window.vwoSettings.settings.groups[1].campaigns[i];
    const style = i % 2 === 0 ? `background-color: #eee;` : ``;

    html += `
      <li class="collection-item" style="${style}">
        <span>Campaign ${id}</span>
        <span onclick="removeCampaignFromGroup(${id})">
          <i class="material-icons red-text" style="float:right; cursor:pointer;">delete</i>
        </span>
      </li>
    `;
  }
  html += '</ul>';

  document.getElementById('g1').innerHTML = html;
}

function addToGroup(id) {
  window.vwoSettings.settings.campaignGroups[+id] = 1;
  window.vwoSettings.settings.groups[1].campaigns.push(+id);

  console.log(window.vwoSettings);

  updateGroupCampaignsList();
}

function removeCampaignFromGroup(id) {
  delete window.vwoSettings.settings.campaignGroups[+id];
  window.vwoSettings.settings.groups[1].campaigns = window.vwoSettings.settings.groups[1].campaigns.filter(val => +val !== +id);

  document.querySelector(`.campaign-added-${id}`).style.display = 'none';
  document.querySelectorAll(`[data-campaign-id="${id}"]`)[0].style.display = 'block';

  updateGroupCampaignsList();
}

function updateUserStorageData(campaign, isAdded) {
  if (isAdded) {
    userStorageData.push({
      campaignKey: campaign.key,
      variationName: campaign.variations[1].name,
      userId: document.getElementById('user-id').value
    })
  } else {
    userStorageData = userStorageData.filter(el => {console.log(el); return el.campaignKey !== campaign.key})
  }
}

function launchAndActivate() {
  // const key = document.getElementById("js-campaign-selection").value;

  // const params = [
  //   `settings=${JSON.stringify(window.vwoSettings.settings)}`,
  //   `userStorageData=${JSON.stringify(userStorageData)}`,
  //   `userId=${document.getElementById('user-id').value}`,
  //   `key=${key}`
  // ];

  // const query = params.join('&');

  // fetch(`/meg-launch-activate?${query}`)
  // .then(res => {
  //   res.json().then(data => {
  //     console.log(data)
  //   })
  // })
}
