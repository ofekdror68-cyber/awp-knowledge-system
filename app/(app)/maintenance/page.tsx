'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, CheckCircle, Clock, Wrench, X, Check } from 'lucide-react'

// ─── Israeli holidays 2026 ───────────────────────────────────────────────────
const HOLIDAYS_2026 = new Set([
  '2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05',
  '2026-04-06','2026-04-07','2026-04-08', // Pesach
  '2026-04-30', // Yom Ha'atzmaut
  '2026-05-22', // Shavuot
  '2026-09-18','2026-09-19','2026-09-20', // Rosh Hashana
  '2026-09-27', // Yom Kippur
  '2026-10-02','2026-10-03','2026-10-04','2026-10-05',
  '2026-10-06','2026-10-07','2026-10-08', // Sukkot
])

function isoDate(d: Date) { return d.toISOString().slice(0,10) }

function isRest(d: Date) {
  const day = d.getDay() // 6=Saturday
  return day === 6 || HOLIDAYS_2026.has(isoDate(d))
}

function nextBizDay(dateStr: string): { date: Date; shifted: boolean; originalStr: string } {
  const d = new Date(dateStr + 'T12:00:00')
  const original = isoDate(d)
  let shifted = false
  while (isRest(d)) { d.setDate(d.getDate() + 1); shifted = true }
  return { date: d, shifted, originalStr: original }
}

function parseDateIL(s: string): string {
  // "25/06/2026" → "2026-06-25"
  const [dd, mm, yyyy] = s.split('/')
  return `${yyyy}-${mm}-${dd}`
}

