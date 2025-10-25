// src/components/quotations/QuotationForm.jsx
import React, { useState } from 'react';
import { quotationsAPI } from '../../services/api'; // Use quotations API
import CartSection from '../sales/CartSection'; // Reuse CartSection
import InventoryList from '../sales/InventoryList'; // Reuse InventoryList

// Make sure translations (t) includes keys used here: newQuotation, customerName, etc.
const QuotationForm = ({ inventory, onSuccess, onError, darkMode, language, translations: t }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    notes: '', // Added notes field
  });
  const [cartItems, setCartItems] = useState([]);
  const [hasOldItem, setHasOldItem] = useState(false);
  const [oldItemData, setOldItemData] = useState({ description: '', deduction_amount: '0' });
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [localError, setLocalError] = useState('');

  // --- Copy Cart Logic from SaleForm ---
   const addToCart = (item) => {
    const existingItem = cartItems.find(ci => ci.itemId === item.id);
     if (existingItem) {
      if (existingItem.quantitySold >= item.quantity) {
        setLocalError(`Cannot add more. Only ${item.quantity} available in stock.`);
        return;
      }
      setCartItems(cartItems.map(ci =>
        ci.itemId === item.id ? { ...ci, quantitySold: ci.quantitySold + 1, quantityRequested: ci.quantitySold + 1 } : ci // Use quantityRequested
      ));
    } else {
      if (item.quantity < 1) {
        setLocalError('Item out of stock');
        return;
      }
      setCartItems([...cartItems, {
        itemId: item.id,
        itemName: item.itemName,
        modelNumber: item.modelNumber, // Added modelNumber
        quantitySold: 1, // Keep for CartSection compatibility
        quantityRequested: 1, // Use quantityRequested for quotation
        sellingPrice: item.sellingPrice,
        originalPrice: item.sellingPrice,
        availableQty: item.quantity,
      }]);
    }
    setLocalError('');
  };

  const updateCartItemQty = (itemId, newQty) => {
    const item = cartItems.find(ci => ci.itemId === itemId);
    if (!item) return;
    if (newQty > item.availableQty) {
      setLocalError(`Cannot quote more than available stock: ${item.availableQty}`);
      // Allow quoting more than available if needed, remove/adjust this check
      // return;
    }
     if (newQty < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(cartItems.map(ci =>
      ci.itemId === itemId ? { ...ci, quantitySold: newQty, quantityRequested: newQty } : ci // Update both
    ));
    setLocalError('');
  };

  const updateCartItemPrice = (itemId, newPrice) => {
     const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
        setLocalError('Please enter a valid price');
        return;
    }
    setCartItems(cartItems.map(ci =>
        ci.itemId === itemId ? { ...ci, sellingPrice: price } : ci
    ));
    setLocalError('');
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(ci => ci.itemId !== itemId));
  };
  // --- End Cart Logic ---


  // --- Copy Borrowed Item Logic from SaleForm ---
  const addBorrowedItem = () => {
    setBorrowedItems([...borrowedItems, { description: '', borrowed_cost: '0', selling_price: '0', quantity: 1 }]);
  };

  const updateBorrowedItem = (index, field, value) => {
    const updated = [...borrowedItems];
    updated[index][field] = value;
    setBorrowedItems(updated);
  };

  const removeBorrowedItem = (index) => {
    setBorrowedItems(borrowedItems.filter((_, i) => i !== index));
  };
  // --- End Borrowed Item Logic ---


 // --- Copy Calculate Total Logic from SaleForm ---
  const calculateTotal = () => {
    let total = cartItems.reduce((sum, item) => sum + (item.quantityRequested * item.sellingPrice), 0);
    if (hasOldItem) {
      total -= parseFloat(oldItemData.deduction_amount || 0);
    }
     borrowedItems.forEach(item => {
      total += parseFloat(item.selling_price || 0) * parseInt(item.quantity || 1);
    });
    return total;
  };
  // --- End Calculate Total Logic ---


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    onError('');

    if (cartItems.length === 0 && borrowedItems.length === 0) {
      setLocalError('Please add at least one item to the quotation');
      return;
    }

    try {
      const quotationData = {
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        notes: formData.notes,
        items: cartItems.map(item => ({
          itemId: item.itemId,
          quantityRequested: item.quantityRequested, // Use quantityRequested
          sellingPrice: item.sellingPrice,
        })),
        // No amountPaid or paymentMethod needed for quotations
      };

      // --- Copy Old Item/Borrowed Item Logic from SaleForm ---
       if (hasOldItem && oldItemData.description && parseFloat(oldItemData.deduction_amount) > 0) {
        quotationData.old_item_exchange = {
          description: oldItemData.description,
          deduction_amount: parseFloat(oldItemData.deduction_amount)
        };
      }
      if (borrowedItems.length > 0) {
        const validBorrowedItems = borrowedItems.filter(item =>
          item.description && parseFloat(item.selling_price) >= 0 // Allow 0 selling price
        );
        if (validBorrowedItems.length > 0) {
          quotationData.borrowed_items = validBorrowedItems.map(item => ({
            description: item.description,
            borrowed_cost: parseFloat(item.borrowed_cost || 0), // Default cost to 0 if empty
            selling_price: parseFloat(item.selling_price || 0), // Default selling price to 0 if empty
            quantity: parseInt(item.quantity || 1) // Default quantity to 1 if empty
          }));
        }
      }
      // --- End Old Item/Borrowed Item Logic ---

      const response = await quotationsAPI.create(quotationData); // Use quotations API

      // Reset form
      setFormData({ customerName: '', phoneNumber: '', notes: '' });
      setCartItems([]);
      setHasOldItem(false);
      setOldItemData({ description: '', deduction_amount: '0' });
      setBorrowedItems([]);

      onSuccess(response.data); // Pass quotation data back
    } catch (err) {
      onError(err.response?.data?.detail || 'Failed to record quotation');
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Form & Cart */}
      <div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
          <h2 className="text-3xl font-bold mb-8">{t.newQuotation}</h2>

          {localError && (
            <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border-2 px-6 py-4 rounded-lg mb-6 text-lg font-semibold`}>
              ⚠️ {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Name */}
             <div>
              <label className={`block text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                👤 {t.customerName} <span className="text-red-600">*</span>
              </label>
              <input
                type="text" value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required placeholder={t.customerNamePlaceholder || "Enter customer name"} // Add placeholder translation if needed
                className={`w-full px-6 py-4 text-lg border-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
              />
            </div>

            {/* Phone Number */}
             <div>
              <label className={`block text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                📞 {t.phoneNumber}
              </label>
              <input
                type="tel" value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                 placeholder={t.phoneNumberPlaceholder || "Optional: 0771234567"} // Add placeholder translation
                className={`w-full px-6 py-4 text-lg border-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                📝 {t.notes}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                placeholder={t.notesPlaceholder}
                className={`w-full px-6 py-4 text-lg border-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
              />
            </div>

            {/* --- Copy Old Item Exchange Section from SaleForm --- */}
             <div className={`border-4 rounded-xl p-6 ${darkMode ? 'border-gray-600 bg-gray-750' : 'border-blue-300 bg-blue-50'}`}>
              <label className="flex items-center space-x-3 mb-4">
                 <input type="checkbox" checked={hasOldItem} onChange={(e) => setHasOldItem(e.target.checked)} className="w-6 h-6 text-blue-600 cursor-pointer"/>
                 <span className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>🔄 {t.oldItemExchange}</span>
              </label>
              {hasOldItem && (
                 <div className="space-y-4 mt-4">
                   <input type="text" placeholder={t.oldItemDescription} value={oldItemData.description} onChange={(e) => setOldItemData({ ...oldItemData, description: e.target.value })} className={`w-full px-5 py-4 text-lg border-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}/>
                   <div>
                     <label className={`block text-base font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.deductionAmount}</label>
                     <input type="number" placeholder="0.00" value={oldItemData.deduction_amount} onChange={(e) => setOldItemData({ ...oldItemData, deduction_amount: e.target.value })} step="0.01" min="0" className={`w-full px-5 py-4 text-lg border-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}/>
                   </div>
                 </div>
               )}
             </div>

            {/* --- Copy Borrowed Items Section from SaleForm --- */}
             <div className={`border-4 rounded-xl p-6 ${darkMode ? 'border-gray-600 bg-gray-750' : 'border-green-300 bg-green-50'}`}>
              <div className="flex justify-between items-center mb-4">
                 <span className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>📦 {t.borrowedItems}</span>
                 <button type="button" onClick={addBorrowedItem} className={`px-6 py-3 rounded-lg text-lg font-bold ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white shadow-lg`}>{t.addBorrowedItem}</button>
              </div>
               {borrowedItems.length === 0 && <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{language === 'en' ? 'No borrowed items. Click "Add Item" to add.' : 'ණයට ගත් භාණ්ඩ නැත. එකතු කිරීමට "භාණ්ඩයක් එකතු කරන්න" ක්ලික් කරන්න.'}</p>}
               {borrowedItems.map((item, index) => (
                 <div key={index} className={`mb-4 p-5 border-2 rounded-lg ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                   <div className="flex justify-between items-start mb-3">
                     <span className="text-lg font-bold">{t.itemNumber} {index + 1}</span>
                     <button type="button" onClick={() => removeBorrowedItem(index)} className={`px-4 py-2 rounded text-base font-bold ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>❌ {t.removeBorrowedItem}</button>
                   </div>
                   <input type="text" placeholder={t.whatIsItem} value={item.description} onChange={(e) => updateBorrowedItem(index, 'description', e.target.value)} className={`w-full px-4 py-3 text-base border-2 rounded-lg mb-3 ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'}`}/>
                   <div className="grid grid-cols-3 gap-3">
                     <div>
                       <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.borrowedItemCost}</label>
                       <input type="number" placeholder="0.00" value={item.borrowed_cost} onChange={(e) => updateBorrowedItem(index, 'borrowed_cost', e.target.value)} step="0.01" min="0" className={`w-full px-3 py-2 text-base border-2 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'}`}/>
                     </div>
                     <div>
                       <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.borrowedItemSelling}</label>
                       <input type="number" placeholder="0.00" value={item.selling_price} onChange={(e) => updateBorrowedItem(index, 'selling_price', e.target.value)} step="0.01" min="0" className={`w-full px-3 py-2 text-base border-2 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'}`}/>
                     </div>
                     <div>
                       <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.borrowedItemQty}</label>
                       <input type="number" placeholder="1" value={item.quantity} onChange={(e) => updateBorrowedItem(index, 'quantity', e.target.value)} min="1" className={`w-full px-3 py-2 text-base border-2 rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-300'}`}/>
                     </div>
                   </div>
                 </div>
               ))}
             </div>


            {/* Totals Section (No Payment/Balance) */}
            <div className={`pt-6 border-t-4 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">{t.inventoryItems}:</span>
                  <span className="font-bold">Rs. {cartItems.reduce((sum, item) => sum + (item.quantityRequested * item.sellingPrice), 0).toFixed(2)}</span>
                </div>
                {hasOldItem && parseFloat(oldItemData.deduction_amount) > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>{t.oldItemDeduction}:</span>
                    <span>- Rs. {parseFloat(oldItemData.deduction_amount).toFixed(2)}</span>
                  </div>
                )}
                {borrowedItems.length > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>{t.borrowedItemsTotal}:</span>
                    <span>+ Rs. {borrowedItems.reduce((sum, item) => sum + (parseFloat(item.selling_price || 0) * parseInt(item.quantity || 1)), 0).toFixed(2)}</span>
                  </div>
                )}
                 <div className={`flex justify-between py-4 mt-3 border-t-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <span className="font-bold text-2xl">{t.estimatedTotal}:</span> {/* Changed label */}
                  <span className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Rs. {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full font-bold py-6 text-2xl rounded-lg transition-colors shadow-lg ${darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
            >
              📄 {t.recordQuotation} {/* Changed label */}
            </button>
          </form>
        </div>

        {/* Cart */}
         <CartSection
           cartItems={cartItems}
           updateCartItemQty={updateCartItemQty}
           updateCartItemPrice={updateCartItemPrice}
           removeFromCart={removeFromCart}
           darkMode={darkMode}
           translations={t}
           // Pass quantityRequested if CartSection needs it, otherwise quantitySold is fine for display
         />
      </div>

      {/* Right Column - Available Items */}
       <InventoryList
         inventory={inventory}
         addToCart={addToCart}
         darkMode={darkMode}
         translations={t}
       />
    </div>
  );
};

export default QuotationForm;
