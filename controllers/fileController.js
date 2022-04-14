const plainAddPlaceholder = require('../node_modules/node-signpdf/dist/helpers/plainAddPlaceholder').default;
const filePdfPath = './resources/fileexample.pdf';
const certfPath = './resources/certificate.p12';
const signer = require('node-signpdf')
const fs = require('fs');

exports.convert = async (req, res) => {
    // read the file and certificate
    const pdf = fs.readFileSync(filePdfPath);
    const certf = fs.readFileSync(certfPath)

    // add placeholder
    const pdfWithPlaceholder = await plainAddPlaceholder({
        pdfBuffer: pdf,
        reason: 'test signature by candra',
        contactInfo : 'candra@gmail.com',
        name : 'Candra Herdianto',
        location : 'Enschede, NL',
    })
    // sign the doc
    const signedPdf = signer.default.sign(pdfWithPlaceholder,certf)
    // generate file name
    const randomNumber = Math.floor(Math.random()*5000);
    const pdfName = `./exported/exportedFile_${randomNumber}.pdf`;
    // write the new signed doc
    fs.writeFileSync(pdfName,signedPdf)
    // render new page
    res.status(200).render('success');
}

