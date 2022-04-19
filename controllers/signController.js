const { PDFDocument, PDFName, PDFNumber, PDFHexString, PDFString, PDFArray, CharCodes } = require('pdf-lib')
const signer = require('node-signpdf');
const filePdfPath = './resources/fileexample.pdf';
const certfPath = './resources/certificate.p12';
const fs = require('fs');
const _addPlaceholder = require('../utils/addPlaceholder')


exports.signWithPdfLib = async (req, res) => {
    // read the document and certificate
    const pdf = fs.readFileSync(filePdfPath);
    const certf = fs.readFileSync(certfPath);

    // add placeholder
    const pdfWithPlaceholder = await _addPlaceholder(pdf)
    // sign the doc
    const signedPdf = signer.default.sign(pdfWithPlaceholder,certf)
    // generate name
    const randomNumber = Math.floor(Math.random()*5000);
    const pdfName = `./exported/withPdfLib_${randomNumber}.pdf`;
    // write the new document
    fs.writeFileSync(pdfName,signedPdf)
    // render new page
    res.status(200).render('success');
    console.log(`success signing ${pdfName}`)
}

    
    // end of PDFArrayCustom