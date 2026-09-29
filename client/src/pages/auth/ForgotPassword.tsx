import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent } from '../../components/ui/Card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
      setSubmitted(true);
      if (res.data.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
    } catch (err: any) {
      toast.error('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[var(--border)] shadow-xl">
        <CardContent className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-2">Reset Password</h1>
            <p className="text-[var(--muted-foreground)]">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold group"
              >
                {loading ? 'Processing...' : (
                  <span className="flex items-center">
                    Send Reset Link <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-[var(--color-success-50)] text-[var(--color-success-700)] dark:bg-[var(--color-success-900)]/30 dark:text-[var(--color-success-400)] p-4 rounded-lg border border-[var(--color-success-200)] dark:border-[var(--color-success-800)]">
                If an account exists with that email, a password reset link has been sent.
              </div>
              
              {devToken && (
                <div className="mt-6 text-left bg-[var(--muted)] p-4 rounded-lg border border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--foreground)] uppercase mb-2">Development Mode</p>
                  <p className="text-xs text-[var(--muted-foreground)] mb-3">Since email delivery is not configured, you can reset your password using this development link:</p>
                  <Link to={`/reset-password?token=${devToken}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Proceed to Reset Password
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
