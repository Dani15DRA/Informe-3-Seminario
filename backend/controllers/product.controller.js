const db = require('../config/db');

const createProduct = async (req, res) => {
  const { name, description, unit } = req.body;
  
  try {
    const [result] = await db.execute(
      'INSERT INTO products (name, description, unit) VALUES (?, ?, ?)',
      [name, description, unit]
    );
    res.status(201).json({ id: result.insertId, message: 'Producto creado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

const getProducts = async (req, res) => {
  try {
    const [products] = await db.execute('SELECT * FROM products ORDER BY name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [[product]] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, unit } = req.body;
  
  try {
    const [result] = await db.execute(
      'UPDATE products SET name = ?, description = ?, unit = ? WHERE id = ?',
      [name, description, unit, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};