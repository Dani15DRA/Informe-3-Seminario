const db = require('../config/db');

const createSupplier = async (req, res) => {
  const { name, contact_person, email, phone, address } = req.body;
  
  try {
    const [result] = await db.execute(
      'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, contact_person, email, phone, address]
    );
    res.status(201).json({ id: result.insertId, message: 'Proveedor creado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const [suppliers] = await db.execute('SELECT * FROM suppliers ORDER BY name');
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
};

const getSupplierById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [[supplier]] = await db.execute('SELECT * FROM suppliers WHERE id = ?', [id]);
    if (!supplier) return res.status(404).json({ message: 'Proveedor no encontrado' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener proveedor' });
  }
};

const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, contact_person, email, phone, address } = req.body;
  
  try {
    const [result] = await db.execute(
      'UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, contact_person, email, phone, address, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json({ message: 'Proveedor actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar proveedor' });
  }
};

const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.execute('DELETE FROM suppliers WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar proveedor' });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};