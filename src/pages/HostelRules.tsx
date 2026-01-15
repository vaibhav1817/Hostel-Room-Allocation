
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageLayout from '@/components/PageLayout';
import {
  ArrowLeft,
  Clock,
  ShieldAlert,
  Sparkles,
  Users,
  Zap,
  Coins,
  Flame,
  VolumeX,
  Home
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';


const HostelRules = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', label: 'Living', icon: Home, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'timings', label: 'Timings', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 'prohibited', label: 'Red Zone', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-100' },
    { id: 'visitors', label: 'Visitors', icon: Users, color: 'text-amber-500', bg: 'bg-amber-100' },
  ];

  const rulesData = {
    general: [
      {
        title: "Room Maintenance",
        icon: Sparkles,
        color: "text-blue-600",
        content: "Keep your space clean. Room inspections happen spontaneously!",
        points: ["No nails or sticky tape on walls", "Switch off lights when leaving", "Clean bathroom weekly"]
      },
      {
        title: "Payment Discipline",
        icon: Coins,
        color: "text-green-600",
        content: "Rent is due by the 10th. Late fees are real!",
        points: ["₹50/day penalty for late fees", "No partial payments", "Online transfer only"]
      },
      {
        title: "Electricity",
        icon: Zap,
        color: "text-yellow-600",
        content: "Conserve energy. Don't overload the sockets.",
        points: ["No heaters/kettles inside rooms", "Ironing allowed only in laundry room", "Report faulty wiring immediately"]
      }
    ],
    timings: [
      {
        title: "Curfew Hours",
        icon: Clock,
        color: "text-purple-600",
        content: "Gates close at 10:00 PM precisely.",
        points: ["Late entry requires Warden's approval", "3 late entries = Letter to parents", "Night attendance: 9:30 PM"]
      },
      {
        title: "Leave Policy",
        icon: Home,
        color: "text-indigo-600",
        content: "Going home? Or a night out?",
        points: ["Apply 24h in advance", "Parent confirmation mandatory", "Weekend pass available"]
      }
    ],
    prohibited: [
      {
        title: "Strict No-No",
        icon: Flame,
        color: "text-red-600",
        content: "Zero tolerance policy for specific items.",
        points: ["No Alcohol/Drugs/Smoking", "No Weapons", "No Pets (Sorry!)"]
      },
      {
        title: "Noise Control",
        icon: VolumeX,
        color: "text-orange-600",
        content: "Respect your neighbors' peace.",
        points: ["Quiet hours: 10 PM - 6 AM", "No loud speakers", "Corridors are silence zones"]
      }
    ],
    visitors: [
      {
        title: "Guest Policy",
        icon: Users,
        color: "text-pink-600",
        content: "Friends are welcome, within limits.",
        points: ["Visiting hours: 5 PM - 8 PM", "Lobby meetings only", "No overnight guests"]
      }
    ]
  };

  const activeRules = rulesData[activeCategory as keyof typeof rulesData];

  return (
    <Layout>
      <PageLayout
        title="House Rules"
        description="The code of living for a legendary hostel life."
        action={
          <Button variant="outline" onClick={() => navigate('/')} className="active:scale-95 transition-transform">
            <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
          </Button>
        }
      >
        <div className="space-y-8">
          {/* Category Selectors */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                            flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all border
                            ${activeCategory === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                        `}
              >
                <cat.icon className={`h-4 w-4 ${activeCategory === cat.id ? 'text-white' : cat.color}`} />
                {cat.label}
              </motion.button>
            ))}
          </div>

          {/* Content Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activeRules.map((rule, index) => (
                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden group">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${rule.color.replace('text-', 'from-').replace('600', '400')} to-slate-300`} />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2.5 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors ${rule.color}`}>
                        <rule.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                        Rule #{index + 1}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-slate-800">{rule.title}</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">{rule.content}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {rule.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                          <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

              {/* Pro Tip Card (Always appears at the end) */}
              <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 flex flex-col justify-center items-center text-center p-6 space-y-4 md:col-span-2 lg:col-span-3">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center animate-bounce">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900 text-lg">Pro Tip</h3>
                  <p className="text-indigo-700/80 text-sm mt-2 max-w-lg mx-auto">
                    Reading rules is boring, but paying fines is worse. Keeping a clean record helps you get preferred room upgrades next semester!
                  </p>
                </div>
              </Card>

            </motion.div>
          </AnimatePresence>

          {/* Bottom Footer Quote */}
          <div className="text-center pt-8 pb-4">
            <p className="text-slate-400 italic text-sm">
              "Discipline is the bridge between goals and accomplishment."
            </p>
          </div>
        </div>
      </PageLayout>
    </Layout>
  );
};

export default HostelRules;
