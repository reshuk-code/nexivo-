const User = require('../models/User');
const JoinRequest = require('../models/JoinRequest');
const Subscriber = require('../models/Subscriber');
const { sendEmail } = require('../utils/email');

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Admin: Get all join requests
exports.getAllJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch join requests' });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const exists = await Subscriber.findOne({ email });
    if (exists) return res.status(200).json({ message: 'Already subscribed' });
    await Subscriber.create({ email });

    // Send welcome email
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #222; background: #f9f9f9; padding: 32px;">
          <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0001; padding: 32px;">
            <h2 style="color: #2a2a2a; text-align: center;">Welcome to Nexivo Newsletter!</h2>
            <p style="font-size: 1.1rem;">Thank you for subscribing to our newsletter. 🎉</p>
            <p style="font-size: 1.05rem;">You'll now receive updates about new job openings, blogs, and company news directly in your inbox.</p>
            <p style="margin-top: 32px; color: #888; font-size: 13px; text-align: center;">Best regards,<br/>Nexivo Team</p>
            <div style="text-align:center; margin-top:24px;">
              <img src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png' alt='Welcome' width='64' style='opacity:0.8;' />
            </div>
          </div>
        </body>
      </html>
    `;
    await sendEmail({
      to: email,
      subject: 'Welcome to Nexivo Newsletter!',
      html
    });

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
}; 