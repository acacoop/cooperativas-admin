const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
    role TEXT NOT NULL CHECK(role IN ('admin_aca', 'operador_aca', 'admin_coop')),
    cooperative_id INTEGER,
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

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
