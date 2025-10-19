import React from 'react';

const CartSection = ({ 
  cartItems, 
  updateCartItemQty, 
  updateCartItemPrice, 
  removeFromCart, 
  darkMode, 
  translations: t 
}) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <h3 className="text-xl font-bold mb-4">{t.cart} ({cartItems.length})</h3>
      {cartItems.length === 0 ? (
        <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {t.noItems}
        </p>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div 
              key={item.itemId} 
              className={`border rounded-lg p-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold">{item.itemName}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t.original}: Rs. {item.originalPrice.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.itemId)}
                  className={`font-bold ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.quantity}
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartItemQty(item.itemId, item.quantitySold - 1)}
                      className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantitySold}</span>
                    <button
                      onClick={() => updateCartItemQty(item.itemId, item.quantitySold + 1)}
                      className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.price} (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.sellingPrice}
                    onChange={(e) => updateCartItemPrice(item.itemId, e.target.value)}
                    className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              
              <div className={`mt-2 pt-2 border-t flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.subtotal}:
                </span>
                <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Rs. {(item.quantitySold * item.sellingPrice).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartSection;