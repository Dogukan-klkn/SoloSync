import { useState } from 'react';
import { X } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useCreateClientRequest } from '../../hooks/useClientRequests';

export default function ClientRequestModal({ onClose }) {
  const { data: projects = [] } = useProjects();
  const createMutation = useCreateClientRequest();

  const [projectId, setProjectId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!projectId) { setError('Proje seçimi zorunludur.'); return; }
    if (!message.trim()) { setError('Mesaj boş olamaz.'); return; }

    try {
      await createMutation.mutateAsync({ projectId, message });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Freelancer'a İstek Gönder</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">İsteğiniz iletildi!</h3>
            <p className="text-sm text-gray-500 mb-6">Freelancer inceleyecek ve size geri dönecek.</p>
            <button onClick={onClose} className="bg-brand-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-brand-700">
              Kapat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proje</label>
              <select value={projectId} onChange={e => setProjectId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Proje seçin...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesajınız <span className="text-gray-400 font-normal">({message.length}/5000)</span>
              </label>
              <textarea
                value={message} onChange={e => setMessage(e.target.value)}
                maxLength={5000} rows={6}
                placeholder="Freelancer'a iletmek istediğiniz istek veya değişiklikleri detaylı anlatın..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">
                İptal
              </button>
              <button type="submit" disabled={createMutation.isPending}
                className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
                {createMutation.isPending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
