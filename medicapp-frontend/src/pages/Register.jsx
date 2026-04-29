import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import toast from 'react-hot-toast';

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    dateNaissance: '',
    telephone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>Register as a new patient</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input label="Username" name="username" required value={formData.username} onChange={handleChange} />
            <Input label="Email" type="email" name="email" required value={formData.email} onChange={handleChange} />
            <Input label="Password" type="password" name="password" required value={formData.password} onChange={handleChange} />
            <Input label="Date of Birth" type="date" name="dateNaissance" required value={formData.dateNaissance} onChange={handleChange} />
            <Input label="Telephone" type="tel" name="telephone" required value={formData.telephone} onChange={handleChange} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>Register</Button>
            <div className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">Log in</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
