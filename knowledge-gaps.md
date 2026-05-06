# AWP Knowledge Gaps
_עודכן: 2026-05-06_

## מה יש ב-DB (סטייג'ינג — ממתין להעלאה)

### Dingli
- JCPT0307 — קודי שגיאה מלאים (מנואל רשמי ManualsLib p.29)
- JCPT0607DCS — קודי שגיאה מלאים (קודים 10–112, ManualsLib p.31)
- JCPT0607A / JCPT1912DC — קוד 69 (Power Relay Sleep) + פתרון
- JCPT0607DCM — מנואל רשמי PDF (Dingli Global), כולל קודי שגיאה + קודי מנוע דיזל
- JCPT1412DC / JCPT1612DC — מנואל מפעיל (Advanced Access Platforms PDF) + רשימת מנואלים (ManualsLib) ✨חדש
- JCPT1418RT — מנואל ANSI רשמי PDF (Dingli Global)
- JCPT1208 — רק דף מוצר, ללא תיעוד fault codes
- JCPT2223RTB — מנואל מפעיל מלא עם fault codes (ManualsLib)
- Scissor general — מנואל מוצרים כולל JCPT0607–JCPT1912 (Dingli Global PDF)

### JLG
- 450A Series II — קודי שגיאה ספציפיים (ManualsLib עמ' 343)
- 450AJ / E450AJ — מנואל שירות מלא + flash code 3-3 + עמוד fault flash codes p.147 ✨חדש
- M450AJ — שירות מלא (simeri.fi)
- 2646ES — fault codes 9-2 ו-9-3 (Forkliftaction forum)
- 660SJ — קוד שגיאה ספציפי (Forkliftaction forum)
- 520AJ / boom general — קודי שגיאה כלליים (forkliftpdfmanuals.com + fridayparts.com) ✨חדש
- 860SJ — מוזכר ב-CodeReady + EWP Spares Australia fault codes guide ✨חדש
- General — מנגנון קודי שגיאה (jlg.com + aerialequipmentparts.com + Biberger) ✨חדש
- 510AJ — אין תיעוד ספציפי נמצא

### Genie
- GS-3246 / GS-2646 / GS-2046 — מנואל שירות רשמי (Genie #48339) + fault code chart p.50 + קוד 18 (JustAnswer ×2) + fault light diagnosis ✨חדש
- GS-1930/32 / GS-2032/32 / GS-2046/46 — מנואל שירות רשמי (Genie #96316)
- GS-1932 — קודי שגיאה מלאים: OIC E1–E13, DTC 01–68 (aerialequipmentparts, flatearthequipment, mechnician, Biberger) ✨חדש
- GS-4047 / GS-5390 — מוזכרים בהקשר קודי שגיאה (48V system)
- ECU GEN 5 / GEN 6 — מסמכי fault codes (Hindley Electronics)
- GSDS — קודי שגיאה E1–E20 + DTC 01–68 (272 קודים כולל), Genie רשמי

### Manitou
- 180ATJ — מנואל מפעיל + מעגל חשמלי EURO 3 + fault codes portal רשמי ✨חדש
- ATJ/VJR/TJ — קודי AWP כלליים + Manitou MDS software requirement
- General — Manitou error codes guide (machineseeker blog + truck-manuals.net + blog.usro.net)

## פערים לפי מודל

| מודל | מה חסר | עדיפות |
|------|---------|--------|
| Dingli JCPT1412DC | טבלת fault codes מפורטת מתוך מנואל (יש הפניה, חסרה חילוץ) | גבוהה |
| Dingli JCPT1208AC | שום תיעוד fault codes — לא נמצא אונליין | גבוהה |
| Dingli JCPT1212 | שום תיעוד — לא נמצא | גבוהה |
| JLG 520AJ | קודי שגיאה ספציפיים לדגם — נמצאו רק קודים כלליים לבום | גבוהה |
| JLG 860SJ | מנואל שירות מלא + קודי שגיאה ספציפיים — JLG Online Express בלבד | גבוהה |
| JLG 510AJ | אין תיעוד ספציפי — מנואל שירות קיים ב-JLG Online Express בלבד | בינונית |
| Genie GS-3246 | טבלת DTC מלאה (מעל קוד 68) — הפניה לעמ' 182 אך לא חולץ | בינונית |
| Manitou 180ATJ | קודי שגיאה ספציפיים לאחר Deutz — Manitou MDS נדרש לקריאה | גבוהה |
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

## הערת מפעיל (Agent)

בסביבת sandbox — גישת רשת ל-Supabase חסומה (Bash + Python: "Host not in allowlist") וWebFetch מוחזר 403 על כלל האתרים (הגנת bot).
47 פריטים מוכנים ב-`web-knowledge-staging.json` — 37 מריצות קודמות + 10 חדשים מריצה זו.

**להעלאה לDB:** הרץ `node scripts/upload-web-knowledge-staging.mjs` מסביבה עם גישת רשת ל-Supabase.

### 10 פריטים חדשים שנוספו בריצה זו (2026-05-06):
- JLG Error Code List with meanings, causes & solutions (Biberger.de, score 0.6)
- JLG E450A Help Descriptions & Fault Flash Codes page 147 (ManualsLib, score 0.9)
- JLG 450AJ Fault Code 3:3 — platform short circuit troubleshooting (JustAnswer, score 0.6)
- JLG Fault Codes List, Diagnosis & Repair (Friday Parts, score 0.6)
- JLG Fault Codes Complete Guide — what they mean (EWP Spares Australia, score 0.6)
- Genie Error Codes Detect & Fix guide (Biberger.de, score 0.6)
- Genie GS-3246 Error Code 18 after limit switch install (JustAnswer, score 0.6)
- Manitou Default Fault Codes — Official Manitou Diagnostic Portal (score 1.0) ⭐
- Genie GS-3246 2003 fault light causes and fixes (JustAnswer, score 0.6)
- Dingli JCPT1412DC manuals listing (ManualsLib, score 0.8)

## סטטיסטיקות

- מקורות web ב-DB לפני הריצה: לא ידוע (גישת רשת חסומה)
- פריטים בסטייג'ינג לפני הריצה: 37
- פריטים חדשים שנוספו לסטייג'ינג בריצה זו: 10
- סה"כ פריטים בסטייג'ינג: 47
- פריטים שנוספו לDB בריצה זו: 0 (חסימת רשת בסביבת sandbox)
- מודלים ללא תיעוד fault codes: JCPT1208, JCPT1212, JLG 520AJ (ספציפי), JLG 510AJ, JLG 860SJ (מפורט), Manitou 180ATJ (ספציפי)
- מותגים בסטייג'ינג: Dingli (10), JLG (14), Genie (13), Manitou (6), General (4)
- חיפושים שבוצעו בריצה זו: 15
- עמודים שנקראו (WebFetch): 0 (403 על כל הבקשות — הגנת bot)
