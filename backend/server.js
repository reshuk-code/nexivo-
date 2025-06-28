require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const userRoutes = require('./routes/user.routes');
const servicesRoutes = require('./routes/services.routes');
const joinRoutes = require('./routes/join.routes');
const adminRoutes = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');
const blogRoutes = require('./routes/blog.routes');
const driveRoutes = require('./routes/drive.routes');
const vacancyRoutes = require('./routes/vacancy.routes');
const path = require('path');

app.use(cors({
  origin: 'https://nexivo-e2yt.onrender.com', // वा '*', dev मा
  credentials: true
}));

app.use(express.json());

mongoose.connect('mongodb+srv://reshuksapkota2007:UF67TwWd8i7rC9XU@cluster0.jzxtstl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.use('/v1/api/user', userRoutes);
app.use('/v1/api/services', servicesRoutes);
app.use('/v1/api/join', joinRoutes);
app.use('/v1/api/admin', adminRoutes);
app.use('/v1/api/contact', contactRoutes);
app.use('/v1/api/blogs', blogRoutes);
app.use('/v1/api/drive', driveRoutes);
app.use('/v1/api/vacancy', vacancyRoutes);

app.listen(PORT, () => {
  console.log(`Website running on http://localhost:${PORT}`);
});
