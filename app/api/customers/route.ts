import { NextRequest, NextResponse } from 'next/server'

const BGATE_URL =
  'https://cloud.bgate-erp.com/BgateAdmin165/WebServiceScriptrun.asp?wsscriptno=5&WebService=y&ImportFromBody=y'

const CUSTOMER_FIELDS = [
  'business_name',
  'company_id',
  'contact_name',
  'phone',
  'field_contact_name',
  'field_contact_phone',
  'email',
  'address',
  'city',
  'payment_terms',
] as const

export async function POST(req: NextRequest) {
  const authToken = process.env.BGATE_API_TOKEN
  if (!authToken) {
    return NextResponse.json({ error: 'BGATE_API_TOKEN not configured' }, { status: 500 })
  }

  const raw = await req.json()
  const customer = Object.fromEntries(
    CUSTOMER_FIELDS.filter(k => raw[k] !== undefined).map(k => [k, raw[k]])
  )

  const res = await fetch(BGATE_URL, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ create_customer: customer }),
  })

  const text = await res.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    data = { raw: text }
  }

  return NextResponse.json(data, { status: res.ok ? 200 : res.status })
}
