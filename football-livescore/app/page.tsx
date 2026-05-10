'use client'

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [filter, setFilter] = useState('Tất cả');
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('id', { ascending: true });
    if (data) setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(m => {
    if (filter === 'Tất cả') return true;
    return m.status === filter;
  });

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-12 font-sans selection:bg-red-100">
      <div className="max-w-2xl mx-auto">
        
        {/* Header: ScoreK07 Branding + Status */}
        <header className="mb-12 border-b border-slate-200 pb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Score<span className="text-red-600">K07</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">
              NK07 Data Center
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
              {new Date().toLocaleDateString('vi-VN')}
            </span>
            {/* Dòng trạng thái hoạt động đã quay trở lại nè ông */}
            <div className="inline-flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-green-700 uppercase">Server Online</span>
            </div>
          </div>
        </header>

        {/* Filter Section */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Hết trận'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                filter === status 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Match List Section */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <span className="inline-block w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : filteredMatches.length > 0 ? (
            filteredMatches.map((m) => (
              <div 
                key={m.id} 
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.04)] hover:border-red-200 transition-all group"
              >
                <div className="grid grid-cols-3 items-center">
                  <div className="text-right font-bold text-slate-800 uppercase text-sm group-hover:text-red-600 transition-colors">
                    {m.home_team}
                  </div>

                  <div className="flex flex-col items-center border-x border-slate-100 px-4">
                    <div className="text-3xl font-black tabular-nums tracking-tighter text-slate-900 flex items-center gap-3">
                      <span>{m.home_score}</span>
                      <span className="text-slate-200 font-light">-</span>
                      <span>{m.away_score}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                      {m.status === 'Đang diễn ra' && (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      )}
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">
                        {m.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-left font-bold text-slate-800 uppercase text-sm group-hover:text-red-600 transition-colors">
                    {m.away_team}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-400 font-medium italic">Không có trận đấu "{filter}"</p>
            </div>
          )}
        </div>

        {/* Footer: NK07 Team */}
        <footer className="mt-20 text-center border-t border-slate-200 pt-10 pb-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            Operated by <span className="text-slate-900">NK07 Team</span>
          </p>
          <div className="mt-2 flex justify-center items-center gap-2">
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <p className="text-[9px] text-slate-300 uppercase font-bold tracking-widest">ScoreK07 System 2026</p>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          </div>
        </footer>
      </div>
    </main>
  );
}