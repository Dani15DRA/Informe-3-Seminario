import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createOrder, 
  getOrderById, 
  updateOrderStatus, 
  updateReceivedItems,
  getSuppliers, 
  getProducts 
} from '../../services/api';
import { 
  FiSave, FiPlus, FiTrash2, FiTruck, FiCheck, FiX,
  FiCalendar, FiUser, FiPackage, FiDollarSign 
} from 'react-icons/fi';
import Navbar from '../Navbar';

const statusOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' }
];

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobada: 'bg-blue-100 text-blue-800',
  en_proceso: 'bg-indigo-100 text-indigo-800',
  parcial: 'bg-orange-100 text-orange-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800'
};

const OrderForm = ({ isAdmin, isEdit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState(null);
  const [order, setOrder] = useState({
    supplier_id: '',
    expected_delivery_date: '',
    notes: '',
    items: [{ product_id: '', quantity: 1, unit_price: 0 }]
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, productsData] = await Promise.all([
          getSuppliers(),
          getProducts()
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);

        if (isEdit && id) {
          const orderData = await getOrderById(id);
          setOrder({
            ...orderData,
            items: orderData.items.map(item => ({
              ...item,
              received_quantity: item.received_quantity || 0
            }))
          });
          setStatusUpdate({
            status: orderData.status,
            notes: ''
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ text: 'Error al cargar datos', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setOrder(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [name]: name === 'product_id' ? value : Number(value)
      };
      return { ...prev, items: newItems };
    });
  };

  const handleReceivedChange = (index, e) => {
    const { value } = e.target;
    setOrder(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        received_quantity: Number(value)
      };
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setOrder(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index) => {
    setOrder(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Preparar datos para enviar
      const orderData = {
        supplier_id: order.supplier_id,
        expected_delivery_date: order.expected_delivery_date,
        notes: order.notes,
        items: order.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };

      if (isEdit) {
        // Lógica para edición si es necesario
        navigate('/orders');
      } else {
        const createdOrder = await createOrder(orderData);
        setMessage({ text: 'Orden creada exitosamente', type: 'success' });
        setTimeout(() => {
          navigate(`/orders/${createdOrder.id}`);
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Error al guardar la orden';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateOrderStatus(id, statusUpdate);
      setMessage({ text: 'Estado actualizado exitosamente', type: 'success' });
      
      // Refrescar datos
      const orderData = await getOrderById(id);
      setOrder({
        ...orderData,
        items: orderData.items.map(item => ({
          ...item,
          received_quantity: item.received_quantity || 0
        }))
      });
      setStatusUpdate(prev => ({ ...prev, notes: '' }));
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Error al actualizar estado', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReceiveItems = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateReceivedItems(id, order.items);
      setMessage({ text: 'Recepción registrada exitosamente', type: 'success' });
      
      // Refrescar datos
      const orderData = await getOrderById(id);
      setOrder({
        ...orderData,
        items: orderData.items.map(item => ({
          ...item,
          received_quantity: item.received_quantity || 0
        }))
      });
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Error al registrar recepción', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? `Orden #${order.order_number}` : 'Nueva Orden de Compra'}
      </h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' 
          ? 'bg-green-50 text-green-700 border border-green-200' 
          : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="supplier_id"
                value={order.supplier_id}
                onChange={handleInputChange}
                required
                disabled={isEdit}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccione un proveedor</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Entrega Esperada
            </label>
            <div className="relative">
              <input
                type="date"
                name="expected_delivery_date"
                value={order.expected_delivery_date}
                onChange={handleInputChange}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            name="notes"
            value={order.notes}
            onChange={handleInputChange}
            rows={3}
            className="block w-full pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-800">Items</h2>
            {!isEdit && (
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <FiPlus className="mr-1" /> Agregar Item
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  {isEdit && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recibido</th>
                  )}
                  {!isEdit && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item, index) => {
                  const product = products.find(p => p.id == item.product_id);
                  const total = item.quantity * item.unit_price;
                  return (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <select
                          name="product_id"
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, e)}
                          required
                          disabled={isEdit}
                          className="block w-full pl-2 pr-8 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Seleccione un producto</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          name="quantity"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          required
                          disabled={isEdit}
                          className="block w-full pl-2 pr-8 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          name="unit_price"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, e)}
                          required
                          disabled={isEdit}
                          className="block w-full pl-2 pr-8 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${total.toFixed(2)}
                      </td>
                      {isEdit && (
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            step="1"
                            value={item.received_quantity}
                            onChange={(e) => handleReceivedChange(index, e)}
                            className="block w-full pl-2 pr-8 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      )}
                      {!isEdit && (
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {!isEdit && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Guardar Orden
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {isEdit && isAdmin && (
        <>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Actualizar Estado</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Estado
                </label>
                <select
                  name="status"
                  value={statusUpdate.status}
                  onChange={handleStatusChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  name="notes"
                  value={statusUpdate.notes}
                  onChange={handleStatusChange}
                  rows={2}
                  className="block w-full pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" /> Actualizar Estado
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Registrar Recepción</h2>
            <form onSubmit={handleReceiveItems} className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FiTruck className="mr-2" /> Registrar Recepción
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {isEdit && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Historial de Estados</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.history?.map((record, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${statusColors[record.status]}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {record.changed_by_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {record.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default OrderForm;