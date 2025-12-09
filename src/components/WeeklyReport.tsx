'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

interface WeeklySummary {
  _id: string;
  date: string;
  dsaProblems: number;
  projectHours: number;
  commitsPushed: number;
  applicationsSent: number;
  mockInterviews: number;
  energyRating?: number;
}

interface WeeklyStats {
  totalDsaProblems: number;
  totalProjectHours: number;
  totalCommits: number;
  totalApplications: number;
  totalMockInterviews: number;
  avgEnergyRating: number;
  daysTracked: number;
}

export default function WeeklyReport({ date }: { date: Date }) {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyData();
  }, [date]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);

      // Calculate week start and end
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];

      // Fetch weekly summaries
      const response = await fetch(`/api/daily-summary?startDate=${startStr}&endDate=${endStr}`);
      if (response.ok) {
        const data = await response.json();
        setSummaries(data);

        // Calculate statistics
        if (data.length > 0) {
          const totals = data.reduce(
            (acc: any, item: any) => ({
              dsaProblems: acc.dsaProblems + (item.dsaProblems || 0),
              projectHours: acc.projectHours + (item.projectHours || 0),
              commits: acc.commits + (item.commitsPushed || 0),
              applications: acc.applications + (item.applicationsSent || 0),
              mockInterviews: acc.mockInterviews + (item.mockInterviews || 0),
              energyRating: acc.energyRating + (item.energyRating || 0),
            }),
            {
              dsaProblems: 0,
              projectHours: 0,
              commits: 0,
              applications: 0,
              mockInterviews: 0,
              energyRating: 0,
            }
          );

          setStats({
            totalDsaProblems: totals.dsaProblems,
            totalProjectHours: totals.projectHours,
            totalCommits: totals.commits,
            totalApplications: totals.applications,
            totalMockInterviews: totals.mockInterviews,
            avgEnergyRating: Math.round((totals.energyRating / data.length) * 10) / 10,
            daysTracked: data.length,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="text-center py-8">Loading weekly report...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-3xl font-bold">Weekly Report</h2>
        </div>
        <p className="text-purple-100">
          {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
          {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Weekly Statistics */}
      {stats ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Weekly Statistics</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* DSA Problems */}
            <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
              <div className="text-sm text-gray-600 mb-1">DSA Problems</div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalDsaProblems}</div>
              <div className="text-xs text-gray-500 mt-1">Solved this week</div>
            </div>

            {/* Project Hours */}
            <div className="bg-white rounded-lg border-2 border-purple-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Project Hours</div>
              <div className="text-3xl font-bold text-purple-600">{stats.totalProjectHours.toFixed(1)}</div>
              <div className="text-xs text-gray-500 mt-1">Hours this week</div>
            </div>

            {/* Commits */}
            <div className="bg-white rounded-lg border-2 border-green-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Commits Pushed</div>
              <div className="text-3xl font-bold text-green-600">{stats.totalCommits}</div>
              <div className="text-xs text-gray-500 mt-1">This week</div>
            </div>

            {/* Applications */}
            <div className="bg-white rounded-lg border-2 border-orange-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Applications Sent</div>
              <div className="text-3xl font-bold text-orange-600">{stats.totalApplications}</div>
              <div className="text-xs text-gray-500 mt-1">This week</div>
            </div>

            {/* Mock Interviews */}
            <div className="bg-white rounded-lg border-2 border-pink-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Mock Interviews</div>
              <div className="text-3xl font-bold text-pink-600">{stats.totalMockInterviews}</div>
              <div className="text-xs text-gray-500 mt-1">This week</div>
            </div>

            {/* Avg Energy */}
            <div className="bg-white rounded-lg border-2 border-yellow-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Avg Energy</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.avgEnergyRating}/5</div>
              <div className="text-xs text-gray-500 mt-1">Throughout week</div>
            </div>
          </div>

          {/* Days Tracked */}
          <div className="bg-blue-50 rounded-lg border-2 border-blue-300 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-700">Days Tracked</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{stats.daysTracked} / 7 days</div>
              </div>
              <div className="w-16 h-16">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray={`${(stats.daysTracked / 7) * 282.7} 282.7`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg border-2 border-yellow-300 p-6 text-center">
          <Calendar className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">No data for this week</p>
          <p className="text-sm text-gray-600 mt-1">Fill out daily summaries to see weekly insights</p>
        </div>
      )}

      {/* Daily Breakdown */}
      {summaries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Daily Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaries.map((summary) => (
              <div key={summary._id} className="bg-white rounded-lg border-2 border-gray-200 p-4">
                <div className="font-semibold text-gray-800 mb-3">
                  {new Date(summary.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">DSA:</span>
                    <span className="font-semibold ml-2">{summary.dsaProblems}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Hours:</span>
                    <span className="font-semibold ml-2">{summary.projectHours}h</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Commits:</span>
                    <span className="font-semibold ml-2">{summary.commitsPushed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Apps:</span>
                    <span className="font-semibold ml-2">{summary.applicationsSent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
