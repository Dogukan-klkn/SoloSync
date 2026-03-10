import React from 'react';
import { Settings, CheckCircle, Clock } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-6">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 text-center bg-brand-600 text-white">
                    <h1 className="text-4xl font-extrabold mb-2">Hello Freelancer</h1>
                    <p className="text-brand-100 text-lg line-clamp-2">
                        Welcome to your comprehensive SaaS platform. Manage projects, time, and finances seamlessly in one place.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                    <FeatureCard
                        icon={<CheckCircle className="w-8 h-8 text-green-500" />}
                        title="Project Management"
                        desc="Kanban boards and team management"
                    />
                    <FeatureCard
                        icon={<Clock className="w-8 h-8 text-orange-500" />}
                        title="Time Tracking"
                        desc="Log hours and generate reports"
                    />
                    <FeatureCard
                        icon={<Settings className="w-8 h-8 text-brand-500" />}
                        title="Finance & CRM"
                        desc="Automated invoices and client portal"
                    />
                </div>

                <div className="bg-slate-50 p-6 border-t border-slate-100 text-center text-sm text-slate-500">
                    Week 1 Setup - UI Architecture Foundation
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-6 rounded-xl border border-slate-100 hover:shadow-md transition-shadow bg-slate-50">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm">{desc}</p>
    </div>
);

export default HomePage;
