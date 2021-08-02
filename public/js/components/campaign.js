export class Campaign extends HTMLElement {
  static get observedAttributes() {
    return [ 'rating', 'max-rating' ];
  }

  constructor() {
    super();

    this.campaign = window.vwoSettings.settings.campaigns[this.id - 1]

    let tmpl = document.createElement('template');

    tmpl = `
      <style>
        input[type='range']::-webkit-slider-thumb {
          background: #2196F3;
        }
      </style> <!-- look ma, scoped styles -->
      <div class="card blue">
        <div class="card-content white-text">
          <p>Campaign ${this.id}</p>
        </div>
        <div class="card-tabs">
          <ul class="tabs tabs-fixed-width tabs-transparent">
            <li class="tab"><a class="active" href="#campaigns"></a></li>
          </ul>
        </div>
        <div class="card-content white">
          <div id="campaigns">
            <form action="#">
              <p>
                <label>
                  <input type="checkbox" id="js-whitelisting-toggle-${this.id}"/>
                  <span>Whitelisting</span>
                </label>
              </p>
              <p>
                <label>
                  <input type="checkbox" id="js-returning-visitor-toggle-${this.id}"/>
                  <span>Is Returning Visitor?</span>
                </label>
              </p>
              <p style="margin-top: 40px;">
                <label>Campaign Traffic </label>
                <p class="range-field">
                  <div class="row">
                    <div class="col s8">
                      <input type="range" id="js-slider-${this.id}" min="0" max="100" value="100" />
                    </div>
                    <div class="col s4">
                      <input type="text" id="js-slider-value-${this.id}" value="100" style="border-bottom: 0; height: 2rem;" disabled/>
                    </div>
                  </div>
                </p>
              </p>
            </form>
          </div>
        </div>
        <div class="card-action white center">
          <a href="javascript:void(0)" class="blue-text" data-campaign-id="${this.id}">+ Add to Group</a>
          <p class="campaign-added-${this.id}" style="display:none">Added to Group</p>
        </div>
      </div>
      <slot></slot>
    `;

    // Attach a shadow root to the element.
    // let shadowRoot = this.attachShadow({mode: 'open'});
    // shadowRoot.appendChild(tmpl.content.cloneNode(true));

    this.innerHTML = tmpl;

    this.addEventListener('click', ev => {
      if (ev.target.getAttribute('data-campaign-id')) {
        const id = +ev.target.getAttribute('data-campaign-id');

        addToGroup(id);

        ev.target.style.display = 'none';
        document.querySelector(`.campaign-added-${this.id}`).style.display = 'block';
      }
    });

    this.addEventListener('change', ev => {
      if (ev.target.id.indexOf("js-returning-visitor-toggle") > -1) {
        updateUserStorageData(this.campaign, ev.target.checked);
      }

      if (ev.target.id.indexOf("js-whitelisting-toggle") > -1) {
        if (ev.target.checked) {
          this.campaign.isForcedVariationEnabled = !this.campaign.isForcedVariationEnabled;
          this.campaign.variations[1].segments = {
            'or': [{
              user: document.getElementById('user-id').value
            }]
          }
        } else {
          try {
            delete this.campaign.variations[1].segments;
          } catch (e) {
            // ...
          }
        }
      }

      if (ev.target.id.indexOf("js-slider") > -1) {
        const val = +ev.target.value;

        this.campaign.percentTraffic = val;
      }
    })

    this.addEventListener('mousemove', ev => {
      if (ev.target.id.indexOf("js-slider") > -1) {
        const val = +ev.target.value;

        document.querySelector(`#js-slider-value-${this.id}`).value = val;
        this.campaign.percentTraffic = val;
      }
    })

  }

  connectedCallback() {
    // if (!this.rating) {
    //     // Set default value to zero
    //     this.rating = 0;
    // }
    // if (!this.maxRating || this.maxRating <= 0) {
    //     // Set default value to five
    //     this.maxRating = 5;
    // }
  }

  get maxRating() {
      // be careful: attributes always string, if you want a number, you must parse it on your own.
      return +this.getAttribute('max-rating');
  }

  set maxRating(value) {
      // if you set the property maxRating in this class, you must sync them with the attribute
      this.setAttribute('max-rating', value);
  }

  get id() {
    return +this.getAttribute('id');
  }

  set id(value) {
    this.setAttribute('id', value);
  }

  get campaigns() {
    return +this.getAttribute('campaigns');
  }

  set campaigns(value) {
    this.setAttribute('campaigns', value);
}

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) {
      switch(name) {
          case 'name':
              this.rating = newVal;
              break;
          case 'max-rating':
              this.maxRating = newVal;
              break;
    }
  }
  }
}
window.customElements.define('my-campaign', Campaign);
