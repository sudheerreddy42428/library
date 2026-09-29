import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent } from '../../components/ui/Card';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      toast.success('Password updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[var(--border)] shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-danger-600)]">Invalid Request</h2>
            <p className="text-[var(--muted-foreground)]">No reset token provided. Please use the link from your email.</p>
            <Link to="/forgot-password">
              <Button className="mt-4">Back to Forgot Password</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[var(--border)] shadow-xl">
        <CardContent className="p-8 sm:p-10">
          {!success ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-2">Create New Password</h1>
                <p className="text-[var(--muted-foreground)]">Please enter your new password below.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-12 h-12"
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-12 h-12"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold group"
                >
                  {loading ? 'Updating...' : (
                    <span className="flex items-center">
                      Update Password <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 py-6">
              <div className="mx-auto w-16 h-16 bg-[var(--color-success-100)] dark:bg-[var(--color-success-900)] rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-[var(--color-success-600)] dark:text-[var(--color-success-400)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Password Updated</h2>
              <p className="text-[var(--muted-foreground)]">Your password has been changed successfully.</p>
              <Link to="/login">
                <Button className="w-full mt-6">Continue to Login</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
