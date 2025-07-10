const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { isAdmin } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer();

// Create blog (admin only)
router.post('/', isAdmin, upload.single('thumbnail'), blogController.createBlog);
// Get all blogs
router.get('/', blogController.getBlogs);
// Get single blog
router.get('/:id', blogController.getBlogById);
// Update blog (admin only)
router.put('/:id', isAdmin, upload.single('thumbnail'), blogController.updateBlog);
// Delete blog (admin only)
router.delete('/:id', isAdmin, blogController.deleteBlog);
// React to a blog
router.post('/:id/react', blogController.reactToBlog);
// Get other blogs (excluding current)
router.get('/other/:id', blogController.getOtherBlogs);

module.exports = router; 