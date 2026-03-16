/**
 * FEFO (First-Expired, First-Out) Utility
 * Validates and sorts inventory arrays based on their expiration date.
 */

// Function to sort an array of inventory items by FEFO ascending
const sortFEFO = (inventoryArray) => {
  return inventoryArray.sort((a, b) => {
    return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
  });
};

module.exports = {
  sortFEFO
};
