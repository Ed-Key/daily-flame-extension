import React from 'react';
import { AuthButtonsProps } from '../types';

const AuthButtons: React.FC<AuthButtonsProps> = ({ onSignInClick }) => {
  return (
    <button
      onClick={onSignInClick}
      className="df-glassmorphism-element px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors backdrop-blur-sm"
    >
      Sign In
    </button>
  );
};

export default AuthButtons;