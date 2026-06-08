import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2, Save } from 'lucide-react';
import { useAuth } from '../store/authStore';
import { useUserProfile, useUpdateUserProfile, useUpdateClientProfile } from '../hooks/useProfile';
import { useMyProfile } from '../hooks/useClientPortal';

const baseSchema = z.object({
  firstName: z.string().min(1, 'Ad zorunludur').max(50),
  lastName: z.string().min(1, 'Soyad zorunludur').max(50),
  email: z.string().email('Geçerli bir e-posta giriniz').max(100),
  profilePictureUrl: z.string().url('Geçerli bir URL giriniz').max(500).optional().or(z.literal('')),
});

const clientSchema = baseSchema.extend({
  companyName: z.string().min(1, 'Şirket adı zorunludur').max(100),
  contactName: z.string().min(1, 'İletişim kişisi zorunludur').max(50),
  phone: z.string().max(20).optional().or(z.literal('')),
  billingAddress: z.string().max(250).optional().or(z.literal('')),
});

const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const isClient = user?.role === 'Client';
  const { data: userProfile, isLoading: userLoading, isError: userError, error: userFetchError } = useUserProfile();
  const { data: clientProfile, isLoading: clientLoading, isError: clientError } = useMyProfile({ enabled: isClient });
  const updateUserProfile = useUpdateUserProfile();
  const updateClientProfile = useUpdateClientProfile();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const schema = isClient ? clientSchema : baseSchema;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const profile = userProfile ?? (user ? {
      firstName: user.fullName?.split(/\s+/)[0] ?? '',
      lastName: user.fullName?.split(/\s+/).slice(1).join(' ') ?? '',
      email: user.email ?? '',
      profilePictureUrl: user.profilePictureUrl ?? '',
    } : null);
    if (!profile) return;

    reset({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      profilePictureUrl: profile.profilePictureUrl ?? '',
      ...(isClient ? {
        companyName: clientProfile?.companyName ?? '',
        contactName: clientProfile?.contactName ?? '',
        phone: clientProfile?.phone ?? '',
        billingAddress: clientProfile?.billingAddress ?? '',
      } : {}),
    });
  }, [userProfile, clientProfile, isClient, reset, user]);

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMsg('');
    try {
      const userPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        profilePictureUrl: data.profilePictureUrl || null,
      };

      const updated = await updateUserProfile.mutateAsync(userPayload);

      if (isClient) {
        await updateClientProfile.mutateAsync({
          companyName: data.companyName,
          contactName: data.contactName,
          phone: data.phone || null,
          billingAddress: data.billingAddress || null,
        });
      }

      updateUser({
        ...user,
        id: updated.id,
        email: updated.email,
        fullName: `${updated.firstName} ${updated.lastName}`,
        profilePictureUrl: updated.profilePictureUrl,
      });

      setSuccessMsg('Profiliniz başarıyla güncellendi.');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        'Profil güncellenemedi. Lütfen tekrar deneyin.';
      setServerError(msg);
    }
  };

  const loading = userLoading || (isClient && clientLoading);
  const loadFailed = userError && !user;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Profil Ayarları</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Hesap bilgilerinizi buradan güncelleyebilirsiniz.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {loadFailed && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
            Profil bilgileri yüklenemedi. Backend&apos;i yeniden başlatıp tekrar deneyin.
            {userFetchError?.response?.status === 404 && ' (API endpoint bulunamadı)'}
          </div>
        )}
        {isClient && clientError && !clientProfile && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
            Şirket bilgileri yüklenemedi. Freelancer hesabınızla ilişkilendirilmiş müşteri kaydı bulunamıyor olabilir.
          </div>
        )}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {serverError}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {successMsg}
          </div>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-900">Hesap Bilgileri</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Ad</label>
              <input {...register('firstName')} className={inputCls} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Soyad</label>
              <input {...register('lastName')} className={inputCls} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>E-posta</label>
            <input {...register('email')} type="email" className={inputCls} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Profil Fotoğrafı URL</label>
            <input {...register('profilePictureUrl')} type="url" placeholder="https://..." className={inputCls} />
            {errors.profilePictureUrl && <p className="text-red-500 text-xs mt-1">{errors.profilePictureUrl.message}</p>}
            <p className="text-xs text-slate-400 mt-1">İsteğe bağlı — harici bir görsel bağlantısı girin.</p>
          </div>
        </section>

        {isClient && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-violet-600" />
              <h2 className="font-semibold text-slate-900">Şirket Bilgileri</h2>
            </div>

            <div>
              <label className={labelCls}>Şirket Adı</label>
              <input {...register('companyName')} className={inputCls} />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>İletişim Kişisi</label>
              <input {...register('contactName')} className={inputCls} />
              {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Telefon</label>
              <input {...register('phone')} className={inputCls} placeholder="+90 5xx xxx xx xx" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Fatura Adresi</label>
              <textarea {...register('billingAddress')} rows={3} className={inputCls} />
              {errors.billingAddress && <p className="text-red-500 text-xs mt-1">{errors.billingAddress.message}</p>}
            </div>
          </section>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
