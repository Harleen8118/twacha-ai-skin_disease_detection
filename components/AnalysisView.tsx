import React from 'react';
import { SkinAnalysisResult } from '../types';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { 
  CheckCircle, 
  Stethoscope, 
  Activity, 
  ShieldAlert 
} from 'lucide-react';

interface AnalysisViewProps {
  result: SkinAnalysisResult;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result }) => {
  
  // Prepare data for the chart
  const chartData = [
    {
      name: 'Confidence',
      uv: result.confidence_score,
      fill: '#4F46E5', // Indigo-600
    },
    {
      name: 'Max',
      uv: 100,
      fill: '#E0E7FF', // Indigo-100 (Background track)
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Mild': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Severe': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Header Section */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{result.condition_name}</h2>
          <p className="text-slate-500 text-sm">AI Diagnosis Analysis</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full border ${getSeverityColor(result.severity)} text-sm font-semibold flex items-center gap-2`}>
          <Activity size={16} />
          {result.severity}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Description Card */}
        <div className="md:col-span-2 bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Stethoscope className="text-indigo-600" size={18} />
            Clinical Assessment
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {result.description}
          </p>
          
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Observed Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {result.symptoms_observed.map((symptom, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium">
                {symptom}
              </span>
            ))}
          </div>
        </div>

        {/* Confidence Chart */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden min-h-[200px]">
          <h3 className="text-base font-semibold text-slate-800 mb-2 w-full text-left">AI Confidence</h3>
          <div className="h-40 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="100%" 
                barSize={15} 
                data={chartData} 
                startAngle={90} 
                endAngle={-270}
              >
                <RadialBar
                  background
                  dataKey="uv"
                  cornerRadius={10}
                />
                <Tooltip cursor={false} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-bold text-indigo-600">{result.confidence_score}%</span>
               <p className="text-[10px] text-slate-400 font-medium uppercase">Match</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations & Treatments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Recommendations */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <ShieldAlert className="text-orange-500" size={18} />
            Precautions
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm">
                <div className="mt-0.5 min-w-[18px]">
                   <div className="w-4.5 h-4.5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-[10px] font-bold">
                     {idx + 1}
                   </div>
                </div>
                <span className="text-slate-600">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Treatments */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle className="text-emerald-500" size={18} />
            Treatments
          </h3>
          <ul className="space-y-2">
            {result.treatment_options.map((option, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm">
                <div className="mt-0.5 min-w-[18px]">
                   <CheckCircle size={16} className="text-emerald-500" />
                </div>
                <span className="text-slate-600">{option}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
