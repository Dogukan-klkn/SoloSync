import {
  Users,
  FolderKanban,
  LayoutDashboard,
  Clock,
  FileText,
  Sparkles,
  Monitor,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Müşteri Yönetimi (CRM)',
    description:
      'Müşteri bilgilerini tek yerden yönetin. Müşteri ekleyin, düzenleyin ve portal hesaplarını bağlayın.',
    color: 'from-sky-500 to-brand-500',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20',
    badge: 'CRM',
  },
  {
    icon: FolderKanban,
    title: 'Proje & Milestone Takibi',
    description:
      'Proje bütçelerini, durumlarını ve kilometre taşlarını izleyin. Otomatik ilerleme yüzdesi hesaplaması.',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    badge: 'Projeler',
  },
  {
    icon: LayoutDashboard,
    title: 'Kanban Tahtası',
    description:
      'Sürükle-bırak görev yönetimi, etiketler ve müşteri isteklerinden otomatik görev oluşturma.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    badge: 'Kanban',
  },
  {
    icon: Clock,
    title: 'Zaman Takibi',
    description:
      'Kronometre ile anında kayıt, manuel giriş desteği ve günlük/haftalık özet raporlar.',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    badge: 'Zaman',
  },
  {
    icon: FileText,
    title: 'Faturalandırma',
    description:
      'Fatura oluşturun, ödeme takibi yapın, PDF olarak gönderin ve müşteri onay akışını yönetin.',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    badge: 'Fatura',
  },
  {
    icon: Sparkles,
    title: 'AI Destekli İstekler',
    description:
      'Müşteri istekleri AI ile özetlenir ve önceliklendirilir. Tek tıkla Kanban görevine dönüştürün.',
    color: 'from-brand-500 to-cyan-500',
    bgColor: 'bg-brand-500/10',
    borderColor: 'border-brand-500/20',
    badge: 'AI',
    highlight: true,
  },
  {
    icon: Monitor,
    title: 'Müşteri Portali',
    description:
      'Müşterilerinize özel mor temalı portal. Projeler, faturalar ve istek gönderme — her şey bir arada.',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    badge: 'Portal',
  },
];

const FeatureCard = ({ feature, index }) => {
  const Icon = feature.icon;
  return (
    <div
      className={`group relative bg-slate-800/60 backdrop-blur-sm border ${feature.borderColor} rounded-2xl p-6 hover:bg-slate-800/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
        feature.highlight ? 'ring-1 ring-brand-500/40' : ''
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.color} blur-2xl`} style={{ opacity: 0 }} />

      {/* Badge */}
      {feature.highlight && (
        <span className="absolute top-4 right-4 text-xs font-bold bg-gradient-to-r from-brand-500 to-cyan-500 text-white px-2 py-0.5 rounded-full">
          AI
        </span>
      )}

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className={`bg-gradient-to-br ${feature.color} rounded-lg w-full h-full flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-white font-bold text-base">{feature.title}</h3>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>

      {/* Bottom arrow */}
      <div className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.color}`}>Keşfet</span>
        <ArrowRight className="w-3 h-3 text-brand-400" />
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-slate-950 py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Özellikler
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Her Şey Tek{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
              Platformda
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Freelance işinizi yönetmek için ihtiyacınız olan tüm araçlar — birbirine bağlı, akıllı ve kullanımı kolay.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
