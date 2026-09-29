import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { format } from 'date-fns';

export default function Reservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations');
      setReservations(res.data);
    } catch (err) {
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/reservations/${id}/status`, { status });
      toast.success(`Reservation status updated to ${status}`);
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update reservation');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'WAITING':
        return <Badge variant="warning">Waiting</Badge>;
      case 'HELD':
        return <Badge variant="success">Held for Pickup</Badge>;
      case 'COMPLETED':
      case 'FULFILLED':
        return <Badge variant="default">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Reservations</h1>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                <TableHead className="text-left p-4 font-medium text-[var(--muted-foreground)]">Student</TableHead>
                <TableHead className="text-left p-4 font-medium text-[var(--muted-foreground)]">Book</TableHead>
                <TableHead className="text-left p-4 font-medium text-[var(--muted-foreground)]">Date</TableHead>
                <TableHead className="text-left p-4 font-medium text-[var(--muted-foreground)]">Status</TableHead>
                <TableHead className="text-right p-4 font-medium text-[var(--muted-foreground)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-[var(--muted-foreground)]">Loading...</TableCell>
                </TableRow>
              ) : reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-[var(--muted-foreground)]">No reservations found</TableCell>
                </TableRow>
              ) : (
                reservations.map((res: any) => (
                  <TableRow key={res.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/20 transition-colors">
                    <TableCell className="p-4">
                      <div className="font-medium text-[var(--foreground)]">{res.student?.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{res.student?.studentId}</div>
                    </TableCell>
                    <TableCell className="p-4 text-sm font-medium">{res.book?.title}</TableCell>
                    <TableCell className="p-4 text-sm text-[var(--muted-foreground)]">{format(new Date(res.reservationDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="p-4">{getStatusBadge(res.status)}</TableCell>
                    <TableCell className="p-4 text-right">
                      {['WAITING', 'PENDING', 'HELD'].includes(res.status) && (
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(res.id, 'FULFILLED')}>Approve/Fulfill</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusChange(res.id, 'CANCELLED')}>Cancel</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
