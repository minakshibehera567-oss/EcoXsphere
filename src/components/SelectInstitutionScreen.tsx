import React, { useState } from 'react';
import { INSTITUTION_TYPES, InstitutionTypeDefinition } from '../data/initialInstitutions';
import { Search, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface SelectInstitutionScreenProps {
  onSelectType: (type: InstitutionTypeDefinition) => void;
  onBackToDashboard?: () => void;
}

export const SelectInstitutionScreen: React.FC<SelectInstitutionScreenProps> = ({
  onSelectType,
  onBackToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTypes = INSTITUTION_TYPES.filter(
    (item) =>
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020718] via-[#071738] to-[#020512] text-slate-100 flex flex-col">
      {/* Top Banner */}
      <header className="border-b border-blue-900/40 bg-[#06122d]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shadow-sm shadow-blue-500/10">
              🌱
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">EcoXsphere</span>
              <span className="hidden sm:inline text-xs text-blue-300/70 ml-2">Facility Intelligence Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 border border-blue-500/30 rounded-lg text-xs font-semibold transition-all hover:scale-105 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </button>
            )}
            <div className="text-xs text-blue-300/80">
              Step 1: Choose Your Facility Category
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/25 px-3 py-1 rounded-full mb-4 shadow-sm shadow-blue-950/40">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            AI-Powered Sustainability & Resource Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Select Your Institution
          </h1>
          <p className="text-base sm:text-lg text-slate-300/80 leading-relaxed">
            Every facility has unique physical zones, energy baselines, and resource dynamics. Choose your institution category to configure an AI model tailored specifically to your campus.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400/60">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search institution type (e.g., College, Hospital, Corporate, Township)..."
              className="w-full pl-11 pr-4 py-3.5 bg-[#071128]/90 border border-blue-900/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-xl shadow-blue-950/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-blue-300 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Institution Type Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-blue-200 uppercase tracking-wider">
              {searchQuery ? `Matching Facilities (${filteredTypes.length})` : 'Select Facility Type to Begin'}
            </h2>
            <span className="text-xs text-blue-300/60">Click to enter your institution's data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTypes.map((item) => (
              <div
                key={item.type}
                onClick={() => onSelectType(item)}
                className="group relative p-5 bg-[#08142b]/85 border border-blue-900/35 hover:border-blue-500/60 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0b1b3d]/90 border border-blue-800/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-blue-200 bg-[#0c1c3f]/80 border border-blue-800/50 px-2.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors mb-1.5">
                    {item.type}
                  </h3>
                  <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-900/30 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Typical: {item.suggestedMetrics.buildingsCount} blocks · {item.suggestedMetrics.campusArea}
                  </span>
                  <div className="flex items-center text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Configure</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTypes.length === 0 && (
            <div className="text-center py-12 bg-[#08142b]/40 border border-dashed border-blue-900/40 rounded-xl">
              <p className="text-slate-400 text-sm">No institution types match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-blue-400 hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-950/80 bg-[#030716]/90 py-4 text-center text-xs text-slate-400">
        EcoXsphere Facility Intelligence Engine · Real-time anomaly detection, forecasting & sustainability benchmarks
      </footer>
    </div>
  );
};
