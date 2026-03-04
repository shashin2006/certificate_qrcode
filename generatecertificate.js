const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
async function createCertificate(name, certificateId, year,position) {
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

    const sign1 = await loadImage(path.join(__dirname, 'signatures', 'sign1.png'));
    const sign2 = await loadImage(path.join(__dirname, 'signatures', 'sign2.png'));
    const sign3 = await loadImage(path.join(__dirname, 'signatures', 'sign3.png'));
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
    const certIdX = template.width / 2 - 350;
    const certIdY = 300;   // 🔥 Correct vertical alignment

    ctx.fillText(`Certificate ID: ${certificateId}`, certIdX, certIdY);

    // ADD YEAR (Second Line Blank Area)
    // =============================
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    const yearText = `${year} Year`;
    const yearY = 780;   // adjust if needed

    ctx.fillText(yearText, template.width / 2, yearY);

    // =============================
    // ADD POSITION (Second Line)
    // =============================
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    
    // Adjust if needed
    const positionX = template.width / 2;
    const positionY = 830;
    
    ctx.fillText(position, positionX, positionY);
    // =============================
    // ADD QR CODE (Exact Marked Area)
    // =============================
    const qrSize = 200;

    // Exact placement tuned for your template
    const qrX = 1580;   // 🔥 Fixed X position
    const qrY = 500;    // 🔥 Fixed Y position

    // Clean white background padding
    ctx.fillStyle = "white";
    ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);
    // =============================
    // ADD SIGNATURES
    // =============================
      
    // signature size
    const signWidth = 220;
    const signHeight = 90;
      
      // signature positions
    ctx.drawImage(sign1, 420, 1040, signWidth, signHeight);
    ctx.drawImage(sign2, 900, 1040, signWidth, signHeight);
    ctx.drawImage(sign3, 1380, 1040, signWidth, signHeight);

    const buffer = canvas.toBuffer("image/png");
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${buffer.toString("base64")}`,
      {
        folder: "certificates",
        public_id: certificateId
      }
    );

    return uploadResult.secure_url;


    // Save certificate
    const outputPath = path.join(certDir, `${certificateId}.png`);

    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Certificate created for ${name}`);

  } catch (error) {
    console.error("Certificate Generation Error:", error);
    throw error; // important for bulk upload
  }
}

module.exports = createCertificate;
