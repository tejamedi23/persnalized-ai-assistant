import React, { useState } from 'react';
import { searchTravel, TravelOption, TransitMode, getJourneyComparison, JourneyComparison } from '../services/TravelSearchService';
import { Plane, Search, Clock, ShieldCheck, ArrowRight, Train, Bus, Car, MapPin, Zap, CircleDollarSign, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TravelSearch: React.FC = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('London');
    const [options, setOptions] = useState<TravelOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeMode, setActiveMode] = useState<TransitMode>('flight');
    const [comparison, setComparison] = useState<JourneyComparison | null>(null);

    const handleSearch = async () => {
        setIsSearching(true);
        const results = await searchTravel(from, to, activeMode);
        setOptions(results);
        setComparison(getJourneyComparison(results));
        setIsSearching(false);
    };

    const modes: { id: TransitMode; icon: any; label: string }[] = [
        { id: 'flight', icon: Plane, label: 'Flights' },
        { id: 'train', icon: Train, label: 'Trains' },
        { id: 'bus', icon: Bus, label: 'Buses' },
        { id: 'transit', icon: Car, label: 'Transit' },
    ];

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Mode Switcher */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${activeMode === mode.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <mode.icon className="w-4 h-4" />
                        {mode.label}
                    </button>
                ))}
            </div>

            {/* Search Header */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Plane className={`w-32 h-32 rotate-45 text-white transition-transform duration-700 ${activeMode === 'flight' ? 'scale-100' : 'scale-0'}`} />
                    <Train className={`w-32 h-32 text-white absolute top-8 right-8 transition-transform duration-700 ${activeMode === 'train' ? 'scale-100' : 'scale-0'}`} />
                </div>

                <h2 className="text-3xl font-black mb-8 tracking-tighter text-white relative z-10 italic">
                    {activeMode.toUpperCase()} FINDER
                </h2>

                <div className="flex flex-col md:flex-row gap-4 relative z-10">
                    <div className="flex-1 flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 gap-4 group focus-within:bg-white/10 transition-all ring-1 ring-white/10">
                        <MapPin className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                        <input
                            type="text"
                            placeholder="Origin City"
                            className="bg-transparent border-none outline-none flex-1 font-bold text-base placeholder:text-slate-500 text-white"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center backdrop-blur-xl border border-white/10 rotate-90 md:rotate-0">
                            <ArrowRight className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>

                    <div className="flex-1 flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 gap-4 group focus-within:bg-white/10 transition-all ring-1 ring-white/10">
                        <MapPin className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                        <input
                            type="text"
                            placeholder="Destination City"
                            className="bg-transparent border-none outline-none flex-1 font-bold text-base placeholder:text-slate-500 text-white"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="bg-blue-600 text-white hover:bg-blue-500 px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group hover:-translate-y-1 active:translate-y-0"
                    >
                        {isSearching ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        <span className="uppercase tracking-widest text-xs">{isSearching ? 'Searching...' : 'Explore'}</span>
                    </button>
                </div>
            </div>

            {/* Comparison Cards */}
            <AnimatePresence>
                {comparison && options.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Fastest Option</p>
                                <p className="text-sm font-bold text-slate-900">{comparison.fastest.provider} - {comparison.fastest.duration}</p>
                            </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                                <CircleDollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cheapest Option</p>
                                <p className="text-sm font-bold text-slate-900">{comparison.cheapest.provider} - {comparison.cheapest.price}</p>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white">
                                <Lightbulb className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">AI Suggestion</p>
                                <p className="text-xs font-bold text-slate-900 leading-tight">{comparison.recommendation}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {options.length > 0 ? (
                        options.map((option: TravelOption, idx: number) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.1 }}
                                key={option.id}
                                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-6 w-56">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                            {option.mode === 'flight' ? <Plane className="w-7 h-7 text-blue-600" /> :
                                                option.mode === 'train' ? <Train className="w-7 h-7 text-blue-600" /> :
                                                    <Bus className="w-7 h-7 text-blue-600" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-base leading-tight mb-1">{option.provider}</h4>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                {option.details}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex items-center justify-center gap-10">
                                        <div className="text-right">
                                            <p className="text-xl font-black tracking-tight text-slate-900">{option.departure.split(' ').pop()}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{option.departure.split(' ')[0]}</p>
                                        </div>

                                        <div className="flex-1 max-w-[240px] flex flex-col items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{option.duration}</span>
                                            <div className="w-full h-[2px] bg-slate-100 relative rounded-full overflow-hidden">
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                                                {option.stops === 0 ? 'Non-stop' : `${option.stops} Stops`}
                                            </span>
                                        </div>

                                        <div className="text-left">
                                            <p className="text-xl font-black tracking-tight text-slate-900">{option.arrival.split(' ').pop()}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{option.arrival.split(' ')[0]}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 pl-10 border-l border-slate-100">
                                        <div className="text-right">
                                            <div className="text-2xl font-black tracking-tighter text-slate-900 mb-0.5">
                                                {option.price}
                                            </div>
                                            <div className="flex items-center justify-end gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Refundable
                                            </div>
                                        </div>
                                        <button className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black transition-all text-xs hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 uppercase tracking-widest">
                                            Select
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        !isSearching && (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-6 mt-20">
                                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                                    <MapPin className="w-16 h-16 stroke-[1]" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Where to next?</p>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">Search for flights, trains, and buses</p>
                                </div>
                            </div>
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
