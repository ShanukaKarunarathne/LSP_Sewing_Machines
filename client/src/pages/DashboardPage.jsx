import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI, expensesAPI, inventoryAPI, creditAPI } from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    todaySales: 0,
    todayExpenses: 0,
    totalInventoryValue: 0,
    activeCreditCount: 0,
    todaySalesCount: 0,
    recentSales: [],
    recentExpenses: [],
    lowStockItems: [],
    loading: true,
  });

  const translations = {
    en: {
      todaySales: "Today's Sales",
      todayExpenses: "Today's Expenses",
      itemsSold: 'items sold',
      quickActions: 'Quick Actions',
      addItems: 'Add Items',
      bill: 'Bill',
      addExpense: 'Add Expense',
      viewReports: 'View Reports',
      viewCredit: 'View Credit',
      recentSales: 'Recent Sales',
      recentExpenses: 'Recent Expenses',
      lowStockAlerts: 'Low Stock Alerts',
      date: 'Date',
      customer: 'Customer',
      item: 'Item',
      amount: 'Amount',
      category: 'Category',
      description: 'Description',
      model: 'Model',
      quantity: 'Quantity',
      noRecentSales: 'No recent sales',
      noRecentExpenses: 'No recent expenses',
      noLowStock: 'No low stock items',
      viewAllSales: 'View All Sales',
      viewAllExpenses: 'View All Expenses',
      manageInventory: 'Manage Inventory',
      loading: 'Loading dashboard...',
    },
    si: {
      todaySales: 'අද විකුණුම්',
      todayExpenses: 'අද වියදම්',
      itemsSold: 'භාණ්ඩ විකුණා ඇත',
      quickActions: 'ඉක්මන් ක්‍රියා',
      addItems: 'භාණ්ඩ එකතු කරන්න',
      bill: 'බිල්පත',
      addExpense: 'වියදම් එකතු කරන්න',
      viewReports: 'වාර්තා බලන්න',
      viewCredit: 'ණය බලන්න',
      recentSales: 'මෑත විකුණුම්',
      recentExpenses: 'මෑත වියදම්',
      lowStockAlerts: 'අඩු තොග අනතුරු ඇඟවීම්',
      date: 'දිනය',
      customer: 'පාරිභෝගික',
      item: 'භාණ්ඩය',
      amount: 'මුදල',
      category: 'කාණ්ඩය',
      description: 'විස්තරය',
      model: 'ආකෘතිය',
      quantity: 'ප්‍රමාණය',
      noRecentSales: 'මෑත විකුණුම් නැත',
      noRecentExpenses: 'මෑත වියදම් නැත',
      noLowStock: 'අඩු තොග භාණ්ඩ නැත',
      viewAllSales: 'සියලු විකුණුම් බලන්න',
      viewAllExpenses: 'සියලු වියදම් බලන්න',
      manageInventory: 'තොග කළමනාකරණය',
      loading: 'උපකරණ පුවරුව පූරණය වෙමින්...',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchDashboardData();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('language') || 'en';
    setDarkMode(savedDarkMode);
    setLanguage(savedLanguage);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [salesRes, expensesRes, inventoryRes, creditRes, todaySalesRes, todayExpensesRes] = await Promise.all([
        salesAPI.getAll().catch(() => ({ data: [] })),
        expensesAPI.getAll().catch(() => ({ data: [] })),
        inventoryAPI.readAll().catch(() => ({ data: [] })),
        creditAPI.getAllActive().catch(() => ({ data: [] })),
        salesAPI.getByDate(today).catch(() => ({ data: { sales: [], total_sales: 0 } })),
        expensesAPI.getByDate(today).catch(() => ({ data: { expenses: [], total_expenses: 0 } })),
      ]);

      const allSales = Array.isArray(salesRes.data) ? salesRes.data : [];
      const allExpenses = Array.isArray(expensesRes.data) ? expensesRes.data : [];
      const inventoryData = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];

      const totalSales = allSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const totalExpenses = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const todaySales = todaySalesRes.data.total_sales || 0;
      const todayExpenses = todayExpensesRes.data.total_expenses || 0;
      
      // Count today's items sold
      const todaySalesList = todaySalesRes.data.sales || [];
      const todaySalesCount = todaySalesList.reduce((sum, sale) => {
        return sum + (sale.items || []).reduce((itemSum, item) => itemSum + (item.quantitySold || 0), 0);
      }, 0);

      const totalInventoryValue = inventoryData.reduce(
        (sum, item) => sum + (item.quantity * item.purchasePrice || 0), 
        0
      );

      const activeCreditCount = creditRes.data.length || 0;

      // Get recent sales (last 5)
    // Get recent sales (last 5)
    const recentSales = allSales
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(sale => {
            let itemDisplay = 'N/A';
            if (sale.items && sale.items.length > 0) {
            const firstItem = sale.items[0];
            itemDisplay = firstItem.modelNumber 
                ? `${firstItem.itemName} - ${firstItem.modelNumber}`
                : firstItem.itemName;
            }
            return {
            date: new Date(sale.date).toLocaleDateString(),
            customerName: sale.customerName,
            itemName: itemDisplay,
            totalAmount: sale.totalAmount,
            };
    });

      // Get recent expenses (last 5)
      const recentExpenses = allExpenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(exp => ({
          date: new Date(exp.date).toLocaleDateString(),
          category: exp.category,
          description: exp.description,
          amount: exp.amount,
        }));

      // Get low stock items (quantity <= 5)
      const lowStockItems = inventoryData
        .filter(item => item.quantity <= 5)
        .sort((a, b) => a.quantity - b.quantity)
        .map(item => ({
          name: item.itemName,
          modelNumber: item.modelNumber,
          quantity: item.quantity,
          isCritical: item.quantity <= 2,
        }));

      setStats({
        totalSales,
        totalExpenses,
        todaySales,
        todayExpenses,
        totalInventoryValue,
        activeCreditCount,
        todaySalesCount,
        recentSales,
        recentExpenses,
        lowStockItems,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'si' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  if (stats.loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto ${darkMode ? 'border-green-400' : 'border-indigo-600'}`}></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 backdrop-blur-lg bg-opacity-90`}>
          <div className="flex justify-between items-center py-4">
            <h1 className={`text-3xl font-bold bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-indigo-600 to-green-500'} bg-clip-text text-transparent`}>
              {t.dashboard}
            </h1>
            
            <div className="flex gap-2">
              <button
                onClick={toggleLanguage}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language === 'en' ? 'සිං' : 'EN'}
              </button>
              <button
                onClick={toggleDarkMode}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        <main className="py-6">
          {/* Today's Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`rounded-xl p-6 shadow-md ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.todaySales}
              </h3>
              <p className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Rs. {stats.todaySales.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.todaySalesCount} {t.itemsSold}
              </p>
            </div>

            <div className={`rounded-xl p-6 shadow-md ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.todayExpenses}
              </h3>
              <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Rs. {stats.todayExpenses.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="mb-8 text-center">
            <h3 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.quickActions}
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/inventory')}
                className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800'
                }`}
              >
                {t.addItems}
              </button>
              <button
                onClick={() => navigate('/sales')}
                className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800'
                }`}
              >
                {t.bill}
              </button>
              <button
                onClick={() => navigate('/expenses')}
                className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800'
                }`}
              >
                {t.addExpense}
              </button>
              <button
                onClick={() => navigate('/reports')}
                className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800'
                }`}
              >
                {t.viewReports}
              </button>
              <button
                onClick={() => navigate('/credit')}
                className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800'
                }`}
              >
                {t.viewCredit}
              </button>
            </div>
          </section>

          {/* Recent Activity Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Sales */}
            <section className={`rounded-xl p-6 shadow-md ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-semibold mb-4 pb-3 border-b ${darkMode ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'}`}>
                {t.recentSales}
              </h3>
              {stats.recentSales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400 bg-gray-700/50' : 'text-gray-600 bg-gray-50'}`}>
                        <th className="text-left py-3 px-3">{t.date}</th>
                        <th className="text-left py-3 px-3">{t.customer}</th>
                        <th className="text-left py-3 px-3">{t.item}</th>
                        <th className="text-right py-3 px-3">{t.amount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentSales.map((sale, index) => (
                        <tr key={index} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-200 hover:bg-indigo-50/30'} transition-colors`}>
                          <td className={`py-3 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{sale.date}</td>
                          <td className={`py-3 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{sale.customerName}</td>
                          <td className={`py-3 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{sale.itemName}</td>
                          <td className={`py-3 px-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Rs. {sale.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={`text-center py-12 italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t.noRecentSales}
                </p>
              )}
              <button
                onClick={() => navigate('/sales')}
                className={`mt-4 font-semibold transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
              >
                {t.viewAllSales} →
              </button>
            </section>

            {/* Recent Expenses */}
            <section className={`rounded-xl p-6 shadow-md ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-semibold mb-4 pb-3 border-b ${darkMode ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'}`}>
                {t.recentExpenses}
              </h3>
              {stats.recentExpenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400 bg-gray-700/50' : 'text-gray-600 bg-gray-50'}`}>
                        <th className="text-left py-3 px-3">{t.date}</th>
                        <th className="text-left py-3 px-3">{t.category}</th>
                        <th className="text-left py-3 px-3">{t.description}</th>
                        <th className="text-right py-3 px-3">{t.amount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentExpenses.map((expense, index) => (
                        <tr key={index} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-200 hover:bg-indigo-50/30'} transition-colors`}>
                          <td className={`py-3 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{expense.date}</td>
                          <td className={`py-3 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{expense.category}</td>
                          <td className={`py-3 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{expense.description}</td>
                          <td className={`py-3 px-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Rs. {expense.amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={`text-center py-12 italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t.noRecentExpenses}
                </p>
              )}
              <button
                onClick={() => navigate('/expenses')}
                className={`mt-4 font-semibold transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
              >
                {t.viewAllExpenses} →
              </button>
            </section>
          </div>

          {/* Low Stock Alerts */}
          <section className={`rounded-xl p-6 shadow-md ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-xl font-semibold mb-4 pb-3 border-b ${darkMode ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'}`}>
              {t.lowStockAlerts}
            </h3>
            {stats.lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400 bg-gray-700/50' : 'text-gray-600 bg-gray-50'}`}>
                      <th className="text-left py-3 px-3">{t.item}</th>
                      <th className="text-left py-3 px-3">{t.model}</th>
                      <th className="text-right py-3 px-3">{t.quantity}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockItems.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`border-b ${
                          item.isCritical 
                            ? darkMode 
                              ? 'bg-red-900/20 border-l-4 border-l-red-600 border-gray-700' 
                              : 'bg-red-50/50 border-l-4 border-l-red-500 border-gray-200'
                            : darkMode 
                              ? 'bg-yellow-900/20 border-l-4 border-l-yellow-600 border-gray-700' 
                              : 'bg-yellow-50/50 border-l-4 border-l-yellow-500 border-gray-200'
                        } hover:bg-opacity-75 transition-colors`}
                      >
                        <td className={`py-3 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.name}</td>
                        <td className={`py-3 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.modelNumber}</td>
                        <td className={`py-3 px-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={`text-center py-12 italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t.noLowStock}
              </p>
            )}
            <button
              onClick={() => navigate('/inventory')}
              className={`mt-4 font-semibold transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
            >
              {t.manageInventory} →
            </button>
          </section>

          {/* Footer */}
          <footer className={`text-center py-6 mt-8 border-t ${darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>
            <p>&copy; {new Date().getFullYear()} Pocket Boss</p>
            <p className="mt-1">Contact - 070-1272525</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;