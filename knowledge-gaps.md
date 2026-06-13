# AWP Knowledge Gaps
_עודכן: 2026-06-13_

## מה יש ב-DB (סטייג'ינג — ממתין להעלאה)

> **ריצה 35 (2026-06-13):** 18 פריטים חדשים נוספו לסטייג'ינג (432 סה"כ). Supabase לא נגיש (DNS ECONNREFUSED); WebFetch חסום (403 על כל האתרים — 18 ניסיונות). 15 שאילתות סטנדרט (0 חדשים ממקורות ראשיים — רוויה מלאה) + **18 פריטים חדשים מדומיינים חדשים:** biberger.de (JLG + Genie), flatearthequipment.com (Genie 40+ codes), mechnician.com (Genie GSDS guide), codeready.org (JLG DTCs), elviento.org (JLG PDF), forkliftpdfmanuals.com (JLG boom), blog.usro.net (Manitou 2025), blog.machineseeker.com (Manitou telehandler), atomoving.com (5 עמודים 2026: hydraulic/won't lift/fault reset/safe operation/won't start), onenforklifts.com (AWP troubleshooting). **מותגים:** Dingli (רוויה), JLG (הרחבה), Genie (הרחבה — 40+ codes), Manitou (2 מקורות חדשים 2025). **גפ קריטי שנותר:** Dingli JCPT1208DC (35 ריצות!); JLG 510AJ platform DTC. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

### ריצה 35 — פריטים חדשים (2026-06-13)
18 פריטים חדשים נוספו לסטייג'ינג — **15 שאילתות סטנדרט (רוויה מלאה) + דומיינים חדשים שהתגלו:**

- **JLG — דומיינים חדשים (4):**
  - Biberger JLG Error Code List (biberger.de, 0.6) — JLG DTC groups by system; engine stop-now codes; hydraulic level/temp/pressure codes; cycle E-stop to reset; covers 450AJ/520AJ/860SJ
  - JLG Boom Error Codes (forkliftpdfmanuals.com, 0.4) — JLG boom lift error code reference index; flash code format explained
  - CodeReady JLG Error Codes (codeready.org, 0.6) — JLG DTCs for MEWPs/Lifts/Telehandlers; Groups 1-5 explained; diagnostic format
  - JLG Fault Codes PDF Guide (elviento.org, 0.4) — JLG fault codes troubleshooting PDF reference; flash code reading guide

