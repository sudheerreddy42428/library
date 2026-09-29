import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, Phone, Building, KeyRound, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function RegisterLibrarian() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    librarianId: '',
    email: '',
    phone: '',
    institution: '',
    password: '',
    confirmPassword: '',
    registrationCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/register/librarian', formData);
      toast.success('Librarian account created successfully. Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-5/12 bg-[var(--foreground)] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-success-900)] to-[var(--foreground)] opacity-90 z-0"></div>
        
        <div className="relative z-10 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-[var(--color-success-500)] p-2 rounded-xl">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Smart LMS</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
            Library Administration
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-md mb-6">
            Create a librarian account to manage inventory, oversee circulation, and generate insights.
          </p>
          <div className="flex items-start gap-3 bg-[var(--foreground)]/50 border border-[var(--color-success-500)]/30 p-4 rounded-lg">
            <ShieldAlert className="h-5 w-5 text-[var(--color-success-400)] shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Librarian accounts have elevated privileges. You must have an authorized Registration Code from your institution to proceed.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span>&copy; {new Date().getFullYear()} Smart LMS Inc.</span>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-[var(--background)] overflow-y-auto">
        <div className="w-full max-w-xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Librarian Registration</h2>
            <p className="text-[var(--muted-foreground)]">Please fill in your details to create an administrator account.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="registrationCode">Library Registration Code *</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input id="registrationCode" name="registrationCode" type="password" value={formData.registrationCode} onChange={handleChange} className="pl-10 h-11 border-[var(--color-success-200)] focus:border-[var(--color-success-500)] focus:ring-[var(--color-success-500)]/20" placeholder="Required for admin access" required />
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 border-t border-[var(--border)] pt-4 mt-2"></div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} className="pl-10 h-11" placeholder="Jane Doe" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="librarianId">Employee / Librarian ID *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input id="librarianId" name="librarianId" value={formData.librarianId} onChange={handleChange} className="pl-10 h-11" placeholder="e.g. LIB-001" required />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="pl-10 h-11" placeholder="librarian@example.edu" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="pl-10 h-11" placeholder="+1 (555) 000-0000" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution (Optional)</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input id="institution" name="institution" value={formData.institution} onChange={handleChange} className="pl-10 h-11" placeholder="Library Name" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="pl-10 h-11 pr-10" placeholder="Minimum 6 characters" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} className="pl-10 h-11" placeholder="Confirm your password" required minLength={6} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold mt-4 shadow-md bg-[var(--color-success-600)] hover:bg-[var(--color-success-700)] text-white">
              {loading ? 'Processing...' : 'Create Librarian Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            Already have an account? <Link to="/login" className="font-semibold text-[var(--color-success-600)] hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
