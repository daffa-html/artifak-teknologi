import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tech Artifacts
            </motion.div>
          </Link>
          
          <div className="navbar-links">
            <Link to="/" className="nav-link">Beranda</Link>
            <Link to="/artifacts" className="nav-link">Koleksi</Link>
            
            {user ? (
              <>
                <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="btn btn-primary">
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;