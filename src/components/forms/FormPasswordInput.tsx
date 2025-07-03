import React from 'react';
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
        <input
          {...register(name, validation)}
          id={name}
          type="password"
          className={`auth-input ${error ? 'auth-input-error' : ''}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
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