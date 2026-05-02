# AWP Knowledge Gaps
_עודכן: 2026-05-02_

## מה יש ב-DB
> הערה: לא ניתן לטעון את הנתונים הקיימים מסופרבייס (שגיאה: Host not in allowlist — הגבלת IP ברמת Supabase). הנתונים למטה מבוססים על חיפושי Web שבוצעו בריצה זו.

### מקורות Web שנמצאו בחיפוש (מוכנים להכנסה ל-DB):

**Dingli:**
- ManualsLib — JCPT0307 רשימת קודי תקלות (עמ' 29)
- ManualsLib — JCPT0607DCS שגיאות וקודי אזהרה (עמ' 31)
- ChinaLiftSupply — JCPT0607A קוד 69 (Power Relay Sleep)
- ChinaLiftSupply — JCPT1912DC קוד 69
- DingliGlobal — JCPT0607DCM PDF פרמטרים ומדריך
- AdvancedAccessPlatforms — מדריך הפעלה JCPT1412DC/1612DC (PDF)
- ManualsLib — JCPT1412DC רשימת מדריכים
- Alplift — מדריך JCPT0607 (הפניה)
- JHLift — JCPT0607A PDF מדריך

**JLG:**
- JLG.com — דף FAQ על קודי תקלות וכלי אבחון
- ManualsLib — JLG E450A קודי Flash (עמ' 147)
- ManualsLib — JLG 450A Series II קודי תקלות (עמ' 343)
- JustAnswer — JLG 450AJ Series 2 Flash Code 3-3
- SwiftEquipment — JLG 450AJ Service Manual (PDF)
- Intella Parts — JLG Boom Lift Troubleshooting
- ForkliftPDFManuals — JLG Boom Error Codes
- AerialEquipmentParts — JLG Fault Codes List
- CodeReady — JLG Error Codes DTC List
- Biberger — JLG Error Codes
- Elviento.org — JLG Fault Codes PDF Guide
- Discount-Equipment — JLG 860SJ Control System Manual (PDF 10025.pdf)

**Genie:**
- GenieLift.com — Scissor Error Codes (רשמי)
- ManualsLib — Genie GS-2046 Fault Code Chart (עמ' 50)
- JustAnswer — Genie GS-3246 Fault Light
- FlatEarthEquipment — Genie 40+ Error Codes Guide
- AerialEquipmentParts — Common Genie Scissor Errors
- Mechnician.com — Ultimate Guide Genie Fault Codes
- HindleyElectronics — Genie ECU GEN5 Fault Codes (PDF)
- HindleyElectronics — Genie ECU GEN6 Fault Codes (PDF)
- Genie Service Manuals (PDFs): 96316, 97385, 1272217, 1309020

**Manitou:**
- ManualsLib — Manitou 180ATJ Manuals
- Scribd — Manitou Fault Codes List (כללי)
- Truck-Manuals.Net — Manitou Fault Codes DTC
- Blog USRO — Complete Manitou Error Codes List 2025
- Machineseeker Blog — Manitou Telehandlers Error Codes
- Scribd — Manitou 180ATJ (EURO 3) Electric Circuit

---

## קודי תקלות שנמצאו בחיפוש (ללא גישה ישירה לדפים)

### Dingli JCPT0607DCS — קודי אזהרה שנמצאו:
| קוד | משמעות |
|-----|---------|
| 10 | General Alarm ECU |
| 20 | General Alarm TM1 |
| 30 | General Alarm PCU |
| 31 | PCU CPU0 Fault |
| 32 | PCU CPU1 Fault |
| 51 | ECU Alarm |
| 52 | PCU Alarm |
| 53 | TM1 Alarm |
| 54 | Press Sensor Error |
| 57 | Overload |
| 58 | Pothole (שקע/בור) |
| 59 | High Position Limit |

### Dingli JCPT0607A — קוד 69:
- **משמעות:** Power Relay Sleep — המערכת נכנסה למצב שינה והממסר כיבה
- **פתרון:** הפעלה מחדש, בדיקת רמת סוללה, בדיקת מפתח הפעלה

### Genie GS-3246 / GS-2046 — קודי תקלות:
| קוד | משמעות |
|-----|---------|
| 01 | Platform ECM error |
| 02 | ECM cannot be reset |
| 03 | Undefined platform DIP switch settings |
| 12 | Chassis up/down switch closed at start up |
| 18 | Pothole guard failure |
| 42 | Forward coil error |
| 43 | Reverse coil error |
| 44 | Up coil error |
| 45 | Down coil error |
| 46 | Right coil error |
| 47 | Left coil error |
| 52 | Brake coil error |
| 53–58 | Low voltage / various coil errors |

### Genie GS-1932 / GS-1930 — קודי תקלות נפוצים:
| קוד | משמעות |
|-----|---------|
| E1 | Emergency Stop |
| E4 | Low Battery |
| E6 | Tilt Sensor |
| E12 | Control Communication Error |
| E13 | Control Communication Error |

> מערכת Genie GSDS מכילה 272 קודי DTC ו-6 קודי OIC עבור דגמי GS.

### JLG 450AJ — Flash Codes:
- **3-3:** בעיית חיישן הטיה (Tilt Sensor) — בדוק מיקום חיישן בקופסת בקרה
- כלי אנליזה: JLG מספקת 3 סוגי analyzers (כבל, אלחוטי Bluetooth, remote ClearSky)

---

## פערים לפי מודל
| מודל | מה חסר | עדיפות |
|------|---------|--------|
| Dingli JCPT1412 | רשימת קודי שגיאה חשמלית מלאה, מדריך שירות | גבוהה |
| Dingli JCPT1208 | כל תיעוד קודי תקלות — לא נמצא כלום | גבוהה |
| Dingli JCPT0607DCM | קודי DCM ספציפיים (יש PDF אבל לא נגיש) | גבוהה |
| JLG 450AJ | רשימת Flash Codes מלאה עם כל הקודים | גבוהה |
| JLG 520AJ | קודי תקלות ספציפיים לדגם — כמעט לא נמצא | גבוהה |
| JLG 510AJ | קודי תקלות ספציפיים — לא נמצא כלום | גבוהה |
| JLG 860SJ | מדריך שירות מלא, קודי תקלות DCM | גבוהה |
| Genie GS-3246 | קודי תקלות חלקיים בלבד (42-58), טבלה מלאה חסרה | בינונית |
| Genie GS-1932 | קודי DTC מלאים (272 קיימים אך לא מתועדים כאן) | בינונית |
| Manitou 180ATJ | קודי תקלות ספציפיים לדגם — כמעט אין | גבוהה |
| Dingli JCPT0607DCS | קודים 60-99 חסרים | נמוכה |
| JLG 860SJ | סכמת חשמל | בינונית |

---

## שאלות לאופק
1. יש לך מדריך שירות פיזי ל-JLG 860SJ? (לא נמצא תיעוד מקוון נגיש)
2. קיבלת פעם רשימת fault codes מ-Dingli ישירות? (רשמית מ-dingliglobal.com יש PDF אך חסום)
3. יש קטלוג חלקים ל-Genie GS-3246? (יש PDF ב-rentalex.com אך לא נגיש)
4. יש לך מדריך שירות ל-Dingli JCPT1208? (לא נמצא תיעוד כלל)
5. יש לך רשימת קודי תקלות ל-JLG 520AJ? (לא נמצא ספציפי לדגם)
6. יש לך מדריך שירות ל-Manitou 180ATJ? (נמצאו מדריכים ב-ManualsLib אך לא נגישים)
7. האם Dingli JCPT1412DC ו-JCPT1612DC חולקים את אותם קודי תקלות? (PDF נמצא אך חסום)
8. איזה analyzer tool אתה משתמש עבור JLG? (JLG מציעה 3 סוגים — איזה יש לך?)
9. האם אי פעם ראית קוד תקלה ספציפי ל-Manitou 180ATJ שלא מופיע בשום מדריך?
10. האם Genie GS-1932 שלך משתמש בקונטרולר GEN5 או GEN6? (יש שתי רשימות קודים שונות)

---

## מקורות PDF לעדיפות גישה (להוספה ידנית אם נגישים):
```
https://advancedaccessplatforms.co.uk/wp-content/uploads/2023/10/Dingli-Operation-Manual-1412DC-1612DC.pdf
https://www.dingliglobal.com/upload/file/manual/parameter/JCPT0607DCM.pdf
https://jhlift.co.kr/download/JCPT0607A.pdf
https://www.rentalex.com/wp-content/uploads/2017/04/GS3246_Service_Manual.pdf
https://www.hindleyelectronics.com/support/ecu/gsfaultcode.pdf
https://www.hindleyelectronics.com/support/ecu/gsfaultcode_GEN6.pdf
https://manuals.genielift.com/parts%20and%20service%20manuals/data/Service/Scissors/96316.pdf
https://discount-equipment.com/library_files/10025.pdf
```

---

## סטטיסטיקות
- מקורות web ב-DB לפני הריצה: לא ידוע (Supabase חסום — Host not in allowlist)
- חיפושי Web שבוצעו: 15
- עמודים שנסרקו (WebFetch): 0 (כל בקשות WebFetch נחסמו עם שגיאת 403)
- פריטים חדשים שנוספו ל-DB: 0 (Supabase חסום מהסביבה הנוכחית)
- URL מועמדים לשמירה שזוהו: 35+
- מודלים עם תיעוד חלקי: Dingli JCPT0607DCS, Genie GS-3246, GS-1932, JLG 450AJ
- מודלים ללא תיעוד: Dingli JCPT1208, JCPT1412 (fault codes), JLG 510AJ, JLG 520AJ (fault codes)

## הערה טכנית
בריצה זו התגלו שתי מגבלות טכניות:
1. **Supabase API חסום:** כל ניסיונות גישה (curl, Python, Node.js) נחסמו עם "Host not in allowlist" — הגבלת IP ברמת פרויקט Supabase. נדרש להוסיף IP של שרת ה-CI לרשימת המותרים.
2. **WebFetch חסום:** כל בקשות WebFetch לאתרים חיצוניים החזירו שגיאת 403 — ככל הנראה חסימת user-agent או IP בסביבת ה-sandbox.
