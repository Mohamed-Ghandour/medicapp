import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, CheckCircle, XCircle, Activity,
  Users, FileText, UserCheck, TrendingUp,
} from 'lucide-react';

const STATUS_META = {
  EN_ATTENTE: { label: 'Pending',   color: 'bg-amber-400', text: 'text-amber-700' },
  CONFIRME:   { label: 'Confirmed', color: 'bg-blue-500',  text: 'text-blue-700'  },
  TERMINE:    { label: 'Completed', color: 'bg-green-500', text: 'text-green-700' },
  ANNULE:     { label: 'Cancelled', color: 'bg-red-400',   text: 'text-red-700'   },
};

const StatCard = ({ label, value, icon: Icon, colorClass, bgClass, borderClass, sub }) => (
  <Card className={`border ${borderClass ?? 'border-slate-200'}`}>
    <CardContent className="pt-5 pb-4 px-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${bgClass ?? 'bg-slate-100'}`}>
          <Icon className={`h-5 w-5 ${colorClass ?? 'text-slate-600'}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

function getLastSixMonths() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString('default', { month: 'short' });
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { label, key, count: 0 };
  });
}

function buildMonthly(appointments) {
  const months = getLastSixMonths();
  appointments.forEach((apt) => {
    if (!apt.date) return;
    const key = String(apt.date).substring(0, 7);
    const m = months.find((mo) => mo.key === key);
    if (m) m.count++;
  });
  return months;
}

export const Statistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const statsReq = api.get('/statistiques/me');
    let apptReq = Promise.resolve({ data: [] });
    if (user.role === 'PATIENT') apptReq = api.get('/patient/rendez-vous');
    else if (user.role === 'MEDECIN') apptReq = api.get('/medecins/rendez-vous');

    Promise.allSettled([statsReq, apptReq]).then(([statsRes, apptRes]) => {
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      } else {
        toast.error('Could not load statistics');
        setStats({});
      }
      if (apptRes.status === 'fulfilled') {
        setAppointments(Array.isArray(apptRes.value.data) ? apptRes.value.data : []);
      }
    }).finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  const s = stats ?? {};
  const total     = Number(s.totalAppointments     ?? 0);
  const pending   = Number(s.pendingAppointments   ?? 0);
  const confirmed = Number(s.confirmedAppointments ?? 0);
  const completed = Number(s.completedAppointments ?? 0);
  const cancelled = Number(s.cancelledAppointments ?? 0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statusSegments = [
    { key: 'EN_ATTENTE', count: pending   },
    { key: 'CONFIRME',   count: confirmed },
    { key: 'TERMINE',    count: completed },
    { key: 'ANNULE',     count: cancelled },
  ].filter((seg) => seg.count > 0);

  const monthly    = buildMonthly(appointments);
  const maxMonthly = Math.max(...monthly.map((m) => m.count), 1);

  const isPatient = user?.role === 'PATIENT';
  const isDoctor  = user?.role === 'MEDECIN';
  const isAdmin   = user?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statistics</h1>
        <p className="text-slate-500 mt-1">Overview of your activity on MedicAPP.</p>
      </div>

      {/* Primary stat cards */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Overview</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Appointments" value={total}     icon={Calendar}     colorClass="text-primary-600" bgClass="bg-primary-50"  borderClass="border-primary-100" />
          <StatCard label="Pending"             value={pending}  icon={Clock}        colorClass="text-amber-600"   bgClass="bg-amber-50"   borderClass="border-amber-100" />
          <StatCard label="Confirmed"           value={confirmed} icon={UserCheck}   colorClass="text-blue-600"    bgClass="bg-blue-50"    borderClass="border-blue-100" />
          <StatCard label="Completed"           value={completed} icon={CheckCircle} colorClass="text-green-600"   bgClass="bg-green-50"   borderClass="border-green-100"
            sub={total > 0 ? `${completionRate}% completion rate` : undefined} />
        </div>

        {/* Secondary row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mt-4">
          <StatCard label="Cancelled" value={cancelled} icon={XCircle} colorClass="text-red-500" bgClass="bg-red-50" borderClass="border-red-100" />

          {isPatient && (
            <StatCard label="Medical Notes" value={Number(s.medicalNotes ?? 0)} icon={FileText} colorClass="text-purple-600" bgClass="bg-purple-50" borderClass="border-purple-100" />
          )}

          {(isPatient || isDoctor) && total > 0 && (
            <StatCard label="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} colorClass="text-emerald-600" bgClass="bg-emerald-50" borderClass="border-emerald-100"
              sub={`${completed} of ${total} appointments`} />
          )}

          {isAdmin && (
            <>
              <StatCard label="Total Users"  value={Number(s.totalUsers    ?? 0)} icon={Users}    colorClass="text-indigo-600" bgClass="bg-indigo-50" borderClass="border-indigo-100" />
              <StatCard label="Doctors"      value={Number(s.totalDoctors  ?? 0)} icon={Activity} colorClass="text-teal-600"   bgClass="bg-teal-50"   borderClass="border-teal-100" />
              <StatCard label="Patients"     value={Number(s.totalPatients ?? 0)} icon={UserCheck} colorClass="text-cyan-600"  bgClass="bg-cyan-50"   borderClass="border-cyan-100" />
            </>
          )}
        </div>
      </section>

      {/* Status breakdown */}
      {total > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Appointment Status Breakdown</h2>
          <Card>
            <CardContent className="pt-5 pb-5 px-5 space-y-4">
              {/* Stacked bar */}
              <div className="flex h-3 rounded-full overflow-hidden gap-px bg-slate-100">
                {statusSegments.map((seg) => (
                  <div
                    key={seg.key}
                    className={`${STATUS_META[seg.key].color} transition-all`}
                    style={{ width: `${(seg.count / total) * 100}%` }}
                    title={`${STATUS_META[seg.key].label}: ${seg.count}`}
                  />
                ))}
              </div>

              {/* Individual rows */}
              <div className="space-y-2.5 pt-1">
                {statusSegments.map((seg) => {
                  const meta = STATUS_META[seg.key];
                  const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
                  return (
                    <div key={seg.key} className="flex items-center gap-3">
                      <span className={`text-xs font-semibold w-20 shrink-0 ${meta.text}`}>{meta.label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className={`${meta.color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 w-16 text-right shrink-0">
                        {seg.count} <span className="text-slate-400">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Monthly trend — patient & doctor only */}
      {(isPatient || isDoctor) && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Appointments — Last 6 Months</h2>
          <Card>
            <CardContent className="pt-6 pb-4 px-5">
              {monthly.every((m) => m.count === 0) ? (
                <p className="text-sm text-slate-400 text-center py-6">No appointments in the last 6 months.</p>
              ) : (
                <div className="flex items-end gap-3 h-40">
                  {monthly.map((m) => {
                    const barH = maxMonthly > 0 ? Math.round((m.count / maxMonthly) * 96) : 0;
                    return (
                      <div key={m.key} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-700 h-4">
                          {m.count > 0 ? m.count : ''}
                        </span>
                        <div className="w-full flex items-end justify-center" style={{ height: '96px' }}>
                          <div
                            className="w-full rounded-t-md bg-primary-500 hover:bg-primary-600 transition-colors"
                            style={{ height: `${Math.max(barH, m.count > 0 ? 4 : 0)}px` }}
                            title={`${m.label}: ${m.count}`}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};
