import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { TrendingUp, TrendingDown, Users, Building, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/stats/advanced');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-[var(--muted-foreground)]">Failed to load analytics data.</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Advanced Analytics</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Deep dive into library usage, trends, and predictions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Active Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Readers</CardTitle>
                <CardDescription>Most active students by borrowing history</CardDescription>
              </div>
              <div className="p-2 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)]/30 rounded-md">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mostActiveStudents} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--foreground)'}} width={100} />
                  <RechartsTooltip cursor={{fill: 'var(--muted)', opacity: 0.4}} contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px'}} />
                  <Bar dataKey="totalBorrowed" fill="var(--color-primary-500)" radius={[0, 4, 4, 0]} barSize={24} name="Books Read" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Borrowing */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Department Activity</CardTitle>
                <CardDescription>Circulation volume by academic department</CardDescription>
              </div>
              <div className="p-2 bg-[var(--color-success-50)] text-[var(--color-success-600)] dark:bg-[var(--color-success-900)]/30 rounded-md">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departmentBorrowing} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} />
                  <RechartsTooltip cursor={{fill: 'var(--muted)', opacity: 0.4}} contentStyle={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px'}} />
                  <Bar dataKey="count" fill="var(--color-success-500)" radius={[4, 4, 0, 0]} maxBarSize={40} name="Total Issues" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Demand Prediction Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Demand Forecasting</CardTitle>
            <CardDescription>AI-driven predictions for inventory demand based on historical data.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Title</TableHead>
                  <TableHead className="text-right">Historical Issues</TableHead>
                  <TableHead className="text-right">Predicted (Next Month)</TableHead>
                  <TableHead className="text-right">Trend Analysis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.predictions.map((p: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-[var(--foreground)]">{p.book}</TableCell>
                    <TableCell className="text-right text-[var(--muted-foreground)]">{p.historical}</TableCell>
                    <TableCell className="text-right font-bold text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">{p.estimatedNextMonth}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.trend === 'Increasing' ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-[var(--color-success-500)]" />
                            <span className="text-[var(--color-success-600)] dark:text-[var(--color-success-500)] font-medium text-sm">Increasing</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-[var(--muted-foreground)]" />
                            <span className="text-[var(--muted-foreground)] font-medium text-sm">Stable</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
