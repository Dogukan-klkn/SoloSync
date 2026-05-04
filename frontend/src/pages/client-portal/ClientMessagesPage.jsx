import { MessageSquare } from 'lucide-react';

const ClientMessagesPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Mesajlar</h1>
      <p className="text-slate-500 mt-1">Freelancer'ınızla proje bazlı iletişim</p>
    </div>
    <div className="flex flex-col items-center py-20 gap-4">
      <MessageSquare className="w-12 h-12 text-slate-300" />
      <p className="text-slate-500 font-medium">Mesajlaşma yakında geliyor</p>
      <p className="text-slate-400 text-sm text-center max-w-sm">
        Proje detay sayfasından "İsteklerim" sekmesini kullanarak freelancer'ınıza istek ve geri bildirim gönderebilirsiniz.
      </p>
    </div>
  </div>
);

export default ClientMessagesPage;
