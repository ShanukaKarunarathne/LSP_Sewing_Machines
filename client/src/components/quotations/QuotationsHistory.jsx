// src/components/quotations/QuotationsHistory.jsx
import React, { useState } from 'react';

// Make sure translations (t) includes keys used here: quotationHistory, searchQuotationsPlaceholder, etc.
const QuotationsHistory = ({ quotations, onPrintQuotation, darkMode, language, translations: t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredQuotations = quotations.filter(q => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (q.customerName || '').toLowerCase().includes(searchLower) ||
      (q.phoneNumber || '').includes(searchTerm) || // Allow searching by phone even if empty
      q.id.toLowerCase().includes(searchLower);

    const matchesDate = !dateFilter ||
      new Date(q.date).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesDate;
  });

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{t.quotationHistory}</h2>

        {/* --- Copy Search/Filter inputs from SalesHistory --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.search}</label>
             <input
               type="text"
               placeholder={t.searchQuotationsPlaceholder} // Use specific placeholder
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300'}`}
             />
           </div>
           <div>
             <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.filterDate}</label>
             <input
               type="date"
               value={dateFilter}
               onChange={(e) => setDateFilter(e.target.value)}
               className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
             />
           </div>
         </div>
         {(searchTerm || dateFilter) && (
           <button onClick={() => { setSearchTerm(''); setDateFilter(''); }} className={`mt-3 text-sm font-semibold ${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}>
             {t.clearFilters}
           </button>
         )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.quotationNo}</th>
              <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.date}</th>
              <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.customer}</th>
              <th className={`text-left py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.phone}</th>
              <th className={`text-right py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.total}</th>
              <th className={`text-center py-3 px-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.length === 0 ? (
              <tr>
                <td colSpan="6" className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t.noQuotations}
                </td>
              </tr>
            ) : (
              filteredQuotations.map(q => (
                <tr key={q.id} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <td className="py-3 px-4 text-sm font-mono">{q.id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm">{new Date(q.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm">{q.customerName || '-'}</td>
                  <td className="py-3 px-4 text-sm">{q.phoneNumber || '-'}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold">
                    Rs. {q.totalAmount?.toFixed(2) || '0.00'} {/* Handle potential undefined total */}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onPrintQuotation(q)}
                      className={`font-semibold text-sm ${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
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
         {t.showing} {filteredQuotations.length} {t.of} {quotations.length} {t.quotations} {/* Changed 'sales' to 'quotations' */}
       </div>
    </div>
  );
};

export default QuotationsHistory;
