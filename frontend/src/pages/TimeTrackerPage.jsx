import { useState, useEffect, useCallback } from 'react';
import { Timer, Play, Square, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import {
  useTimeEntries,
  useRunningEntry,
  useTimeSummary,
  useStartTimer,
  useStopTimer,
  useCreateManualEntry,
  useDeleteTimeEntry,
} from '../hooks/useTimeEntries';
import { useProjects } from '../hooks/useProjects';
import { useProjectTasks } from '../hooks/useProjectTasks';

// ─── Yardımcı fonksiyonlar ───────────────────────────────────
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '--:--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function todayRange() {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function thisWeekRange() {
  const now   = new Date();
  const day   = now.getDay(); // 0 = Pazar
  const diff  = (day === 0 ? -6 : 1 - day); // Pazartesi'ye çevir
  const from  = new Date(now);
  from.setDate(now.getDate() + diff);
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

// ─── Manuel Kayıt Modalı ─────────────────────────────────────
function ManualEntryModal({ onClose }) {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId]       = useState('');
  const [startTime, setStartTime]                 = useState('');
  const [endTime, setEndTime]                     = useState('');
  const [description, setDescription]             = useState('');
  const [error, setError]                         = useState('');

  const { data: projects = [] } = useProjects();
  const { data: tasks = [] }    = useProjectTasks(selectedProjectId || null);
  const createManual            = useCreateManualEntry();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedTaskId) return setError('Görev seçiniz.');
    if (!startTime || !endTime) return setError('Başlangıç ve bitiş zamanı zorunludur.');
    if (new Date(endTime) <= new Date(startTime)) return setError('Bitiş zamanı başlangıçtan sonra olmalıdır.');

    try {
      await createManual.mutateAsync({
        projectTaskId: selectedTaskId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        description: description || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manuel Kayıt Ekle</h2>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proje</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={selectedProjectId}
              onChange={e => { setSelectedProjectId(e.target.value); setSelectedTaskId(''); }}
            >
              <option value="">Proje seçin...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Görev</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              disabled={!selectedProjectId}
            >
              <option value="">Görev seçin...</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Ne yaptınız? (opsiyonel)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">
              İptal
            </button>
            <button type="submit" disabled={createManual.isPending}
              className="flex-1 bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
              {createManual.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Ana Sayfa ───────────────────────────────────────────────
export default function TimeTrackerPage() {
  const [summaryRange, setSummaryRange] = useState('today');
  const [showManual, setShowManual]     = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId]       = useState('');
  const [description, setDescription]             = useState('');
  const [elapsed, setElapsed]                     = useState(0); // saniye

  const summaryParams = summaryRange === 'today' ? todayRange() : thisWeekRange();

  const { data: running, isLoading: runningLoading, isFetching: runningFetching, isError: runningError } = useRunningEntry();
  const { data: entries = [], isLoading: entriesLoading } = useTimeEntries();
  const { data: summary }  = useTimeSummary(summaryParams);
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] }    = useProjectTasks(selectedProjectId || null);

  const startTimer = useStartTimer();
  const stopTimer  = useStopTimer();
  const deleteEntry = useDeleteTimeEntry();

  // Çalışan kayıt varsa elapsed süresini hesapla
  useEffect(() => {
    if (!running) { setElapsed(0); return; }
    const update = () => {
      setElapsed(Math.floor((Date.now() - new Date(running.startTime).getTime()) / 1000));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [running]);

  const handleStart = useCallback(async () => {
    if (!selectedTaskId) return;
    try {
      await startTimer.mutateAsync({
        projectTaskId: selectedTaskId,
        description: description || undefined,
      });
      setDescription('');
    } catch (err) {
      alert(err.response?.data?.message || 'Kronometre başlatılamadı.');
    }
  }, [selectedTaskId, description, startTimer]);

  const handleStop = useCallback(async () => {
    if (!running) return;
    try {
      await stopTimer.mutateAsync({ id: running.id, data: {} });
    } catch (err) {
      alert(err.response?.data?.message || 'Kronometre durdurulamadı.');
    }
  }, [running, stopTimer]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;
    await deleteEntry.mutateAsync(id);
  }, [deleteEntry]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
            <Timer className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Zaman Takibi</h1>
            <p className="text-sm text-gray-500">Görevleriniz için harcadığınız zamanı takip edin</p>
          </div>
        </div>
        <button onClick={() => setShowManual(true)}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50">
          <Plus className="w-4 h-4" />
          Manuel Ekle
        </button>
      </div>

      {/* Kronometre Kartı */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        {running ? (
          /* Çalışıyor durumu */
          <div className="text-center">
            <div className="text-5xl font-mono font-bold text-brand-600 mb-2">
              {formatDuration(elapsed)}
            </div>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium text-gray-700">{running.taskTitle}</span>
              {running.projectName && <span className="ml-1 text-gray-400">— {running.projectName}</span>}
            </p>
            <p className="text-xs text-gray-400 mb-3">
              {formatDate(running.startTime)} tarihinden beri çalışıyor
            </p>
            <div className="flex items-center justify-center gap-2 mb-4 text-xs">
              {runningError ? (
                <><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  <span className="text-red-500">Bağlantı hatası — süre kaydediliyor</span></>
              ) : runningFetching ? (
                <><span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block" />
                  <span className="text-yellow-600">Senkronize ediliyor...</span></>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  <span className="text-green-600">Sunucu ile senkronize</span></>
              )}
            </div>
            <button onClick={handleStop} disabled={stopTimer.isPending}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 py-3 font-medium disabled:opacity-50">
              <Square className="w-4 h-4" />
              {stopTimer.isPending ? 'Durduruluyor...' : 'Durdur'}
            </button>
          </div>
        ) : (
          /* Başlat formu */
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Yeni oturum başlat</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1"
                value={selectedProjectId}
                onChange={e => { setSelectedProjectId(e.target.value); setSelectedTaskId(''); }}
              >
                <option value="">Proje seçin...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1"
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                disabled={!selectedProjectId}
              >
                <option value="">Görev seçin...</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>

              <input
                type="text"
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1"
                placeholder="Ne yapıyorsunuz? (opsiyonel)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />

              <button
                onClick={handleStart}
                disabled={!selectedTaskId || startTimer.isPending}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-5 py-2 font-medium text-sm disabled:opacity-50 shrink-0"
              >
                <Play className="w-4 h-4" />
                {startTimer.isPending ? 'Başlatılıyor...' : 'Başlat'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Özet seçici */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-gray-700">Toplam Süre</span>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSummaryRange('today')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${summaryRange === 'today' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Bugün
              </button>
              <button
                onClick={() => setSummaryRange('week')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${summaryRange === 'week' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Bu Hafta
              </button>
            </div>
          </div>
          <p className="text-3xl font-mono font-bold text-gray-900">
            {formatDuration(summary?.totalSeconds ?? 0)}
          </p>
        </div>

        {/* Günlük dağılım */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-medium text-gray-700">Günlük Dağılım</span>
          </div>
          {summary?.daily?.length ? (
            <ul className="space-y-1">
              {summary.daily.slice(-5).reverse().map(d => (
                <li key={d.date} className="flex justify-between text-sm">
                  <span className="text-gray-500">{d.date}</span>
                  <span className="font-mono font-medium text-gray-800">{formatDuration(d.totalSeconds)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Bu dönemde kayıt yok.</p>
          )}
        </div>
      </div>

      {/* Kayıt Listesi */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Tüm Kayıtlar</h2>
        </div>

        {entriesLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <Timer className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Henüz zaman kaydı yok.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {entries.map(entry => (
              <li key={entry.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 group">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.taskTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.projectName}
                    {entry.description && <span className="ml-2 text-gray-500">· {entry.description}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(entry.startTime)}
                    {entry.endTime && <span> – {formatDate(entry.endTime)}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {entry.isRunning ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Çalışıyor
                    </span>
                  ) : (
                    <span className="font-mono text-sm font-medium text-gray-700">
                      {formatDuration(entry.duration)}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showManual && <ManualEntryModal onClose={() => setShowManual(false)} />}
    </div>
  );
}
