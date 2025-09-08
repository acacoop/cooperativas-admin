const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de multer para upload de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'invoices');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicializar base de datos SQLite
const db = new sqlite3.Database('./cooperativas.db');

// Crear tablas si no existen
db.serialize(() => {
  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin_aca', 'operador_aca', 'admin_coop', 'proveedor')),
    cooperative_id INTEGER,
    full_name TEXT,
    company_name TEXT,
    cuit TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de cooperativas
  db.run(`CREATE TABLE IF NOT EXISTS cooperatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code INTEGER UNIQUE NOT NULL,
    cuit TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    votes INTEGER,
    substitutes INTEGER,
    car INTEGER,
    car_name TEXT,
    verification_code TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    president TEXT,
    secretary TEXT,
    treasurer TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de cambios pendientes (para aprobación)
  db.run(`CREATE TABLE IF NOT EXISTS pending_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cooperative_id INTEGER,
    user_id INTEGER,
    changes TEXT, -- JSON con los cambios propuestos
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    FOREIGN KEY (cooperative_id) REFERENCES cooperatives (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (reviewed_by) REFERENCES users (id)
  )`);

  // Tabla de facturas
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    issuer_cuit TEXT NOT NULL,
    receiver_cuit TEXT NOT NULL,
    cooperative_id INTEGER,
    supplier_id INTEGER,
    subtotal DECIMAL(12,2),
    iva_amount DECIMAL(12,2),
    total_amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pendiente_validacion',
    file_path TEXT,
    original_filename TEXT,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    validated_at DATETIME,
    sent_at DATETIME,
    responded_at DATETIME,
    FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id),
    FOREIGN KEY (supplier_id) REFERENCES users(id)
  )`);

  // Tabla de items de factura
  db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
  )`);
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rutas de autenticación
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error del servidor' });
    }

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        cooperative_id: user.cooperative_id 
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        cooperative_id: user.cooperative_id
      }
    });
  });
});

// Rutas de cooperativas
app.get('/api/cooperatives', authenticateToken, (req, res) => {
  let query = 'SELECT * FROM cooperatives WHERE status = "active"';
  let params = [];

  // Si es admin de cooperativa, solo puede ver la suya
  if (req.user.role === 'admin_coop') {
    query += ' AND id = ?';
    params.push(req.user.cooperative_id);
  }

  db.all(query, params, (err, cooperatives) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener cooperativas' });
    }
    res.json(cooperatives);
  });
});

app.get('/api/cooperatives/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Verificar permisos
  if (req.user.role === 'admin_coop' && req.user.cooperative_id != id) {
    return res.status(403).json({ error: 'Sin permisos para ver esta cooperativa' });
  }

  db.get('SELECT * FROM cooperatives WHERE id = ?', [id], (err, cooperative) => {
    if (err) {
      return res.status(500).json({ error: 'Error del servidor' });
    }
    if (!cooperative) {
      return res.status(404).json({ error: 'Cooperativa no encontrada' });
    }
    res.json(cooperative);
  });
});

// Actualizar cooperativa (con sistema de aprobación)
app.put('/api/cooperatives/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  // Verificar permisos
  if (req.user.role === 'admin_coop' && req.user.cooperative_id != id) {
    return res.status(403).json({ error: 'Sin permisos para editar esta cooperativa' });
  }

  if (req.user.role === 'admin_coop') {
    // Admin de cooperativa: crear solicitud de cambio
    db.run(
      'INSERT INTO pending_changes (cooperative_id, user_id, changes) VALUES (?, ?, ?)',
      [id, req.user.id, JSON.stringify(changes)],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al crear solicitud de cambio' });
        }
        res.json({ 
          message: 'Solicitud de cambio enviada para aprobación',
          change_id: this.lastID
        });
      }
    );
  } else {
    // Admin ACA: aplicar cambios directamente
    const fields = Object.keys(changes).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(changes), id];

    db.run(
      `UPDATE cooperatives SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values,
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al actualizar cooperativa' });
        }
        res.json({ message: 'Cooperativa actualizada exitosamente' });
      }
    );
  }
});

// Obtener cambios pendientes (solo para admin ACA)
app.get('/api/pending-changes', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin_aca') {
    return res.status(403).json({ error: 'Sin permisos' });
  }

  db.all(`
    SELECT pc.*, c.name as cooperative_name, u.username 
    FROM pending_changes pc
    JOIN cooperatives c ON pc.cooperative_id = c.id
    JOIN users u ON pc.user_id = u.id
    WHERE pc.status = 'pending'
    ORDER BY pc.created_at DESC
  `, (err, changes) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener cambios pendientes' });
    }
    res.json(changes);
  });
});

