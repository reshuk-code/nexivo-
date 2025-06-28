const Vacancy = require('../models/Vacancy');
const VacancyApplication = require('../models/VacancyApplication');
const { uploadToDrive } = require('../utils/googleDrive');
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
      const html = `
        <h2>New Vacancy Posted!</h2>
        <p>Position: <b>${vacancy.title}</b></p>
        <p>${vacancy.description}</p>
        <p><a href="http://localhost:5173/vacancy">View all open positions</a></p>
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
    const fileName = `cv_${Date.now()}_${req.file.originalname}`;
    const cvFileId = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);
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