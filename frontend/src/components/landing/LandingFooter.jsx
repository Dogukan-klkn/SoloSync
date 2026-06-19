import { Link } from 'react-router-dom';
import { Zap, Github } from 'lucide-react';

const footerLinks = [
  {
    heading: 'Ürün',
    links: [
      { label: 'Özellikler', href: '#features' },
      { label: 'Nasıl Çalışır', href: '#how-it-works' },
      { label: 'Fiyatlandırma', href: '#' },
    ],
  },
  {
    heading: 'Hesap',
    links: [
      { label: 'Giriş Yap', href: '/login', isRoute: true },
      { label: 'Kayıt Ol', href: '/register', isRoute: true },
    ],
  },
  {
    heading: 'Platform',
    links: [
      { label: 'Freelancer Dashboard', href: '/login', isRoute: true },
      { label: 'Müşteri Portali', href: '/login', isRoute: true },
    ],
  },
];

const LandingFooter = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group w-fit" id="footer-logo">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Solo<span className="text-brand-400">Sync</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Serbest çalışan profesyoneller için kapsamlı iş yönetimi platformu.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/5 border border-white/10 hover:border-white/30 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                {group.heading}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} SoloSync. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-xs">Built with</span>
            <span className="text-slate-500 text-xs font-semibold">React · .NET · PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
