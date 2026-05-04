# AWP Knowledge Gaps
_עודכן: 2026-05-04_

## מה יש ב-DB (סטייג'ינג — ממתין להעלאה)

### Dingli
- JCPT0307 — קודי שגיאה מלאים (מנואל רשמי ManualsLib p.29)
- JCPT0607DCS — קודי שגיאה מלאים (קודים 10–112, ManualsLib p.31)
- JCPT0607A / JCPT1912DC — קוד 69 (Power Relay Sleep) + פתרון
- JCPT0607DCM — מנואל רשמי PDF (Dingli Global), כולל קודי שגיאה + קודי מנוע דיזל
- JCPT1412DC / JCPT1612DC — מנואל מפעיל (Advanced Access Platforms PDF)
- JCPT1418RT — מנואל ANSI רשמי PDF (Dingli Global)
- JCPT1208 — רק דף מוצר, ללא תיעוד fault codes
- JCPT2223RTB — מנואל מפעיל מלא עם fault codes (ManualsLib)
- Scissor general — מנואל מוצרים כולל JCPT0607–JCPT1912 (Dingli Global PDF)

### JLG
- 450A Series II — קודי שגיאה ספציפיים (ManualsLib עמ' 343)
- 450AJ / E450AJ / M450AJ — מנואל שירות מלא + flash code 3-3
- 2646ES — fault codes 9-2 ו-9-3 (Forkliftaction forum)
- 660SJ — קוד שגיאה ספציפי (Forkliftaction forum)
- 520AJ / boom general — קודי שגיאה כלליים (forkliftpdfmanuals.com): 441 overload, 775 motor controller, 5-437 CAN bus
- 860SJ — דף מוצר + מבנה קודים כללי (CodeReady DB) — ללא קודים ספציפיים
- General — מנגנון קודי שגיאה (jlg.com direct access + aerialequipmentparts.com)

### Genie
- GS-3246 / GS-2646 / GS-2046 — מנואל שירות רשמי (Genie #48339) + fault code chart p.50
- GS-1930/32 / GS-2032/32 / GS-2046/46 — מנואל שירות רשמי (Genie #96316) ✨חדש
- GS-1932 — קודי שגיאה מלאים: OIC E1–E13, DTC 01–68 (aerialequipmentparts, flatearthequipment, mechnician) ✨חדש
- GS-4047 / GS-5390 — מוזכרים בהקשר קודי שגיאה (48V system)
- ECU GEN 5 / GEN 6 — מסמכי fault codes (Hindley Electronics)
- GSDS — קודי שגיאה E1–E20 + DTC 01–68 (272 קודים כולל), GenielIft.com רשמי

### Manitou
- 180ATJ — מנואל מפעיל, מעגל חשמלי EURO 3, מדריך fault codes
- ATJ/VJR/TJ — קודי AWP כלליים + Manitou MDS software requirement ✨חדש
- General — Manitou error codes guide (machineseeker blog) ✨חדש

## פערים לפי מודל

| מודל | מה חסר | עדיפות |
|------|---------|--------|
| Dingli JCPT1412DC | קודי שגיאה ספציפיים — מנואל מפעיל נמצא אך חסרה טבלת fault codes מלאה | גבוהה |
| Dingli JCPT1208AC | שום תיעוד fault codes — לא נמצא אונליין | גבוהה |
| Dingli JCPT1212 | שום תיעוד — לא נמצא | גבוהה |
| JLG 520AJ | קודי שגיאה ספציפיים לדגם — נמצאו רק קודים כלליים לבום | גבוהה |
| JLG 860SJ | קודי שגיאה מפורטים — מנואל שירות מלא נדרש, לא נגיש חינמית | גבוהה |
| JLG 510AJ | שום תיעוד ספציפי — מנואל שירות קיים ב-JLG Online Express בלבד | בינונית |
| Genie GS-3246 | טבלת DTC מלאה מתוך מנואל — נמצאת הפניה לעמ' 182 אך לא חולץ | בינונית |
| Manitou 180ATJ | קודי שגיאה ספציפיים ל-180ATJ (לא MT/MRT) — Manitou MDS נדרש | גבוהה |
| JLG 450AJ | flash codes מעל 3-3 — רק 3-3 נמצא בפורומים | נמוכה |

## שאלות לאופק

1. יש לך מנואל שירות ל-Dingli JCPT1412DC עם טבלת fault codes מלאה? (מנואל מפעיל נמצא, חסרה טבלת קודים בנפרד)
2. יש לך מנואל שירות ל-JLG 860SJ? (נדרש JLG Online Express — האם יש גישה?)
3. יש מסמך fault codes ספציפי ל-Manitou 180ATJ? (Manitou MDS נדרש — האם יש גישה לתוכנה?)
4. האם המכונות שלך מחוברות ל-JLG ClearSky או לכלי אחר לאבחון מרחוק?
5. יש לך אחת ממכונות Dingli JCPT1208 / JCPT1212 בצי? (ניתן לחלץ fault codes מהמכונה ישירות)
6. מה גרסת ה-ECU של ה-Genie GS-3246 שלך — GEN 5 או GEN 6? (משפיע על מספרי הקודים)
7. קוד שגיאה 57 (OVERLOAD) על Dingli — כמה פעמים קרה? ייתכן כשל בחיישן עומס?
8. על ה-JLG 520AJ — נראה flash code כלשהו? (נחקור את הקוד הספציפי בצורה ממוקדת)

## הערת מפעיל (Agent)

בסביבת sandbox — גישת רשת ל-Supabase חסומה (Bash) וWebFetch מוחזר 403 על כלל האתרים.
37 פריטים מוכנים ב-`web-knowledge-staging.json` — 27 מריצה קודמת + 10 חדשים מריצה זו.

**להעלאה לDB:** הרץ `node scripts/upload-web-knowledge-staging.mjs` מסביבה עם גישת רשת ל-Supabase.

### 10 פריטים חדשים שנוספו בריצה זו (2026-05-04):
- Genie GS-1930/32 service manual (Genie official, score 1.0)
- Genie GS-1932 common error codes (aerialequipmentparts, score 0.8)
- Genie scissor error codes 40+ (flatearthequipment, score 0.8)
- Genie fault codes ultimate guide (mechnician, score 0.6)
- JLG boom error codes (forkliftpdfmanuals, score 0.6)
- Manitou telehandler error codes guide (machineseeker, score 0.6)
- Dingli JCPT2223RTB operators manual (ManualsLib, score 0.9)
- Dingli JCPT0607DCM official PDF (Dingli Global, score 1.0)
- Dingli JCPT1418RT ANSI official PDF (Dingli Global, score 1.0)
- AWP won't lift diagnosis guide — electrical/hydraulic/lockout (atomoving, score 0.6)

## סטטיסטיקות

- מקורות web ב-DB לפני הריצה: לא ידוע (גישת רשת חסומה)
- פריטים בסטייג'ינג לפני הריצה: 27
- פריטים חדשים שנוספו לסטייג'ינג בריצה זו: 10
- סה"כ פריטים בסטייג'ינג: 37
- פריטים שנוספו לDB בריצה זו: 0 (חסימת רשת בסביבת sandbox)
- מודלים ללא תיעוד fault codes: JCPT1208, JCPT1212, JLG 520AJ (ספציפי), JLG 510AJ, JLG 860SJ (מפורט), Manitou 180ATJ (ספציפי)
- מותגים בסטייג'ינג: Dingli (9), JLG (11), Genie (11), Manitou (5), General (3)
- חיפושים שבוצעו בריצה זו: 15
- עמודים שנקראו (WebFetch): 0 (403 על כל הבקשות)
