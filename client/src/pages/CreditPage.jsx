// src/pages/CreditPage.jsx
import React, { useState, useEffect } from 'react';
import { creditAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const translations = {
  en: {
    recordPayment: 'Record Payment',
    activeCreditRecords: 'Active Credit Records',
    totalOutstanding: 'Total Outstanding',
    activeCredits: 'Active Credits',
    totalAmount: 'Total Amount',
    selectSale: 'Select Sale',
    selectSalePlaceholder: '-- Select a Sale --',
    saleDetails: 'Sale Details',
    customer: 'Customer',
    phone: 'Phone',
    total: 'Total',
    paid: 'Paid',
    balance: 'Balance',
    paymentAmount: 'Payment Amount',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    cheque: 'Cheque',
    bankTransfer: 'Bank Transfer',
    chequeNumber: 'Cheque Number',
    chequeDate: 'Cheque Date',
    description: 'Description (Optional)',
    descriptionPlaceholder: 'Add any notes about this payment...',
    recordPaymentBtn: 'Record Payment',
    paymentHistory: 'Payment History',
    delete: 'Delete',
    noActiveCredits: 'No active credit records found.',
    saleId: 'Sale ID',
    date: 'Date',
    paidPercentage: 'paid',
    deleteConfirm: 'Are you sure you want to delete this payment?',
    deleteError: 'Only L2 users can delete payments',
    paymentSuccess: 'Payment recorded successfully!',
    paymentDeleted: 'Payment deleted successfully!',
    selectSaleError: 'Please select a sale',
    required: '*'
  },
  si: {
    recordPayment: 'ගෙවීම සටහන් කරන්න',
    activeCreditRecords: 'ක්‍රියාකාරී ණය වාර්තා',
    totalOutstanding: 'මුළු ශේෂය',
    activeCredits: 'ක්‍රියාකාරී ණය',
    totalAmount: 'මුළු මුදල',
    selectSale: 'විකුණුම තෝරන්න',
    selectSalePlaceholder: '-- විකුණුමක් තෝරන්න --',
    saleDetails: 'විකුණුම් විස්තර',
    customer: 'ගනුදෙනුකරු',
    phone: 'දුරකථනය',
    total: 'එකතුව',
    paid: 'ගෙවූ',
    balance: 'ශේෂය',
    paymentAmount: 'ගෙවීමේ මුදල',
    paymentMethod: 'ගෙවීමේ ක්‍රමය',
    cash: 'මුදල්',
    card: 'කාඩ්',
    cheque: 'චෙක්පත',
    bankTransfer: 'බැංකු හුවමාරුව',
    chequeNumber: 'චෙක්පත් අංකය',
    chequeDate: 'චෙක්පත් දිනය',
    description: 'විස්තරය (අත්‍යවශ්‍ය නොවේ)',
    descriptionPlaceholder: 'මෙම ගෙවීම පිළිබඳ සටහන් එක් කරන්න...',
    recordPaymentBtn: 'ගෙවීම සටහන් කරන්න',
    paymentHistory: 'ගෙවීම් ඉතිහාසය',
    delete: 'මකන්න',
    noActiveCredits: 'ක්‍රියාකාරී ණය වාර්තා හමු නොවීය.',
    saleId: 'විකුණුම් අංකය',
    date: 'දිනය',
    paidPercentage: 'ගෙවා ඇත',
    deleteConfirm: 'ඔබට මෙම ගෙවීම මකා දැමීමට අවශ්‍ය බව විශ්වාසද?',
    deleteError: 'L2 පරිශීලකයින්ට පමණක් ගෙවීම් මකා දැමිය හැකිය',
    paymentSuccess: 'ගෙවීම සාර්ථකව සටහන් කරන ලදී!',
    paymentDeleted: 'ගෙවීම සාර්ථකව මකා දමන ලදී!',
    selectSaleError: 'කරුණාකර විකුණුමක් තෝරන්න',
    required: '*'
  }
};

const formatCurrency = (amount) => {
  return amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

const CreditPage = () => {
  const { isL2 } = useAuth();
  const [creditRecords, setCreditRecords] = useState([]);
  const [selectedSale, setSelectedSale] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'Cash',
    description: '',
    chequeNumber: '',
    chequeDate: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const t = translations[language];

  useEffect(() => {
    fetchCreditRecords();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'si' : 'en');
  };

  const fetchCreditRecords = async () => {
    try {
      setLoading(true);
      const response = await creditAPI.getAllActive();
      setCreditRecords(response.data);
    } catch (err) {
      setError('Failed to fetch credit records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (saleId) => {
    try {
      const response = await creditAPI.getPaymentsBySale(saleId);
      setPaymentHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
      setPaymentHistory([]);
    }
  };

  const handleSaleSelect = (saleId) => {
    setSelectedSale(saleId);
    if (saleId) {
      fetchPaymentHistory(saleId);
    } else {
      setPaymentHistory([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSale) {
      setError(t.selectSaleError);
      return;
    }

    try {
      const paymentData = {
        saleId: selectedSale,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        chequeNumber: formData.chequeNumber || '',
        chequeDate: formData.chequeDate || '',
      };

      await creditAPI.recordPayment(paymentData);
      setSuccess(t.paymentSuccess);

      setFormData({
        amount: '',
        paymentMethod: 'Cash',
        description: '',
        chequeNumber: '',
        chequeDate: '',
      });
      setSelectedSale('');
      setPaymentHistory([]);

      fetchCreditRecords();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record payment');
      console.error(err);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!isL2()) {
      setError(t.deleteError);
      return;
    }

    if (!window.confirm(t.deleteConfirm)) {
      return;
    }

    try {
      await creditAPI.deletePayment(paymentId);
      setSuccess(t.paymentDeleted);
      fetchCreditRecords();
      if (selectedSale) {
        fetchPaymentHistory(selectedSale);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete payment');
      console.error(err);
    }
  };

  const getTotalBalance = () => {
    return creditRecords.reduce((sum, record) => sum + record.balance, 0);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  const selectedRecord = creditRecords.find(r => r.saleId === selectedSale);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`} style={language === 'si' ? { fontFamily: 'Noto Sans Sinhala, sans-serif' } : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Toggle Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t.recordPayment}</h1>
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

        {/* Summary Card */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.totalOutstanding}</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                Rs. {formatCurrency(getTotalBalance())}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.activeCredits}</p>
              <p className="text-3xl font-bold">{creditRecords.length}</p>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className="text-2xl font-bold mb-6">{t.recordPayment}</h2>

            {error && (
              <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg mb-4`}>
                {error}
              </div>
            )}

            {success && (
              <div className={`${darkMode ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-700'} border px-4 py-3 rounded-lg mb-4`}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.selectSale} {t.required}
                </label>
                <select
                  value={selectedSale}
                  onChange={(e) => handleSaleSelect(e.target.value)}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t.selectSalePlaceholder}</option>
                  {creditRecords.map(record => (
                    <option key={record.saleId} value={record.saleId}>
                      {record.saleId} - {record.customerName} ({t.balance}: Rs. {formatCurrency(record.balance)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedRecord && (
                <div className={`${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>{t.saleDetails}</p>
                  <div className={`space-y-1 text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    <p><strong>{t.customer}:</strong> {selectedRecord.customerName}</p>
                    <p><strong>{t.phone}:</strong> {selectedRecord.phoneNumber}</p>
                    <p><strong>{t.total}:</strong> Rs. {formatCurrency(selectedRecord.totalAmount)}</p>
                    <p><strong>{t.paid}:</strong> Rs. {formatCurrency(selectedRecord.amountPaid)}</p>
                    <p><strong>{t.balance}:</strong> Rs. {formatCurrency(selectedRecord.balance)}</p>
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.paymentAmount} {t.required}
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  max={selectedRecord?.balance || 0}
                  placeholder="0.00"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.paymentMethod} {t.required}
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option>{t.cash}</option>
                  <option>{t.card}</option>
                  <option>{t.cheque}</option>
                  <option>{t.bankTransfer}</option>
                </select>
              </div>

              {formData.paymentMethod === t.cheque && (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.chequeNumber}
                    </label>
                    <input
                      type="text"
                      name="chequeNumber"
                      value={formData.chequeNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.chequeDate}
                    </label>
                    <input
                      type="date"
                      name="chequeDate"
                      value={formData.chequeDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.description}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder={t.descriptionPlaceholder}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className={`w-full font-semibold py-3 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {t.recordPaymentBtn}
              </button>
            </form>

            {/* Payment History for Selected Sale */}
            {paymentHistory.length > 0 && (
              <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-semibold mb-4">{t.paymentHistory}</h3>
                <div className="space-y-3">
                  {paymentHistory.map(payment => (
                    <div key={payment.id} className={`flex justify-between items-start border-b pb-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div>
                        <p className="font-semibold">Rs. {formatCurrency(payment.amount)}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{payment.paymentMethod}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {new Date(payment.date).toLocaleString()}
                        </p>
                        {payment.description && (
                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{payment.description}</p>
                        )}
                      </div>
                      {isL2() && (
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                        >
                          {t.delete}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Credit Records */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-2xl font-bold">{t.activeCreditRecords}</h2>
            </div>

            <div className={`divide-y max-h-[800px] overflow-y-auto ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {creditRecords.length === 0 ? (
                <div className={`px-6 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t.noActiveCredits}
                </div>
              ) : (
                creditRecords.map((record) => (
                  <div
                    key={record.saleId}
                    className={`p-6 cursor-pointer transition-colors ${
                      selectedSale === record.saleId 
                        ? darkMode ? 'bg-blue-900' : 'bg-blue-50'
                        : darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSaleSelect(record.saleId)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{record.customerName}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{record.phoneNumber}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t.saleId}: {record.saleId}</p>
                      </div>
                      <span className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        Rs. {formatCurrency(record.balance)}
                      </span>
                    </div>
                    <div className={`mt-2 flex justify-between text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>
                        {t.total}: Rs. {formatCurrency(record.totalAmount)}
                      </span>
                      <span>
                        {t.paid}: Rs. {formatCurrency(record.amountPaid)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${(record.amountPaid / record.totalAmount) * 100}%`,
                          }}
                        />
                      </div>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {((record.amountPaid / record.totalAmount) * 100).toFixed(1)}% {t.paidPercentage}
                      </p>
                    </div>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t.date}: {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPage;