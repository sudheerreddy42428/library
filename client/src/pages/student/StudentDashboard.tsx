import React, { useEffect, useState } from 'react';
import { Book, Bookmark, DollarSign, Award, MapPin, Clock, Calendar, ArrowRight, BookOpen, Search, QrCode, MessageSquare, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    fetchStudentData();
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem('hasSeenWelcomeModal', 'true');
    setShowWelcome(false);
  };

  const fetchStudentData = async () => {
    try {
      const res = await api.get('/students/me');
      setStudentData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (issueId: number) => {
    try {
      await api.post(`/issues/${issueId}/renew`);
      toast.success("Book renewed successfully for 7 days!");
      fetchStudentData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to renew book");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!studentData) return <div className="p-8 text-center text-gray-500">Error loading student data</div>;

  const currentIssues = studentData.issues.filter((i: any) => ['ISSUED', 'OVERDUE'].includes(i.status));
  const pendingFines = studentData.fines.filter((f: any) => f.status === 'UNPAID').reduce((acc: number, f: any) => acc + f.amount, 0);
  const readingActivity = studentData.readingActivity;
  const activeReservations = studentData.reservations.filter((r: any) => !['CANCELLED', 'FULFILLED', 'EXPIRED'].includes(r.status));
  
  // Get books due in the next 3 days
  const dueSoon = currentIssues.filter((i: any) => {
    const daysLeft = differenceInDays(new Date(i.dueDate), new Date());
    return daysLeft >= 0 && daysLeft <= 3;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {showWelcome && (
        <Card className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)] relative">
          <button 
            onClick={dismissWelcome}
            className="absolute top-3 right-3 text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)]"
          >
            <X className="h-5 w-5" />
          </button>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[var(--color-primary-800)] mb-2">Welcome to your Library Account! 🎉</h2>
            <p className="text-[var(--color-primary-700)] max-w-3xl">
              We're excited to have you here. This dashboard is your central hub for managing borrowed books, discovering new reads, reserving study spaces, and tracking your reading activity. Let's get started!
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={() => navigate('/student/browse')}>Explore Catalog</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-800)] rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="mt-2 text-[var(--color-primary-100)] max-w-lg">
            Here's an overview of your library activity. Discover new books and manage your current loans.
          </p>
        </div>
        {readingActivity && (
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="p-3 bg-yellow-400 text-yellow-900 rounded-lg shadow-inner">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary-100)]">Reading Level</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">Level {readingActivity.level || Math.floor((readingActivity.points || 0) / 100) + 1}</span>
                <span className="text-sm opacity-80">{readingActivity.points || 0} pts</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)]/30 rounded-full mb-2">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{currentIssues.length}</p>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Borrowed Books</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-[var(--color-warning-50)] text-[var(--color-warning-600)] dark:bg-[var(--color-warning-900)]/30 rounded-full mb-2">
              <Bookmark className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{activeReservations.length}</p>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Reservations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-[var(--color-danger-50)] text-[var(--color-danger-600)] dark:bg-[var(--color-danger-900)]/30 rounded-full mb-2">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">₹{pendingFines}</p>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Pending Fines</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-[var(--color-success-50)] text-[var(--color-success-600)] dark:bg-[var(--color-success-900)]/30 rounded-full mb-2">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{studentData.seatReservations.filter((s:any) => s.status === 'RESERVED').length}</p>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Seat Bookings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Currently Borrowed & Due Soon */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Due Soon Alert */}
          {dueSoon.length > 0 && (
            <Card className="border-[var(--color-warning-500)] bg-[var(--color-warning-50)] dark:bg-[var(--color-warning-900)]/10">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--color-warning-500)] text-white rounded-md">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-warning-600)] dark:text-[var(--color-warning-500)]">Due Soon</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">You have {dueSoon.length} book(s) due in the next 3 days.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/student/my-books')}>View Details</Button>
              </CardContent>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Currently Borrowed</h2>
              <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => navigate('/student/my-books')}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {currentIssues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentIssues.slice(0, 4).map((issue: any) => {
                  const daysLeft = differenceInDays(new Date(issue.dueDate), new Date());
                  const isOverdue = daysLeft < 0;
                  
                  return (
                    <Card key={issue.id} className="overflow-hidden flex flex-col">
                      <div className="flex p-4 gap-4 flex-1">
                        <div className="w-16 h-24 bg-[var(--muted)] rounded object-cover flex-shrink-0 shadow-sm border border-[var(--border)] overflow-hidden">
                          {issue.book.coverImage ? (
                            <img src={issue.book.coverImage} alt={issue.book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">
                              <Book className="h-8 w-8 opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-[var(--foreground)] truncate" title={issue.book.title}>{issue.book.title}</h3>
                            <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">ID: {issue.book.isbn}</p>
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <Calendar className="h-3.5 w-3.5" />
                              {isOverdue ? (
                                <span className="text-[var(--color-danger-500)]">Overdue by {Math.abs(daysLeft)} days</span>
                              ) : (
                                <span>Due {format(new Date(issue.dueDate), 'MMM d, yyyy')}</span>
                              )}
                            </div>
                            {/* Simple Progress Bar */}
                            <div className="w-full bg-[var(--muted)] rounded-full h-1.5 mt-2">
                              <div 
                                className={`h-1.5 rounded-full ${isOverdue ? 'bg-[var(--color-danger-500)]' : daysLeft <= 3 ? 'bg-[var(--color-warning-500)]' : 'bg-[var(--color-primary-500)]'}`} 
                                style={{ width: `${Math.max(0, Math.min(100, isOverdue ? 100 : 100 - (daysLeft * 7)))}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[var(--muted)]/30 border-t border-[var(--border)] p-3 flex justify-between items-center">
                        <span className="text-xs text-[var(--muted-foreground)]">Renewed: {issue.renewalCount}/2</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs" 
                          onClick={() => handleRenew(issue.id)}
                          disabled={isOverdue || issue.renewalCount >= 2}
                        >
                          Renew Book
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-[var(--muted)]/20 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-[var(--card)] p-4 rounded-full shadow-sm mb-4">
                    <BookOpen className="h-8 w-8 text-[var(--muted-foreground)]" />
                  </div>
                  <h3 className="text-lg font-medium text-[var(--foreground)]">No active loans</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm mb-6">
                    You haven't borrowed any books currently. Explore the library catalog to find your next read!
                  </p>
                  <Button onClick={() => navigate('/student/browse')}>Browse Catalog</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Reservations & Quick Actions */}
        <div className="space-y-8">
          
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight mb-4">My Reservations</h2>
            <Card>
              <CardContent className="p-0">
                {activeReservations.length > 0 ? (
                  <div className="divide-y divide-[var(--border)]">
                    {activeReservations.map((res: any) => (
                      <div key={res.id} className="p-4 flex items-center justify-between hover:bg-[var(--muted)]/50 transition-colors">
                        <div className="min-w-0 pr-4">
                          <p className="text-sm font-semibold text-[var(--foreground)] truncate" title={res.book.title}>
                            {res.book.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={res.status === 'NOTIFIED' ? 'success' : 'secondary'} className="text-[10px] px-1.5">
                              {res.status}
                            </Badge>
                            {res.status === 'WAITING' && (
                              <span className="text-xs text-[var(--muted-foreground)]">Queue: #{res.queuePosition}</span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-[var(--muted-foreground)]">
                    You have no active reservations.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/student/browse" className="flex flex-col items-center justify-center p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-md hover:border-[var(--color-primary-300)] transition-all group">
                <Search className="h-6 w-6 text-[var(--color-primary-500)] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-[var(--foreground)] text-center">Search Books</span>
              </Link>
              <Link to="/student/seat-booking" className="flex flex-col items-center justify-center p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-md hover:border-[var(--color-primary-300)] transition-all group">
                <MapPin className="h-6 w-6 text-[var(--color-primary-500)] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-[var(--foreground)] text-center">Book a Seat</span>
              </Link>
              <Link to="/student/id" className="flex flex-col items-center justify-center p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-md hover:border-[var(--color-primary-300)] transition-all group">
                <QrCode className="h-6 w-6 text-[var(--color-primary-500)] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-[var(--foreground)] text-center">Digital ID</span>
              </Link>
              <Link to="/student/request" className="flex flex-col items-center justify-center p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-md hover:border-[var(--color-primary-300)] transition-all group">
                <MessageSquare className="h-6 w-6 text-[var(--color-primary-500)] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-[var(--foreground)] text-center">Request Book</span>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
