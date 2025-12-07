'use client';

import { useState, useEffect } from 'react';

interface DailySummaryFormProps {
  date: Date;
  
}

export default function DailySummaryForm({ date, }: DailySummaryFormProps) {
  const [formData, setFormData] = useState({
    dsaProblems: 0,
    projectHours: 0,
    commitsPushed: 0,
    systemDesignTopic: '',
    applicationsSent: 0,
    mockInterviews: 0,
    energyRating: 3,
    blocker: '',
    top3Priorities: ['', '', ''],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logDate: date.toISOString().split('T')[0],
          ...formData,
          top3Priorities: formData.top3Priorities.filter(p => p.trim()),
        }),
      });

      if (!response.ok) throw new Error('Failed to save summary');

      alert('Summary saved successfully!');
      
    } catch (error) {
      console.error('Error saving summary:', error);
      alert('Failed to save summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Daily Summary</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">DSA Problems Solved</label>
            <input
              type="number"
              min="0"
              value={formData.dsaProblems}
              onChange={(e) =>
                setFormData({ ...formData, dsaProblems: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Project Hours</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.projectHours}
              onChange={(e) =>
                setFormData({ ...formData, projectHours: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Commits Pushed</label>
            <input
              type="number"
              min="0"
              value={formData.commitsPushed}
              onChange={(e) =>
                setFormData({ ...formData, commitsPushed: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Applications Sent</label>
            <input
              type="number"
              min="0"
              value={formData.applicationsSent}
              onChange={(e) =>
                setFormData({ ...formData, applicationsSent: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">System Design Topic</label>
            <input
              type="text"
              value={formData.systemDesignTopic}
              onChange={(e) =>
                setFormData({ ...formData, systemDesignTopic: e.target.value })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              placeholder="e.g., Load Balancing"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Mock Interviews</label>
            <input
              type="number"
              min="0"
              value={formData.mockInterviews}
              onChange={(e) =>
                setFormData({ ...formData, mockInterviews: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Energy Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, energyRating: level })}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  formData.energyRating === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Blockers</label>
          <textarea
            value={formData.blocker}
            onChange={(e) => setFormData({ ...formData, blocker: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            rows={3}
            placeholder="What blocked you today?"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Top 3 Priorities</label>
          {formData.top3Priorities.map((priority, index) => (
            <input
              key={index}
              type="text"
              value={priority}
              onChange={(e) => {
                const newPriorities = [...formData.top3Priorities];
                newPriorities[index] = e.target.value;
                setFormData({ ...formData, top3Priorities: newPriorities });
              }}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg mb-2"
              placeholder={`Priority ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Save Summary'}
        </button>
      </form>
    </div>
  );
}
