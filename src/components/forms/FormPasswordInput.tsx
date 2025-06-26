import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface FormPasswordInputProps {
  name: string;
  label: string;
  placeholder?: string;
  validation?: Record<string, any>;
  autoComplete?: string;
  showStrengthIndicator?: boolean;
}

export const FormPasswordInput: React.FC<FormPasswordInputProps> = ({
  name,
  label,
  placeholder,
  validation = {},
  autoComplete,
  showStrengthIndicator = false
}) => {
  const { register, formState: { errors }, watch } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[name] as any;
  const password = watch(name);

  const getPasswordStrength = (pwd: string): { strength: string; color: string } => {
    if (!pwd) return { strength: '', color: '' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength < 2) return { strength: 'Weak', color: '#ef4444' };
    if (strength < 3) return { strength: 'Fair', color: '#f59e0b' };
    if (strength < 4) return { strength: 'Good', color: '#3b82f6' };
    return { strength: 'Strong', color: '#10b981' };
  };

  const { strength, color } = showStrengthIndicator ? getPasswordStrength(password) : { strength: '', color: '' };

  return (
    <div className="auth-form-group">
      <label htmlFor={name} className="auth-label">
        {label}
      </label>
      <div className="auth-input-wrapper password-input-wrapper">
        <span className="auth-input-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </span>
        <input
          {...register(name, validation)}
          id={name}
          type={showPassword ? 'text' : 'password'}
          className={`auth-input ${error ? 'auth-input-error' : ''}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <span className="auth-error-message">
          {typeof error === 'string' ? error : (error.message || `${label} is required`)}
        </span>
      )}
      {showStrengthIndicator && password && (
        <div className="password-strength">
          <span style={{ color }}>{strength}</span>
        </div>
      )}
    </div>
  );
};