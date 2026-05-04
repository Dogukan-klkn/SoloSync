import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useMyProject, useMyMilestones, useMyTasks,
  useMyRequests, useSendRequest
} from '../../hooks/useClientPortal';
import { useAuth } from '../../store/authStore';
import {
  ChevronLeft, Flag, CheckCircle2, Circle, Clock, Send,
  MessageSquare, ListTodo, AlertCircle
} from 'lucide-react';

const statusLabel = {
  Pending:    { text: 'Beklemede',    cls: 'bg-slate-100 text-slate-600' },
  InProgress: { text: 'Devam ediyor', cls: 'bg-blue-100 text-blue-700' },
  InRevision: { text: 'Revizyon',     cls: 'bg-amber-100 text-amber-700' },
  Completed:  { text: 'Tamamlandı',  cls: 'bg-green-100 text-green-700' },
};

const taskStatusIcon = {
  Todo:       <Circle className="w-4 h-4 text-slate-400" />,
  InProgress: <Clock className="w-4 h-4 text-blue-500" />,
  Review:     <AlertCircle className="w-4 h-4 text-amber-500" />,
  Done:       <CheckCircle2 className="w-4 h-4 text-green-500" />,
};

const TABS = ['Kilometre Taşları', 'Görevler', 'İsteklerim'];

const formatDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

const ClientProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [requestMessage, setRequestMessage] = useState('');

  const { data: project, isLoading: projectLoading } = useMyProject(id);
  const { data: milestones = [] } = useMyMilestones(id);
  const { data: tasks = [] } = useMyTasks(id);
  const { data: requests = [] } = useMyRequests(id);

  const sendRequest = useSendRequest(id);

  if (projectLoading) return <div className="text-center py-20 text-slate-400">Yükleniyor...</div>;
  if (!project) return <div className="text-center py-20 text-slate-500">Proje bulunamadı.</div>;

  const st = statusLabel[project.status] ?? statusLabel.Pending;
  const progress = project.milestoneCount > 0
    ? Math.round((project.completedMilestoneCount / project.milestoneCount) * 100)
    : 0;

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestMessage.trim()) return;
    await sendRequest.mutateAsync(requestMessage.trim());
    setRequestMessage('');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link to="/client-portal/projects" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ChevronLeft className="w-4 h-4" /> Projelerim
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-slate-800">{project.name}</h1>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.cls}`}>{st.text}</span>
            </div>
            {project.description && (
              <p className="text-sm text-slate-500 mb-4">{project.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {project.startDate && <span>Başlangıç: {formatDate(project.startDate)}</span>}
              {project.endDate && <span>Bitiş: {formatDate(project.endDate)}</span>}
              <span><Flag className="w-3.5 h-3.5 inline mr-1" />{project.milestoneCount ?? 0} km taşı</span>
            </div>
          </div>
          <div className="w-full sm:w-40">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Genel ilerleme</span>
              <span className="font-semibold text-slate-700">{progress}%</span>
            </div>
            <div className="bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-violet-500 h-2.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === i
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <div className="space-y-3">
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Kilometre taşı henüz eklenmedi</div>
          ) : milestones.map((m, idx) => (
            <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">#{idx + 1}</span>
                    <h3 className="font-medium text-slate-800">{m.title}</h3>
                    {m.progressPercentage === 100 && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  {m.description && <p className="text-xs text-slate-400 mt-1">{m.description}</p>}
                </div>
                {m.dueDate && (
                  <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(m.dueDate)}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-violet-500 h-2 rounded-full transition-all"
                    style={{ width: `${m.progressPercentage ?? 0}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-16 text-right">
                  {m.totalTasks === 0 ? 'Görev yok' : `${m.completedTasks}/${m.totalTasks}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Henüz görev eklenmedi</div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                  {taskStatusIcon[t.status] ?? taskStatusIcon.Todo}
                  <span className="flex-1 text-sm text-slate-700">{t.title}</span>
                  {t.tags?.map(tag => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: tag.color + '22', color: tag.color }}
                    >
                      {tag.label}
                    </span>
                  ))}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    t.status === 'Done' ? 'bg-green-100 text-green-700' :
                    t.status === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                    t.status === 'Review' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {t.status === 'Todo' ? 'Yapılacak' :
                     t.status === 'InProgress' ? 'Devam ediyor' :
                     t.status === 'Review' ? 'İncelemede' : 'Tamamlandı'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <RequestsTab
          requests={requests}
          requestMessage={requestMessage}
          setRequestMessage={setRequestMessage}
          sendRequest={sendRequest}
          handleSendRequest={handleSendRequest}
        />
      )}

    </div>
  );
};

const RequestsTab = ({ requests, requestMessage, setRequestMessage, sendRequest, handleSendRequest }) => (
  <div className="space-y-5">
    <form onSubmit={handleSendRequest} className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="font-medium text-slate-800 mb-3">Yeni İstek Gönder</h3>
      <textarea
        value={requestMessage}
        onChange={e => setRequestMessage(e.target.value)}
        rows={3}
        placeholder="Freelancer'ınıza iletmek istediğiniz istek veya geri bildirimi buraya yazın..."
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
      />
      <div className="flex justify-end mt-3">
        <button
          type="submit"
          disabled={!requestMessage.trim() || sendRequest.isPending}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          {sendRequest.isPending ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </div>
    </form>
    <div className="space-y-3">
      {requests.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          <ListTodo className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          Henüz istek gönderilmedi
        </div>
      ) : requests.map(r => (
        <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm text-slate-700">{r.originalMessage}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              r.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
              r.status === 'Approved' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-600'
            }`}>
              {r.status === 'Pending' ? 'İncelemede' : r.status === 'Approved' ? 'Onaylandı' : 'Reddedildi'}
            </span>
          </div>
          {r.summarizedTodo && r.summarizedTodo !== r.originalMessage && (
            <p className="text-xs text-slate-400 italic border-l-2 border-slate-200 pl-2">{r.summarizedTodo}</p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            {new Date(r.requestedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default ClientProjectDetailPage;
