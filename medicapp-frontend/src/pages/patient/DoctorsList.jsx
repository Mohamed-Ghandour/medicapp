import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { UserCircle } from 'lucide-react';

export const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/medecins');
        setDoctors(response.data);
      } catch (error) {
        toast.error('Failed to load doctors');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Our Doctors</h1>
        <p className="text-slate-500 mt-1">Browse our medical professionals and book an appointment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <UserCircle className="h-12 w-12 text-slate-400" />
              <div>
                <CardTitle className="text-lg">Dr. {doctor.username}</CardTitle>
                <CardDescription>{doctor.specialite || 'General Practice'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Ordre Number: {doctor.numeroOrdre || 'N/A'}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/doctors/${doctor.id}/availability`)}
              >
                View Availability
              </Button>
            </CardFooter>
          </Card>
        ))}
        {doctors.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No doctors found.
          </div>
        )}
      </div>
    </div>
  );
};
