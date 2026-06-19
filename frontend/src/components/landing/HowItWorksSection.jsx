import { UserPlus, FolderPlus, LayoutDashboard, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Kayıt Ol & Başla',
    description:
      'Dakikalar içinde hesabınızı oluşturun. Kredi kartı gerekmez, hemen kullanmaya başlayın.',
    color: 'from-brand-400 to-brand-600',
    glow: 'shadow-brand-500/30',
  },
  {
    number: '02',
    icon: FolderPlus,
    title: 'Müşteri & Proje Ekle',
    description:
      'Müşterilerinizi CRM\'e ekleyin, projeler oluşturun ve milestone\'lar belirleyin.',
    color: 'from-violet-400 to-purple-600',
    glow: 'shadow-violet-500/30',
  },
  {
    number: '03',
    icon: LayoutDashboard,
    title: 'Kanban\'da Yönet',
    description:
      'Görevleri sürükle-bırak ile organize edin. Zaman kaydedin, fatura kesin.',
    color: 'from-emerald-400 to-teal-600',
    glow: 'shadow-emerald-500/30',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Büyü & Ölçeklen',
    description:
      'Dashboard analitiği ile performansınızı izleyin. Müşteri portali ile profesyonel bir imaj oluşturun.',
    color: 'from-amber-400 to-orange-500',
    glow: 'shadow-amber-500/30',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-slate-900 py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Nasıl Çalışır
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
            4 Adımda{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
              Verimli Çalış
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Karmaşık kurulum yok. Birkaç dakika içinde tam kapsamlı iş yönetimine geçin.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center text-center group">
                  {/* Step icon circle */}
                  <div className="relative mb-6">
                    {/* Outer glow ring */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-20 group-hover:opacity-40 blur-lg transition-opacity duration-500 scale-125`} />
                    {/* Icon container */}
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl ${step.glow} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {/* Step number badge */}
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 border border-white/20 text-white text-xs font-extrabold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-white font-bold text-lg mb-3 group-hover:text-brand-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Timeline / Flow (mobile friendly) */}
        <div className="mt-16 bg-slate-800/50 border border-white/10 rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-0">
            {['Kayıt Ol', 'Müşteri Ekle', 'Proje Başlat', 'Fatura Kes', 'Kazan 🎉'].map((label, i, arr) => (
              <div key={label} className="flex items-center gap-4 lg:gap-0 lg:flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-brand-500 rounded-full shadow-md shadow-brand-500/50" />
                  <span className="text-slate-300 text-xs font-semibold mt-2 whitespace-nowrap">{label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-12 h-px lg:flex-1 bg-gradient-to-r from-brand-500 to-brand-600 opacity-50 lg:w-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
