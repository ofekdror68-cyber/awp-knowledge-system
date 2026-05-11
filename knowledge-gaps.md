# AWP Knowledge Gaps
_עודכן: 2026-05-11_

## מה יש ב-DB (סטייג'ינג — ממתין להעלאה)

### Dingli
- JCPT0307 — קודי שגיאה מלאים (מנואל רשמי ManualsLib p.29)
- JCPT0607DCS — קודי שגיאה מלאים (קודים 10–112, ManualsLib p.31)
- JCPT0607A / JCPT1912DC — קוד 69 (Power Relay Sleep) + פתרון
- JCPT0607DCM — מנואל רשמי PDF (Dingli Global) + קודי מנוע דיזל
- JCPT0607 כללי — דף מנואל ב-Alplift (זוהו וריאנטים: DCS, DCM, DCE) ✨חדש
- JCPT1412DC / JCPT1612DC — מנואל מפעיל (Advanced Access Platforms PDF) + רשימת מנואלים (ManualsLib)
- JCPT1418RT — מנואל ANSI רשמי PDF (Dingli Global)
- JCPT1208AC — דף מוצר + הפניה למרכז הורדה רשמי
- JCPT2223RTB — מנואל מפעיל מלא עם fault codes (ManualsLib)
- Scissor general — מנואל מוצרים (Dingli Global PDF) + מרכז הורדה רשמי (en.cndingli.com)

