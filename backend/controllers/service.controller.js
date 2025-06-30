const Service = require('../models/Service');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { sendEmail } = require('../utils/email');
const { uploadToDrive } = require('../utils/googleDrive');
const Subscriber = require('../models/Subscriber');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Admin: Create a new service
exports.createService = async (req, res) => {
  try {
    const { name, description, category, items } = req.body;
    let imageUrl = null;

    // items string आयो भने array बनाउने
    let itemsArray = items;
    if (typeof items === 'string') {
      itemsArray = items.split(',').map(i => i.trim()).filter(Boolean);
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        console.log('Starting image upload...');
        const fileName = `service_${Date.now()}_${req.file.originalname}`;
        imageUrl = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);
        console.log('Image upload successful:', imageUrl);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload image', 
          details: uploadError.message 
        });
      }
    }

    const service = new Service({ 
      name, 
      description, 
      category, 
      items: itemsArray, 
      image: imageUrl,
      createdBy: req.user._id 
    });
    await service.save();

    // --- Send email to all subscribers ---
    try {
      const subscribers = await Subscriber.find();
      if (subscribers.length > 0) {
        const serviceUrl = 'https://reshuksapkota.com.np/services';
        const imageTag = imageUrl ? `<img src="https://nexivo.onrender.com/v1/api/drive/image/${imageUrl}" alt="${name}" style="max-width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:16px;" />` : '';
        const tags = itemsArray && itemsArray.length ? `<div style="margin:12px 0 18px 0;">${itemsArray.map(tag => `<span style='display:inline-block;background:#f5f5f5;color:#222;padding:4px 12px;border-radius:12px;font-size:14px;font-weight:500;margin:2px;'>${tag}</span>`).join('')}</div>` : '';
        const html = `
          <div style="font-family:Poppins,sans-serif;max-width:480px;margin:auto;background:#fff;border:1px solid #eee;padding:24px 18px 32px 18px;border-radius:12px;">
            <h2 style="color:#111;font-size:22px;margin-bottom:8px;">New Service Added: ${name}</h2>
            ${imageTag}
            <div style="font-size:16px;color:#222;margin-bottom:8px;"><b>Category:</b> ${category}</div>
            <div style="font-size:15px;color:#444;margin-bottom:12px;">${description}</div>
            ${tags}
            <a href="${serviceUrl}" style="display:inline-block;margin-top:12px;padding:10px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">View All Services</a>
            <div style="margin-top:24px;font-size:13px;color:#888;">You are receiving this because you subscribed to Nexivo updates.</div>
          </div>
        `;
        for (const sub of subscribers) {
          await sendEmail({
            to: sub.email,
            subject: `New Service: ${name} | Nexivo` ,
            html
          });
        }
      }
    } catch (e) {
      console.error('Failed to send service email to subscribers:', e);
    }
    // --- End email ---

    res.status(201).json(service);
  } catch (err) {
    console.error('Service creation error:', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
};

// Admin: Update a service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, items } = req.body;
    
    // items string आयो भने array बनाउने
    let itemsArray = items;
    if (typeof items === 'string') {
      itemsArray = items.split(',').map(i => i.trim()).filter(Boolean);
    }
    let updateData = { name, description, category, items: itemsArray };

    // Handle image upload if provided
    if (req.file) {
      try {
        const fileName = `service_${Date.now()}_${req.file.originalname}`;
        const imageUrl = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);
        updateData.image = imageUrl;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }
    
    const service = await Service.findByIdAndUpdate(
      id, 
      updateData,
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update service' });
  }
};

// Admin: Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

// User: Choose services
exports.chooseServices = async (req, res) => {
  try {
    const { serviceIds } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { services: serviceIds }, { new: true });
    // TODO: Notify admin about user's chosen services
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to choose services' });
  }
};

