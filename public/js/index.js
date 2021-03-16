const util = {
  _replacer: function _replacer(match, pIndent, pKey, pVal, pEnd) {
    let key = '<span class=json-key>';
    let val = '<span class=json-value>';
    let str = '<span class=json-string>';
    let r = pIndent || '';

    if (pKey) {
      r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
    }
    if (pVal) {
      r = r + (pVal[0] === '"' ? str : val) + pVal + '</span>';
    }

    return r + (pEnd || '');
  },

  prettyPrint: function prettyPrint(obj) {
    var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/gm;

    return JSON.stringify(obj, null, 3)
      .replace(/&/g, '&amp;')
      .replace(/\\"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(jsonLine, util._replacer);
  }
}

$(document).ready(() => {
  var stepper = document.querySelector('.stepper');
  var stepperInstace = new MStepper(stepper, {
      // options
      firstActive: 0 // this is the default
  });
  function getUserId() {
    const urlParams = new URLSearchParams(window.location.search);

    return urlParams.get('userId');
  }

  $('#user-id').on('keyup', ev => {
    $('#activate-code').html(`vwoInstance.activate(campaignKey, '${ev.target.value}');`);
  })

  if (document.getElementById('user-id')) {
    document.getElementById('user-id').value = getUserId();
  }

  window.fetchSettings = function fetchSettings(destroyFeedback) {
    const accountId = document.getElementById('account-id').value;
    const sdkKey = document.getElementById('sdk-key').value;

    fetch(`/settings?accountId=${accountId}&sdkKey=${sdkKey}`).then(response => {
      response.json().then(data => {
        document.getElementById('sdk-settings').innerHTML = util.prettyPrint(data, null, 2);
        destroyFeedback(true);
      });
    });
  }

  window.initVWOSDK = function (destroyFeedback) {
    fetch(`/launch`).then(response => {
      response.json().then(data => {
        const capList = data.capList || [];
        let html = '';

        (capList || []).forEach(function(cap) {
            let starsHtml = '';

            for (let j = 0; j < cap.stars; j++) {
              starsHtml += `<span class="material-icons add-to-cart">star_rate</span>`;
            }
            html += `<div class="product-item">
              <img src="${cap.src}">
              <div class="product-name">${cap.name}</div>
              <div class="product-price-box">
                ${starsHtml}
                <strong class="product-price">${cap.price}</strong>
              </div>
            </div>`
        });

        document.getElementById('product-list111').innerHTML = html;

        destroyFeedback(true);
      })
    })
  }

  window.addEventListener('click', (ev) => {
    if (ev.target.parentElement.classList.contains('product-item')) {
      let userId = document.getElementById('user-id').value;
      let campaignKey = document.getElementById('campaign-key').value;
      let goalIdentifier = document.getElementById('goal-identifier').value;

      if (goalIdentifier) {
        fetch(`/track?userId=${userId}&campaignKey=${campaignKey}&goalIdentifier=${goalIdentifier}`).then(response => {
          response.json().then(_data => {
            alert('Goal triggered');
          })
        });
      }
    }
  });

  window.activateCampaign = function activateCampaign(destroyFeedback) {
    if (history.pushState) {
      let userId = document.getElementById('user-id').value;
      let campaignKey = document.getElementById('campaign-key').value;

      let newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + `?userId=${userId}`;

      window.history.pushState({path:newurl},'',newurl);

      fetch(`/activate?userId=${userId}&campaignKey=${campaignKey}`).then(response => {
        response.json().then(data => {
          console.log(data);

          let variation = data.variationName;
          let html = '';
          let productRecommendations = data.recommendations || [];

          (productRecommendations || []).forEach(function(recommendation) {
            let starsHtml = '';

            for (let j = 0; j < recommendation.stars; j++) {
              starsHtml += `<span class="material-icons add-to-cart">star_rate</span>`;
            }
            html += `<div class="product-item product-item--one">
              <img src="${recommendation.src}">
              <div class="product-name">${recommendation.name}</div>
              <div class="product-price-box">
                ${starsHtml}
                <strong class="product-price">${recommendation.price}</strong>
              </div>
            </div>`
        });

          if (productRecommendations.length) {
            document.getElementById('product-recommendations').classList.remove('hide');
            document.getElementById('product-list').classList.remove('s12');
            document.getElementById('product-list').classList.add('s9');
            document.getElementById('recommendations').innerHTML = html;
            document.getElementById('product-recommendations').classList.add('s3');
          } else {
            document.getElementById('product-recommendations').classList.add('hide');
            document.getElementById('product-list').classList.remove('s9');
            document.getElementById('product-list').classList.add('s12');
          }


          $('#sdk-result').html(`
            <span class="material-icons info-icon">info</span>
            <div style="margin-left: 50px;">
              <strong>${userId}</strong> ${(data.variationName ? ' becomes ' : ' does not become ') + `part of the campaign: <strong>${campaignKey}</strong>`}
              <br />
              Serving
              <strong>${variation || 'Control'}</strong>
              for the User ID:
              <strong>${userId}</strong>
            <div>`);

          destroyFeedback(true);
        });
      });
    }

  }
});
