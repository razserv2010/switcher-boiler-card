import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class SwitcherBoilerCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { state: true },
    };
  }

  setConfig(config) {
    this._config = {
      wifi_connected_state: "on",
      timers: [],
      ...config,
    };
  }

  static get styles() {
    return css`
      .row {
        margin-bottom: 16px;
      }
      label {
        display: block;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .timer-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }
      ha-icon-button {
        --mdc-icon-button-size: 32px;
      }
    `;
  }

  _valueChanged(key) {
    return (ev) => {
      const value = ev.detail?.value ?? ev.target.value;
      this._config = { ...this._config, [key]: value };
      this._fire();
    };
  }

  _timerChanged(index) {
    return (ev) => {
      const value = ev.detail?.value ?? ev.target.value;
      const timers = [...(this._config.timers || [])];
      timers[index] = value;
      this._config = { ...this._config, timers };
      this._fire();
    };
  }

  _addTimer() {
    const timers = [...(this._config.timers || []), ""];
    this._config = { ...this._config, timers };
    this._fire();
  }

  _removeTimer(index) {
    const timers = [...(this._config.timers || [])];
    timers.splice(index, 1);
    this._config = { ...this._config, timers };
    this._fire();
  }

  _fire() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
      })
    );
  }

  render() {
    if (!this.hass || !this._config) return html``;

    return html`
      <div class="row">
        <label>ישות הדוד (switch)</label>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config.entity || ""}
          .includeDomains=${["switch", "input_boolean"]}
          @value-changed=${this._valueChanged("entity")}
          allow-custom-entity
        ></ha-entity-picker>
      </div>

      <div class="row">
        <label>ישות סטטוס WiFi (אופציונלי)</label>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config.wifi_entity || ""}
          @value-changed=${this._valueChanged("wifi_entity")}
          allow-custom-entity
        ></ha-entity-picker>
      </div>

      <div class="row">
        <label>ערך "מחובר" של ישות ה-WiFi</label>
        <ha-textfield
          .value=${this._config.wifi_connected_state || "on"}
          @input=${this._valueChanged("wifi_connected_state")}
        ></ha-textfield>
      </div>

      <div class="row">
        <label>ישויות טיימר לכיבוי אוטומטי (לחיצה ארוכה)</label>
        ${(this._config.timers || []).map(
          (t, i) => html`
            <div class="timer-row">
              <ha-entity-picker
                style="flex:1"
                .hass=${this.hass}
                .value=${t || ""}
                .includeDomains=${["timer"]}
                @value-changed=${this._timerChanged(i)}
                allow-custom-entity
              ></ha-entity-picker>
              <ha-icon-button @click=${() => this._removeTimer(i)}>
                <ha-icon icon="mdi:close"></ha-icon>
              </ha-icon-button>
            </div>
          `
        )}
        <mwc-button @click=${this._addTimer}>הוסף טיימר</mwc-button>
      </div>

      <div class="row">
        <label>ערכת נושא</label>
        <ha-select
          .value=${this._config.theme || "auto"}
          @selected=${this._valueChanged("theme")}
          @closed=${(e) => e.stopPropagation()}
        >
          <mwc-list-item value="auto">אוטומטי (לפי ה-Home Assistant)</mwc-list-item>
          <mwc-list-item value="day">יום</mwc-list-item>
          <mwc-list-item value="night">לילה</mwc-list-item>
        </ha-select>
      </div>
    `;
  }
}

customElements.define(
  "switcher-boiler-card-editor",
  SwitcherBoilerCardEditor
);
