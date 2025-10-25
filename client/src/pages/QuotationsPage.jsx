// src/pages/QuotationsPage.jsx
import React, { useState, useEffect } from 'react';
import { inventoryAPI, quotationsAPI } from '../services/api'; // Use quotationsAPI
import { translations } from '../utils/translations';
// We'll reuse Sales components but adapt them slightly via props or create specific Quotation versions if needed
import QuotationForm from '../components/quotations/QuotationForm'; // Create this component
import QuotationsHistory from '../components/quotations/QuotationsHistory'; // Create this component
import { generateQuotationHTML } from '../utils/quotationGenerator'; // Use quotation generator

const QuotationsPage = () => {
  const [inventory, setInventory] = useState([]);
  const [quotations, setQuotations] = useState([]); // State for quotations
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new-quotation'); // Default tab
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const t = translations[language];

  useEffect(() => {
    fetchData();
    // Optional: Load dark mode/language preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('language') || 'en';
    setDarkMode(savedDarkMode);
    setLanguage(savedLanguage);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [invRes, quotationsRes] = await Promise.all([
        inventoryAPI.readAll(),
        quotationsAPI.getAll().catch(() => ({ data: [] })), // Fetch quotations
      ]);

      const invData = Array.isArray(invRes.data) ? invRes.data : [];
      setInventory(invData);
      setQuotations(Array.isArray(quotationsRes.data) ? quotationsRes.data.sort((a, b) => new Date(b.date) - new Date(a.date)) : []); // Sort quotations by date
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
      setInventory([]);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode); // Persist preference
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'si' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang); // Persist preference
  };

  const handleQuotationSuccess = (quotationData) => {
    setSuccess('Quotation recorded successfully!');
    printQuotation(quotationData); // Print the generated quotation
    fetchData(); // Refresh data
    setActiveTab('history'); // Switch to history view after creation
    setTimeout(() => setSuccess(''), 5000);
  };

  const printQuotation = (quotationData) => {
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(generateQuotationHTML(quotationData));
      printWindow.document.close();
      // Optional: Trigger print dialog automatically
      // setTimeout(() => printWindow.print(), 500);
    } else {
      setError('Could not open print window. Please disable popup blockers.');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${darkMode ? 'border-purple-400' : 'border-purple-600'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`} style={language === 'si' ? { fontFamily: 'Noto Sans Sinhala, sans-serif' } : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t.quotations}</h1> {/* Assuming 'quotations' translation exists */}
          <div className="flex gap-2">
            <button
              onClick={toggleLanguage}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {language === 'en' ? 'සිං' : 'EN'}
            </button>
            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className={`flex space-x-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('new-quotation')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'new-quotation'
                  ? `border-b-2 ${darkMode ? 'border-purple-400 text-purple-400' : 'border-purple-600 text-purple-600'}`
                  : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              {t.newQuotation}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'history'
                  ? `border-b-2 ${darkMode ? 'border-purple-400 text-purple-400' : 'border-purple-600 text-purple-600'}`
                  : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              {t.quotationHistory}
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

        {/* Content Area */}
        {activeTab === 'new-quotation' ? (
          <QuotationForm // Use the specific QuotationForm component
            inventory={inventory}
            onSuccess={handleQuotationSuccess}
            onError={setError}
            darkMode={darkMode}
            language={language}
            translations={t}
          />
        ) : (
          <QuotationsHistory // Use the specific QuotationsHistory component
            quotations={quotations}
            onPrintQuotation={printQuotation}
            darkMode={darkMode}
            language={language}
            translations={t}
          />
        )}
      </div>
    </div>
  );
};

export default QuotationsPage;
