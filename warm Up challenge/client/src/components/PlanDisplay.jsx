import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ListTodo, RefreshCw } from 'lucide-react';

/**
 * Display card for the generated meal plans with accessibility compliance.
 */
export default function PlanDisplay({ plan }) {
  if (!plan) return null;

  const { people, diet, budget: targetBudget, currency, generatedPlan } = plan;
  const { breakfast, lunch, dinner, groceryList, substitutions, budget: budgetEvaluation } = generatedPlan;

  const fitsBudget = budgetEvaluation?.fits;
  const estimatedCost = budgetEvaluation?.estimatedCost;
  const budgetNote = budgetEvaluation?.note;

  return (
    <div className="space-y-6" aria-labelledby="plan-heading">
      {/* Header and Summary */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
        <div>
          <h2 id="plan-heading" className="text-2xl font-bold text-slate-800">Your Meal Plan</h2>
          <p className="text-sm text-slate-500 mt-1 capitalize">
            {diet} Preference • {people} {people === 1 ? 'person' : 'people'}
          </p>
        </div>
      </div>

      {/* Budget Banner */}
      <div 
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row gap-4 items-start sm:items-center ${
          fitsBudget 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
        role="region"
        aria-label="Budget Status Summary"
      >
        <div className="flex items-center gap-3 shrink-0">
          {fitsBudget ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" aria-hidden="true" />
          )}
          <div>
            <p className="font-bold text-base leading-tight">
              {fitsBudget ? 'Status: Fits Budget' : 'Status: Over Budget'}
            </p>
            <p className="text-xs mt-0.5 opacity-90">
              Est: <span className="font-semibold">{estimatedCost}</span> (Target: {currency}{targetBudget})
            </p>
          </div>
        </div>
        <div className="sm:border-l border-current/20 sm:pl-4 flex-1">
          <p className="text-sm leading-relaxed">{budgetNote}</p>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: 'breakfast', label: 'Breakfast', bg: 'bg-amber-50/20 border-amber-100' },
          { key: 'lunch', label: 'Lunch', bg: 'bg-blue-50/15 border-blue-100' },
          { key: 'dinner', label: 'Dinner', bg: 'bg-purple-50/15 border-purple-100' }
        ].map(({ key, label, bg }) => {
          const meal = generatedPlan[key];
          return (
            <div 
              key={key} 
              className={`p-5 rounded-2xl border flex flex-col justify-between ${bg} hover:shadow-md transition-shadow duration-200`}
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {label}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1">{meal?.title}</h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">{meal?.description}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Clock className="w-4 h-4 text-primary-500" aria-hidden="true" />
                <span>Cook Time: {meal?.cookTime}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grocery List Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <ListTodo className="w-5 h-5 text-primary-600" aria-hidden="true" />
            <span>Grocery List</span>
          </h3>
          <ul className="space-y-2.5 flex-1">
            {groceryList?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                <input 
                  type="checkbox" 
                  id={`grocery-item-${idx}`}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 transition-colors cursor-pointer"
                />
                <label htmlFor={`grocery-item-${idx}`} className="cursor-pointer select-none">
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Substitutions Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <RefreshCw className="w-5 h-5 text-primary-600" aria-hidden="true" />
            <span>Substitutions</span>
          </h3>
          <ul className="space-y-3 flex-1">
            {substitutions?.map((sub, idx) => (
              <li key={idx} className="text-sm text-slate-700 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                {sub}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
