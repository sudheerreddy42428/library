import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Check, X, ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PurchaseRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/purchase-requests');
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/purchase-requests/${id}/status`, { status });
      toast.success('Status updated');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50"><Clock className="w-3 h-3" /> Pending</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'PURCHASED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50"><ShoppingCart className="w-3 h-3" /> Purchased</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Purchase Requests</h1>
        <p className="text-[var(--muted-foreground)] mt-2">Manage and review book requests submitted by students.</p>
      </div>
      
      <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">No pending requests</h3>
            <p className="text-[var(--muted-foreground)] max-w-sm mx-auto">There are currently no book purchase requests from students.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--muted)]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Requested Book</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Requested By</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[var(--foreground)]">{req.title}</div>
                      {req.author && <div className="text-sm text-[var(--muted-foreground)] mt-0.5">by {req.author}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {req.isbn && <div className="text-xs text-[var(--muted-foreground)]"><span className="font-semibold">ISBN:</span> {req.isbn}</div>}
                      {req.category && <div className="text-xs text-[var(--muted-foreground)]"><span className="font-semibold">Category:</span> {req.category}</div>}
                      {req.reason && <div className="text-xs text-[var(--muted-foreground)] mt-1 max-w-xs truncate" title={req.reason}><span className="font-semibold">Reason:</span> {req.reason}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--foreground)]">{req.student?.user?.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{req.student?.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {req.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="bg-[var(--color-success-50)] text-[var(--color-success-700)] border-[var(--color-success-200)] hover:bg-[var(--color-success-100)] dark:bg-[var(--color-success-900)]/20 dark:text-[var(--color-success-400)] dark:border-[var(--color-success-800)]" onClick={() => updateStatus(req.id, 'APPROVED')}>
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="bg-[var(--color-danger-50)] text-[var(--color-danger-700)] border-[var(--color-danger-200)] hover:bg-[var(--color-danger-100)] dark:bg-[var(--color-danger-900)]/20 dark:text-[var(--color-danger-400)] dark:border-[var(--color-danger-800)]" onClick={() => updateStatus(req.id, 'REJECTED')}>
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {req.status === 'APPROVED' && (
                        <Button size="sm" onClick={() => updateStatus(req.id, 'PURCHASED')}>
                          <ShoppingCart className="w-4 h-4 mr-1" /> Mark Purchased
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
