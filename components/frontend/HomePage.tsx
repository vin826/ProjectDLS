"use client";
import React, { useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, OrbitControls } from '@react-three/drei';
import { IconUser, IconMail, IconLock, IconEye, IconEyeOff, IconPhone, IconUserPlus } from '@tabler/icons-react';
import * as THREE from 'three';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn('3D Canvas error:', error);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// 3D Logo Component (placeholder - you can replace with actual GLB)
function Logo3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.2} />
      </mesh>
    </Float>
  );
}

// Fallback 2D Logo
const FallbackLogo = () => (
  <motion.div
    className="absolute top-1 right-1 w-8 h-8 xs:top-2 xs:right-2 xs:w-10 xs:h-10 sm:top-4 sm:right-4 sm:w-16 sm:h-16 md:top-8 md:right-8 md:w-24 md:h-24"
    animate={{
      y: [0, -5, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse"
    }}
  >
    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center sm:rounded-xl md:rounded-2xl">
      <span className="text-white font-bold text-xs xs:text-sm sm:text-base md:text-xl lg:text-2xl">C</span>
    </div>
  </motion.div>
);

// Safe 3D Canvas Component
const Safe3DCanvas = () => {
  const [use3D, setUse3D] = useState(true);

  if (!use3D) {
    return <FallbackLogo />;
  }

  return (
    <ErrorBoundary 
      fallback={<FallbackLogo />} 
      onError={() => setUse3D(false)}
    >
      <Canvas 
        className="absolute top-1 right-1 w-8 h-8 xs:top-2 xs:right-2 xs:w-10 xs:h-10 sm:top-4 sm:right-4 sm:w-16 sm:h-16 md:top-8 md:right-8 md:w-24 md:h-24"
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Logo3D />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
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
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
          style={{ minHeight: '44px', fontSize: '16px' }}
          required={required}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <IconEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <IconEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
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
  const [isPressed, setIsPressed] = useState(false);

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
    setErrors({}); // Clear previous errors
    
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

      const data = await response.json();

      if (response.ok) {
        // Handle success - redirect or show success message
        alert('Registration successful! Welcome to Carousel!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        // Handle specific error messages from the server
        if (response.status === 409) {
          setErrors({ email: 'An account with this email already exists' });
        } else if (response.status === 400) {
          // Parse validation errors
          if (data.error.includes('email')) {
            setErrors({ email: data.error });
          } else if (data.error.includes('password')) {
            setErrors({ password: data.error });
          } else {
            alert(data.error || 'Registration failed. Please check your information.');
          }
        } else {
          alert(data.error || 'Registration failed. Please try again.');
        }
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
      className="w-full max-w-sm mx-auto"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 xs:p-4 xs:rounded-xl xs:shadow-xl sm:p-6 sm:rounded-2xl md:p-8">
        <div className="text-center mb-3 xs:mb-4 sm:mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 xs:text-xl xs:mb-2 sm:text-2xl md:text-3xl"
              style={{ fontSize: 'clamp(1.125rem, 5vw, 2rem)' }}>
            Join Us Today
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm xs:text-base"
             style={{ fontSize: 'clamp(0.875rem, 4vw, 1rem)' }}>
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            icon={<IconUser size={16} />}
            placeholder="Enter your full name"
            required
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            icon={<IconMail size={16} />}
            placeholder="Enter your email"
            required
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

          {/* Show phone field on all screens but make it more compact */}
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            icon={<IconPhone size={16} />}
            placeholder="Phone number"
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            icon={<IconLock size={16} />}
            placeholder="Create password"
            required
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
            icon={<IconLock size={16} />}
            placeholder="Confirm password"
            required
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.8 }}
            animate={{ scale: isPressed ? 0.8 : 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 1000,
              damping: 15
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm xs:py-3 xs:text-base focus-visible:outline-2 focus-visible:outline-blue-400 focus-visible:outline-offset-2"
            style={{ minHeight: '44px' }}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <IconUserPlus size={16} />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
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
const HomePage: React.FC = () => {
  return (
  <div className="min-h-[100svh] bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Effects - Hidden on very small screens */}
      <div className="absolute inset-0 overflow-hidden hidden xs:block">
        <div className="absolute -top-1/2 -right-1/2 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse sm:w-64 sm:h-64 md:w-96 md:h-96"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000 sm:w-64 sm:h-64 md:w-96 md:h-96"></div>
      </div>

      {/* 3D Logo Section - Hidden on very small screens */}
      <div className="hidden xs:block">
        <Safe3DCanvas />
      </div>

      {/* Main Content - Single column stack on mobile, two column on large screens */}
  <div className="relative z-10 flex flex-col lg:flex-row min-h-[100svh] p-2">
        {/* Hero Content - Simplified for very small screens */}
        <div className="lg:flex-1 flex items-center justify-center mb-4 lg:mb-0">
          <div className="max-w-lg text-center lg:text-left w-full">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-xl font-bold text-gray-900 dark:text-white mb-3 xs:text-2xl xs:mb-4 sm:text-3xl sm:mb-5 md:text-5xl md:mb-6 lg:text-6xl"
              style={{ fontSize: 'clamp(1.25rem, 6vw, 4rem)' }}
            >
              Dark League{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Studios
              </span>
            </motion.h1>
            
            {/* Description - Show on all screen sizes but smaller on mobile */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed xs:text-base xs:mb-5 sm:text-lg sm:mb-6 md:text-xl md:mb-8"
              style={{ fontSize: 'clamp(0.875rem, 4vw, 1.25rem)' }}
            >
              Where Heroes Come To Light.
            </motion.p>

            {/* Feature Pills - Simplified for mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden xs:flex flex-wrap gap-2 justify-center lg:justify-start mb-5 sm:gap-3 sm:mb-6 md:mb-8"
            >
              {['Mobile First', 'Responsive'].map((feature, index) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 sm:px-4 sm:py-2"
                >
                  {feature}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Registration Form - Takes full width on small screens */}
        <div className="lg:flex-1 flex items-center justify-center">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
