import { NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

// Mirrors RAW_TOOLS from maintenance/page.tsx — source of truth for fleet
const FLEET_SEED = [
  // Dingli 0607
  { serial:'AE210701-38', mavaatz:'609', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'AE210701-66', mavaatz:'603', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'AE211009-231', mavaatz:'610', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'AE211009-70', mavaatz:'601', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'AE211009-88', mavaatz:'611', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'AE211009-94', mavaatz:'606', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'JPDCM25I00599', mavaatz:'621', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'JPDCM25I00603', mavaatz:'620', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'JPDCM25I00608', mavaatz:'617', model:'Dingli 0607', category:'מספריים', location:'מגרש' },
  { serial:'JPDCM25I00611', mavaatz:'619', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'JPDCM25I00613', mavaatz:'618', model:'Dingli 0607', category:'מספריים', location:'מגרש' },
  { serial:'JPDCM25I00614', mavaatz:'615', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'JPDCM25I00615', mavaatz:'616', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  { serial:'JPDCM25I00617', mavaatz:'622', model:'Dingli 0607', category:'מספריים', location:'מושכר' },
  // GR-20
  { serial:'GRP-68493', mavaatz:'708', model:'GR-20', category:'מספריים', location:'מושכר' },
  // Genie m1432
  { serial:'GS32MD-8666', mavaatz:'607', model:'Genie m1432', category:'מספריים', location:'מושכר' },
  { serial:'gs32md-4976', mavaatz:'605', model:'Genie m1432', category:'מספריים', location:'מושכר' },
  { serial:'GS32MD-5012', mavaatz:'604', model:'Genie m1432', category:'מספריים', location:'מושכר' },
  { serial:'GS32MD-5022', mavaatz:'602', model:'Genie m1432', category:'מספריים', location:'מושכר' },
  { serial:'GS32MD-8632', mavaatz:'613', model:'Genie m1432', category:'מספריים', location:'מושכר' },
  { serial:'GS32MD-8648', mavaatz:'608', model:'Genie m1432', category:'מספריים', location:'מושכר' },
  { serial:'GS32MD-8667', mavaatz:'612', model:'Genie m1432', category:'מספריים', location:'מושכר' },
  { serial:'GS32MD-8687', mavaatz:'614', model:'Genie m1432', category:'מספריים', location:'מושכר' },
  // Genie m1932
  { serial:'GS32MD-2193', mavaatz:'806', model:'Genie m1932', category:'מספריים', location:'מושכר' },
  // Genie 2046
  { serial:'39577', mavaatz:'817', model:'Genie 2046', category:'מספריים', location:'מושכר' },
  // Genie 1932
  { serial:'24302', mavaatz:'802', model:'Genie 1932', category:'מספריים', location:'מושכר' },
  { serial:'GS300D-49350', mavaatz:'805', model:'Genie 1932', category:'מספריים', location:'מושכר' },
  { serial:'GS30D-49351', mavaatz:'801', model:'Genie 1932', category:'מספריים', location:'מושכר' },
  { serial:'GS30D-50271', mavaatz:'808', model:'Genie 1932', category:'מספריים', location:'מגרש' },
  { serial:'GS30D-50592', mavaatz:'807', model:'Genie 1932', category:'מספריים', location:'מושכר' },
  // Dingli 0808
  { serial:'AE220520-3', mavaatz:'809', model:'Dingli 0808', category:'מספריים', location:'מושכר' },
  { serial:'AE220520-7', mavaatz:'819', model:'Dingli 0808', category:'מספריים', location:'מושכר' },
  // 1930
  { serial:'CS3007B3-85943', mavaatz:'811', model:'1930', category:'מספריים', location:'מושכר' },
  { serial:'p30Gs-179182', mavaatz:'814', model:'1930', category:'מספריים', location:'מושכר' },
  // Dingli 1212
  { serial:'jcpt02296e0023', mavaatz:'1201', model:'Dingli 1212', category:'מספריים', location:'מושכר' },
  { serial:'JPAC01088A024', mavaatz:'1202', model:'Dingli 1212', category:'מספריים', location:'מגרש' },
  { serial:'JPAC01475I025', mavaatz:'1203', model:'Dingli 1212', category:'מספריים', location:'מושכר' },
  // Genie 2032
  { serial:'GS88160-3207', mavaatz:'804', model:'Genie 2032', category:'מספריים', location:'מושכר' },
  // GR-15
  { serial:'GR02-1243', mavaatz:'706', model:'GR-15', category:'מספריים', location:'תקול', status:'in_repair' },
  { serial:'GR07-7988', mavaatz:'705', model:'GR-15', category:'מספריים', location:'מגרש' },
  { serial:'GRP-63937', mavaatz:'707', model:'GR-15', category:'מספריים', location:'מגרש' },
  // 2632GS
  { serial:'GS32D-15327', mavaatz:'1001', model:'2632GS', category:'מספריים', location:'מושכר' },
  // JLG 2E2646
  { serial:'JLG2E-2646', mavaatz:'1002', model:'JLG 2E2646', category:'מספריים', location:'מושכר' },
  // Dingli 1412
  { serial:'JPAC025101469', mavaatz:'1401', model:'Dingli 1412', category:'מספריים', location:'מושכר' },
  // Dingli 1208
  { serial:'JPAC01468I025', mavaatz:'1206', model:'Dingli 1208', category:'מספריים', location:'מגרש' },
  { serial:'JPACO01467I25', mavaatz:'1205', model:'Dingli 1208', category:'מספריים', location:'מושכר' },
  // JLG ES1930
  { serial:'JLG1200', mavaatz:'803', model:'JLG ES1930', category:'מספריים', location:'מושכר' },
  // JLG 2e3246
  { serial:'11403', mavaatz:'1204', model:'JLG 2e3246', category:'מספריים', location:'מגרש' },
  // JLG 2E1932
  { serial:'0200114697', mavaatz:'812', model:'JLG 2E1932', category:'מספריים', location:'מגרש' },
  // Dingli 0807
  { serial:'JPAC01459I025', mavaatz:'813', model:'Dingli 0807', category:'מספריים', location:'מגרש' },
  // Dingli 0708
  { serial:'JPDCM25I00588', mavaatz:'762', model:'Dingli 0708', category:'מספריים', location:'מושכר' },
  { serial:'JPDCM25I00589', mavaatz:'761', model:'Dingli 0708', category:'מספריים', location:'מושכר' },
  // Dingli 1008
  { serial:'JPAC01465I025', mavaatz:'1003', model:'Dingli 1008', category:'מספריים', location:'מגרש' },
  // JLG 2E2032
  { serial:'0200061700', mavaatz:'818', model:'JLG 2E2032', category:'מספריים', location:'מגרש' },
  // JLG 3246E
  { serial:'1200035395', mavaatz:'1207', model:'JLG 3246E', category:'מספריים', location:'מגרש' },
  // JLG 520
  { serial:'210-086', mavaatz:'522', model:'JLG 520', category:'מפרקית_דיזל', location:'מושכר' },
  { serial:'210-113', mavaatz:'521', model:'JLG 520', category:'מפרקית_דיזל', location:'מגרש' },
  // JLG 450AJ
  { serial:'107-876', mavaatz:'454', model:'JLG 450AJ', category:'מפרקית_דיזל', location:'מגרש' },
  { serial:'120-005', mavaatz:'455', model:'JLG 450AJ', category:'מפרקית_דיזל', location:'מגרש' },
  { serial:'121-363', mavaatz:'451', model:'JLG 450AJ', category:'מפרקית_דיזל', location:'מושכר' },
  { serial:'656-52', mavaatz:'453', model:'JLG 450AJ', category:'מפרקית_דיזל', location:'מגרש' },
  { serial:'698-52', mavaatz:'452', model:'JLG 450AJ', category:'מפרקית_דיזל', location:'מושכר' },
  // Manitou 180ATJ
  { serial:'107-356', mavaatz:'512', model:'Manitou 180ATJ', category:'מפרקית_דיזל', location:'מושכר' },
  // JLG 510AJ
  { serial:'108-154', mavaatz:'511', model:'JLG 510AJ', category:'מפרקית_דיזל', location:'מגרש' },
  // Genie Z-51
  { serial:'100-390', mavaatz:'513', model:'Genie Z-51', category:'מפרקית_דיזל', location:'מגרש' },
  // JLG 860SJ
  { serial:'959-85', mavaatz:'280', model:'JLG 860SJ', category:'טלסקופית', location:'מגרש' },
  // JLG AJPN400E
  { serial:'95-179', mavaatz:'401', model:'JLG AJPN400E', category:'טלסקופית', location:'מגרש' },
  // Collectors
  { serial:'2402530', mavaatz:'302', model:'מאספת 5.1מ', category:'מאספת', location:'מגרש' },
  { serial:'2402532', mavaatz:'301', model:'מאספת 5.1מ', category:'מאספת', location:'מגרש' },
  { serial:'2408265', mavaatz:'202', model:'מאספת 4.5מ', category:'מאספת', location:'מגרש' },
  { serial:'2418755', mavaatz:'201', model:'מאספת 4.5מ', category:'מאספת', location:'מגרש' },
  // Trucks
  { serial:'10-153-62', mavaatz:'-', model:'משאית', category:'משאית', location:'צוות' },
  { serial:'20-756-80', mavaatz:'-', model:'משאית', category:'משאית', location:'צוות' },
  { serial:'369-34-201', mavaatz:'-', model:'משאית', category:'משאית', location:'צוות' },
  { serial:'57-114-60', mavaatz:'-', model:'משאית', category:'משאית', location:'צוות' },
  { serial:'75-147-34', mavaatz:'-', model:'משאית', category:'משאית', location:'צוות' },
  { serial:'80-792-85', mavaatz:'-', model:'משאית', category:'משאית', location:'צוות' },
]

function extractBrand(model: string): string {
  const m = model.toLowerCase()
  if (m.startsWith('dingli') || m.startsWith('jcpt') || m.includes('jcpt')) return 'Dingli'
  if (m.startsWith('genie') || m.startsWith('gs') || m.startsWith('z-')) return 'Genie'
  if (m.startsWith('jlg')) return 'JLG'
  if (m.startsWith('manitou')) return 'Manitou'
  if (m.startsWith('gr')) return 'GR'
  if (m.startsWith('מאספת')) return 'מאספת'
  if (m === 'משאית') return 'משאית'
  return 'Unknown'
}

export async function POST() {
  const supabase = getSupabaseServiceClient()

  const rows = FLEET_SEED.map((t) => ({
    internal_id: t.mavaatz !== '-' ? `mavaatz-${t.mavaatz}` : `serial-${t.serial}`,
    mavaatz: t.mavaatz,
    brand: extractBrand(t.model),
    model: t.model,
    serial_number: t.serial,
    category: t.category,
    location: t.location,
    status: (t as Record<string, unknown>).status || 'active',
  }))

  const { data, error } = await supabase
    .from('fleet_machines')
    .upsert(rows, { onConflict: 'internal_id' })
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, seeded: data?.length || 0 })
}

export async function GET() {
  return POST()
}
