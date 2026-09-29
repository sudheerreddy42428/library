import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--color-primary-600)] p-2 rounded-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[var(--foreground)] tracking-tight">Smart LMS</span>
        </div>
        <div>
          <Button variant="outline" onClick={() => navigate('/login')} className="mr-3">Login</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto w-full relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary-500)]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--color-primary-700)]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)] mb-6 z-10">
          Smart Library <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-400)]">Management System</span>
        </h1>
        
        <p className="text-xl text-[var(--muted-foreground)] mb-12 max-w-2xl z-10">
          Manage books, borrowing, reservations, fines, digital resources, and library activities in one place.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl z-10">
          {/* Student Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[var(--color-primary-300)] transition-all cursor-pointer" onClick={() => navigate('/register/student')}>
            <div className="bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] p-4 rounded-full mb-6">
              <GraduationCap className="h-10 w-10 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">Student / User</h3>
            <p className="text-[var(--muted-foreground)] mb-8">Access digital resources, borrow books, reserve seats, and track your library activity.</p>
            <Button className="w-full mt-auto text-lg py-6 rounded-xl" onClick={(e) => { e.stopPropagation(); navigate('/register/student'); }}>
              Register as Student
            </Button>
          </div>

          {/* Librarian Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[var(--color-primary-300)] transition-all cursor-pointer" onClick={() => navigate('/register/librarian')}>
            <div className="bg-[var(--color-success-100)] dark:bg-[var(--color-success-900)] p-4 rounded-full mb-6">
              <Users className="h-10 w-10 text-[var(--color-success-600)] dark:text-[var(--color-success-400)]" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">Librarian</h3>
            <p className="text-[var(--muted-foreground)] mb-8">Manage inventory, approve requests, monitor circulation, and analyze library statistics.</p>
            <Button className="w-full mt-auto text-lg py-6 rounded-xl bg-[var(--color-success-600)] hover:bg-[var(--color-success-700)] text-white" onClick={(e) => { e.stopPropagation(); navigate('/register/librarian'); }}>
              Register as Librarian
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-[var(--muted-foreground)] border-t border-[var(--border)]">
        &copy; {new Date().getFullYear()} Smart LMS Inc. All rights reserved.
      </footer>
    </div>
  );
}
