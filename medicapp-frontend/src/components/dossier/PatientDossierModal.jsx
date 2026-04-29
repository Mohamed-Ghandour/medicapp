import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import { X, FileText, Clock, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const PatientDossierModal = ({ patientId, patientUsername, onClose }) => {
  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    api.get(`/dossier/patient/${patientId}`)
      .then((r) => setDossier(r.data))
      .catch((err) => {
        const msg = err.response?.data?.message ?? 'Could not load patient dossier';
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, [patientId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    const content = note.trim();
    if (!content || !dossier) return;
    setIsSaving(true);
    try {
      const res = await api.post(`/dossier/${dossier.id}/notes`, { contenu: content });
      setDossier((d) => ({ ...d, notes: [res.data, ...d.notes] }));
      setNote('');
      toast.success('Note added successfully');
      textareaRef.current?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to add note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {patientUsername?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{patientUsername}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <FileText className="h-3 w-3" /> Medical Record
                {dossier && (
                  <span className="ml-1">· {dossier.notes?.length ?? 0} note{dossier.notes?.length !== 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <p className="text-xs text-slate-400">You need a confirmed or completed appointment to view this record.</p>
            </div>
          ) : dossier?.notes?.length > 0 ? (
            dossier.notes.map((n) => (
              <div key={n.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <Clock className="h-3 w-3" />
                  {new Date(n.dateCreation).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{n.contenu}</p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <FileText className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No notes yet.</p>
              <p className="text-xs text-slate-400">Add the first medical note below.</p>
            </div>
          )}
        </div>

        {/* Add note form — only show when dossier loaded successfully */}
        {!isLoading && !error && (
          <form onSubmit={handleAddNote} className="border-t border-slate-200 px-5 py-4 space-y-3 shrink-0">
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a medical note…"
              rows={3}
              disabled={isSaving}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 bg-slate-50 placeholder:text-slate-400"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" size="sm" disabled={isSaving || !note.trim()}>
                {isSaving
                  ? <Spinner size="sm" />
                  : <><Plus className="h-4 w-4 mr-1" />Add Note</>}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
