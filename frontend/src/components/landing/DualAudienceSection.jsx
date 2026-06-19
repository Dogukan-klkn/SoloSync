import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle,
  ArrowRight,
  FolderKanban,
  Clock,
  FileText,
  Sparkles,
  Eye,
  MessageSquare,
  CreditCard,
} from 'lucide-react';

const freelancerFeatures = [
  { icon: Users, text: 'Müşteri CRM ve portal yönetimi' },
  { icon: FolderKanban, text: 'Proje, milestone ve Kanban tahtası' },
  { icon: Clock, text: 'Kronometre ve zaman takibi' },
  { icon: FileText, text: 'Fatura oluşturma ve ödeme takibi' },
  { icon: Sparkles, text: 'AI destekli müşteri istek onayı' },
];

const clientFeatures = [
  { icon: Eye, text: 'Kendi projelerini ve kilometre taşlarını görür' },
  { icon: CreditCard, text: 'Faturaları onaylar veya revizyon ister' },
  { icon: MessageSquare, text: 'AI destekli istek gönderme sistemi' },
  { icon: CheckCircle, text: 'Gerçek zamanlı proje ilerleme takibi' },
];

const DualAudienceSection = () => {
  return (
    <section id="audience" className="bg-slate-950 py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
            İki Rol, Bir Platform
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Freelancer &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
              Müşteri
            </span>{' '}
            İçin
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            SoloSync hem freelancer hem de müşterileri için özelleştirilmiş deneyimler sunar.
            Her rol kendi arayüzüne sahiptir.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Freelancer Card */}
          <div className="relative group bg-gradient-to-br from-slate-800 to-slate-900 border border-brand-500/30 rounded-2xl p-8 overflow-hidden hover:border-brand-500/60 transition-all duration-300 hover:-translate-y-1">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header */}
            <div className="relative flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-extrabold text-xl">Freelancer</h3>
                  <span className="text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full font-medium">
                    Tam Yetki
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">Tüm platform özelliklerine erişim</p>
              </div>
            </div>

            {/* Features list */}
            <ul className="relative space-y-3 mb-8">
              {freelancerFeatures.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-brand-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              to="/register"
              id="audience-freelancer-cta"
              className="relative group/btn inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40"
            >
              Freelancer Olarak Başla
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Client Card */}
          <div className="relative group bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-2xl p-8 overflow-hidden hover:border-purple-500/60 transition-all duration-300 hover:-translate-y-1">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header */}
            <div className="relative flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-extrabold text-xl">Müşteri</h3>
                  <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
                    Client Portal
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">Özel mor temalı müşteri arayüzü</p>
              </div>
            </div>

            {/* Features list */}
            <ul className="relative space-y-3 mb-8">
              {clientFeatures.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              to="/client-setup"
              id="audience-client-cta"
              className="relative group/btn inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 mb-4"
            >
              Davetiye Kodunuzla Giriş Yapın
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>

            {/* Info note */}
            <div className="relative flex items-start gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-400 text-xs leading-relaxed">
                Freelancer'ınız sizi sisteme davet ettiğinde e-postanıza bir kod gelir. O kodla buradan giriş yapabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DualAudienceSection;
