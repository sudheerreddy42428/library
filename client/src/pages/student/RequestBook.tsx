import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function RequestBook() {
  const [requests, setRequests] = useState<any[]>([]);
  const [formData, setFormData] = useState({ title: '', author: '', isbn: '', category: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/purchase-requests/my-requests');
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to fetch your requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/purchase-requests', formData);
      toast.success('Book request submitted!');
      setFormData({ title: '', author: '', isbn: '', category: '', reason: '' });
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50"><Clock className="w-3 h-3" /> Pending</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'PURCHASED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50"><BookOpen className="w-3 h-3" /> Purchased</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Request a Book</h1>
        <p className="text-[var(--muted-foreground)] mt-2">Suggest books you'd like the library to purchase for the collection.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/30 p-2.5 rounded-lg text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">Request Guidelines</h3>
            </div>
            <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
              <li className="flex gap-2"><span className="text-[var(--color-primary-500)]">•</span> Ensure the book is not already in our catalog before requesting.</li>
              <li className="flex gap-2"><span className="text-[var(--color-primary-500)]">•</span> Provide as much detail as possible (especially ISBN) to help us find the correct edition.</li>
              <li className="flex gap-2"><span className="text-[var(--color-primary-500)]">•</span> Academic and reference books related to courses are prioritized.</li>
              <li className="flex gap-2"><span className="text-[var(--color-primary-500)]">•</span> You will be notified when the book arrives.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="bg-[var(--card)] p-6 sm:p-8 rounded-xl shadow-sm border border-[var(--border)]">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--color-primary-500)]" />
              Book Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Book Title <span className="text-[var(--color-danger-500)]">*</span></label>
                <input required type="text" placeholder="E.g. Clean Architecture" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50 transition-shadow" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Author</label>
                <input type="text" placeholder="E.g. Robert C. Martin" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50 transition-shadow" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">ISBN (Optional)</label>
                <input type="text" placeholder="13-digit ISBN if known" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} className="block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50 transition-shadow" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Category</label>
                <input type="text" placeholder="E.g. Software Engineering" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50 transition-shadow" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Reason for Request <span className="text-[var(--color-danger-500)]">*</span></label>
                <textarea required rows={4} placeholder="Why do you need this book? Is it for a specific course or project?" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50 transition-shadow resize-none"></textarea>
              </div>
              <div className="col-span-2 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Submitting...' : <><Send className="w-4 h-4 mr-2" /> Submit Request</>}
                </Button>
              </div>
            </div>
          </form>

          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Your Past Requests</h2>
            <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-[var(--muted-foreground)]">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-[var(--muted-foreground)]" />
                  </div>
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">No requests yet</h3>
                  <p className="text-[var(--muted-foreground)] text-sm max-w-sm">You haven't submitted any book purchase requests. Use the form above to suggest a book.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--muted)]/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Book Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Date Requested</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                      {requests.map(req => (
                        <tr key={req.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-[var(--foreground)]">{req.title}</div>
                            {req.author && <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{req.author}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">
                            {new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {getStatusBadge(req.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
