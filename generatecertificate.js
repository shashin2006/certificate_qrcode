const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createCertificate(name, certificateId,year) {
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
// ADD CERTIFICATE ID (Perfect Position)
// =============================
ctx.font = "bold 32px Arial";
ctx.fillStyle = "#2b2b2b";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// This value is calibrated for your template
const certIdX = template.width / 2;
const certIdY = 300;   // 🔥 Correct vertical alignment

ctx.fillText(`Certificate ID: ${certificateId}`, certIdX, certIdY);

// ADD YEAR (Second Line Blank Area)
// =============================
ctx.font = "bold 38px Arial";
ctx.fillStyle = "black";
ctx.textAlign = "center";

// Adjust this Y slightly if needed
const yearX = template.width / 2;
const yearY = 780;   // 🔥 This aligns with second underline

ctx.fillText(`${year} Year`, yearX, yearY);
// =============================
// ADD QR CODE (Exact Marked Area)
// =============================
const qrSize = 200;

// Exact placement tuned for your template
const qrX = 1580;   // 🔥 Fixed X position
const qrY = 610;    // 🔥 Fixed Y position

// Clean white background padding
ctx.fillStyle = "white";
ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

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
