import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, Users, Armchair } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function SeatBooking() {
  const [seats, setSeats] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [seatsRes, bookingsRes] = await Promise.all([
        api.get('/seats'),
        api.get('/seats/my-bookings')
      ]);
      setSeats(seatsRes.data);
      setMyBookings(bookingsRes.data);
    } catch (err) {
      toast.error('Failed to fetch seat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const bookSeat = async (seatId: number) => {
    setIsBooking(seatId);
    try {
      await api.post('/seats/book', { seatOrRoomId: seatId, date, startTime, endTime });
      toast.success('Booked successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error booking seat');
    } finally {
      setIsBooking(null);
    }
  };

  const cancelBooking = async (id: number) => {
    try {
      await api.put(`/seats/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchData();
    } catch (err) {
      toast.error('Error cancelling');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESERVED':
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"><Clock className="w-3 h-3" /> {status === 'RESERVED' ? 'Reserved' : 'Pending'}</span>;
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50"><CheckCircle className="w-3 h-3" /> Active</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50"><XCircle className="w-3 h-3" /> Cancelled</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Completed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Book a Seat or Room</h1>
        <p className="text-[var(--muted-foreground)] mt-2">Reserve individual study spaces or group discussion rooms in the library.</p>
      </div>

      <div className="bg-[var(--card)] p-5 rounded-xl shadow-sm border border-[var(--border)] flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--color-primary-500)]" /> Date
          </label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-primary-500)]" /> Start Time
          </label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-primary-500)]" /> End Time
          </label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[var(--color-primary-500)]" /> Available Spaces
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(n => <div key={n} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 h-32 animate-pulse flex flex-col justify-between"><div className="w-3/4 h-5 bg-[var(--muted)] rounded"></div><div className="w-full h-8 bg-[var(--muted)] rounded mt-4"></div></div>)}
          </div>
        ) : seats.length === 0 ? (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 text-center">
            <Armchair className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">No spaces configured</h3>
            <p className="text-[var(--muted-foreground)] text-sm">The library administrator hasn't added any seats or rooms yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {seats.map(seat => (
              <div key={seat.id} className="bg-[var(--card)] hover:border-[var(--color-primary-300)] transition-colors p-5 rounded-xl border border-[var(--border)] shadow-sm flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                  {seat.type === 'ROOM' ? <Users className="w-16 h-16" /> : <Armchair className="w-16 h-16" />}
                </div>
                
                <div className="z-10 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/30 px-2 py-0.5 rounded">
                      {seat.type}
                    </span>
                    <span className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1">
                      <Users className="w-3 h-3" /> {seat.capacity}
                    </span>
                  </div>
                  <div className="font-bold text-xl text-[var(--foreground)] mb-1">{seat.name}</div>
                  <div className="text-sm text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {seat.location || 'Main Library'}
                  </div>
                </div>
                <div className="z-10 relative mt-5">
                  <Button 
                    onClick={() => bookSeat(seat.id)} 
                    disabled={isBooking === seat.id}
                    variant="outline" 
                    className="w-full justify-center group-hover:bg-[var(--color-primary-600)] group-hover:text-white group-hover:border-transparent transition-all"
                  >
                    {isBooking === seat.id ? 'Booking...' : 'Book Slot'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[var(--border)]">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">My Bookings</h2>
        <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-[var(--muted-foreground)]">Loading bookings...</div>
          ) : myBookings.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">No bookings found</h3>
              <p className="text-[var(--muted-foreground)] text-sm max-w-sm">You don't have any active or past reservations for seats or study rooms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--muted)]/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Time Slot</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                  {myBookings.map(b => (
                    <tr key={b.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${b.seatOrRoom?.type === 'ROOM' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {b.seatOrRoom?.type === 'ROOM' ? <Users className="w-4 h-4" /> : <Armchair className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--foreground)]">{b.seatOrRoom?.name}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">{b.seatOrRoom?.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">
                        {new Date(b.reservationDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)] font-medium">
                        {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {['RESERVED', 'PENDING'].includes(b.status) && (
                          <button 
                            onClick={() => cancelBooking(b.id)} 
                            className="text-[var(--color-danger-600)] hover:text-[var(--color-danger-700)] dark:text-[var(--color-danger-500)] dark:hover:text-[var(--color-danger-400)] font-medium transition-colors"
                          >
                            Cancel
                          </button>
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
    </div>
  );
}
