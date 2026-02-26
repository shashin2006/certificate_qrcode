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
// =============================
// ADD CERTIFICATE ID (Above Title - Centered)
// =============================
ctx.font = "bold 30px Arial";
ctx.fillStyle = "#333";
ctx.textAlign = "center";

// Position slightly below top header area
const certIdX = template.width / 2;
const certIdY = 230;   // Adjust between 210–250 if needed

ctx.fillText(`Certificate ID: ${certificateId}`, certIdX, certIdY);
    // =============================
    // =============================
// ADD QR CODE (Right Side Middle)
// =============================
const qrSize = 190;

// Move slightly inward from right border
const qrX = template.width - qrSize - 160;

// Move upward to white area (not bottom)
const qrY = 580;   // Adjust between 580–650 if needed

// Optional white background padding
ctx.fillStyle = "white";
ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

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
