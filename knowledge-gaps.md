# AWP Knowledge Gaps
_עודכן: 2026-05-22_

## מה יש ב-DB (סטייג'ינג — ממתין להעלאה)

> **ריצה 13 (2026-05-22):** 18 פריטים חדשים נוספו לסטייג'ינג (161 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 22 חיפושים — 100+ URL בדוקים, 18 חדשים. כולל: Manitou 180ATJ מנואל שירות (Scribd), Manitou diag portal codes-list, Manitou 180ATJ 2 E3 RC ManualsLib, JLG 860SJ parts AJ רשמי, JLG 860SJ platform leveling fault p.245, JLG 860SJ/860AJ מנואלי אינדקס, JLG 600SJ fault codes p.266, Genie GS-3246 parts+operator, Dingli JCPT0807PA+0807HA, MEC SE Series. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`
> **ריצה 12 (2026-05-21):** 18 פריטים חדשים נוספו לסטייג'ינג (143 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 15 חיפושים — 70+ URL בדוקים, 18 חדשים. כולל: Dingli JCPT1412HD מנואל, Genie GS-3246 מנואל שירות, GS-1932 מנואל רשמי, GS-2669RT, JLG 600SJC fault codes, JLG 520208 קוד, JLG LSS Boom מנואל, 8 threads מ-forkliftaction.com. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`
> **ריצה 11 (2026-05-20):** 0 פריטים חדשים — כל URL שנמצא בריצה כבר קיים ב-staging (125 סה"כ, אין שינוי). Supabase ECONNREFUSED; WebFetch חסום (403). 15 חיפושים — 50+ URL בדוקים, 0 חדשים. הסטייג'ינג רווי לדפוסי החיפוש הנוכחיים — יש להרחיב לחיפושים חדשים (JCPT1208, JCPT1212, 520AJ DTC). להעלאה: `python3 save_to_supabase.py`
> **ריצה 10 (2026-05-19):** 3 פריטים חדשים נוספו לסטייג'ינג (125 סה"כ); Supabase ECONNREFUSED; WebFetch חסום (403). 15 חיפושים — כל 50 URL שנבדקו ב-staging חוץ מ-3 חדשים. להעלאה: `python3 save_to_supabase.py`
> **ריצה 9 (2026-05-18):** 14 פריטים חדשים נוספו לסטייג'ינג (122 סה"כ); Supabase ECONNREFUSED; WebFetch חסום (403). להעלאה: `python3 save_to_supabase.py`
> **ריצה 8 (2026-05-17):** 30 פריטים חדשים מזוהים — נשמרו ב-`pending_knowledge.json`; Supabase NXDOMAIN. להעלאה: `python3 save_to_supabase.py`
> **ריצה 7 (2026-05-16):** 9 פריטים חדשים נוספו לסטייג'ינג (108 סה"כ)
> **ריצה 6 (2026-05-15):** 12 פריטים חדשים נוספו לסטייג'ינג (99 סה"כ)
> **ריצה 5 (2026-05-14):** 4 פריטים חדשים נוספו לסטייג'ינג (רוב המקורות כבר היו ב-DB מריצות קודמות)
> **ריצה 4 (2026-05-13):** 30 פריטים חדשים מזוהים — לא הועלו לסטייג'ינג (חסימת רשת)

### ריצה 13 — פריטים חדשים (2026-05-22)
18 פריטים חדשים נוספו לסטייג'ינג לפי מותג:
- **Manitou (5):** 180ATJ 2 E3 RC ManualsLib, 180ATJ service manual (Scribd EN), diag.manitou-group.com/default-codes-list (רשמי 1.0), Manitou MT625 error code 520352 (JustAnswer), AllForkliftManuals Manitou fault codes
- **JLG (7):** 860SJ parts manual AJ 3121842 (JLG רשמי 1.0), 600SJ fault codes p.266 (ManualsLib), 860SJ ManualsLib index, 860SJ platform leveling fault p.245 (ManualsDir), 860SJ no-reverse diagnosis (JustAnswer), 860AJ UGM CAN bus fault (JustAnswer), 520AJ operation manual (ManualsLib Oshkosh-JLG)
- **Genie (3):** GS-3246 ManualsLib index, GS-3246 parts manual (Rentalex), GS-3246 operators manual (Rentalex) עם OIC E1/E4/E6/E12/E18
- **Dingli (2):** JCPT0807PA parts manual רשמי (Dingli CDN 1.0), JCPT0807HA operator manual (Vertikaluk) עם fault codes 10/20/30/54/57/58/59
- **MEC (1):** SE Series service manual 95918-SCH עם fault codes וסוליינואיד 20-30Ω

### ריצה 12 — פריטים חדשים (2026-05-21)
18 פריטים חדשים נוספו לסטייג'ינג לפי מותג:
- **Dingli (1):** JCPT1412HD מנואל מפעיל PDF (bensrental.sg) — קודים 10/20/30/51-59/69
- **JLG (7):** 600SJC fault codes עמ' 230 (ManualsLib), JLG fault codes PDF כולל 450AJ/520AJ/860SJ (webflow), JLG LSS Boom מנואל רשמי (JLG CDN), JLG 450A/AJ parts manual (JLG CDN), JLG fault code 520208:10 (JustAnswer), forkliftaction JLG expert advice thread, forkliftaction no-travel diagnosis
- **Genie (4):** GS-1932 מנואל שירות #1321209 (Genie רשמי score 1.0), GS-2669RT מנואל #1272219 (Genie רשמי), GS-3246 מנואל שירות מלא (rentalex PDF), GS forum general (scissor-lifting.com)
- **כללי/פורום (6):** 7 threads ב-forkliftaction.com על fault codes כלליים, קריאת קודים, no-travel, קוד 01-3

### ריצה 9 — פריטים חדשים (2026-05-18)
14 פריטים חדשים נוספו לסטייג'ינג לפי מותג:
- **JLG (9):** 9-9/99-5 Power Module Failure (JLG רשמי), Flash Code 2-5 (pothole sensor JustAnswer), T350 Flash Code 9, Code 211 (power cycle boom lifts), 800S/860SJ Analyzer codes p.308, DSP M DTC p.93, 660SJ/860SJ מדריך מקיף, 520AJ שירות מלא (Issuu), fault codes guide כללי
- **Genie (4):** Z-45/25 fault codes p.102, GS-2646AV OIC/DTC p.92, GS-1530/32 OIC/DTC p.180, GS-1930/1932 רשימת קודים מלאה עם פתרונות
- **Manitou (1):** diag.manitou-group.com portal — קודי ברירת מחדל רשמיים

### ריצה 8 — פריטים חדשים (2026-05-17)
30 פריטים חדשים נוספו ל-`pending_knowledge.json` לפי מותג:
- **Dingli (8):** JCPT0607A קוד 58/20/69 (פירוט מלא), JCPT1912DC קוד 69, JCPT0607DCS קודים 10–112, JCPT0307 קודים, JCPT1412DC מנואל, JCPT0607DCM מנואל רשמי, Dingli Scissor PDFs
- **JLG (9):** 450AJ Series II fault codes, 450AJ שירות PDF, JLG fault codes רשמי, JLG boom codes, 450AJ hydraulic forum, 660SJ forum, intellaparts troubleshooting, manualsdir p.343, ewpspares 860SJ
- **Genie (7):** GS-3246/2646/2046 שירות רשמי (קוד 18+רשימה), Genie 40+ קודים, ECU GEN5, ECU GEN6, Genie official scissor codes, biberger guide, GS-1932 E1/E4/E6
- **Manitou (4):** Fault codes PDF (Scribd), DTC list, machineseeker guide, ManualsLib 180ATJ
- **כללי (2):** scissor lift problems, hydraulic failure prevention

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

### JLG (ריצה 10 — חדש)
- T350 / T500J — Troubleshooting Manual 3121203 (Sep 2005, SN 0030000001–0030012032): CAN bus diagnostics, electrical/hydraulic fault trees, flash code identification (csapps.jlg.com, score 1.0)

### JLG (ריצה 9 — חדש)
- 9-9/99-5 — Power Module Failure / Personality Range Error: כשל ב-EPROM של power module ב-ES Scissors; פתרון: JLG Analyzer + החלפת power module (JLG רשמי, score 1.0)
- Flash Code 2-5 — JLG 3246ES: drive חסום עקב pothole sensor; בדוק יישור pothole bars שמאל וימין (JustAnswer)
- Code 211 — Power Cycle Required: אתחול מלא של מכונה (E-stop 30 שניות); אם נמשך — JLG Analyzer; נפוץ ב-450AJ, 520AJ, 860SJ
- Flash Code 9 — JLG T350: אינדיקציה כוללת לדרישת שירות; חובה JLG Analyzer לפרטים
- 800S / 860SJ — Analyzer Fault Code Listing עמ' 308: DTC 001 (OK), 002 (ground mode), 0010 (cutback); 5 קבוצות (manualsdir.com)
- 660SJ / 860SJ — מדריך קודים מקיף + E5002 (engine fault); format X-Y, port באיזור ground control (manualsdump.com)
- 520AJ — מנואל שירות מלא 3121665 באיסו; ADE system, DTC via Analyzer; Deutz/Perkins codes
- DSP M — DTC p.93: mast sensor default code; בדוק sensor alignment ו-wiring (ManualsLib)

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

### Genie (ריצה 10 — חדש)
- GS-1530 — Fault Code Chart p.171 (ManualsLib): DTC ו-OIC codes מלאים עבור GS-1530, חלק ממערכת GSDS (score 1.0)

### Dingli (ריצה 10 — חדש)
- JCPT0607DCS — Operation Manual (gtaccess.co.uk PDF): error indicator readout, רשימת fault codes, reset procedure (E-stop) (score 0.8)

### Genie (ריצה 9 — חדש)
- Z-45/25 — fault codes p.102 (ManualsLib): קודי בקרה לזרוע ארטיקולציה Z-45/25
- GS-2646AV — OIC/DTC p.92 (ManualsLib): OIC codes LL/PHS; 272 DTC בחמש קטגוריות; אותה מערכת כמו GS-1932/GS-3246
- GS-1530/GS-1532 — OIC/DTC p.180 (ManualsLib): SmartLink GSDS codes מלאים עם גורמים ופתרונות
- GS-1930/GS-1932 — רשימת קודים מלאה עם פתרונות (reliableequipmentparts.com): OIC: LL, PHS; DTC: E1 (E-stop), E4 (סוללה נמוכה), E6 (tilt), E12 (תקשורת), E18 (height limit); קודים 52-58 (coil errors: resistance 20-30Ω); קוד 18 (pothole guard); קוד 68 (low voltage); הוראות reset

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

### Manitou (ריצה 9 — חדש)
- diag.manitou-group.com — פורטל אבחון רשמי Manitou; קודי ברירת מחדל לכל דגמי Manitou כולל 180ATJ; score 1.0 (מקור רשמי)

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
| Dingli JCPT1208AC | fault codes — לא נחלץ; מרכז הורדה רשמי זוהה; אין מנואל שירות זמין | גבוהה |
| Dingli JCPT1212 | שום תיעוד ספציפי — לא נמצא בשום ריצה | גבוהה |
| Dingli JCPT1412DC | מנואל HD נמצא (ריצה 12); טבלת קודים מלאה ל-DC variant עדיין חסרה | בינונית |
| JLG 520AJ | מנואל operation נוסף (ריצה 13); DTC ספציפי עדיין דרוש — 520AJ service manual 3121665 ב-Issuu | בינונית |
| JLG 860SJ | DTC analyzer codes p.308 + platform leveling p.245 + parts AJ manual — כעת מכוסים היטב (ריצה 13) | נמוכה |
| JLG 510AJ | מנואל שירות נמצא (Scribd) — fault codes דורשים JLG Analyzer לחילוץ | בינונית |
| Genie GS-3246 | parts+operator נוספו (ריצה 13); DTC 01-68 מכוסים; codes 44-47 (motor overload) עדיין צריכים פירוט תיקון | נמוכה |
| Manitou 180ATJ | service manual (Scribd EN) + ManualsLib 2 E3 RC + diag portal codes-list — נוספו (ריצה 13); MDS software עדיין נדרש | בינונית |
| JLG 450AJ | flash codes מכוסים היטב; parts manual זמין; DTC 5:437 תועד | נמוכה |
| JLG 600SJ / 600SJC | fault codes p.266 (600SJ) + p.230 (600SJC) — שניהם נמצאו | נמוכה |

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
| 8 | 2026-05-17 | 108 | 30‡ | 138 |
| 9 | 2026-05-18 | 108§ | 14 | 122 |
| 10 | 2026-05-19 | 122 | 3 | 125 |
| 11 | 2026-05-20 | 125 | 0 | 125 |
| 12 | 2026-05-21 | 125 | 18 | 143 |
| 13 | 2026-05-22 | 143 | 18 | 161 |

*ריצה 4: 30 פריטים זוהו אך לא הועלו לסטייג'ינג (חסימת רשת).
†ריצה 5: JSON בפועל נשאר 87 (commit לא נדחף); 4 פריטים תועדו ב-knowledge-gaps בלבד.
ריצה 6: WebFetch חסום (403) — 12 פריטים חדשים נוספו לסטייג'ינג מנתוני חיפוש; Supabase עדיין לא נגיש.
ריצה 7: WebFetch חסום (403), Supabase לא נגיש — 9 פריטים חדשים נוספו לסטייג'ינג מנתוני חיפוש.
‡ריצה 8: WebFetch חסום (403), Supabase NXDOMAIN — 30 פריטים נשמרו ב-`pending_knowledge.json`; הרץ `python3 save_to_supabase.py` להעלאה.
§ריצה 9: pending_knowledge.json מריצה 8 היה כבר ב-staging; בסיס אמיתי 108. WebFetch חסום (403), Supabase ECONNREFUSED — 14 פריטים חדשים נוספו לסטייג'ינג.
**ריצה 11:** 0 פריטים חדשים — staging רווי. לפתיחת מקורות חדשים יש להרחיב חיפושים ל-JCPT1208/JCPT1212 fault codes, 520AJ DTC ספציפי, ו-Manitou 180ATJ service manual.

**פירוט מותגים בסטייג'ינג (ריצה 13 מצטברת, 161 פריטים):**
- Dingli: 31 מקורות (+2 ריצה 13: JCPT0807PA parts, JCPT0807HA manual)
- JLG: 68 מקורות (+7 ריצה 13: 860SJ AJ parts, 600SJ p.266, 860SJ index, 860SJ platform leveling, 860SJ no-reverse, 860AJ UGM, 520AJ ops manual)
- Genie: 50 מקורות (+3 ריצה 13: GS-3246 index, parts, ops)
- Manitou: 22 מקורות (+5 ריצה 13: 180ATJ 2 E3 RC, 180ATJ Scribd EN, diag codes-list, MT625 error, AllForkliftManuals)
- MEC: 4 מקורות (+1 ריצה 13: SE Series 95918-SCH)
- כללי: 14 מקורות

**פירוט מותגים בסטייג'ינג (ריצה 12 מצטברת, 143 פריטים):**
- Dingli: 29 מקורות (+1 ריצה 12: JCPT1412HD Manual)
- JLG: 61 מקורות (+7 ריצה 12: 600SJC p.230, LSS Boom, 450A/AJ parts, 520208 fault, forum threads)
- Genie: 47 מקורות (+4 ריצה 12: GS-1932 #1321209, GS-2669RT #1272219, GS-3246 rentalex, scissor-lifting.com)
- Manitou: 17 מקורות
- MEC: 3 מקורות
- כללי: 14 מקורות (+6 ריצה 12: forkliftaction fault-code threads)

**ריצה 8 — פריטים חדשים (30):**
- Dingli JCPT0607A קוד 58/20/69 — תיאור מלא של כל קוד עם שלבי תיקון (chinaliftsupply.com)
- Dingli JCPT1912DC קוד 69 — Power relay sleep (chinaliftsupply.com)
- Dingli JCPT0607DCS — רשימת קודים 10–112 מלאה (ManualsLib p.31)
- Dingli JCPT0307 — דף קודים מלא (ManualsLib p.29)
- Dingli JCPT1412DC — מנואל מפעיל PDF (Advanced Access Platforms)
- Dingli JCPT0607DCM — מנואל רשמי PDF (dingliglobal.com)
- Dingli JCPT1418RT — מנואל Rough Terrain (Advanced Access Platforms)
- Dingli Scissor — מנואל מוצרים כללי (dingliglobal.com PDF)
- JLG 450A/AJ Series II — קודים עמ' 343 (ManualsLib + ManualsDir)
- JLG 450AJ — שירות PDF מלא (swiftequipment.com.au)
- JLG general — fault codes FAQ רשמי (jlg.com)
- JLG boom lifts — קודי שגיאה (forkliftpdfmanuals.com)
- JLG 860SJ — מדריך מלא לkodim + JLG Analyzer 1001249695 (ewpspares.com.au)
- JLG boom lifts — troubleshooting guide (intellaparts.com)
- JLG 450AJ — hydraulic connector corrosion diagnosis (forkliftaction forum)
- JLG 660SJ — error code forum (forkliftaction)
- Genie GS-3246/2646/2046 — שירות רשמי #48339 עם קודים 01–68 (manuals.genielift.com)
- Genie GS series — 40+ error codes, DTC+OIC types (flatearthequipment.com)
- Genie ECU GEN 5 — fault code PDF (hindleyelectronics.com)
- Genie ECU GEN 6 — fault code PDF (hindleyelectronics.com)
- Genie GS series — scissor error codes רשמי (genielift.com)
- Genie — biberger troubleshooting guide (biberger.de)
- Manitou fault codes — PDF list (Scribd)
- Manitou DTCs — truck-manuals.net
- Manitou 180ATJ — machineseeker blog guide
- Manitou 180ATJ — ManualsLib manuals page
- fieldex — common scissor lift problems guide
- yorkpmh — hydraulic failure prevention AWP

**חיפושים שבוצעו בריצה 8:** 15
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403 / Supabase NXDOMAIN)
**מודלים ללא תיעוד ספציפי:** Dingli JCPT1208, JCPT1212, JLG 520AJ, JLG 510AJ (עמוק), Manitou 180ATJ (קודים ספציפיים)

---

**ריצה 10 — פריטים חדשים (3):**
- JLG T350/T500J — Troubleshooting Manual 3121203 (csapps.jlg.com, score 1.0) — CAN diagnostics + flash codes
- Dingli JCPT0607DCS — Operation Manual PDF (gtaccess.co.uk, score 0.8) — fault code list + reset procedure
- Genie GS-1530 — Fault Code Chart p.171 (ManualsLib, score 1.0) — DTC+OIC codes מלאים

**חיפושים שבוצעו בריצה 10:** 15
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403 / Supabase ECONNREFUSED)
**URLים שנבדקו מול staging:** 50 — 47 כפילויות, 3 חדשים
**מודלים ללא תיעוד ספציפי:** Dingli JCPT1208, JCPT1212, JLG 520AJ (עמוק), Manitou 180ATJ (קודים ספציפיים)

---

---

**ריצה 12 — פריטים חדשים (18):**
- Dingli JCPT1412HD — מנואל מפעיל PDF (bensrental.sg, score 0.6) — קודים 10/20/30/51-59/69 עם reset procedure
- Forkliftaction forums (8 threads) — fault-error-code-list, read-fault-codes, error-or-fault-codes, fault-code-help, thread 12152, fault-code-01-3, no-travel, JLG expert — score 0.6
- scissor-lifting.com — troubleshooting AWP guide (score 0.4)
- JLG 600SJC fault code list p.230 (ManualsLib, score 0.6)
- JLG fault codes PDF (webflow CDN, score 0.4) — covers 450AJ/520AJ/860SJ groups
- Genie GS-1932 service manual #1321209 (manuals.genielift.com, score 1.0)
- Genie GS-2669RT service manual #1272219 (manuals.genielift.com, score 1.0)
- Genie GS-3246 service manual (rentalex.com PDF, score 0.8) — DTC 01-68, codes 54/55 most common
- JLG 520208:10 fault code (JustAnswer, score 0.6) — J1939 SPN/FMI engine code
- JLG LSS Boom manual 3124287 (JLG CDN, score 1.0)
- JLG 450A/AJ parts manual 3120750 (JLG CDN, score 1.0)

