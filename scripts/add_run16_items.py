#!/usr/bin/env python3
import json

with open('/home/user/awp-knowledge-system/web-knowledge-staging.json') as f:
    data = json.load(f)

new_items = [
  {
    "url": "https://www.forkliftaction.com/forum/code-20-no-fwd-or-rev-hydraulics-work.aspx?q=114263",
    "title": "Code 20 No Forward or Reverse — Hydraulics Work | Forkliftaction Forum",
    "content_summary": "Forum discussion about fault code 20 where machine shows code 20 error with no forward or reverse drive but hydraulics (lift) still work. Code 20 on scissor lift platforms corresponds to traction motor controller fault (TM1 alarm). Diagnosis: check CAN bus communication between ECU and drive controller, inspect wiring harness between ECU and TM1 controller, verify motor controller power supply. On Dingli JCPT models code 20 = General Alarm TM1 indicating traction motor 1 controller fault or motor driver issue. Drive function disabled while lift hydraulics may remain operational. Solutions: inspect TM1 controller connections for corrosion, check motor phase wiring, test motor resistance, replace TM1 controller if wiring tests OK.",
    "brands_mentioned": ["Dingli", "JLG", "Genie"],
    "equipment_model": "general scissor lift",
    "topic": "fault_codes",
    "reliability_score": 0.8
  },
  {
    "url": "https://www.forkliftaction.com/forum/genie-gs2632-error-codes-c023-and-c052.aspx?q=119724",
    "title": "Genie GS2632 Error Codes C023 and C052 | Forkliftaction Forum",
    "content_summary": "Forum discussion about Genie GS-2632 scissor lift error codes C023 and C052. These codes are part of the Genie SmartLink Diagnostic System (GSDS). C023 and C052 are DTC codes on the GS-2632 mid-size scissor lift (26ft working height, 32in deck). C023 relates to a drive circuit fault; C052 relates to a steering or brake coil fault. Community diagnosis includes: checking coil resistance (target 12-15 ohms for solenoid coils), inspecting wiring harness at solenoid valve block, verifying controller output voltage, testing drive motor. Genie GS-2632 uses same GSDS system as GS-1932 and GS-3246. Reset: cycle key switch after repairing underlying fault. Full DTC list in Genie service manual part 96316 or 97385.",
    "brands_mentioned": ["Genie"],
    "equipment_model": "GS-2632",
    "topic": "fault_codes",
    "reliability_score": 0.8
  },
  {
    "url": "https://www.forkliftaction.com/forum/slow-lift-code-29.aspx?q=111269",
    "title": "Slow Lift Code 29 | Forkliftaction Forum",
    "content_summary": "Forkliftaction forum thread about scissor lift exhibiting slow lift speed accompanied by fault code 29. Code 29 typically indicates hydraulic pressure sensor fault, pump performance degradation, or relief valve pressure setting issue. Slow lift with fault code 29 may indicate: insufficient hydraulic pressure (blocked suction filter reducing pump flow), failing hydraulic pump, pressure sensor failure, or relief valve opening prematurely at low pressure. Community diagnosis steps: (1) Check hydraulic fluid level; (2) Test pressure at pump outlet test port — compare to rated pressure in service manual (typically 16-20 MPa); (3) Inspect suction filter for blockage; (4) Verify pressure relief valve setting; (5) Test pressure sensor calibration. Models referenced: JLG and Genie scissor lifts.",
    "brands_mentioned": ["JLG", "Genie"],
    "equipment_model": "general scissor lift",
    "topic": "hydraulics",
    "reliability_score": 0.6
  },
  {
    "url": "https://www.forkliftaction.com/forum/2015-genie-gs1930-error-code-c021.aspx?q=107407",
    "title": "2015 Genie GS1930 Error Code C021 | Forkliftaction Forum",
    "content_summary": "Forkliftaction forum discussion about a 2015 Genie GS-1930 displaying error code C021. C021 on Genie GS-1930/1932 is a DTC indicating a drive motor circuit fault or drive controller communication issue. The GS-1930 uses 24V DC drive system. C021 may indicate: motor controller fault, motor winding fault, or CAN bus communication failure between ECMs. Diagnosis steps: (1) Inspect drive motor connector and wiring; (2) Test motor winding resistance; (3) Check battery voltage under drive load; (4) Inspect drive controller connections; (5) If wiring and motor test OK, replace drive controller. Community notes: C021 on 2015 model with GEN 6 ECU may differ from older GEN 5 interpretation. Refer to Genie service manual part 97385.",
    "brands_mentioned": ["Genie"],
    "equipment_model": "GS-1930",
    "topic": "fault_codes",
    "reliability_score": 0.8
  },
  {
    "url": "https://www.forkliftaction.com/forum/flash-code-3-3.aspx?t=28539",
    "title": "JLG Flash Code 3-3 Troubleshooting | Forkliftaction Technical Forum",
    "content_summary": "Forkliftaction technical forum thread dedicated to JLG flash code 3-3 diagnosis. Flash code 3-3 indicates a short circuit in an output driver — one of the most common JLG fault codes with 50+ possible troubleshooting paths. Systematic isolation: (1) Disconnect platform harness connector at base machine — if code clears, fault is on platform side; if persists, fault is on base machine. (2) Check solenoid valve coil resistance individually (each should be 20-30 ohms; open or short indicates bad coil). (3) Inspect harness for chafed wires causing shorts. (4) Check sensor wiring (tilt, load, position sensors). (5) If all external components test OK, controller may be the fault. Models affected: JLG 450AJ, 2646ES, 3246ES, 45E, and other JLG models using pre-CAN flash code system.",
    "brands_mentioned": ["JLG"],
    "equipment_model": "450AJ",
    "topic": "fault_codes",
    "reliability_score": 0.8
  },
  {
    "url": "https://www.forkliftaction.com/forum/code-ll.aspx?q=129033",
    "title": "Scissor Lift Code LL — Forkliftaction Forum",
    "content_summary": "Forum thread about scissor lift displaying code LL on the LED ground control display. Code LL on Dingli JCPT series scissor lifts appears when the Emergency Stop button is activated or a critical safety interlock is engaged. Per Dingli operators manuals: push in and pull out the red Emergency Stop button to reset the LL code. Code LL is not a numeric fault code but indicates the E-stop circuit is open. Diagnosis: (1) Locate and release all E-stop buttons on platform and ground controls; (2) Inspect E-stop button for damage or stuck position; (3) Check E-stop circuit wiring for open circuit; (4) Verify all safety interlock switches (tilt sensor, pothole guard, overload sensor). Thread includes Dingli JCPT-specific guidance and general scissor lift LL code diagnosis.",
    "brands_mentioned": ["Dingli"],
    "equipment_model": "JCPT0307",
    "topic": "fault_codes",
    "reliability_score": 0.6
  },
  {
    "url": "https://www.forkliftaction.com/forum/jlg-1930es.aspx?q=74547",
    "title": "JLG 1930ES Scissor Lift Troubleshooting | Forkliftaction Forum",
    "content_summary": "Forkliftaction forum thread about JLG 1930ES scissor lift troubleshooting and fault codes. JLG 1930ES: electric 19ft scissor lift, 30in platform width, 500 lb capacity, 24V DC system. Common fault codes: pothole guard faults (flash code 2-5), load management faults (code 9-2/9-3), drive motor faults, battery faults. Flash code reading: observe LED on ground control box. Uses same flash code system as JLG 2646ES and 3246ES. Battery: four 6V batteries in series for 24V system; check individual cell specific gravity monthly. Common issues: drive not working after pothole guard activation (reset by cycling E-stop), slow drive speed (check battery charge), intermittent fault codes (inspect connector corrosion in ground control box). Community tips from field technicians.",
    "brands_mentioned": ["JLG"],
    "equipment_model": "1930ES",
    "topic": "fault_codes",
    "reliability_score": 0.6
  },
  {
    "url": "https://www.hiresafesolutions.com/wp-content/uploads/2016/11/Manitou-160ATJ-Operators-Manual.pdf",
    "title": "Manitou 160ATJ 180ATJ Access Platform Operator Manual (547370 EN) | HireSafe Solutions",
    "content_summary": "Manitou access platform operators manual covering 160 ATJ and 180 ATJ models (document 547370 EN, 22/11/2006), hosted by HireSafe Solutions UK. The 160ATJ and 180ATJ share the same platform control system. Contents: machine specifications for both models, safety instructions, pre-operation inspection, operating procedures, fault/error indicator descriptions and actions, emergency descent procedure, maintenance schedule. Fault indicators: overload warning (reduce platform load), tilt warning (level machine on flat surface), low fuel/hydraulic fluid warnings, engine fault warning, safety system faults (boom limit switches). Emergency procedures: manual boom lowering in case of power failure. Maintenance intervals: hydraulic oil check weekly, engine oil check daily, lubrication points monthly. Primary operator reference for Manitou 180ATJ fault indicator system and operator-level troubleshooting — distinct from service manual with technician-level fault codes via MDS software.",
    "brands_mentioned": ["Manitou"],
    "equipment_model": "180ATJ",
    "topic": "maintenance",
    "reliability_score": 0.8
  },
  {
    "url": "https://mechnician.com/pages/jlg-material-handling-diagnostic-software",
    "title": "JLG Material Handling Diagnostic Software | Mechnician (Jaltest)",
    "content_summary": "Mechnician page covering Jaltest diagnostic software for JLG scissor lifts and boom lifts. The Jaltest diagnostic system interfaces with JLG equipment via OBD/CAN diagnostic port to read and clear fault codes, access live sensor data, and program controller parameters. Covers JLG boom lifts (450AJ, 520AJ, 860SJ) and scissor lifts (3246ES, 4669LE). Key capabilities: real-time DTC reading and clearing, active and historical fault log, live sensor data (boom angles, hydraulic pressures, temperatures), controller programming and calibration. Diagnostic port location: ground control box analyzer port. Alternative to JLG proprietary analyzer (Part 1001249695) using Jaltest universal construction equipment diagnostic hardware. Useful for technicians servicing multiple AWP brands who need one diagnostic tool.",
    "brands_mentioned": ["JLG"],
    "equipment_model": "860SJ",
    "topic": "fault_codes",
    "reliability_score": 0.6
  },
  {
    "url": "https://store.intellaliftparts.com/blog/jlg-boom-lifts/",
    "title": "JLG Boom Lift Troubleshooting Guide | Intella Liftparts",
    "content_summary": "JLG boom lift troubleshooting guide from Intella Liftparts, a specialist JLG parts supplier. Covers common fault scenarios on JLG articulating (450AJ, 520AJ) and telescopic boom lifts (860SJ, 1200SJ). Troubleshooting topics: reading CAN bus fault codes via ground control analyzer port, wiring harness inspection for shorts and open circuits, sensor replacement procedures (tilt, load, position), controller diagnosis and replacement. Common faults: no drive function (check drive controller faults, ground drive enable circuit), boom extension fault (check telescope valve solenoid resistance and spool movement), platform leveling fault (check platform level sensor and actuator), engine fault codes (ECT stage 1/2, oil pressure). Key diagnostic approach: start with DTC group having highest first digits, use JLG Knowledge Base at jlg.com/directaccess for model-specific corrective actions.",
    "brands_mentioned": ["JLG"],
    "equipment_model": "860SJ",
    "topic": "fault_codes",
    "reliability_score": 0.8
  },
  {
    "url": "https://www.just4access.com/dingli-jcpt-0607-dcs-7/",
    "title": "Dingli JCPT 0607 DCS — J4A Equipment | Just4Access",
    "content_summary": "Just4Access (J4A) product listing for Dingli JCPT 0607 DCS scissor lift, catalog number J4A 1430. Specifications: working height 6m/20ft, platform dimensions 2.73m x 1.2m, rated load 450kg, drive speed (lowered) 4.0 km/h, battery 24V/225Ah, charge time 8 hours. The DCS (Dual Cylinder Standard) variant uses canbus control system with two hydraulic cylinders. Differentiates from DCM (DC Motor controller) and DCE variants. For JCPT0607DCS fault codes: refer to operators manual (ManualsLib #1617028 page 31) covering codes 10/20/30/31/32/51/52/53/54/57/58/59/110/111/112. European J4A catalog reference for identifying spare parts. Helps identify JCPT0607 variant-specific part numbers for European market machines.",
    "brands_mentioned": ["Dingli"],
    "equipment_model": "JCPT0607DCS",
    "topic": "general",
    "reliability_score": 0.4
  }
]

data.extend(new_items)

with open('/home/user/awp-knowledge-system/web-knowledge-staging.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Added {len(new_items)} new items. Total now: {len(data)}')
for item in new_items:
    print(f'  + {item["title"][:70]}')
