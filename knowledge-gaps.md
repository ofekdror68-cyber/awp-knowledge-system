# AWP Knowledge Gaps
_עודכן: 2026-05-16_

## מה יש ב-DB (סטייג'ינג — ממתין להעלאה)

> **ריצה 7 (2026-05-16):** 9 פריטים חדשים נוספו לסטייג'ינג (108 סה"כ)
> **ריצה 6 (2026-05-15):** 12 פריטים חדשים נוספו לסטייג'ינג (99 סה"כ)
> **ריצה 5 (2026-05-14):** 4 פריטים חדשים נוספו לסטייג'ינג (רוב המקורות כבר היו ב-DB מריצות קודמות)
> **ריצה 4 (2026-05-13):** 30 פריטים חדשים מזוהים — לא הועלו לסטייג'ינג (חסימת רשת)

### Dingli (ריצה 7 — חדש)
- JCPT0607A קוד 58 (Pothole) — פירוט: חיישן pothole guard מופעל; בדוק sensor wiring, arms חופשיות, reset E-stop (chinaliftsupply.com)
- JCPT1418RT — מנואל מפעיל ANSI מלא עם fault code list (Advanced Access Platforms PDF)

### Dingli (ריצה 4 — חדש)
- JCPT0607A קוד 20 (General Alarm TM1) — עם אבחון ופתרון מפורט (chinaliftsupply.com)
- JCPT0607A קוד 69 (Power Relay Sleep) — עם אבחון ופתרון מפורט (chinaliftsupply.com)
- JCPT1912DC קוד 69 (Power Relay Sleep) — ספציפי לדגם (chinaliftsupply.com)
- JCPT0607DCM — מדריך פרמטרים רשמי PDF (dingliglobal.com/upload)

### Dingli
- JCPT0307 — קודי שגיאה מלאים (מנואל רשמי ManualsLib p.29)
- JCPT0607DCS — קודי שגיאה מלאים (קודים 10–112, ManualsLib p.31) + אינדקס מנואלים (ManualsLib product page) ✨חדש ריצה 6
- JCPT0607A / JCPT1912DC — קוד 69 (Power Relay Sleep) + פתרון
- JCPT0607A — קוד 20 (General Alarm TM1) + אבחון ופתרון ✨חדש
- JCPT0607DCM — מנואל רשמי PDF (Dingli Global) + קודי מנוע דיזל
- JCPT0607 כללי — דף מנואל ב-Alplift (זוהו וריאנטים: DCS, DCM, DCE)
- JCPT1412DC / JCPT1612DC — מנואל מפעיל (Advanced Access Platforms PDF) + רשימת מנואלים (ManualsLib)
- JCPT1418RT — מנואל ANSI רשמי PDF (Dingli Global)
- JCPT1208AC — דף מוצר + הפניה למרכז הורדה רשמי
- JCPT2223RTB — מנואל מפעיל מלא עם fault codes (ManualsLib)
- JCPT HD-DC — מדריך חלקים (Scribd, Russian) ✨חדש
- Scissor general — מנואל מוצרים (Dingli Global PDF) + מרכז הורדה רשמי (en.cndingli.com)

### JLG (ריצה 7 — חדש)
- 450A/AJ Series II — עמוד 343 טבלת fault codes מלאה: קטגוריות 1(ECM), 2(platform), 3(sensor), 4(drive), 5(software) (manualsdir.com)
- Fault code 43 — קוד 43 = short circuit בdriver output / solenoid coil; בדוק התנגדות סליל 20–30Ω; אם OK — controller פגום (forkliftaction forum)
- Scissor Lift general — מדריך Intella Parts: drive/lift/limit switches/tilt sensor diagnosis (intellaparts.com)

### JLG (ריצה 6 — חדש)
- 450AJ Series 1 (Ford) — קורוזיית מחברי חוטים → אובדן שליטה על שסתומים; בדיקת connectors בחיבור הזרוע (Forkliftaction)
- Flash Code System — sequence 1 = קטגוריה, sequence 2 = קוד ספציפי (3-3 = sensor, 4-4 = drive) (Forkliftaction)
- 20MVL — fault code 343 = platform tilt/level sensor circuit (Forkliftaction)

