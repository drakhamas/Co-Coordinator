
import React from 'react';
import { Study } from '../types';

interface StudyListProps {
  studies: Study[];
  onSelectStudy: (id: string) => void;
}

export const StudyList: React.FC<StudyListProps> = ({ studies, onSelectStudy }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Protocol ID</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Study Title</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Investigator Team</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Coordination</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {studies.map((study) => (
            <tr 
              key={study.id} 
              onClick={() => onSelectStudy(study.id)}
              className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
            >
              <td className="px-6 py-5 whitespace-nowrap text-sm font-mono text-slate-500">{study.id}</td>
              <td className="px-6 py-5">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{study.title}</p>
                <p className="text-xs text-slate-400 mt-1">Started {study.startDate}</p>
              </td>
              <td className="px-6 py-5">
                <p className="text-sm text-slate-700 font-medium">{study.team?.principalInvestigator || study.principalInvestigator}</p>
                {study.team?.subPrincipalInvestigator && (
                  <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Sub-PI: {study.team.subPrincipalInvestigator}</p>
                )}
              </td>
              <td className="px-6 py-5">
                <p className="text-sm text-slate-700">{study.team?.mainCoordinator || 'Unassigned'}</p>
                {study.team?.substituteCoordinator && (
                  <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Sub: {study.team.substituteCoordinator}</p>
                )}
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end space-x-3">
                  <div className="text-xs font-bold text-slate-900">{Math.round((study.currentEnrollment / study.enrollmentTarget) * 100)}%</div>
                  <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${(study.currentEnrollment / study.enrollmentTarget) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
