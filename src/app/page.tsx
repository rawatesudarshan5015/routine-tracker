'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Calendar as CalendarIcon, FileText, BarChart3, Clock } from 'lucide-react';
import Auth from '@/components/Auth';
import Schedule from '@/components/Schedule';
import ActivityModal from '@/components/ActivityModal';
import DailySummaryForm from '@/components/DailySummaryForm';
import DailyReport from '@/components/DailyReport';
import WeeklyReport from '@/components/WeeklyReport';
import PlansManager from '@/components/PlansManager';
import History from '@/components/History';

type View = 'schedule' | 'summary' | 'daily-report' | 'weekly-report' | 'plans' | 'history';

interface User {
  id: string;
  email: string;
}

interface ActivityBlock {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  category: string;
  dayType: string;
  description: string;
}

interface DailyLog {
  id: string;
  userId: string;
  logDate: string;
  activityBlockId: string;
  completed: boolean;
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
  energyLevel?: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<ActivityBlock | null>(null);
  const [selectedLog, setSelectedLog] = useState<DailyLog | undefined>(undefined);
  const [view, setView] = useState<View>('schedule');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      setUser(data.user || null);
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handlePlanSelect = (planId: string | null) => {
    setActivePlanId(planId);
    // Automatically switch to schedule view when a plan is selected
    if (planId) {
      setView('schedule');
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => checkSession()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Schedule Tracker</h1>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex gap-2 px-6 pb-4 border-t border-gray-200 pt-4 overflow-x-auto">
            {[
              { id: 'schedule' as const, label: 'Schedule', icon: CalendarIcon },
              { id: 'summary' as const, label: 'Daily Summary', icon: FileText },
              { id: 'daily-report' as const, label: 'Daily Report', icon: BarChart3 },
              { id: 'weekly-report' as const, label: 'Weekly Report', icon: Clock },
              { id: 'plans' as const, label: 'Plans', icon: Clock },
              { id: 'history' as const, label: 'History', icon: Clock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  view === id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </header>

        {/* Date Navigation for Schedule View */}
        {view === 'schedule' && (
          <div className="bg-white border-b-2 border-gray-200 p-6">
            <div className="flex items-center justify-between max-w-xl">
              <button
                onClick={handlePreviousDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <button
                onClick={handleNextDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="p-6">
          {view === 'schedule' && (
            <Schedule
              key={refreshKey}
              date={selectedDate}
              onActivityClick={setSelectedBlock}
              onRefresh={handleRefresh}
              activePlanId={activePlanId}
            />
          )}
          {view === 'summary' && (
            <DailySummaryForm
              key={refreshKey}
              date={selectedDate}
              onRefresh={handleRefresh}
            />
          )}
          {view === 'daily-report' && (
            <DailyReport key={refreshKey} date={selectedDate} />
          )}
          {view === 'weekly-report' && (
            <WeeklyReport key={refreshKey} date={selectedDate} />
          )}
          {view === 'plans' && (
            <PlansManager
              key={refreshKey}
              onPlanSelect={handlePlanSelect}
              onRefresh={handleRefresh}
            />
          )}
          {view === 'history' && <History key={refreshKey} />}
        </main>
      </div>

      {/* Activity Modal */}
      {selectedBlock && (
        <ActivityModal
          block={selectedBlock}
          date={selectedDate}
          onClose={() => setSelectedBlock(null)}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
