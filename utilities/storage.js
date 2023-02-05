const MULTER = require('multer');

const DISK_STORAGE = MULTER.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../images')
    },
    filename: (req, file, cb) => {
        const mimetype = file.mimetype.split('/')
        const filetype = mimetype[1];
        const filename = file.originalname + '.' + filetype;
        cb(null, filename)
    }
});

const STORAGE = MULTER({ storage: DISK_STORAGE }).single('image');

module.exports = STORAGE;