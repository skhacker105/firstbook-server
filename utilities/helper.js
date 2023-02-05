const ENCRYPTION = require('../utilities/encryption');
const FS = require('fs')

module.exports = {
    getAuthUserId: (req) => {
        return ENCRYPTION.parseJwt(req.headers.authorization).sub.id;
    },
    
    isAdmin: (req) => {
        return ENCRYPTION.parseJwt(req.headers.authorization).sub.isAdmin;
    },

    saveImage: (path, image, cb) => {
        var base64Data = image.replace(/^data:([A-Za-z-+\/]+);base64,/, "");
        let buffer = Buffer.from(base64Data, 'base64');
        FS.writeFile(path, buffer, { encoding: 'base64' }, cb);
    },

    deleteImage: (path, cb) => {
        FS.unlink(path, cb);
    },

    validateCommentForm(payload) {
        let errors = {};
        let isFormValid = true;
    
        if (!payload || typeof payload.content !== 'string' || payload.content.trim().length < 3) {
            isFormValid = false;
            errors.content = 'Comment must be more than 3 symbols long.';
        }
    
        return {
            success: isFormValid,
            errors
        };
    }
};