### JLG
- 450A Series II — קודי שגיאה ספציפיים (ManualsLib עמ' 343)
- 450AJ / E450AJ — מנואל שירות מלא + flash code 3-3 + fault flash codes p.147 + מנואל ANSI 2000 (Rentalex PDF) ✨חדש
- M450AJ — שירות מלא (simeri.fi)
- 2646ES — fault codes 9-2 ו-9-3 (Forkliftaction forum)
- 660SJ — קוד שגיאה ספציפי (Forkliftaction forum)
- 520AJ — קודי שגיאה כלליים + JLG fault codes PDF list (elviento.org) ✨חדש
- 860SJ — מנואל חלקים רשמי (JLG CDN) + כלי אבחון (Mechnician/Jaltest) ✨חדש + JLG 3121259 telescope valve fault ✨חדש + JLG 1200SJP/1350SJP TM (cranedude) ✨חדש
- General — מנגנון קודי שגיאה (jlg.com + aerialequipmentparts.com + Biberger) + כלי אבחון רשמיים
- CAN Bus Control System — מנואל פרק 6 עם אבחון CAN ו-ECM
- 510AJ — אין תיעוד ספציפי נמצא

### Genie
- GS-3246 / GS-2646 / GS-2046 — מנואל שירות רשמי (#48339) + fault code chart p.50 + קוד 18 (JustAnswer)
- GS-1930/32 / GS-2032/32 — מנואל שירות רשמי (#96316) + מנואל מעודכן (#97385 Rev E10 2012) ✨חדש
- GS-1530/1532 / GS-2032 / GS-2632 — מנואל שירות רשמי (#1272217) ✨חדש
- GS-1330m — מנואל שירות רשמי (#1309020) ✨חדש
- GS-1932 — קודי שגיאה מלאים: OIC E1–E13, DTC 01–68 (aerialequipmentparts, flatearthequipment, mechnician, Biberger)
- ECU GEN 5 / GEN 6 — מסמכי fault codes (Hindley Electronics)
- GSDS — 272 קודים כולל + Genie Lift Connect
- Z-45 XC / Z-60 DC — מנואלי שירות רשמיים (Genie CDN)
- Hybrid Lifts — דף קודי שגיאה (ANSI multi-brand) ✨חדש

### Manitou
- 180ATJ — מנואל מפעיל + מעגל חשמלי EURO 3 + Manitou MDS software רשמי ✨חדש
- 180ATJ — קודי Deutz engine (Scribd) ✨חדש
- MT1440PE3 / MT1840PE3 — טבלת DTC מלאה (קרוב ל-180ATJ בסכמת הקודים) ✨חדש
- ATJ/VJR/TJ — קודי AWP כלליים + Manitou diag portal + machineseeker blog + truck-manuals.net
- Manitou Fault Codes List PDF (Scribd, document 446162823)

### MEC AWP
- 1330SE — מנואל שירות + קודי שגיאה (mecawp.com)
- Error Indicator Readout — מסמך קודי תצוגה (mecawp.com)

---

## פערים לפי מודל

| מודל | מה חסר | עדיפות |
|------|---------|--------|
| Dingli JCPT1412DC | טבלת fault codes מפורטת מתוך מנואל (יש הפניה, חסרה חילוץ) | גבוהה |
| Dingli JCPT1208AC | fault codes — לא נחלץ; מרכז הורדה רשמי זוהה | גבוהה |
| Dingli JCPT1212 | שום תיעוד ספציפי — לא נמצא | גבוהה |
| JLG 520AJ | קודי שגיאה ספציפיים לדגם — נמצאו רק קודים כלליים | גבוהה |
| JLG 860SJ | מנואל שירות מלא — JLG Online Express בלבד (מנואל חלקים + כלי אבחון נמצאו) | גבוהה |
| JLG 510AJ | אין תיעוד ספציפי — מנואל קיים ב-JLG Online Express בלבד | בינונית |
| Genie GS-3246 | טבלת DTC מלאה (מעל קוד 68) — הפניה לעמ' 182 אך לא חולץ | בינונית |
| Manitou 180ATJ | קודי שגיאה ספציפיים לדגם — Manitou MDS נדרש לקריאה מלאה | גבוהה |
| JLG 450AJ | flash codes מורכבים מ-3-3 — רק 3-3 נמצא בפורומים | נמוכה |

---

## שאלות לאופק

1. יש לך מנואל שירות ל-Dingli JCPT1412DC עם טבלת fault codes מלאה? (מנואל מפעיל נמצא, חסרה טבלת קודים)
2. יש לך מנואל שירות ל-JLG 860SJ? (נדרש JLG Online Express — האם יש גישה?)
3. יש מסמך fault codes ספציפי ל-Manitou 180ATJ? (Manitou MDS נדרש — האם יש גישה לתוכנה?)
4. האם המכונות שלך מחוברות ל-JLG ClearSky או לכלי אחר לאבחון מרחוק?
5. יש לך אחת ממכונות Dingli JCPT1208 / JCPT1212 בצי? (ניתן לחלץ fault codes מהמכונה ישירות)
6. מה גרסת ה-ECU של ה-Genie GS-3246 שלך — GEN 5 או GEN 6? (משפיע על מספרי הקודים)
7. קוד שגיאה 57 (OVERLOAD) על Dingli — כמה פעמים קרה? ייתכן כשל בחיישן עומס
8. על ה-JLG 520AJ — נראה flash code כלשהו? (נחקור ספציפית)
9. על ה-Manitou 180ATJ — האם השגיאה מגיעה ממסך Deutz ECU (מנוע) או ממסך פקד הזרוע? (קריטי לאבחון)
10. יש לך ציוד MEC AWP בצי? (תיעוד MEC 1330SE זמין)
11. על ה-JLG 860SJ — האם נדרש Jaltest לקריאת קודים, או שיש מסך אבחון מובנה? (CAN bus tools required)
12. האם הדגם Genie GS-1532 קיים בצי? (מנואל שירות רשמי חדש #1272217 נמצא)

---

## הערת מפעיל

**גישה לרשת:** Supabase אינו נגיש מסביבת ה-CCR sandbox. כל הנתונים נשמרים ב-`web-knowledge-staging.json`.
להעלאה: `node scripts/upload-web-knowledge-staging.mjs` (מסביבה עם גישת רשת)

---

## סטטיסטיקות

| ריצה | תאריך | פריטים לפני | פריטים שנוספו | סה"כ בסטייג'ינג |
|------|--------|------------|--------------|----------------|
| 1 | 2026-05-09 | 0 | 64 | 64 |
| 2 | 2026-05-11 | 64 | 15 | 79 |

**פירוט מותגים בסטייג'ינג:**
- Dingli: 16 מקורות
- JLG: 27 מקורות
- Genie: 24 מקורות
- Manitou: 11 מקורות
- MEC: 3 מקורות

**פירוט נושאים:**
- fault_codes: 46 פריטים
- maintenance: 11 פריטים
- hydraulics: 6 פריטים
- electrical: 5 פריטים
- general: 3 פריטים
- parts: 1 פריט

**מודלים ללא תיעוד:** Dingli JCPT1212, JLG 510AJ
