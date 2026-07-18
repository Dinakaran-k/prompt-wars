import React, { useState, useRef } from 'react';
import { ChefHat, Loader2 } from 'lucide-react';

/**
 * Cooking Companion Meal Planner Form with accessibility features and frontend validations.
 */
export default function PlannerForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    schedule: '',
    people: 2,
    diet: 'No Restriction',
    budget: '',
    currency: '$'
  });

  const [errors, setErrors] = useState({});

  // Refs for focusing on validation failure (accessibility helper)
  const scheduleRef = useRef(null);
  const peopleRef = useRef(null);
  const budgetRef = useRef(null);
  const currencyRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors as user typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Schedule Validation
    if (!formData.schedule || formData.schedule.trim() === '') {
      newErrors.schedule = 'Schedule context is required.';
    } else if (formData.schedule.length > 1000) {
      newErrors.schedule = 'Schedule context must not exceed 1000 characters.';
    }

    // 2. People Validation
    const parsedPeople = Number(formData.people);
    if (!formData.people && formData.people !== 0) {
      newErrors.people = 'Number of people is required.';
    } else if (!Number.isInteger(parsedPeople) || parsedPeople <= 0) {
      newErrors.people = 'Number of people must be a positive integer.';
    }

    // 3. Budget Validation
    const parsedBudget = Number(formData.budget);
    if (!formData.budget && formData.budget !== 0) {
      newErrors.budget = 'Budget is required.';
    } else if (isNaN(parsedBudget) || parsedBudget <= 0) {
      newErrors.budget = 'Budget must be a positive number.';
    }

    // 4. Currency Validation
    const validCurrencies = ['₹', '$'];
    if (!formData.currency || !validCurrencies.includes(formData.currency)) {
      newErrors.currency = 'Please select a valid currency (₹ or $).';
    }

    setErrors(newErrors);

    // Focus the first invalid element for accessibility
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.schedule) scheduleRef.current?.focus();
      else if (newErrors.people) peopleRef.current?.focus();
      else if (newErrors.budget) budgetRef.current?.focus();
      else if (newErrors.currency) currencyRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        people: parseInt(formData.people, 10),
        budget: parseFloat(formData.budget)
      });
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
      noValidate
      aria-label="Meal Plan Generator"
    >
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
        <ChefHat className="w-5 h-5 text-primary-600" aria-hidden="true" />
        <span>Create Meal Plan</span>
      </h2>

      {/* Schedule Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <label htmlFor="schedule" className="text-sm font-semibold text-slate-700">
            Day's Schedule / Context <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <span 
            id="schedule-counter" 
            className={`text-xs ${formData.schedule.length > 900 ? 'text-red-500 font-medium' : 'text-slate-400'}`}
            aria-hidden="true"
          >
            {formData.schedule.length}/1000
          </span>
        </div>
        <textarea
          id="schedule"
          name="schedule"
          ref={scheduleRef}
          value={formData.schedule}
          onChange={handleChange}
          maxLength={1050} // Slightly more to let validation catch the overflow
          rows={3}
          placeholder="E.g., meetings till 6 PM, 30 min for dinner, love spicy food"
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all focus:bg-white resize-none ${
            errors.schedule 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-200 focus:border-primary-500'
          }`}
          aria-describedby={errors.schedule ? 'schedule-error' : 'schedule-counter'}
          aria-required="true"
          aria-invalid={!!errors.schedule}
        />
        {errors.schedule && (
          <span id="schedule-error" className="text-xs font-medium text-red-600" role="alert">
            {errors.schedule}
          </span>
        )}
      </div>

      {/* Grid Inputs: People and Diet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Number of People */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="people" className="text-sm font-semibold text-slate-700">
            Number of People <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="people"
            name="people"
            type="number"
            ref={peopleRef}
            value={formData.people}
            onChange={handleChange}
            min={1}
            step={1}
            className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 transition-all focus:bg-white ${
              errors.people 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-slate-200 focus:border-primary-500'
            }`}
            aria-describedby={errors.people ? 'people-error' : undefined}
            aria-required="true"
            aria-invalid={!!errors.people}
          />
          {errors.people && (
            <span id="people-error" className="text-xs font-medium text-red-600" role="alert">
              {errors.people}
            </span>
          )}
        </div>

        {/* Dietary Preferences */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="diet" className="text-sm font-semibold text-slate-700">
            Dietary Preference <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="diet"
            name="diet"
            value={formData.diet}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 transition-all focus:bg-white focus:border-primary-500"
          >
            <option value="No Restriction">No Restriction</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
            <option value="Vegan">Vegan</option>
          </select>
        </div>
      </div>

      {/* Budget and Currency */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="budget" className="text-sm font-semibold text-slate-700">
          Budget <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="flex gap-2">
          {/* Currency Select */}
          <div className="w-24 shrink-0">
            <select
              id="currency"
              name="currency"
              ref={currencyRef}
              value={formData.currency}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 transition-all focus:bg-white focus:border-primary-500 ${
                errors.currency ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
              }`}
              aria-label="Currency"
              aria-invalid={!!errors.currency}
            >
              <option value="$">USD ($)</option>
              <option value="₹">INR (₹)</option>
            </select>
          </div>
          {/* Budget Input */}
          <div className="flex-1">
            <input
              id="budget"
              name="budget"
              type="number"
              ref={budgetRef}
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g. 50"
              min={0.01}
              step="any"
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 transition-all focus:bg-white ${
                errors.budget 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 focus:border-primary-500'
              }`}
              aria-describedby={errors.budget ? 'budget-error' : undefined}
              aria-required="true"
              aria-invalid={!!errors.budget}
            />
          </div>
        </div>
        {errors.budget && (
          <span id="budget-error" className="text-xs font-medium text-red-600" role="alert">
            {errors.budget}
          </span>
        )}
        {errors.currency && (
          <span id="currency-error" className="text-xs font-medium text-red-600" role="alert">
            {errors.currency}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Generating Plan...</span>
          </>
        ) : (
          <span>Generate Plan</span>
        )}
      </button>
    </form>
  );
}
