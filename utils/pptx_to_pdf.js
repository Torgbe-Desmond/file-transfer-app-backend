const fs = require('fs');
const path = require('path');
const PDFShift = require('pdfshift');

const pptxConverter = async (pptxName) => {
  try {
    // Initialize PDFShift with your API key
    const pdfshift = new PDFShift(process.env.PPT_TO_PDF_CONVERTER_KEY);

    const convertedName = pptxName.split('.')[0];

    const pptxFilePath = path.join(__dirname, 'pptx_files', `${convertedName}.pptx`);

    // Convert PPTX to PDF using PDFShift
    const response = await pdfshift.convert({
      source: `${pptxFilePath}`,
      landscape: false,
      use_print: false
    });

    // Write the PDF data to a file
    const outputFilePath = path.join(__dirname, 'pdf_files', `${convertedName}.pdf`);
    fs.writeFile(outputFilePath, response.data, 'binary', function (err) {
      if (err) throw err;
      console.log('PDF file saved:', outputFilePath);
    });

    // Return the path to the converted PDF file
    return outputFilePath;
  } catch (error) {
    // Handle any errors that occur during conversion
    console.error('Conversion failed:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}
