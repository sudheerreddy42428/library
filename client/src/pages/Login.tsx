import React, { useState } from 'react';
import { BookOpen, Lock, Mail, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@library.edu'); // Pre-fill for demo
  const [password, setPassword] = useState('admin123'); // Pre-fill for demo
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      if (res.data.user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--foreground)] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-900)] to-[var(--foreground)] opacity-90 z-0"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-[var(--color-primary-500)] p-2 rounded-xl">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Smart LMS</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            The modern way to manage your library.
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-md">
            A comprehensive, cloud-based platform for educational institutions to track, manage, and discover library resources.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span>&copy; {new Date().getFullYear()} Smart LMS Inc.</span>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[var(--color-primary-500)]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[var(--color-primary-700)]/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-[var(--background)]">
        
        <div className="md:hidden flex items-center gap-3 mb-12">
          <div className="bg-[var(--color-primary-600)] p-2 rounded-xl">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">Smart LMS</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Welcome back</h2>
            <p className="text-[var(--muted-foreground)]">Please enter your details to sign in.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 text-base"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold mt-4 shadow-md group"
            >
              {loading ? 'Signing in...' : (
                <span className="flex items-center">
                  Sign In <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            Don't have an account? <Link to="/" className="font-semibold text-[var(--color-primary-600)] hover:underline">Register here</Link>
          </p>

          {/* Demo Credentials Box */}
          <div className="mt-12 bg-[var(--muted)]/50 rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center">
              <span className="bg-[var(--foreground)] text-[var(--background)] text-[10px] uppercase px-2 py-0.5 rounded mr-2 tracking-wider">Demo</span> 
              Test Credentials
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] shadow-sm cursor-pointer hover:border-[var(--color-primary-300)] transition-colors" onClick={() => {setEmail('admin@library.edu'); setPassword('admin123');}}>
                <span className="font-bold text-xs text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] block mb-1 uppercase tracking-wider">Admin</span>
                <p className="text-xs text-[var(--foreground)] font-mono">admin@library.edu</p>
                <p className="text-xs text-[var(--muted-foreground)] font-mono mt-0.5">admin123</p>
              </div>
              <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] shadow-sm cursor-pointer hover:border-[var(--color-primary-300)] transition-colors" onClick={() => {setEmail('student1@library.edu'); setPassword('student123');}}>
                <span className="font-bold text-xs text-[var(--color-success-600)] dark:text-[var(--color-success-400)] block mb-1 uppercase tracking-wider">Student</span>
                <p className="text-xs text-[var(--foreground)] font-mono">student1@library.edu</p>
                <p className="text-xs text-[var(--muted-foreground)] font-mono mt-0.5">student123</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
