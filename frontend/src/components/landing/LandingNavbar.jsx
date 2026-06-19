import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Özellikler', href: '#features' },
    { label: 'Nasıl Çalışır', href: '#how-it-works' },
    { label: 'Roller', href: '#audience' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" id="navbar-logo">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            Solo<span className="text-brand-400">Sync</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/client-setup"
            id="navbar-client-login-btn"
            className="text-purple-300 hover:text-purple-100 text-sm font-medium px-4 py-2 rounded-lg border border-purple-500/30 hover:border-purple-400/60 hover:bg-purple-500/10 transition-all duration-200"
          >
            Müşteri Girişi
          </Link>
          <Link
            to="/login"
            id="navbar-login-btn"
            className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Freelancer Girişi
          </Link>
          <Link
            to="/register"
            id="navbar-register-btn"
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-brand-500/30"
          >
            Ücretsiz Başla
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          id="navbar-mobile-menu-btn"
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menüyü aç/kapat"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-300 hover:text-white text-base font-medium transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <hr className="border-white/10" />
          <Link to="/client-setup" className="text-purple-300 hover:text-purple-100 text-base font-medium" onClick={() => setMenuOpen(false)}>
            Müşteri Girişi (Davetiye ile)
          </Link>
          <Link to="/login" className="text-slate-300 hover:text-white text-base font-medium" onClick={() => setMenuOpen(false)}>
            Freelancer Girişi
          </Link>
          <Link
            to="/register"
            className="bg-brand-500 hover:bg-brand-600 text-white text-base font-semibold px-5 py-3 rounded-lg text-center transition-all"
            onClick={() => setMenuOpen(false)}
          >
            Ücretsiz Başla
          </Link>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
