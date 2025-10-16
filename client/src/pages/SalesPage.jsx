// src/pages/SalesPage.jsx
import React, { useState, useEffect } from 'react';
import { salesAPI, inventoryAPI } from '../services/api';

const SalesPage = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    paymentMethod: 'Cash',
    amountPaid: '0',
  });
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new-sale');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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

  const addToCart = (item) => {
    const existingItem = cartItems.find(ci => ci.itemId === item.id);
    
    if (existingItem) {
      if (existingItem.quantitySold >= item.quantity) {
        setError(`Cannot add more. Only ${item.quantity} available in stock.`);
        return;
      }
      setCartItems(cartItems.map(ci =>
        ci.itemId === item.id
          ? { ...ci, quantitySold: ci.quantitySold + 1 }
          : ci
      ));
    } else {
      if (item.quantity < 1) {
        setError('Item out of stock');
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
    setError('');
  };

  const updateCartItemQty = (itemId, newQty) => {
    const item = cartItems.find(ci => ci.itemId === itemId);
    if (newQty > item.availableQty) {
      setError(`Only ${item.availableQty} available in stock`);
      return;
    }
    if (newQty < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(cartItems.map(ci =>
      ci.itemId === itemId ? { ...ci, quantitySold: newQty } : ci
    ));
    setError('');
  };

  const updateCartItemPrice = (itemId, newPrice) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price');
      return;
    }
    setCartItems(cartItems.map(ci =>
      ci.itemId === itemId ? { ...ci, sellingPrice: price } : ci
    ));
    setError('');
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(ci => ci.itemId !== itemId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantitySold * item.sellingPrice), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (cartItems.length === 0) {
      setError('Please add at least one item to the cart');
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
      setSuccess('Sale recorded successfully!');
      
      printBill(response.data);

      setFormData({
        customerName: '',
        phoneNumber: '',
        paymentMethod: 'Cash',
        amountPaid: '0',
      });
      setCartItems([]);
      
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record sale');
      console.error(err);
    }
  };

  const printBill = (saleData) => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${saleData.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
              color: #000;
              background: #fff;
            }
            
            .header { 
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              margin-bottom: 5px;
            }
            
            .company-address {
              font-size: 12px;
              margin: 5px 0;
            }
            
            .contact-info {
              font-size: 11px;
              margin: 5px 0;
            }
            
            .invoice-title {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
              text-decoration: underline;
            }
            
            .info-section { 
              margin: 20px 0;
              border: 1px solid #000;
              padding: 10px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 12px;
            }
            
            .info-label {
              font-weight: bold;
              min-width: 120px;
            }
            
            table { 
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              border: 2px solid #000;
            }
            
            th, td { 
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            
            th { 
              background-color: #e0e0e0;
              font-weight: bold;
              text-align: center;
            }
            
            td.center {
              text-align: center;
            }
            
            td.right {
              text-align: right;
            }
            
            .totals { 
              margin-top: 20px;
              border: 2px solid #000;
              padding: 15px;
            }
            
            .totals-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              font-size: 13px;
            }
            
            .totals-row.total {
              font-size: 16px;
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            
            .warranty-section {
              margin-top: 30px;
              border: 2px dashed #000;
              padding: 15px;
              text-align: center;
            }
            
            .warranty-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              text-decoration: underline;
            }
            
            .warranty-text {
              font-size: 11px;
              line-height: 1.6;
            }
            
            .footer { 
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #000;
              font-size: 12px;
            }
            
            .thank-you {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .print-button {
              margin-top: 15px;
              padding: 10px 20px;
              font-size: 14px;
              background-color: #000;
              color: #fff;
              border: none;
              cursor: pointer;
            }
            
            @media print { 
              .print-button { 
                display: none;
              }
              body {
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">LSP SEWING MACHINES</div>
            <div class="company-address">Badagamuwa, Thorayaya, Kurunegala</div>
            <div class="contact-info">Phone: 0764855091 / 0753751536 | Email: ispemboidery@gmail.com</div>
            <div class="invoice-title">SALES INVOICE</div>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Invoice No:</span>
              <span>${saleData.id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span>${new Date(saleData.date).toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Customer Name:</span>
              <span>${saleData.customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone Number:</span>
              <span>${saleData.phoneNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span>${saleData.paymentMethod}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 10%;">No.</th>
                <th style="width: 40%;">Item Description</th>
                <th style="width: 15%;">Qty</th>
                <th style="width: 17.5%;">Unit Price</th>
                <th style="width: 17.5%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${saleData.items.map((item, index) => {
                const itemTotal = item.quantitySold * item.pricePerItem;
                const itemDescription = item.modelNumber 
                  ? `${item.itemName} - ${item.modelNumber}`
                  : item.itemName;
                return `
                  <tr>
                    <td class="center">${index + 1}</td>
                    <td>${itemDescription}</td>
                    <td class="center">${item.quantitySold}</td>
                    <td class="right">Rs. ${item.pricePerItem.toFixed(2)}</td>
                    <td class="right">Rs. ${itemTotal.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Total Amount:</span>
              <span>Rs. ${saleData.totalAmount.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Amount Paid:</span>
              <span>Rs. ${saleData.amountPaid.toFixed(2)}</span>
            </div>
            <div class="totals-row total">
              <span>Balance Due:</span>
              <span>Rs. ${saleData.balance.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Payment Status:</span>
              <span>${saleData.creditStatus}</span>
            </div>
          </div>

          <div class="warranty-section">
            <div class="warranty-title">*** WARRANTY INFORMATION ***</div>
            <div class="warranty-text">
              This product comes with a 1 YEAR WARRANTY from the date of purchase.<br>
              Warranty covers manufacturing defects and parts replacement.<br>
              Please keep this invoice for warranty claims.<br>
              For service and support, contact us at the numbers above.
            </div>
          </div>

          <div class="footer">
            <div class="thank-you">Thank You for Your Business!</div>
            <div>Visit us again for quality sewing machines and service</div>
            <button class="print-button" onclick="window.print()">PRINT INVOICE</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.phoneNumber.includes(searchTerm) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      new Date(sale.date).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('new-sale')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'new-sale'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            New Sale
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sales History
          </button>
        </div>
      </div>

      {activeTab === 'new-sale' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">New Sale</h2>

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
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option>Cash</option>
                    <option>Card</option>
                    <option>Credit</option>
                    <option>Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold">Rs. {calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Balance:</span>
                    <span className="text-xl font-bold text-red-600">
                      Rs. {(calculateTotal() - parseFloat(formData.amountPaid || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Record Sale & Print Bill
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cart ({cartItems.length})</h3>
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in cart</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.itemId} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold">{item.itemName}</p>
                          <p className="text-sm text-gray-500">
                            Original: Rs. {item.originalPrice.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.itemId)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartItemQty(item.itemId, item.quantitySold - 1)}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantitySold}</span>
                            <button
                              onClick={() => updateCartItemQty(item.itemId, item.quantitySold + 1)}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Price (Rs.)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.sellingPrice}
                            onChange={(e) => updateCartItemPrice(item.itemId, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="font-bold text-primary">
                          Rs. {(item.quantitySold * item.sellingPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Available Items</h3>
            <div className="space-y-3 max-h-[800px] overflow-y-auto">
              {inventory.filter(item => item.quantity > 0).map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                      <p className="text-sm text-gray-500">{item.modelNumber}</p>
                    </div>
                    <span className="text-lg font-bold text-primary">Rs. {item.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock: {item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales History</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search (Customer, Phone, Invoice ID)
                </label>
                <input
                  type="text"
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {(searchTerm || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                }}
                className="mt-3 text-sm text-primary hover:text-secondary font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Invoice ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Paid</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500">
                      No sales found
                    </td>
                  </tr>
                ) : (
                  filteredSales.map(sale => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                      <td className="py-3 px-4 text-sm text-right font-semibold text-red-600">
                        Rs. {sale.balance.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          sale.creditStatus === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : sale.creditStatus === 'Partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sale.creditStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => printBill(sale)}
                          className="text-primary hover:text-secondary font-semibold text-sm"
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredSales.length} of {sales.length} sales
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;