**חיפושים שבוצעו בריצה 12:** 15
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403 / Supabase ECONNREFUSED)
**URLים שנבדקו:** 70+ — 52 כפילויות, 18 חדשים
**מודלים ללא תיעוד ספציפי:** Dingli JCPT1208, JCPT1212, Manitou 180ATJ (קודים ספציפיים — diag.manitou-group.com נמצא), JLG 520AJ (DTC ספציפי)

**המלצה לריצה 13:** שנה חיפושים ל:
1. "Dingli JCPT1208 service manual fault codes LED display" (דגם לא מכוסה)
2. "Dingli JCPT1212 scissor lift manual troubleshooting error" (דגם לא מכוסה)
3. "JLG 520AJ DTC 5-437 boom lift specific repair" (קוד ספציפי)
4. "Manitou 180ATJ service manual fault codes ATJ260 ATJ180" (מנואל שירות ספציפי)
5. "Dingli scissor lift CANBUS fault 110 111 112 repair solution"
6. "JLG 860SJ telescope valve open circuit fault repair"
7. "Genie GS-3246 DTC 44 45 46 47 motor overload repair"

---

**ריצה 13 — פריטים חדשים (18):**
- Manitou 180ATJ 2 E3 RC — ManualsLib index (score 0.7)
- Manitou 180ATJ service manual — Scribd EN (score 0.4)
- Manitou diag.manitou-group.com/default-codes-list — רשמי (score 1.0)
- Manitou MT625 — error code 520352 boom functions (JustAnswer, score 0.6)
- Manitou — AllForkliftManuals fault codes list (score 0.6)
- JLG 860SJ — parts manual AJ 3121842 (JLG CDN, score 1.0) — telescope out valve parts
- JLG 600SJ — fault codes p.266 (ManualsLib, score 0.7)
- JLG 860SJ — ManualsLib manuals index (score 0.7)
- JLG 860SJ — platform leveling fault p.245 (ManualsDir, score 0.6)
- JLG 860SJ — no-reverse diagnosis (JustAnswer, score 0.6) — solenoid 20-30Ω, pilot 250 PSI
- JLG 860AJ — UGM CAN bus communication fault (JustAnswer, score 0.6) — CAN termination 120Ω
- JLG 520AJ — operation manual Oshkosh-JLG (ManualsLib, score 0.7)
- Genie GS-3246 — ManualsLib index (score 0.7)
- Genie GS-3246 — parts manual (Rentalex, score 0.8) — coil part numbers for DTC 44-47
- Genie GS-3246 — operator manual (Rentalex, score 0.8) — E1/E4/E6/E12/E18 OIC codes
- Dingli JCPT0807PA — parts manual רשמי (Dingli CDN, score 1.0)
- Dingli JCPT0807HA — operator manual (Vertikaluk, score 0.6) — fault codes 10/20/30/54/57/58/59
- MEC SE Series — service manual 95918-SCH (mecawp.com, score 0.7)

