import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import OrderList from './components/Orders/OrderList';
import OrderForm from './components/Orders/OrderForm';
import Dashboard from './components/Dashboard/Dashboard';
import SupplierList from './components/Suppliers/SupplierList';
import ProductList from './components/Products/ProductList';

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
  });

  const isAdmin = auth.role === 'admin';

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard isAdmin={isAdmin} />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrderList isAdmin={isAdmin} />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/new"
          element={
            <PrivateRoute>
              {isAdmin ? <OrderForm isAdmin={isAdmin} /> : <Navigate to="/orders" />}
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <PrivateRoute>
              <OrderForm isAdmin={isAdmin} isEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/:id/edit"
          element={
            <PrivateRoute>
              {isAdmin ? <OrderForm isAdmin={isAdmin} isEdit /> : <Navigate to="/orders" />}
            </PrivateRoute>
          }
        />
        {/* Nuevas rutas para proveedores y productos */}
        <Route
          path="/suppliers"
          element={
            <PrivateRoute>
              {isAdmin ? <SupplierList /> : <Navigate to="/" />}
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              {isAdmin ? <ProductList /> : <Navigate to="/" />}
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              {isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;