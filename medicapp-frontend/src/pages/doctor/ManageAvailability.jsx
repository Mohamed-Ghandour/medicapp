import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export const ManageAvailability = () => {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    jour: 1,
    heureDebut: '09:00',
    heureFin: '17:00'
  });

  const fetchAvailabilities = async () => {
    setIsLoading(true);
    try {
      // Need the medecin ID. The 'me' endpoint or decoding from token.
      // Assuming we can get it from /medecins/me
      const meRes = await api.get('/medecins/me');
      const medecinId = meRes.data.id;
      
      const response = await api.get(`/disponibilites/medecin/${medecinId}`);
      setAvailabilities(response.data);
    } catch (error) {
      toast.error('Failed to load availabilities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Post to /disponibilites requires jour, heureDebut, heureFin
      await api.post('/disponibilites', {
        jour: parseInt(formData.jour),
        heureDebut: formData.heureDebut,
        heureFin: formData.heureFin
      });
      toast.success('Availability added');
      fetchAvailabilities();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add availability');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/disponibilites/${id}`);
      toast.success('Availability removed');
      fetchAvailabilities();
    } catch (error) {
      toast.error('Failed to remove availability');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Availability</h1>
        <p className="text-slate-500 mt-1">Define your weekly recurring schedule.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Slot</CardTitle>
              <CardDescription>Create a new recurring time slot</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Day of Week</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.jour}
                    onChange={(e) => setFormData({...formData, jour: e.target.value})}
                  >
                    {DAYS.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <Input 
                  label="Start Time" 
                  type="time" 
                  required 
                  value={formData.heureDebut}
                  onChange={(e) => setFormData({...formData, heureDebut: e.target.value})}
                />
                <Input 
                  label="End Time" 
                  type="time" 
                  required 
                  value={formData.heureFin}
                  onChange={(e) => setFormData({...formData, heureFin: e.target.value})}
                />
              </CardContent>
              <div className="p-6 pt-0">
                <Button type="submit" className="w-full" isLoading={isSubmitting}>Add Availability</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {availabilities.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No availabilities set.</div>
              ) : (
                <div className="space-y-4">
                  {availabilities.map(slot => {
                    const dayLabel = DAYS.find(d => d.value === slot.jour)?.label;
                    return (
                      <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{dayLabel}</p>
                          <p className="text-sm text-slate-500">{slot.heureDebut} - {slot.heureFin}</p>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(slot.id)}>Remove</Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
