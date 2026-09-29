import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Calendar, Clock, AlertTriangle, Bookmark } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';

export default function MyBooks() {
  const [studentData, setStudentData] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get('/students/me');
      setStudentData(res.data);
      setReservations(res.data.reservations || []);
    } catch (err) {
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renewBook = async (issueId: number) => {
    try {
      await api.post(`/issues/${issueId}/renew`);
      toast.success('Book renewed successfully for 7 days!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error renewing book');
    }
  };

  const reportLost = async (bookId: number) => {
    if(!window.confirm('Are you sure you want to report this book as lost? A fine will be assessed.')) return;
    
    try {
      await api.post('/book-conditions', {
        bookId,
        status: 'LOST',
        description: 'Reported lost by student.'
      });
      toast.success('Book reported as lost.');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to report book.');
    }
  };

  const cancelReservation = async (reservationId: number) => {
    if(!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.put(`/reservations/${reservationId}/cancel`);
      toast.success('Reservation cancelled.');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!studentData) return <div className="text-center py-12 text-[var(--muted-foreground)]">Failed to load data.</div>;

  const activeIssues = studentData.issues.filter((i: any) => ['ISSUED', 'OVERDUE'].includes(i.status));
  const activeReservations = reservations.filter((r: any) => ['PENDING', 'WAITING', 'HELD'].includes(r.status));

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">My Books & Reservations</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage your active loans, track due dates, and view reservations.</p>
      </div>
      
      <Tabs defaultValue="loans">
        <TabsList className="mb-6">
          <TabsTrigger value="loans">Active Loans ({activeIssues.length})</TabsTrigger>
          <TabsTrigger value="reservations">Reservations ({activeReservations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="loans">
          {activeIssues.length === 0 ? (
            <div className="bg-[var(--card)] p-12 rounded-2xl border border-[var(--border)] text-center shadow-sm">
              <div className="inline-flex items-center justify-center p-4 bg-[var(--muted)] rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Active Loans</h2>
              <p className="text-[var(--muted-foreground)] max-w-md mx-auto mb-6">
                You don't have any books checked out right now. Visit the library catalog to find your next great read.
              </p>
              <Button onClick={() => window.location.href='/student/browse'}>Browse Catalog</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeIssues.map((issue: any) => {
                const daysLeft = differenceInDays(new Date(issue.dueDate), new Date());
                const isOverdue = daysLeft < 0;
                const maxRenewals = 2; // Business rule
                const canRenew = !isOverdue && issue.renewalCount < maxRenewals;

                return (
                  <Card key={issue.id} className="overflow-hidden flex flex-col group hover:shadow-md transition-shadow border-[var(--border)]">
                    <div className="flex p-5 gap-5 flex-1">
                      {/* Cover Image */}
                      <div className="w-24 h-36 bg-[var(--muted)] rounded-lg object-cover flex-shrink-0 shadow-sm border border-[var(--border)] overflow-hidden flex items-center justify-center">
                        {issue.book.coverImage ? (
                          <img src={issue.book.coverImage} alt={issue.book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="h-8 w-8 text-[var(--muted-foreground)] opacity-50" />
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="font-bold text-lg text-[var(--foreground)] leading-tight" title={issue.book.title}>{issue.book.title}</h3>
                          {isOverdue ? (
                            <Badge variant="destructive" className="shrink-0">Overdue</Badge>
                          ) : daysLeft <= 3 ? (
                            <Badge variant="warning" className="shrink-0">Due Soon</Badge>
                          ) : (
                            <Badge variant="success" className="shrink-0">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] mb-4">{issue.book.author?.name || 'Unknown Author'}</p>
                        
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-auto">
                          <div>
                            <p className="text-xs text-[var(--muted-foreground)] mb-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Issued On</p>
                            <p className="font-medium text-[var(--foreground)]">{format(new Date(issue.issueDate), 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--muted-foreground)] mb-0.5 flex items-center gap-1"><Clock className="h-3 w-3" /> Due Date</p>
                            <p className={`font-medium ${isOverdue ? 'text-[var(--color-danger-500)]' : 'text-[var(--foreground)]'}`}>
                              {format(new Date(issue.dueDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar & Actions */}
                    <div className="bg-[var(--muted)]/30 border-t border-[var(--border)] p-4">
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-[var(--muted-foreground)] font-medium">Renewals Used: <span className="text-[var(--foreground)]">{issue.renewalCount || 0} / {maxRenewals}</span></span>
                        {isOverdue && <span className="text-[var(--color-danger-500)] font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Cannot renew overdue books</span>}
                        {!isOverdue && issue.renewalCount >= maxRenewals && <span className="text-[var(--color-warning-600)] font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Max renewals reached</span>}
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1"
                          onClick={() => renewBook(issue.id)}
                          disabled={!canRenew}
                          variant={canRenew ? 'default' : 'outline'}
                        >
                          Renew (+7 Days)
                        </Button>
                        <Button 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => reportLost(issue.book.id)}
                        >
                          Report Lost
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reservations">
          {activeReservations.length === 0 ? (
            <div className="bg-[var(--card)] p-12 rounded-2xl border border-[var(--border)] text-center shadow-sm">
              <div className="inline-flex items-center justify-center p-4 bg-[var(--muted)] rounded-full mb-4">
                <Bookmark className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Reservations</h2>
              <p className="text-[var(--muted-foreground)] max-w-md mx-auto mb-6">
                You haven't reserved any books. Add unavailable books to your cart to reserve them.
              </p>
              <Button onClick={() => window.location.href='/student/browse'}>Browse Catalog</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeReservations.map((res: any) => (
                <Card key={res.id} className="overflow-hidden flex flex-col group border-[var(--border)]">
                  <div className="flex p-5 gap-5 flex-1">
                    <div className="w-20 h-28 bg-[var(--muted)] rounded-lg object-cover flex-shrink-0 shadow-sm border border-[var(--border)] overflow-hidden flex items-center justify-center">
                      {res.book.coverImage ? (
                        <img src={res.book.coverImage} alt={res.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-6 w-6 text-[var(--muted-foreground)] opacity-50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-lg text-[var(--foreground)] leading-tight">{res.book.title}</h3>
                        {res.status === 'HELD' ? <Badge variant="success">Held for Pickup</Badge> : <Badge variant="warning">Waiting List</Badge>}
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] mb-3">Reserved on {format(new Date(res.reservationDate), 'MMM d, yyyy')}</p>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <div className="text-sm font-medium">
                          Queue Position: <span className="text-[var(--primary)]">#{res.queuePosition}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => cancelReservation(res.id)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
