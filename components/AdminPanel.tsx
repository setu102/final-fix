
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Cloud,
  Zap,
  LogOut,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  Github
} from 'lucide-react';
import { db } from '../db';
import DevGuide from './DevGuide';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState('');

  const runDiagnostics = async () => {
    setTestStatus('loading');
    setTestResult('');
    try {
      const response = await db.callAI({
        contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
        systemInstruction: "Respond with 'Vercel Edge Active'"
      });
      setTestStatus('success');
      setTestResult(`সংযুক্ত হয়েছে! মুড: ${response.mode}`);
    } catch (e: any) {
      setTestStatus('error');
      setTestResult(e.message);
    }
  };

  return (
    <div className="p-6 animate-slide-up pb-32 max-w-lg mx-auto">
      {/* Premium Header */}
      <div className="mb-8 p-8 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Cloud className="w-24 h-24 animate-pulse" />
        </div>
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">ক্লাউড কন্ট্রোল</h2>
              <p className="text-indigo-200 text-[10px] font-bold opacity-80 uppercase tracking-[0.3em]">Vercel Native Deployment</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all text-white"><LogOut className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Cloud Diagnostics */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 premium-shadow mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><Activity className="w-6 h-6" /></div>
          <div>
            <h4 className="text-xl font-black dark:text-white tracking-tighter uppercase">এআই কানেক্টিভিটি</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Serverless Health Check</p>
          </div>
        </div>

        <button 
          onClick={runDiagnostics}
          disabled={testStatus === 'loading'}
          className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.8rem] font-black shadow-xl hover:opacity-90 active:scale-95 transition-all mb-6 disabled:opacity-50"
        >
          {testStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
          কানেকশন টেস্ট করুন
        </button>

        {testStatus !== 'idle' && (
          <div className={`p-6 rounded-[2rem] border flex items-start gap-4 ${
            testStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50' : 
            testStatus === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50' : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800/50 dark:border-slate-800'
          }`}>
            {testStatus === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
            <div>
              <p className="font-black text-sm uppercase tracking-widest mb-1">{testStatus === 'success' ? 'সার্ভার সচল' : 'সার্ভার অফলাইন'}</p>
              <p className="text-xs font-medium leading-relaxed opacity-80">{testResult}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-2xl w-fit mb-4"><Github className="w-5 h-5" /></div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Source</h4>
          <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Vercel Git</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-2xl w-fit mb-4"><Zap className="w-5 h-5" /></div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latency</h4>
          <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Edge Cache</p>
        </div>
      </div>

      <DevGuide />
    </div>
  );
};

export default AdminPanel;
