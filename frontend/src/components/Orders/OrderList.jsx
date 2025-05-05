import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders } from '../../services/api';
import { 
  FiPlus, FiSearch, FiEye, FiEdit, FiTruck, 
  FiCheckCircle, FiClock, FiAlertCircle, FiXCircle 
} from 'react-icons/fi';
import Navbar from './../Navbar'; 

const statusIcons = {
  pendiente: <FiClock className="text-yellow-500" />,
  aprobada: <FiCheckCircle className="text-blue-500" />,
  en_proceso: <FiTruck className="text-indigo-500" />,
  parcial: <FiAlertCircle className="text-orange-500" />,
  completada: <FiCheckCircle className="text-green-500" />,
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

const OrderList = ({ isAdmin }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders(statusFilter);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? 'Gestión de Órdenes de Compra' : 'Mis Órdenes de Compra'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Lista de todas las órdenes de compra' : 'Lista de tus órdenes de compra'}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar órdenes..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <Link
              to="/orders/new"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              Nueva Orden
            </Link>
          )}
        </div>
      </div>

      <div className="flex mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${!statusFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Todas
        </button>
        {Object.entries(statusIcons).map(([status, icon]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg mr-2 flex items-center whitespace-nowrap ${statusFilter === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <span className="mr-2">{icon}</span>
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || statusFilter 
              ? 'No se encontraron órdenes que coincidan con los filtros' 
              : 'No hay órdenes registradas'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega Esperada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creada Por</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.supplier_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.expected_delivery_date 
                        ? new Date(order.expected_delivery_date).toLocaleDateString() 
                        : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                        <span className="mr-1">{statusIcons[order.status]}</span>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.created_by_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                      >
                        <FiEye className="mr-1" /> Ver
                      </Link>
                      {isAdmin && (
                        <Link
                          to={`/orders/${order.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                        >
                          <FiEdit className="mr-1" /> Editar
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default OrderList;