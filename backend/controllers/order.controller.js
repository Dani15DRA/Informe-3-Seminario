const db = require('../config/db');

const generateOrderNumber = async (conn) => {
  try {
    const year = new Date().getFullYear();
    const [result] = await conn.execute(
      'SELECT COUNT(*) as count FROM purchase_orders WHERE YEAR(order_date) = ?',
      [year]
    );
    const sequence = result[0].count + 1;
    return `OC-${year}-${sequence.toString().padStart(4, '0')}`;
  } catch (err) {
    console.error('Error generating order number:', err);
    throw err;
  }
};

const createOrder = async (req, res) => {
  const { supplier_id, expected_delivery_date, items, notes } = req.body;
  
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    
    // Validación básica
    if (!supplier_id || !items || items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Supplier ID y al menos un item son requeridos' });
    }

    // Convertir datos
    const supplierId = parseInt(supplier_id);
    const processedItems = items.map(item => ({
      product_id: parseInt(item.product_id),
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price)
    }));

    // Validación adicional
    if (isNaN(supplierId)) {
      await conn.rollback();
      return res.status(400).json({ message: 'Supplier ID inválido' });
    }

    for (const item of processedItems) {
      if (isNaN(item.product_id) || isNaN(item.quantity) || isNaN(item.unit_price)) {
        await conn.rollback();
        return res.status(400).json({ message: 'Datos de items inválidos' });
      }
    }

    // Generar número de orden
    const order_number = await generateOrderNumber(conn);
    
    // Crear la orden
    const [orderResult] = await conn.execute(
      'INSERT INTO purchase_orders (order_number, supplier_id, order_date, expected_delivery_date, notes, created_by) VALUES (?, ?, CURDATE(), ?, ?, ?)',
      [order_number, supplierId, expected_delivery_date, notes || null, req.user.id]
    );
    const orderId = orderResult.insertId;
    
    // Insertar items
    for (const item of processedItems) {
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.unit_price]
      );
    }
    
    // Registrar estado inicial
    await conn.execute(
      'INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES (?, "pendiente", ?, "Creación de orden")',
      [orderId, req.user.id]
    );
    
    await conn.commit();
    res.status(201).json({ 
      id: orderId, 
      order_number, 
      message: 'Orden creada exitosamente' 
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error creating order:', {
      message: err.message,
      stack: err.stack,
      sqlMessage: err.sqlMessage,
      sql: err.sql
    });
    res.status(500).json({ 
      message: 'Error al crear orden',
      error: err.message,
      sqlError: err.sqlMessage 
    });
  } finally {
    if (conn) conn.release();
  }
};

const getOrders = async (req, res) => {
  const { status } = req.query;
  const isAdmin = req.user.role === 'admin';
  
  try {
    let query = `
      SELECT o.*, s.name as supplier_name, u.name as created_by_name 
      FROM purchase_orders o
      JOIN suppliers s ON o.supplier_id = s.id
      JOIN users u ON o.created_by = u.id
    `;
    const params = [];
    
    if (!isAdmin) {
      query += ' WHERE o.created_by = ?';
      params.push(req.user.id);
    }
    
    if (status) {
      query += isAdmin ? ' WHERE o.status = ?' : ' AND o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.order_date DESC, o.id DESC';
    
    const [orders] = await db.execute(query, params);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ 
      message: 'Error al obtener órdenes',
      error: err.message 
    });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';
  
  try {
    let query = `
      SELECT o.*, s.name as supplier_name, s.contact_person, s.email as supplier_email, 
             s.phone as supplier_phone, u.name as created_by_name, u.email as created_by_email
      FROM purchase_orders o
      JOIN suppliers s ON o.supplier_id = s.id
      JOIN users u ON o.created_by = u.id
      WHERE o.id = ?
    `;
    const params = [id];
    
    if (!isAdmin) {
      query += ' AND o.created_by = ?';
      params.push(req.user.id);
    }
    
    const [[order]] = await db.execute(query, params);
    
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Obtener items de la orden
    const [items] = await db.execute(`
      SELECT oi.*, p.name as product_name, p.unit 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);
    
    // Obtener historial de estados
    const [history] = await db.execute(`
      SELECT h.*, u.name as changed_by_name 
      FROM order_status_history h
      JOIN users u ON h.changed_by = u.id
      WHERE h.order_id = ?
      ORDER BY h.created_at DESC
    `, [id]);
    
    res.json({ ...order, items, history });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ 
      message: 'Error al obtener orden',
      error: err.message 
    });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status es requerido' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    
    // Verificar que la orden existe y obtener estado actual
    const [[order]] = await conn.execute(
      'SELECT status FROM purchase_orders WHERE id = ?',
      [id]
    );
    
    if (!order) {
      await conn.rollback();
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Actualizar estado de la orden
    await conn.execute(
      'UPDATE purchase_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    
    // Registrar cambio de estado
    await conn.execute(
      'INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
      [id, status, req.user.id, notes || `Cambio de estado de ${order.status} a ${status}`]
    );
    
    await conn.commit();
    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error updating status:', err);
    res.status(500).json({ 
      message: 'Error al actualizar estado',
      error: err.message 
    });
  } finally {
    if (conn) conn.release();
  }
};

const updateReceivedItems = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Se requieren items' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    
    // Verificar que la orden existe
    const [[order]] = await conn.execute(
      'SELECT id, status FROM purchase_orders WHERE id = ?',
      [id]
    );
    
    if (!order) {
      await conn.rollback();
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Actualizar cantidades recibidas
    for (const item of items) {
      if (!item.id || item.received_quantity === undefined) {
        await conn.rollback();
        return res.status(400).json({ message: 'Cada item requiere id y received_quantity' });
      }
      
      await conn.execute(
        'UPDATE order_items SET received_quantity = ? WHERE id = ? AND order_id = ?',
        [item.received_quantity, item.id, id]
      );
    }
    
    // Verificar estado de recepción
    const [[receiptStatus]] = await conn.execute(`
      SELECT 
        SUM(quantity) as total_ordered,
        SUM(received_quantity) as total_received
      FROM order_items
      WHERE order_id = ?
    `, [id]);
    
    // Determinar nuevo estado
    let newStatus = order.status;
    if (receiptStatus.total_received >= receiptStatus.total_ordered) {
      newStatus = 'completada';
    } else if (receiptStatus.total_received > 0) {
      newStatus = 'parcial';
    }
    
    // Actualizar estado si cambió
    if (newStatus !== order.status) {
      await conn.execute(
        'UPDATE purchase_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, id]
      );
      
      await conn.execute(
        'INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
        [id, newStatus, req.user.id, 'Actualización por recepción de items']
      );
    }
    
    await conn.commit();
    res.json({ message: 'Recepción registrada exitosamente' });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error updating received items:', err);
    res.status(500).json({ 
      message: 'Error al registrar recepción',
      error: err.message 
    });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateReceivedItems
};