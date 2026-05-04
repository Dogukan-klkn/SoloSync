import { useState, useRef, useEffect } from 'react';
import { Send, Pencil, Trash2 } from 'lucide-react';
import { useComments, useAddComment, useUpdateComment, useDeleteComment } from '../../hooks/useComments';
import { useAuth } from '../../store/authStore';

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function CommentSection({ taskId, invoiceId }) {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useComments({ taskId, invoiceId });
  const addMutation = useAddComment(taskId, invoiceId);
  const updateMutation = useUpdateComment(taskId, invoiceId);
  const deleteMutation = useDeleteComment(taskId, invoiceId);

  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;
    setText('');
    await addMutation.mutateAsync({ projectTaskId: taskId || null, invoiceId: invoiceId || null, content });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const startEdit = (comment) => { setEditingId(comment.id); setEditText(comment.content); };

  const submitEdit = async () => {
    if (!editText.trim()) return;
    await updateMutation.mutateAsync({ id: editingId, data: { content: editText.trim() } });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Yorumu silmek istediğinize emin misiniz?'))
      await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">Yorumlar ({comments.length})</h3>

      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Henüz yorum yok. İlk yorumu siz yapın.</p>
        ) : (
          comments.map(comment => {
            const isOwn = comment.userId === user?.id;
            return (
              <div key={comment.id} className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className={`group relative max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {editingId === comment.id ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="bg-white text-gray-900 rounded-lg px-2 py-1 text-xs flex-1 resize-none"
                        rows={2}
                      />
                      <button onClick={submitEdit} className="text-xs text-white bg-white/20 rounded px-2 hover:bg-white/30">✓</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-white bg-white/20 rounded px-2 hover:bg-white/30">✗</button>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  )}
                  {isOwn && editingId !== comment.id && (
                    <div className="absolute -left-16 top-1 hidden group-hover:flex gap-1">
                      <button onClick={() => startEdit(comment)} className="p-1 bg-white rounded-lg shadow text-gray-500 hover:text-brand-600">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(comment.id)} className="p-1 bg-white rounded-lg shadow text-gray-500 hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs text-gray-400">{comment.authorFullName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    comment.authorRole === 'Freelancer' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'
                  }`}>{comment.authorRole === 'Freelancer' ? 'Freelancer' : 'Müşteri'}</span>
                  <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end border border-gray-200 rounded-xl p-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Yorumunuzu yazın... (Enter gönder, Shift+Enter yeni satır)"
          rows={2}
          className="flex-1 text-sm text-gray-800 resize-none outline-none bg-transparent placeholder:text-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || addMutation.isPending}
          className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
