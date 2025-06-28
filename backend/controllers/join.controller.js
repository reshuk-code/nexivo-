const JoinRequest = require('../models/JoinRequest');

// Register a join request
exports.registerJoinRequest = async (req, res) => {
  try {
    const { name, email, phone, education, message } = req.body;
    const joinRequest = new JoinRequest({ name, email, phone, education, message });
    await joinRequest.save();
    res.status(201).json({ message: 'Join request submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit join request' });
  }
};

// Get all join requests
exports.getAllJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find();
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch join requests' });
  }
}; 