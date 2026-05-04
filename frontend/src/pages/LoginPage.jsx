// src/pages/LoginPage.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../store/authStore';

const schema = z.object({
  email:    z.string().email('Geçerli bir e-posta giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login }  = useAuth();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (formData) => {
    setLoading(true);
    setServerError('');
    try {
      const { data } = await authService.login(formData);
      // Backend camelCase dönüyor: accessToken, refreshToken, email, fullName, role
      login(
        { email: data.email, fullName: data.fullName, role: data.role },
        data.accessToken,
        data.refreshToken
      );
      // Client rolü → Client Portal'a yönlendir
      navigate(data.role === 'Client' ? '/client-portal' : '/dashboard');
    } catch (err) {
      // Ağ hatası
      if (err.message?.includes('Sunucuya')) {
        setServerError('Backend\'e bağlanılamıyor. Lütfen serverin çalıştığına emin olun.');
        return;
      }
      // Sunucu hatası (middleware'den gelen camelCase format)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        'Giriş başarısız. Lütfen tekrar deneyin.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Tekrar Hoş Geldiniz</h1>
          <p className="text-slate-300 mt-2 text-sm">Hesabınıza giriş yapın</p>
        </div>

        {serverError && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
            ⚠️ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">E-posta</label>
            <input
              {...register('email')}
              type="email"
              placeholder="ornek@mail.com"
              autoComplete="email"
              className={inputCls}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Şifre</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputCls}
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-brand-500/30"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
