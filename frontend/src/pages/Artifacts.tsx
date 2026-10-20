import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { artifactAPI, categoryAPI, Artifact, API_ORIGIN } from '../services/api';
import './Artifacts.css';

const Artifacts: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artifactsResponse, categoriesResponse] = await Promise.all([
          artifactAPI.getAll(),
          categoryAPI.getAll()
        ]);
        setArtifacts(artifactsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesCategory = selectedCategory ? artifact.category === selectedCategory : true;
    const matchesSearch = artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artifact.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="artifacts-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Koleksi Artifak Teknologi</h1>
          <p>Temukan berbagai artifak teknologi yang menginspirasi</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="search-box">
            <input
              type="text"
              placeholder="Cari artifak..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
          >
            <option value="">Semua Kategori</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Artifacts Grid */}
        {loading ? (
          <div className="loading">Memuat artifak...</div>
        ) : (
          <motion.div
            className="artifacts-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {filteredArtifacts.map((artifact, index) => (
              <motion.div
                key={artifact.id}
                className="artifact-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {artifact.image_url ? (
                  <img 
                    src={`${API_ORIGIN}${artifact.image_url}`} 
                    alt={artifact.title}
                    className="artifact-image"
                  />
                ) : (
                  <div className="artifact-placeholder">
                    🖼️ Tidak ada gambar
                  </div>
                )}
                
                <div className="artifact-content">
                  <h3>{artifact.title}</h3>
                  <span className="artifact-category">{artifact.category}</span>
                  {artifact.year && (
                    <span className="artifact-year">{artifact.year}</span>
                  )}
                  <p className="artifact-description">
                    {artifact.description.length > 150 
                      ? `${artifact.description.slice(0, 150)}...`
                      : artifact.description
                    }
                  </p>
                  <div className="artifact-actions">
                    <Link 
                      to={`/artifacts/${artifact.id}`} 
                      className="btn btn-primary"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filteredArtifacts.length === 0 && (
          <motion.div
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3>Tidak ada artifak yang ditemukan</h3>
            <p>Coba ubah pencarian atau filter kategori</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Artifacts;