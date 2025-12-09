'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Calendar } from 'lucide-react';

interface DailySummary {
  _id: string;
  dsaProblems: number;
  projectHours: number;
  commitsPushed: number;
  systemDesignTopic?: string;
  applicationsSent: number;
  mockInterviews: number;
  energyRating?: number;
  blocker?: string;
  top3Priorities?: string[];
}

interface DailyLog {
  _id: string;
  activityName: string;
  completed: boolean;
  completedTime?: Date;
}

export default function DailyReport({ date }: { date: Date }) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [date]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];

      // Fetch daily summary
      const summaryResponse = await fetch(`/api/daily-summary?date=${dateStr}`);
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.length > 0 ? summaryData[0] : null);
      }

      // Fetch daily logs
      const logsResponse = await fetch(`/api/daily-logs?date=${dateStr}`);
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = logs.filter(log => log.completed).length;
  const completionRate = logs.length > 0 ? Math.round((completedCount / logs.length) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="text-center py-8">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6" />
          <h2 className="text-3xl font-bold">Daily Report</h2>
        </div>
        <p className="text-blue-100">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Activity Completion Summary */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-4">Activity Completion</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activities logged for this date</p>
        ) : (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Completion Rate</span>
                <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {completedCount} of {logs.length} activities completed
              </p>
            </div>

            {/* Activity List */}
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className={`p-3 rounded-lg border-l-4 ${
                    log.completed
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={log.completed ? 'text-gray-700 line-through' : 'text-gray-700 font-medium'}>
                      {log.activityName}
                    </span>
                    <span className={`text-sm font-semibold ${log.completed ? 'text-green-600' : 'text-gray-500'}`}>
                      {log.completed ? '✓ Done' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Summary Statistics */}
      {summary ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Summary Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* DSA Problems */}
            <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
              <div className="text-sm text-gray-600 mb-1">DSA Problems Solved</div>
              <div className="text-3xl font-bold text-blue-600">{summary.dsaProblems}</div>
            </div>

            {/* Project Hours */}
            <div className="bg-white rounded-lg border-2 border-purple-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Project Hours</div>
              <div className="text-3xl font-bold text-purple-600">{summary.projectHours.toFixed(1)} hrs</div>
            </div>

            {/* Commits */}
            <div className="bg-white rounded-lg border-2 border-green-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Commits Pushed</div>
              <div className="text-3xl font-bold text-green-600">{summary.commitsPushed}</div>
            </div>

            {/* Applications */}
            <div className="bg-white rounded-lg border-2 border-orange-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Applications Sent</div>
              <div className="text-3xl font-bold text-orange-600">{summary.applicationsSent}</div>
            </div>

            {/* Mock Interviews */}
            <div className="bg-white rounded-lg border-2 border-pink-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Mock Interviews</div>
              <div className="text-3xl font-bold text-pink-600">{summary.mockInterviews}</div>
            </div>

            {/* Energy Rating */}
            <div className="bg-white rounded-lg border-2 border-yellow-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Energy Rating</div>
              <div className="text-3xl font-bold text-yellow-600">{summary.energyRating || 'N/A'}/5</div>
            </div>
          </div>

          {/* System Design Topic */}
          {summary.systemDesignTopic && (
            <div className="bg-blue-50 rounded-lg border-2 border-blue-300 p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">System Design Topic</div>
              <div className="text-lg text-blue-800">{summary.systemDesignTopic}</div>
            </div>
          )}

          {/* Blockers */}
          {summary.blocker && (
            <div className="bg-red-50 rounded-lg border-2 border-red-300 p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Blockers/Challenges</div>
              <div className="text-gray-800">{summary.blocker}</div>
            </div>
          )}

          {/* Top 3 Priorities */}
          {summary.top3Priorities && summary.top3Priorities.length > 0 && (
            <div className="bg-green-50 rounded-lg border-2 border-green-300 p-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">Top 3 Priorities for Next Day</div>
              <ol className="space-y-2">
                {summary.top3Priorities.map((priority, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="font-bold text-green-700 min-w-[24px]">{index + 1}.</span>
                    <span className="text-gray-800">{priority}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg border-2 border-yellow-300 p-6 text-center">
          <BarChart3 className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">No summary data for this day</p>
          <p className="text-sm text-gray-600 mt-1">Fill out the Daily Summary to see statistics</p>
        </div>
      )}
    </div>
  );
}
