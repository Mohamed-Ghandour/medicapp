import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DoctorAvailability = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [availabilities, setAvailabilities] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, availRes] = await Promise.all([
          api.get(`/medecins/${id}`),
          api.get(`/disponibilites/medecin/${id}`)
        ]);
        setDoctor(docRes.data);
        setAvailabilities(availRes.data);
      } catch (error) {
        toast.error('Failed to load availability');
        navigate('/doctors');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and a time slot');
      return;
    }

    // Verify day matches
    const dateObj = new Date(selectedDate);
    // JS getDay() is 0=Sun, 1=Mon. The backend 'jour' is 1=Mon .. 7=Sun
    let dayOfWeek = dateObj.getDay();
    let isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    if (isoDay !== selectedSlot.jour) {
      toast.error(`Please select a ${DAYS[dayOfWeek]} to match the slot`);
      return;
    }

    setIsBooking(true);
    try {
      await api.post('/rendez-vous', {
        medecinId: parseInt(id),
        date: selectedDate,
        heureDebut: selectedSlot.heureDebut,
        heureFin: selectedSlot.heureFin
      });
      toast.success('Appointment booked successfully!');
      navigate('/appointments');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Book Appointment</h1>
        <p className="text-slate-500 mt-1">Dr. {doctor?.username} - {doctor?.specialite}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
              <CardDescription>Select a recurring slot offered by the doctor</CardDescription>
            </CardHeader>
            <CardContent>
              {availabilities.length === 0 ? (
                <p className="text-slate-500">No availabilities found for this doctor.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availabilities.map((slot) => {
                    // Convert JS day to ISO (1-7) for display
                    let dayName = slot.jour === 7 ? 'Sunday' : DAYS[slot.jour];
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <div 
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                            : 'border-slate-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="font-semibold">{dayName}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          {slot.heureDebut} - {slot.heureFin}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Confirm Booking</CardTitle>
              <CardDescription>Choose a specific date for your appointment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                type="date" 
                label="Appointment Date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              
              {selectedSlot && (
                <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm">
                  <p><strong>Time:</strong> {selectedSlot.heureDebut} to {selectedSlot.heureFin}</p>
                  <p className="text-slate-500 mt-1">Make sure your date falls on a {selectedSlot.jour === 7 ? 'Sunday' : DAYS[selectedSlot.jour]}.</p>
                </div>
              )}
              
              <Button 
                className="w-full" 
                onClick={handleBook} 
                disabled={!selectedDate || !selectedSlot}
                isLoading={isBooking}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
