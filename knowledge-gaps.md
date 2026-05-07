# AWP Knowledge Gaps
_עודכן: 2026-05-07_

## מה יש ב-DB (סטייג'ינג — ממתין להעלאה)

### Dingli
- JCPT0307 — קודי שגיאה מלאים (מנואל רשמי ManualsLib p.29)
- JCPT0607DCS — קודי שגיאה מלאים (קודים 10–112, ManualsLib p.31)
- JCPT0607A / JCPT1912DC — קוד 69 (Power Relay Sleep) + פתרון
- JCPT0607DCM — מנואל רשמי PDF (Dingli Global), כולל קודי שגיאה + קודי מנוע דיזל
- JCPT1412DC / JCPT1612DC — מנואל מפעיל (Advanced Access Platforms PDF) + רשימת מנואלים (ManualsLib)
- JCPT1418RT — מנואל ANSI רשמי PDF (Dingli Global)
- JCPT1208 — דף מוצר בלבד + הפניה למרכז הורדה רשמי ✨חדש
- JCPT2223RTB — מנואל מפעיל מלא עם fault codes (ManualsLib)
- Scissor general — מנואל מוצרים כולל JCPT0607–JCPT1912 (Dingli Global PDF)
- מרכז הורדת מנואלים רשמי (en.cndingli.com) ✨חדש

