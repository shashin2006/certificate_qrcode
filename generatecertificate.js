const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function createCertificate(name, certificateId) {
  try {
    // Load template & QR
    const template = await loadImage('./templates/template.png');
    const qr = await loadImage(`./qrcodes/${certificateId}.png`);

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
    ctx.textAlign = "center";          // center horizontally
    ctx.textBaseline = "alphabetic";   // proper text baseline

    // Center X position
    const centerX = template.width / 2;

    // Adjust this Y value to match underline perfectly
    const nameY = 720;   // 🔧 Adjust slightly (710-740) if needed

    ctx.fillText(name, centerX, nameY);

    // =============================
    // ADD CERTIFICATE ID (Bottom Left)
    // =============================
    ctx.font = "28px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`ID: ${certificateId}`, 120, template.height - 80);

    // =============================
    // ADD QR CODE (Bottom Right)
    // =============================
    const qrSize = 200;
    const margin = 60;

    const qrX = template.width - qrSize - margin;
    const qrY = template.height - qrSize - margin;

    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

    // Save file
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`./certificates/${certificateId}.png`, buffer);

    console.log(`✅ Certificate created for ${name}`);

  } catch (error) {
    console.error("Certificate Generation Error:", error);
  }
}

module.exports = createCertificate;