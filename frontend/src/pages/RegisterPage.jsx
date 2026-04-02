// src/pages/RegisterPage.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../store/authStore';

const schema = z
  .object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string(),
    role: z.enum(['1', '2'], { required_error: 'Lütfen bir rol seçiniz' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: parseInt(data.role),
      };
      const res = await authService.register(payload);
      const { accessToken, refreshToken, email, fullName, role } = res.data;
      login({ email, fullName, role }, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Kayıt başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Hesap Oluştur</h1>
          <p className="text-slate-300 mt-2 text-sm">Platform'a katılın</p>
        </div>

        {serverError && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Ad</label>
              <input {...register('firstName')} placeholder="Ahmet" className={inputClass} />
              {errors.firstName && (
                <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Soyad</label>
              <input {...register('lastName')} placeholder="Yılmaz" className={inputClass} />
              {errors.lastName && (
                <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">E-posta</label>
            <input {...register('email')} type="email" placeholder="ornek@mail.com" className={inputClass} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Rol Seçimi */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Rol Seçin</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '1', label: '🧑‍💻 Freelancer', desc: 'Proje yönet ve fatura kes' },
                { value: '2', label: '🏢 Müşteri', desc: 'Projeleri takip et' },
              ].map((role) => (
                <label
                  key={role.value}
                  className="flex flex-col cursor-pointer p-3 rounded-lg border border-white/20 hover:border-brand-400 transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10"
                >
                  <input {...register('role')} type="radio" value={role.value} className="sr-only" />
                  <span className="text-white font-semibold text-sm">{role.label}</span>
                  <span className="text-slate-400 text-xs mt-1">{role.desc}</span>
                </label>
              ))}
            </div>
            {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Şifre</label>
            <input {...register('password')} type="password" placeholder="••••••••" className={inputClass} />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Şifre Tekrar</label>
            <input {...register('confirmPassword')} type="password" placeholder="••••••••" className={inputClass} />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-brand-500/30 mt-2"
          >
            {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
