import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, KeyRound, User, Lock, Eye, EyeOff, Home } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api';

const step1Schema = z.object({
  email: z.string().email('Geçerli e-posta giriniz'),
  code:  z.string().length(6, 'Kod 6 haneli olmalıdır'),
});

const step2Schema = z.object({
  firstName: z.string().min(1, 'Ad zorunludur').max(50),
  lastName:  z.string().min(1, 'Soyad zorunludur').max(50),
  password:  z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirm:   z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirm'],
});

const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function ClientSetupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [setupToken, setSetupToken] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form1 = useForm({ resolver: zodResolver(step1Schema) });
  const form2 = useForm({ resolver: zodResolver(step2Schema) });

  const handleVerify = async (data) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/client-invitation/verify-code`, {
        email: data.email,
        code:  data.code,
      });
      setSetupToken(res.data.setupToken);
      setCompanyName(res.data.companyName);
      setEmail(res.data.email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Kod geçersiz veya süresi dolmuş.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (data) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/client-invitation/complete-setup`,
        { firstName: data.firstName, lastName: data.lastName, password: data.password },
        { headers: { Authorization: `Bearer ${setupToken}` } }
      );
      const userData = {
        id:       res.data.id,
        email:    res.data.email,
        fullName: res.data.fullName,
        role:     res.data.role,
      };
      login(userData, res.data.accessToken, res.data.refreshToken);
      navigate('/client-portal');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message || 'Hesap oluşturulurken hata oluştu.';
      if (err.response?.status === 401) {
        setError('Oturum süresi doldu. Lütfen kodu tekrar doğrulayın.');
        setStep(1);
        setSetupToken('');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo + Ana Sayfa */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">S</div>
            <div>
              <span className="font-bold text-slate-800 text-lg">SoloSync</span>
              <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-medium">Müşteri Portalı</span>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors">
            <Home className="w-3.5 h-3.5" /> Ana Sayfa
          </Link>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${step === 1 ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-600'}`}>
            <KeyRound className="w-3 h-3" /> Kod Doğrulama
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${step === 2 ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <User className="w-3 h-3" /> Hesap Kurulumu
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Email + OTP */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Davetinizi Doğrulayın</h1>
              <p className="text-sm text-slate-500">Freelancer'ınızın size gönderdiği e-postadaki 6 haneli kodu girin.</p>
            </div>
            <form onSubmit={form1.handleSubmit(handleVerify)} className="space-y-4">
              <div>
                <label className={labelCls}>E-posta Adresiniz</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...form1.register('email')}
                    type="email"
                    className={`${inputCls} pl-10`}
                    placeholder="siz@sirket.com"
                  />
                </div>
                {form1.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Doğrulama Kodu (6 hane)</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...form1.register('code')}
                    className={`${inputCls} pl-10 tracking-widest text-center text-lg font-bold`}
                    placeholder="••••••"
                    maxLength={6}
                  />
                </div>
                {form1.formState.errors.code && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.code.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition disabled:opacity-50"
              >
                {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
              </button>
            </form>
          </>
        )}

        {/* Step 2: Ad/soyad/şifre */}
        {step === 2 && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Hesabınızı Kurun</h1>
              <p className="text-sm text-slate-500">
                <span className="font-medium text-violet-600">{companyName}</span> adına
                <span className="text-slate-700"> {email}</span> ile giriş yapacaksınız.
              </p>
            </div>
            <form onSubmit={form2.handleSubmit(handleSetup)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Ad</label>
                  <input {...form2.register('firstName')} className={inputCls} placeholder="Ali" />
                  {form2.formState.errors.firstName && <p className="text-red-500 text-xs mt-1">{form2.formState.errors.firstName.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Soyad</label>
                  <input {...form2.register('lastName')} className={inputCls} placeholder="Yılmaz" />
                  {form2.formState.errors.lastName && <p className="text-red-500 text-xs mt-1">{form2.formState.errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <label className={labelCls}>Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...form2.register('password')}
                    type={showPw ? 'text' : 'password'}
                    className={`${inputCls} pl-10 pr-10`}
                    placeholder="En az 6 karakter"
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form2.formState.errors.password && <p className="text-red-500 text-xs mt-1">{form2.formState.errors.password.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Şifre Tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...form2.register('confirm')}
                    type={showPw ? 'text' : 'password'}
                    className={`${inputCls} pl-10`}
                    placeholder="Şifreyi tekrar girin"
                  />
                </div>
                {form2.formState.errors.confirm && <p className="text-red-500 text-xs mt-1">{form2.formState.errors.confirm.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition disabled:opacity-50"
              >
                {loading ? 'Oluşturuluyor...' : 'Hesabı Oluştur ve Giriş Yap'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          Zaten hesabınız var mı?{' '}
          <a href="/login" className="text-violet-600 hover:underline font-medium">Giriş Yap</a>
        </p>
      </div>
    </div>
  );
}
