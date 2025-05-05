import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const UserDashboard = () => {
  const [userStats, setUserStats] = useState({
    totalOrders: 8,
    pending: 2,
    inProcess: 1,
    completed: 5
  });

  const recentOrders = [
    { id: 1, number: 'OC-2023-0025', supplier: 'Proveedor A', date: '2023-05-15', status: 'completada' },
    { id: 2, number: 'OC-2023-0028', supplier: 'Proveedor B', date: '2023-05-18', status: 'en_proceso' },
    { id: 3, number: 'OC-2023-0030', supplier: 'Proveedor C', date: '2023-05-20', status: 'pendiente' }
  ];

  const statusIcons = {
    pendiente: <FiClock className="text-yellow-500" />,
    en_proceso: <FiAlertCircle className="text-blue-500" />,
    completada: <FiCheckCircle className="text-green-500" />
  };

  const statusColors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    en_proceso: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta de Órdenes Totales */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Mis Órdenes</p>
                <p className="text-2xl font-semibold text-gray-800">{userStats.totalOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <FiShoppingCart className="h-6 w-6" />
              </div>
            </div>
            <Link 
              to="/orders" 
              className="mt-4 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              Ver mis órdenes
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Tarjeta de Pendientes */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-800">{userStats.pending}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FiClock className="h-6 w-6" />
              </div>
            </div>
            <Link 
              to="/orders?status=pendiente" 
              className="mt-4 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              Ver pendientes
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Tarjeta de Completadas */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completadas</p>
                <p className="text-2xl font-semibold text-gray-800">{userStats.completed}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiCheckCircle className="h-6 w-6" />
              </div>
            </div>
            <Link 
              to="/orders?status=completada" 
              className="mt-4 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              Ver completadas
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Sección de Órdenes Recientes */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Mis Órdenes Recientes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.number}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {order.supplier}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${statusColors[order.status]}`}>
                        {statusIcons[order.status]}
                        <span className="ml-1">{order.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Link 
              to="/orders" 
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Ver todas mis órdenes →
            </Link>
          </div>
        </div>

        {/* Sección de Acciones Rápidas */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/orders/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <FiShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Crear Orden</h3>
                <p className="text-sm text-gray-500">Solicitar nueva orden de compra</p>
              </div>
            </Link>
            <Link
              to="/orders?status=pendiente"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FiClock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Ver Pendientes</h3>
                <p className="text-sm text-gray-500">Revisar órdenes en proceso</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;