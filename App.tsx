import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudyList } from './components/StudyList';
import { PatientRegistry } from './components/PatientRegistry';
import { NotebookDashboard } from './components/NotebookDashboard';
import { TeamManagement } from './components/TeamManagement';
import { Study, StudyStatus, StudyType, DrugPhase, StatisticalDataPoint, PresentationSlide, SpecimenProcedure, SpecimenLogistics, MonitorInfo } from './types';

// Mock Data
const INITIAL_STUDIES: Study[] = [
  {
    id: 'TRIAL-001',
    title: 'Phase II mRNA Cardiac Regeneration Study',
    type: 'Drug',
    phase: 'Phase II',
    isFollowUp: false,
    principalInvestigator: 'Dr. Sarah Chen',
    team: {
      principalInvestigator: 'Dr. Sarah Chen',
      subPrincipalInvestigator: 'Dr. James Miller',
      mainCoordinator: 'Elena Rossi',
      substituteCoordinator: 'Mark Thompson'
    },
    monitor: {
      name: 'Jennifer Sloan',
      contact: 'jsloan@monitor-services.com | +1 555-0199',
      nextVisit: '2024-06-15',
      lastVisit: '2024-03-10',
      frequency: 'Every 8 weeks'
    },
    status: StudyStatus.ACTIVE,
    enrollmentTarget: 120,
    currentEnrollment: 85,
    startDate: '2023-10-01',
    endDate: '2025-06-30',
    description: 'Evaluating the safety and efficacy of mRNA-based therapy for post-MI heart tissue repair.',
    milestones: [
      { id: 'm1', label: 'Dose Escalation', date: '2024-01-15', status: 'completed' },
      { id: 'm2', label: 'Primary Endpoint Assessment', date: '2024-11-20', status: 'in-progress' },
      { id: 'm3', label: 'Final Data Analysis', date: '2025-05-15', status: 'upcoming' },
    ],
    screeningChecklist: ["Informed Consent", "Physical Exam", "Cardiac MRI", "Baseline Bloodwork", "EKG"],
    protocolInsight: {
      aeGuidelines: "1. Notify PI within 2 hours of event awareness.\n2. For SAEs, report to Sponsor Safety Desk within 24 hours.",
      summary: "This study tests a new mRNA treatment aimed at repairing heart muscle after a heart attack.",
      algorithm: "Screening -> MRI -> Randomization (Treatment/Placebo) -> 12 Month Follow-up",
      drugFeatures: "mRNA therapy targeting VEGF-A expression.",
      prepRequirements: "Store at -80C. Thaw 30 mins before use. Do not shake.",
      specimenProcedures: [
        { task: "Blood Draw", details: "Collect 10mL in EDTA tubes." },
        { task: "Centrifugation", details: "3000 RPM for 15 mins at 4°C." },
        { task: "Aliquoting", details: "Transfer 1mL plasma to 3 cryovials." }
      ],
      specimenLogistics: {
        address: "Central Lab BioVault, 400 Research Pkwy, Cambridge MA",
        courier: "BioCourier Logistics (Priority)",
        courierContact: "1-800-BIO-SHIP / contact@biocourier.com"
      }
    }
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'studies' | 'patients' | 'notebook' | 'team'>('dashboard');
  const [studies, setStudies] = useState<Study[]>(INITIAL_STUDIES);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [isNewStudyModalOpen, setIsNewStudyModalOpen] = useState(false);

  // New Study Form State
  const [newStudy, setNewStudy] = useState<Partial<Study>>({
    type: 'Drug',
    status: StudyStatus.PENDING,
    isFollowUp: false,
    enrollmentTarget: 100,
    currentEnrollment: 0,
    milestones: [],
    monitor: { name: '', contact: '', frequency: 'Monthly' }
  });

  const handleAddStudy = () => {
    if (!newStudy.title || !newStudy.id) return;
    const studyToAdd: Study = {
      ...newStudy as Study,
      principalInvestigator: newStudy.principalInvestigator || 'Unassigned',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31', 
      description: newStudy.description || '',
    };
    setStudies(prev => [...prev, studyToAdd]);
    setIsNewStudyModalOpen(false);
    setNewStudy({ type: 'Drug', status: StudyStatus.PENDING, isFollowUp: false, enrollmentTarget: 100, currentEnrollment: 0, milestones: [], monitor: { name: '', contact: '', frequency: 'Monthly' } });
  };

  const updateStudyTeam = (studyId: string, teamData: any) => {
    setStudies(prev => prev.map(s => s.id === studyId ? { ...s, team: teamData } : s));
  };

  const updateStudyMonitor = (studyId: string, monitorData: MonitorInfo) => {
    setStudies(prev => prev.map(s => s.id === studyId ? { ...s, monitor: monitorData } : s));
  };

  const handleProtocolAnalyzed = (
    studyId: string, 
    analysis: string, 
    screeningItems: string[], 
    ae: string, 
    summary: string, 
    algo: string, 
    drugs: string, 
    prep: string,
    stats: StatisticalDataPoint[],
    slides: PresentationSlide[],
    specimenProcedures: SpecimenProcedure[],
    specimenLogistics: SpecimenLogistics
  ) => {
    setStudies(prev => prev.map(s => s.id === studyId ? { 
      ...s, 
      protocolInsight: { 
        ...s.protocolInsight, 
        schedule: analysis,
        aeGuidelines: ae,
        summary: summary,
        algorithm: algo,
        drugFeatures: drugs,
        prepRequirements: prep,
        statisticalAnalysis: stats,
        presentationSlides: slides,
        specimenProcedures,
        specimenLogistics
      },
      screeningChecklist: screeningItems
    } : s));
  };

  const updateEnrollment = (studyId: string, increment: number) => {
    setStudies(prev => prev.map(s => s.id === studyId ? { 
      ...s, 
      currentEnrollment: s.currentEnrollment + increment 
    } : s));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard studies={studies} onSelectStudy={(id) => { setSelectedStudyId(id); setActiveTab('notebook'); }} />;
      case 'studies':
        return <StudyList studies={studies} onSelectStudy={(id) => { setSelectedStudyId(id); setActiveTab('notebook'); }} />;
      case 'patients':
        return <PatientRegistry studies={studies} onStatusChange={updateEnrollment} />;
      case 'notebook':
        return (
          <NotebookDashboard 
            study={studies.find(s => s.id === selectedStudyId) || studies[0]} 
            onProtocolAnalyzed={(analysis, items, ae, summary, algo, drugs, prep, stats, slides, specimens, shipping) => 
              handleProtocolAnalyzed(selectedStudyId || studies[0].id, analysis, items, ae, summary, algo, drugs, prep, stats, slides, specimens, shipping)}
          />
        );
      case 'team':
        return <TeamManagement studies={studies} onUpdateTeam={updateStudyTeam} onUpdateMonitor={updateStudyMonitor} />;
      default:
        return <Dashboard studies={studies} onSelectStudy={(id) => { setSelectedStudyId(id); setActiveTab('notebook'); }} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 capitalize">
              {activeTab === 'team' ? 'Site Administration' : activeTab}
            </h1>
            <p className="text-sm text-slate-500">Co-Coordinator Clinical CRM & Analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center mr-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse" />
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Site Admin View</span>
            </div>
            <button 
              onClick={() => setIsNewStudyModalOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              New Study
            </button>
          </div>
        </header>
        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {/* New Study Modal */}
      {isNewStudyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Configure New Trial</h3>
              <button onClick={() => setIsNewStudyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. TRIAL-003"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newStudy.id || ''}
                    onChange={e => setNewStudy({...newStudy, id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Target</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newStudy.enrollmentTarget}
                    onChange={e => setNewStudy({...newStudy, enrollmentTarget: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Study Title</label>
                <input 
                  type="text" 
                  placeholder="Full name of the clinical investigation..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newStudy.title || ''}
                  onChange={e => setNewStudy({...newStudy, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Study Monitor Name</label>
                    <input 
                      type="text" 
                      placeholder="Name of CRA..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newStudy.monitor?.name || ''}
                      onChange={e => setNewStudy({...newStudy, monitor: {...newStudy.monitor!, name: e.target.value}})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitor Contact</label>
                    <input 
                      type="text" 
                      placeholder="Email or Phone..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newStudy.monitor?.contact || ''}
                      onChange={e => setNewStudy({...newStudy, monitor: {...newStudy.monitor!, contact: e.target.value}})}
                    />
                 </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Study Classification</h4>
                  </div>
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                    <button 
                      onClick={() => setNewStudy({...newStudy, type: 'Drug'})}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${newStudy.type === 'Drug' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Drug
                    </button>
                    <button 
                      onClick={() => setNewStudy({...newStudy, type: 'Device', phase: undefined})}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${newStudy.type === 'Device' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Device
                    </button>
                  </div>
                </div>

                {newStudy.type === 'Drug' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Clinical Phase</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Other'].map(p => (
                        <button 
                          key={p}
                          onClick={() => setNewStudy({...newStudy, phase: p as DrugPhase})}
                          className={`py-2 rounded-lg border text-[10px] font-bold transition-all ${newStudy.phase === p ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Follow-up Protocol?</h4>
                  </div>
                  <button 
                    onClick={() => setNewStudy({...newStudy, isFollowUp: !newStudy.isFollowUp, previousTrialName: !newStudy.isFollowUp ? '' : undefined})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${newStudy.isFollowUp ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newStudy.isFollowUp ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {newStudy.isFollowUp && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Previous Trial Reference</label>
                    <input 
                      type="text" 
                      placeholder="Enter previous trial name..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newStudy.previousTrialName || ''}
                      onChange={e => setNewStudy({...newStudy, previousTrialName: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button onClick={() => setIsNewStudyModalOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
              <button 
                onClick={handleAddStudy}
                className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                Create Study Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;