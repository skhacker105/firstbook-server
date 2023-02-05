module.exports = {
    log: (req, res, next) => {
        console.log('routing request to ' + req.originalUrl);
        next();
    }
}