**חיפושים שבוצעו בריצה 13:** 22 (15 ראשיים + 7 ממוקדים מהמלצת ריצה 12)
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403 / Supabase ECONNREFUSED / DNS blocked)
**URLים שנבדקו:** 100+ — 82 כפילויות, 18 חדשים
**מודלים ללא תיעוד ספציפי:** Dingli JCPT1208, JCPT1212, JLG 520AJ (DTC ספציפי)

**המלצה לריצה 14:** שנה חיפושים ל:
1. "Dingli JCPT1208DC service manual download fault code" (שינוי ניסוח — DC variant)
2. "Dingli JCPT1212DC JCPT1212HD manual error troubleshooting" (DC/HD variants)
3. "JLG 520AJ service manual 3121665 fault codes DTC list" (מנואל שירות ספציפי)
4. "Genie GS-3246 DTC code 44 45 46 47 drive motor repair instructions"
5. "Manitou 180ATJ Deutz engine fault code CAN bus diagnosis"
6. "scissor lift drive motor controller fault diagnosis DC motor AWP"
7. "JLG 860SJ telescope extend retract fault code repair hydraulic"

---

**ריצה 11 — פריטים חדשים (0):**
כל 50+ URL שנמצאו בחיפושים כבר קיימים ב-staging. הסטייג'ינג רווי לדפוסי החיפוש הנוכחיים.

