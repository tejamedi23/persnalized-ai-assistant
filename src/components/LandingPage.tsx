import React, { useState } from 'react';
import { Calendar, CheckCircle2, Shield, Zap } from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';

export const LandingPage: React.FC = () => {
    const { login } = useCalendar();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && name) {
            login(name, email);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Calendar className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-bold text-slate-900">CalendarAI</span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#" className="text-slate-500 hover:text-slate-900">Features</a>
                            <a href="#" className="text-slate-500 hover:text-slate-900">Enterprise</a>
                            <a href="#" className="text-slate-500 hover:text-slate-900">Pricing</a>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">

                    {/* Hero Content */}
                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                        <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                            <span className="block xl:inline">Master your time with</span>{' '}
                            <span className="block text-indigo-600 xl:inline">intelligent scheduling</span>
                        </h1>
                        <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                            The professional calendar designed for high-performance teams and individuals. Experience seamless scheduling with AI-driven insights.
                        </p>
                        <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                    <span className="text-slate-600">Smart conflict detection</span>
                                </div>
                                <div className="flex items-center">
                                    <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                                    <span className="text-slate-600">Lightning fast interface</span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-blue-500 mr-2" />
                                    <span className="text-slate-600">Enterprise-grade security</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sign In Form */}
                    <div className="mt-12 sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                        <div className="w-full rounded-2xl bg-white shadow-xl border border-slate-100 p-8 sm:p-10">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-2 bg-white text-sm text-slate-500">
                                        Sign in to your account
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                        Full Name
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                        Email address
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        Access Dashboard
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
