"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface MobileLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { user_id: string; name: string; email: string; role: 'ADMIN' | 'USER'; profile_image?: string; phone?: string; bio?: string; dark_league_points?: number; }) => void;
}

export default function MobileLoginModal({ isOpen, onClose, onLoginSuccess }: MobileLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Call your authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        onLoginSuccess({
          user_id: data.user.user_id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          profile_image: data.user.profile_image,
          phone: data.user.phone,
          bio: data.user.bio,
          dark_league_points: 0 // Will be fetched in handleLoginSuccess
        });
        setEmail("");
        setPassword("");
        setError("");
      } else {
        // Login failed
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
      {/* Mobile: Slide up from bottom, Desktop: Center modal */}
      <div className="bg-white dark:bg-gray-800 w-full md:w-full md:max-w-md mx-0 md:mx-4 rounded-t-3xl md:rounded-lg transform transition-transform duration-300 ease-out">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 pb-8">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Sign in to access your account
          </p>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                >
                  {showPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
                </button>
              </div>
            </div>
            
            {/* Demo Credentials Helper */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Demo Credentials:</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Admin: admin@demo.com / admin123<br/>
                User: user@demo.com / user123
              </p>
            </div>
            
            {/* Login Button - Extra large for mobile */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          
          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Contact admin for access
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}