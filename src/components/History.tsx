'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

interface HistoryEntry {
  _id: string;
  logDate: string;
  dsaProblems?: number;
  projectHours?: number;
  commitsPushed?: number;
  applicationsSent?: number;
  mockInterviews?: number;
  energyRating?: number;
  systemDesignTopic?: string;
  blocker?: string;
  top3Priorities?: string[];
}

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDays, setFilterDays] = useState(30);

  useEffect(() => {
    fetchHistory();
  }, [filterDays]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - filterDays);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const response = await fetch(`/api/daily-summary?startDate=${startStr}&endDate=${endStr}`);
      if (response.ok) {
        const data = await response.json();
        // Sort by most recent first
        setEntries(data.sort((a: any, b: any) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime()));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEnergyColor = (rating?: number) => {
    if (!rating) return 'bg-gray-100 text-gray-600';
    if (rating <= 2) return 'bg-red-100 text-red-700';
    if (rating === 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-3xl font-bold">History</h2>
        </div>
        <p className="text-green-100">View your past summaries and track your progress</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[7, 14, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setFilterDays(days)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterDays === days
                ? 'bg-green-500 text-white'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last {days} days
          </button>
        ))}
      </div>

      {/* History List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-yellow-50 rounded-lg border-2 border-yellow-300 p-8 text-center">
          <Calendar className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">No history found</p>
          <p className="text-sm text-gray-600 mt-1">Start logging your daily summaries to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="bg-white rounded-lg border-2 border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Collapsed View */}
              <button
                onClick={() => toggleExpand(entry._id)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {formatDate(entry.logDate)}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      {entry.dsaProblems !== undefined && (
                        <span className="text-gray-600">
                          DSA: <span className="font-semibold text-blue-600">{entry.dsaProblems}</span>
                        </span>
                      )}
                      {entry.projectHours !== undefined && (
                        <span className="text-gray-600">
                          Hours: <span className="font-semibold text-purple-600">{entry.projectHours.toFixed(1)}h</span>
                        </span>
                      )}
                      {entry.commitsPushed !== undefined && (
                        <span className="text-gray-600">
                          Commits: <span className="font-semibold text-green-600">{entry.commitsPushed}</span>
                        </span>
                      )}
                      {entry.energyRating !== undefined && (
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${getEnergyColor(entry.energyRating)}`}>
                          Energy: {entry.energyRating}/5
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {expandedId === entry._id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded View */}
              {expandedId === entry._id && (
                <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {/* DSA Problems */}
                    {entry.dsaProblems !== undefined && (
                      <div className="bg-white rounded border-l-4 border-blue-500 p-3">
                        <div className="text-xs text-gray-600">DSA Problems</div>
                        <div className="text-2xl font-bold text-blue-600">{entry.dsaProblems}</div>
                      </div>
                    )}

                    {/* Project Hours */}
                    {entry.projectHours !== undefined && (
                      <div className="bg-white rounded border-l-4 border-purple-500 p-3">
                        <div className="text-xs text-gray-600">Project Hours</div>
                        <div className="text-2xl font-bold text-purple-600">{entry.projectHours.toFixed(1)}</div>
                      </div>
                    )}

                    {/* Commits */}
                    {entry.commitsPushed !== undefined && (
                      <div className="bg-white rounded border-l-4 border-green-500 p-3">
                        <div className="text-xs text-gray-600">Commits Pushed</div>
                        <div className="text-2xl font-bold text-green-600">{entry.commitsPushed}</div>
                      </div>
                    )}

                    {/* Applications */}
                    {entry.applicationsSent !== undefined && (
                      <div className="bg-white rounded border-l-4 border-orange-500 p-3">
                        <div className="text-xs text-gray-600">Apps Sent</div>
                        <div className="text-2xl font-bold text-orange-600">{entry.applicationsSent}</div>
                      </div>
                    )}

                    {/* Mock Interviews */}
                    {entry.mockInterviews !== undefined && (
                      <div className="bg-white rounded border-l-4 border-pink-500 p-3">
                        <div className="text-xs text-gray-600">Interviews</div>
                        <div className="text-2xl font-bold text-pink-600">{entry.mockInterviews}</div>
                      </div>
                    )}

                    {/* Energy Rating */}
                    {entry.energyRating !== undefined && (
                      <div className="bg-white rounded border-l-4 border-yellow-500 p-3">
                        <div className="text-xs text-gray-600">Energy Level</div>
                        <div className="text-2xl font-bold text-yellow-600">{entry.energyRating}/5</div>
                      </div>
                    )}
                  </div>

                  {/* System Design Topic */}
                  {entry.systemDesignTopic && (
                    <div className="bg-white rounded border-l-4 border-blue-400 p-3 mb-3">
                      <div className="text-xs font-semibold text-gray-700 mb-1">System Design Topic</div>
                      <div className="text-gray-800">{entry.systemDesignTopic}</div>
                    </div>
                  )}

                  {/* Blocker */}
                  {entry.blocker && (
                    <div className="bg-white rounded border-l-4 border-red-400 p-3 mb-3">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Blockers/Challenges</div>
                      <div className="text-gray-800">{entry.blocker}</div>
                    </div>
                  )}

                  {/* Top 3 Priorities */}
                  {entry.top3Priorities && entry.top3Priorities.length > 0 && (
                    <div className="bg-white rounded border-l-4 border-green-400 p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Top 3 Priorities</div>
                      <ol className="space-y-1">
                        {entry.top3Priorities.map((priority, idx) => (
                          <li key={idx} className="text-sm text-gray-800 flex gap-2">
                            <span className="font-bold text-green-600">{idx + 1}.</span>
                            <span>{priority}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