### JLG
- 450A Series II — קודי שגיאה ספציפיים (ManualsLib עמ' 343)
- 450AJ / E450AJ — מנואל שירות מלא + flash code 3-3 + עמוד fault flash codes p.147
- M450AJ — שירות מלא (simeri.fi)
- 2646ES — fault codes 9-2 ו-9-3 (Forkliftaction forum)
- 660SJ — קוד שגיאה ספציפי (Forkliftaction forum)
- 520AJ / boom general — קודי שגיאה כלליים (forkliftpdfmanuals.com + fridayparts.com)
- 860SJ — מנואל חלקים רשמי (JLG CDN, part 3121140) + CodeReady + EWP Spares Australia ✨חדש
- General — מנגנון קודי שגיאה (jlg.com + aerialequipmentparts.com + Biberger)
- כלי אבחון JLG — דף רשמי עם כל הכלים (Analyzer, Mobile, Bluetooth, ClearSky) ✨חדש
- CAN Bus Control System — מנואל פרק 6 (3121171) עם אבחון CAN ו-ECM ✨חדש
- 510AJ — אין תיעוד ספציפי נמצא

### Genie
- GS-3246 / GS-2646 / GS-2046 — מנואל שירות רשמי (Genie #48339) + fault code chart p.50 + קוד 18 (JustAnswer ×2)
- GS-1930/32 / GS-2032/32 / GS-2046/46 — מנואל שירות רשמי (Genie #96316)
- GS-1932 — קודי שגיאה מלאים: OIC E1–E13, DTC 01–68 (aerialequipmentparts, flatearthequipment, mechnician, Biberger)
- GS-4047 / GS-5390 — מוזכרים בהקשר קודי שגיאה (48V system)
- ECU GEN 5 / GEN 6 — מסמכי fault codes (Hindley Electronics)
- GSDS — קודי שגיאה E1–E20 + DTC 01–68 (272 קודים כולל), Genie רשמי
- Lift Connect — מדריך אבחון ממשק telematics רשמי (Genie PDF) ✨חדש
- Z-45 XC — מנואל שירות רשמי (Genie CDN, part 1268197) ✨חדש
- Z-60 DC — מנואל שירות רשמי (Genie CDN, part 1271125) ✨חדש

### Manitou
- 180ATJ — מנואל מפעיל + מעגל חשמלי EURO 3 + fault codes portal רשמי
- ATJ/VJR/TJ — קודי AWP כלליים + Manitou MDS software requirement
- General — Manitou error codes guide (machineseeker blog + truck-manuals.net + blog.usro.net)
- Manitou Fault Codes List PDF (Scribd, document 446162823) ✨חדש

### MEC AWP (חדש בריצה זו)
- 1330SE — מנואל שירות + קודי שגיאה (mecawp.com, document 95834) ✨חדש
- Error Indicator Readout — מסמך קודי תצוגה (mecawp.com, document 43891) ✨חדש

## פערים לפי מודל

| מודל | מה חסר | עדיפות |
|------|---------|--------|
| Dingli JCPT1412DC | טבלת fault codes מפורטת מתוך מנואל (יש הפניה, חסרה חילוץ מהמנואל) | גבוהה |
| Dingli JCPT1208AC | fault codes — לא נחלץ; מרכז הורדה רשמי זוהה, נדרש גישה ישירה | גבוהה |
| Dingli JCPT1212 | שום תיעוד — לא נמצא | גבוהה |
| JLG 520AJ | קודי שגיאה ספציפיים לדגם — נמצאו רק קודים כלליים לבום | גבוהה |
| JLG 860SJ | מנואל שירות מלא + קודי שגיאה ספציפיים — JLG Online Express בלבד (מנואל חלקים נמצא) | גבוהה |
| JLG 510AJ | אין תיעוד ספציפי — מנואל שירות קיים ב-JLG Online Express בלבד | בינונית |
| Genie GS-3246 | טבלת DTC מלאה (מעל קוד 68) — הפניה לעמ' 182 אך לא חולץ | בינונית |
| Manitou 180ATJ | קודי שגיאה ספציפיים לדגם — Manitou MDS נדרש לקריאה מלאה | גבוהה |
| JLG 450AJ | flash codes מורכבים מ-3-3 — רק 3-3 נמצא בפורומים | נמוכה |

## שאלות לאופק

1. יש לך מנואל שירות ל-Dingli JCPT1412DC עם טבלת fault codes מלאה? (מנואל מפעיל נמצא, חסרה טבלת קודים בנפרד)
2. יש לך מנואל שירות ל-JLG 860SJ? (נדרש JLG Online Express — האם יש גישה?)
3. יש מסמך fault codes ספציפי ל-Manitou 180ATJ? (Manitou MDS נדרש — האם יש גישה לתוכנה?)
4. האם המכונות שלך מחוברות ל-JLG ClearSky או לכלי אחר לאבחון מרחוק?
5. יש לך אחת ממכונות Dingli JCPT1208 / JCPT1212 בצי? (ניתן לחלץ fault codes מהמכונה ישירות)
6. מה גרסת ה-ECU של ה-Genie GS-3246 שלך — GEN 5 או GEN 6? (משפיע על מספרי הקודים)
7. קוד שגיאה 57 (OVERLOAD) על Dingli — כמה פעמים קרה? ייתכן כשל בחיישן עומס?
8. על ה-JLG 520AJ — נראה flash code כלשהו? (נחקור את הקוד הספציפי בצורה ממוקדת)
9. על ה-Manitou 180ATJ — האם השגיאה מגיעה ממסך ה-Deutz ECU (מנוע) או ממסך פקד הזרוע?
10. יש לך ציוד MEC AWP בצי? (נוסף תיעוד MEC 1330SE לבסיס הידע בריצה זו)

## הערת מפעיל (Agent)

בסביבת sandbox — גישת רשת ל-Supabase חסומה (Bash + Python: "Host not in allowlist") וWebFetch מוחזר 403 על כלל האתרים (הגנת bot/Cloudflare).

**57 פריטים ב-`web-knowledge-staging.json`** — 47 מריצות קודמות + 10 חדשים מריצה זו.

**להעלאה לDB:** הרץ `node scripts/upload-web-knowledge-staging.mjs` מסביבה עם גישת רשת ל-Supabase.

### 10 פריטים חדשים שנוספו בריצה זו (2026-05-07):
1. JLG 800S/810SJ/860SJ Parts Manual רשמי (JLG CDN, part 3121140, score 1.0) ⭐
2. JLG Troubleshooting Tools — דף כלי אבחון רשמי (jlg.com, score 1.0) ⭐
3. Genie Lift Connect Troubleshooting Guide PDF רשמי (genielift.com, score 1.0) ⭐
4. Genie Z-45 XC Service Manual (Genie CDN, part 1268197, score 1.0) ⭐
5. Genie Z-60 DC Service Manual (Genie CDN, part 1271125, score 1.0) ⭐
6. Dingli Manual Download Center רשמי (en.cndingli.com, score 1.0) ⭐
7. Manitou Fault Codes List PDF (Scribd document 446162823, score 0.7)
8. MEC AWP 1330SE Service Manual Fault Codes (mecawp.com, score 0.8)
9. MEC AWP Error Indicator Readout (mecawp.com 43891-SCH, score 0.8)
10. JLG CAN Bus Control System Section 6 (3121171, discount-equipment.com, score 0.6)

## סטטיסטיקות

- מקורות web ב-DB לפני הריצה: לא ידוע (גישת רשת חסומה)
- פריטים בסטייג'ינג לפני הריצה: 47
- פריטים חדשים שנוספו לסטייג'ינג בריצה זו: 10
- סה"כ פריטים בסטייג'ינג: 57
- פריטים שנוספו לDB בריצה זו: 0 (חסימת רשת בסביבת sandbox — הרץ upload-web-knowledge-staging.mjs)
- מודלים ללא תיעוד fault codes: JCPT1208 (מרכז הורדה זוהה), JCPT1212, JLG 520AJ (ספציפי), JLG 510AJ, JLG 860SJ (שירות מלא), Manitou 180ATJ (ספציפי)
- מותגים בסטייג'ינג: Dingli (11), JLG (18), Genie (16), Manitou (6), MEC (2), General (4)
- חיפושים שבוצעו בריצה זו: 15
- עמודים שנקראו (WebFetch): 0 (403 על כל הבקשות — הגנת bot/Cloudflare)
- מקורות רשמיים חדשים (score 1.0) שנוספו: 6
