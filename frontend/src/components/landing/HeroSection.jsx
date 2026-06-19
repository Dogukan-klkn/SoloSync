import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, TrendingUp, Clock, DollarSign, Users } from 'lucide-react';

const StatBadge = ({ icon: Icon, value, label, color }) => (
  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-white font-bold text-lg leading-none">{value}</p>
      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column — Text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
              Serbest Çalışanlar İçin Tasarlandı
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Freelance
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
                  İşinizi Yönetin
                </span>
                {/* Underline decoration */}
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-cyan-500 rounded-full opacity-60" />
              </span>
              <br />
              Tek Merkezden
            </h1>

            {/* Subtext */}
            <p className="text-slate-400 text-lg lg:text-xl leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Müşteri yönetimi, proje takibi, Kanban, zaman kaydı ve faturalandırmayı 
              tek platformda birleştiren akıllı SaaS çözümü.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                id="hero-cta-register"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold text-base px-7 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5"
              >
                Freelancer Olarak Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/client-setup"
                id="hero-cta-client"
                className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-100 font-semibold text-base px-7 py-4 rounded-xl border border-purple-500/40 hover:border-purple-400/70 hover:bg-purple-500/10 transition-all duration-300"
              >
                <PlayCircle className="w-5 h-5" />
                Müşteri Girişi
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {['bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-pink-500'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <span className="text-white font-semibold text-sm">+500 freelancer</span>
                <span className="text-slate-400 text-sm"> kullanıyor</span>
              </div>
            </div>
          </div>

          {/* Right Column — Dashboard Preview */}
          <div className="relative hidden lg:flex flex-col items-center justify-center gap-4">
            {/* Main dashboard card */}
            <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-2xl">
              {/* Mini header */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-slate-500 font-mono">SoloSync Dashboard</span>
              </div>

              {/* KPI Row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Aktif Proje', value: '8', color: 'text-brand-400', bg: 'bg-brand-500/20' },
                  { label: 'Bu Ay Gelir', value: '₺24K', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                  { label: 'Bekleyen Fatura', value: '3', color: 'text-amber-400', bg: 'bg-amber-500/20' },
                  { label: 'Çalışılan Saat', value: '142h', color: 'text-violet-400', bg: 'bg-violet-500/20' },
                ].map((kpi) => (
                  <div key={kpi.label} className={`${kpi.bg} rounded-xl p-3`}>
                    <p className={`text-xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* Mini Kanban preview */}
              <div className="space-y-2">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Kanban</p>
                {[
                  { task: 'Logo tasarımı', status: 'In Progress', color: 'bg-brand-500' },
                  { task: 'Landing page', status: 'Review', color: 'bg-amber-500' },
                  { task: 'API entegrasyonu', status: 'Done', color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.task} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                    <span className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                    <span className="text-slate-300 text-sm flex-1">{item.task}</span>
                    <span className="text-xs text-slate-500">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating stat badges */}
            <div className="absolute -left-10 top-10 animate-float">
              <StatBadge icon={TrendingUp} value="↑ 32%" label="Proje tamamlama" color="bg-emerald-500" />
            </div>
            <div className="absolute -right-8 bottom-16 animate-float-delayed">
              <StatBadge icon={Clock} value="4.2 saat" label="Günlük ortalama" color="bg-brand-500" />
            </div>
            <div className="absolute -left-8 bottom-4 animate-float" style={{ animationDelay: '2s' }}>
              <StatBadge icon={DollarSign} value="₺8,400" label="Bu haftaki kazanç" color="bg-violet-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
};

export default HeroSection;
