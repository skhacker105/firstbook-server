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
            readFile(path, 'utf8')
                .then(content => {
                    const template = hbs.compile(content);
                    const html = template({ inputData: context.inputData });
                    const options = {
                        base: `${req.protocol}://${req.get('host')}`,
                        format: 'A4',
                        childProcessOptions: {
                            env: {
                              OPENSSL_CONF: '/dev/null',
                            }
                        }
                    }

                    pdf.create(html, options).toBuffer((err, buffer) => {
                        if (err) reject(err);
                        else resolve(buffer);
                    });
                })
                .catch(err => reject(err));
        });
    }
}