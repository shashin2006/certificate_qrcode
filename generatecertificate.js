const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const path = require('path')
const cloudinary = require('cloudinary').v2

async function createCertificate(name, certificateId, year, position) {
  try {

    const templatePath = path.join(__dirname, 'templates', 'template1.png')
    const qrPath = path.join(__dirname, 'qrcodes', `${certificateId}.png`)

    const template = await loadImage(templatePath)
    const qr = await loadImage(qrPath)

    const canvas = createCanvas(template.width, template.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(template, 0, 0)

    // =====================================================
    // 1️⃣ NAME
    // =====================================================
    ctx.font = "bold 60px Arial"
    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"
    ctx.textBaseline = "alphabetic"

    ctx.fillText(name, template.width / 2, 740)

    // =====================================================
    // 2️⃣ YEAR (of ___)
    // =====================================================
    ctx.font = "bold 40px Arial"
    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"

    ctx.fillText(`${year} Year`, template.width / 2 - 250, 780)

    // =====================================================
    // 3️⃣ POSITION (Before word 'position')
    // =====================================================
    ctx.font = "bold 40px Arial"
    ctx.fillStyle = "#000000"
    ctx.textAlign = "left"

    ctx.fillText(position, 680, 820)

    // =====================================================
    // CERTIFICATE ID (Top Right)
    // =====================================================
    ctx.font = "bold 30px Arial"
    ctx.fillStyle = "#333333"
    ctx.textAlign = "right"
    ctx.textBaseline = "top"

    ctx.fillText(
      `Certificate ID: ${certificateId}`,
      template.width - 200,
      240
    )

    // =====================================================
    // QR CODE
    // =====================================================
    const qrSize = 200
    const qrX = template.width - 330
    const qrY = 500

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24)

    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)

    const buffer = canvas.toBuffer("image/png")

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${buffer.toString("base64")}`,
      {
        folder: "certificates",
        public_id: certificateId
      }
    )

    console.log(`✅ Certificate created for ${name}`)

    return uploadResult.secure_url

  } catch (error) {
    console.error("Certificate Generation Error:", error)
    throw error
  }
}

module.exports = createCertificate