// User: Enroll in service with detailed form
exports.enrollInService = async (req, res) => {
  try {
    const {
      userType,
      name,
      email,
      phone,
      companyType,
      companyName,
      employees,
      turnover,
      profession,
      message,
      serviceId,
      serviceName
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !serviceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store enrollment in DB
    await Enrollment.create({
      serviceName,
      userType,
      name,
      email,
      phone,
      companyType,
      companyName,
      employees,
      turnover,
      profession,
      message
    });

    let detailsHtml = '';
    if (userType === 'organization') {
      detailsHtml = `
        <p><strong>Company Type:</strong> ${companyType}</p>
        <p><strong>Company Name:</strong> ${companyName}</p>
        <p><strong>No. of Employees:</strong> ${employees}</p>
        <p><strong>Avg. Turnover:</strong> ${turnover}</p>
        <p><strong>Contact Person:</strong> ${name}</p>
      `;
    } else {
      detailsHtml = `
        <p><strong>Profession/Post:</strong> ${profession}</p>
        <p><strong>Name:</strong> ${name}</p>
      `;
    }

    // Send email notification to admin
    const emailSubject = `New Service Enrollment: ${serviceName}`;
    const emailBody = `
      <h2>New Service Enrollment</h2>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>User Type:</strong> ${userType === 'organization' ? 'Organization/Company' : 'Individual'}</p>
      ${detailsHtml}
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message || 'No message provided'}</p>
      <hr>
      <p><em>This enrollment was submitted from the website.</em></p>
    `;

    // Send email to admin (change to your admin email)
    await sendEmail({
      to: 'admin@nexivo.com',
      subject: emailSubject,
      html: emailBody
    });

    // Also send confirmation email to user
    const userEmailSubject = `Enrollment Confirmation - ${serviceName}`;
    const userEmailBody = `
      <h2>Thank you for your enrollment!</h2>
      <p>Dear ${name},</p>
      <p>We have received your enrollment for <strong>${serviceName}</strong>.</p>
      <p>Our team will review your application and contact you within 24-48 hours.</p>
      <p><strong>Enrollment Details:</strong></p>
      <ul>
        <li>User Type: ${userType === 'organization' ? 'Organization/Company' : 'Individual'}</li>
        ${userType === 'organization'
          ? `<li>Company Type: ${companyType}</li><li>Company Name: ${companyName}</li><li>No. of Employees: ${employees}</li><li>Avg. Turnover: ${turnover}</li><li>Contact Person: ${name}</li>`
          : `<li>Profession/Post: ${profession}</li><li>Name: ${name}</li>`}
        <li>Email: ${email}</li>
        <li>Phone: ${phone}</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The Nexivo Team</p>
    `;

    await sendEmail({
      to: email,
      subject: userEmailSubject,
      html: userEmailBody
    });

    res.json({
      message: 'Enrollment submitted successfully! We will contact you soon.',
      enrollment: {
        serviceName,
        userType,
        name,
        email,
        phone,
        companyType,
        companyName,
        employees,
        turnover,
        profession,
        message
      }
    });

  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ error: 'Failed to submit enrollment' });
  }
};

// Admin: Get all enrollments
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find().sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

// Admin: Update enrollment status
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const enrollment = await Enrollment.findByIdAndUpdate(id, { status }, { new: true });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    // Send email to user if accepted or rejected (inline HTML)
    if (status === 'accepted' || status === 'rejected') {
      let html = '';
      if (status === 'accepted') {
        html = `
          <html>
            <body style="font-family: Arial, sans-serif; color: #222;">
              <h2 style="color: #222;">Congratulations!</h2>
              <p>Dear ${enrollment.name},</p>
              <p>Your enrollment for the service <b>${enrollment.serviceName}</b> has been <b>accepted</b>.</p>
              <p>Our team will contact you soon for the next steps.</p>
              <p style="margin-top: 32px; color: #888; font-size: 13px;">Best regards,<br/>Nexivo Team</p>
            </body>
          </html>
        `;
      } else {
        html = `
          <html>
            <body style="font-family: Arial, sans-serif; color: #222;">
              <h2 style="color: #222;">Enrollment Update</h2>
              <p>Dear ${enrollment.name},</p>
              <p>Your enrollment for the service <b>${enrollment.serviceName}</b> has been <b>rejected</b>.</p>
              <p>Thank you for your interest in Nexivo. We encourage you to apply for future services.</p>
              <p style="margin-top: 32px; color: #888; font-size: 13px;">Best regards,<br/>Nexivo Team</p>
            </body>
          </html>
        `;
      }
      try {
        await sendEmail({
          to: enrollment.email,
          subject: `Your enrollment has been ${status}`,
          html
        });
      } catch (e) {
        console.error('Error sending enrollment status email:', e);
      }
    }

    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update enrollment status' });
  }
}; 