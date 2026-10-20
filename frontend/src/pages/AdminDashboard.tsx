import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { artifactAPI, categoryAPI, Artifact, API_ORIGIN } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    year: '',
    creator: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Kategori sederhana
  const defaultCategories = [
    'Langka',
    'Umum',
    'Eksperimental',
    'Vintage',
    'Edisi Khusus'
  ];

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  // Auto reset form ketika modal ditutup
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  const fetchData = async () => {
    try {
      const [artifactsResponse, categoriesResponse] = await Promise.all([
        artifactAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setArtifacts(artifactsResponse.data);
      
      // Jika tidak ada kategori dari backend, gunakan default categories
      if (categoriesResponse.data && categoriesResponse.data.length > 0) {
        setCategories(categoriesResponse.data);
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Jika error, tetap gunakan default categories
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validasi sederhana di frontend
    if (!formData.title || !formData.description || !formData.category) {
      alert('Judul, Deskripsi, dan Kategori wajib diisi!');
      setSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('year', formData.year);
      submitData.append('creator', formData.creator);

      if (imageFile) {
        submitData.append('image', imageFile);
      }
      if (videoFile) {
        submitData.append('video', videoFile);
      }

      console.log('Submitting data...');

      let response;
      if (editingArtifact) {
        response = await artifactAPI.update(editingArtifact.id, submitData);
      } else {
        response = await artifactAPI.create(submitData);
      }

      console.log('Response:', response.data);

      resetForm();
      setShowModal(false);
      fetchData(); // Refresh data
      
      alert(editingArtifact ? 'Artifak berhasil diupdate!' : 'Artifak berhasil ditambahkan!');
      
    } catch (error: any) {
      console.error('Error submitting artifact:', error);
      
      // Tampilkan error detail ke user
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          'Terjadi kesalahan saat menyimpan';
      
      alert(`Error: ${errorMessage}`);
      
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (artifact: Artifact) => {
    setEditingArtifact(artifact);
    setFormData({
      title: artifact.title,
      description: artifact.description,
      category: artifact.category,
      year: artifact.year || '',
      creator: artifact.creator || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus artifak ini?')) {
      return;
    }

    try {
      await artifactAPI.delete(id);
      fetchData(); // Refresh data
      alert('Artifak berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting artifact:', error);
      alert(error.response?.data?.error || 'Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      year: '',
      creator: ''
    });
    setImageFile(null);
    setVideoFile(null);
    setEditingArtifact(null);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1>Admin Dashboard</h1>
            <p>Selamat datang, {user.username}!</p>
          </div>
          <motion.button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Tambah Artifak
          </motion.button>
        </motion.div>

        {loading ? (
          <div className="loading">Memuat data...</div>
        ) : (
          <motion.div
            className="artifacts-table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Gambar</th>
                    <th>Judul</th>
                    <th>Kategori</th>
                    <th>Tahun</th>
                    <th>Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {artifacts.map((artifact, index) => (
                    <motion.tr
                      key={artifact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <td>
                        {artifact.image_url ? (
                          <img 
                            src={`${API_ORIGIN}${artifact.image_url}`} 
                            alt={artifact.title}
                            className="table-image"
                          />
                        ) : (
                          <div className="table-placeholder">🖼️</div>
                        )}
                      </td>
                      <td>{artifact.title}</td>
                      <td>
                        <span className="category-badge">
                          {artifact.category}
                        </span>
                      </td>
                      <td>{artifact.year || '-'}</td>
                      <td>
                        {new Date(artifact.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(artifact)}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(artifact.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {artifacts.length === 0 && (
              <div className="no-data">
                <h3>Belum ada artifak</h3>
                <p>Klik "Tambah Artifak" untuk menambah artifak pertama Anda</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Modal Form */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>
                    {editingArtifact ? 'Edit Artifak' : 'Tambah Artifak Baru'}
                  </h2>
                  <button
                    className="close-btn"
                    onClick={() => setShowModal(false)}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Judul *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="form-input"
                        required
                        placeholder="Masukkan judul artifak"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Kategori *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="form-select"
                        required
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tahun</label>
                      <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="form-input"
                        placeholder="Contoh: 2024"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pembuat</label>
                      <input
                        type="text"
                        value={formData.creator}
                        onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                        className="form-input"
                        placeholder="Nama pembuat"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Deskripsi *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-textarea large-textarea"
                      required
                      placeholder="Deskripsi lengkap artifak..."
                      rows={8}
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Gambar</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="form-input"
                      />
                      {editingArtifact?.image_url && !imageFile && (
                        <div className="current-file">
                          File saat ini: {editingArtifact.image_url.split('/').pop()}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Video</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="form-input"
                      />
                      {editingArtifact?.video_url && !videoFile && (
                        <div className="current-file">
                          File saat ini: {editingArtifact.video_url.split('/').pop()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Menyimpan...' : 
                       editingArtifact ? 'Update' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;