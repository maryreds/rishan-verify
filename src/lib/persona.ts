const PERSONA_API_KEY = process.env.PERSONA_API_KEY!
const PERSONA_API_BASE = 'https://withpersona.com/api/v1'
const PERSONA_TEMPLATE_ID = process.env.PERSONA_TEMPLATE_ID!

interface PersonaInquiry {
  id: string
  type: string
  attributes: {
    status: string
    'reference-id': string
    'created-at': string
    fields: Record<string, any>
  }
}

export async function createInquiry(referenceId: string, redirectUri?: string) {
  const res = await fetch(`${PERSONA_API_BASE}/inquiries`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERSONA_API_KEY}`,
      'Content-Type': 'application/json',
      'Persona-Version': '2023-01-05',
      'Key-Inflection': 'camel',
    },
    body: JSON.stringify({
      data: {
        attributes: {
          inquiryTemplateId: PERSONA_TEMPLATE_ID,
          referenceId,
          redirectUri,
        },
      },
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Persona API error: ${res.status} ${error}`)
  }

  return res.json()
}

export async function getInquiry(inquiryId: string): Promise<PersonaInquiry> {
  const res = await fetch(`${PERSONA_API_BASE}/inquiries/${inquiryId}`, {
    headers: {
      'Authorization': `Bearer ${PERSONA_API_KEY}`,
      'Persona-Version': '2023-01-05',
      'Key-Inflection': 'camel',
    },
  })

  if (!res.ok) {
    throw new Error(`Persona API error: ${res.status}`)
  }

  const data = await res.json()
  return data.data
}
