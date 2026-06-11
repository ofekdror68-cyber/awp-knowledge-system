# AWP Knowledge Gaps
_עודכן: 2026-06-11_

## מה יש ב-DB (סטייג'ינג — ממתין להעלאה)

> **ריצה 33 (2026-06-11):** 14 פריטים חדשים נוספו לסטייג'ינג (389 סה"כ). Supabase לא נגיש (DNS NXDOMAIN לפרויקט הספציפי); WebFetch חסום (403 על כל האתרים). 15 שאילתות סטנדרט (רוויה מלאה — 0 חדשים, צפוי) + 8 שאילתות ממוקדות (המלצות ריצה 32). **פריטים חדשים שנוספו:** JLG 800S/860SJ HC3 service manual (Scribd 709921464, 0.4) — HC3 variant ADE DTC; JLG 800S/810SJ/860SJ service 3121631 (Scribd 576863861, 0.4) — full DTC groups 1-9; **Terex Fault Code Manual V2.5 (Scribd 390994771, 0.4) — מותג חדש! Logicontrol LMS Plus;** Genie S-65 fault codes p.119 (ManualsLib 1251980, 0.8); Genie S-65 XC fault codes p.109 (ManualsLib 1479810, 0.8); Genie S-60 HC fault codes (Manualzz 8pfd7, 0.6); **Genie S-60/S-65 SRM רשמי! (manuals.genielift.com SmSeries, 1.0);** **Niftylift HR28 operating manual (jms.co.uk PDF, 0.6) — מותג חדש!;** Niftylift HR21 MK2 index (ManualsLib 1636069, 0.6); Niftylift HR21 fault codes p.55 (ManualsLib 1636069/p55, 0.6); Niftylift HR21 manual PDF (hiresafesolutions, 0.6); Niftylift HR28 manual PDF (hiresafesolutions, 0.6); Niftylift HR21 JMS manual (jms.co.uk, 0.6); Niftylift HR12 fault codes p.35 (ManualsLib 1862749, 0.6). **מותגים חדשים בריצה 33: Niftylift (HR12/HR21/HR28), Terex AWP.** **גפ קריטי שנותר:** Dingli JCPT1208DC (33 ריצות!); JLG 510AJ platform DTC; JLG 860SJ שירות מלא. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

### ריצה 33 — פריטים חדשים (2026-06-11)
14 פריטים חדשים נוספו לסטייג'ינג — **15 שאילתות סטנדרט (0 חדשים — רוויה מלאה) + 8 שאילתות ממוקדות:**

