import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { Search, Plus, Filter, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dropdown } from '../../components/ui/Dropdown';
import { Modal } from '../../components/ui/Modal';

const Issues: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Issue Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueData, setIssueData] = useState({ studentId: '', bookId: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchIssues = async () => {
    try {
      const res = await api.get('/issues');
      let data = res.data;
      if (search) {
        const s = search.toLowerCase();
        data = data.filter((i: any) => 
          i.book?.title.toLowerCase().includes(s) || 
          i.student?.user?.name.toLowerCase().includes(s)
        );
      }
      setIssues(data);
    } catch (error) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchIssues, 500);
    return () => clearTimeout(delay);
  }, [search]);

  const handleReturn = async (id: number) => {
    try {
      await api.post(`/issues/${id}/return`);
      toast.success('Book returned successfully');
      fetchIssues();
    } catch (error) {
      toast.error('Error returning book');
    }
  };

  const handleRenew = async (id: number) => {
    try {
      await api.post(`/issues/${id}/renew`);
      toast.success('Book renewed successfully');
      fetchIssues();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error renewing book');
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/issues', issueData);
      toast.success('Book issued successfully');
      setIsIssueModalOpen(false);
      setIssueData({ studentId: '', bookId: '', dueDate: '' });
      fetchIssues();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error issuing book');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === 'RETURNED') return <Badge variant="secondary">Returned</Badge>;
    if (status === 'LOST') return <Badge variant="destructive">Lost</Badge>;
    
    const daysLeft = differenceInDays(new Date(dueDate), new Date());
    if (daysLeft < 0) return <Badge variant="destructive">Overdue</Badge>;
    if (daysLeft <= 3) return <Badge variant="warning">Due Soon</Badge>;
    
    return <Badge variant="success">Issued</Badge>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Circulation Desk</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage book check-outs, returns, and overdue items.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsIssueModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Issue Book
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            className="pl-9 w-full"
            placeholder="Search by book or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Details</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-[var(--muted-foreground)]">
                    No active issues found.
                  </TableCell>
                </TableRow>
              ) : (
                issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <div className="font-medium text-[var(--foreground)]">{issue.book?.title}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">ID: {issue.book?.isbn}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{issue.student?.user?.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Student ID: {issue.student?.studentId}</div>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--muted-foreground)]">
                      {format(new Date(issue.issueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--muted-foreground)]">
                      {format(new Date(issue.dueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(issue.status, issue.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Dropdown 
                        items={
                          issue.status !== 'RETURNED' ? [
                            { label: 'Mark Returned', icon: CheckCircle2, onClick: () => handleReturn(issue.id) },
                            { label: 'Renew Loan', icon: RotateCcw, onClick: () => handleRenew(issue.id) }
                          ] : []
                        } 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue Book">
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Student ID (Internal DB ID)</label>
            <Input 
              required 
              type="number"
              value={issueData.studentId} 
              onChange={e => setIssueData({...issueData, studentId: e.target.value})} 
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Book ID</label>
            <Input 
              required 
              type="number"
              value={issueData.bookId} 
              onChange={e => setIssueData({...issueData, bookId: e.target.value})} 
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Due Date</label>
            <Input 
              required 
              type="date"
              value={issueData.dueDate} 
              onChange={e => setIssueData({...issueData, dueDate: e.target.value})} 
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsIssueModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Issuing...' : 'Issue Book'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Issues;
