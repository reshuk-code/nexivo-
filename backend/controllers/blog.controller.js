const Blog = require('../models/Blog');
const { uploadToDrive } = require('../utils/googleDrive');
const Subscriber = require('../models/Subscriber');
const { sendEmail } = require('../utils/email');

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let thumbnailUrl = null;

    // Handle thumbnail upload if provided
    if (req.file) {
      try {
        const fileName = `blog_thumbnail_${Date.now()}_${req.file.originalname}`;
        thumbnailUrl = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);
      } catch (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload thumbnail' });
      }
    }

    const blog = new Blog({ title, content, author, thumbnail: thumbnailUrl });
    await blog.save();

    // Notify all subscribers
    try {
      const subscribers = await Subscriber.find();
      const subject = `New Blog: ${blog.title}`;
      const html = `
        <h2>New Blog Published!</h2>
        <p><b>${blog.title}</b></p>
        <div style="margin-bottom: 16px;">${blog.content}</div>
        <p><a href="https://nexivo-e2yt.onrender.com/blogs/${blog._id}">Read more on our website</a></p>
      `;
      for (const sub of subscribers) {
        await sendEmail({ to: sub.email, subject, html });
      }
    } catch (e) {
      console.error('Error sending blog notification to subscribers:', e);
    }

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

// Get all blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Get a single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// Update a blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let updateData = { title, content, updatedAt: Date.now() };
    if (author) updateData.author = author;

    // Handle thumbnail upload if provided
    if (req.file) {
      try {
        const fileName = `blog_thumbnail_${Date.now()}_${req.file.originalname}`;
        const thumbnailUrl = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);
        updateData.thumbnail = thumbnailUrl;
      } catch (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload thumbnail' });
      }
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
}; 