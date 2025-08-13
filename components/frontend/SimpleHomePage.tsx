"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { IconUser, IconMail, IconLock, IconEye, IconEyeOff, IconPhone, IconUserPlus } from '@tabler/icons-react';

// Simple floating logo component without 3D
const FloatingLogo = () => {
  return (
    <motion.div
      className="absolute top-2 right-2 w-12 h-12 sm:top-4 sm:right-4 sm:w-16 sm:h-16 md:top-8 md:right-8 md:w-24 md:h-24"
      animate={{
        y: [0, -10, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center sm:rounded-2xl">
        <span className="text-white font-bold text-base sm:text-xl md:text-2xl">C</span>
      </div>
    </motion.div>
  );
};

// Input Component
interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ label, type, value, onChange, icon, placeholder, required = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-1 sm:space-y-2">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none sm:pl-3">
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:pl-10 sm:pr-12 sm:py-3 sm:rounded-xl sm:text-base"
          required={required}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-2 flex items-center sm:pr-3"
          >
            {showPassword ? (
              <IconEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 sm:h-5 sm:w-5" />
            ) : (
              <IconEye className="h-4 w-4 text-gray-400 hover:text-gray-600 sm:h-5 sm:w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Registration Form Component
const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone,
          password: formData.password,
          role: 'USER'
        }),
      });

      if (response.ok) {
        // Handle success - redirect or show success message
        alert('Registration successful!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        let errorMessage = 'Registration failed';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Show more specific error for 401
        if (response.status === 401) {
          errorMessage = 'Registration is currently disabled. Please contact the administrator.';
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-2xl p-3 border border-white/20 sm:p-4 sm:rounded-2xl md:p-6">
        <div className="text-center mb-3 sm:mb-4 md:mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 sm:text-xl sm:mb-2 md:text-2xl">
            Join Us Today
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            icon={<IconUser size={18} />}
            placeholder="Enter your full name"
            required
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            icon={<IconMail size={18} />}
            placeholder="Enter your email"
            required
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            icon={<IconPhone size={18} />}
            placeholder="Enter your phone number"
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            icon={<IconLock size={18} />}
            placeholder="Create a password"
            required
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
            icon={<IconLock size={18} />}
            placeholder="Confirm your password"
            required
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <IconUserPlus size={18} />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-4 md:mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
            Already have an account?{' '}
            <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Main Home Page Component
const SimpleHomePage: React.FC = () => {
  return (
  <div className="min-h-[100svh] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse sm:w-64 sm:h-64 md:w-96 md:h-96"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse sm:w-64 sm:h-64 md:w-96 md:h-96" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Logo */}
      <FloatingLogo />

      {/* Main Content */}
  <div className="relative z-10 flex flex-col lg:flex-row min-h-[100svh]">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12">
          <div className="max-w-lg text-center lg:text-left w-full">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-xl font-bold text-gray-900 dark:text-white mb-3 sm:text-2xl sm:mb-4 md:text-3xl md:mb-5 lg:text-4xl lg:mb-6 xl:text-5xl"
            >
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Carousel
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed sm:text-base sm:mb-5 md:text-lg md:mb-6 lg:mb-8"
            >
              Experience the next generation of interactive carousels. Beautiful, fast, and built for modern web and mobile applications.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap gap-1.5 justify-center lg:justify-start mb-4 sm:gap-2 sm:mb-5 md:mb-6 lg:mb-8"
            >
              {['Mobile First', '3D Ready', 'Touch Gestures', 'Responsive'].map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-white/30 sm:px-3 sm:text-sm"
                >
                  {feature}
                </span>
              ))}
            </motion.div>

            {/* Mobile CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col gap-2 justify-center lg:justify-start lg:hidden sm:flex-row sm:gap-3"
            >
              <button className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:px-4 sm:py-2.5 md:px-6 md:py-3 md:rounded-xl md:text-base">
                Get Started
              </button>
              <button className="px-3 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition-all duration-200 text-sm sm:px-4 sm:py-2.5 md:px-6 md:py-3 md:rounded-xl md:text-base">
                Learn More
              </button>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12">
          <RegistrationForm />
        </div>
      </div>

      {/* Mobile Navigation Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 lg:hidden sm:bottom-4"
      >
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
          <div className="w-4 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full sm:w-6 sm:h-1"></div>
          <span className="text-xs sm:text-sm">Swipe to explore</span>
          <div className="w-4 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full sm:w-6 sm:h-1"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default SimpleHomePage;
