const Sale = require('../models/Sale');

const generateInvoiceNumber = async () => {
  const count = await Sale.countDocuments();
  return `FAC-${String(count + 1).padStart(5, '0')}`;
};

module.exports = { generateInvoiceNumber };
