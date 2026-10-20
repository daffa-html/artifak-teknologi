const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Setup upload folder
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar dan video yang diizinkan!'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Inisialisasi database dengan error handling yang lebih baik
const db = new sqlite3.Database('./bazar.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    
    // Buat tabel admin dengan error handling
    db.run(`CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating admin table:', err);
      } else {
        console.log('Admin table ready');
        
        // Buat admin default hanya setelah tabel dibuat
        const defaultPassword = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT OR IGNORE INTO admin (username, password) VALUES (?, ?)`, 
          ['admin', defaultPassword], function(err) {
            if (err) {
              console.error('Error creating default admin:', err);
            } else {
              if (this.changes > 0) {
                console.log('Default admin created: admin / admin123');
              } else {
                console.log('Default admin already exists');
              }
            }
          });
      }
    });
    
    // Buat tabel artifacts
    db.run(`CREATE TABLE IF NOT EXISTS artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      year TEXT,
      creator TEXT,
      image_url TEXT,
      video_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating artifacts table:', err);
      } else {
        console.log('Artifacts table ready');
      }
    });
  }
});

// Middleware auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ROUTES

// Login admin
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password diperlukan' });
  }

  db.get('SELECT * FROM admin WHERE username = ?', [username], async (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    try {
      const validPassword = await bcrypt.compare(password, row.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Username atau password salah' });
      }

      const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET);
      res.json({ 
        token, 
        user: { id: row.id, username: row.username } 
      });
    } catch (error) {
      console.error('Password comparison error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Get all artifacts
app.get('/api/artifacts', (req, res) => {
  db.all('SELECT * FROM artifacts ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Get single artifact
app.get('/api/artifacts/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM artifacts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Artifact tidak ditemukan' });
    }
    
    res.json(row);
  });
});

// Create artifact (admin only)
app.post('/api/artifacts', authenticateToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  const { title, description, category, year, creator } = req.body;
  
  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description, dan category wajib diisi' });
  }

  const imageUrl = req.files && req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : null;
  const videoUrl = req.files && req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

  db.run(
    `INSERT INTO artifacts (title, description, category, year, creator, image_url, video_url) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, category, year, creator, imageUrl, videoUrl],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Gagal menambah artifact' });
      }
      
      res.json({ 
        id: this.lastID,
        message: 'Artifact berhasil ditambahkan' 
      });
    }
  );
});

// Update artifact (admin only)
app.put('/api/artifacts/:id', authenticateToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  const { id } = req.params;
  const { title, description, category, year, creator } = req.body;

  // Get current data first
  db.get('SELECT * FROM artifacts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Artifact tidak ditemukan' });
    }

    const imageUrl = req.files && req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : row.image_url;
    const videoUrl = req.files && req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : row.video_url;

    db.run(
      `UPDATE artifacts SET title = ?, description = ?, category = ?, year = ?, creator = ?, 
       image_url = ?, video_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, description, category, year, creator, imageUrl, videoUrl, id],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Gagal mengupdate artifact' });
        }
        
        res.json({ message: 'Artifact berhasil diupdate' });
      }
    );
  });
});

// Delete artifact (admin only)
app.delete('/api/artifacts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM artifacts WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Gagal menghapus artifact' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Artifact tidak ditemukan' });
    }
    
    res.json({ message: 'Artifact berhasil dihapus' });
  });
});

// Get categories
// Get categories with defaults
// Get categories with defaults - FIXED VERSION
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM artifacts ORDER BY category', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      // Even if error, return default categories
      const defaultCategories = [
        'Langka',
        'Umum', 
        'Eksperimental',
        'Vintage',
        'Edisi Khusus'
      ];
      return res.json(defaultCategories);
    }
    
    const categoriesFromDb = (rows || []).map(row => row.category);
    
    // Always include default categories, merge with existing ones
    const defaultCategories = [
      'Langka',
      'Umum', 
      'Eksperimental',
      'Vintage',
      'Edisi Khusus'
    ];
    
    // Combine and remove duplicates
    const allCategories = [...new Set([...defaultCategories, ...categoriesFromDb])];
    
    res.json(allCategories);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});