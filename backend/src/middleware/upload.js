const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WEBP are allowed.'), false);
  }
};

// Use memory storage — buffer is uploaded to Cloudinary via stream
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Middleware to stream buffer → Cloudinary
const uploadToCloudinary = (folder = 'profiles') => async (req, res, next) => {
  if (!req.file) return next();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      Readable.from(req.file.buffer).pipe(stream);
    });

    req.file.path = result.secure_url;      // Cloudinary URL
    req.file.cloudinary_id = result.public_id;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, uploadToCloudinary };