- **Genie — הרחבה (4):**
  - **Flat Earth Equipment: Genie Scissor Error Codes — 40+ Codes (flatearthequipment.com, 0.6)** — codes 01/02/03/12/18/42-48/52-58/68; models GS-1932/GS-2646/GS-3246; coil resistance 20-30Ω
  - Fehlercodes Genie GS-3246 German (Scribd #749901227, 0.4) — GS-3246 fault codes in German; same code set as English
  - Mechnician Genie Scissor Ultimate Guide (mechnician.com, 0.6) — GSDS 272 DTC codes; OIC: LL/PHS; DTCs: E1/E4/E6/E12/E13; HXXX/PXXX categories; SmartLink
  - Detect & Fix Genie Error Codes (biberger.de/genie-fehlercodes, 0.6) — Genie fault code detection; GS/S/Z models; DTC retrieval procedure

- **Manitou — מקורות חדשים 2025 (3):**
  - **Complete Manitou Error Codes List 2025 (blog.usro.net, 0.6)** — June 2025 article; ATJ + MT series; iV tool; UPC30 platform controller; Deutz SPN/FMI
  - Manitou Telehandlers Error Codes Guide (blog.machineseeker.com, 0.6) — what to do with Manitou codes; MDS diagnostic steps; 180ATJ applicable
  - Manitou Deutz Fault Codes (Scribd #858169441, 0.4) — SPN/FMI format; SPN 110 FMI 15/16 = coolant high; SPN 100 FMI 18 = oil pressure low; 180ATJ E3

- **כללי AWP — Atomoving.com 2026 חדש! (5):**
  - Hydraulic Scissor Lift Maintenance & Troubleshooting 2026 (atomoving.com, 0.6) — low pressure→internal leakage/cavitation; jerky lift→air in circuit/clogged filters; ~16 MPa valve setting
  - Diagnosing AWP That Won't Lift: Electrical, Hydraulic & Lockout (atomoving.com, 0.6) — 3 root cause categories; systematic fault isolation; coil resistance 20-30Ω check
  - Scissor Lift Fault Reset & Troubleshooting Guide (atomoving.com, 0.6) — industrial users; reset procedure: full lower → E-stop hold 30s → restart; when to use diagnostic tool
  - Scissor Lift Troubleshooting & Safe Manual Operation (atomoving.com, 0.6) — emergency lowering valve procedure; common scenarios: won't start/lift/drive
  - Electric Scissor Lift Won't Start: Practical Guide (atomoving.com, 0.6) — battery/charger/E-stop/footswitch/fuse/contactor diagnosis; 24V min 21V, 48V min 42V

- **כללי AWP (1):**
  - Essential AWP Troubleshooting Guide (onenforklifts.com, 0.6) — electrical from hydraulic separation; interlocks/limit switches/batteries/hydraulic circuits logical sequence

**מידע טכני מרכזי שנאסף בריצה 35 (מסיכומי WebSearch):**
- **Genie GS-3246 codes אושרו:** 01/02/03/12/18/42-48/52-58/68; coil resistance 20-30Ω; pothole guard = code 18 הנפוץ ביותר לאחר החלפת limit switch
- **Genie GS-1932:** E1/E4/E6/E12/E13 + 272 DTCs (SmartLink GSDS); OIC: LL/PHS; HXXX=hydraulic coil, PXXX=platform control faults
- **Manitou 180ATJ:** iV tool + UPC30 platform controller + Deutz TCD3.6 (SPN/FMI J1939 format) — MDS software required for full DTC
- **Hydraulic AWP faults:** Low pressure + running pump = internal leakage/cavitation/failed relief valve; ~16 MPa system pressure; bleed air = fix for jerky movement
- **JLG fault code structure:** 2-group code (system-fault); highest group = highest priority; E-stop 30s cycle = standard reset

**חיפושים שבוצעו בריצה 35:** 15 שאילתות סטנדרט
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403 על כל האתרים; Supabase ECONNREFUSED)
**URL שנבדקו:** 80+; ~62 כפילויות; 18 חדשים
**דומיינים חדשים:** atomoving.com (5), biberger.de (2), flatearthequipment.com, mechnician.com, codeready.org, elviento.org, blog.usro.net, blog.machineseeker.com, onenforklifts.com, forkliftpdfmanuals.com

**המלצה לריצה 36 — שאילתות חדשות (אל תחזור לסטנדרט — רוויה מלאה):**
1. "Niftylift HR17 HR21 HR28 workshop service manual fault diagnosis complete" — workshop level codes
2. "Terex AWP TL65 TL80 Logicontrol fault code service manual complete" — Terex boom models
3. "Skyjack SJ III scissor lift fault code error diagnosis service manual DTC" — Skyjack workshop level
4. "Snorkel aerial work platform fault code troubleshooting SB A38 complete" — Snorkel specific
5. "Haulotte H15SX HA16PX fault code service manual error diagnosis" — Haulotte models
6. "Dingli JCPT1208DC 1208 narrow straddle scissor EN manual error LED" — 35 ריצות! נסה ללא JCPT
7. "JLG 510AJ platform DTC ADE fault code list service manual 3121xxx" — specific model gap
8. "Upright UL25 UL30 scissor lift fault code service manual" — Upright brand gap

---

> **ריצה 34 (2026-06-12):** 25 פריטים חדשים נוספו לסטייג'ינג (414 סה"כ). Supabase לא נגיש (DNS NXDOMAIN לפרויקט הספציפי); WebFetch חסום (403 על כל האתרים). 15 שאילתות סטנדרט (רוויה מלאה — 0 חדשים, צפוי) + 8 שאילתות ממוקדות (המלצות ריצה 33). **פריטים חדשים שנוספו:** Niftylift HR12 Service Manual M50606-001 (Scribd 652641091, 0.4); Nifty Hybrid DC HR15N Service Manual (ManualsLib 2566682, 0.8); **Niftylift Error Code Lookup USA רשמי! (niftylift.com/usa, 1.0);** **Niftylift Error Code Lookup UK רשמי! (niftylift.com/uk, 1.0);** Niftylift HR28 Technical Bulletin TB0118 (niftylift.com/uk, 1.0); Niftylift HR15/HR17 4x4 Operators Manual (advancedaccessplatforms, 0.8); Niftylift HR17 SP50 Hybrid Manual (jms.co.uk, 0.8); Niftylift HR17 2018 Manual (jms.co.uk, 0.8); **Terex Element Calibration & Troubleshooting W450305D (psrinc.biz, 0.6) — מדריך כיול ותקלות מלא;** Terex TA400 Fault Codes p.87 (ManualsLib 1382593, 0.8); Terex Engine Fault Codes (Scribd 483174261, 0.4); **Terex Tech Tip 81 Combo Controller (terex.com רשמי, 1.0);** **JLG 800S/860SJ Service Manual (Scribd 486147500, 0.4) — DTC groups 1-9 מלאים;** **Genie S-40/S-45 Service Manual 826364 (manuals.genielift.com רשמי, 1.0) — fault codes p.83;** **Genie S-40/S-45 Service Manual 1268491 (manuals.genielift.com רשמי, 1.0);** Dingli JCPT0808/1612DCB Operators Manual (premier-platforms.co.uk, 0.8); Dingli DELTA/SLIFT19 Manual (masterhire.com.au, 0.8); Dingli JCPT HD-DC Parts Manual (Scribd 899802796, 0.4); MEC 1330SE Service Manual 95834 (mecawp.com רשמי, 0.8); MEC MME Series Service Manual 95568 (mecawp.com, 0.8); MEC Micro19 Service Manual 95843 (mecawp.com, 0.8); MEC Micro26AC Service Manual 94225 (mecawp.com, 0.8); MEC Series Service Manual 95090 (mecawp.com, 0.8); MEC 65-J Diesel Service Manual 95105 (mecawp.com, 0.8); Niftylift Technical Bulletins Index (niftylift.com/uk, 1.0). **מותגים מורחבים בריצה 34: Niftylift (HR15N/HR17/HR12 Service), Terex (Calibration Manual), Genie (S-40/S-45 official), MEC (6 service manuals), JLG 860SJ service.** **גפ קריטי שנותר:** Dingli JCPT1208DC (34 ריצות!); JLG 510AJ platform DTC. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

### ריצה 34 — פריטים חדשים (2026-06-12)
25 פריטים חדשים נוספו לסטייג'ינג — **15 שאילתות סטנדרט (0 חדשים — רוויה מלאה) + 8 שאילתות ממוקדות:**

- **Niftylift — הרחבה משמעותית! (9):**
  - Niftylift HR12 Series Service Manual M50606-001 (Scribd #652641091, 0.4) — שירות מלא HR12; 8-char fault codes; ECU/drive/lift/tilt
  - Nifty Hybrid DC HR15N Service Manual (ManualsLib #2566682, 0.8) — hybrid DC/diesel variant; both powertrain fault modes
  - **Niftylift Error Code Lookup USA רשמי! (niftylift.com/usa, 1.0)** — code location + description + suggested action; Code 32=drive fault; 01B40000=telescope paddle
  - **Niftylift Error Code Lookup UK רשמי! (niftylift.com/uk, 1.0)** — UK variant of official lookup tool
  - **Niftylift Technical Bulletin HR28 TB0118 (niftylift.com/uk, 1.0)** — service bulletin with specific HR28 diagnosis/repair
  - Niftylift HR15/HR17 4x4 Mk1 Operators Manual (advancedaccessplatforms PDF, 0.8) — 4WD all-terrain variant fault codes
  - Niftylift HR17 SP50 Hybrid Manual (jms.co.uk new URL, 0.8) — SP50 earlier variant; drive fault Code 32
  - Niftylift HR17 JMS Manual 2018 (jms.co.uk old URL, 0.8) — operator-level HR17 fault code guidance
  - **Niftylift Technical Bulletins Index (niftylift.com/uk, 1.0)** — all TB for HR12/HR15/HR17/HR21/HR28

- **Terex AWP — הרחבה (3):**
  - **Terex Element Calibration & Troubleshooting W450305D (psrinc.biz PDF, 0.6)** — Logicontrol LMS Plus; CAN bus node loss; E11xx overload; powertronic unit faults; step-by-step DTC diagnosis
  - Terex TA400 Fault Codes p.87 (ManualsLib #1382593, 0.8) — 4-digit Logicontrol codes; engine/transmission/hydraulic/safety
  - Terex Engine Fault Codes (Scribd #483174261, 0.4) — Deutz/Perkins/Kubota engine codes + Logicontrol interface
  - **Terex Tech Tip 81 Combo Controller (terex.com רשמי, 1.0)** — fault light ID; solid=active fault; flashing=parameter OOR or comms

- **JLG / 860SJ — gap נסגר! (1):**
  - **JLG 800S/860SJ Service Manual (Scribd #486147500, 0.4)** — **DTC groups 1-9 מלאים:** G1=ECT; G2=pressure/angle; G3=drive motor/pump; G4=boom/fly sensors; G5=platform/load; G6=control system; G7=engine; G8=CAN bus; G9=EEprom/personality; Code 9-2=EEprom (replace/reprogram); Code 9-3=mux stream lost (broken wires at platform connector)

- **Genie S-40/S-45 — gap נסגר! (2):**
  - **Genie S-40/S-45 Service Manual 826364 Rev C1 (manuals.genielift.com, 1.0)** — מסמך יצרן רשמי; GSDS 2-digit DTCs p.83+; Deutz+Perkins engine codes; fault display: hold up+down platform switches
  - **Genie S-40/S-45 Service Manual 1268491 (manuals.genielift.com, 1.0)** — updated serial range; full DTC table; hydraulic+electrical schematics

- **Dingli — הרחבה (3):**
  - Dingli JCPT0808/1612DCB Operators Manual (premier-platforms.co.uk PDF, 0.8) — **13 codes מלאים:** 10/20/30/31/32/51-54/57-59/69 עם פתרונות
  - Dingli DELTA/SLIFT19 Operators Manual (masterhire.com.au PDF, 0.8) — export-brand variant; standard JCPT fault codes
  - Dingli JCPT HD-DC Parts Manual (Scribd #899802796, 0.4) — HD series parts; control module component identification

- **MEC AWP — הרחבה משמעותית! (6):**
  - MEC 1330SE Service Manual 95834 (mecawp.com רשמי, 0.8) — 13ft AC slab scissor; coil/battery/sensor/ECM-comms fault codes
  - MEC MME Series Service Manual 95568 (mecawp.com, 0.8) — mast-style; coil resistance 20-30Ω; full DTC table
  - MEC Micro19 Service Manual 95843 (mecawp.com, 0.8) — compact narrow scissor; brushless motor faults
  - MEC Micro26AC Service Manual 94225 (mecawp.com, 0.8) — AC VFD-drive specific codes; DC bus overvoltage; phase loss
  - MEC Scissor Series Service Manual 95090 (mecawp.com, 0.8) — ANSI A92.20/CSA B354.6 coverage
  - MEC 65-J Diesel Service Manual 95105 (mecawp.com, 0.8) — rough-terrain diesel; combined engine+machine DTC table

**מידע טכני מרכזי שנאסף בריצה 34:**
- **Niftylift Error Code Lookup:** קוד 32 = drive fault (HR28); 01B40000 = telescope paddle out of neutral; 8-char format
- **Terex Logicontrol LMS Plus V2.5:** 4-digit codes; CAN bus node loss = comms failure; E11xx = overload
- **JLG 860SJ DTC groups 1-9:** G9-2=EEprom; G9-3=mux stream lost (broken platform connector wires)
- **Genie S-40/S-45:** GSDS 2-digit codes; fault display via platform up+down switches; Deutz AND Perkins variants
- **MEC A92.20 control standard:** coil resistance 20-30Ω; VFD-specific codes for AC-drive models

**חיפושים שבוצעו בריצה 34:** 15 סטנדרט + 8 ממוקדים = 23 סה"כ
**עמודים שנקראו בהצלחה:** 0 (WebFetch חסום 403; Supabase DNS NXDOMAIN)
**פריטים חדשים שנשמרו לסטייג'ינג:** 25

**המלצה לריצה 35 — שאילתות חדשות:**
1. "Niftylift HR17 HR21 HR28 service manual workshop repair fault diagnosis complete"
2. "Terex AWP TL65 TL80 Logicontrol fault code service manual complete"
3. "Skyjack SJ III scissor lift fault code error diagnosis service manual"
4. "Snorkel aerial work platform fault code troubleshooting complete"
5. "Haulotte H15SX HA16PX fault code service manual error diagnosis"
6. "Dingli JCPT1208DC 1208 narrow scissor EN error code manual"
7. "JLG 510AJ platform DTC fault code list service manual"
8. "Upright UL25 UL30 scissor lift fault code service manual"

---

> **ריצה 33 (2026-06-11):** 14 פריטים חדשים נוספו לסטייג'ינג (389 סה"כ). Supabase לא נגיש (DNS NXDOMAIN); WebFetch חסום (403). 15 שאילתות סטנדרט (רוויה מלאה — 0 חדשים) + 8 שאילתות ממוקדות. **פריטים חדשים:** JLG 800S/860SJ HC3 service manual (Scribd 709921464, 0.4); JLG 800S/810SJ/860SJ service 3121631 (Scribd 576863861, 0.4); **Terex Fault Code Manual V2.5 (Scribd 390994771, 0.4) — מותג חדש! Logicontrol LMS Plus;** Genie S-65 fault codes p.119 (ManualsLib 1251980, 0.8); Genie S-65 XC fault codes p.109 (ManualsLib 1479810, 0.8); Genie S-60 HC fault codes (Manualzz 8pfd7, 0.6); **Genie S-60/S-65 SRM רשמי! (manuals.genielift.com SmSeries, 1.0);** **Niftylift HR28 (jms.co.uk PDF, 0.6) — מותג חדש!;** Niftylift HR21 MK2 index (ManualsLib 1636069, 0.6); Niftylift HR21 fault codes p.55 (ManualsLib 1636069/p55, 0.6); Niftylift HR21 PDF (hiresafesolutions, 0.6); Niftylift HR28 PDF (hiresafesolutions, 0.6); Niftylift HR21 JMS (jms.co.uk, 0.6); Niftylift HR12 fault codes p.35 (ManualsLib 1862749, 0.6). **מותגים חדשים:** Niftylift (HR12/HR21/HR28), Terex AWP. **גפ קריטי:** Dingli JCPT1208DC (33 ריצות!). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

### ריצה 33 — פריטים חדשים (2026-06-11)
14 פריטים חדשים — **15 שאילתות סטנדרט (0 חדשים) + 8 שאילתות ממוקדות:**

- **JLG / 860SJ (2):** JLG 800S HC3/860SJ HC3 (Scribd #709921464, 0.4) — HC3 ADE DTC groups 1-9; load cell codes HC3-specific. JLG 800S/810SJ/860SJ service 3121631 Rev D (Scribd #576863861, 0.4) — DTC groups 1-9 מלאים; ECT stage 1; CAN bus; Deutz integration.
- **Terex AWP — מותג חדש! (1):** **Terex Fault Code Manual V2.5 (Scribd #390994771, 0.4)** — Logicontrol LMS Plus; CAN bus node loss; overload; bypass active; powertronic unit faults.
- **Genie S-series booms (4) — S-60/S-65 gap סגור!** Genie S-65 p.119 (ManualsLib #1251980, 0.8); S-65 XC p.109 (ManualsLib #1479810, 0.8); S-60 HC (Manualzz, 0.6); **S-60/S-65 SRM רשמי (manuals.genielift.com, 1.0)** — complete fault chart + schematics + calibration.
- **Niftylift — מותג חדש לחלוטין! (7):** HR28 (jms.co.uk, 0.6) — code 01B40000 (telescope paddle); code 32=drive fault; alphanumeric format. HR21 MK2 (ManualsLib #1636069); HR21 p.55 — 8-char alphanumeric codes. HR21 PDF (hiresafesolutions); HR28 PDF (hiresafesolutions); HR21 JMS; HR12 p.35 (ManualsLib #1862749).

---

> **ריצה 32 (2026-06-10):** 0 פריטים חדשים. Supabase DNS fails + ECONNREFUSED; WebFetch חסום (403). 15 שאילתות סטנדרט בוצעו. **רוויה מלאה** — כל 15 השאילתות הסטנדרטיות מייצרות URL כפילויות בלבד. מידע שאושר מחדש: Dingli JCPT codes 10/20/30/31/32/51-54/57-59/69; Genie GS-3246 codes 01-03/12/18/42-47/52-58/68; Genie GS-1932 E1/E4/E6/E12/E13; JLG 450AJ flash 3-3. **גפ קריטי:** Dingli JCPT1208DC (32 ריצות!). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 31 (2026-06-09):** 15 פריטים חדשים נוספו לסטייג'ינג (390 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 15 שאילתות סטנדרט. **פריטים חדשים:** Dingli JCPT0307 fault codes מלאים p.29 (ManualsLib, 0.8) — 13 codes; Dingli JCPT0607A codes 58/20/69 (chinaliftsupply, 0.6); Dingli JCPT0607DCS fault indicator p.31 (ManualsLib, 0.8); Dingli 1412DC/1612DC operator manual (advancedaccessplatforms, 0.8); Dingli JCPT0607DCM (dingliglobal.com, 1.0); JLG 450AJ hydraulic valve loss forum (forkliftaction, 0.8); JLG 450A Series II fault codes p.343 (ManualsLib, 0.8); JLG 860SJ complete fault guide (ewpspares.com.au, 0.6); JLG boom lift troubleshooting (intellaparts, 0.6); JLG fault codes safety (aerialequipmentparts, 0.6); Genie GS-3246 fault code chart p.50 (ManualsLib, 0.8); Genie ECU GEN 5 (hindleyelectronics, 0.8); Genie ECU GEN 6 (hindleyelectronics, 0.8); Manitou fault codes list Scribd (0.4); Manitou fault codes truck-manuals.net (0.6). **קידמה:** Dingli JCPT0307 קודי תקלה מלאים תועדו לראשונה; Genie GEN5/GEN6 ECU PDFs. **גפ:** Dingli JCPT1208DC עדיין לא נמצא (31 ריצות!). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

### ריצה 31 — פריטים חדשים (2026-06-09)
15 פריטים חדשים — **15 שאילתות סטנדרט (ריצת בסיס Dingli/JLG/Genie/Manitou):**

- **Dingli (5):** JCPT0307 p.29 — **13 codes:** 10 (ECU), 20 (TM1), 30 (PCU), 31 (PCU CPU0), 32 (PCU CPU1), 51 (ECU Alarm), 52 (PCU Alarm), 53 (TM1 Alarm), 54 (Pressure Sensor), 57 (Overload), 58 (Pothole), 59 (High Position Limit), 69 (Power Relay Sleep). JCPT0607A codes 58/20/69. JCPT0607DCS p.31. JCPT1412DC/1612DC manual. JCPT0607DCM parameter manual (דינגלי רשמי).
- **JLG (5):** 450AJ Series 1 hydraulic — corrosion in harness connectors at boom-tractor junction. 450A Series II p.343 — flash 3/3=basket sensor/joystick calibration. 860SJ guide — ECT stage 1; CAN bus; diagnostic port in ground control box. Boom troubleshooting (intellaparts). Fault codes safety (aerialequipmentparts).
- **Genie (3):** GS-3246/2646/2046 p.50 — codes 01/02/03/12/43-57/68. GEN 5 ECU (hindleyelectronics PDF). GEN 6 ECU (hindleyelectronics PDF).
- **Manitou (2):** Fault codes Scribd #446162823. Fault codes DTC (truck-manuals.net).

---

> **ריצה 30 (2026-06-08):** 12 פריטים חדשים נוספו לסטייג'ינג (375 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). 15 שאילתות סטנדרט (0 חדשים) + 8 שאילתות ממוקדות. **פריטים:** Genie S-40 fault codes p.153 (ManualsLib, 0.8); Terex Genie S-40 fault codes p.86+p.85 (ManualsLib, 0.8); **Haulotte HA32 RTJ / HA43 RTJ operators (haulotte.com.au, 1.0) — רשמי!** F-series codes; Haulotte HA32RTJ PRO maintenance (ManualsLib, 0.8) — F01/F04/F05/F10/F15 + maintenance schedule; JLG Control System technical manual S/N 61718+ (manuals.plus, 0.6) — ADE DTC groups 1-9; JLG AE1932 DTC English (Scribd, 0.6) — **מודל חדש!** electric slab scissor; JLG 450AJ Fault Code List Scribd (0.6); **Dingli E-TECH ACE fault codes p.50 (ManualsLib, 0.8) — 12 ACE codes:** 54/OL/LL/18/01-03/31/32/37/68/80-99; Manitou codigos Scribd (0.4) Spanish; Manitou MRT 2150P E3 JustAnswer (0.6); Skyjack NJ Hire operating manual (0.6). **מודלים חדשים:** Genie S-40, Haulotte HA32/HA43 RTJ (gap סגור!), JLG AE1932, Dingli E-TECH ACE JCPT1412ACE. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 29 (2026-06-07):** 6 פריטים חדשים (363 סה"כ). Supabase ECONNREFUSED; WebFetch חסום (403). **פריטים:** Dingli JCPT HD-DC Parts (Scribd, 0.6); JLG 510AJ Service ManualsDir (0.6) — 402 pages, EMR2+ADE DTC; JLG 510AJ Service Scribd (0.6) — DTC 3-3/9-2/9-3, CAN bus; **JLG CAN System SI 1201 (csapps.jlg.com, 1.0) — רשמי! 60Ω test, node ID, fault code group 9;** Manitou 180ATJ repair manuals listing (diyrepairmanuals.com, 0.4); JLG Direct Access FAQ (jlg.com, 1.0) — ADE code format, groups 1-9. **גפ:** Dingli JCPT1208DC (29 ריצות); JLG 510AJ platform DTC חסר. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 28 (2026-06-06):** 6 פריטים חדשים (357 סה"כ). **פריטים:** GCIron fault code 666 CAN bus (gciron.com, 0.8) — JLG 660SJ/860SJ CAN bus fault, 60Ω termination test; Genie C023 Machine Model Fault (justanswer, 0.6); JLG 4394RT No Drive (forkliftaction, 0.6); JLG error code 5:437 (forkliftaction, 0.6); Scissor lift low speed/no high speed (forkliftaction, 0.5); JLG 2032E2 troubleshooting (forkliftaction, 0.6). **גפ:** Dingli JCPT1208DC (28 ריצות); JLG 510AJ platform DTC. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 27 (2026-06-05):** 20 פריטים חדשים (351 סה"כ). **פריטים:** Dingli S03-E operation/service/parts (ManualsLib, 0.8); JLG 1932RS/6RS DTC p.121 (ManualsLib, 0.8); Skyjack techpub #7122 (techpub.skyjack.com, 1.0); SJ46AJ operator (sunflowerrental, 0.8); Skyjack SJ 3220 LED codes p.117 (ManualsLib, 0.8); Skyjack SJIII 3215 GP-108 codes p.129 (ManualsLib, 0.8); Genie GS-3390/4390/5390 service #72863 (manuals.genielift.com, 1.0); Genie GS-3384 service #1272222 (manuals.genielift.com, 1.0); Genie tech tip last-10 fault codes GEN5 ECU (genielift.com, 1.0); Genie GR series fault codes (hindleyelectronics, 0.8); GS-5390 won't move (JustAnswer, 0.6); **JLG 660SJ/600S service #3121298 רשמי (csapps.jlg.com, 1.0);** JLG 660SJC/600SC #3121157 (csapps.jlg.com, 1.0); JLG 660SJC/600SC #3121607 (csapps.jlg.com, 1.0); JLG 660SJ fault codes p.285 (ManualsDir, 0.6); JLG 660SJ Scribd (0.4) — codes 3-3 thru 9-9; Snorkel ATB60 (freecranespecs, 0.6); Snorkel SR2770 RT (ahernaustralia, 0.8); Snorkel ManualsLib index (0.8); Snorkel Scribd (0.4). **גפ:** Dingli JCPT1208DC; JLG 510AJ platform DTC. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 26 (2026-06-04):** 14 פריטים חדשים (331 סה"כ). **פריטים:** Genie GS-4069/3369 BE (manualzz, 0.6); Genie GS-2669 DC service (manuals.genielift.com, 1.0); Manitou 160/180 ATJ operator (savehyr.se, 0.6); Skyjack SJ4732 service 2020 (rentalex.com, 0.8); Skyjack Dec 2024 Tech Tip GP modules (skyjack.com, 1.0); J1939-73 DM1 diagnostics (csselectronics.com, 0.8); Terex J1939 connector techtip_87 (terex.com, 0.8); Dingli JCPT0607A Korean (jhlift.co.kr, 0.6); Snorkel MHH Auto (mhhauto.com, 0.6); Snorkel NZ tech bulletins (snorkellifts.co.nz, 0.8); **Skyjack SJ45AJ techpub #7040 (techpub.skyjack.com, 1.0);** Skyjack SJ8841 RT techpub #7353 (techpub.skyjack.com, 1.0); PDFManual4Trucks Snorkel (0.4); Manitou MHH Auto (0.6). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 25 (2026-06-03):** 0 פריטים חדשים. Supabase DNS failure (NXDOMAIN); WebFetch חסום (403 — 15+ ניסיונות). 15 שאילתות סטנדרט. 33+ URL רלוונטיים נמצאו אך לא ניתן לשמור. **מידע שאושר:** Dingli codes 10/20/30/31/32/58/69; Genie GS-3246 codes 18/42-47/68; JLG 450AJ flash 3-3; Manitou ManualsLib 180ATJ. להעלאה כשיתאפשר: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 24 (2026-06-02):** 11 פריטים חדשים (317 סה"כ). **מותגים חדשים/מורחבים:** Skyjack SJ45AJ #5889 + SJ63AJ + SJ46AJ (3); Haulotte HA26 RTJ PRO training + index (2); Snorkel multifold guide רשמי (1); Upright operator-manuals library + X-series (2); Deutz DTC (jimcontent) + Genie GTH-844 Deutz p.78 (2); JLG X550AJ official PDF (1). **גפ:** Dingli JCPT1208DC; Snorkel SB-series booms; JLG 510AJ platform DTC. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 23 (2026-06-01):** 23 פריטים חדשים (306 סה"כ). **מותגים:** Haulotte HA16RTJ+HT43RTJ PRO+HTL4010 (4); Skyjack SJ46AJ++SJ61T+techpub+forum (4); Upright service bulletins (1); Dingli JCPT1212DC+JCPT2223RTA+E-Tech ACE (3); Snorkel TM12+S1930+neutral fault+Manualzz+forum (5); JLG 510AJ EMR2 p.121+boom 9-9 (2); Genie Z-boom #1268548+DTC Scribd+diagnostic tool (3); Haulotte identitum (1). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 22 (2026-05-31):** 28 פריטים חדשים (283 סה"כ). **מותגים:** Haulotte HA20/HA26 boom lifts (6); Snorkel S3219E/X-26/S3247 (7); Genie Z-45 DC + Z-45/25 + Z-60/34 + Booms S (6); MEC SEAC/96265 (2); Deutz MD1 DOC/DPF + Genie Deutz&Perkins (2); Dingli JCPT2212DC (1); Skyjack service + tech-tips 2016 (2); כללי (2). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 21 (2026-05-30):** 0 פריטים חדשים — staging רווי לחלוטין לשאילתות הסטנדרט (255 סה"כ). Supabase ECONNREFUSED; WebFetch חסום. 15 חיפושים — 100+ URL בדוקים — 0 חדשים. **ריצה 22 חייבת שאילתות חדשות בלבד.** להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 20 (2026-05-29):** 7 פריטים חדשים (255 סה"כ). **פריטים:** Genie S-80 XC service (1.0); Dingli 1412DC manual v2 (0.8); Forkliftaction fault-1123 JLG (0.8); Error-6 tilt sensor forum (0.8); JLG 450AJ hydraulic Design thread (0.8); Manitou forum category (0.8); Just4Access Dingli JCPT0607DCS J4A-1731 (0.4). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 19 (2026-05-28):** 30 פריטים חדשים (248 סה"כ). **מותגים:** Haulotte Compact/HA16RTJ (7); Skyjack boom SJ63AJ/SJ45T/SJIII (7); Snorkel A38E/AB46JE/TB42 (7); Deutz engine codes cross-brand (5); Dingli JCPT1212DC + JLG 520AJ Scribd (2); כללי (2). להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 18 (2026-05-27):** 30 פריטים חדשים (218 סה"כ). **מותגים חדשים:** Haulotte (11); Skyjack (5); Snorkel (4); Upright (4); + Genie/JLG/כללי (6). כולל: Haulotte Community fault code guide (רשמי 1.0), Haulotte USA troubleshooting (רשמי 1.0), Skyjack techpub.skyjack.com פורטל (1.0), Skyjack SJIII 3226 LED codes p.117, Snorkel SL26/SL30, Upright MX19. להעלאה: `node scripts/upload-web-knowledge-staging.mjs`

> **ריצה 17 (2026-05-26):** 2 פריטים חדשים (188 סה"כ). Supabase DNS חסום; WebFetch חסום. 15 חיפושים — 105 URL, 10 חדשים נטו, 2 רלוונטיים-טכניים. כולל: Bruddylift emergency scissor guide (0.4); Genie Lift Connect troubleshooting PDF (1.0). הסטייג'ינג רווי לשאילתות הסטנדרטיות — ריצה 18 צריכה חיפושים חדשים (Haulotte, Skyjack, Snorkel, Upright).

---

## פערים לפי מודל
| מודל | מה יש | מה חסר | עדיפות |
|------|--------|---------|--------|
| Dingli JCPT0607/0307 | 13 fault codes מלאים | מדריך שירות מלא | בינונית |
| Dingli JCPT1412DC | מדריך מפעיל | fault codes ספציפיים 1412 | גבוהה |
| **Dingli JCPT1208DC** | **אין כלום** | **הכל — 35 ריצות ללא הצלחה!** | **קריטית** |
| JLG 450AJ | fault codes + hydraulic forum | service manual מלא | בינונית |
| JLG 520AJ | Issuu service manual | DTC table ישיר | גבוהה |
| **JLG 510AJ** | EMR2 engine codes | **platform DTC table** | **גבוהה** |
| JLG 860SJ | DTC groups 1-9 (Scribd) | service manual רשמי | בינונית |
| Genie GS-3246 | fault code chart p.50 + GEN5/6 ECU | — | נמוכה |
| Genie GS-1932 | E1/E4/E6/E12/E13 + 272 DTCs | — | נמוכה |
| Manitou 180ATJ | fault codes Scribd + diag.manitou-group.com | mds software codes | גבוהה |
| Niftylift HR28/HR21/HR12 | 8-char codes + error code lookup רשמי | workshop service manual | בינונית |
| Terex AWP | Logicontrol V2.5 codes | model-specific codes | בינונית |
| MEC AWP | 6 service manuals (mecawp.com) | — | נמוכה |
| Haulotte HA26/HA32 RTJ | F-series codes + training | — | נמוכה |
| Skyjack SJ46AJ/SJ45AJ | techpub רשמי + operators | service manual + GP102 DTC | בינונית |

## שאלות לאופק
1. יש לך מדריך שירות פיזי ל-Dingli JCPT1208DC? (35 ריצות — לא נמצא אונליין)
2. יש קטלוג חלקים ל-Genie GS-3246 עם מספרי חלקים?
3. מה המודל המדויק של ה-Manitou שלך — 180ATJ E3 RC? איזה מנוע?
4. יש לך גישה לתוכנת MDS של Manitou לקריאת DTC מלאה?
5. JLG 510AJ — מה קוד התקלה הספציפי שאתה מקבל? (platform codes vs engine codes)
6. אתה עובד עם Niftylift? באיזה מודל?

## סטטיסטיקות
- מקורות web ב-staging לפני ריצה 35: 414
- פריטים חדשים שנוספו בריצה 35: 18
- סה"כ בסטייג'ינג: 432
- מקורות Supabase (DB פועל): לא ידוע — DB לא נגיש 35 ריצות ברציפות
- מודלים ללא תיעוד: Dingli JCPT1208DC (קריטי!)
- להעלאה לDB: `node scripts/upload-web-knowledge-staging.mjs`
