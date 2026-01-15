import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, User, Mail, Loader2, ShieldCheck, GraduationCap, CreditCard, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import gmLogo from '@/assets/gm-university-logo-new.jpg';
import loginBg from '@/assets/login-bg-v2.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [usn, setUSN] = useState('');
  const [adminId, setAdminId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, role, usn, adminId);
      toast.success("Account created successfully!");
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden bg-zinc-900">
      {/* Full Screen Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Brand Header */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <img src={gmLogo} alt="Logo" className="h-10 w-auto rounded-lg object-contain shadow-md bg-white p-1" />
        <span className="font-bold text-xl tracking-tight text-white drop-shadow-md">MG University</span>
      </div>

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[500px] px-4 my-8"
      >
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/40">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
            <p className="text-slate-500 text-sm">Join the campus community today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-600 font-medium">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10 h-10 border-slate-200" placeholder="John Doe" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600 font-medium">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-10 border-slate-200" placeholder="student@gmu.edu" />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">I am a...</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as any)} className="grid grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="student" id="student" className="peer sr-only" />
                  <Label htmlFor="student" className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:text-indigo-600 cursor-pointer transition-all">
                    <GraduationCap className="mb-2 h-6 w-6" />
                    Student
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
                  <Label htmlFor="admin" className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:text-indigo-600 cursor-pointer transition-all">
                    <ShieldCheck className="mb-2 h-6 w-6" />
                    Admin
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional Inputs based on Role */}
            {role === 'student' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="usn" className="text-slate-600 font-medium">USN (University Seat Number)</Label>
                <div className="relative group">
                  <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input id="usn" value={usn} onChange={(e) => setUSN(e.target.value.toUpperCase())} required className="pl-10 h-10 border-slate-200" placeholder="1GM..." />
                </div>
              </div>
            )}

            {role === 'admin' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="adminId" className="text-slate-600 font-medium">Admin ID</Label>
                <div className="relative group">
                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input id="adminId" value={adminId} onChange={(e) => setAdminId(e.target.value.toUpperCase())} required className="pl-10 h-10 border-slate-200" placeholder="ADM..." />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-8 h-10" placeholder="••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"><Eye size={16} /></button>
                </div>
              </div>
              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-8 h-10" placeholder="••••••" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"><Eye size={16} /></button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg mt-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm mt-6">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/60 font-medium drop-shadow-md">
          &copy; {new Date().getFullYear()} MG University. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
