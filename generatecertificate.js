const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createCertificate(name, certificateId) {
  try {

    // Absolute paths (production safe)
    const templatePath = path.join(__dirname, 'templates', 'template.png');
    const qrPath = path.join(__dirname, 'qrcodes', `${certificateId}.png`);
    const certDir = path.join(__dirname, 'certificates');

    // Create certificates folder if not exists
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    // Load template & QR
    const template = await loadImage(templatePath);
    const qr = await loadImage(qrPath);

    // Create canvas
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    // Draw template
    ctx.drawImage(template, 0, 0);

    // =============================
    // ADD PARTICIPANT NAME
    // =============================
    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const centerX = template.width / 2;
    const nameY = 720; // adjust if needed

    ctx.fillText(name, centerX, nameY);

    // =============================
    // ADD CERTIFICATE ID
    // =============================
    ctx.font = "28px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`ID: ${certificateId}`, 120, template.height - 80);

    // =============================
    // ADD QR CODE
    // =============================
    const qrSize = 200;
    const margin = 60;

    const qrX = template.width - qrSize - margin;
    const qrY = template.height - qrSize - margin;

    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

    // Save certificate
    const outputPath = path.join(certDir, `${certificateId}.png`);
    const buffer = canvas.toBuffer("image/png");

    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Certificate created for ${name}`);

  } catch (error) {
    console.error("Certificate Generation Error:", error);
    throw error; // important for bulk upload
  }
}

module.exports = createCertificate;
