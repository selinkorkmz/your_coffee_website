const PDFDocument = require("pdfkit");
const fs = require("fs");

/**
 * Generates an invoice as a PDF file.
 * @param {number} userId - ID of the user.
 * @param {number} totalAmount - Total amount for the order.
 * @param {Array} cartItems - List of items in the cart.
 * @param {Function} callback - Callback function to return the file path or error.
 */
const generateInvoicePDF = (userId, totalAmount, cartItems, orderDate, callback) => {
  try {
    const doc = new PDFDocument();
    const filePath = `./invoices/invoice-${userId}-${new Date(orderDate).getTime()}.pdf`;

    // Create a write stream to save the PDF file
    doc.pipe(fs.createWriteStream(filePath));

    // Add invoice header
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`User ID: ${userId}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`);
    doc.moveDown();

    // Add item details
    doc.text("Items:");
    cartItems.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.name} - $${item.price} x ${item.quantity}`
      );
    });

    doc.end(); // Finalize the PDF file
    callback(null, filePath);
  } catch (err) {
    callback(err);
  }
};

module.exports = { generateInvoicePDF };
