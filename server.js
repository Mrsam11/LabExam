const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const Resume = require('./models/Resume');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Generate and send PDF
async function generateAndSendPDF(resume) {
  // Generate PDF
  const doc = new PDFDocument();
  const pdfPath = `./temp_${resume._id}.pdf`;
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(18).text('Resume', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Name: ${resume.fullName}`);
  doc.text(`Email: ${resume.email}`);
  doc.text(`Phone: ${resume.phoneNumber}`);
  doc.moveDown();
  doc.text('Education:');
  doc.fontSize(12).text(resume.education);
  doc.moveDown();
  doc.fontSize(14).text('Experience:');
  doc.fontSize(12).text(resume.experience);

  doc.end();

  // Wait for the PDF to be created
  await new Promise(resolve => doc.on('end', resolve));

  // Email transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: resume.email,
    subject: 'Your Generated Resume',
    text: 'Please find your generated resume attached.',
    attachments: [
      {
        filename: 'resume.pdf',
        path: pdfPath
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }

  // Delete temporary PDF file
  fs.unlinkSync(pdfPath);
}

// Create a new resume
app.post('/api/resumes', async (req, res) => {
  try {
    const resume = new Resume(req.body);
    await resume.save();
    await generateAndSendPDF(resume);
    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all resumes
app.get('/api/resumes', async (req, res) => {
  try {
    const resumes = await Resume.find();
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific resume
app.get('/api/resumes/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a resume
app.put('/api/resumes/:id', async (req, res) => {
  try {
    const resume = await Resume.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a resume
app.delete('/api/resumes/:id', async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});