### JLG (ריצה 5 — חדש)
- 510AJ — מנואל שירות מלא (Scribd, document 459380562) — CAN bus diagnostics, fault codes via JLG Analyzer
- 450AJ Series 1 (Ford engine) — אבחון תקלת הידראוליקה: אי-שליטה על שסתומים (Forkliftaction forum) — בדיקת connectors ב-harness
- T350 / T500J — מנואל Troubleshooting רשמי (JLG CDN, 3121203) — כולל CAN diagnostics, hydraulic/electrical fault trees
- MEC Mast Series — מנואל שירות (95568-A92.20, mecawp.com) — fault codes, solenoid checks

### JLG (ריצה 4 — חדש)
- 860SJ — מידע diagnostic port + Machine Analyzer p/n 1001249695 (EWP Spares AU)
- Multiple — JLG error codes database: codeready.org (DTC listing), biberger.de (codes+solutions), fridayparts.com
- 2646 ES — אישור קוד 9-3: חוטים שבורים ב-platform control box connector (Forkliftaction forum)

### JLG
- 450A Series II — קודי שגיאה ספציפיים (ManualsLib עמ' 343)
- 450AJ / E450AJ — מנואל שירות מלא + flash code 3-3 + fault flash codes p.147 + מנואל ANSI 2000 (Rentalex PDF)
- 450AJ Series II — אבחון חסימות, 2-speed, warning lights (JustAnswer) ✨חדש
- 45E / 3246ES / E400AJPN — flash fault codes מוטוריים (JustAnswer) ✨חדש
- M450AJ — שירות מלא (simeri.fi)
- 2646ES — fault codes 9-2 ו-9-3 (Forkliftaction forum)
- 660SJ — קוד שגיאה ספציפי (Forkliftaction forum)
- Error code 5:437 — אבחון forkliftaction forum ✨חדש
- 520AJ — קודי שגיאה כלליים + JLG fault codes PDF list (elviento.org)
- 860SJ — מנואל חלקים רשמי (JLG CDN) + כלי אבחון (Mechnician/Jaltest) + JLG 3121259 telescope valve fault + JLG 1200SJP/1350SJP TM (cranedude)
- General — מנגנון קודי שגיאה (jlg.com + aerialequipmentparts.com + Biberger) + כלי אבחון רשמיים
- CAN Bus Control System — מנואל פרק 6 עם אבחון CAN ו-ECM
- 510AJ — מנואל שירות נמצא (Scribd) — fault codes דורשים JLG Analyzer לחילוץ

### Genie (ריצה 7 — חדש)
- GS-3246 — Fehlercodes PDF (Scribd, German): DTC קודים 01–68, OIC E1/E2/E3/E4/E6/E12/E13 עם תיאורים (scribd.com)
- GS-1932 — אינדקס מנואלים: service, operator, maintenance — 9 מנואלים זמינים (ManualsLib)
- GS Series — מנואל שירות מלא: 272 DTC + 6 OIC, fault diagnosis p.182, CAN bus procedures (manuals.plus)
- ANSI multi-brand — קודי שגיאה field service ANSI לסוגי scissor lifts שונים (axcs.com)

### Genie (ריצה 6 — חדש)
- GS-1530/1532 — מנואל מפעיל רשמי (Genie CDN, SN GS30P-200101+) — SmartLink E-stop reset procedure
- S-40 XC — מנואל שירות רשמי (#1286829GT) + fault code diagnostics + hydraulic + CAN bus

### Genie (ריצה 4 — חדש)
- GS-3246 — אישור קוד 18 (Pothole Guard): בדוק חסימה, limit switches, ו-wiring
- GS-1932 — GSDS: 272 DTC + 6 OIC; 5 קטגוריות; קודים E1/E4/E6/E12/E13
- GEN5/GEN6 ECU — PDF codes (hindleyelectronics.com) — שני דורות מכוסים
- Multiple — mechnician.com, aerialequipmentparts.com, biberger.de (עם פתרונות לכל קוד)

### Genie
- GS-3246 / GS-2646 / GS-2046 — מנואל שירות רשמי (#48339) + fault code chart p.50 + קוד 18 (JustAnswer)
- GS-1930/32 / GS-2032/32 — מנואל שירות רשמי (#96316) + מנואל מעודכן (#97385 Rev E10 2012)
- GS-1530/1532 / GS-2032 / GS-2632 — מנואל שירות רשמי (#1272217) + גרסת Scribd ✨חדש
- GS-1330m — מנואל שירות רשמי (#1309020)
- GS-1932 — קודי שגיאה מלאים: OIC E1–E13, DTC 01–68 (aerialequipmentparts, flatearthequipment, mechnician, Biberger)
- ECU GEN 5 / GEN 6 — מסמכי fault codes (Hindley Electronics)
- GSDS — 272 קודים כולל + Genie Lift Connect
- Z-45 XC / Z-60 DC — מנואלי שירות רשמיים (Genie CDN)
- Hybrid Lifts — דף קודי שגיאה (ANSI multi-brand)

### Manitou (ריצה 4 — חדש)
- ATJ series — מדריך קודי תקלה: machineseeker.com blog, truck-manuals.net DTC
- Fault Codes PDF (Scribd 446162823) — רשימה כוללת עם פתרונות

### Manitou
- 180ATJ — מנואל מפעיל + מעגל חשמלי EURO 3 + Manitou MDS software רשמי
- 180ATJ — קודי Deutz engine (Scribd)
- MT1440PE3 / MT1840PE3 — טבלת DTC מלאה (Scribd, document 486689762) ✨חדש
- MT1440PE3 / MT1840PE3 — PDF DTC מלא (jimcontent)
- ATJ/VJR/TJ — קודי AWP כלליים + Manitou diag portal + machineseeker blog + truck-manuals.net
- Manitou Fault Codes List PDF (Scribd, document 446162823)

### MEC AWP
- 1330SE — מנואל שירות + קודי שגיאה (mecawp.com)
- Error Indicator Readout — מסמך קודי תצוגה (mecawp.com)
- Mast Series 95568-A92.20 — מנואל שירות מאי 2021 (mecawp.com) ✨חדש ריצה 5

### כללי (ריצה 6 — חדש)
- הידראוליקה מלאה — שמן נמוך, מסנן סתום, אוויר, לחץ — תחזוקה ואבחון (atomoving)
- Scissor Lift Best Practices — E-stop/interlock/battery/hydraulic sequence + manual override (atomoving)
- AWP Troubleshooting Guide — סדר אבחון מסודר (onenforklifts)
- Common Scissor Lift Problems — drift, drive fault, tilt, E-stop reset (fieldex)
- Electrical Troubleshooting — CAN bus, controller PWM, connector corrosion (electriciantalk forum)
- Lift Fault Table — solenoid coil test (20-30Ω), air bleed, seal replacement (j-lifte)

### כללי
- תחזוקת מלגזות גובה — מדריך מקיף (LGLifter) ✨חדש
- הידראוליקה — מניעת תקלות + פתרון (yorkpmh, cylindersinc, atomoving)

---

## פערים לפי מודל

| מודל | מה חסר | עדיפות |
|------|---------|--------|
| Dingli JCPT1412DC | טבלת fault codes מפורטת מתוך מנואל (יש הפניה, חסרה חילוץ) | גבוהה |
| Dingli JCPT1208AC | fault codes — לא נחלץ; מרכז הורדה רשמי זוהה | גבוהה |
| Dingli JCPT1212 | שום תיעוד ספציפי — לא נמצא | גבוהה |
| JLG 520AJ | קודי שגיאה ספציפיים לדגם — נמצאו רק קודים כלליים | גבוהה |
| JLG 860SJ | מנואל שירות מלא — JLG Online Express בלבד (מנואל חלקים + כלי אבחון נמצאו) | גבוהה |
| JLG 510AJ | מנואל שירות נמצא (Scribd) — fault codes דורשים JLG Analyzer | בינונית |
| Genie GS-3246 | טבלת DTC מלאה (מעל קוד 68) — הפניה לעמ' 182 אך לא חולץ | בינונית |
| Manitou 180ATJ | קודי שגיאה ספציפיים לדגם — Manitou MDS נדרש לקריאה מלאה | גבוהה |
| JLG 450AJ | flash codes מורכבים — קוד 5:437 וקודי מוטור נמצאו בפורומים | נמוכה |

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
10. יש לך ציוד MEC AWP בצי? (תיעוד MEC 1330SE + Mast Series 95568 זמין)
11. על ה-JLG 860SJ — האם נדרש Jaltest לקריאת קודים, או שיש מסך אבחון מובנה? (CAN bus tools required)
12. האם הדגם Genie GS-1532 קיים בצי? (מנואל שירות רשמי חדש #1272217 נמצא)
13. על ה-JLG 450AJ — האם ראית קוד 5:437 ספציפית? (נדון בפורום forkliftaction)
14. האם ה-Dingli JCPT0607A שלך מציג קוד 20 (TM1) תדיר? ייתכן כשל בבקר הנעה
15. על ה-JLG 450AJ — בדקת קורוזיה במחברי הכבלים בחיבור הזרוע? זו הסיבה הנפוצה ביותר לאובדן שליטה על שסתומים
16. יש לך Genie S-40 XC בצי? מנואל שירות מלא נמצא (מספר 1286829GT) כולל fault codes ו-CAN bus
17. על כל דגם JLG — האם צוות השירות מחזיק JLG handset (service analyzer)? חיוני לאבחון מלא של CAN bus faults

---

## הערת מפעיל

**גישה לרשת:** Supabase אינו נגיש מסביבת ה-CCR sandbox (DNS לא מתפוסת). כל הנתונים נשמרים ב-`web-knowledge-staging.json`.
להעלאה: `node scripts/upload-web-knowledge-staging.mjs` (מסביבה עם גישת רשת)

---

## סטטיסטיקות

| ריצה | תאריך | פריטים לפני | פריטים שנוספו | סה"כ בסטייג'ינג |
|------|--------|------------|--------------|----------------|
| 1 | 2026-05-09 | 0 | 64 | 64 |
| 2 | 2026-05-11 | 64 | 15 | 79 |
| 3 | 2026-05-12 | 79 | 8 | 87 |
| 4 | 2026-05-13 | 87 | 0* | 87 |
| 5 | 2026-05-14 | 87 | 4† | 91 |
| 6 | 2026-05-15 | 87 | 12 | 99 |
| 7 | 2026-05-16 | 99 | 9 | 108 |

*ריצה 4: 30 פריטים זוהו אך לא הועלו לסטייג'ינג (חסימת רשת).
†ריצה 5: JSON בפועל נשאר 87 (commit לא נדחף); 4 פריטים תועדו ב-knowledge-gaps בלבד.
ריצה 6: WebFetch חסום (403) — 12 פריטים חדשים נוספו לסטייג'ינג מנתוני חיפוש; Supabase עדיין לא נגיש.
ריצה 7: WebFetch חסום (403), Supabase לא נגיש — 9 פריטים חדשים נוספו לסטייג'ינג מנתוני חיפוש.

**פירוט מותגים בסטייג'ינג (ריצה 7 מצטברת, 108 פריטים):**
- Dingli: 20 מקורות
- JLG: 36 מקורות
- Genie: 31 מקורות
- Manitou: 12 מקורות
- MEC: 3 מקורות
- כללי: 6 מקורות

**ריצה 7 — פריטים חדשים (9):**
- Dingli JCPT0607A קוד 58 — Pothole protection: sensor check, arms, reset E-stop (chinaliftsupply.com)
- Dingli JCPT1418RT — מנואל ANSI מלא עם fault code list (advancedaccessplatforms.co.uk PDF)
- Genie GS-3246 Fehlercodes — DTC 01–68 + OIC E1–E13 פירוט (Scribd, German)
- Genie GS-1932 — אינדקס 9 מנואלים + GSDS fault categories (ManualsLib)
- Genie GS Series — שירות מלא: 272 DTC + CAN bus procedures, fault diagnosis p.182 (manuals.plus)
- ANSI scissor lift error codes — field service cross-reference multi-brand (axcs.com)
- JLG 450A/AJ Series II — טבלת fault codes p.343: קטגוריות 1–5 (manualsdir.com)
- JLG fault code 43 — short circuit בdriver/solenoid: בדוק 20–30Ω, אם OK — controller (forkliftaction)
- JLG scissor lift troubleshooting — drive/lift/limit switches/tilt sensor (intellaparts.com)

**חיפושים שבוצעו בריצה 7:** 15
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403 / Supabase ECONNREFUSED)
**מודלים ללא תיעוד:** Dingli JCPT1212, Manitou 180ATJ (fault codes ספציפיים)
