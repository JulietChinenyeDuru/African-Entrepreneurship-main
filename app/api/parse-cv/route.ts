import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const name = file.name.toLowerCase()

    let text = ''

    if (name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (name.endsWith('.pdf')) {
      const pdfParseModule = await import('pdf-parse')
      const pdfParse = (pdfParseModule as any).default || pdfParseModule
      const result = await pdfParse(buffer)
      text = result.text
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload .docx or .pdf' }, { status: 400 })
    }

    text = text.trim()

    if (!text) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 })
    }

    return NextResponse.json({ text })
  } catch (err: any) {
    console.error('CV parse error:', err)
    return NextResponse.json({ error: err.message || 'Failed to parse file' }, { status: 500 })
  }
}
