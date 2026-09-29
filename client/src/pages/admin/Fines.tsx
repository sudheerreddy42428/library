import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Filter, CheckCircle2, DollarSign, Download, Ban } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dropdown } from '../../components/ui/Dropdown';

const Fines: React.FC = () => {
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFines = async () => {
    try {
      const res = await api.get('/fines');
      let data = res.data;
      if (search) {
        const s = search.toLowerCase();
        data = data.filter((f: any) => 
          f.student?.user?.name.toLowerCase().includes(s) || 
          f.issue?.book?.title.toLowerCase().includes(s)
        );
      }
      setFines(data);
    } catch (error) {
      toast.error('Failed to fetch fines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchFines, 500);
    return () => clearTimeout(delay);
  }, [search]);

  const handlePay = async (id: number) => {
    try {
      await api.post(`/fines/${id}/pay`, { paymentMethod: 'CASH' });
      toast.success('Fine marked as paid');
      fetchFines();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error paying fine');
    }
  };

  const handleWaive = async (id: number) => {
    if (!window.confirm('Are you sure you want to waive this fine?')) return;
    try {
      await api.post(`/fines/${id}/waive`);
      toast.success('Fine waived successfully');
      fetchFines();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error waiving fine');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Fine Management</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Track and collect overdue fees and penalties.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            className="pl-9 w-full"
            placeholder="Search by student or book..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filter Status
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Related Book</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : fines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                      <DollarSign className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No fines found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                fines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell>
                      <div className="font-medium text-[var(--foreground)]">{fine.student?.user?.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">ID: {fine.student?.studentId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[var(--foreground)] truncate max-w-xs" title={fine.issue?.book?.title}>
                        {fine.issue?.book?.title}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Issue #{fine.issueId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-[var(--foreground)]">₹{fine.amount}</div>
                    </TableCell>
                    <TableCell>
                      {fine.status === 'PAID' ? (
                        <Badge variant="success">Paid</Badge>
                      ) : fine.status === 'WAIVED' ? (
                        <Badge variant="secondary">Waived</Badge>
                      ) : (
                        <Badge variant="destructive">Unpaid</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dropdown 
                        items={
                          fine.status === 'UNPAID' ? [
                            { label: 'Mark as Paid (Cash)', icon: CheckCircle2, onClick: () => handlePay(fine.id) },
                            { label: 'Waive Fine', icon: Ban, onClick: () => handleWaive(fine.id) }
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
    </div>
  );
};

export default Fines;
