import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Users, MapPin, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export default function SeatManagement() {
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', type: 'SEAT', capacity: 1, status: 'AVAILABLE' });

  const fetchSeats = async () => {
    try {
      const res = await api.get('/seats');
      setSeats(res.data);
    } catch (err) {
      toast.error('Failed to fetch seats/rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Name is required');
    try {
      await api.post('/seats', formData);
      toast.success('Resource added successfully');
      fetchSeats();
      setFormData({ name: '', type: 'SEAT', capacity: 1, status: 'AVAILABLE' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error adding seat/room');
    }
  };

  const filteredSeats = seats.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Facility Management</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage study rooms and library seating arrangements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-5">
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Add New Resource</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Identifier (Name/Number)</Label>
                <Input 
                  id="name"
                  placeholder="e.g. Table 4, Room A" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Resource Type</Label>
                <select 
                  id="type"
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})} 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="SEAT">Individual Seat</option>
                  <option value="ROOM">Study Room</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input 
                  id="capacity"
                  type="number" 
                  min="1" 
                  value={formData.capacity} 
                  onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} 
                />
              </div>
              <Button type="submit" className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Resource
              </Button>
            </form>
          </div>
        </div>

        {/* Resources Grid Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                className="pl-9 w-full"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1">Total: {seats.length}</Badge>
              <Badge variant="success" className="px-3 py-1">Available: {seats.filter(s => s.status === 'AVAILABLE').length}</Badge>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : filteredSeats.length === 0 ? (
            <div className="text-center py-12 bg-[var(--card)] rounded-xl border border-dashed border-[var(--border)]">
              <MapPin className="h-10 w-10 mx-auto text-[var(--muted-foreground)] opacity-20 mb-3" />
              <p className="text-[var(--muted-foreground)] font-medium">No resources found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSeats.map(seat => (
                <Card 
                  key={seat.id} 
                  className={`overflow-hidden transition-all ${
                    seat.status === 'AVAILABLE' 
                      ? 'border-[var(--color-success-200)] bg-[var(--color-success-50)]/30 dark:bg-[var(--color-success-900)]/10 hover:border-[var(--color-success-400)]' 
                      : 'border-[var(--border)] opacity-75 grayscale-[30%]'
                  }`}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="mb-2 p-2 bg-[var(--card)] rounded-full shadow-sm">
                      {seat.type === 'ROOM' ? (
                        <Users className="h-5 w-5 text-[var(--color-primary-500)]" />
                      ) : (
                        <MapPin className="h-5 w-5 text-[var(--color-primary-500)]" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-[var(--foreground)]">{seat.name}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mb-3">{seat.type === 'ROOM' ? 'Study Room' : 'Desk/Seat'} • Cap: {seat.capacity}</p>
                    {seat.status === 'AVAILABLE' ? (
                      <Badge variant="success" className="text-[10px]">Available</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Occupied</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
