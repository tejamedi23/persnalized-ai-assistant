import React, { useState } from 'react';
import { searchFlights, Flight } from '../services/FlightSearchService';
import { Plane, Search, Clock, ShieldCheck, ArrowRight, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

export const FlightSearch: React.FC = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('London');
    const [flights, setFlights] = useState<Flight[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        setIsSearching(true);
        const results = await searchFlights(from, to);
        setFlights(results);
        setIsSearching(false);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Search Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-blue-500/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Plane className="w-32 h-32 rotate-45 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-8 tracking-tight text-white relative z-10">Search Flights</h2>
                <div className="flex flex-col md:flex-row gap-4 relative z-10">
                    <div className="flex-1 flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3.5 gap-3 group focus-within:bg-white/20 transition-all">
                        <Plane className="w-5 h-5 text-blue-200 rotate-90 group-hover:scale-110 transition-transform" />
                        <input
                            type="text"
                            placeholder="From: Delhi (DEL)"
                            className="bg-transparent border-none outline-none flex-1 font-medium text-sm placeholder:text-blue-200 text-white"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                            <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3.5 gap-3 group focus-within:bg-white/20 transition-all">
                        <Plane className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
                        <input
                            type="text"
                            placeholder="To: London (LHR)"
                            className="bg-transparent border-none outline-none flex-1 font-medium text-sm placeholder:text-blue-200 text-white"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 group hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {isSearching ? <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /> : <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        <span className="text-sm">{isSearching ? 'Searching...' : 'Search'}</span>
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-hide">
                {flights.length > 0 ? (
                    flights.map((flight, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={flight.id}
                            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center justify-between gap-8">
                                <div className="flex items-center gap-5 w-48">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                        <Plane className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm leading-tight mb-0.5">{flight.airline}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Economy</p>
                                    </div>
                                </div>

                                <div className="flex-1 flex items-center justify-center gap-8">
                                    <div className="text-right">
                                        <p className="text-lg font-black tracking-tight text-slate-900">{flight.departure.split(' ').pop()}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{flight.departure.split(' ')[0]}</p>
                                    </div>
                                    <div className="flex-1 max-w-[200px] flex flex-col items-center gap-2 mt-1">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{flight.duration}</span>
                                        <div className="w-full h-[2px] bg-slate-100 relative rounded-full">
                                            <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-blue-400 -translate-y-1/2" />
                                            <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-blue-400 -translate-y-1/2" />
                                            <Plane className="w-3 h-3 text-blue-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-black tracking-tight text-slate-900">{flight.arrival.split(' ').pop()}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{flight.arrival.split(' ')[0]}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 pl-8 border-l border-slate-100">
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-2xl font-black tracking-tighter text-slate-900">
                                            {flight.price}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                            <ShieldCheck className="w-3 h-3" />
                                            Best Price
                                        </div>
                                    </div>
                                    <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold transition-all text-sm hover:bg-slate-800 shadow-lg shadow-slate-900/20">
                                        Book
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    !isSearching && (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 mt-20">
                            <div className="p-6 bg-slate-50 rounded-full">
                                <Plane className="w-12 h-12 stroke-[1.5]" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest text-center text-slate-400">Search for your next destination</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