**אבחנת ריצה 11 — מה נמצא בחיפושים אך כבר ב-staging:**
- Dingli JCPT0607A קודים 20/58/69 (chinaliftsupply.com) — כבר ב-staging
- Dingli JCPT0607DCS קודים מלאים (ManualsLib p.31) — כבר ב-staging
- JLG 450AJ Series II קודים p.343 (ManualsLib) — כבר ב-staging
- Genie GS-3246 קוד 18/קוד chart (ManualsLib, JustAnswer) — כבר ב-staging
- Genie GS-1932 service manual (manuals.genielift.com) — כבר ב-staging
- Manitou 180ATJ (ManualsLib, machineseeker, truck-manuals.net) — כבר ב-staging
- JLG 860SJ (csapps.jlg.com parts manual) — כבר ב-staging
- כל 15 URL מחיפושי Genie GS-1932, Manitou 180ATJ, JLG 510AJ, JLG 860SJ, general AWP — כבר ב-staging

**המלצה לריצה 12:** שנה את שאילתות החיפוש ל:
1. "Dingli JCPT1208 error code LED display fault list" (שאילתה ממוקדת יותר)
2. "Dingli JCPT1212 scissor lift manual troubleshooting" (דגם לא מכוסה)
3. "JLG 520AJ DTC 5-437 specific fault code repair" (קוד ספציפי)
4. "Manitou 180ATJ service manual fault codes download" (מנואל שירות ספציפי)
5. "forkliftaction.com JLG 520AJ 860SJ forum" (פורום ספציפי)
6. "Dingli scissor lift CANBUS fault 111 112 repair" (קוד CAN bus ספציפי)
7. "scissor lift drive motor fault code repair DC motor controller"

