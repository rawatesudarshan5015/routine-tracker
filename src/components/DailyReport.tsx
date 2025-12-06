'use client';

export default function DailyReport({ date }: { date: Date }) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4">Daily Report</h2>
      <p className="text-gray-600">
        Report for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
      <div className="mt-4 text-center text-gray-500">
        <p>Report generation feature coming soon...</p>
      </div>
    </div>
  );
}
