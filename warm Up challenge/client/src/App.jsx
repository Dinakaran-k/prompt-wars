import React, { useState, useEffect } from 'react';
import { usePlans } from './hooks/usePlans';
import PlannerForm from './components/PlannerForm';
import PlanDisplay from './components/PlanDisplay';
import HistorySidebar from './components/HistorySidebar';
import AccessibilityAnnouncer from './components/AccessibilityAnnouncer';
import { AlertCircle, X, Menu, BookOpen } from 'lucide-react';

/**
 * Main application routing and single-page planner layout.
 */
export default function App() {
  const {
    plans,
    currentPlan,
    loading,
    error,
    setError,
    selectPlan,
    generatePlan,
    deletePlan
  } = usePlans();

  const [announcement, setAnnouncement] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Generate screen reader descriptions for accessibility.
  useEffect(() => {
    if (loading) {
      setAnnouncement('Generating your personalized cooking plan, please wait...');
    } else if (error) {
      setAnnouncement(`Error: ${error}`);
    } else if (currentPlan) {
      setAnnouncement(`Success: Loaded plan for ${currentPlan.diet} preference.`);
    }
  }, [loading, error, currentPlan]);

  const handleFormSubmit = async (formData) => {
    try {
      await generatePlan(formData);
    } catch (e) {
      // Handled in state
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AccessibilityAnnouncer message={announcement} />

      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-100 rounded-xl text-primary-700">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight">Cooking Companion</h1>
              <p className="text-[10px] text-slate-500">AI Meal Planner & Scheduler</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Toggle saved plans"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row min-h-0">
        
        {/* History Sidebar */}
        <div className={`
          lg:block
          ${sidebarOpen ? 'block' : 'hidden'}
          border-slate-200 lg:border-r bg-white h-auto
        `}>
          <HistorySidebar
            plans={plans}
            activePlanId={currentPlan?.id}
            onSelectPlan={(id) => {
              selectPlan(id);
              setSidebarOpen(false);
            }}
            onDeletePlan={deletePlan}
          />
        </div>

        {/* Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {error && (
            <div 
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 relative shadow-sm"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-sm">Meal Planner Error</h3>
                <p className="text-xs mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-1">
              <PlannerForm onSubmit={handleFormSubmit} loading={loading} />
            </div>

            <div className="xl:col-span-2 space-y-6">
              {loading ? (
                <div 
                  className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[350px]"
                  aria-busy="true"
                  aria-live="assertive"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-primary-600 animate-spin" />
                  <div>
                    <h3 className="font-bold text-base text-slate-800">Generating Culinary Setup...</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Google Gemini is tailoring meal descriptions and budget calculations based on your daily constraints.
                    </p>
                  </div>
                </div>
              ) : currentPlan ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <PlanDisplay plan={currentPlan} />
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3 min-h-[350px] flex flex-col justify-center items-center">
                  <span className="text-3xl" role="img" aria-label="Frying pan">🍳</span>
                  <h3 className="font-bold text-slate-600 text-base">No Active Meal Plan</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Submit the form to generate a plan via Gemini AI, or select a previous entry from the saved plans history.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
