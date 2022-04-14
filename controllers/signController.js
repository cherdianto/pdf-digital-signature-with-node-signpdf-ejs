const { PDFDocument, PDFName, PDFNumber, PDFHexString, PDFString, PDFArray, CharCodes } = require('pdf-lib')
const signer = require('node-signpdf');
const filePdfPath = './resources/fileexample.pdf';
const certfPath = './resources/certificate.p12';
const fs = require('fs');


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
}

    // start addPlaceholder
    const _addPlaceholder = async(pdf) => {
        const loadedPdf = await PDFDocument.load(pdf);
        const ByteRange = PDFArrayCustom.withContext(loadedPdf.context);
        const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
        const SIGNATURE_LENGTH = 3322;
        const pages = loadedPdf.getPages();

        ByteRange.push(PDFNumber.of(0));
        ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
        ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
        ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));

        const signatureDict = loadedPdf.context.obj({
            Type: 'Sig',
            Filter: 'Adobe.PPKLite',
            SubFilter: 'adbe.pkcs7.detached',
            ByteRange,
            Contents: PDFHexString.of('A'.repeat(SIGNATURE_LENGTH)),
            Reason: PDFString.of('We need your signature for reasons...'),
            M: PDFString.fromDate(new Date()),
        });

        const signatureDictRef = loadedPdf.context.register(signatureDict);

        const widgetDict = loadedPdf.context.obj({
            Type: 'Annot',
            Subtype: 'Widget',
            FT: 'Sig',
            Rect: [10, 10, 100, 50], // Signature rect size
            V: signatureDictRef,
            T: PDFString.of('test signature'),
            F: 4,
            P: pages[0].ref,
        });

        const widgetDictRef = loadedPdf.context.register(widgetDict);

        // Add signature widget to the first page
        pages[0].node.set(PDFName.of('Annots'), loadedPdf.context.obj([widgetDictRef]));

        loadedPdf.catalog.set(
        PDFName.of('AcroForm'),
        loadedPdf.context.obj({
            SigFlags: 3,
            Fields: [widgetDictRef],
        })
        );

        // Allows signatures on newer PDFs
        // @see https://github.com/Hopding/pdf-lib/issues/541
        const pdfBytes = await loadedPdf.save({ useObjectStreams: false });

        return unit8ToBuffer(pdfBytes);
    }

    /**
     * @param {Uint8Array} unit8
     */
    function unit8ToBuffer(unit8) {
        let buf = Buffer.alloc(unit8.byteLength);
        const view = new Uint8Array(unit8);

        for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
        }
        return buf;
    }
    //   end of addPlaceholder

    // start PDFArrayCustom
    class PDFArrayCustom extends PDFArray {
        static withContext(context) {
            return new PDFArrayCustom(context);
        }
    
        clone(context) {
            const clone = PDFArrayCustom.withContext(context || this.context);
            for (let idx = 0, len = this.size(); idx < len; idx++) {
                clone.push(this.array[idx]);
            }
            return clone;
        }
    
        toString() {
            let arrayString = "[";
            for (let idx = 0, len = this.size(); idx < len; idx++) {
                arrayString += this.get(idx).toString();
                if (idx < len - 1) arrayString += " ";
            }
            arrayString += "]";
            return arrayString;
        }
    
        sizeInBytes() {
            let size = 2;
            for (let idx = 0, len = this.size(); idx < len; idx++) {
                size += this.get(idx).sizeInBytes();
                if (idx < len - 1) size += 1;
            }
            return size;
        }
    
        copyBytesInto(buffer, offset) {
            const initialOffset = offset;
        
            buffer[offset++] = CharCodes.LeftSquareBracket;
            for (let idx = 0, len = this.size(); idx < len; idx++) {
                offset += this.get(idx).copyBytesInto(buffer, offset);
                if (idx < len - 1) buffer[offset++] = CharCodes.Space;
            }
            buffer[offset++] = CharCodes.RightSquareBracket;
        
            return offset - initialOffset;
        }
    }
    // end of PDFArrayCustom