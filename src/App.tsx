import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DeviceProvider } from './contexts/DeviceContext';
import DeviceList from './components/DeviceList';
import DeviceForm from './components/DeviceForm';

const App: React.FC = () => {
  return (
    <DeviceProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">IT Inventory Management</h1>
              <nav>
                <ul className="flex space-x-4">
                  <li>
                    <Link to="/" className="text-blue-600 hover:text-blue-800">
                      Devices
                    </Link>
                  </li>
                  <li>
                    <Link to="/add-device" className="text-blue-600 hover:text-blue-800">
                      Add Device
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<DeviceList />} />
              <Route path="/add-device" element={<DeviceForm />} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-gray-200 mt-8">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} IT Inventory Management System. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </DeviceProvider>
  );
};

export default App;