function formatDateIL(dateStr: string) {
  const [y,m,d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(dateStr + 'T00:00:00'); d.setHours(0,0,0,0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

// ─── Checklists ──────────────────────────────────────────────────────────────
const CHECKLISTS: Record<string, string[]> = {
  מספריים: [
    'בדיקת מצברים ומתח טעינה',
    'בדיקת רמת נוזל הידראולי',
    'בדיקת דליפות הידראוליות',
    'בדיקת שלמות הגלגלים',
    'בדיקת מערכת הבלמים',
    'בדיקת שרשרות וסרגלי ההגבהה',
    'בדיקת מערכת הגנת עומס',
    'בדיקת אורות ואזעקה',
  ],
  מפרקית_דיזל: [
    'בדיקת רמת שמן מנוע',
    'בדיקת נוזל קירור',
    'בדיקת פילטר אוויר ופילטר שמן',
    'בדיקת רמת נוזל הידראולי ודליפות',
    'בדיקת מנגנון הזרוע והמפרקים',
    'בדיקת בלמים ומערכת היגוי',
    'בדיקת גלגלים וצמיגים',
    'בדיקת תא עבודה — גדר בטיחות, הצמד',
    'הפעלת בדיקת עומס',
  ],
  טלסקופית: [
    'בדיקת שמן מנוע ונוזל הידראולי',
    'בדיקת מנגנון האריזה הטלסקופית',
    'בדיקת בלמים ומערכת היגוי',
    'בדיקת גלגלים וצמיגים',
    'בדיקת מערכת הגנה ואזעקה',
    'הפעלת בדיקת עומס',
  ],
  מאספת: [
    'בדיקת מצברים ומתח טעינה',
    'בדיקת מנגנון ההרמה',
    'בדיקת בלמים',
    'בדיקת גלגלים ומשטח עבודה',
    'בדיקת מגן ידיים ומנעול בטיחות',
  ],
  משאית: [
    'בדיקת רמת שמן מנוע ונוזלים',
    'בדיקת בלמים ורצועות',
    'בדיקת צמיגים ולחץ אוויר',
    'בדיקת אורות קידמיים ואחוריים',
    'בדיקת מגבים וזכוכיות',
    'בדיקת מסמכי רישוי ורישיון נהג',
  ],
}

// ─── Tool data ────────────────────────────────────────────────────────────────
type Tool = {
  serial: string
  mavaatz: string
  model: string
  category: string   // מספריים | מפרקית_דיזל | טלסקופית | מאספת | משאית
  location: string
  licenseDate: string // ISO yyyy-mm-dd
  annualDate?: string // ISO yyyy-mm-dd
  broken?: boolean
}

const RAW_TOOLS: Tool[] = [
  // ── Dingli 0607 ─────────────────────────────────────────────
  { serial:'AE210701-38',      mavaatz:'609', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-06-25' },
  { serial:'AE210701-66',      mavaatz:'603', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-08-22' },
  { serial:'AE211009-231',     mavaatz:'610', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-08-09' },
  { serial:'AE211009-70',      mavaatz:'601', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-06-25' },
  { serial:'AE211009-88',      mavaatz:'611', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-09-30' },
  { serial:'AE211009-94',      mavaatz:'606', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-08-11' },
  { serial:'JPDCM25I00599',    mavaatz:'621', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-07-02', annualDate:'2027-02-23' },
  { serial:'JPDCM25I00603',    mavaatz:'620', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-07-02' },
  { serial:'JPDCM25I00608',    mavaatz:'617', model:'Dingli 0607', category:'מספריים', location:'מגרש',  licenseDate:'2026-07-02' },
  { serial:'JPDCM25I00611',    mavaatz:'619', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-07-02' },
  { serial:'JPDCM25I00613',    mavaatz:'618', model:'Dingli 0607', category:'מספריים', location:'מגרש',  licenseDate:'2026-07-02', annualDate:'2027-02-23' },
  { serial:'JPDCM25I00614',    mavaatz:'615', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-07-02', annualDate:'2027-02-23' },
  { serial:'JPDCM25I00615',    mavaatz:'616', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-07-02' },
  { serial:'JPDCM25I00617',    mavaatz:'622', model:'Dingli 0607', category:'מספריים', location:'מושכר', licenseDate:'2026-07-02', annualDate:'2027-02-23' },
  // ── GR-20 ───────────────────────────────────────────────────
  { serial:'GRP-68493',        mavaatz:'708', model:'GR-20',       category:'מספריים', location:'מושכר', licenseDate:'2026-04-20' },
  // ── Genie GS32MD (m1432) ────────────────────────────────────
  { serial:'GS32MD-8666',      mavaatz:'607', model:'Genie m1432', category:'מספריים', location:'מושכר', licenseDate:'2026-05-05' },
  { serial:'gs32md-4976',      mavaatz:'605', model:'Genie m1432', category:'מספריים', location:'מושכר', licenseDate:'2026-03-01' },
  { serial:'GS32MD-5012',      mavaatz:'604', model:'Genie m1432', category:'מספריים', location:'מושכר', licenseDate:'2026-03-01' },
  { serial:'GS32MD-5022',      mavaatz:'602', model:'Genie m1432', category:'מספריים', location:'מושכר', licenseDate:'2026-08-09' },
  { serial:'GS32MD-8632',      mavaatz:'613', model:'Genie m1432', category:'מספריים', location:'מושכר', licenseDate:'2026-01-14' },
  { serial:'GS32MD-8648',      mavaatz:'608', model:'Genie m1432', category:'מספריים', location:'מושכר', licenseDate:'2026-07-25' },
  { serial:'GS32MD-8667',      mavaatz:'612', model:'Genie m1432', category:'מספריים', location:'מושכר', licenseDate:'2026-06-29' },
  { serial:'GS32MD-8687',      mavaatz:'614', model:'Genie m1432', category:'מספריים', location:'מושכר', licenseDate:'2026-01-14' },
  // ── Genie m1932 ─────────────────────────────────────────────
  { serial:'GS32MD-2193',      mavaatz:'806', model:'Genie m1932', category:'מספריים', location:'מושכר', licenseDate:'2026-03-01' },
  // ── Genie 2046 ──────────────────────────────────────────────
  { serial:'39577',            mavaatz:'817', model:'Genie 2046',  category:'מספריים', location:'מושכר', licenseDate:'2026-06-29' },
  // ── Genie 1932 ──────────────────────────────────────────────
  { serial:'24302',            mavaatz:'802', model:'Genie 1932',  category:'מספריים', location:'מושכר', licenseDate:'2026-07-25' },
  { serial:'GS300D-49350',     mavaatz:'805', model:'Genie 1932',  category:'מספריים', location:'מושכר', licenseDate:'2026-09-30' },
  { serial:'GS30D-49351',      mavaatz:'801', model:'Genie 1932',  category:'מספריים', location:'מושכר', licenseDate:'2026-05-04' },
  { serial:'GS30D-50271',      mavaatz:'808', model:'Genie 1932',  category:'מספריים', location:'מגרש',  licenseDate:'2026-09-09' },
  { serial:'GS30D-50592',      mavaatz:'807', model:'Genie 1932',  category:'מספריים', location:'מושכר', licenseDate:'2026-04-20' },
  // ── Dingli 0808 ─────────────────────────────────────────────
  { serial:'AE220520-3',       mavaatz:'809', model:'Dingli 0808', category:'מספריים', location:'מושכר', licenseDate:'2026-06-30' },
  { serial:'AE220520-7',       mavaatz:'819', model:'Dingli 0808', category:'מספריים', location:'מושכר', licenseDate:'2026-06-25' },
  // ── 1930 ────────────────────────────────────────────────────
  { serial:'CS3007B3-85943',   mavaatz:'811', model:'1930',        category:'מספריים', location:'מושכר', licenseDate:'2026-07-29' },
  { serial:'p30Gs-179182',     mavaatz:'814', model:'1930',        category:'מספריים', location:'מושכר', licenseDate:'2026-09-26' },
  // ── Dingli 1212 ─────────────────────────────────────────────
  { serial:'jcpt02296e0023',   mavaatz:'1201', model:'Dingli 1212', category:'מספריים', location:'מושכר', licenseDate:'2025-12-22' },
  { serial:'JPAC01088A024',    mavaatz:'1202', model:'Dingli 1212', category:'מספריים', location:'מגרש',  licenseDate:'2026-07-22' },
  { serial:'JPAC01475I025',    mavaatz:'1203', model:'Dingli 1212', category:'מספריים', location:'מושכר', licenseDate:'2026-06-30' },
  // ── Genie 2032 ──────────────────────────────────────────────
  { serial:'GS88160-3207',     mavaatz:'804', model:'Genie 2032',  category:'מספריים', location:'מושכר', licenseDate:'2026-07-28' },
  // ── GR-15 ───────────────────────────────────────────────────
  { serial:'GR02-1243',        mavaatz:'706', model:'GR-15',       category:'מספריים', location:'תקול',  licenseDate:'2026-04-30', broken: true },
  { serial:'GR07-7988',        mavaatz:'705', model:'GR-15',       category:'מספריים', location:'מגרש',  licenseDate:'2026-08-09' },
  { serial:'GRP-63937',        mavaatz:'707', model:'GR-15',       category:'מספריים', location:'מגרש',  licenseDate:'2026-09-09' },
  // ── 2632GS ──────────────────────────────────────────────────
  { serial:'GS32D-15327',      mavaatz:'1001', model:'2632GS',     category:'מספריים', location:'מושכר', licenseDate:'2026-07-09' },
  // ── JLG 2E2646 ──────────────────────────────────────────────
  { serial:'JLG2E-2646',       mavaatz:'1002', model:'JLG 2E2646', category:'מספריים', location:'מושכר', licenseDate:'2026-05-21' },
  // ── Dingli 1412 ─────────────────────────────────────────────
  { serial:'JPAC025101469',    mavaatz:'1401', model:'Dingli 1412', category:'מספריים', location:'מושכר', licenseDate:'2026-07-02' },
  // ── Dingli 1208 ─────────────────────────────────────────────
  { serial:'JPAC01468I025',    mavaatz:'1206', model:'Dingli 1208', category:'מספריים', location:'מגרש',  licenseDate:'2026-07-02' },
  { serial:'JPACO01467I25',    mavaatz:'1205', model:'Dingli 1208', category:'מספריים', location:'מושכר', licenseDate:'2026-07-02', annualDate:'2027-02-23' },
  // ── JLG ES1930 ──────────────────────────────────────────────
  { serial:'JLG1200',          mavaatz:'803', model:'JLG ES1930',  category:'מספריים', location:'מושכר', licenseDate:'2026-07-28' },
  // ── JLG 2e3246 ──────────────────────────────────────────────
  { serial:'11403',            mavaatz:'1204', model:'JLG 2e3246', category:'מספריים', location:'מגרש',  licenseDate:'2026-07-28' },
  // ── JLG 2E1932 ──────────────────────────────────────────────
  { serial:'0200114697',       mavaatz:'812', model:'JLG 2E1932',  category:'מספריים', location:'מגרש',  licenseDate:'2026-07-28' },
  // ── Dingli 0807 ─────────────────────────────────────────────
  { serial:'JPAC01459I025',    mavaatz:'813', model:'Dingli 0807', category:'מספריים', location:'מגרש',  licenseDate:'2026-07-28' },
  // ── Dingli 0708 ─────────────────────────────────────────────
  { serial:'JPDCM25I00588',    mavaatz:'762', model:'Dingli 0708', category:'מספריים', location:'מושכר', licenseDate:'2026-07-02', annualDate:'2027-02-24' },
  { serial:'JPDCM25I00589',    mavaatz:'761', model:'Dingli 0708', category:'מספריים', location:'מושכר', licenseDate:'2026-07-28', annualDate:'2027-02-23' },
  // ── Dingli 1008 ─────────────────────────────────────────────
  { serial:'JPAC01465I025',    mavaatz:'1003', model:'Dingli 1008', category:'מספריים', location:'מגרש',  licenseDate:'2026-07-02', annualDate:'2026-02-23' },
  // ── JLG 2E2032 ──────────────────────────────────────────────
  { serial:'0200061700',       mavaatz:'818', model:'JLG 2E2032',  category:'מספריים', location:'מגרש',  licenseDate:'2026-07-27' },
  // ── JLG 3246E ───────────────────────────────────────────────
  { serial:'1200035395',       mavaatz:'1207', model:'JLG 3246E',  category:'מספריים', location:'מגרש',  licenseDate:'2026-09-26' },

  // ── DIESEL ARTICULATED (מפרקית דיזל) ────────────────────────
  { serial:'210-086',          mavaatz:'522', model:'JLG 520',     category:'מפרקית_דיזל', location:'מושכר', licenseDate:'2026-08-16', annualDate:'2026-10-22' },
  { serial:'210-113',          mavaatz:'521', model:'JLG 520',     category:'מפרקית_דיזל', location:'מגרש',  licenseDate:'2026-07-09', annualDate:'2026-11-14' },
  { serial:'107-876',          mavaatz:'454', model:'JLG 450AJ',   category:'מפרקית_דיזל', location:'מגרש',  licenseDate:'2026-07-09', annualDate:'2026-10-21' },
  { serial:'120-005',          mavaatz:'455', model:'JLG 450AJ',   category:'מפרקית_דיזל', location:'מגרש',  licenseDate:'2026-05-18', annualDate:'2026-06-30' },
  { serial:'121-363',          mavaatz:'451', model:'JLG 450AJ',   category:'מפרקית_דיזל', location:'מושכר', licenseDate:'2026-08-09', annualDate:'2026-11-06' },
  { serial:'656-52',           mavaatz:'453', model:'JLG 450AJ',   category:'מפרקית_דיזל', location:'מגרש',  licenseDate:'2026-04-20', annualDate:'2026-08-16' },
  { serial:'698-52',           mavaatz:'452', model:'JLG 450AJ',   category:'מפרקית_דיזל', location:'מושכר', licenseDate:'2026-04-20', annualDate:'2027-01-20' },
  { serial:'107-356',          mavaatz:'512', model:'Manitou 180ATJ', category:'מפרקית_דיזל', location:'מושכר', licenseDate:'2026-07-29', annualDate:'2026-08-22' },
  { serial:'108-154',          mavaatz:'511', model:'JLG 510AJ',   category:'מפרקית_דיזל', location:'מגרש',  licenseDate:'2026-04-22', annualDate:'2026-11-18' },
  // ── Z-51 (boom) ─────────────────────────────────────────────
  { serial:'100-390',          mavaatz:'513', model:'Genie Z-51',  category:'מפרקית_דיזל', location:'מגרש',  licenseDate:'2026-09-30', annualDate:'2026-05-29' },

  // ── TELESCOPIC (טלסקופית) ─────────────────────────────────────
  { serial:'959-85',           mavaatz:'280', model:'JLG 860SJ',   category:'טלסקופית', location:'מגרש',  licenseDate:'2026-07-25', annualDate:'2026-06-08' },
  { serial:'95-179',           mavaatz:'401', model:'JLG AJPN400E',category:'טלסקופית', location:'מגרש',  licenseDate:'2026-08-22', annualDate:'2026-04-14' },

  // ── COLLECTORS (מאספות) ───────────────────────────────────────
  { serial:'2402530',          mavaatz:'302', model:'מאספת 5.1מ',  category:'מאספת', location:'מגרש', licenseDate:'2026-10-10' },
  { serial:'2402532',          mavaatz:'301', model:'מאספת 5.1מ',  category:'מאספת', location:'מגרש', licenseDate:'2026-10-10' },
  { serial:'2408265',          mavaatz:'202', model:'מאספת 4.5מ',  category:'מאספת', location:'מגרש', licenseDate:'2026-10-10' },
  { serial:'2418755',          mavaatz:'201', model:'מאספת 4.5מ',  category:'מאספת', location:'מגרש', licenseDate:'2026-10-10' },

  // ── TRUCKS (משאיות) ───────────────────────────────────────────
  { serial:'10-153-62',        mavaatz:'-',   model:'משאית',       category:'משאית', location:'צוות', licenseDate:'2026-08-19', annualDate:'2025-12-21' },
  { serial:'20-756-80',        mavaatz:'-',   model:'משאית',       category:'משאית', location:'צוות', licenseDate:'2026-10-04', annualDate:'2027-04-27' },
  { serial:'369-34-201',       mavaatz:'-',   model:'משאית',       category:'משאית', location:'צוות', licenseDate:'2027-01-06', annualDate:'2026-07-26' },
  { serial:'57-114-60',        mavaatz:'-',   model:'משאית',       category:'משאית', location:'צוות', licenseDate:'2026-11-12', annualDate:'2026-03-03' },
  { serial:'75-147-34',        mavaatz:'-',   model:'משאית',       category:'משאית', location:'צוות', licenseDate:'2026-06-20', annualDate:'2027-03-20' },
  { serial:'80-792-85',        mavaatz:'-',   model:'משאית',       category:'משאית', location:'צוות', licenseDate:'2026-11-24', annualDate:'2027-04-27' },
]

// ─── Status logic ─────────────────────────────────────────────────────────────
type Status = 'red' | 'yellow' | 'green' | 'off'

function getUrgentDate(tool: Tool, overrides: Record<string, string>): { isoDate: string; label: string; shifted: boolean; shiftedFrom: string } {
  const licenseDateRaw = overrides[tool.serial] || tool.licenseDate
  const { date: licenseDate, shifted: lShifted, originalStr: lOrig } = nextBizDay(licenseDateRaw)

  // Check annual inspection too
  if (tool.annualDate) {
    const { date: annDate, shifted: aShifted, originalStr: aOrig } = nextBizDay(tool.annualDate)
    const lDays = daysUntil(isoDate(licenseDate))
    const aDays = daysUntil(isoDate(annDate))
    if (aDays < lDays) {
      return { isoDate: isoDate(annDate), label: 'תסקיר', shifted: aShifted, shiftedFrom: aOrig }
    }
  }

  return { isoDate: isoDate(licenseDate), label: 'רישוי', shifted: lShifted, shiftedFrom: lOrig }
}

function calcStatus(tool: Tool, overrides: Record<string, string>): Status {
  if (tool.broken) return 'off'
  const { isoDate: urgentIso } = getUrgentDate(tool, overrides)
  const days = daysUntil(urgentIso)
  if (days < 0) return 'red'
  if (days <= 7) return 'yellow'
  return 'green'
}

const STATUS_ORDER: Record<Status, number> = { red: 0, yellow: 1, green: 2, off: 3 }

// ─── Service modal ────────────────────────────────────────────────────────────
function ServiceModal({ tool, onClose, onDone }: {
  tool: Tool
  onClose: () => void
  onDone: (serial: string, newDate: string) => void
}) {
  const checks = CHECKLISTS[tool.category] || []
  const [done, setDone] = useState<boolean[]>(new Array(checks.length).fill(false))

  function toggle(i: number) { setDone(p => p.map((v, j) => j === i ? !v : v)) }

  function finish() {
    const today = new Date()
    const next = new Date(today)
    next.setFullYear(next.getFullYear() + 1)
    onDone(tool.serial, isoDate(next))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto" style={{ background: '#FFFFFF' }}>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-lg" style={{ color: '#1E293B' }}>⚙️ טיפול — {tool.serial}</div>
            <div className="text-sm" style={{ color: '#64748B' }}>{tool.model} • מע"צ {tool.mavaatz}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#E2E8F0' }}>
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {checks.map((task, i) => (
            <button key={i} onClick={() => toggle(i)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
              style={{ background: done[i] ? 'rgba(22,163,74,0.08)' : '#F8FAFC', border: `1px solid ${done[i] ? 'rgba(22,163,74,0.3)' : '#E2E8F0'}` }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: done[i] ? '#16A34A' : '#E2E8F0' }}>
                {done[i] && <Check size={14} color="white" />}
              </div>
              <span className="text-sm flex-1" style={{ color: done[i] ? '#15803D' : '#475569', textDecoration: done[i] ? 'line-through' : 'none' }}>{task}</span>
            </button>
          ))}
        </div>

        <div className="text-xs text-center" style={{ color: '#94A3B8' }}>
          {done.filter(Boolean).length}/{checks.length} פריטים הושלמו
        </div>

        <button onClick={finish}
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ background: '#16A34A' }}>
          ✓ סיימתי — עדכן רישוי לשנה הבאה
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MaintenancePage() {
  const [overrides, setOverrides] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(localStorage.getItem('maint_overrides') || '{}') } catch { return {} }
  })
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [search, setSearch] = useState('')

  function handleDone(serial: string, newDate: string) {
    const next = { ...overrides, [serial]: newDate }
    setOverrides(next)
    localStorage.setItem('maint_overrides', JSON.stringify(next))
  }

  const tools = useMemo(() => {
    return [...RAW_TOOLS]
      .filter(t => {
        if (search) {
          const q = search.toLowerCase()
          return t.serial.toLowerCase().includes(q) || t.model.toLowerCase().includes(q) || t.mavaatz.includes(q)
        }
        return true
      })
      .filter(t => filter === 'all' || calcStatus(t, overrides) === filter)
      .sort((a, b) => STATUS_ORDER[calcStatus(a, overrides)] - STATUS_ORDER[calcStatus(b, overrides)])
  }, [overrides, filter, search])

  const counts = useMemo(() => ({
    red: RAW_TOOLS.filter(t => calcStatus(t, overrides) === 'red').length,
    yellow: RAW_TOOLS.filter(t => calcStatus(t, overrides) === 'yellow').length,
    green: RAW_TOOLS.filter(t => calcStatus(t, overrides) === 'green').length,
    off: RAW_TOOLS.filter(t => calcStatus(t, overrides) === 'off').length,
  }), [overrides])

  const STATUS_META = {
    red:    { bg: 'rgba(220,38,38,.12)',    border: 'rgba(220,38,38,.3)',    text: '#B91C1C', label: 'פג תוקף' },
    yellow: { bg: 'rgba(217,119,6,.12)',    border: 'rgba(217,119,6,.3)',    text: '#B45309', label: 'השבוע' },
    green:  { bg: 'rgba(22,163,74,.12)',    border: 'rgba(22,163,74,.3)',    text: '#15803D', label: 'תקין' },
    off:    { bg: 'rgba(100,116,139,.1)',   border: 'rgba(100,116,139,.2)', text: '#475569', label: 'תקול' },
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4" style={{ color: '#1E293B' }}>מצבת כלים — תחזוקה</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(['red','yellow','green','off'] as Status[]).map(s => {
          const m = STATUS_META[s]
          return (
            <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
              className="rounded-xl p-2.5 text-center transition-all"
              style={{ background: m.bg, border: `1px solid ${m.border}`, outline: filter === s ? `2px solid ${m.text}` : 'none' }}>
              <div className="text-xl font-bold" style={{ color: m.text }}>{counts[s]}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: m.text }}>{m.label}</div>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder='חפש מספר סידורי, דגם, מע"צ...'
        className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-4"
        style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#1E293B' }} />

      {/* List */}
      <div className="space-y-2">
        {tools.map(tool => {
          const st = calcStatus(tool, overrides)
          const m = STATUS_META[st]
          const urgent = getUrgentDate(tool, overrides)
          const days = daysUntil(urgent.isoDate)
          const needsAction = st === 'red' || st === 'yellow'

          return (
            <div key={tool.serial} className="card p-4" style={{ background: '#FFFFFF' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: '#1E293B' }}>{tool.serial}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.text }}>
                      {m.label}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                    {tool.model} • מע"צ {tool.mavaatz}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs" style={{ color: '#64748B' }}>📍 {tool.location}</span>
                    <span className="text-xs flex items-center gap-1" style={{ color: st === 'red' ? '#DC2626' : st === 'yellow' ? '#D97706' : '#16A34A' }}>
                      <Clock size={11} />
                      {urgent.label}: {formatDateIL(urgent.isoDate)}
                      {days < 0 ? ` (פג לפני ${Math.abs(days)} ימים)` : days === 0 ? ' (היום!)' : ` (עוד ${days} ימים)`}
                    </span>
                  </div>
                  {urgent.shifted && (
                    <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                      הוזז מ-{formatDateIL(urgent.shiftedFrom)} בגלל שבת/חג
                    </div>
                  )}
                  {tool.annualDate && tool.annualDate !== urgent.isoDate && (
                    <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                      תסקיר: {formatDateIL(tool.annualDate)}
                    </div>
                  )}
                </div>

                {needsAction && (
                  <button onClick={() => setActiveTool(tool)}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: st === 'red' ? '#DC2626' : '#D97706' }}>
                    ⚙️ טפל
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {tools.length === 0 && (
        <div className="text-center py-12" style={{ color: '#94A3B8' }}>אין תוצאות</div>
      )}

      {activeTool && (
        <ServiceModal tool={activeTool} onClose={() => setActiveTool(null)} onDone={handleDone} />
      )}
    </div>
  )
}
