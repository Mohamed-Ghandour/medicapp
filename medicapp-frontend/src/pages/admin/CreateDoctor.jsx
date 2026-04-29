import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateDoctor = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    specialite: '',
    numeroOrdre: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/admin/medecins', formData);
      toast.success('Doctor account created successfully!');
      navigate('/admin/users');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create doctor account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Create Doctor Account</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-primary-600" />
            New Doctor Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={80}
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Specialty (e.g. Cardiology)"
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
                required
                maxLength={120}
              />
              <Input
                label="Order Number"
                name="numeroOrdre"
                value={formData.numeroOrdre}
                onChange={handleChange}
                required
                maxLength={80}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="button" variant="outline" className="mr-3" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Create Doctor Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
