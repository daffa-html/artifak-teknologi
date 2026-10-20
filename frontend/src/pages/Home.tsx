import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { artifactAPI, Artifact, API_ORIGIN } from '../services/api';
import './Home.css';

const Home: React.FC = () => {
  const [recentArtifacts, setRecentArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentArtifacts = async () => {
      try {
        const response = await artifactAPI.getAll();
        setRecentArtifacts(response.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching artifacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentArtifacts();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Jelajahi <span className="highlight">Artifak Teknologi</span> Masa Depan
            </h1>
            <p className="hero-description">
              Temukan koleksi artifak teknologi terbaru dan terbaik yang menginspirasi 
              inovasi dan kreativitas di dunia digital.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/artifacts" className="btn btn-primary hero-cta">
                Jelajahi Koleksi
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Mengapa Memilih Platform Kami?
          </motion.h2>
          <div className="features-grid">
            {[
              {
                icon: 'icons/data-collection.png',
                title: 'Koleksi Lengkap',
                description: 'Beragam artifak teknologi dari berbagai kategori dan era'
              },
              {
                icon: 'icons/admin.png',
                title: 'Tampilan Elegan',
                description: 'Interface modern dengan animasi yang smooth dan menarik'
              },
              {
                icon: 'icons/device.png',
                title: 'Responsif',
                description: 'Akses dari berbagai device dengan pengalaman optimal'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="feature-icon"><img src={feature.icon} alt={feature.title} className="feature-icon" /></div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Artifacts Section */}
      <section className="recent-artifacts">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Artifak Terbaru</h2>
            <Link to="/artifacts" className="btn btn-secondary">
              Lihat Semua
            </Link>
          </motion.div>

          {loading ? (
            <div className="loading">Memuat artifak...</div>
          ) : (
            <div className="artifacts-grid">
              {recentArtifacts.map((artifact, index) => (
                <motion.div
                  key={artifact.id}
                  className="artifact-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  {artifact.image_url && (
                    <img 
                      src={`${API_ORIGIN}${artifact.image_url}`} 
                      alt={artifact.title}
                      className="artifact-image"
                    />
                  )}
                  <div className="artifact-content">
                    <h3>{artifact.title}</h3>
                    <p className="artifact-category">{artifact.category}</p>
                    <p className="artifact-description">
                      {artifact.description.slice(0, 100)}...
                    </p>
                    <Link 
                      to={`/artifacts/${artifact.id}`} 
                      className="btn btn-primary"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;