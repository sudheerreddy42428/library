import React, { useEffect, useState } from 'react';
import { Book, Users, AlertCircle, DollarSign, Bookmark, Plus, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Clock, Clock3, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/stats/dashboard'),
          api.get('/stats/activity')
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-center text-gray-500">Failed to load dashboard data.</div>;

  const kpis = [
    { title: 'Total Books', value: stats.totalBooks, icon: Book, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Available Books', value: stats.availableBooks, icon: Bookmark, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Issued Books', value: stats.issuedBooks, icon: ArrowUpRight, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { title: 'Active Students', value: stats.totalStudents, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Overdue Books', value: stats.overdueBooks, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { title: 'Pending Fines', value: `₹${stats.pendingFines}`, icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Librarian'}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Here's what's happening in your library today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Quick Action
          </Button>
        </div>
      </div>
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
              <CardTitle className="text-xs font-medium text-[var(--muted-foreground)] uppercase">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-[var(--foreground)]">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Chart: Borrowing Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Borrowing Activity</CardTitle>
            <CardDescription>Most borrowed books overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.mostBorrowed} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="title" tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'var(--muted)', opacity: 0.4}} 
                    contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px'}}
                  />
                  <Bar dataKey="issuedCopies" fill="var(--color-primary-600)" radius={[4, 4, 0, 0]} name="Issued" maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Chart: Book Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Distribution of books across categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full flex items-center justify-center">
              {stats.categoryDistribution && stats.categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.categoryDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                  <Tag className="h-8 w-8 mb-2 opacity-50" />
                  <p>No category data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Most Borrowed Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Most Borrowed Books</CardTitle>
              <CardDescription>Top performing inventory based on circulation.</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Title</TableHead>
                  <TableHead className="text-center">Total Issues</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.mostBorrowed?.length > 0 ? (
                  stats.mostBorrowed.map((book: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell className="text-center">{book.issuedCopies}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-[var(--muted-foreground)]">
                      No borrowing history available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions performed across the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.length > 0 ? (
                activity.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-[var(--foreground)] leading-none">
                        {log.user?.name} {log.action.replace('_', ' ').toLowerCase()}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                        {log.description}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-[var(--muted-foreground)]">
                  No recent activity found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Attention / Alert Panel */}
      <Card className="border-[var(--color-warning-500)] bg-[var(--color-warning-50)] dark:bg-[var(--color-warning-900)]/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-[var(--color-warning-500)] text-white rounded-md">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-warning-600)] dark:text-[var(--color-warning-500)]">Needs Attention</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Items requiring admin action today.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex flex-col p-3 bg-white dark:bg-[var(--card)] rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-2xl font-bold text-[var(--foreground)]">{stats.overdueBooks}</span>
              <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Overdue Books</span>
            </div>
            <div className="flex flex-col p-3 bg-white dark:bg-[var(--card)] rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-2xl font-bold text-[var(--foreground)]">{stats.reservedBooks}</span>
              <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Pending Reservations</span>
            </div>
            <div className="flex flex-col p-3 bg-white dark:bg-[var(--card)] rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-2xl font-bold text-[var(--foreground)]">{stats.lostDamaged}</span>
              <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Lost / Damaged</span>
            </div>
            <div className="flex flex-col p-3 bg-white dark:bg-[var(--card)] rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-2xl font-bold text-[var(--foreground)]">{stats.purchaseRequests}</span>
              <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Purchase Requests</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};

export default AdminDashboard;
