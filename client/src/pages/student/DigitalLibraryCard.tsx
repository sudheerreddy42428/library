import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';
import { ShieldCheck, BookOpen, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function DigitalLibraryCard() {
  const { user } = useAuth();
  const [studentDetails, setStudentDetails] = useState<any>(null);

  useEffect(() => {
    // In a real app, you might fetch specific student details here like studentId
    // For now we'll just use the user object
    if (user && user.role === 'STUDENT') {
      setStudentDetails({
        id: `STU-${user.id.toString().padStart(4, '0')}`,
        validUntil: new Date(new Date().getFullYear() + 4, 4, 31).toLocaleDateString()
      });
    }
  }, [user]);

  if (!user || user.role !== 'STUDENT') return null;

  const cardData = JSON.stringify({
    userId: user.id,
    email: user.email,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Digital ID Card</h1>
        <p className="text-[var(--muted-foreground)] mt-2">Your unified access pass for the library kiosks, gates, and borrowing.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Card Container */}
        <div className="w-full lg:w-auto relative perspective-1000 group">
          <div className="w-full max-w-sm mx-auto lg:mx-0 relative transition-transform duration-500 transform-style-3d group-hover:rotate-y-5">
            {/* Front of card */}
            <div className="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] rounded-2xl shadow-xl overflow-hidden text-white relative">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
              
              <div className="p-8 text-center relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold tracking-tight text-white/90">SmartLib</span>
                  </div>
                  <div className="text-white/60 font-mono text-xs uppercase flex flex-col items-end">
                    <span>Valid Thru</span>
                    <span className="font-bold text-white/90">{studentDetails?.validUntil}</span>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-xl inline-block shadow-lg mb-6 ring-4 ring-white/20">
                  <QRCode value={cardData} size={160} level="Q" className="rounded-md" />
                </div>
                
                <div className="text-left space-y-1 mt-2">
                  <h3 className="text-2xl font-bold tracking-tight">{user.name}</h3>
                  <div className="flex justify-between items-center text-sm">
                    <p className="text-white/70 font-mono">{studentDetails?.id}</p>
                    <p className="text-[var(--color-primary-200)] uppercase font-semibold tracking-wider text-xs bg-black/20 px-2 py-0.5 rounded">Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Panel */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--color-success-500)]" />
              How to use your Digital ID
            </h3>
            <ul className="space-y-4 text-[var(--muted-foreground)]">
              <li className="flex gap-3 items-start">
                <div className="bg-[var(--muted)] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p>Present the QR code on your screen at the library entrance gates for automated entry.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="bg-[var(--muted)] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p>Scan your code at the self-service borrowing kiosks when checking out books.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="bg-[var(--muted)] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <p>The code refreshes automatically for security. Do not screenshot it.</p>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-[var(--border)] flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
