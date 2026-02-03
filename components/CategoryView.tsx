
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Loader2, 
  TrainFront,
  X,
  Sparkles,
  Info,
  Globe,
  Navigation,
  RefreshCcw,
  DollarSign,
  AlertCircle,
  Clock,
  Search,
  ExternalLink
} from 'lucide-react';
import { Category, Train, AIInference } from '../types.ts';
import { db } from '../db.ts';
import { RAJBARI_DATA } from '../constants.tsx';

interface CategoryViewProps {
  category: Category;
  onBack: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ category }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [isInferring, setIsInferring] = useState(false);
  const [currentStation, setCurrentStation] = useState<string | null>(null);
  const [aiInference, setAiInference] = useState<AIInference & { sources?: any[] }>({ 
    delayMinutes: 0, 
    confidence: 0, 
    reason: '', 
    isAI: false,
    sources: []
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (category === 'market_price') {
        await runMarketAI();
      } else {
        const items = await db.getCategory(category);
        setData(items);
      }
    } catch (e: any) {
      const items = await db.getCategory(category);
      setData(items);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [category]);

  const runMarketAI = async () => {
    try {
      const response = await db.callAI({
        contents: [{ parts: [{ text: "রাজবাড়ী জেলার স্থানীয় বাজারের নিত্যপণ্যের দামের একটি বর্তমান JSON তালিকা দিন। ফিল্ডগুলো হবে: name, unit, priceRange।" }] }],
        systemInstruction: "আপনি রাজবাড়ী জেলা বাজার মনিটরিং অফিসার। শুধু JSON Array দিন।",
        model: 'gemini-3-flash-preview'
      });
      const parsedData = db.extractJSON(response.text);
      if (parsedData) setData(parsedData.map((item: any, idx: number) => ({ ...item, id: `m-${idx}` })));
      else throw new Error("JSON parsing failed");
    } catch (err) {
      setData((RAJBARI_DATA as any).market_price);
    }
  };

  const runTrainAIInference = async (train: Train) => {
    if (isInferring) return;
    setIsInferring(true);
    setCurrentStation(null);
    setAiInference({ delayMinutes: 0, confidence: 0, reason: 'অনলাইনে তথ্য খোঁজা হচ্ছে...', isAI: true, sources: [] });
    
    try {
      const now = new Date().toLocaleTimeString('bn-BD');
      const prompt = `এখন সময় ${now}। রাজবাড়ী জেলার "${train.name}" (ট্রেন নং ${train.id}) বর্তমানে কোথায় আছে? ফেসবুক গ্রুপ 'Rajbari Rail Club' বা 'Rajbari Helpline' এবং অনলাইন সোর্স থেকে সর্বশেষ ২ ঘণ্টার আপডেট চেক করুন। আপনার উত্তরের শেষে অবশ্যই "[STATION: স্টেশনের নাম]" ট্যাগটি যোগ করবেন। যদি সঠিক স্টেশন না পান তবে "অজানা" লিখুন।`;
      
      const response = await db.callAI({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: "আপনি রাজবাড়ী রেলওয়ে ট্র্যাকিং সহকারী। গুগল সার্চ ব্যবহার করে দ্রুত ও সঠিক তথ্য দিন।",
        model: 'gemini-3-flash-preview',
        tools: [{ googleSearch: {} }]
      });

      const text = response.text || "দুঃখিত, কোনো সাম্প্রতিক তথ্য পাওয়া যায়নি।";
      const stationMatch = text.match(/\[STATION:\s*(.*?)\]/i);
      
      if (stationMatch && stationMatch[1] && !stationMatch[1].includes("অজানা")) {
        const found = stationMatch[1].trim();
        const routeStations = train.detailedRoute.split(',').map(s => s.trim());
        const bestMatch = routeStations.find(s => found.includes(s) || s.includes(found));
        setCurrentStation(bestMatch || found);
      }

      setAiInference({ 
        delayMinutes: 0, 
        confidence: 0.95, 
        reason: text.replace(/\[STATION:.*?\]/i, '').trim(), 
        isAI: true, 
        sources: response.groundingMetadata?.groundingChunks || [] 
      });
    } catch (e: any) {
      setAiInference({ 
        delayMinutes: 0, 
        confidence: 0, 
        reason: "দুঃখিত! কানেকশন এরর: " + (e.message || "Unknown error"), 
        isAI: false, 
        sources: [] 
      });
    } finally { 
      setIsInferring(false); 
    }
  };

  const renderItem = (item: any) => {
    if (category === 'market_price') return (
      <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] mb-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm hover:border-emerald-200 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center rounded-2xl text-emerald-600 shadow-inner"><DollarSign className="w-7 h-7" /></div>
          <div><h4 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{item.name}</h4><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.unit}</p></div>
        </div>
        <div className="text-right"><div className="text-lg font-black text-slate-800 dark:text-white mb-1">{item.priceRange}</div></div>
      </div>
    );

    if (category === 'trains') return (
      <div key={item.id} onClick={() => { setSelectedTrain(item); runTrainAIInference(item); }} className="bg-white dark:bg-slate-900 p-6 rounded-[2.8rem] shadow-sm mb-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-4 cursor-pointer active:scale-95 hover:border-indigo-400 transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-indigo-500/10"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><TrainFront className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{item.name}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.route}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {item.departure}
            </p>
          </div>
        </div>
      </div>
    );

    return (
      <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] mb-3 flex items-center justify-between border border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-xl shadow-inner">{item.icon || <Info className="w-6 h-6 text-indigo-500" />}</div>
          <div><h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{item.name || item.title || item.org}</h4><p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.mobile || item.time || item.deadline}</p></div>
        </div>
        {(item.mobile || item.number) && <a href={`tel:${item.mobile || item.number}`} className="p-4 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl active:scale-90 transition-all"><Phone className="w-5 h-5" /></a>}
      </div>
    );
  };

  return (
    <div className="px-6 py-6 pb-40 max-w-lg mx-auto overflow-x-hidden">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase leading-none mb-1">
            {category === 'trains' ? 'লাইভ ট্রেন ট্র্যাকিং' : category === 'market_price' ? 'বাজারদর (AI)' : 'বিস্তারিত তালিকা'}
          </h3>
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.5em]">Direct AI Link</p>
        </div>
        <button onClick={fetchData} className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-indigo-600 active:rotate-180 transition-all duration-500">
           <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-[2.5rem] border border-rose-200 dark:border-rose-900/50 mb-8 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest mb-1">কানেকশন সমস্যা</p>
            <p className="text-xs font-bold text-rose-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-600 opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">ডাটাবেস চেক করা হচ্ছে...</p>
        </div>
      ) : (
        <div className="animate-slide-up">
          {data.length > 0 ? data.map(renderItem) : <div className="text-center py-20 text-slate-400 font-bold">কোনো তথ্য পাওয়া যায়নি।</div>}
        </div>
      )}

      {selectedTrain && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-end md:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col animate-slide-up">
            <button onClick={() => { setSelectedTrain(null); setCurrentStation(null); }} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 z-50 hover:bg-rose-50 hover:text-rose-500 transition-all"><X className="w-6 h-6" /></button>
            <div className="p-8 pb-4 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-600 text-white rounded-[1.8rem] shadow-lg"><TrainFront className="w-8 h-8" /></div>
                <div><h3 className="text-2xl font-black dark:text-white leading-tight">{selectedTrain.name}</h3><p className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em]">{selectedTrain.route}</p></div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-indigo-950/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 mb-6 relative overflow-hidden">
                 <div className="flex items-center gap-2 mb-4">
                   <div className={`w-2 h-2 rounded-full ${isInferring ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
                   <h4 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">লাইভ এআই রিপোর্ট (গুগল সার্চ)</h4>
                 </div>
                 
                 <div className="space-y-4">
                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">
                     {isInferring ? "ফেসবুক ও নিউজ পোর্টাল থেকে আপডেট সংগ্রহ করা হচ্ছে..." : `"${aiInference.reason}"`}
                   </p>
                   
                   {currentStation && !isInferring && (
                      <div className="flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl animate-bounce">
                        <Navigation className="w-5 h-5" />
                        <p className="text-xs font-black">ট্রেনটি এখন {currentStation} স্টেশনে</p>
                      </div>
                   )}

                   {!isInferring && aiInference.sources && aiInference.sources.length > 0 && (
                     <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800 mt-2">
                       {aiInference.sources.slice(0, 3).map((chunk, idx) => chunk.web && (
                         <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] font-black uppercase text-indigo-600 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900 flex items-center gap-1 hover:scale-105 transition-transform">
                           <ExternalLink className="w-3 h-3" /> সোর্স {idx + 1}
                         </a>
                       ))}
                     </div>
                   )}
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-800/50 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 mb-10 shadow-inner">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-rose-500" /> রুট ম্যাপ ও স্টেশনসমূহ
                 </h4>
                 <div className="relative pl-10 space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700">
                    {selectedTrain.detailedRoute.split(',').map((station, sIdx) => {
                      const sName = station.trim();
                      const isCurrent = currentStation?.toLowerCase().includes(sName.toLowerCase()) || sName.toLowerCase().includes(currentStation?.toLowerCase() || "___NONE___");
                      return (
                        <div key={sIdx} className="relative flex items-center justify-between group/st">
                          <div className="flex items-center gap-5">
                            <div className={`absolute -left-[29px] z-10 transition-all duration-500 ${isCurrent ? 'scale-125' : 'group-hover/st:scale-110'}`}>
                               {isCurrent ? (
                                 <div className="w-8 h-8 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                                   <TrainFront className="w-4 h-4 text-white" />
                                 </div>
                               ) : (
                                 <div className="w-3 h-3 rounded-full border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover/st:border-indigo-400"></div>
                               )}
                            </div>
                            <span className={`text-sm font-bold transition-colors ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600 group-hover/st:text-slate-800'}`}>{sName}</span>
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
