const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploadsDir = () => {
    const dir = path.join(__dirname, '../uploads');

    // Ensure directory exists, create if not
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return dir;
};

// Configure multer storage and file validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, createUploadsDir());
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept PDF, Excel, JPEG, PNG, and octet-stream (for generic binary files)
    if (
        file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.ms-excel' || // For .xls files
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // For .xlsx files
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' ||
        file.mimetype === 'application/octet-stream' // For generic binary files
    ) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};



const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 // 1 MB file size limit
    }
}).array('files', 10); // Adjust number of files as needed


const testupload=(req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                // Multer-specific errors
                return res.status(400).json({ message: err.message });
            } else {
                // Other errors
                return res.status(400).json({ message: err.message });
            }
        }

        // Assign uploaded files to req.body.Files
        req.body.Files = req.files;
        next();
    });
};
// Export the middleware
module.exports = testupload
