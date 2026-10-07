import React, { useState } from 'react';
import { AIInsightItem, Institution } from '../types/institution';
import { AlertCircle, AlertTriangle, CheckCircle, Lightbulb, Sparkles, Check, ArrowRight } from 'lucide-react';

interface AIFacilityIntelligenceProps {
  institution: Institution;
  onActionClick?: (insight: AIInsightItem) => void;
}

export const AIFacilityIntelligence: React.FC<AIFacilityIntelligenceProps> = ({
  institution,
  onActionClick,
}) => {
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const handleResolve = (id: string) => {
    setResolvedIds((prev) => [...prev, id]);
  };

  const insights = institution.aiInsights.map((i) => ({
    ...i,
    isResolved: resolvedIds.includes(i.id),
  }));

  const criticalInsights = insights.filter((i) => i.type === 'critical');
  const warningInsights = insights.filter((i) => i.type === 'warning');
  const positiveInsights = insights.filter((i) => i.type === 'positive');
  const recommendationInsights = insights.filter((i) => i.type === 'recommendation');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">AI Facility Intelligence</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time multi-variable anomaly detection, pattern correlation, and autonomous operational recommendations for <span className="text-slate-200">{institution.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-rose-400 font-semibold">{criticalInsights.length} Critical</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400 font-semibold">{warningInsights.length} Warning</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-semibold">{positiveInsights.length} Positive</span>
        </div>
      </div>

      {/* Grid of Classified Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Critical Cards (Red) */}
        {criticalInsights.map((insight) => (
          <div
            key={insight.id}
            className={`p-5 rounded-2xl border transition-all ${
              insight.isResolved
                ? 'bg-slate-900/40 border-slate-800 opacity-60'
                : 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  🔴 Critical Anomaly
                </span>
              </div>

              {insight.metricImpact && (
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                  {insight.metricImpact}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              {insight.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {insight.message}
            </p>

            <div className="pt-3 border-t border-rose-500/20 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                Module: {insight.module}
              </span>

              {insight.actionable && !insight.isResolved && (
                <button
                  type="button"
                  onClick={() => onActionClick ? onActionClick(insight) : handleResolve(insight.id)}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-rose-500/20"
                >
                  <span>{insight.actionLabel || 'Inspect Issue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {insight.isResolved && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Marked Resolved
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Warning Cards (Yellow) */}
        {warningInsights.map((insight) => (
          <div
            key={insight.id}
            className={`p-5 rounded-2xl border transition-all ${
              insight.isResolved
                ? 'bg-slate-900/40 border-slate-800 opacity-60'
                : 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  🟡 Operational Warning
                </span>
              </div>

              {insight.metricImpact && (
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {insight.metricImpact}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              {insight.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {insight.message}
            </p>

            <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                Module: {insight.module}
              </span>

              {insight.actionable && !insight.isResolved && (
                <button
                  type="button"
                  onClick={() => onActionClick ? onActionClick(insight) : handleResolve(insight.id)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>{insight.actionLabel || 'Action Protocol'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {insight.isResolved && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Marked Resolved
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Positive Cards (Green) */}
        {positiveInsights.map((insight) => (
          <div
            key={insight.id}
            className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 shadow-lg shadow-emerald-950/20"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  🟢 Efficiency Achievement
                </span>
              </div>

              {insight.metricImpact && (
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {insight.metricImpact}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              {insight.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {insight.message}
            </p>

            <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-400">
              <span className="uppercase tracking-wider">Module: {insight.module}</span>
              <span className="text-emerald-400 font-medium">Model Baseline Validated</span>
            </div>
          </div>
        ))}

        {/* Recommendation Cards (Blue / Bulb) */}
        {recommendationInsights.map((insight) => (
          <div
            key={insight.id}
            className="p-5 rounded-2xl bg-[#081635] border border-blue-900/40 shadow-xl shadow-blue-950/40"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Lightbulb className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  💡 Engineering Recommendation
                </span>
              </div>

              {insight.metricImpact && (
                <span className="text-xs font-mono font-bold text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded">
                  {insight.metricImpact}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              {insight.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {insight.message}
            </p>

            <div className="pt-3 border-t border-blue-900/30 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                Module: {insight.module}
              </span>

              {insight.actionable && (
                <button
                  type="button"
                  onClick={() => onActionClick && onActionClick(insight)}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>{insight.actionLabel || 'Simulate Strategy'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
