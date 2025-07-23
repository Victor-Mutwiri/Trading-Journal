import React from 'react';
import '../styles/logoutmodal.css';

const LogoutModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <div className="logout-modal-header">
          <span className="logout-modal-icon">🔒</span>
          <h2>Log out?</h2>
        </div>
        <p className="logout-modal-text">
          Are you sure you want to log out of your account?
        </p>
        <div className="logout-modal-actions">
          <button className="logout-modal-btn cancel" onClick={onClose}>
            No, Stay
          </button>
          <button className="logout-modal-btn confirm" onClick={onConfirm}>
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;