import React from 'react';
import { Trash2, Calendar, Users, ArrowRight } from 'lucide-react';

/**
 * Sidebar component displaying history of past generated cooking plans.
 */
export default function HistorySidebar({ plans, activePlanId, onSelectPlan, onDeletePlan }) {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col h-[300px] lg:h-auto overflow-hidden shrink-0" aria-label="Meal Plan History">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-600" aria-hidden="true" />
          <span>Saved Meal Plans</span>
        </h2>
        <span className="bg-primary-100 text-primary-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
          {plans.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {plans.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No meal plans saved yet.
          </div>
        ) : (
          plans.map((plan) => {
            const isActive = activePlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`group relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-primary-500 bg-primary-50/55 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
                }`}
                onClick={() => onSelectPlan(plan.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`Plan from ${formatDate(plan.createdAt)}, budget ${plan.currency}${plan.budget}, diet ${plan.diet}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectPlan(plan.id);
                  }
                }}
              >
                <div className="flex justify-between items-start pr-8">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDate(plan.createdAt)}
                    </span>
                    <h3 className="font-semibold text-slate-800 mt-0.5 capitalize text-sm">
                      {plan.diet}
                    </h3>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>{plan.people} {plan.people === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="font-medium text-slate-700">
                    <span>{plan.currency}{plan.budget}</span>
                  </div>
                </div>

                {isActive && (
                  <ArrowRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600 hidden lg:block" aria-hidden="true" />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePlan(plan.id);
                  }}
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 transition-colors lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Delete plan from ${formatDate(plan.createdAt)}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
