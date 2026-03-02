const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

async function createCertificate(name, certificateId, year, position) {
  try {

    const templatePath = path.join(__dirname, 'templates', 'template1.png');
    const qrPath = path.join(__dirname, 'qrcodes', `${certificateId}.png`);
    const certDir = path.join(__dirname, 'certificates');

    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const template = await loadImage(templatePath);
    const qr = await loadImage(qrPath);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(template, 0, 0);

    // =============================
    // NAME (No Change)
    // =============================
    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillText(name, template.width / 2, 740);

    // =============================
    // CERTIFICATE ID (No Change)
    // =============================
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";

    ctx.fillText(
      `Certificate ID: ${certificateId}`,
      template.width - 200,
      240
    );

    // =============================
    // YEAR (Clean Alignment)
    // =============================
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    ctx.fillText(
      `${year} Year`,
      template.width / 2 - 250,
      780
    );

    // =============================
    // POSITION (NEW – CLEAN)
    // =============================
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";

    // Position fits inside small blank before word "position"
    ctx.fillText(
      position,
      760,   // horizontal adjustment
      820    // vertical alignment
    );

    // =============================
    // QR CODE (No Change)
    // =============================
    const qrSize = 200;
    const qrX = template.width - 330;
    const qrY = 500;

    ctx.fillStyle = "white";
    ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

    const buffer = canvas.toBuffer("image/png");

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${buffer.toString("base64")}`,
      {
        folder: "certificates",
        public_id: certificateId
      }
    );

    console.log(`✅ Certificate created for ${name}`);

    return uploadResult.secure_url;

  } catch (error) {
    console.error("Certificate Generation Error:", error);
    throw error;
  }
}

module.exports = createCertificate;
