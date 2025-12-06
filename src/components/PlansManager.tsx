'use client';

import { useState, useEffect } from 'react';
import { Copy, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface PlansManagerProps {
  onPlanSelect: (planId: string | null) => void;
  onRefresh: () => void;
}

export default function PlansManager({ onPlanSelect, onRefresh }: PlansManagerProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [defaultPlans, setDefaultPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState('');
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [showDefaultPlans, setShowDefaultPlans] = useState(true);
  const [copyingPlan, setCopyingPlan] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchDefaultPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultPlans = async () => {
    try {
      const response = await fetch('/api/default-plans?action=default-plans');
      if (response.ok) {
        const data = await response.json();
        setDefaultPlans(data);
      }
    } catch (error) {
      console.error('Error fetching default plans:', error);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    setCreatingPlan(true);
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: planName, dayType: 'weekday' }),
      });

      if (response.ok) {
        setPlanName('');
        fetchPlans();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleCopyDefaultPlan = async (planName: string) => {
    setCopyingPlan(planName);
    try {
      const response = await fetch('/api/default-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName }),
      });

      if (response.ok) {
        alert('Plan copied successfully! You can now customize it.');
        fetchPlans();
      } else {
        alert('Failed to copy plan');
      }
    } catch (error) {
      console.error('Error copying plan:', error);
      alert('Error copying plan');
    } finally {
      setCopyingPlan(null);
    }
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingPlanId(planId);
    try {
      const response = await fetch(`/api/plans?id=${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Plan deleted successfully');
        fetchPlans();
      } else {
        alert('Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error deleting plan');
    } finally {
      setDeletingPlanId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Custom Plan Section */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-4">Create Custom Plan</h2>
        <form onSubmit={handleCreatePlan} className="flex gap-3">
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter your plan name..."
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={creatingPlan}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400"
          >
            Create
          </button>
        </form>
      </div>

      {/* Default Plans Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-6">
        <button
          onClick={() => setShowDefaultPlans(!showDefaultPlans)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-800">📋 Default Plans (Start Here!)</h2>
          {showDefaultPlans ? (
            <ChevronUp className="w-6 h-6 text-blue-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-blue-600" />
          )}
        </button>

        {showDefaultPlans && (
          <div className="grid gap-4">
            {defaultPlans.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Loading default plans...</div>
            ) : (
              defaultPlans.map((plan) => (
                <div key={plan.name} className="bg-white rounded-lg border-2 border-blue-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {plan.dayType === 'weekday' ? '🗓️ Weekday' : '🌅 Weekend'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {plan.activities?.length || 0} activities
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyDefaultPlan(plan.name)}
                      disabled={copyingPlan === plan.name}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 whitespace-nowrap ml-4"
                    >
                      <Copy className="w-4 h-4" />
                      {copyingPlan === plan.name ? 'Copying...' : 'Copy Plan'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* My Plans Section */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-4">📝 My Plans</h2>
        <div className="grid gap-4">
          {plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No plans created yet</p>
              <p className="text-sm mt-2">Copy a default plan above or create a custom one</p>
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan._id} className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {plan.dayType === 'weekday' ? '🗓️ Weekday' : '🌅 Weekend'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlanSelect(plan._id)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan._id, plan.name)}
                      disabled={deletingPlanId === plan._id}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingPlanId === plan._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
