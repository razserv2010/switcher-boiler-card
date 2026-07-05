# Switcher Boiler Card

כרטיס Lovelace מותאם אישית ל-Home Assistant, בעיצוב ריאליסטי המבוסס על פאנל המגע
של דוד ה-Switcher. כולל מצב יום/לילה אוטומטי, לחיצה קצרה להדלקה/כיבוי, ולחיצה
ארוכה לבחירת ישות טיימר לכיבוי אוטומטי.

## התקנה

### דרך HACS (מומלץ)

1. הקבצים (`hacs.json`, `switcher-boiler-card.js`, `switcher-boiler-card-editor.js`,
   `README.md`) צריכים לשבת ב-**שורש** הריפו ב-GitHub שלך (לא בתת-תיקייה) -
   זה מה ש-`content_in_root: true` ב-`hacs.json` מצפה לו.
2. ב-HACS: תפריט (⋮) > Custom repositories > הוסף את כתובת הריפו, קטגוריה
   `Dashboard` (Lovelace).
3. התקן את "Switcher Boiler Card" מתוך HACS - זה יוסיף אוטומטית את ה-resource
   ל-Lovelace.

### ידנית

1. העלה את `switcher-boiler-card.js` ואת `switcher-boiler-card-editor.js`
   לתיקיית `www/switcher-boiler-card/`.
2. הוסף resource בהגדרות > לוח מחוונים > משאבים:
   ```
   /local/switcher-boiler-card/switcher-boiler-card.js
   ```
   (טיפוס: מודול JavaScript)
3. הוסף כרטיס חדש מסוג `Custom: Switcher Boiler Card` דרך עורך הלוח, או ב-YAML:

```yaml
type: custom:switcher-boiler-card
entity: switch.boiler
wifi_entity: binary_sensor.boiler_wifi
wifi_connected_state: "on"
timers:
  - timer.boiler_auto_off_30
  - timer.boiler_auto_off_60
theme: auto
```

## אפשרויות תצורה

| מפתח | חובה | תיאור |
|---|---|---|
| `entity` | כן | ישות ה-`switch`/`input_boolean` של הדוד |
| `wifi_entity` | לא | ישות שמייצגת את סטטוס ה-WiFi |
| `wifi_connected_state` | לא | הערך שנחשב "מחובר" (ברירת מחדל `on`) |
| `timers` | לא | רשימת ישויות `timer` לבחירה בלחיצה ארוכה |
| `theme` | לא | `auto` (ברירת מחדל) / `day` / `night` |

## התנהגות

- **לחיצה קצרה** על סמל השמש → קורא ל-`homeassistant.toggle` על `entity`.
- **לחיצה ארוכה** (כ-550ms, עם טבעת אדומה שמתמלאת) → פותח תפריט עם כל ישויות
  ה-`timer` שהוגדרו (השם מוצג לפי `friendly_name`), ולחיצה על אחת קוראת ל-
  `timer.start` על אותה ישות.
- **צבע השמש** אדום כאשר `entity` במצב `on`.
- **צבע ה-WiFi** כחול כאשר `wifi_entity` שווה ל-`wifi_connected_state`, אחרת אפור.
- **שורת סטטוס חיה בתחתית הכרטיס**: הכרטיס סורק את רשימת `timers` ומאתר אם
  אחת מהן במצב `active`. אם כן, מוצג "הבוילר הודלק ל: {שם} • {mm:ss}" עם
  ספירה לאחור המתעדכנת כל שנייה, מבוססת על attribute `finishes_at` של ישות
  ה-timer עצמה (ולכן נשארת מדויקת גם אחרי ריענון דף). כשאין טיימר פעיל
  מוצג "הבוילר דולק" או "הבוילר כבוי" בהתאם למצב `entity`.
