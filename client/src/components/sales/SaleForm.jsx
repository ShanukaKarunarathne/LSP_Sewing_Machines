import React, { useState } from 'react';
import { salesAPI } from '../../services/api';
import CartSection from './CartSection';
import InventoryList from './InventoryList';

const SaleForm = ({ inventory, onSuccess, onError, darkMode, language, translations: t }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    paymentMethod: 'Cash',
    amountPaid: '0',
  });
  const [cartItems, setCartItems] = useState([]);
  const [localError, setLocalError] = useState('');

  const addToCart = (item) => {
    const existingItem = cartItems.find(ci => ci.itemId === item.id);
    
    if (existingItem) {
      if (existingItem.quantitySold >= item.quantity) {
        setLocalError(`Cannot add more. Only ${item.quantity} available in stock.`);
        return;
      }
      setCartItems(cartItems.map(ci =>
        ci.itemId === item.id
          ? { ...ci, quantitySold: ci.quantitySold + 1 }
          : ci
      ));
    } else {
      if (item.quantity < 1) {
        setLocalError('Item out of stock');
        return;
      }
      setCartItems([...cartItems, {
        itemId: item.id,
        itemName: item.itemName,
        quantitySold: 1,
        sellingPrice: item.sellingPrice,
        originalPrice: item.sellingPrice,
        availableQty: item.quantity,
      }]);
    }
    setLocalError('');
  };

  const updateCartItemQty = (itemId, newQty) => {
    const item = cartItems.find(ci => ci.itemId === itemId);
    if (newQty > item.availableQty) {
      setLocalError(`Only ${item.availableQty} available in stock`);
      return;
    }
    if (newQty < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(cartItems.map(ci =>
      ci.itemId === itemId ? { ...ci, quantitySold: newQty } : ci
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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantitySold * item.sellingPrice), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    onError('');

    if (cartItems.length === 0) {
      setLocalError('Please add at least one item to the cart');
      return;
    }

    const totalAmount = calculateTotal();
    const amountPaid = parseFloat(formData.amountPaid);

    try {
      const saleData = {
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantitySold: item.quantitySold,
          sellingPrice: item.sellingPrice,
        })),
        amountPaid: amountPaid,
        installment_info: {
          has_plan: false,
          number_of_installments: 0,
          due_dates: [],
        },
      };

      const response = await salesAPI.create(saleData);
      
      setFormData({
        customerName: '',
        phoneNumber: '',
        paymentMethod: 'Cash',
        amountPaid: '0',
      });
      setCartItems([]);
      
      onSuccess(response.data);
    } catch (err) {
      onError(err.response?.data?.detail || 'Failed to record sale');
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Form & Cart */}
      <div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
          <h2 className="text-2xl font-bold mb-6">{t.newSale}</h2>

          {localError && (
            <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg mb-4`}>
              {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.customerName} {t.required}
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.phoneNumber} {t.required}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.paymentMethod}
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option>{t.cash}</option>
                <option>{t.card}</option>
                <option>{t.credit}</option>
                <option>{t.cheque}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.amountPaid}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                required
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{t.totalAmount}:</span>
                <span className="text-xl font-bold">Rs. {calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-semibold">{t.balance}:</span>
                <span className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Rs. {(calculateTotal() - parseFloat(formData.amountPaid || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full font-semibold py-3 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {t.recordSale}
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

export default SaleForm;