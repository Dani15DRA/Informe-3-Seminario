import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../../services/api';
import { 
  FiClock, FiCheckCircle, FiTruck, FiAlertCircle, 
  FiCheck, FiXCircle, FiDollarSign, FiPackage 
} from 'react-icons/fi';
import Navbar from './../Navbar'; 

const Dashboard = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    recentOrders: []
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders = await getOrders();
        
        // Calcular estadísticas
        const byStatus = {};
        orders.forEach(order => {
          byStatus[order.status] = (byStatus[order.status] || 0) + 1;
        });
        
        // Filtrar órdenes recientes (solo las del usuario si no es admin)
        let recentOrders = [...orders]
          .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
          .slice(0, 5);
        
        if (!isAdmin) {
          const userId = localStorage.getItem('userId');
          recentOrders = recentOrders.filter(order => order.created_by == userId);
        }
        
        setStats({
          total: orders.length,
          byStatus,
          recentOrders
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAdmin]);

  const statusIcons = {
    pendiente: <FiClock className="text-yellow-500" />,
    aprobada: <FiCheckCircle className="text-blue-500" />,
    en_proceso: <FiTruck className="text-indigo-500" />,
    parcial: <FiAlertCircle className="text-orange-500" />,
    completada: <FiCheck className="text-green-500" />,
    cancelada: <FiXCircle className="text-red-500" />
  };

  const statusColors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    aprobada: 'bg-blue-100 text-blue-800',
    en_proceso: 'bg-indigo-100 text-indigo-800',
    parcial: 'bg-orange-100 text-orange-800',
    completada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar /> 
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tarjeta de Órdenes Totales */}
        <div 
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg cursor-pointer transition-shadow"
          onClick={() => navigate('/orders')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Órdenes Totales</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <FiPackage className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tarjetas de estados */}
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <div 
            key={status} 
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg cursor-pointer transition-shadow"
            onClick={() => navigate(`/orders?status=${status}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 capitalize">
                  {status.replace('_', ' ')}
                </p>
                <p className="text-2xl font-semibold text-gray-800">{count}</p>
              </div>
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                {statusIcons[status]}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sección de Órdenes Recientes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Órdenes Recientes</h2>
            <button 
              onClick={() => navigate('/orders')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Ver todas →
            </button>
          </div>
          
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay órdenes recientes</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map(order => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {order.supplier_name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${statusColors[order.status]}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sección de Acciones Rápidas */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders/new')}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                <FiPackage className="h-5 w-5" />
              </div>
              <span className="font-medium text-gray-800">Crear nueva orden</span>
            </button>
            
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate('/suppliers')}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <FiTruck className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-gray-800">Gestionar proveedores</span>
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                    <FiPackage className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-gray-800">Gestionar productos</span>
                </button>
              </>
            )}
            
            <button
              onClick={() => navigate('/orders?status=pendiente')}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                <FiClock className="h-5 w-5" />
              </div>
              <span className="font-medium text-gray-800">Ver órdenes pendientes</span>
            </button>
          </div>
        </div>
      </div>
      </div>
      </div>
    );
};

export default Dashboard;