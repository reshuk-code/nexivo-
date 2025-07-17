const Blog = require('../models/Blog');
const { uploadToDrive } = require('../utils/googleDrive');
const Subscriber = require('../models/Subscriber');
const { sendEmail } = require('../utils/email');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let thumbnailUrl = null;

    // Handle thumbnail upload if provided
    if (req.file) {
      try {
        // Try Cloudinary first
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'nexivo_blogs' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });
        thumbnailUrl = uploadResult.secure_url;
      } catch (cloudErr) {
        // Fallback to Google Drive if Cloudinary fails
        try {
          const fileName = `blog_thumbnail_${Date.now()}_${req.file.originalname}`;
          thumbnailUrl = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);
        } catch (uploadError) {
          console.error('Thumbnail upload error:', uploadError);
          return res.status(500).json({ error: 'Failed to upload thumbnail' });
        }
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

// React to a blog (emoji reaction)
exports.reactToBlog = async (req, res) => {
  try {
    const { emoji } = req.body; // emoji: like, love, angry, wow, haha
    const validEmojis = ['like', 'love', 'angry', 'wow', 'haha'];
    if (!validEmojis.includes(emoji)) {
      return res.status(400).json({ error: 'Invalid emoji' });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    blog.reactions[emoji] = (blog.reactions[emoji] || 0) + 1;
    await blog.save();
    res.json({ reactions: blog.reactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to react to blog' });
  }
};

// Get other blogs (excluding current)
exports.getOtherBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ _id: { $ne: req.params.id } }).sort({ createdAt: -1 }).limit(5);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch other blogs' });
  }
}; 