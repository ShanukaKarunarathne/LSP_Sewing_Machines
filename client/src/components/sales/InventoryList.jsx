import React from 'react';

const InventoryList = ({ inventory, addToCart, darkMode, translations: t }) => {
  const availableItems = inventory.filter(item => item.quantity > 0);

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <h3 className="text-xl font-bold mb-4">{t.availableItems}</h3>
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {availableItems.map(item => (
          <div 
            key={item.id} 
            className={`border rounded-lg p-4 transition-colors ${
              darkMode 
                ? 'border-gray-700 hover:border-blue-400' 
                : 'border-gray-200 hover:border-blue-600'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">{item.itemName}</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.modelNumber}
                </p>
              </div>
              <span className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Rs. {item.sellingPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.stock}: {item.quantity}
              </span>
              <button
                onClick={() => addToCart(item)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {t.addToCart}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryList;