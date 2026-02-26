// =============================
// IMPORTS
// =============================
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const QRCode = require('qrcode');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path=require('path')
// Local files
const Certificate = require('./models/Certificate');
const { generateCertificateId, generateToken } = require('./utils/generateId');
const createCertificate = require('./generatecertificate');

// =============================
// CONFIGURATION
// =============================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.static('public'));
// File upload setup
const upload = multer({ dest: 'uploads/' });

// =============================
// DATABASE CONNECTION
// =============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

// =============================
// QR GENERATION FUNCTION
// =============================
async function generateQR(certificateId, token) {
  try {
    const qrDir = path.join(__dirname, 'qrcodes');

    // Create qrcodes folder if it doesn't exist
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const filePath = path.join(qrDir, `${certificateId}.png`);

    const url = `${process.env.FRONTEND_URL}/verify.html?id=${certificateId}&token=${token}`;

    await QRCode.toFile(filePath, url);

    console.log(`QR generated for ${certificateId}`);
  } catch (error) {
    console.error("QR Generation Error:", error);
    throw error;
  }
}

// =============================
// ISSUE CERTIFICATE API
// =============================
app.post('/issue', async (req, res) => {
  try {
    const { name, year } = req.body;

    if (!name || !year) {
      return res.status(400).json({ message: "Name and Year are required" });
    }

    const count = await Certificate.countDocuments();
    const certificateId = generateCertificateId(count + 1);
    const token = generateToken();

    await generateQR(certificateId, token);

    // ✅ Use year directly (NOT results[i])
    await createCertificate(name, certificateId, year);

    const cert = new Certificate({
      certificateId,
      name,
      department: "CSE",
      event: "BYTEFEST 2K26",
      issuedDate: new Date(),
      token,
      year
    });

    await cert.save();

    res.status(201).json({
      message: "✅ Certificate Issued Successfully",
      certificateId
    });

  } catch (error) {
    console.error("Issue Certificate Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
// =============================
// BULK CSV UPLOAD API
// =============================
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {

        for (let i = 0; i < results.length; i++) {
          console.log("FULL ROW OBJECT:", results[i]);
          console.log("NAME VALUE:", results[i].name);
          console.log("YEAR VALUE:", results[i].year);
          console.log("KEYS:", Object.keys(results[i]));

          const count = await Certificate.countDocuments();
          const certificateId = generateCertificateId(count + 1);
          const token = generateToken();
        
          await generateQR(certificateId, token);
        
          await createCertificate(
            results[i].name,
            certificateId,
            results[i].year
          );
        
          const cert = new Certificate({
            certificateId,
            name: results[i].name,
            department: "CSE",
            event: "BYTEFEST 2K26",
            issuedDate: new Date(),
            token,
            year: results[i].year
          });
        
          await cert.save();
        }

        fs.unlinkSync(filePath); // delete uploaded file

        res.json({ message: "✅ All Certificates Generated Successfully" });
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating certificates" });
  }
});
// =============================
// GET CERTIFICATE IMAGE (Preview)
// =============================
app.get('/certificate-image/:id', (req, res) => {
  const certificateId = req.params.id;

  const filePath = path.join(__dirname, 'certificates', `${certificateId}.png`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Certificate not found" });
  }

  res.sendFile(filePath);
});
// =============================
// VERIFY CERTIFICATE API
// =============================
app.get('/verify/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    if (!id || !token) {
      return res.status(400).json({ valid: false, message: "Missing token or ID" });
    }

    const cert = await Certificate.findOne({
      certificateId: id,
      token: token
    });

    if (!cert) {
      return res.status(404).json({ valid: false });
    }

    res.json({
      valid: true,
      name: cert.name,
      certificateId: cert.certificateId,
      event: cert.event,
      department: cert.department,
      issuedDate: cert.issuedDate
    });

  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ valid: false });
  }
});

app.get('/certificate/:id', (req, res) => {
  res.sendFile(__dirname + '/public/verify.html');
});
// =============================
// DOWNLOAD CERTIFICATE API
// =============================
app.get('/download/:id', (req, res) => {
  const certificateId = req.params.id;

  const filePath = path.join(__dirname, 'certificates', `${certificateId}.png`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Certificate not found" });
  }

  res.download(filePath, `${certificateId}.png`);
});

// =============================
// START SERVER
// =============================
app.listen(PORT,'0.0.0.0',() => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
