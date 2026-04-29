import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { PatientDossierModal } from '../../components/dossier/PatientDossierModal';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge = (status) => {
  switch (status) {
    case 'EN_ATTENTE': return <Badge variant="warning">Pending</Badge>;
    case 'CONFIRME':   return <Badge variant="success">Confirmed</Badge>;
    case 'ANNULE':     return <Badge variant="danger">Cancelled</Badge>;
    case 'TERMINE':    return <Badge variant="default">Completed</Badge>;
    default:           return <Badge variant="outline">{status}</Badge>;
  }
};

export const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteTarget, setNoteTarget] = useState(null); // { patientId, patientUsername }

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const endpoint = user.role === 'PATIENT' ? '/patient/rendez-vous' : '/medecins/rendez-vous';
      const response = await api.get(endpoint);
      setAppointments(response.data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [user.role]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/rendez-vous/${id}/statut`, { statut: newStatus });
      toast.success('Status updated');
      fetchAppointments();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/rendez-vous/${id}`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 mt-1">Manage your schedule and consultations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No appointments found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>{user.role === 'PATIENT' ? 'Doctor' : 'Patient'}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.date}</TableCell>
                    <TableCell>{apt.heureDebut} – {apt.heureFin}</TableCell>
                    <TableCell>
                      {user.role === 'PATIENT' ? `Dr. ${apt.medecinUsername}` : apt.patientUsername}
                    </TableCell>
                    <TableCell>{statusBadge(apt.statut)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {/* Patient actions */}
                        {user.role === 'PATIENT' && apt.statut !== 'ANNULE' && apt.statut !== 'TERMINE' && (
                          <Button variant="danger" size="sm" onClick={() => handleCancel(apt.id)}>
                            Cancel
                          </Button>
                        )}

                        {/* Doctor actions */}
                        {user.role === 'MEDECIN' && apt.statut === 'EN_ATTENTE' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(apt.id, 'CONFIRME')}>
                              Confirm
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(apt.id, 'ANNULE')}>
                              Reject
                            </Button>
                          </>
                        )}
                        {user.role === 'MEDECIN' && apt.statut === 'CONFIRME' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(apt.id, 'TERMINE')}>
                              Mark Done
                            </Button>
                            <Button size="sm" onClick={() => setNoteTarget({ patientId: apt.patientId, patientUsername: apt.patientUsername })}>
                              <FileText className="h-3.5 w-3.5 mr-1" /> Add Note
                            </Button>
                          </>
                        )}
                        {user.role === 'MEDECIN' && apt.statut === 'TERMINE' && (
                          <Button variant="outline" size="sm" onClick={() => setNoteTarget({ patientId: apt.patientId, patientUsername: apt.patientUsername })}>
                            <FileText className="h-3.5 w-3.5 mr-1" /> Notes
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {noteTarget && (
        <PatientDossierModal
          patientId={noteTarget.patientId}
          patientUsername={noteTarget.patientUsername}
          onClose={() => setNoteTarget(null)}
        />
      )}
    </div>
  );
};
