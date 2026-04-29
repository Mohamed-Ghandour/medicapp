import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { FileText, Clock, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyDossier = () => {
  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/dossier/me')
      .then((r) => setDossier(r.data))
      .catch(() => toast.error('Failed to load your medical record'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

  if (!dossier) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2">
        <FileText className="h-10 w-10 text-slate-300" />
        <p>Medical record not found.</p>
      </div>
    );
  }

  const notes = dossier.notes ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Medical Record</h1>
          <p className="text-slate-500 mt-1">Your personal health history kept by your doctors.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          <Clock className="h-3.5 w-3.5" />
          Created {new Date(dossier.dateCreation).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </div>
      </div>

      {/* Summary pill */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-2 rounded-full border border-primary-100">
          <StickyNote className="h-4 w-4" />
          {notes.length} medical note{notes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Medical Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={note.id} className="relative pl-4 border-l-2 border-primary-200">
                  <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-primary-400" />
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                      <Clock className="h-3 w-3" />
                      {new Date(note.dateCreation).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                      <span className="ml-auto text-slate-300">#{notes.length - index}</span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-sm">
                      {note.contenu}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <StickyNote className="h-10 w-10 text-slate-200" />
              <p className="text-slate-500 font-medium">No medical notes yet</p>
              <p className="text-sm text-slate-400">
                Notes will appear here after your doctor adds them during a consultation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
