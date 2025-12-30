
import React, { useState } from 'react';
import { Patient, PatientStatus, Study, AdverseEvent } from '../types';
import { SignaturePad } from './SignaturePad';

interface PatientRegistryProps {
  studies: Study[];
  onStatusChange: (studyId: string, increment: number) => void;
}

export const PatientRegistry: React.FC<PatientRegistryProps> = ({ studies, onStatusChange }) => {
  const [patients, setPatients] = useState<Patient[]>([
    { id: 'SUB-1021', gender: 'M', studyId: 'TRIAL-001', status: PatientStatus.ENROLLED, lastVisit: '2024-05-12', consentStatus: 'Signed', reportedEvents: [] },
    { id: 'SUB-1022', gender: 'F', studyId: 'TRIAL-001', status: PatientStatus.SCREENING, lastVisit: '2024-05-10', consentStatus: 'Pending', completedScreeningItems: [] },
    { id: 'SUB-1023', gender: 'M', studyId: 'TRIAL-002', status: PatientStatus.WITHDRAWN, lastVisit: '2024-04-15', consentStatus: 'Pending' },
    { id: 'SUB-1024', gender: 'F', studyId: 'TRIAL-001', status: PatientStatus.ENROLLED, lastVisit: '2024-05-15', consentStatus: 'Signed' },
    { id: 'SUB-1025', gender: 'F', studyId: 'TRIAL-003', status: PatientStatus.SCREENING, lastVisit: '2024-05-18', consentStatus: 'Pending', completedScreeningItems: [] },
  ]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [screeningPatient, setScreeningPatient] = useState<Patient | null>(null);
  const [safetyPatient, setSafetyPatient] = useState<Patient | null>(null);
  const [tempSigs, setTempSigs] = useState({ patient: '', pi: '' });
  const [aeForm, setAeForm] = useState<Partial<AdverseEvent>>({ type: 'AE', severity: 'Mild' });

  const handleOpenConsent = (patient: Patient) => {
    setSelectedPatient(patient);
    setTempSigs({ patient: patient.patientSignature || '', pi: patient.piSignature || '' });
  };

  const handleSaveConsent = () => {
    if (!selectedPatient) return;
    setPatients(prev => prev.map(p => 
      p.id === selectedPatient.id 
        ? { ...p, consentStatus: 'Signed', patientSignature: tempSigs.patient, piSignature: tempSigs.pi } 
        : p
    ));
    setSelectedPatient(null);
  };

  const handleToggleScreeningItem = (patientId: string, item: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      const current = p.completedScreeningItems || [];
      const updated = current.includes(item) 
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...p, completedScreeningItems: updated };
    }));
  };

  const handleFinalizeScreening = (patientId: string, result: 'Pass' | 'Fail') => {
    const p = patients.find(pat => pat.id === patientId);
    if (!p) return;

    const newStatus = result === 'Pass' ? PatientStatus.ENROLLED : PatientStatus.SCREEN_FAILURE;
    
    setPatients(prev => prev.map(pat => pat.id === patientId ? { ...pat, status: newStatus } : pat));
    
    if (result === 'Pass') {
      onStatusChange(p.studyId, 1);
    }
    
    setScreeningPatient(null);
  };

  const handleReportSafetyEvent = () => {
    if (!safetyPatient || !aeForm.description) return;

    const newEvent: AdverseEvent = {
      id: `EVT-${Math.floor(Math.random() * 10000)}`,
      type: aeForm.type as 'AE' | 'SAE',
      description: aeForm.description,
      severity: aeForm.severity as 'Mild' | 'Moderate' | 'Severe',
      date: new Date().toISOString().split('T')[0],
      status: 'Reported'
    };

    setPatients(prev => prev.map(p => 
      p.id === safetyPatient.id 
        ? { ...p, reportedEvents: [...(p.reportedEvents || []), newEvent] } 
        : p
    ));
    
    setAeForm({ type: 'AE', severity: 'Mild', description: '' });
  };

  const currentStudyChecklist = screeningPatient 
    ? studies.find(s => s.id === screeningPatient.studyId)?.screeningChecklist || ["Informed Consent", "Eligibility Review", "Vitals"]
    : [];

  const currentAeGuidelines = safetyPatient 
    ? studies.find(s => s.id === safetyPatient.studyId)?.protocolInsight?.aeGuidelines 
    : null;

  return (
    <div className="space-y-6">
      {/* Consent Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Informed Consent Form</h3>
                <p className="text-xs text-slate-500 font-mono">Document ID: ICF-{selectedPatient.id}-2024</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="prose prose-slate prose-sm max-w-none text-slate-600">
                <p className="font-bold text-slate-900">Research Participant Information and Consent Form</p>
                <p>
                  You are being asked to participate in a clinical research study. This document explains why this research is being done, what will happen during the study, and the risks and benefits of participating.
                </p>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                  <p className="font-bold text-indigo-900 text-xs uppercase mb-1">Subject Anonymization Protocol</p>
                  <p className="text-[11px] text-indigo-700">
                    To maintain HIPAA compliance and privacy, this participant is identified solely by the code <strong>{selectedPatient.id}</strong>. No PII (Personally Identifiable Information) is stored within this record.
                  </p>
                </div>
                <p>
                  By signing this form, you acknowledge that you have read the information provided, have had an opportunity to ask questions, and voluntarily agree to participate in the study protocol as described in the study {selectedPatient.studyId}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <SignaturePad 
                  label={`Subject ID: ${selectedPatient.id}`} 
                  onSave={(data) => setTempSigs(prev => ({ ...prev, patient: data }))}
                  savedImage={selectedPatient.patientSignature}
                />
                <SignaturePad 
                  label="Principal Investigator (PI)" 
                  onSave={(data) => setTempSigs(prev => ({ ...prev, pi: data }))}
                  savedImage={selectedPatient.piSignature}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedPatient(null)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveConsent}
                className="px-8 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                Finalize & Sign Consent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screening Checklist Modal */}
      {screeningPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
             <div className="p-6 border-b border-slate-100 bg-slate-50">
               <h3 className="text-xl font-bold text-slate-900">Patient Screening Checklist</h3>
               <p className="text-xs text-slate-500 font-mono mt-1">Participant: {screeningPatient.id} • Protocol: {screeningPatient.studyId}</p>
             </div>
             
             <div className="p-8 space-y-4">
               <p className="text-sm text-slate-600 mb-6">Conduct all procedures required by the study protocol to determine eligibility.</p>
               
               <div className="space-y-3">
                 {currentStudyChecklist.map((item, idx) => {
                   const isCompleted = patients.find(p => p.id === screeningPatient.id)?.completedScreeningItems?.includes(item);
                   return (
                     <div 
                      key={idx} 
                      onClick={() => handleToggleScreeningItem(screeningPatient.id, item)}
                      className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isCompleted ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                     >
                       <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                         isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
                       }`}>
                         {isCompleted && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                       </div>
                       <span className={`text-sm font-medium ${isCompleted ? 'text-indigo-900' : 'text-slate-700'}`}>{item}</span>
                     </div>
                   );
                 })}
               </div>
             </div>

             <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col space-y-3">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actionable Decision</span>
                 <span className="text-[10px] text-slate-400 italic">Required for study enrollment</span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <button 
                  onClick={() => handleFinalizeScreening(screeningPatient.id, 'Fail')}
                  className="px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all"
                 >
                   Screen Failure
                 </button>
                 <button 
                  onClick={() => handleFinalizeScreening(screeningPatient.id, 'Pass')}
                  className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                 >
                   Pass & Enroll
                 </button>
               </div>
               <button 
                onClick={() => setScreeningPatient(null)}
                className="w-full text-center text-xs font-medium text-slate-400 py-2"
               >
                 Close & Save Progress
               </button>
             </div>
          </div>
        </div>
      )}

      {/* AE/SAE Safety Reporting Modal */}
      {safetyPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <div>
                 <h3 className="text-xl font-bold text-rose-600">Safety Event Reporting</h3>
                 <p className="text-xs text-slate-500 font-mono mt-1">Participant: {safetyPatient.id} • Status: {safetyPatient.status}</p>
               </div>
               <button onClick={() => setSafetyPatient(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Report Form */}
              <div className="w-1/2 p-8 overflow-y-auto space-y-6 border-r border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Event Entry</h4>
                
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setAeForm({...aeForm, type: 'AE'})}
                      className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${aeForm.type === 'AE' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white text-slate-400'}`}
                    >
                      Adverse Event (AE)
                    </button>
                    <button 
                      onClick={() => setAeForm({...aeForm, type: 'SAE'})}
                      className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${aeForm.type === 'SAE' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white text-slate-400'}`}
                    >
                      Serious AE (SAE)
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Event Description</label>
                    <textarea 
                      value={aeForm.description || ''}
                      onChange={(e) => setAeForm({...aeForm, description: e.target.value})}
                      placeholder="Symptoms, duration, suspected cause..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none h-32"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['Mild', 'Moderate', 'Severe'].map(sev => (
                      <button 
                        key={sev}
                        onClick={() => setAeForm({...aeForm, severity: sev as any})}
                        className={`py-2 rounded-lg border text-xs font-bold transition-all ${aeForm.severity === sev ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white text-slate-400 border-slate-200'}`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handleReportSafetyEvent}
                    className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Log Safety Event</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  </button>
                </div>

                <div className="pt-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Event History</h4>
                  <div className="space-y-3">
                    {safetyPatient.reportedEvents && safetyPatient.reportedEvents.length > 0 ? (
                      safetyPatient.reportedEvents.map(evt => (
                        <div key={evt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${evt.type === 'SAE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{evt.type}</span>
                              <span className="text-[10px] font-bold text-slate-400">{evt.date}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-900">{evt.description}</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded">{evt.severity}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No events logged for this participant.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Protocol Guidance Panel */}
              <div className="w-1/2 p-8 bg-slate-900 overflow-y-auto">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="p-1.5 bg-rose-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest">Protocol-Mandated Steps</h4>
                </div>

                {currentAeGuidelines ? (
                  <div className="space-y-6">
                    <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 -mr-8 -mt-8 rounded-full" />
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                        {currentAeGuidelines}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Mandatory Coordinator Checklist</h5>
                      {[
                        "Notify Principal Investigator (PI)",
                        "Assess for Seriousness (SAE Criteria)",
                        "Complete Safety Notification Form (Sponsor)",
                        "Update Medical Records/CRF",
                        "Review for protocol-defined stopping rules"
                      ].map((step, i) => (
                        <div key={i} className="flex items-center space-x-3 group cursor-pointer">
                          <div className="w-4 h-4 rounded border border-slate-700 bg-slate-800 flex items-center justify-center group-hover:border-rose-500 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-rose-400 transition-colors" />
                          </div>
                          <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mt-8">
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Urgent Notification</p>
                      <p className="text-[11px] text-slate-400">If the event meets SAE criteria (Death, Life-threatening, Hospitalization, or Significant Disability), the Sponsor must be notified within 24 hours.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <p className="text-xs text-slate-500 max-w-[200px]">Upload study protocol PDF to extract specific AE/SAE reporting instructions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="relative w-72">
          <input 
            type="text" 
            placeholder="Search Subject ID..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-bold border border-indigo-100 mr-2 uppercase tracking-tighter">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.925-3.467 9.49-10 11.944C3.467 16.49 0 11.925 0 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            HIPAA Compliant Data
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            Export Records
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
            Assign Subject ID
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Participant Code</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Study</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Safety Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trial Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{p.id}</span>
                </td>
                <td className="px-6 py-5 text-sm text-slate-500 font-mono">{p.studyId}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2">
                    {p.reportedEvents && p.reportedEvents.length > 0 ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter">{p.reportedEvents.length} Event(s)</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">No Events</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    p.status === PatientStatus.ENROLLED ? 'bg-emerald-50 text-emerald-600' :
                    p.status === PatientStatus.SCREENING ? 'bg-indigo-50 text-indigo-600 animate-pulse' : 
                    p.status === PatientStatus.SCREEN_FAILURE ? 'bg-rose-50 text-rose-600 font-black' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end items-center space-x-2">
                    {p.status === PatientStatus.ENROLLED && (
                      <button 
                        onClick={() => setSafetyPatient(p)}
                        title="Report Adverse Event"
                        className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 rounded-lg shadow-sm hover:bg-rose-100 transition-all border border-rose-100"
                      >
                        Log Safety
                      </button>
                    )}
                    {p.status === PatientStatus.SCREENING && (
                      <button 
                        onClick={() => setScreeningPatient(p)}
                        title="Conduct Screening Procedures"
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-all"
                      >
                        Screen Procedures
                      </button>
                    )}
                    <button 
                      onClick={() => handleOpenConsent(p)}
                      title="View/Sign Consent Form"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3">
        <svg className="w-5 h-5 text-rose-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <div className="text-xs text-rose-800">
          <p className="font-bold uppercase mb-1">Safety Reporting & HIPAA Integrity</p>
          <p>Safety event reporting is a critical component of GCP. Guidance is extracted from the protocol to ensure regulatory compliance. Ensure all SAEs are reported to the PI immediately. No PII is to be entered into safety descriptions.</p>
        </div>
      </div>
    </div>
  );
};
