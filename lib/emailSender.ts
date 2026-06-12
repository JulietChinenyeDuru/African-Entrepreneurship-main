// lib/emailSender.ts
// ============================================================
// Sends job applications FROM THE USER'S OWN EMAIL ADDRESS
// Uses nodemailer + their app password (not their real password)
// Recruiter sees a real human email, not a bulk tool
// ============================================================

import nodemailer from 'nodemailer'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// ── SMTP config per provider ─────────────────────────────────

const SMTP_CONFIG = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
  },
}

// ── Types ────────────────────────────────────────────────────

export interface EmailApplicationParams {
  // User credentials
  userEmail: string
  userAppPassword: string
  userEmailProvider: 'gmail' | 'outlook' | 'yahoo'
  userName: string
  // Job details
  jobTitle: string
  company: string
  recruiterEmail: string
  // Application content
  tailoredCv: string
  coverLetter: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  sentTo: string
  sentFrom: string
  timestamp: string
  error?: string
}

// ── Generate PDF from CV text ─────────────────────────────────

export async function generateCvPdf(cvText: string, userName: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const page = pdfDoc.addPage([595, 842])  // A4
  const { width, height } = page.getSize()
  const margin = 50
  let y = height - margin

  // Header — name
  page.drawText(userName, {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.11, 0.62, 0.46),  // ApplyAI green
  })
  y -= 30

  // CV content
  const lines = cvText.split('\n')
  for (const line of lines) {
    if (y < margin + 20) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([595, 842])
      y = newPage.getSize().height - margin
    }

    const isSectionHeader = line.match(/^[A-Z\s]+$/) && line.trim().length > 2
    const trimmed = line.trim()
    if (!trimmed) { y -= 8; continue }

    page.drawText(trimmed.slice(0, 90), {  // max 90 chars per line
      x: margin,
      y,
      size: isSectionHeader ? 11 : 9,
      font: isSectionHeader ? boldFont : font,
      color: isSectionHeader ? rgb(0.07, 0.09, 0.16) : rgb(0.2, 0.2, 0.2),
    })
    y -= isSectionHeader ? 16 : 12
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

// ── Format cover letter as HTML email ────────────────────────

function formatEmailHtml(coverLetter: string, userName: string, jobTitle: string, company: string): string {
  const paragraphs = coverLetter.split('\n').filter(p => p.trim())
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; font-size: 14px;
             line-height: 1.7; color: #333; max-width: 600px;
             margin: 0 auto; padding: 20px;">
  ${paragraphs.map(p => `<p style="margin: 0 0 14px;">${p}</p>`).join('')}
  <br/>
  <p style="font-size: 12px; color: #888; border-top: 1px solid #eee;
            padding-top: 14px; margin-top: 20px;">
    This application was prepared with ApplyAI — jobapp.best
  </p>
</body>
</html>`
}

// ── Main send function ────────────────────────────────────────

export async function sendApplicationEmail(
  params: EmailApplicationParams
): Promise<EmailResult> {
  const {
    userEmail, userAppPassword, userEmailProvider,
    userName, jobTitle, company, recruiterEmail,
    tailoredCv, coverLetter,
  } = params

  try {
    // Create transporter with user's own email
    const transporter = nodemailer.createTransporter({
      ...SMTP_CONFIG[userEmailProvider],
      auth: {
        user: userEmail,
        pass: userAppPassword,    // app password — not real password
      },
    })

    // Verify connection before sending
    await transporter.verify()

    // Generate CV as PDF attachment
    const cvPdf = await generateCvPdf(tailoredCv, userName)

    // Clean filename
    const fileName = `${userName.replace(/\s+/g, '_')}_CV_${company.replace(/\s+/g, '_')}.pdf`

    // Send the email
    const result = await transporter.sendMail({
      from: `${userName} <${userEmail}>`,
      to: recruiterEmail,
      subject: `Application for ${jobTitle} — ${userName}`,
      text: coverLetter,
      html: formatEmailHtml(coverLetter, userName, jobTitle, company),
      attachments: [
        {
          filename: fileName,
          content: cvPdf,
          contentType: 'application/pdf',
        }
      ],
      // BCC the user so they have a copy
      bcc: userEmail,
    })

    return {
      success: true,
      messageId: result.messageId,
      sentTo: recruiterEmail,
      sentFrom: userEmail,
      timestamp: new Date().toISOString(),
    }

  } catch (error: any) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error.message,
      sentTo: recruiterEmail,
      sentFrom: userEmail,
      timestamp: new Date().toISOString(),
    }
  }
}

// ── Test email connection ─────────────────────────────────────

export async function testEmailConnection(
  email: string,
  appPassword: string,
  provider: 'gmail' | 'outlook' | 'yahoo'
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransporter({
      ...SMTP_CONFIG[provider],
      auth: { user: email, pass: appPassword },
    })
    await transporter.verify()
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
