import React, { useState, useEffect } from 'react';
import { salesAPI, inventoryAPI } from '../services/api';
import { translations } from '../utils/translations';
import SaleForm from '../components/sales/SaleForm';
import SalesHistory from '../components/sales/SalesHistory';
import { generateBillHTML } from '../utils/billGenerator';

const SalesPage = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new-sale');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const t = translations[language];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, salesRes] = await Promise.all([
        inventoryAPI.readAll(),
        salesAPI.getAll().catch(() => ({ data: [] })),
      ]);
      
      const invData = Array.isArray(invRes.data) ? invRes.data : [];
      setInventory(invData);
      setSales(salesRes.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'si' : 'en');
  };

  const handleSaleSuccess = (saleData) => {
    setSuccess('Sale recorded successfully!');
    printBill(saleData);
    fetchData();
    setTimeout(() => setSuccess(''), 3000);
  };

  const printBill = (saleData) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateBillHTML(saleData));
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`} style={language === 'si' ? { fontFamily: 'Noto Sans Sinhala, sans-serif' } : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Toggle Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t.newSale}</h1>
          <div className="flex gap-2">
            <button
              onClick={toggleLanguage}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {language === 'en' ? 'සිං' : 'EN'}
            </button>
            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className={`flex space-x-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('new-sale')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'new-sale'
                  ? `border-b-2 ${darkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'}`
                  : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              {t.newSale}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'history'
                  ? `border-b-2 ${darkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'}`
                  : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              {t.salesHistory}
            </button>
          </div>
        </div>

        {/* Global Messages */}
        {error && (
          <div className={`mb-4 ${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg`}>
            {error}
          </div>
        )}

        {success && (
          <div className={`mb-4 ${darkMode ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-700'} border px-4 py-3 rounded-lg`}>
            {success}
          </div>
        )}

        {activeTab === 'new-sale' ? (
          <SaleForm
            inventory={inventory}
            onSuccess={handleSaleSuccess}
            onError={setError}
            darkMode={darkMode}
            language={language}
            translations={t}
          />
        ) : (
          <SalesHistory
            sales={sales}
            onPrintBill={printBill}
            darkMode={darkMode}
            language={language}
            translations={t}
          />
        )}
      </div>
    </div>
  );
};

export default SalesPage;