
import React from 'react';
import { Cloud, Github, Key, Zap, ShieldCheck, ExternalLink, Globe } from 'lucide-react';

const DevGuide: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-3xl mb-4">
           <Cloud className="w-10 h-10 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Vercel ডেপ্লয়মেন্ট গাইড</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cloud Hosting Simplified</p>
      </div>

      <div className="space-y-6">
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="flex items-center gap-3 mb-6 text-slate-900 dark:text-white">
            <Github className="w-6 h-6" />
            <h4 className="font-black uppercase tracking-tight">ধাপ ১: GitHub পুশ</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            প্রথমে আপনার প্রোজেক্টটি একটি GitHub রিপোজিটরিতে পুশ করুন। Vercel অটোমেটিক আপনার GitHub থেকে কোড নিয়ে নেবে।
          </p>
        </section>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="flex items-center gap-3 mb-6 text-indigo-600">
            <Globe className="w-6 h-6" />
            <h4 className="font-black uppercase tracking-tight text-slate-900 dark:text-white">ধাপ ২: Vercel এ ইম্পোর্ট</h4>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>১. <a href="https://vercel.com" target="_blank" className="text-indigo-600 font-bold underline">vercel.com</a> এ যান।</p>
            <p>২. <b>"Add New"</b> > <b>"Project"</b> এ ক্লিক করুন।</p>
            <p>৩. আপনার রিপোজিটরি সিলেক্ট করে <b>"Import"</b> করুন।</p>
          </div>
        </section>

        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-amber-300" />
            <h4 className="font-black uppercase tracking-tight">ধাপ ৩: এপিআই কী সেটআপ</h4>
          </div>
          <p className="text-xs mb-6 opacity-90 leading-relaxed font-medium">
            এআই চ্যাট এবং ট্রেন ট্র্যাকিং সচল করতে Vercel ড্যাশবোর্ডে এনভায়রনমেন্ট ভেরিয়েবল সেট করা বাধ্যতামূলক।
          </p>
          <div className="bg-black/20 p-5 rounded-2xl border border-white/20 font-mono text-xs mb-4">
            <p className="text-amber-300">Variable Name: <span className="text-white font-bold">API_KEY</span></p>
            <p className="text-amber-300">Value: <span className="text-white">আপনার_জেমিনি_কী</span></p>
          </div>
          <p className="text-[10px] italic opacity-70">Note: Environment Variables মেনুতে গিয়ে এটি যোগ করুন এবং Save দিন।</p>
        </section>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <Zap className="w-6 h-6" />
            <h4 className="font-black uppercase tracking-tight text-slate-900 dark:text-white">কেন Vercel?</h4>
          </div>
          <ul className="text-xs space-y-3 text-slate-500 dark:text-slate-400 font-bold">
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> ১ বছরের জন্য ফ্রি হোস্টিং।</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> SSL সার্টিফিকেট (HTTPS) অটোমেটিক।</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> এআই এর জন্য ফাস্ট রেসপন্স টাইম।</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DevGuide;
