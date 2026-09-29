import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Wrench, RefreshCw, FileMinus, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function BookConditions() {
  const [conditions, setConditions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConditions = async () => {
    try {
      const res = await api.get('/book-conditions');
      setConditions(res.data);
    } catch (err) {
      toast.error('Failed to fetch conditions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const resolveCondition = async (id: number, action: string) => {
    try {
      await api.put(`/book-conditions/${id}/resolve`, { action });
      toast.success(`Resolved via ${action}`);
      fetchConditions();
    } catch (err) {
      toast.error('Error resolving condition');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOST':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">Lost</span>;
      case 'DAMAGED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">Damaged</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Lost & Damaged Books</h1>
        <p className="text-[var(--muted-foreground)] mt-2">Manage reports of lost or damaged inventory and their resolutions.</p>
      </div>
      
      <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">Loading records...</div>
        ) : conditions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--color-success-50)] dark:bg-[var(--color-success-900)]/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-[var(--color-success-600)] dark:text-[var(--color-success-400)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">All clear!</h3>
            <p className="text-[var(--muted-foreground)] max-w-sm mx-auto">There are currently no unresolved reports of lost or damaged books.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--muted)]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Book</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Reported</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Resolution Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                {conditions.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[var(--foreground)]">{c.book?.title}</div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5">ID: {c.bookId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--foreground)] max-w-xs truncate" title={c.description}>
                        {c.description || <span className="text-[var(--muted-foreground)] italic">No description provided</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--foreground)]">{new Date(c.reportedAt).toLocaleDateString()}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{new Date(c.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!c.resolvedAt ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-sm border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={() => resolveCondition(c.id, 'REPAIRED')} title="Mark as Repaired">
                            <Wrench className="w-4 h-4 mr-1" /> Repaired
                          </Button>
                          <Button size="sm" variant="outline" className="text-sm border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={() => resolveCondition(c.id, 'REPLACED')} title="Mark as Replaced">
                            <RefreshCw className="w-4 h-4 mr-1" /> Replaced
                          </Button>
                          <Button size="sm" variant="outline" className="text-sm bg-[var(--color-danger-50)] text-[var(--color-danger-700)] border-[var(--color-danger-200)] hover:bg-[var(--color-danger-100)] dark:bg-[var(--color-danger-900)]/20 dark:text-[var(--color-danger-400)] dark:border-[var(--color-danger-800)]" onClick={() => resolveCondition(c.id, 'WRITTEN_OFF')} title="Write-Off">
                            <FileMinus className="w-4 h-4 mr-1" /> Write-Off
                          </Button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <CheckCircle2 className="w-3 h-3 text-[var(--color-success-500)]" />
                          Resolved
                        </span>
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
