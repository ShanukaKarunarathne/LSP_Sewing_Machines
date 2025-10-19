import React, { useState } from 'react';

const SalesHistory = ({ sales, onPrintBill, darkMode, language, translations: t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.phoneNumber.includes(searchTerm) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      new Date(sale.date).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  const getStatusLabel = (status) => {
    if (status === 'Paid') return t.paidStatus;
    if (status === 'Partial') return t.partialStatus;
    return t.unpaidStatus;
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{t.salesHistory}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.search}
            </label>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.filterDate}
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {(searchTerm || dateFilter) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFilter('');
            }}
            className={`mt-3 text-sm font-semibold ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.invoiceId}</th>
              <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.date}</th>
              <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.customer}</th>
              <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.phone}</th>
              <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.payment}</th>
              <th className={`text-right py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.total}</th>
              <th className={`text-right py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.paid}</th>
              <th className={`text-right py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.balance}</th>
              <th className={`text-center py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.status}</th>
              <th className={`text-center py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="10" className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t.noSales}
                </td>
              </tr>
            ) : (
              filteredSales.map(sale => (
                <tr key={sale.id} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <td className="py-3 px-4 text-sm font-mono">{sale.id.substring(0, 8)}</td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm">{sale.customerName}</td>
                  <td className="py-3 px-4 text-sm">{sale.phoneNumber}</td>
                  <td className="py-3 px-4 text-sm">{sale.paymentMethod}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold">
                    Rs. {sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    Rs. {sale.amountPaid.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    Rs. {sale.balance.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      sale.creditStatus === 'Paid' 
                        ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        : sale.creditStatus === 'Partial'
                        ? darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                        : darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(sale.creditStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onPrintBill(sale)}
                      className={`font-semibold text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      {t.print}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {t.showing} {filteredSales.length} {t.of} {sales.length} {t.sales}
      </div>
    </div>
  );
};

export default SalesHistory