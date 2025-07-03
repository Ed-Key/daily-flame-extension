import React from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  error?: string | null;
  name?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  error,
  name
}) => {
  return (
    <div className="relative w-full">
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`df-glassmorphism-input w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${error ? 'border-red-400 border-opacity-70' : ''} ${className}`}
        disabled={disabled}
        name={name}
      />
      {error && (
        <p className="mt-1 text-xs text-red-300">{error}</p>
      )}
    </div>
  );
};

export default PasswordInput;