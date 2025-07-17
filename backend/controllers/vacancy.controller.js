const Vacancy = require('../models/Vacancy');
const VacancyApplication = require('../models/VacancyApplication');
const { uploadToDrive } = require('../utils/googleDrive');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const { sendEmail } = require('../utils/email');
const { renderTemplate } = require('../utils/email');
const Subscriber = require('../models/Subscriber');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

// Vacancy CRUD
exports.getAllVacancies = async (req, res) => {
  try {
    const vacancies = await Vacancy.find().sort({ createdAt: -1 });
    res.json(vacancies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vacancies' });
  }
};

exports.getVacancyById = async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id);
    if (!vacancy) return res.status(404).json({ error: 'Vacancy not found' });
    res.json(vacancy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vacancy' });
  }
};

exports.createVacancy = async (req, res) => {
  try {
    const { title, description, location, type, deadline } = req.body;
    const vacancy = new Vacancy({ title, description, location, type, deadline });
    await vacancy.save();

    // Notify all subscribers
    try {
      const subscribers = await Subscriber.find();
      const subject = `New Job Opening: ${vacancy.title}`;
      const vacancyUrl = 'https://reshuksapkota.com.np/vacancy';
      const html = `
        <div style="font-family:Poppins,sans-serif;max-width:480px;margin:auto;background:#fff;border:1px solid #eee;padding:24px 18px 32px 18px;border-radius:12px;">
          <h2 style="color:#111;font-size:22px;margin-bottom:8px;">New Job Vacancy: ${vacancy.title}</h2>
          <div style="font-size:15px;color:#444;margin-bottom:12px;">${vacancy.description}</div>
          <div style="font-size:15px;color:#222;margin-bottom:8px;"><b>Location:</b> ${vacancy.location || 'N/A'}</div>
          <div style="font-size:15px;color:#222;margin-bottom:8px;"><b>Type:</b> ${vacancy.type || 'N/A'}</div>
          <div style="font-size:15px;color:#222;margin-bottom:16px;"><b>Deadline:</b> ${vacancy.deadline ? new Date(vacancy.deadline).toLocaleDateString() : 'N/A'}</div>
          <a href="${vacancyUrl}" style="display:inline-block;margin-top:12px;padding:10px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">View All Open Positions</a>
          <div style="margin-top:24px;font-size:13px;color:#888;">You are receiving this because you subscribed to Nexivo updates.</div>
        </div>
      `;
      for (const sub of subscribers) {
        await sendEmail({ to: sub.email, subject, html });
      }
    } catch (e) {
      console.error('Error sending vacancy notification to subscribers:', e);
    }

    res.status(201).json(vacancy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create vacancy' });
  }
};

exports.updateVacancy = async (req, res) => {
  try {
    const { title, description, location, type, deadline } = req.body;
    const vacancy = await Vacancy.findByIdAndUpdate(
      req.params.id,
      { title, description, location, type, deadline },
      { new: true }
    );
    if (!vacancy) return res.status(404).json({ error: 'Vacancy not found' });
    res.json(vacancy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vacancy' });
  }
};

exports.deleteVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.findByIdAndDelete(req.params.id);
    if (!vacancy) return res.status(404).json({ error: 'Vacancy not found' });
    res.json({ message: 'Vacancy deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vacancy' });
  }
};

// Vacancy Application
exports.applyVacancy = async (req, res) => {
  try {
    const { name, email, phone, message, vacancyId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'CV file required' });
    let cvFileId = null;
    try {
      // Try Cloudinary first
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'nexivo_cvs', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
      cvFileId = uploadResult.secure_url;
    } catch (cloudErr) {
      // Fallback to Google Drive if Cloudinary fails
      try {
        const fileName = `cv_${Date.now()}_${req.file.originalname}`;
        cvFileId = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);
      } catch (uploadError) {
        console.error('CV upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload CV' });
      }
    }
    const application = new VacancyApplication({
      name, email, phone, message, vacancyId, cv: cvFileId
    });
    await application.save();

    // Get vacancy title for email
    let vacancyTitle = '';
    try {
      const vacancy = await Vacancy.findById(vacancyId);
      vacancyTitle = vacancy ? vacancy.title : '';
    } catch (e) {}

    // Inline HTML for user confirmation
    const userHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #222;">
          <h2 style="color: #222;">Thank you for your application!</h2>
          <p>Dear ${name},</p>
          <p>We have received your application for the position of <b>${vacancyTitle}</b>.</p>
          <p>Our team will review your application and contact you if you are shortlisted for the next steps.</p>
          <p style="margin-top: 32px; color: #888; font-size: 13px;">Best regards,<br/>Nexivo Team</p>
        </body>
      </html>
    `;
    await sendEmail({
      to: email,
      subject: 'Your application has been received',
      html: userHtml
    });
    // Inline HTML for admin notification
    const adminHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #222;">
          <h2 style="color: #222;">New Vacancy Application Received</h2>
          <p>A new application has been submitted for the position of <b>${vacancyTitle}</b>.</p>
          <ul>
            <li><b>Name:</b> ${name}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>Phone:</b> ${phone}</li>
            <li><b>Message:</b> ${message || ''}</li>
          </ul>
          <p style="margin-top: 32px; color: #888; font-size: 13px;">Nexivo System Notification</p>
        </body>
      </html>
    `;
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: 'New Vacancy Application Received',
      html: adminHtml
    });

    res.status(201).json({ message: 'Application submitted', application });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply for vacancy' });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await VacancyApplication.find().populate('vacancyId').sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const app = await VacancyApplication.findByIdAndUpdate(id, { status }, { new: true });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    // Get vacancy title for email
    let vacancyTitle = '';
    try {
      const vacancy = await Vacancy.findById(app.vacancyId);
      vacancyTitle = vacancy ? vacancy.title : '(Unknown Position)';
    } catch (e) {
      console.error('Error fetching vacancy for email:', e);
      vacancyTitle = '(Unknown Position)';
    }

    // Send email to user if accepted or rejected (inline HTML)
    if (status === 'accepted' || status === 'rejected') {
      let html = '';
      if (status === 'accepted') {
        html = `
          <html>
            <body style="font-family: Arial, sans-serif; color: #222;">
              <h2 style="color: #222;">Congratulations!</h2>
              <p>Dear ${app.name},</p>
              <p>Your application for the position of <b>${vacancyTitle}</b> has been <b>accepted</b>.</p>
              <p>Our HR team will contact you soon for the next steps.</p>
              <p style="margin-top: 32px; color: #888; font-size: 13px;">Best regards,<br/>Nexivo Team</p>
            </body>
          </html>
        `;
      } else {
        html = `
          <html>
            <body style="font-family: Arial, sans-serif; color: #222;">
              <h2 style="color: #222;">Application Update</h2>
              <p>Dear ${app.name},</p>
              <p>Your application for the position of <b>${vacancyTitle}</b> has been <b>rejected</b>.</p>
              <p>Thank you for your interest in Nexivo. We encourage you to apply for future openings.</p>
              <p style="margin-top: 32px; color: #888; font-size: 13px;">Best regards,<br/>Nexivo Team</p>
            </body>
          </html>
        `;
      }
      try {
        await sendEmail({
          to: app.email,
          subject: `Your application has been ${status}`,
          html
        });
      } catch (e) {
        console.error('Error sending status email:', e);
        // Do not crash, just log
      }
    }

    res.json(app);
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    res.status(500).json({ error: 'Failed to update application status', details: err.message });
  }
}; 