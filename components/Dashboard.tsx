
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Study, StudyStatus } from '../types';

interface DashboardProps {
  studies: Study[];
  onSelectStudy: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ studies, onSelectStudy }) => {
  const chartData = useMemo(() => studies.map(s => ({
    name: s.id,
    enrollment: s.currentEnrollment,
    target: s.enrollmentTarget,
    percentage: (s.currentEnrollment / s.enrollmentTarget) * 100
  })), [studies]);

  const stats = [
    { label: 'Active Studies', value: studies.filter(s => s.status === StudyStatus.ACTIVE).length, change: '+12%', trend: 'up' },
    { label: 'Total Enrollment', value: studies.reduce((acc, curr) => acc + curr.currentEnrollment, 0), change: '+5.4%', trend: 'up' },
    { label: 'Critical Milestones', value: 4, change: '-2', trend: 'down' },
    { label: 'Compliance Rate', value: '98.4%', change: '+0.2%', trend: 'up' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Enrollment Performance</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1 text-slate-600 outline-none">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="enrollment" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Upcoming Milestones</h3>
          <div className="space-y-6 flex-1">
            {studies.flatMap(s => s.milestones).filter(m => m.status === 'in-progress').slice(0, 4).map((m, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Due {new Date(m.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-medium transition-colors border border-slate-200">
            View All Milestones
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-6">Active Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studies.map(study => (
            <div key={study.id} onClick={() => onSelectStudy(study.id)} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer group shadow-sm hover:shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col space-y-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md w-fit ${
                    study.status === StudyStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700' :
                    study.status === StudyStatus.ENROLLING ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {study.status}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 uppercase">{study.type}</span>
                    {study.phase && <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{study.phase}</span>}
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">{study.id}</span>
              </div>
              <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3rem] mb-2">{study.title}</h4>
              <p className="text-sm text-slate-500 mb-6">PI: {study.principalInvestigator}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-end text-xs mb-1">
                  <span className="text-slate-500">Enrollment Progress</span>
                  <span className="font-bold text-slate-900">{Math.round((study.currentEnrollment / study.enrollmentTarget) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(study.currentEnrollment / study.enrollmentTarget) * 100}%` }}
                  />
                </div>
              </div>

              {study.isFollowUp && (
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center space-x-2">
                  <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" /></svg>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Follow-up: {study.previousTrialName}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
