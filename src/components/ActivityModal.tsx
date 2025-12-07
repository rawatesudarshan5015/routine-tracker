'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ActivityModalProps {
  block: any;
  date: Date;
  onClose: () => void;
  
}

export default function ActivityModal({ block, date, onClose }: ActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logDate: date.toISOString().split('T')[0],
          activityBlockId: block._id,
          completed,
          notes,
          energyLevel,
          actualStartTime: new Date(),
          actualEndTime: new Date(),
        }),
      });

      if (!response.ok) throw new Error('Failed to log activity');

      
      onClose();
    } catch (error) {
      console.error('Error logging activity:', error);
      alert('Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{block.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              {block.startTime} - {block.endTime} ({block.durationMinutes} min)
            </p>
            <p className="text-sm text-gray-600">Category: {block.category}</p>
            {block.description && (
              <p className="text-sm text-gray-700 mt-2">{block.description}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Add notes about this activity..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Energy Level</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEnergyLevel(level)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    energyLevel === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-gray-300"
            />
            <span className="font-semibold">Mark as completed</span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