**חיפושים שבוצעו בריצה 11:** 15
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403 / Supabase ECONNREFUSED)
**URLים שנבדקו מול staging:** 50+ — 50+ כפילויות, 0 חדשים
**מודלים ללא תיעוד ספציפי:** Dingli JCPT1208, JCPT1212, JLG 520AJ (DTC מלא), Manitou 180ATJ (קודים ספציפיים)

---

**ריצה 9 — פריטים חדשים (14):**
- JLG 9-9/99-5 — Power Module Failure / Personality Range Error (JLG רשמי, score 1.0)
- JLG 3246ES Flash Code 2-5 — Pothole sensor/bar misalignment (JustAnswer)
- JLG T350 Flash Code 9 — Service required (Heavy Equipment Forums)
- JLG Code 211 — Power Cycle Required on boom lifts (GC Iron support)
- JLG 800S/860SJ — Analyzer Fault Code Listing p.308 עם DTC 001/002/0010 (ManualsDir)
- JLG 660SJ/860SJ — מדריך קודים מקיף + E5002 + format X-Y (ManualsDump)
- JLG 520AJ — מנואל שירות מלא 3121665 + ADE system (Issuu)
- JLG DSP M — DTC mast sensor default code p.93 (ManualsLib)
- JLG Fault Codes — מדריך כללי עם סדר אבחון (TractorDetailProblems)
- Genie Z-45/25 — Control system fault codes p.102 (ManualsLib)
- Genie GS-2646AV — OIC/DTC p.92 (ManualsLib)
- Genie GS-1530/1532 — OIC/DTC p.180 (ManualsLib)
- Genie GS-1930/1932 — רשימת קודים מלאה: E1/E4/E6/E12/E18, קודים 18/52-58/68 + פתרונות (Reliable Equipment Parts)
- Manitou — diag.manitou-group.com פורטל רשמי (score 1.0)

**חיפושים שבוצעו בריצה 9:** 15
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403 / Supabase ECONNREFUSED)
**מודלים ללא תיעוד ספציפי:** Dingli JCPT1208, JCPT1212, Manitou 180ATJ (קודים ספציפיים — diag.manitou-group.com נמצא)
