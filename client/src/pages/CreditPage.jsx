// src/pages/CreditPage.jsx
import React, { useState, useEffect } from 'react';
import { creditAPI, salesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    fetchCreditRecords();
  }, []);

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
      setError('Please select a sale');
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
      setSuccess('Payment recorded successfully!');

      // Reset form
      setFormData({
        amount: '',
        paymentMethod: 'Cash',
        description: '',
        chequeNumber: '',
        chequeDate: '',
      });
      setSelectedSale('');
      setPaymentHistory([]);

      // Refresh data
      fetchCreditRecords();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record payment');
      console.error(err);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!isL2()) {
      setError('Only L2 users can delete payments');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      await creditAPI.deletePayment(paymentId);
      setSuccess('Payment deleted successfully!');
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedRecord = creditRecords.find(r => r.saleId === selectedSale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Total Outstanding</p>
            <p className="text-3xl font-bold text-red-600">${getTotalBalance().toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Active Credits</p>
            <p className="text-3xl font-bold text-gray-900">{creditRecords.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">
              ${creditRecords.reduce((sum, r) => sum + r.totalAmount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Payment</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Sale *
              </label>
              <select
                value={selectedSale}
                onChange={(e) => handleSaleSelect(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">-- Select a Sale --</option>
                {creditRecords.map(record => (
                  <option key={record.saleId} value={record.saleId}>
                    {record.saleId} - {record.customerName} (Balance: ${record.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {selectedRecord && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Sale Details</p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Customer:</strong> {selectedRecord.customerName}</p>
                  <p><strong>Phone:</strong> {selectedRecord.phoneNumber}</p>
                  <p><strong>Total:</strong> ${selectedRecord.totalAmount.toFixed(2)}</p>
                  <p><strong>Paid:</strong> ${selectedRecord.amountPaid.toFixed(2)}</p>
                  <p><strong>Balance:</strong> ${selectedRecord.balance.toFixed(2)}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount *
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Cheque</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            {formData.paymentMethod === 'Cheque' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cheque Number
                  </label>
                  <input
                    type="text"
                    name="chequeNumber"
                    value={formData.chequeNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cheque Date
                  </label>
                  <input
                    type="date"
                    name="chequeDate"
                    value={formData.chequeDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Add any notes about this payment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Record Payment
            </button>
          </form>

          {/* Payment History for Selected Sale */}
          {paymentHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                {paymentHistory.map(payment => (
                  <div key={payment.id} className="flex justify-between items-start border-b pb-3">
                    <div>
                      <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.date).toLocaleString()}
                      </p>
                      {payment.description && (
                        <p className="text-xs text-gray-600 mt-1">{payment.description}</p>
                      )}
                    </div>
                    {isL2() && (
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Credit Records */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Active Credit Records</h2>
          </div>

          <div className="divide-y divide-gray-200 max-h-[800px] overflow-y-auto">
            {creditRecords.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No active credit records found.
              </div>
            ) : (
              creditRecords.map((record) => (
                <div
                  key={record.saleId}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedSale === record.saleId ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSaleSelect(record.saleId)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{record.customerName}</p>
                      <p className="text-sm text-gray-600">{record.phoneNumber}</p>
                      <p className="text-xs text-gray-500">Sale ID: {record.saleId}</p>
                    </div>
                    <span className="text-xl font-bold text-red-600">
                      ${record.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-600">
                      Total: ${record.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-gray-600">
                      Paid: ${record.amountPaid.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(record.amountPaid / record.totalAmount) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((record.amountPaid / record.totalAmount) * 100).toFixed(1)}% paid
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Date: {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPage;