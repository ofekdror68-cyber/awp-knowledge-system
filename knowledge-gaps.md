# AWP Knowledge Gaps
_עודכן: 2026-05-03_

## מה יש ב-DB
- Dingli JCPT0307 — קודי שגיאה מלאים (מנואל רשמי ManualsLib)
- Dingli JCPT0607DCS — קודי שגיאה מלאים (קודים 10–112, ManualsLib p.31)
- Dingli JCPT1912DC / JCPT0607A — קוד 69 (Power Relay Sleep) + פתרון
- Dingli JCPT1412DC / JCPT1612DC — מנואל מפעיל (Advanced Access Platforms PDF)
- Dingli JCPT1208 — רק דף מוצר, ללא תיעוד fault codes
- JLG — מנגנון קודי שגיאה כללי (CodeReady DB, aerialequipmentparts.com)
- JLG 450A Series II — קודי שגיאה ספציפיים (ManualsLib עמ' 343)
- JLG 450AJ / E450AJ / M450AJ — מנואל שירות מלא + flash code 3-3
- JLG 2646ES — fault codes 9-2 ו-9-3 (Forkliftaction forum)
- JLG 660SJ — קוד שגיאה ספציפי (Forkliftaction forum)
- JLG 860SJ — דף מוצר + מבנה קודים כללי (ללא קודים ספציפיים)
- Genie GS-3246 / GS-2646 / GS-2046 — מנואל שירות רשמי (Genie #48339)
- Genie GS-1932 / GS-1930 / GS-2032 / GS-2632 — מנואל שירות רשמי
- Genie ECU GEN 5 / GEN 6 — מסמכי fault codes (Hindley Electronics)
- Genie GSDS — קודי שגיאה E1–E20 + DTC 01–68 (272 קודים כולל)
- Manitou 180ATJ — מנואל מפעיל, מעגל חשמלי EURO 3, מדריך fault codes 2025
- Manitou ATJ/VJR/TJ — קודי AWP כלליים (A01, A05, A09, A15, H07, B02)

## פערים לפי מודל

| מודל | מה חסר | עדיפות |
|------|---------|--------|
| Dingli JCPT1412DC | קודי שגיאה ספציפיים מהמנואל (מנואל מפעיל נמצא — חסר fault codes table) | גבוהה |
| Dingli JCPT1208AC | שום תיעוד fault codes — לא נמצא אונליין | גבוהה |
| Dingli JCPT1212 | שום תיעוד — לא נמצא | גבוהה |
| JLG 520AJ | קודי שגיאה ספציפיים לדגם (ידוע שיש — לא נגיש) | גבוהה |
| JLG 860SJ | קודי שגיאה מפורטים — מנואל שירות מלא נדרש | גבוהה |
| JLG 510AJ | שום תיעוד ספציפי — מנואל שירות נמצא ב-Scribd בלבד | בינונית |
| Genie GS-3246 | DTC 01–68 מלא בתוך מנואל (נמצאת הפניה — לא חולץ) | בינונית |
| Genie GS-1932 | קודים ספציפיים מעל DTC 68 | בינונית |
| Manitou 180ATJ | קודי שגיאה ספציפיים ל-180ATJ (לא 100VJR/280TJ) | גבוהה |

## שאלות לאופק

1. יש לך מנואל שירות ל-Dingli JCPT1412DC עם רשימת fault codes מלאה? (מנואל מפעיל נמצא, אבל חסר טבלת קודים)
2. יש לך מנואל שירות ל-JLG 860SJ? (מה-service center / JLG Online Express)
3. יש מסמך fault codes ספציפי ל-Manitou 180ATJ בנפרד מהמנואל הכללי?
4. האם המכונות שלך מחוברות ל-JLG ClearSky או לכלי אחר לאבחון מרחוק?
5. יש לך אחת ממכונות Dingli JCPT1208 / JCPT1212 בצי? (אם כן — אפשר לחלץ fault codes מהמכונה עצמה)
6. מה גרסת ה-ECU של ה-Genie GS-3246 שלך — GEN 5 או GEN 6? (משפיע על מספרי הקודים)
7. קיבלת פעם קוד שגיאה ספציפי על ה-JLG 520AJ שלא הצלחת לאבחן?

## הערת מפעיל (Agent)

בריצה זו WebFetch חזר 403 על כל ה-URLs (כולל Wikipedia) — חסימה ברמת sandbox.
כל 27 הפריטים נשמרו ב-`web-knowledge-staging.json` ומוכנים להעלאה.
**להעלאה לDB:** הרץ `node scripts/upload-web-knowledge-staging.mjs` מסביבה עם גישת רשת ל-Supabase.

## סטטיסטיקות

- מקורות web ב-DB לפני הריצה: 17 (לפי ריצה קודמת)
- פריטים חדשים שמוכנים בסטייג'ינג: 27
- פריטים שנוספו לDB בריצה זו: 0 (חסימת רשת בסביבת sandbox)
- מודלים ללא תיעוד fault codes: JCPT1208, JCPT1212, JLG 520AJ, JLG 510AJ, JLG 860SJ
- מותגים בסטייג'ינג: Dingli (7), JLG (10), Genie (7), Manitou (5)
- קודי שגיאה שנמצאו בסריקה: Dingli 10 קודים (10–112), Genie 14 קודים (01–68 + OIC), JLG flash code 3-3, Manitou codes (A01, H07 etc.)
