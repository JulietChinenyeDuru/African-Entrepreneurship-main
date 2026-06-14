import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export const runtime = 'nodejs'

function buildDocx(title: string, content: string): Promise<Buffer> {
  const paragraphs = content.split('\n').map(line =>
    new Paragraph({
      children: [new TextRun({ text: line, size: 22 })],
      spacing: { after: 120 },
    })
  )

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 32 })], spacing: { after: 200 } }),
        ...paragraphs,
      ],
    }],
  })

  return Packer.toBuffer(doc)
}

async function buildPdf(title: string, content: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595.28
  const pageHeight = 841.89
  const margin = 50
  const fontSize = 11
  const lineHeight = 16
  const maxWidth = pageWidth - margin * 2

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  // Title
  page.drawText(title, { x: margin, y, size: 18, font: boldFont, color: rgb(0, 0, 0) })
  y -= 30

  const lines = content.split('\n')

  for (const line of lines) {
    const words = line.split(' ')
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word
      const width = font.widthOfTextAtSize(testLine, fontSize)

      if (width > maxWidth && currentLine) {
        if (y < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight])
          y = pageHeight - margin
        }
        page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) })
        y -= lineHeight
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (y < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
    page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) })
    y -= lineHeight

    if (line.trim() === '') {
      y -= lineHeight / 2
    }
  }

  return pdfDoc.save()
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, format } = await req.json()

    if (!content || !format) {
      return NextResponse.json({ error: 'Missing content or format' }, { status: 400 })
    }

    const safeTitle = (title || 'Document').replace(/[^a-zA-Z0-9 _-]/g, '')

    if (format === 'docx') {
      const buffer = await buildDocx(title || 'Document', content)
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${safeTitle}.docx"`,
        },
      })
    } else if (format === 'pdf') {
      const pdfBytes = await buildPdf(title || 'Document', content)
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid format. Use "docx" or "pdf"' }, { status: 400 })
    }
  } catch (err: any) {
    console.error('Download generation error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate document' }, { status: 500 })
  }
}
