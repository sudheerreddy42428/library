import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Settings, Save, Book, Clock, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function SystemSettings() {
  const [formData, setFormData] = useState({
    maxBooksPerStudent: 3,
    loanPeriodDays: 14,
    fineRatePerDay: 5.0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) {
          setFormData({
            maxBooksPerStudent: res.data.maxBooksPerStudent,
            loanPeriodDays: res.data.loanPeriodDays,
            fineRatePerDay: res.data.fineRatePerDay
          });
        }
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/settings', formData);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">System Configuration</h1>
        <p className="text-[var(--muted-foreground)] mt-2">Manage library rules, limits, and fine policies.</p>
      </div>
      
      <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">Loading configuration...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Max Books */}
              <div className="flex flex-col sm:flex-row gap-6 items-start pb-8 border-b border-[var(--border)]">
                <div className="sm:w-1/3 flex items-start gap-3">
                  <div className="bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 p-2 rounded-lg">
                    <Book className="w-5 h-5 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Borrowing Limit</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Maximum number of books a student can borrow at once.</p>
                  </div>
                </div>
                <div className="sm:w-2/3 w-full">
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      min="1"
                      value={formData.maxBooksPerStudent}
                      onChange={e => setFormData({ ...formData, maxBooksPerStudent: Number(e.target.value) })}
                      className="block w-full rounded-md border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] transition-colors shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-[var(--muted-foreground)] sm:text-sm">books</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Period */}
              <div className="flex flex-col sm:flex-row gap-6 items-start pb-8 border-b border-[var(--border)]">
                <div className="sm:w-1/3 flex items-start gap-3">
                  <div className="bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Loan Period</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Default due date duration when issuing books.</p>
                  </div>
                </div>
                <div className="sm:w-2/3 w-full">
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      min="1"
                      value={formData.loanPeriodDays}
                      onChange={e => setFormData({ ...formData, loanPeriodDays: Number(e.target.value) })}
                      className="block w-full rounded-md border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] transition-colors shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-[var(--muted-foreground)] sm:text-sm">days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fine Rate */}
              <div className="flex flex-col sm:flex-row gap-6 items-start pb-4">
                <div className="sm:w-1/3 flex items-start gap-3">
                  <div className="bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Overdue Fine</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Amount charged per day when a book is overdue.</p>
                  </div>
                </div>
                <div className="sm:w-2/3 w-full">
                  <div className="relative max-w-xs">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-[var(--muted-foreground)] sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.fineRatePerDay}
                      onChange={e => setFormData({ ...formData, fineRatePerDay: Number(e.target.value) })}
                      className="block w-full rounded-md border-[var(--border)] bg-[var(--background)] pl-8 pr-12 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] transition-colors shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-[var(--muted-foreground)] sm:text-sm">/ day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[var(--border)] flex justify-end">
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
