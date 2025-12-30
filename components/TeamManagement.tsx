
import React, { useState } from 'react';
import { Study, ClinicalTeam, MonitorInfo } from '../types';

interface TeamManagementProps {
  studies: Study[];
  onUpdateTeam: (studyId: string, team: ClinicalTeam) => void;
  onUpdateMonitor: (studyId: string, monitor: MonitorInfo) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ studies, onUpdateTeam, onUpdateMonitor }) => {
  const [editingStudyId, setEditingStudyId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'team' | 'monitor'>('team');
  const [teamFormData, setTeamFormData] = useState<ClinicalTeam>({
    principalInvestigator: '',
    subPrincipalInvestigator: '',
    mainCoordinator: '',
    substituteCoordinator: ''
  });
  const [monitorFormData, setMonitorFormData] = useState<MonitorInfo>({
    name: '',
    contact: '',
    frequency: 'Monthly'
  });

  const handleEditTeam = (study: Study) => {
    setEditType('team');
    setEditingStudyId(study.id);
    setTeamFormData(study.team || {
      principalInvestigator: study.principalInvestigator,
      subPrincipalInvestigator: '',
      mainCoordinator: '',
      substituteCoordinator: ''
    });
  };

  const handleEditMonitor = (study: Study) => {
    setEditType('monitor');
    setEditingStudyId(study.id);
    setMonitorFormData(study.monitor || {
      name: '',
      contact: '',
      frequency: 'Monthly'
    });
  };

  const handleSave = () => {
    if (editingStudyId) {
      if (editType === 'team') onUpdateTeam(editingStudyId, teamFormData);
      else onUpdateMonitor(editingStudyId, monitorFormData);
      setEditingStudyId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Personnel & Monitor Administration</h2>
          <p className="text-indigo-200 max-w-lg">Manage site staff assignments and study monitor (CRA) coordination, including oversight visits and contact logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {studies.map(study => (
          <div key={study.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900">{study.title}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{study.id}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEditTeam(study)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors">Assign Staff</button>
                <button onClick={() => handleEditMonitor(study)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Manage Monitor</button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Site Team */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <TeamCard label="PI" name={study.team?.principalInvestigator || study.principalInvestigator} icon="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                <TeamCard label="Main Coordinator" name={study.team?.mainCoordinator || 'Unassigned'} icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" />
                <TeamCard label="Sub-PI" name={study.team?.subPrincipalInvestigator || 'Unassigned'} icon="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                <TeamCard label="Sub Coordinator" name={study.team?.substituteCoordinator || 'Unassigned'} icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </div>

              {/* Monitor Info */}
              <div className="pt-8 border-t border-slate-50">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Study Monitor (CRA) Oversight</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-start space-x-4">
                       <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Assigned Monitor</p>
                          <p className="text-sm font-bold text-slate-900">{study.monitor?.name || 'No Monitor Assigned'}</p>
                          <p className="text-xs text-slate-500 mt-1">{study.monitor?.contact}</p>
                       </div>
                    </div>
                    <div className="flex items-start space-x-4">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Visit Calendar</p>
                          <div className="flex space-x-4">
                             <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Next</p>
                                <p className="text-xs font-bold text-slate-900">{study.monitor?.nextVisit || 'TBD'}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Last</p>
                                <p className="text-xs text-slate-500">{study.monitor?.lastVisit || 'None'}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-start space-x-4">
                       <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Visit Frequency</p>
                          <p className="text-sm font-bold text-slate-900">{study.monitor?.frequency || 'Standard'}</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingStudyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">{editType === 'team' ? 'Staff Assignment' : 'Monitor Coordination'}</h3>
            
            {editType === 'team' ? (
              <div className="space-y-4">
                <RoleInput label="PI" value={teamFormData.principalInvestigator} onChange={(v) => setTeamFormData({...teamFormData, principalInvestigator: v})} />
                <RoleInput label="Sub-PI" value={teamFormData.subPrincipalInvestigator || ''} onChange={(v) => setTeamFormData({...teamFormData, subPrincipalInvestigator: v})} />
                <RoleInput label="Main Coordinator" value={teamFormData.mainCoordinator} onChange={(v) => setTeamFormData({...teamFormData, mainCoordinator: v})} />
                <RoleInput label="Sub Coordinator" value={teamFormData.substituteCoordinator || ''} onChange={(v) => setTeamFormData({...teamFormData, substituteCoordinator: v})} />
              </div>
            ) : (
              <div className="space-y-4">
                <RoleInput label="Monitor Name" value={monitorFormData.name} onChange={(v) => setMonitorFormData({...monitorFormData, name: v})} />
                <RoleInput label="Contact Info" value={monitorFormData.contact} onChange={(v) => setMonitorFormData({...monitorFormData, contact: v})} placeholder="Email, phone..." />
                <div className="grid grid-cols-2 gap-4">
                  <RoleInput label="Next Visit Date" value={monitorFormData.nextVisit || ''} onChange={(v) => setMonitorFormData({...monitorFormData, nextVisit: v})} placeholder="YYYY-MM-DD" />
                  <RoleInput label="Visit Frequency" value={monitorFormData.frequency || ''} onChange={(v) => setMonitorFormData({...monitorFormData, frequency: v})} placeholder="e.g. Every 4 weeks" />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={() => setEditingStudyId(null)} className="px-6 py-2 text-sm font-bold text-slate-500">Cancel</button>
              <button onClick={handleSave} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TeamCard = ({ label, name, icon }: { label: string, name: string, icon: string }) => (
  <div className="flex items-start space-x-4">
    <div className="mt-1 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d={icon} /></svg>
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-bold ${name === 'Unassigned' ? 'text-slate-300 italic' : 'text-slate-900'}`}>{name}</p>
    </div>
  </div>
);

const RoleInput = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
  </div>
);
