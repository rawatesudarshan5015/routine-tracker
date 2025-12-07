'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface ScheduleProps {
  date: Date;
  onActivityClick: (block: any) => void;
  onRefresh: () => void;
  activePlanId: string | null;
}

export default function Schedule({ date, onActivityClick, onRefresh, activePlanId }: ScheduleProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '10:00',
    category: '',
    description: '',
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, activePlanId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      if (!activePlanId) {
        setActivities([]);
        return;
      }

      // Fetch activities for the selected plan without filtering by dayType
      // This shows the same plan for all days
      const response = await fetch(`/api/activity-blocks?planId=${activePlanId}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      
      const data = await response.json();
      setActivities(data);

      // Fetch logs for this date
      const logsResponse = await fetch(
        `/api/daily-logs?date=${date.toISOString().split('T')[0]}`
      );
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanId || !formData.name || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setAdding(true);
    try {
      const durationMinutes = calculateDuration(formData.startTime, formData.endTime);
      
      // Get the dayType from the plan's activities or default to weekday
      const dayType = date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : 'weekday';

      const response = await fetch('/api/activity-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: activePlanId,
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          durationMinutes,
          category: formData.category,
          dayType,
          description: formData.description,
        }),
      });

      if (!response.ok) throw new Error('Failed to add activity');

      setFormData({
        name: '',
        startTime: '09:00',
        endTime: '10:00',
        category: '',
        description: '',
      });
      setShowAddActivity(false);
      fetchActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading schedule...</div>;
  }

  if (!activePlanId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Please select a plan first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Activity Form */}
      {showAddActivity && (
        <div className="bg-white rounded-lg border-2 border-blue-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Add Activity to Routine</h3>
            <button
              onClick={() => setShowAddActivity(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddActivity} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Activity Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Morning Jog"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Category</option>
                  <option value="exercise">Exercise</option>
                  <option value="work">Work</option>
                  <option value="meal">Meal</option>
                  <option value="break">Break</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description (optional)"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddActivity(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
              >
                {adding ? 'Adding...' : 'Add Activity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Activity Button */}
      {!showAddActivity && (
        <button
          onClick={() => setShowAddActivity(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Activity to Routine
        </button>
      )}

      {/* Activities List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Daily Routine</h2>
        {activities.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border-2 border-gray-200">
            <p className="text-gray-500">No activities scheduled for this day</p>
            <p className="text-sm text-gray-400 mt-2">Click &quot;Add Activity to Routine&quot; to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activities.map((activity) => {
              const log = logs.find((l) => l.activityBlockId === activity._id);
              return (
                <div
                  key={activity._id}
                  onClick={() => onActivityClick(activity)}
                  className="bg-white rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{activity.name}</h3>
                      <p className="text-sm text-gray-600">
                        {activity.startTime} - {activity.endTime}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.category}</p>
                      {activity.description && (
                        <p className="text-xs text-gray-600 mt-2">{activity.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">
                          {activity.durationMinutes} min
                        </p>
                      </div>
                      {log && (
                        <div
                          className={`w-4 h-4 rounded-full ${
                            log.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}