- **JLG / מודלי 860SJ (2):**
  - JLG 800S HC3/860SJ HC3 service manual (Scribd #709921464, 0.4) — HC3 = High Capacity 3rd gen; 6 sections incl. fault codes; ADE DTC groups 1-9; load cell codes HC3-specific
  - JLG 800S/810SJ/860SJ service 3121631 Rev D (Scribd #576863861, 0.4) — DTC groups 1-9 מלאים; ECT stage 1 codes; pressure/angle/CAN bus codes; Deutz engine integration
- **Terex AWP — מותג חדש! (1):**
  - **Terex Fault Code Manual V2.5 (Scribd #390994771, 0.4)** — Logicontrol LMS Plus system; codes: CAN bus node loss, overload, bypass active, powertronic unit faults (low fuel/high temp/low pressure/sensor); Terex + Genie S-series (Terex branded)
- **Genie S-series booms (4) — gap S-60/S-65 סגור!**
  - Genie S-65 control fault codes p.119 (ManualsLib #1251980, 0.8) — GSDS 2-digit codes; ECU/GCON/PCON/sensors/drive; retrieval: hold up+down switches
  - Genie S-65 XC fault codes p.109 (ManualsLib #1479810, 0.8) — XC variant; extra load management codes; same GSDS architecture
  - Genie S-60 HC fault codes (Manualzz, 0.6) — S-60 HC variant; same GSDS as S-65
  - **Genie S-60/S-65 SRM רשמי! (manuals.genielift.com/SmSeries, 1.0)** — מסמך יצרן רשמי; complete fault chart + hydraulic/electrical schematics + calibration
- **Niftylift — מותג חדש לחלוטין! (7):**
  - Niftylift HR28 (SP85) operating manual (jms.co.uk PDF, 0.6) — fault code 01B40000 (telescope paddle); code 32 = drive fault; alphanumeric code format
  - Niftylift HR21 MK2 manual index (ManualsLib #1636069, 0.6) — 79 pages; fault codes at p.55
  - Niftylift HR21 fault codes p.55 (ManualsLib #1636069/p55, 0.6) — 8-char alphanumeric codes; ECU/drive/lift/tilt/overload/comms
  - Niftylift HR21 MK2 manual PDF (hiresafesolutions, 0.6)
  - Niftylift HR28 MK2 manual PDF (hiresafesolutions, 0.6) — error code 32 referenced
  - Niftylift HR21 manual (jms.co.uk, 0.6)
  - Niftylift HR12 fault codes p.35 (ManualsLib #1862749, 0.6) — HR12 compact indoor; same code architecture as HR21/HR28

**מידע טכני מרכזי שנאסף בריצה 33 (מסיכומי WebSearch):**
- **Niftylift קוד פורמט:** 8-תו אלפאנומרי (e.g., 01B40000 = Telescope Paddle out of neutral) — שונה מ-JLG/Genie/Dingli
- **Terex Logicontrol V2.5:** קוד 4-ספרות; CAN bus node loss; powertronic unit faults — חפש "Logicontrol LMS Plus" בחיפוש עתידי
- **Genie S-60/S-65:** GSDS 2-digit codes; retrieval: hold up+down switches on platform panel; S-60 HC = same architecture as S-65
- **JLG 860SJ HC3:** P1/P2/P3 priority system; load cell codes HC3-specific; diagnostic port = ground control box

**חיפושים שבוצעו בריצה 33:** 15 סטנדרט + 8 ממוקדים = 23 סה"כ
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403; Supabase NXDOMAIN)
**פריטים חדשים שנשמרו:** 14
**מותגים חדשים:** Niftylift (HR12/HR21/HR28), Terex AWP

**המלצה לריצה 34 — שאילתות חדשות:**
1. "Niftylift HR17 HR17T HR21 workshop service manual fault code repair" — get workshop-level Niftylift codes (HR17 is also common)
2. "Niftylift HR28 workshop parts service manual complete fault code table" — workshop = full DTC vs operators only
3. "Terex AWP boom lift Logicontrol fault code complete list TL65 aerial" — expand Terex AWP codes
4. "JLG 860SJ service manual 3121167 3121139 ADE DTC fault code complete" — specific manual numbers for 860SJ
5. "Genie S-45 S-45 XC boom fault code service manual GSDS DTC" — S-45 still missing
6. "Dingli JCPT1208DC 1208 narrow AC DC scissor fault code manual English" — 33 ריצות ללא הצלחה
7. "MEC aerial work platform fault code service manual A92.20 DTC list" — MEC brand gap
8. "Niftylift HR21 HR28 error code 32 diagnosis repair solution" — specific code 32 investigation

---

> **ריצה 32 (2026-06-10):** 0 פריטים חדשים נוספו לסטייג'ינג. Supabase לא נגיש (DNS fails + ECONNREFUSED); WebFetch חסום (403 על כל האתרים). 15 שאילתות סטנדרט בוצעו (Dingli JCPT scissor/1412/1208/0607, JLG 450AJ/520AJ/510AJ/860SJ, Genie GS-3246/GS-1932, Manitou 180ATJ, forkliftaction×2, כללי AWP hydraulic + AWP PDF). **רוויה מלאה** — כל 15 השאילתות הסטנדרטיות מייצרות URL כפילויות בלבד; לא נמצאו פריטים חדשים מעבר לריצה 31. מידע טכני מרכזי שאושר מחדש: Dingli JCPT codes 10/20/30/31/32/51-54/57-59/69; Genie GS-3246 codes 01-03/12/18/42-47/52-58/68; Genie GS-1932 E1/E4/E6/E12/E13 (272 DTC + 6 OIC); JLG 450AJ flash 3-3=tilt sensor, hydraulic valve loss=connector corrosion. **גפ קריטי שנותר:** Dingli JCPT1208DC (32 ריצות!); JLG 510AJ platform DTC; JLG 860SJ service+DTC. **המלצה:** שאילתות חדשות בלבד לריצה 33 (ראה רשימה למטה). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 31 (2026-06-09):** 15 פריטים חדשים נוספו לסטייג'ינג (390 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403 על כל האתרים). 15 שאילתות סטנדרט (ריצת בסיס). **פריטים חדשים שנוספו:** Dingli JCPT0307 fault codes מלאים p.29 (ManualsLib, 0.8) — 13 codes; Dingli JCPT0607A codes 58/20/69 (chinaliftsupply, 0.6) — pothole/TM1/sleep; Dingli JCPT0607DCS fault indicator p.31 (ManualsLib, 0.8); Dingli 1412DC/1612DC operator manual (advancedaccessplatforms, 0.8); Dingli JCPT0607DCM manual (dingliglobal.com, 1.0) — רשמי; JLG 450AJ hydraulic valve loss forum (forkliftaction, 0.8); JLG 450A Series II fault codes p.343 (ManualsLib, 0.8); JLG 860SJ complete fault guide (ewpspares.com.au, 0.6); JLG boom lift troubleshooting (intellaparts, 0.6); JLG fault codes safety (aerialequipmentparts, 0.6); Genie GS-3246 fault code chart p.50 (ManualsLib, 0.8); Genie ECU GEN 5 codes (hindleyelectronics, 0.8) — PDF; Genie ECU GEN 6 codes (hindleyelectronics, 0.8) — PDF; Manitou fault codes list Scribd (0.4); Manitou fault codes truck-manuals.net (0.6). **קידמה:** Dingli JCPT0307 קודי תקלה מלאים תועדו לראשונה; Genie GEN5/GEN6 ECU PDFs זוהו. **גפ שנותר:** Dingli JCPT1208DC עדיין לא נמצא (31 ריצות!); JLG 510AJ platform DTC; JLG 860SJ service manual ADE DTC. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

### ריצה 31 — פריטים חדשים (2026-06-09)
15 פריטים חדשים נוספו לסטייג'ינג — **15 שאילתות סטנדרט (ריצת בסיס Dingli/JLG/Genie/Manitou):**

- **Dingli (5) — כיסוי JCPT מורחב:**
  - Dingli JCPT0307 fault codes p.29 (ManualsLib #1911193, 0.8) — **13 codes מלאים:** 10 (General Alarm ECU), 20 (General Alarm TM1 — Traction Motor 1), 30 (General Alarm PCU), 31 (PCU CPU0 Fault), 32 (PCU CPU1 Fault), 51 (ECU Alarm), 52 (PCU Alarm), 53 (TM1 Alarm), 54 (Pressure Sensor Error), 57 (Overload), 58 (Pothole Protection Activated), 59 (High Position Limit), 69 (Power Relay Sleep)
  - Dingli JCPT0607A fault codes (chinaliftsupply.com, 0.6) — Code 58: Pothole → move to level ground, inspect guards; Code 20: TM1 → controller fault, check wiring; Code 69: Power Relay Sleep → restart, check battery/key switch
  - Dingli JCPT0607DCS error indicator readout p.31 (ManualsLib #1617028, 0.8) — standard DCS fault display system; same code set as JCPT0307
  - Dingli JCPT1412DC / 1612DC Operator's Manual (advancedaccessplatforms.co.uk PDF, 0.8) — operator manual for DC variant; fault section included
  - Dingli JCPT0607DCM parameter manual (dingliglobal.com PDF, 1.0) — **רשמי!** DCM variant configuration and fault parameters
- **JLG (5):**
  - JLG 450AJ Series 1 hydraulic valve control loss (forkliftaction.com forum, 0.8) — platform rotate/leveling/jib/telescope/tower loss; root cause: corrosion in harness connectors at boom-to-tractor junction; fix: inspect/clean/replace connector terminals
  - JLG 450A Series II fault codes p.343 (ManualsLib #1303839, 0.8) — full DTC listing for 450A/450AJ Series II; flash code 3/3 = basket sensor / joystick calibration fault; basket angle sensor wiring checks
  - JLG 860SJ complete fault codes guide (ewpspares.com.au, 0.6) — all 860SJ fault codes with explanations; diagnostic port in ground control box; ECT stage 1 codes; CAN bus codes
  - JLG boom lift troubleshooting overview (intellaparts.com, 0.6) — general boom lift DTC procedure; sensor range faults; communication errors; power cycle reset sequence
  - JLG fault codes list safety article (aerialequipmentparts.com, 0.6) — JLG knowledge base reference; 1,500+ articles; 3 analyzer options (tethered/mobile/Bluetooth); fault code safety importance
- **Genie (3):**
  - Genie GS-3246 / GS-2646 / GS-2046 fault code chart p.50 (ManualsLib #1270156, 0.8) — official service manual fault chart; codes 01-68 covering: 01 (Platform ECM error), 02 (DIP switch undefined), 03 (chassis switch at startup), 12 (pothole guard failure), 43-57 (coil errors: fwd/rev/up/dn/L/R/brake), 68 (Low Voltage); code 18 (pothole guard limit switch)
  - Genie ECU Fault Codes GEN 5 (hindleyelectronics.com PDF, 0.8) — **GEN 5 ECU fault code table**; authoritative reference for all GS-series scissors with GEN 5 controller
  - Genie ECU Fault Codes GEN 6 (hindleyelectronics.com PDF, 0.8) — **GEN 6 ECU fault code table**; updated controller codes for newer GS-series
- **Manitou (2):**
  - Manitou fault codes list (Scribd #446162823, 0.4) — fault codes for Manitou telehandlers + ATJ boom lifts; general reference
  - Manitou fault codes DTC (truck-manuals.net, 0.6) — Manitou DTC index with codes organized by system; covers ATJ + MT series

**מידע טכני מרכזי שנאסף בריצה 31 (מסיכומי WebSearch):**
- **Dingli JCPT0307/0607 fault code set מלא:** 13 קודים — ECU/TM1/PCU אלארמים, חיישן לחץ, עומס יתר, pothole, מגבלת גובה, שינה. קוד 58 = pothole guard פעיל → ביסוס מחדש. קוד 69 = שינה של ממסר הכח → הפעלה מחדש.
- **JLG 450AJ hydraulic valve loss:** קורוזיה במחברי חוטים בין הזרוע לגוף העגלה — הסיבה הנפוצה ביותר לאובדן שליטה על שסתומים מרובים.
- **Genie GS-3246 codes confirmed:** 01/02/03/12/43-57/68 — אותה ארכיטקטורה כמו GS-1932; GEN5/GEN6 מסמכי ECU זמינים ב-hindleyelectronics.com.
- **Genie GS-1932 OIC codes:** E1 (Emergency Stop), E4 (Low Battery), E6 (Tilt Sensor), E12/E13 (Control Communication) — 272 DTC codes total.

## מה יש ב-DB (סטייג'ינג — ממתין להעלאה)

> **ריצה 30 (2026-06-08):** 12 פריטים חדשים נוספו לסטייג'ינג (375 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403 על כל האתרים). 15 שאילתות סטנדרט (רוויה מלאה — 0 חדשים) + 8 שאילתות ממוקדות (המלצות ריצה 29). **פריטים חדשים שנוספו:** Genie S-40 fault codes p.153 (ManualsLib, 0.8) — **מודל חדש!** S-40 GSDS fault codes; Terex Genie S-40 control system fault codes p.86+p.85 (ManualsLib, 0.8) — Terex variant, retrieval procedure; **Haulotte HA32 RTJ / HA43 RTJ operators manual (haulotte.com.au, 1.0) — רשמי!** fills HA32 gap; Haulotte HA32RTJ PRO maintenance book (ManualsLib, 0.8) — F-series codes מלאים; JLG Control System technical manual S/N 61718+ (manuals.plus, 0.6) — ADE DTC groups 1-9; JLG AE1932 DTC English (Scribd, 0.6) — **מודל חדש!** electric slab scissor; JLG 450AJ Fault Code List Scribd (0.6) — switch mapping; **Dingli E-TECH ACE fault codes p.50 (ManualsLib, 0.8) — 12 ACE codes מלאים!** (54/OL/LL/18/01-03/31/32/37/68/80-99); Manitou codigos Scribd (0.4) — Spanish; Manitou MRT 2150P E3 JustAnswer (0.6) — E3 diagnosis approach; Skyjack NJ Hire operating manual (0.6). **גפ שנותר:** Dingli JCPT1208DC עדיין לא נמצא (30 ריצות); JLG 510AJ platform DTC — עדיין חסרה טבלה מלאה; JLG 860SJ service manual ADE DTC — קיים parts, חסר service+DTC. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

### ריצה 30 — פריטים חדשים (2026-06-08)
12 פריטים חדשים נוספו לסטייג'ינג — **15 שאילתות סטנדרט (0 חדשים — רוויה מלאה) + 8 שאילתות ממוקדות (המלצות ריצה 29):**

- **Genie S-series booms (3):**
  - Genie S-40 fault codes p.153 (ManualsLib #1231669, 0.8) — **מודל חדש!** S-40 14m stick boom, GSDS fault codes same architecture as GS-series scissors
  - Terex Genie S-40 control system fault codes p.86 (ManualsLib #2036544, 0.8) — Terex-branded variant, control system DTC table: ECU comms, platform/chassis, sensor, drive motor, boom cylinder codes
  - Terex Genie S-40 fault code retrieval procedure p.85 (ManualsLib #2036544, 0.8) — diagnostic mode entry, GCON/PCON display, clear codes procedure
- **Haulotte HA32 RTJ (2) — גפ סגור!**
  - **Haulotte HA32 RTJ / HA43 RTJ Operators Manual (haulotte.com.au, 1.0) — רשמי!** F-series codes F01-F25, emergency descent, VCI box, 32m + 43m variants
  - Haulotte HA32RTJ PRO Maintenance Book (ManualsLib #1918052, 0.8) — F01=contactor, F04=overload, F05=tilt, F10=engine, F15=CAN bus; 250h/500h/1000h/2000h maintenance schedule; reset procedure
- **JLG (3):**
  - JLG Control System Technical Manual S/N 61718+ (manuals.plus, 0.6) — ADE DTC groups 1-9, CAN bus procedures, analyzer connection, priority P1/P2/P3
  - JLG AE1932 DTC English (Scribd doc 684764434, 0.6) — **מודל חדש!** AE1932 electric narrow-aisle scissor, full DTC table: battery/charger, tilt, drive, lift, platform/ground comms
  - JLG 450AJ Fault Code List (Scribd doc 708243971, 0.6) — switch-category DTC mapping, supplement to existing 450AJ sources
- **Dingli (1) — ACE codes מלאים!**
  - Dingli E-TECH ACE Series training manual p.50 (ManualsLib #3384241, 0.8) — **12 ACE fault codes:** 54 (Lift Coil Fault), OL (Overload), LL (Tilt), 18 (Pothole Guard), 01-03 (system init/comm/option), 31-32 (pressure/angle sensor), 37 (battery drain), 68 (low voltage), 80/90/99 (load %). Bluetooth diagnostic. Applies to JCPT1412ACE.
- **Manitou (2):**
  - Manitou codigos (Scribd doc 469639700, 0.4) — Spanish fault codes reference for Manitou telehandlers + ATJ boom lifts
  - Manitou MRT 2150P E3 JustAnswer (0.6) — E3 architecture: iV tool, SPN/FMI, UPC30 platform controller, Deutz TCD3.6 codes; applicable to 180ATJ E3 RC variant
- **Skyjack (1):**
  - Skyjack SJIII operating manual NJ Hire NZ (njchire.co.nz, 0.6) — LED codes: OVRLOAD/TILT/DRIVE FAULT/ARMGUARD/HWFS STALL D; GP102 reset procedure

**מידע טכני מרכזי שנאסף בריצה 30 (מסיכומי WebSearch):**
- **Dingli E-TECH ACE codes מאושרים:** 54 (Lift Up Coil Fault), OL (Overload), LL (Tilt), 18 (Pothole Guard), 01 (Init Fault), 02 (Comm Fault), 31 (Pressure Sensor), 32 (Angle Sensor), 37 (Battery Drain), 68 (Low Voltage), 80/90/99 (Load warnings)
- **Haulotte HA32 RTJ:** fills the HA32 gap — same F-series architecture as HA26 but 32m/43m working height; F01/F04/F05/F10/F15 confirmed
- **JLG AE1932:** narrow/compact slab scissor with full ADE DTC system — first AE-series model documented in staging
- **Genie S-40:** confirms GSDS fault code system extends to straight boom S-series (S-40/S-45/S-60/S-80)

**חיפושים שבוצעו בריצה 30:** 15 סטנדרט + 8 ממוקדים = 23 סה"כ
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403 על כל האתרים; Supabase ECONNREFUSED)
**URL שנבדקו:** 120+ — ~108 כפילויות, 12 חדשים
**מודלים חדשים שהורחבו:** Genie S-40 (S-series booms confirmed!), Haulotte HA32/HA43 RTJ (gap סגור!), JLG AE1932 (חדש!), Dingli E-TECH ACE JCPT1412ACE (codes מלאים!)

**המלצה לריצה 32 — שאילתות חדשות (לא לחזור לסטנדרט):**
1. "Dingli JCPT1208DC ladder scissor 2022 2023 fault code manual English operator" (30+ ריצות ללא הצלחה — נסה: "Dingli 1208 DC narrow scissor fault LED" או "Dingli JCPT1208DC DL-00000693 controller")
2. "JLG 860SJ service manual 3121xxx ADE DTC fault code complete 800S" (860SJ service — יש parts מנואל, חסר service+DTC; נסה 800S מקביל)
3. "JLG 510AJ 520AJ complete ADE platform DTC fault code service 3121xxx" (platform DTC for 510AJ/520AJ still missing)
4. "Genie S-45 S-60 boom lift GSDS fault codes complete DTC list" (S-45/S-60 — S-40/S-80 מכוסים, S-45/S-60 חסרים)
5. "Haulotte HA43 RTJ PRO fault code F-series service manual 2022 2023" (HA43 — יש operators, חסר service manual עם full F-code table)
6. "Skyjack SJ45AJ SJ46AJ service manual complete fault code GP102 DTC table" (service manual — יש operators, חסר service)
7. "MEC A92.20 aerial lift fault code complete list 2022 2023 PDF" (MEC 92.20 series — יש SCH, חסרים DTC ספציפיים)
8. "Manitou 180ATJ service manual 2020 2021 fault code diagnosis iV tool" (full service manual for 180ATJ)

**המלצה לריצה 33 — שאילתות חדשות (לא לחזור לסטנדרט — רוויה מלאה):**
1. "Dingli JCPT1208DC DL-00000693 narrow straddle scissor fault code LED display" — 32 ריצות ללא הצלחה, נסה מספר חלק בקר
2. "JLG 800S 860SJ ADE platform controller service manual DTC 3121298" — 800S מקביל
3. "JLG 510AJ 520AJ ADE controller platform fault code 51xx 52xx list" — platform codes ספציפיים
4. "Genie S-45 S-60 S-65 S-80 GSDS fault code DTC complete service manual" — S-series gaps
5. "Manitou 180ATJ E3 RC fault code iV diagnostic Deutz Perkins service" — 180ATJ specific
6. "Haulotte HA43 RTJ PRO F-code service repair manual 2021 2022" — HA43 service gap
7. "Terex AWP TL50 TL65 fault code service manual DTC" — Terex brand gap
8. "Niftylift HR28 HR21 fault code diagnosis service manual" — brand gap

---

> **ריצה 29 (2026-06-07):** 6 פריטים חדשים נוספו לסטייג'ינג (363 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403 על כל האתרים). 15 שאילתות סטנדרט (רוויה מלאה — 0 חדשים) + 7 שאילתות ממוקדות (המלצות ריצה 28). **פריטים חדשים שנוספו:** Dingli JCPT HD-DC Parts Manual (Scribd, 0.6) — parts reference for JCPT1412HD/DC, JCPT1208HD/DC; JLG 510AJ Service Manual ManualsDir (0.6) — 402 pages, EMR2 fault codes + ADE DTC, hydraulics/electrical; JLG 510AJ Service Manual Scribd (0.6) — DTC 3-3/9-2/9-3, CAN bus, platform codes; **JLG CAN System Troubleshooting SI 1201 (csapps.jlg.com, 1.0) — רשמי מלא!** 60Ω test, node identification, fault code group 9 complete; Manitou 180ATJ Repair Manuals listing (diyrepairmanuals.com, 0.4) — operator+service+wiring+parts; JLG Direct Access FAQ alt-URL (jlg.com, 1.0) — ADE code format, groups 1-9 explained. **גפ שנותר:** Dingli JCPT1208DC עדיין לא נמצא (29 ריצות); JLG 510AJ platform DTC — נוספו מקורות, עדיין חסרה טבלה מלאה. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 28 (2026-06-06):** 6 פריטים חדשים נוספו לסטייג'ינג (357 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403 על כל האתרים). 15 שאילתות סטנדרט (רוויה מלאה — 0 חדשים) + 7 שאילתות ממוקדות נוספות. **פריטים חדשים שנוספו:** GCIron fault code 666 CAN bus Failure - Engine Controller (gciron.com, 0.8) — **JLG 660SJ/860SJ CAN bus fault, diagnosis procedure, 60Ω termination test;** Genie C023 Machine Model Fault on GS-2632 (justanswer, 0.6) — battery disconnect 10-15min, dealer reprogramming, GCON/PCON mismatch; JLG 4394RT No Drive Forward/Reverse (forkliftaction, 0.6) — **AWP RT scissor, tilt/pothole/height-cutout diagnosis;** JLG error code 5:437 (forkliftaction t=30568, 0.6) — JLG ADE sensor input fault, Analyzer required; Scissor lift low speed / no high speed (forkliftaction, 0.5) — speed selector, tilt, height cut-out, load sensor; JLG 2032E2 troubleshooting (forkliftaction trid=16467, 0.6) — ES-series flash codes, pothole alignment, battery fault. **גפ שנותר:** Dingli JCPT1208DC עדיין לא נמצא (28 ריצות); JLG 510AJ platform DTC עדיין חסר. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 27 (2026-06-05):** 20 פריטים חדשים נוספו לסטייג'ינג (351 סה"כ). Supabase DNS failure (NXDOMAIN); WebFetch חסום (403 על כל האתרים). 15 שאילתות סטנדרט (רוויה מלאה — 0 חדשים) + 8 שאילתות ממוקדות חדשות (המלצות ריצה 26). **פריטים חדשים שנוספו:** Dingli S03-E operation/service/parts manual (ManualsLib, 0.8) — **מודל חדש!** S-series electric compact; JLG 1932RS/6RS DTC p.121 (ManualsLib, 0.8) — ADE platform fault codes, X-connector refs; Skyjack techpub #7122 (techpub.skyjack.com, 1.0) — רשמי; SJ46AJ operator manual (sunflowerrental, 0.8); Skyjack SJ 3220 LED codes p.117 (ManualsLib, 0.8) — **מודל חדש!**; Skyjack SJIII 3215 GP-108 codes p.129 (ManualsLib, 0.8) — **GP-108 חדש!** 11 codes vs GP102; Genie GS-3390/4390/5390 service manual #72863 (manuals.genielift.com, 1.0) — **רשמי! מודלים חדשים!** GS-5390 RT diesel; Genie GS-3384 service manual #1272222 (manuals.genielift.com, 1.0) — **רשמי! מודל חדש!**; Genie tech tip last-10 fault codes GEN5 ECU (genielift.com, 1.0) — **מפתח!** נוהל שליפת 10 קודים אחרונים; Genie GR series fault codes (hindleyelectronics.com, 0.8) — **סדרה חדשה!** GR-20/GR-26 mast lifts; GS-5390 won't move diagnosis (JustAnswer, 0.6) — brush motors/batteries/pothole; JLG 660SJ/600S service manual #3121298 רשמי (csapps.jlg.com, 1.0) — **רשמי!** ADE DTC table מלא; JLG 660SJC/600SC #3121157 רשמי (csapps.jlg.com, 1.0) — HC3 variant, load cell codes; JLG 660SJC/600SC #3121607 רשמי (csapps.jlg.com, 1.0) — priority levels P1/P2/P3; JLG 660SJ fault codes p.285 (ManualsDir, 0.6) — specific DTC descriptions; JLG 660SJ Scribd (0.4) — codes 3-3 thru 9-9 documented; Snorkel ATB60 manual (freecranespecs, 0.6) — **מודל חדש!** articulating boom fault codes 01-20; Snorkel SR2770 RT operator manual (ahernaustralia, 0.8) — **מודל חדש!** RT scissor, OVERLOAD/DRIVE FAULT/LIFT FAULT LEDs; Snorkel boom lifts ManualsLib index (0.8) — SB10J/SB15J/ATB40/ATB50/ATB60 all linked; Snorkel operator's manual Scribd (0.4) — codes 01-39/51-69 categories. **גפ שנותר:** Dingli JCPT1208DC ספציפי עדיין חסר; JLG 510AJ ADE/platform DTC עדיין חסר (engine EMR2 covered). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 26 (2026-06-04):** 14 פריטים חדשים נוספו לסטייג'ינג (331 סה"כ). Supabase DNS failure (NXDOMAIN); WebFetch חסום (403 על כל האתרים). 23 שאילתות חיפוש בוצעו — 15 שאילתות סטנדרט (רוויה מלאה — 0 חדשים) + 8 שאילתות ממוקדות חדשות (המלצות מריצה 25). **פריטים חדשים שנוספו:** Genie GS-4069 BE/3369 BE fault codes (manualzz.com, 0.6) — **מודל חדש!** BE variant; Genie GS-2669 DC service manual רשמי (manuals.genielift.com, 1.0); Manitou 160/180 ATJ operator manual (savehyr.se, 0.6); Skyjack SJ4732 service manual 2020 (rentalex.com, 0.8) — **מודל חדש!**; Skyjack Dec 2024 Tech Tip — GP modules RT scissor (skyjack.com, 1.0); J1939-73 DM1 diagnostics reference (csselectronics.com, 0.8) — **חדש!** SPN/FMI cross-brand reference; Terex J1939 connector troubleshooting techtip_87 (terex.com, 0.8) — רשמי Terex/Genie; Dingli JCPT0607A manual Korean dealer (jhlift.co.kr, 0.6); Snorkel all models forum MHH Auto (mhhauto.com, 0.6); Snorkel NZ technical bulletins רשמי (snorkellifts.co.nz, 0.8) — SB boom lifts; Skyjack SJ45AJ techpub #7040 (techpub.skyjack.com, 1.0) — **מפתח!** רשמי SJ45AJ; Skyjack SJ8841 RT techpub #7353 (techpub.skyjack.com, 1.0) — **מודל חדש!**; PDFManual4Trucks Snorkel (0.4); Manitou manuals wiring MHH Auto (mhhauto.com, 0.6). **גפ שנותר:** Dingli JCPT1208DC עדיין חסר; JLG 510AJ platform DTC עדיין חסר. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 25 (2026-06-03):** 0 פריטים חדשים נוספו לסטייג'ינג. Supabase DNS failure (NXDOMAIN); WebFetch חסום (403 על כל האתרים שנוסו — 15+ ניסיונות). 15 שאילתות חיפוש בוצעו — כל שאילתות AWP הסטנדרטיות (Dingli JCPT, JLG 450AJ/520AJ/510AJ/860SJ, Genie GS-3246/GS-1932, Manitou 180ATJ, forkliftaction, כללי AWP hydraulic). נמצאו 33+ URL רלוונטיים-טכניים אך לא ניתן לשמור (Supabase לא נגיש). **מידע טכני שנאסף מסיכומי חיפוש:** Dingli codes 10/20/30/31/32/58/69 אושרו; Genie GS-3246 codes 18/42-47/68 אושרו; JLG 450AJ flash 3-3 אושר; Manitou ManualsLib 180ATJ אושר. **סיבת הכשל:** IP של סביבת הריצה חסום על ידי Cloudflare/WAF ברוב שרתי אינטרנט. **המלצה לריצה 26:** הרחב שאילתות לנושאים שטרם כוסו — Snorkel SB booms, JLG 510AJ platform DTC, Dingli JCPT1208DC. להעלאה כשיתאפשר: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 24 (2026-06-02):** 11 פריטים חדשים נוספו לסטייג'ינג (317 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 15 שאילתות סטנדרט (0 חדשים — רוויה מלאה) + 8 שאילתות ממוקדות חדשות מהמלצות ריצה 23. **מותגים חדשים/מורחבים:** Skyjack SJ45AJ techpub doc #5889 + SJ63AJ ManualsLib + SJ46AJ ManualsLib (3 פריטים), Haulotte HA26 RTJ PRO — training manual + index (2 פריטים), Snorkel multifold guide רשמי (1 פריט), Upright — operator-manuals library + X-series manual snorkeljp (2 פריטים), Deutz DTC list (jimcontent) + Genie GTH-844 Deutz TCD3.6 codes p.78 (2 פריטים), JLG X550AJ official PDF (1 פריט). **גפ מרכזי שנותר:** Dingli JCPT1208DC עדיין חסר מנואל ספציפי; Snorkel SB-series booms לא מכוסים; JLG 510AJ platform DTC (לא engine DTC) עדיין חסר. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 23 (2026-06-01):** 23 פריטים חדשים נוספו לסטייג'ינג (306 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 8 חיפושים ממוקדים (שאילתות מומלצות מריצה 22) + 15 שאילתות סטנדרט (0 חדשים — רוויה מלאה). **מותגים חדשים/מורחבים:** Haulotte HA16RTJ+HT43RTJ PRO+HTL4010 (4 פריטים), Skyjack SJ46AJ++SJ61T+techpub+forum (4 פריטים), Upright service bulletins (1 פריט), Dingli JCPT1212DC+JCPT2223RTA+E-Tech ACE (3 פריטים), Snorkel TM12+S1930+neutral fault+Manualzz+forum (5 פריטים), JLG 510AJ EMR2 p.121+boom 9-9 (2 פריטים), Genie Z-boom #1268548+DTC Scribd+diagnostic tool (3 פריטים), Haulotte fault codes identitum (1 פריט). **פריטים מוגבלי-ערך אך חדשים:** Haulotte identitum (0.4), Snorkel Manualzz (0.4), Snorkel Yesterday's Tractors forum (0.4). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 22 (2026-05-31):** 28 פריטים חדשים נוספו לסטייג'ינג (283 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 8 חיפושים — שאילתות חדשות ממוקדות (ראה המלצות ריצה 21). **מותגים חדשים/מורחבים:** Haulotte HA20/HA26 boom lifts (6 פריטים — HA20E, HA20RTJ PRO, HA20 LE PRO hybrid, HA Training Manual, Diagnostic Training), Snorkel S3219E/X-26/S3247 (7 פריטים), Genie Z-45 DC + Z-45/25 + Z-60/34 + Booms S® (6 פריטים), MEC SEAC/96265 (2 פריטים), Deutz MD1 DOC/DPF + Genie Deutz&Perkins (2 פריטים), Dingli JCPT2212DC (1 פריט — מודל חדש!), Skyjack service manual + tech-tips 2016 (2 פריטים), כללי (2 פריטים). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 21 (2026-05-30):** 0 פריטים חדשים — staging רווי לחלוטין לשאילתות הסטנדרט (255 סה"כ, ללא שינוי). Supabase ECONNREFUSED; WebFetch חסום (403). 15 חיפושים — כל שאילתות הסטנדרט (Dingli/JLG/Genie/Manitou/כללי). **100+ URL נבדקו — 0 חדשים.** שאילתות הסטנדרט מוצו לחלוטין. **ריצה 22 חייבת שאילתות חדשות בלבד** (ראה המלצות בתחתית). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 20 (2026-05-29):** 7 פריטים חדשים נוספו לסטייג'ינג (255 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 15 חיפושים — שאילתות הסטנדרט (Dingli/JLG/Genie/Manitou). **הסטייג'ינג רווי מאוד** — מתוך 100+ URL שנסרקו, רק 7 חדשים. **פריטים חדשים:** Genie S-80 XC service manual רשמי (1.0), Dingli 1412DC manual v2 (0.8), Forkliftaction fault-1123 JLG (0.8), Error-6 tilt sensor forum (0.8), JLG 450AJ hydraulic Design thread (0.8), Manitou forum category (0.8), Just4Access Dingli JCPT0607DCS J4A-1731 (0.4). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 19 (2026-05-28):** 30 פריטים חדשים נוספו לסטייג'ינג (248 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 20 חיפושים — שאילתות מומלצות מריצה 18 + שאילתות נוספות. **מותגים חדשים/מורחבים:** Haulotte Compact/HA16RTJ (7 פריטים), Skyjack boom lifts SJ63AJ/SJ45T/SJIII (7 פריטים), Snorkel A38E/AB46JE/TB42 articulating booms (7 פריטים), Deutz engine codes cross-brand (5 פריטים), Dingli JCPT1212DC + JLG 520AJ Scribd (2 פריטים), כללי (2 פריטים). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 18 (2026-05-27):** 30 פריטים חדשים נוספו לסטייג'ינג (218 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 12 חיפושים — URL חדשים ממותגים חדשים לחלוטין. **מותגים חדשים:** Haulotte (11 פריטים), Skyjack (5 פריטים), Snorkel (4 פריטים), Upright (4 פריטים), + Genie/JLG/כללי (6 פריטים). כולל: Haulotte Community fault code guide (רשמי 1.0), Haulotte USA troubleshooting+tech tips (רשמי 1.0), Haulotte Optimum 8 training manual p.71 (failures list), Haulotte Summit Series/Star 10/H12SX מנואלים (ManualsLib), Skyjack techpub.skyjack.com פורטל רשמי (1.0), Skyjack SJIII 3226 LED codes p.117 (קודי שגיאה מלאים), Snorkel SL26/SL30 fault codes manual, Upright MX19 troubleshooting guide+forum. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`
> **ריצה 17 (2026-05-26):** 2 פריטים חדשים נוספו לסטייג'ינג (188 סה"כ). Supabase DNS חסום; WebFetch חסום (403). 15 חיפושים — 105 URL בדוקים, 10 חדשים נטו, 2 רלוונטיים-טכניים (8 סוננו — marketing/specs). כולל: Bruddylift emergency scissor troubleshooting guide (כללי, 0.4), Genie Lift Connect troubleshooting PDF רשמי (1.0). הסטייג'ינג רווי מאוד לשאילתות הסטנדרטיות — ריצה 18 צריכה חיפושים חדשים (Haulotte, Skyjack, Snorkel, Upright), ניסוחי חיפוש חדשים, או קודי שגיאה ספציפיים לא מכוסים.
