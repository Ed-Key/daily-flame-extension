import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormInputProps {
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  validation?: Record<string, any>;
  autoComplete?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  type = 'text',
  label,
  placeholder,
  icon,
  validation = {},
  autoComplete
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name] as any;

  return (
    <div className="auth-form-group">
      <label htmlFor={name} className="auth-label">
        {label}
      </label>
      <div className="auth-input-wrapper">
        {icon && <span className="auth-input-icon">{icon}</span>}
        <input
          {...register(name, validation)}
          id={name}
          type={type}
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
    </div>
  );
};