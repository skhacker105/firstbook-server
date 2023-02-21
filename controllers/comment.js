const COMMENT = require('mongoose').model('Comment');

const PAGE_LIMIT = 5;

function validateCommentForm(payload) {
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

module.exports = {

    getLatestFiveByUser: (req, res) => {
        let userId = req.params.userId;

        COMMENT
            .find({ user: userId })
            .populate('product')
            .sort({ creationDate: -1 })
            .limit(5)
            .then((comments) => {
                res.status(200).json({
                    message: '',
                    data: comments
                });
            })
            .catch((err) => {
                console.log(err);
                return res.status(400).json({
                    message: 'Something went wrong, please try again.'
                });
            });
    }
};
