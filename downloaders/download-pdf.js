const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
const hbs = require('hbs');
const pdf = require('html-pdf');

module.exports = {
    print: (req, path, inputData) => {
        return new Promise((resolve, reject) => {
            const context = {
                inputData: JSON.parse(JSON.stringify(inputData))
            };
            console.log('executing promise`');
            readFile(path, 'utf8')
                .then(content => {
                    console.log('content loaded`');
                    const template = hbs.compile(content);
                    const html = template({ inputData: context.inputData });
                    const options = {
                        base: `${req.protocol}://${req.get('host')}`,
                        format: 'A4'
                    }

                    console.log('writting file')
                    pdf.create(html, options).toBuffer((err, buffer) => {
                        if (err) reject(err);
                        else resolve(buffer);
                    });
                })
                .catch(err => reject(err));
        });
    }
}