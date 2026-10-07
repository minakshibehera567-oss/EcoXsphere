import React from 'react';
import { Institution } from '../types/institution';
import {
  Building2,
  Users,
  MapPin,
  Sparkles,
  ChevronDown,
  Plus,
  Sliders,
  Scale,
  MessageSquare,
  Bot,
  RefreshCw,
  Map,
  ArrowLeft,
  Home,
} from 'lucide-react';

interface PersonalizedHeaderProps {
  institution: Institution;
  institutionsList: Institution[];
  onSwitchInstitution: (id: string) => void;
  onNewInstitution: () => void;
  onOpenProfile: () => void;
  onOpenCompare: () => void;
  onOpenChat: () => void;
  onOpenEstateMap?: () => void;
  onRefreshAI: () => void;
  isAiRefreshing: boolean;
  onBackToFront?: () => void;
}

export const PersonalizedHeader: React.FC<PersonalizedHeaderProps> = ({
  institution,
  institutionsList,
  onSwitchInstitution,
  onNewInstitution,
  onOpenProfile,
  onOpenCompare,
  onOpenChat,
  onOpenEstateMap,
  onRefreshAI,
  isAiRefreshing,
  onBackToFront,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Status badge styling
  const statusColor =
    institution.status === 'good'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : institution.status === 'warning'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  const statusDot =
    institution.status === 'good'
      ? 'bg-emerald-400'
      : institution.status === 'warning'
      ? 'bg-amber-400'
      : 'bg-rose-400';

  const statusLabel =
    institution.status === 'good'
      ? 'Facility Status: Good'
      : institution.status === 'warning'
      ? 'Facility Status: Advisory'
      : 'Facility Status: Attention Needed';

  // Determine data mode label
  const isSyntheticMode = Object.values(institution.dataSources).some((d) => d?.isSynthetic);
  const dataModeLabel = isSyntheticMode ? 'Demo / Simulated Data' : 'Live Physical Telemetry';

  return (
    <div className="bg-[#06122d]/95 border-b border-blue-900/40 text-slate-100">
      {/* Top Navbar */}
      <div className="border-b border-blue-900/35 bg-[#020718]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Back to Front Screen Button */}
            <button
              type="button"
              onClick={onBackToFront || onNewInstitution}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#091e45] hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 rounded-xl text-xs font-bold transition-all hover:scale-105 shadow-sm shadow-blue-950/40 group"
              title="Go back to Front screen (Select your Institution Type)"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-blue-300 group-hover:text-white" />
              <span className="hidden sm:inline">Back to Front</span>
              <span className="sm:hidden">Front</span>
            </button>

            <button
              type="button"
              onClick={onBackToFront || onNewInstitution}
              className="flex items-center space-x-3 text-left focus:outline-none group cursor-pointer"
              title="Return to Front screen (Institution selection)"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                🌱
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-white text-base group-hover:text-blue-300 transition-colors">EcoXsphere</span>
                  <span className="text-xs text-blue-400/50">|</span>
                  <span className="text-xs text-blue-200/80 font-medium">Facility Intelligence</span>
                </div>
              </div>
            </button>

            {/* Institution Switcher Dropdown */}
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
              >
                <span>{institution.icon}</span>
                <span className="max-w-[140px] sm:max-w-[200px] truncate">{institution.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden">
                    <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      My Configured Institutions ({institutionsList.length})
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                      {institutionsList.map((inst) => (
                        <button
                          key={inst.id}
                          onClick={() => {
                            onSwitchInstitution(inst.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                            inst.id === institution.id ? 'bg-slate-800/80 text-emerald-400 font-medium' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span>{inst.icon}</span>
                            <span className="truncate">{inst.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {inst.sustainabilityScore.overall}/100
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="p-2 border-t border-slate-800 bg-slate-950/40 space-y-1.5">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          (onBackToFront || onNewInstitution)();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Front (Select Type)</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNewInstitution();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Configure New Facility</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2">
            {onOpenEstateMap && (
              <button
                onClick={onOpenEstateMap}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#091a3e] hover:bg-[#102d64] text-blue-300 border border-blue-800/40 text-xs font-semibold rounded-lg transition-colors"
                title="View Campus Masterplan & Spatial Estate Map"
              >
                <Map className="w-3.5 h-3.5 text-blue-400" />
                <span>Estate Map</span>
              </button>
            )}

            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-slate-950 hover:bg-blue-400 text-xs font-semibold rounded-lg shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI About Campus</span>
            </button>

            <button
              onClick={onOpenCompare}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium rounded-lg transition-colors"
              title="Compare with other institutions"
            >
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>Compare</span>
            </button>

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium rounded-lg transition-colors"
              title="Edit Profile, Baselines & Equipment"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Profile & Settings</span>
            </button>

            <button
              onClick={onRefreshAI}
              disabled={isAiRefreshing}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700 rounded-lg text-xs transition-colors"
              title="Re-run deep AI facility analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isAiRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Personalized Header Canvas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Institution Identity & Metrics Block */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl">{institution.icon}</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {institution.name}
              </h1>
            </div>

            {/* Metadata line without pills */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mb-3">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {institution.location.city}, {institution.location.state}
              </span>
              <span className="text-slate-600">·</span>
              <span>Institution Type: <strong className="text-slate-200">{institution.type}</strong></span>
              <span className="text-slate-600">·</span>
              <span>Buildings: <strong className="text-slate-200">{institution.buildings.length}</strong></span>
              <span className="text-slate-600">·</span>
              <span>Students/Employees: <strong className="text-slate-200">{institution.metrics.occupancyCount.toLocaleString()}</strong></span>
              <span className="text-slate-600">·</span>
              <span>Campus Area: <strong className="text-slate-200">{institution.metrics.campusArea}</strong></span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400/90 font-medium">Data Mode: {dataModeLabel}</span>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                <div className={`w-2 h-2 rounded-full ${statusDot} animate-pulse`} />
                <span>{statusLabel}</span>
              </div>

              <span className="text-xs text-slate-500">
                Monitored Modules: {institution.monitoredResources.length} active
              </span>
            </div>
          </div>

          {/* Overall Sustainability Score Card */}
          <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl sm:self-start lg:self-auto shadow-inner">
            <div className="text-center sm:text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Campus Sustainability
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                {institution.sustainabilityScore.overall}
                <span className="text-sm font-normal text-slate-500">/100</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Benchmark: Top 15% in region
              </div>
            </div>

            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              🌿
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
