'use client';

export default function WeeklyReport({ date }: { date: Date }) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4">Weekly Report</h2>
      <p className="text-gray-600">Week view for {date.toLocaleDateString()}</p>
      <div className="mt-4 text-center text-gray-500">
        <p>Weekly report generation feature coming soon...</p>
      </div>
    </div>
  );
}
