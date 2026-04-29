import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { PatientDossierModal } from '../../components/dossier/PatientDossierModal';
import { User, Stethoscope, Calendar, Clock, Users, CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const today = () => new Date().toISOString().split('T')[0];

const statusVariant = (s) => {
  switch (s) {
    case 'EN_ATTENTE': return 'warning';
    case 'CONFIRME':   return 'success';
    case 'ANNULE':     return 'danger';
    case 'TERMINE':    return 'default';
    default:           return 'outline';
  }
};

const statusLabel = (s) => {
  switch (s) {
    case 'EN_ATTENTE': return 'Pending';
    case 'CONFIRME':   return 'Confirmed';
    case 'ANNULE':     return 'Cancelled';
    case 'TERMINE':    return 'Completed';
    default:           return s;
  }
};

export const DoctorOverview = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteTarget, setNoteTarget] = useState(null); // { patientId, patientUsername }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, aptsRes] = await Promise.all([
        api.get('/medecins/me'),
        api.get('/medecins/rendez-vous'),
      ]);
      setProfile(profileRes.data);
      setAppointments(aptsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/rendez-vous/${id}/statut`, { statut: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

  const todayStr = today();

  const todayApts = appointments
    .filter((a) => a.date === todayStr && a.statut !== 'ANNULE')
    .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));

  const upcomingApts = appointments
    .filter((a) => a.date > todayStr && a.statut !== 'ANNULE' && a.statut !== 'TERMINE')
    .sort((a, b) => a.date.localeCompare(b.date) || a.heureDebut.localeCompare(b.heureDebut))
    .slice(0, 10);

  // Patients who have at least one confirmed or completed appointment (can receive notes)
  const treatedPatientIds = new Set(
    appointments
      .filter((a) => a.statut === 'CONFIRME' || a.statut === 'TERMINE')
      .map((a) => a.patientId)
  );

  const uniquePatients = [
    ...new Map(appointments.map((a) => [a.patientId, a.patientUsername])).entries(),
  ].map(([id, username]) => ({ id, username }));

  const totalCompleted = appointments.filter((a) => a.statut === 'TERMINE').length;
  const totalPending   = appointments.filter((a) => a.statut === 'EN_ATTENTE').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Overview</h1>
        <p className="text-slate-500 mt-1">Your schedule, patients, and profile at a glance.</p>
      </div>

      {/* Profile + Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                {profile?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Dr. {profile?.username}</p>
                <p className="text-sm text-slate-500">{profile?.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-1"><Stethoscope className="h-4 w-4" /> Specialty</span>
                <span className="font-medium text-slate-800">{profile?.specialite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order No.</span>
                <span className="font-medium text-slate-800">{profile?.numeroOrdre}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayApts.length}</div>
              <p className="text-xs text-slate-500">Scheduled for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPending}</div>
              <p className="text-xs text-slate-500">Awaiting your response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{uniquePatients.length}</div>
              <p className="text-xs text-slate-500">Unique patients seen</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCompleted}</div>
              <p className="text-xs text-slate-500">Finished consultations</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" /> Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayApts.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayApts.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[64px]">
                      <p className="text-sm font-semibold text-slate-900">{apt.heureDebut}</p>
                      <p className="text-xs text-slate-400">{apt.heureFin}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{apt.patientUsername}</p>
                      <Badge variant={statusVariant(apt.statut)}>{statusLabel(apt.statut)}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {apt.statut === 'EN_ATTENTE' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(apt.id, 'CONFIRME')}>Confirm</Button>
                        <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(apt.id, 'ANNULE')}>Reject</Button>
                      </>
                    )}
                    {apt.statut === 'CONFIRME' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(apt.id, 'TERMINE')}>Mark Done</Button>
                        <Button size="sm" onClick={() => setNoteTarget({ patientId: apt.patientId, patientUsername: apt.patientUsername })}>
                          <FileText className="h-3.5 w-3.5 mr-1" /> Add Note
                        </Button>
                      </>
                    )}
                    {apt.statut === 'TERMINE' && (
                      <Button size="sm" variant="outline" onClick={() => setNoteTarget({ patientId: apt.patientId, patientUsername: apt.patientUsername })}>
                        <FileText className="h-3.5 w-3.5 mr-1" /> Notes
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments + Patients side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" /> Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingApts.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No upcoming appointments.</p>
            ) : (
              <div className="space-y-2">
                {upcomingApts.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{apt.patientUsername}</p>
                      <p className="text-xs text-slate-500">{apt.date} · {apt.heureDebut} – {apt.heureFin}</p>
                    </div>
                    <Badge variant={statusVariant(apt.statut)}>{statusLabel(apt.statut)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" /> My Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uniquePatients.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No patients yet.</p>
            ) : (
              <div className="space-y-2">
                {uniquePatients.map((p) => {
                  const lastApt = appointments
                    .filter((a) => a.patientId === p.id)
                    .sort((a, b) => b.date.localeCompare(a.date))[0];
                  const canAddNote = treatedPatientIds.has(p.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
                          {p.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{p.username}</p>
                          {lastApt && <p className="text-xs text-slate-400">Last: {lastApt.date}</p>}
                        </div>
                      </div>
                      {canAddNote && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setNoteTarget({ patientId: p.id, patientUsername: p.username })}
                          title="View / add medical notes"
                        >
                          <FileText className="h-4 w-4 text-primary-600" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
