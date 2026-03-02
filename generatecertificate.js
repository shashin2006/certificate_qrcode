const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

async function createCertificate(name, certificateId, year, position, templateName) {

  templateName = templateName || 'template1.png';

  try {

    const templatePath = path.join(__dirname, 'templates', templateName);
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
    // NAME (UNCHANGED)
    // =============================
    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillText(name, template.width / 2, 720);

    // =============================
    // CERTIFICATE ID (UNCHANGED)
    // =============================
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#2b2b2b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const certIdX = template.width / 2 - 400;
    const certIdY = 300;

    ctx.fillText(`Certificate ID: ${certificateId}`, certIdX, certIdY);

    // =============================
    // YEAR (UNCHANGED)
    // =============================
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    ctx.fillText(`${year} Year`, template.width / 2, 780);

    // =============================
    // ✅ POSITION (NEW — PROPER ALIGNMENT)
    // =============================
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    // Adjusted to fit inside blank before word "position"
    const positionX = 760;   // move left/right if needed
    const positionY = 835;   // move up/down if needed

    ctx.fillText(position, positionX, positionY);

    // =============================
    // QR CODE (UNCHANGED)
    // =============================
    const qrSize = 200;
    const qrX = 1580;
    const qrY = 500;

    ctx.fillStyle = "white";
    ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

    const buffer = canvas.toBuffer("image/png");

    const outputPath = path.join(certDir, `${certificateId}.png`);
    fs.writeFileSync(outputPath, buffer);

    return `http://localhost:5000/certificates/${certificateId}.png`;

  } catch (error) {
    console.error("Certificate Generation Error:", error);
    throw error;
  }
}

module.exports = createCertificate;
