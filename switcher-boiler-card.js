import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

const CARD_VERSION = "1.0.0";

console.info(
  `%c SWITCHER-BOILER-CARD %c v${CARD_VERSION} `,
  "color: white; background: #0a0a0c; font-weight: 700;",
  "color: #0a0a0c; background: white; font-weight: 700;"
);

class SwitcherBoilerCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _pressing: { state: true },
      _menuOpen: { state: true },
    };
  }

  static getConfigElement() {
    return document.createElement("switcher-boiler-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:switcher-boiler-card",
      entity: "",
      wifi_entity: "",
      wifi_connected_state: "on",
      timers: [],
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("יש להגדיר entity (ישות הדוד)");
    }
    this._holdMs = config.hold_time ?? 550;
    this.config = {
      wifi_connected_state: "on",
      timers: [],
      ...config,
    };
    this._menuOpen = false;
    this._pressing = false;
  }

  getCardSize() {
    return 3;
  }

  static get styles() {
    return css`
      :host {
        --sb-red: #ff5b45;
        --sb-blue: #4d9be0;
      }
      ha-card {
        overflow: visible;
        background: transparent;
        box-shadow: none;
        border: none;
        padding: 8px;
      }
      .wrap {
        position: relative;
        display: flex;
        justify-content: center;
      }
      .panel {
        position: relative;
        width: 100%;
        max-width: 340px;
        aspect-ratio: 340 / 210;
        border-radius: 14px;
        user-select: none;
        transition: background 0.4s, box-shadow 0.4s, border-color 0.4s;
      }
      .panel.night {
        background: linear-gradient(
          135deg,
          #2a2a2e 0%,
          #17171a 40%,
          #0a0a0c 70%,
          #050506 100%
        );
        box-shadow: 0 18px 36px -10px rgba(0, 0, 0, 0.55),
          0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1),
          inset 0 -1px 2px rgba(0, 0, 0, 0.6),
          inset 3px 0 5px -3px rgba(255, 255, 255, 0.05),
          inset -3px 0 5px -3px rgba(255, 255, 255, 0.05);
        border: 0.5px solid #050506;
      }
      .panel.day {
        background: linear-gradient(
          135deg,
          #f5f5f2 0%,
          #e6e6e2 40%,
          #d6d6d1 70%,
          #c8c8c2 100%
        );
        box-shadow: 0 18px 36px -10px rgba(0, 0, 0, 0.18),
          0 2px 6px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6),
          inset 0 -1px 2px rgba(0, 0, 0, 0.1),
          inset 3px 0 5px -3px rgba(0, 0, 0, 0.05),
          inset -3px 0 5px -3px rgba(0, 0, 0, 0.05);
        border: 0.5px solid #b8b8b3;
      }
      .sheen1,
      .sheen2 {
        position: absolute;
        inset: 0;
        border-radius: 14px;
        pointer-events: none;
      }
      .sheen1 {
        background: linear-gradient(
          120deg,
          rgba(255, 255, 255, 0.12) 0%,
          rgba(255, 255, 255, 0.02) 22%,
          rgba(255, 255, 255, 0) 42%
        );
      }
      .panel.day .sheen1 {
        opacity: 0.5;
      }
      .sheen2 {
        background: radial-gradient(
          ellipse at 30% 15%,
          rgba(255, 255, 255, 0.06),
          rgba(255, 255, 255, 0) 55%
        );
      }
      .panel.day .sheen2 {
        opacity: 0.5;
      }
      svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      #sun-hit {
        cursor: pointer;
      }
      .sun-hit {
        position: absolute;
        top: 45.7%;
        left: 50%;
        width: 22%;
        aspect-ratio: 1;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        z-index: 5;
      }
      .timer-menu {
        position: absolute;
        top: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%) scale(0.95);
        width: 220px;
        max-width: 80vw;
        background: var(--card-background-color, #1c1c1c);
        border: 1px solid var(--divider-color, #333);
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        padding: 6px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s, transform 0.15s;
        z-index: 10;
      }
      .timer-menu.open {
        opacity: 1;
        pointer-events: auto;
        transform: translateX(-50%) scale(1);
      }
      .timer-menu .title {
        font-size: 12px;
        color: var(--secondary-text-color, #999);
        padding: 6px 10px;
      }
      .timer-menu button {
        display: block;
        width: 100%;
        text-align: right;
        padding: 8px 10px;
        font-size: 13px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        color: var(--primary-text-color, #fff);
        font-family: inherit;
      }
      .timer-menu button:hover {
        background: var(--secondary-background-color, rgba(255, 255, 255, 0.08));
      }
      .timer-menu .empty {
        font-size: 13px;
        color: var(--secondary-text-color, #999);
        padding: 8px 10px;
      }
    `;
  }

  _isDark() {
    if (this.config.theme === "day") return false;
    if (this.config.theme === "night") return true;
    return !!this.hass?.themes?.darkMode;
  }

  _boilerOn() {
    const st = this.hass?.states?.[this.config.entity];
    return st && st.state === "on";
  }

  _wifiConnected() {
    if (!this.config.wifi_entity) return null;
    const st = this.hass?.states?.[this.config.wifi_entity];
    if (!st) return null;
    return st.state === (this.config.wifi_connected_state ?? "on");
  }

  _startPress(e) {
    e.preventDefault();
    this._longPressed = false;
    this._pressing = true;
    this._pressTimer = setTimeout(() => {
      this._longPressed = true;
      this._pressing = false;
      this._menuOpen = true;
    }, this._holdMs);
  }

  _endPress() {
    clearTimeout(this._pressTimer);
    this._pressing = false;
    if (!this._longPressed) {
      this._toggleBoiler();
    }
  }

  _cancelPress() {
    clearTimeout(this._pressTimer);
    this._pressing = false;
  }

  _toggleBoiler() {
    this.hass.callService("homeassistant", "toggle", {
      entity_id: this.config.entity,
    });
  }

  _closeMenu() {
    this._menuOpen = false;
  }

  _startTimer(entityId) {
    this.hass.callService("timer", "start", { entity_id: entityId });
    this._closeMenu();
  }

  _onDocClick = (e) => {
    if (!this._menuOpen) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._closeMenu();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._onDocClick);
    this._tickInterval = setInterval(() => this.requestUpdate(), 1000);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onDocClick);
    clearInterval(this._tickInterval);
    super.disconnectedCallback();
  }

  _activeTimer() {
    const timers = this.config.timers || [];
    for (const t of timers) {
      const entityId = typeof t === "string" ? t : t.entity;
      const st = this.hass.states[entityId];
      if (st && st.state === "active") {
        const name =
          (typeof t === "object" && t.name) ||
          st.attributes.friendly_name ||
          entityId;
        const finishesAt = st.attributes.finishes_at
          ? new Date(st.attributes.finishes_at).getTime()
          : null;
        let remaining = null;
        if (finishesAt) {
          remaining = Math.max(0, Math.round((finishesAt - Date.now()) / 1000));
        }
        return { name, remaining };
      }
    }
    return null;
  }

  _fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  render() {
    if (!this.config || !this.hass) return html``;

    const dark = this._isDark();
    const on = this._boilerOn();
    const wifi = this._wifiConnected();

    const ringColor = on ? "var(--sb-red)" : dark ? "#c9c9cb" : "#5a5a55";
    const dotColor = on ? "var(--sb-red)" : dark ? "#77777a" : "#9d9d97";
    const sunBg = on
      ? dark
        ? "#0a0a0c"
        : "#fff0ee"
      : dark
      ? "#0a0a0c"
      : "#eeeeea";
    const crosshair = dark ? "#3d3d40" : "#b0b0aa";
    const logoColor = dark ? "#8a8a8d" : "#6a6a64";
    const wifiColor =
      wifi === null
        ? dark
          ? "#4f4f52"
          : "#9d9d97"
        : wifi
        ? "var(--sb-blue)"
        : dark
        ? "#4f4f52"
        : "#9d9d97";

    const timers = this.config.timers || [];
    const activeTimer = this._activeTimer();
    let statusText;
    if (activeTimer) {
      statusText = activeTimer.remaining !== null
        ? `הבוילר הודלק ל: ${activeTimer.name}  •  ${this._fmtTime(activeTimer.remaining)}`
        : `הבוילר הודלק ל: ${activeTimer.name}`;
    } else if (on) {
      statusText = "הבוילר דולק";
    } else {
      statusText = "הבוילר כבוי";
    }
    const statusColor = dark ? "#9a9a9d" : "#6a6a64";
    const dividerColor = dark ? "#2a2a2d" : "#c8c8c2";

    return html`
      <ha-card>
        <div class="wrap" dir="ltr">
          <div class="panel ${dark ? "night" : "day"}">
            <div class="sheen1"></div>
            <div class="sheen2"></div>
            <button
              class="sun-hit"
              aria-label="הדלקה/כיבוי"
              @mousedown=${this._startPress}
              @mouseup=${this._endPress}
              @mouseleave=${this._cancelPress}
              @touchstart=${this._startPress}
              @touchend=${this._endPress}
              @touchcancel=${this._cancelPress}
            ></button>
            <svg viewBox="0 0 340 210">
              <defs>
                <filter id="sb-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="sb-glow-sm" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur stdDeviation="2.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g stroke="${crosshair}" stroke-width="1" stroke-dasharray="3 4">
                <line x1="170" y1="52" x2="170" y2="77" />
                <line x1="170" y1="115" x2="170" y2="140" />
                <line x1="128" y1="96" x2="153" y2="96" />
                <line x1="187" y1="96" x2="212" y2="96" />
              </g>
              <g fill="${dotColor}">
                <circle cx="136" cy="64" r="4" />
                <circle cx="204" cy="64" r="4" />
                <circle cx="136" cy="128" r="4" />
                <circle cx="204" cy="128" r="4" />
              </g>

              <g
                transform="translate(170,96)"
                filter="${on ? "url(#sb-glow)" : "none"}"
              >
                <circle r="12" fill="${sunBg}" stroke="${ringColor}" stroke-width="2" />
                <g stroke="${ringColor}" stroke-width="2.2" stroke-linecap="round">
                  <line x1="0" y1="-19" x2="0" y2="-25" />
                  <line x1="0" y1="19" x2="0" y2="25" />
                  <line x1="-19" y1="0" x2="-25" y2="0" />
                  <line x1="19" y1="0" x2="25" y2="0" />
                  <line x1="-13.4" y1="-13.4" x2="-17.7" y2="-17.7" />
                  <line x1="13.4" y1="13.4" x2="17.7" y2="17.7" />
                  <line x1="-13.4" y1="13.4" x2="-17.7" y2="17.7" />
                  <line x1="13.4" y1="-13.4" x2="17.7" y2="-17.7" />
                </g>
                <circle
                  r="20"
                  fill="none"
                  stroke="var(--sb-red)"
                  stroke-width="2"
                  stroke-dasharray="126"
                  stroke-dashoffset="${this._pressing ? 0 : 126}"
                  style="transition: stroke-dashoffset ${this._pressing
                    ? this._holdMs
                    : 0}ms linear; opacity:${this._pressing ? 1 : 0};"
                  transform="rotate(-90)"
                ></circle>
              </g>

              <g
                transform="translate(46,164)"
                filter="${this.config.wifi_entity && wifi ? "url(#sb-glow-sm)" : "none"}"
              >
                <path
                  d="M -10 3 Q 0 -9 10 3"
                  fill="none"
                  stroke="${wifiColor}"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
                <path
                  d="M -5 6 Q 0 -1 5 6"
                  fill="none"
                  stroke="${wifiColor}"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
                <circle cx="0" cy="9" r="1.6" fill="${wifiColor}" />
              </g>

              <g direction="ltr">
                <text
                  x="300"
                  y="172"
                  text-anchor="end"
                  font-size="12"
                  fill="${logoColor}"
                  font-family="sans-serif"
                  letter-spacing="0.5"
                  direction="ltr"
                >
                  switcher
                </text>
                <circle cx="150" cy="167" r="3.5" fill="#c0392b" />
              </g>

              <line x1="20" y1="188" x2="320" y2="188" stroke="${dividerColor}" stroke-width="1" />
              <text
                x="170"
                y="204"
                text-anchor="middle"
                font-size="12.5"
                fill="${statusColor}"
                font-family="sans-serif"
              >
                ${statusText}
              </text>
            </svg>
          </div>

          <div class="timer-menu ${this._menuOpen ? "open" : ""}">
            <div class="title">כיבוי אוטומטי</div>
            ${timers.length === 0
              ? html`<div class="empty">לא הוגדרו ישויות טיימר</div>`
              : timers.map((t) => {
                  const entityId = typeof t === "string" ? t : t.entity;
                  const st = this.hass.states[entityId];
                  const name =
                    (typeof t === "object" && t.name) ||
                    st?.attributes?.friendly_name ||
                    entityId;
                  return html`<button @click=${() => this._startTimer(entityId)}>
                    ${name}
                  </button>`;
                })}
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define("switcher-boiler-card", SwitcherBoilerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "switcher-boiler-card",
  name: "Switcher Boiler Card",
  description: "כרטיס לשליטה בדוד Switcher בעיצוב תלת-ממדי ריאליסטי",
});

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
