import { Link } from 'react-router-dom';
import { ArrowRight, Zap, CheckCircle } from 'lucide-react';

const perks = [
  'Ücretsiz başlayın, kredi kartı gerekmez',
  'Müşteri portali dahil, ekstra ücret yok',
  'AI destekli istek yönetimi',
  'PDF fatura ve ödeme takibi',
];

const CTASection = () => {
  return (
    <section id="cta" className="relative bg-slate-900 py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-slate-900 to-violet-900/30" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl shadow-2xl shadow-brand-500/30 mb-6 mx-auto">
          <Zap className="w-8 h-8 text-white" />
        </div>

        {/* Headline */}
        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-4 leading-tight">
          Freelance Kariyerinizi
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-400 to-brand-400">
            Bir Üst Seviyeye Taşıyın
          </span>
        </h2>

        <p className="text-slate-400 text-lg lg:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
          Binlerce freelancer SoloSync ile daha az zaman harcayarak daha fazla kazanıyor.
          Siz de bugün başlayın.
        </p>

        {/* Perks */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>{perk}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link
            to="/register"
            id="cta-section-register"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-300 shadow-2xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5"
          >
            Hemen Ücretsiz Başla
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            id="cta-section-login"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-base px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
          >
            Zaten hesabım var — Giriş Yap
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