// Aprobar/rechazar cambios
app.put('/api/pending-changes/:id/:action', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin_aca') {
    return res.status(403).json({ error: 'Sin permisos' });
  }

  const { id, action } = req.params;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Acción inválida' });
  }

  const status = action === 'approve' ? 'approved' : 'rejected';

  db.get('SELECT * FROM pending_changes WHERE id = ?', [id], (err, change) => {
    if (err || !change) {
      return res.status(404).json({ error: 'Cambio no encontrado' });
    }

    if (action === 'approve') {
      // Aplicar los cambios a la cooperativa
      const changes = JSON.parse(change.changes);
      const fields = Object.keys(changes).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(changes), change.cooperative_id];

      db.run(
        `UPDATE cooperatives SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error al aplicar cambios' });
          }

          // Marcar como aprobado
          db.run(
            'UPDATE pending_changes SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, req.user.id, id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Error al actualizar estado' });
              }
              res.json({ message: 'Cambios aprobados y aplicados' });
            }
          );
        }
      );
    } else {
      // Solo marcar como rechazado
      db.run(
        'UPDATE pending_changes SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, req.user.id, id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error al actualizar estado' });
          }
          res.json({ message: 'Cambios rechazados' });
        }
      );
    }
  });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// =================== APIs DE FACTURAS ===================

// Subir nueva factura (proveedor)
app.post('/api/invoices/upload', authenticateToken, upload.single('invoice'), (req, res) => {
  if (req.user.role !== 'proveedor') {
    return res.status(403).json({ error: 'Solo proveedores pueden subir facturas' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Archivo requerido' });
  }

  const {
    invoice_number,
    issue_date,
    issuer_cuit,
    receiver_cuit,
    subtotal,
    iva_amount,
    total_amount,
    items
  } = req.body;

  // Buscar cooperativa por CUIT
  db.get('SELECT id FROM cooperatives WHERE cuit = ?', [receiver_cuit], (err, coop) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar cooperativa' });
    }

    if (!coop) {
      return res.status(400).json({ error: 'CUIT receptor no encontrado en cooperativas registradas' });
    }

    // Insertar factura
    db.run(`
      INSERT INTO invoices (
        invoice_number, issue_date, issuer_cuit, receiver_cuit, 
        cooperative_id, supplier_id, subtotal, iva_amount, total_amount,
        file_path, original_filename, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente_validacion')
    `, [
      invoice_number, issue_date, issuer_cuit, receiver_cuit,
      coop.id, req.user.id, subtotal, iva_amount, total_amount,
      req.file.path, req.file.originalname
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al guardar factura' });
      }

      const invoiceId = this.lastID;

      // Insertar items si existen
      if (items && Array.isArray(JSON.parse(items))) {
        const parsedItems = JSON.parse(items);
        const stmt = db.prepare(`
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?)
        `);

        parsedItems.forEach(item => {
          stmt.run([invoiceId, item.description, item.quantity, item.unit_price, item.total_price]);
        });

        stmt.finalize();
      }

      res.json({
        message: 'Factura subida exitosamente',
        invoice_id: invoiceId,
        status: 'pendiente_validacion'
      });
    });
  });
});

// Obtener facturas del proveedor
app.get('/api/invoices/supplier', authenticateToken, (req, res) => {
  if (req.user.role !== 'proveedor') {
    return res.status(403).json({ error: 'Solo proveedores pueden ver sus facturas' });
  }

  db.all(`
    SELECT i.*, c.name as cooperative_name 
    FROM invoices i
    LEFT JOIN cooperatives c ON i.cooperative_id = c.id
    WHERE i.supplier_id = ?
    ORDER BY i.created_at DESC
  `, [req.user.id], (err, invoices) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener facturas' });
    }
    res.json(invoices);
  });
});

// Obtener facturas para la cooperativa
app.get('/api/invoices/cooperative', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin_coop') {
    return res.status(403).json({ error: 'Solo admins de cooperativa pueden ver facturas' });
  }

  db.all(`
    SELECT i.*, u.company_name as supplier_name, u.full_name as supplier_contact
    FROM invoices i
    LEFT JOIN users u ON i.supplier_id = u.id
    WHERE i.cooperative_id = ? AND i.status IN ('enviada', 'aceptada', 'rechazada')
    ORDER BY i.sent_at DESC
  `, [req.user.cooperative_id], (err, invoices) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener facturas' });
    }
    res.json(invoices);
  });
});

// Validar y enviar factura (proveedor)
app.put('/api/invoices/:id/validate', authenticateToken, (req, res) => {
  if (req.user.role !== 'proveedor') {
    return res.status(403).json({ error: 'Solo proveedores pueden validar facturas' });
  }

  const { id } = req.params;
  const updates = req.body;

  // Verificar que la factura pertenece al proveedor
  db.get('SELECT * FROM invoices WHERE id = ? AND supplier_id = ?', [id, req.user.id], (err, invoice) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar factura' });
    }

    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    if (invoice.status !== 'pendiente_validacion') {
      return res.status(400).json({ error: 'La factura ya fue procesada' });
    }

    // Actualizar factura
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), new Date().toISOString(), id];

    db.run(
      `UPDATE invoices SET ${fields}, status = 'enviada', validated_at = ?, sent_at = ? WHERE id = ?`,
      [...values, new Date().toISOString()],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al actualizar factura' });
        }
        res.json({ message: 'Factura validada y enviada a cooperativa' });
      }
    );
  });
});

// Responder factura (cooperativa)
app.put('/api/invoices/:id/respond', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin_coop') {
    return res.status(403).json({ error: 'Solo admins de cooperativa pueden responder facturas' });
  }

  const { id } = req.params;
  const { action, rejection_reason } = req.body; // action: 'aceptar' o 'rechazar'

  db.get('SELECT * FROM invoices WHERE id = ? AND cooperative_id = ?', [id, req.user.cooperative_id], (err, invoice) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar factura' });
    }

    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    if (invoice.status !== 'enviada') {
      return res.status(400).json({ error: 'La factura no está en estado válido para responder' });
    }

    const newStatus = action === 'aceptar' ? 'aceptada' : 'rechazada';
    
    db.run(
      'UPDATE invoices SET status = ?, rejection_reason = ?, responded_at = ? WHERE id = ?',
      [newStatus, rejection_reason || null, new Date().toISOString(), id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al actualizar factura' });
        }
        res.json({ 
          message: `Factura ${action === 'aceptar' ? 'aceptada' : 'rechazada'} exitosamente`,
          status: newStatus
        });
      }
    );
  });
});

// Obtener items de una factura
app.get('/api/invoices/:id/items', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.all('SELECT * FROM invoice_items WHERE invoice_id = ?', [id], (err, items) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener items' });
    }
    res.json(items);
  });
});

// Exportar facturas aceptadas a CSV (cooperativa)
app.get('/api/invoices/export/csv', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin_coop') {
    return res.status(403).json({ error: 'Solo admins de cooperativa pueden exportar' });
  }

  db.all(`
    SELECT 
      i.invoice_number,
      i.issue_date,
      i.issuer_cuit,
      i.receiver_cuit,
      i.subtotal,
      i.iva_amount,
      i.total_amount,
      u.company_name as supplier_name
    FROM invoices i
    LEFT JOIN users u ON i.supplier_id = u.id
    WHERE i.cooperative_id = ? AND i.status = 'aceptada'
    ORDER BY i.issue_date DESC
  `, [req.user.cooperative_id], (err, invoices) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener facturas para exportar' });
    }

    // Generar CSV
    const csvHeader = 'Numero Factura,Fecha,CUIT Emisor,CUIT Receptor,Subtotal,IVA,Total,Proveedor\n';
    const csvRows = invoices.map(inv => 
      `${inv.invoice_number},${inv.issue_date},${inv.issuer_cuit},${inv.receiver_cuit},${inv.subtotal},${inv.iva_amount},${inv.total_amount},"${inv.supplier_name}"`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=facturas_aceptadas.csv');
    res.send(csvContent);
  });
});

// Descargar archivo de factura
app.get('/api/invoices/:id/download', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM invoices WHERE id = ?', [id], (err, invoice) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar factura' });
    }

    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Verificar permisos
    const hasPermission = 
      (req.user.role === 'proveedor' && invoice.supplier_id === req.user.id) ||
      (req.user.role === 'admin_coop' && invoice.cooperative_id === req.user.cooperative_id) ||
      req.user.role === 'admin_aca';

    if (!hasPermission) {
      return res.status(403).json({ error: 'Sin permisos para descargar este archivo' });
    }

    if (!fs.existsSync(invoice.file_path)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }

    res.download(invoice.file_path, invoice.original_filename);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
