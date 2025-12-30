
import React, { useState, useRef, useEffect } from 'react';
import { Study, ChatMessage, ProtocolInsight, StatisticalDataPoint, PresentationSlide, SpecimenProcedure, SpecimenLogistics } from '../types';
import { getStudyInsight, analyzeProtocol } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface NotebookDashboardProps {
  study: Study;
  onProtocolAnalyzed?: (
    text: string, 
    screeningItems: string[], 
    aeGuidelines: string,
    summary: string,
    algorithm: string,
    drugFeatures: string,
    prepRequirements: string,
    stats: StatisticalDataPoint[],
    slides: PresentationSlide[],
    specimens: SpecimenProcedure[],
    shipping: SpecimenLogistics
  ) => void;
}

export const NotebookDashboard: React.FC<NotebookDashboardProps> = ({ study, onProtocolAnalyzed }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeView, setActiveView] = useState<'knowledge' | 'education' | 'conference' | 'logistics'>('knowledge');
  const [protocolInsight, setProtocolInsight] = useState<string | null>(study.protocolInsight?.schedule || null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For slide presentation
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const processFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert("Please upload a valid PDF study protocol.");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await analyzeProtocol(base64);
        setProtocolInsight(data.text);
        setIsUploading(false);
        
        if (onProtocolAnalyzed) {
          onProtocolAnalyzed(
            data.text, 
            data.screeningItems, 
            data.aeGuidelines,
            data.summary,
            data.algorithm,
            data.drugFeatures,
            data.prepRequirements,
            data.statisticalAnalysis,
            data.presentationSlides,
            data.specimenProcedures,
            data.specimenLogistics
          );
        }

        setMessages(prev => [...prev, {
          role: 'model',
          text: `Protocol analysis complete for ${study.id}. I have indexed the clinical schedule, site logistics, and specimen handling requirements. How can I assist you with this trial today?`,
          timestamp: new Date()
        }]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const enrichedStudy = { ...study, protocolInsightContent: protocolInsight };
    const aiResponseText = await getStudyInsight(enrichedStudy as any, inputValue);
    
    const aiMessage: ChatMessage = {
      role: 'model',
      text: aiResponseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const renderChecklist = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('#')) {
        return (
          <h4 key={i} className="text-indigo-400 font-bold mt-6 mb-3 text-xs uppercase tracking-[0.2em] border-b border-slate-800 pb-2">
            {line.replace(/#/g, '').trim()}
          </h4>
        );
      }
      if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]') || line.trim().startsWith('[]') || (line.trim().startsWith('-') && line.includes('Schedule'))) {
        const text = line.replace(/^- \[ \]|^- \[x\]|^\[ \]|^-/, '').trim();
        return (
          <div key={i} className="flex items-start space-x-3 my-2 group cursor-pointer hover:text-white transition-colors">
            <div className="mt-1 flex-shrink-0 w-4 h-4 rounded border border-slate-700 bg-slate-800 flex items-center justify-center group-hover:border-indigo-500">
              <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-indigo-400 transition-colors" />
            </div>
            <span className="text-sm leading-relaxed text-slate-400 group-hover:text-slate-200">{text}</span>
          </div>
        );
      }
      if (line.trim()) {
        return <p key={i} className="my-2 text-sm text-slate-500 italic leading-relaxed">{line}</p>;
      }
      return null;
    });
  };

  const slides = study.protocolInsight?.presentationSlides || [];
  const stats = study.protocolInsight?.statisticalAnalysis || [];
  const specimenTasks = study.protocolInsight?.specimenProcedures || [];
  const shipping = study.protocolInsight?.specimenLogistics;

  return (
    <div className="flex h-[calc(100vh-12rem)] space-x-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="w-1/3 flex flex-col space-y-4">
        {/* Study Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-shrink-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">PROTOCOL</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded uppercase">{study.type}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{study.id}</h2>
            </div>
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveView('knowledge')}
                className={`p-2 rounded-lg transition-all ${activeView === 'knowledge' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Protocol Base"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
              <button 
                onClick={() => setActiveView('logistics')}
                className={`p-2 rounded-lg transition-all ${activeView === 'logistics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Lab & Logistics"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </button>
              <button 
                onClick={() => setActiveView('education')}
                className={`p-2 rounded-lg transition-all ${activeView === 'education' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Education Hub"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">PI: {study.principalInvestigator}</p>
        </div>

        {/* Content Section */}
        <div 
          className="flex-1 bg-slate-900 rounded-3xl overflow-hidden flex flex-col border border-slate-800 shadow-2xl relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="font-bold text-white text-[10px] uppercase tracking-[0.2em] flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 animate-pulse" />
              {activeView === 'knowledge' ? 'Protocol Knowledge Base' : activeView === 'education' ? 'Education' : activeView === 'conference' ? 'Conference' : 'Lab Logistics'}
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,1),rgba(15,23,42,1))]">
            {!protocolInsight && !isUploading && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`h-full flex flex-col items-center justify-center text-center px-4 space-y-6 cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.98]' 
                    : 'border-slate-800 bg-slate-800/20 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border transition-all ${
                  isDragging ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'bg-slate-800 border-slate-700'
                }`}>
                  <svg className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="max-w-[240px]">
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Protocol Analysis</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Drag and drop the study protocol PDF here, or <span className="text-indigo-400 font-bold">browse files</span> to initialize the trial assistant.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.925-3.467 9.49-10 11.944C3.467 16.49 0 11.925 0 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                   <span>HIPAA Compliant Processing</span>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="h-full flex flex-col items-center justify-center space-y-6 animate-pulse">
                 <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
                 <div className="text-center">
                   <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Vectorizing PDF</p>
                   <p className="text-[10px] text-slate-500">Extracting site logistics & MOA...</p>
                 </div>
              </div>
            )}

            {protocolInsight && activeView === 'knowledge' && renderChecklist(protocolInsight)}

            {protocolInsight && activeView === 'logistics' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                <section>
                  <h4 className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-3">Specimen Processing</h4>
                  <div className="space-y-3">
                    {specimenTasks.map((t, i) => (
                      <div key={i} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl group hover:border-indigo-500/50 transition-all">
                        <p className="text-xs font-bold text-indigo-400 mb-1">{t.task}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{t.details}</p>
                      </div>
                    ))}
                  </div>
                </section>
                
                {shipping && (
                  <section>
                    <h4 className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-3">Shipping Logistics</h4>
                    <div className="p-5 bg-slate-800/60 border border-slate-800 rounded-2xl space-y-4">
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Shipping Address</p>
                        <p className="text-xs text-slate-200">{shipping.address}</p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Courier</p>
                          <p className="text-xs text-slate-200">{shipping.courier}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Contact/Phone</p>
                          <p className="text-xs text-slate-200">{shipping.courierContact}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}

            {protocolInsight && activeView === 'education' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-700 space-y-8">
                <section>
                  <h4 className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-3">Summary</h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{study.protocolInsight?.summary}"</p>
                </section>
                <section>
                  <h4 className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-3">Algorithm</h4>
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800 font-mono text-[10px] text-emerald-100 whitespace-pre-wrap">
                    {study.protocolInsight?.algorithm}
                  </div>
                </section>
              </div>
            )}

            {protocolInsight && activeView === 'conference' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-700 space-y-8">
                <section>
                  <h4 className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-4">Design Parameters</h4>
                  <div className="h-48 w-full bg-slate-800/30 rounded-2xl border border-slate-800 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats}>
                        <XAxis dataKey="label" hide />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
            )}
          </div>
          
          {/* Re-upload mini-zone when protocol is already present */}
          {protocolInsight && (
            <div className="absolute bottom-4 right-4 z-20">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-xl"
                title="Replace Protocol PDF"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
        {activeView === 'conference' && slides.length > 0 ? (
          <div className="flex-1 flex flex-col animate-in fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Slide Preview: {currentSlideIndex + 1}</h3>
              <div className="flex space-x-2">
                <button onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} className="p-1 border rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" /></svg></button>
                <button onClick={() => setCurrentSlideIndex(Math.min(slides.length-1, currentSlideIndex + 1))} className="p-1 border rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>
            <div className="flex-1 p-12 bg-slate-50 flex items-center justify-center">
              <div className="aspect-video w-full max-w-2xl bg-white rounded shadow-2xl p-12 flex flex-col border border-slate-200">
                <h1 className="text-2xl font-black text-indigo-600 mb-6">{slides[currentSlideIndex].title}</h1>
                <ul className="space-y-3">
                  {slides[currentSlideIndex].bullets.map((b, i) => <li key={i} className="text-slate-600">• {b}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <span className="font-bold text-slate-900 text-sm">Coordinator Assistant</span>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                   <div className="p-4 bg-slate-50 rounded-full mb-4">
                     <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                     </svg>
                   </div>
                   <p className="text-sm text-slate-500">Trial Assistant is ready to answer questions about study logistics once protocol is loaded.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-800'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl p-3 flex space-x-1.5 items-center">
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <input 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder={protocolInsight ? "Ask about protocol or logistics..." : "Please upload protocol first..."} 
                disabled={!protocolInsight}
                className="w-full border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed" 
              />
            </div>
          </>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};
