
import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { analyzeImpact } from '../services/geminiService';
import { Sparkles } from 'lucide-react';

interface ImpactReportProps {
  projects: Project[];
}

const ImpactReport: React.FC<ImpactReportProps> = ({ projects }) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Aggregate stats
  const totalBeneficiaries = projects.reduce((sum, p) => sum + (p.kpi?.beneficiaries || 0), 0);
  const totalVolunteers = projects.reduce((sum, p) => sum + (p.kpi?.volunteers || 0), 0);
  const totalBudget = projects.reduce((sum, p) => sum + (p.kpi?.budget || 0), 0);
  
  const stats = {
      projects: projects.length,
      beneficiaries: totalBeneficiaries,
      volunteers: totalVolunteers,
      totalBudget: totalBudget,
      completionRate: Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1)) + '%'
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
        setLoading(true);
        const summary = await analyzeImpact(stats);
        setAiSummary(summary || "No data available for analysis.");
        setLoading(false);
    };
    if (projects.length > 0) {
        fetchAnalysis();
    }
  }, [projects.length]);

  const impactData = projects.map(p => ({
    name: p.title.split(' ')[0], // Short name
    beneficiaries: p.kpi?.beneficiaries || 0,
    volunteers: p.kpi?.volunteers || 0,
  }));

  // Format currency
  const formattedBudget = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalBudget);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-hive-dark font-heading">Impact Dashboard</h2>
        <p className="text-gray-500 mt-1">Measuring our reach and effectiveness.</p>
      </div>

      {/* AI Summary Card */}
      <div className="bg-gradient-to-r from-hive-brand to-cyan-500 rounded-2xl p-8 shadow-xl shadow-hive-brand/20 relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-white/20 p-2 rounded-lg">
                    <Sparkles className="text-white" fill="white" size={20} />
                </div>
                <h3 className="font-bold text-lg text-white font-heading">AI Insight</h3>
            </div>
            <p className="text-white text-lg font-medium leading-relaxed max-w-3xl">
                {loading ? "Analyzing your impact data..." : aiSummary}
            </p>
        </div>
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400 opacity-40 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
             <div className="text-4xl font-bold text-hive-dark mb-1 font-heading">{totalBeneficiaries.toLocaleString()}</div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Beneficiaries</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
             <div className="text-4xl font-bold text-hive-dark mb-1 font-heading">{totalVolunteers}</div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Volunteers</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
             <div className="text-4xl font-bold text-hive-dark mb-1 font-heading">{projects.length}</div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Projects</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
             <div className="text-4xl font-bold text-hive-dark mb-1 font-heading text-blue-600">{formattedBudget}</div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Budget Used</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-96">
            <h3 className="font-bold text-hive-dark mb-6 font-heading text-lg">Beneficiaries by Project</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={impactData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                    <Bar dataKey="beneficiaries" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
          </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-96">
            <h3 className="font-bold text-hive-dark mb-6 font-heading text-lg">Volunteer Engagement</h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={impactData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                    <Line type="monotone" dataKey="volunteers" stroke="#10B981" strokeWidth={3} dot={{r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff'}} />
                </LineChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default ImpactReport;
