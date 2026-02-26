const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createCertificate(name, certificateId) {
  try {

    // Absolute paths (production safe)
    const templatePath = path.join(__dirname, 'templates', 'template1.png');
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
// ADD CERTIFICATE ID (Top Center)
// =============================
ctx.font = "bold 28px Arial";
ctx.fillStyle = "#444";
ctx.textAlign = "center";

// Adjust Y if needed (around top area)
const certIdY = 260;  

ctx.fillText(`Certificate ID: ${certificateId}`, template.width / 2, certIdY);

    // =============================
    // ADD QR CODE (Right Middle Area)
    // =============================
    const qrSize = 180;
    
    // Move slightly inward from right edge
    const qrX = template.width - qrSize - 120;
    
    // Place vertically around participation text area
    const qrY = template.height / 2 - qrSize / 2 + 50;
    
    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

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
