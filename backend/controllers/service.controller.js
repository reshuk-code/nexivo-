const Service = require('../models/Service');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { sendEmail } = require('../utils/email');
const { uploadToDrive } = require('../utils/googleDrive');

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
      items, 
      image: imageUrl,
      createdBy: req.user._id 
    });
    await service.save();
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
    
    let updateData = { name, description, category, items };

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