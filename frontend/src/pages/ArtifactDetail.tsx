import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { artifactAPI, Artifact, API_ORIGIN } from '../services/api';
import './ArtifactDetail.css';

const ArtifactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        if (!id) return;
        const response = await artifactAPI.getById(parseInt(id));
        setArtifact(response.data);
      } catch (err) {
        setError('Gagal memuat detail artifak');
        console.error('Error fetching artifact:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtifact();
  }, [id]);

  if (loading) {
    return (
      <div className="artifact-detail loading">
        <div className="container">
          <div className="loading">Memuat detail artifak...</div>
        </div>
      </div>
    );
  }

  if (error || !artifact) {
    return (
      <div className="artifact-detail error">
        <div className="container">
          <div className="error-message">
            <h2>{error || 'Artifak tidak ditemukan'}</h2>
            <Link to="/artifacts" className="btn btn-primary">
              Kembali ke Koleksi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artifact-detail">
      <div className="container">
        <motion.div
          className="artifact-detail-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/artifacts" className="back-link">
            ← Kembali ke Koleksi
          </Link>

          <div className="artifact-detail-grid">
            {/* Media Section */}
            <motion.div
              className="media-section"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {artifact.image_url ? (
                <img 
                  src={`${API_ORIGIN}${artifact.image_url}`} 
                  alt={artifact.title}
                  className="artifact-detail-image"
                />
              ) : (
                <div className="artifact-detail-placeholder">
                  🖼️ Tidak ada gambar
                </div>
              )}

              {artifact.video_url && (
                <div className="video-section">
                  <h3>Video</h3>
                  <video 
                    controls 
                    className="artifact-video"
                    src={`${API_ORIGIN}${artifact.video_url}`}
                  >
                    Browser Anda tidak mendukung pemutar video.
                  </video>
                </div>
              )}
            </motion.div>

            {/* Info Section */}
            <motion.div
              className="info-section"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="artifact-header">
                <span className="artifact-category">{artifact.category}</span>
                <h1>{artifact.title}</h1>
                {artifact.year && (
                  <span className="artifact-year">Tahun: {artifact.year}</span>
                )}
                {artifact.creator && (
                  <span className="artifact-creator">Oleh: {artifact.creator}</span>
                )}
              </div>

              <div className="artifact-description-section">
                <h3>Deskripsi</h3>
                <div className="artifact-description">
                  {artifact.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="artifact-meta">
                <div className="meta-item">
                  <strong>Postingan Dibuat:</strong>
                  <span>{new Date(artifact.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="meta-item">
                  <strong>Postingan Diupdate:</strong>
                  <span>{new Date(artifact.updated_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ArtifactDetail;