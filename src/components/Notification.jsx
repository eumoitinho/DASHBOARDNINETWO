"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const Notification = ({ 
  type = 'info', 
  message, 
  title, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'solar:check-circle-bold';
      case 'error':
        return 'solar:close-circle-bold';
      case 'warning':
        return 'solar:warning-bold';
      case 'info':
      default:
        return 'solar:info-circle-bold';
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-success-subtle text-success-main border-success';
      case 'error':
        return 'bg-danger-subtle text-danger-main border-danger';
      case 'warning':
        return 'bg-warning-subtle text-warning-main border-warning';
      case 'info':
      default:
        return 'bg-info-subtle text-info-main border-info';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`alert ${getColorClasses()} border d-flex align-items-center justify-content-between mb-3`} role="alert">
      <div className="d-flex align-items-center">
        <Icon icon={getIcon()} className="me-2 text-xl" />
        <div>
          {title && <strong className="me-2">{title}</strong>}
          {message}
        </div>
      </div>
      <button
        type="button"
        className="btn-close"
        onClick={handleClose}
        aria-label="Fechar"
      />
    </div>
  );
};

export default Notification; 