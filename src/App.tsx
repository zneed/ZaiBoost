/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Map, 
  Calendar, 
  Calculator, 
  User, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Star,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Settings,
  AlertCircle
} from 'lucide-react';

// --- Auth Helper ---
const authFetch = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  });
};

// --- Types ---

interface User {
  id: number;
  username: string;
  role: 'customer' | 'admin';
}

interface Service {
  id: number;
  game: 'genshin' | 'wuwa';
  category: 'daily' | 'explore' | 'endgame';
  name: string;
  description: string;
  price_base: number;
  price_per_unit: number;
  unit_name: string;
}

interface Order {
  id: number;
  user_id: number;
  service_id: number;
  service_name: string;
  service_category: string;
  game: string;
  uid: string;
  server: string;
  total_price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  start_value: number;
  current_value: number;
  target_value: number;
  notes: string;
  created_at: string;
  username?: string;
}

// --- Components ---

const Navbar = ({ user, onLogout, onNavigate }: { user: User | null, onLogout: () => void, onNavigate: (page: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Gamepad2 size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">ZaiBoost</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => onNavigate('home')} className="text-zinc-600 hover:text-indigo-600 font-medium transition-colors">Home</button>
            <button onClick={() => onNavigate('services')} className="text-zinc-600 hover:text-indigo-600 font-medium transition-colors">Layanan</button>
            <button onClick={() => onNavigate('calculator')} className="text-zinc-600 hover:text-indigo-600 font-medium transition-colors">Kalkulator</button>
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onNavigate(user.role === 'admin' ? 'admin' : 'dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
                >
                  <User size={18} />
                  {user.username}
                </button>
                <button onClick={onLogout} className="text-zinc-400 hover:text-red-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
              >
                Login
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <button onClick={() => { onNavigate('home'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 text-zinc-600 font-medium">Home</button>
              <button onClick={() => { onNavigate('services'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 text-zinc-600 font-medium">Layanan</button>
              <button onClick={() => { onNavigate('calculator'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 text-zinc-600 font-medium">Kalkulator</button>
              {user ? (
                <>
                  <button onClick={() => { onNavigate(user.role === 'admin' ? 'admin' : 'dashboard'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 text-indigo-600 font-medium">Dashboard</button>
                  <button onClick={() => { onLogout(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 text-red-500 font-medium">Logout</button>
                </>
              ) : (
                <button onClick={() => { onNavigate('auth'); setIsOpen(false); }} className="block w-full text-center py-3 bg-indigo-600 text-white rounded-lg font-semibold">Login</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <section className="pt-32 pb-20 px-4">
    <div className="max-w-7xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
          #1 Multi-Game Boosting Service
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 tracking-tight mb-6 leading-tight">
          Joki Genshin & WuWa <br /> <span className="text-indigo-600">Tanpa Lelah.</span>
        </h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Selesaikan Daily, Exploration, hingga Endgame Content (Spiral Abyss & Tower of Adversity) dengan aman dan terpercaya.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => onNavigate('services')}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
          >
            Mulai Order <ChevronRight size={20} />
          </button>
          <button 
            onClick={() => onNavigate('calculator')}
            className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-xl font-bold text-lg hover:bg-zinc-50 transition-all"
          >
            Cek Harga
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-20 relative"
      >
        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full -z-10" />
        <img 
          src="https://picsum.photos/seed/genshin/1200/600?blur=2" 
          alt="Genshin Impact Background" 
          className="rounded-3xl shadow-2xl border border-white/20 w-full object-cover h-[400px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
          {[
            { label: 'Order Selesai', value: '5,000+', icon: CheckCircle2 },
            { label: 'Pelanggan Puas', value: '2,500+', icon: Star },
            { label: 'Region Support', value: '7+', icon: Map },
            { label: 'Keamanan Akun', value: '100%', icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-lg border border-zinc-100 flex flex-col items-center text-center">
              <stat.icon className="text-indigo-600 mb-2" size={24} />
              <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
              <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

const ServiceCard = ({ service, onSelect }: { service: Service, onSelect: (s: Service) => void, key?: React.Key }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden"
  >
    <div className="absolute top-4 right-4">
      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${service.game === 'genshin' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-700'}`}>
        {service.game}
      </span>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
      service.category === 'daily' ? 'bg-orange-100 text-orange-600' : 
      service.category === 'explore' ? 'bg-emerald-100 text-emerald-600' : 
      'bg-purple-100 text-purple-600'
    }`}>
      {service.category === 'daily' ? <Calendar size={24} /> : 
       service.category === 'explore' ? <Map size={24} /> : 
       <Gamepad2 size={24} />}
    </div>
    <h3 className="text-xl font-bold text-zinc-900 mb-2">{service.name}</h3>
    <p className="text-zinc-500 text-sm mb-6 flex-grow">{service.description}</p>
    <div className="flex items-end justify-between mt-auto">
      <div>
        <span className="text-xs text-zinc-400 font-bold uppercase block">
          {service.category === 'endgame' ? 'Biaya Tetap' : 'Mulai Dari'}
        </span>
        <span className="text-2xl font-bold text-indigo-600">
          Rp {(service.price_base || service.price_per_unit).toLocaleString()}
        </span>
        {service.price_per_unit > 0 && (
          <span className="text-zinc-400 text-sm font-medium">/{service.unit_name}</span>
        )}
      </div>
      <button 
        onClick={() => onSelect(service)}
        className="px-4 py-2 bg-zinc-900 text-white rounded-lg font-bold text-sm hover:bg-zinc-800 transition-colors"
      >
        Pilih
      </button>
    </div>
  </motion.div>
);

const CalculatorSection = ({ services, onSelect }: { services: Service[], onSelect: (s: Service) => void }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [start, setStart] = useState(0);
  const [target, setTarget] = useState(100);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const totalPrice = useMemo(() => {
    if (!selectedService) return 0;
    if (selectedService.category === 'endgame') return selectedService.price_base;
    const diff = Math.max(0, target - start);
    return selectedService.price_base + (diff * selectedService.price_per_unit);
  }, [selectedService, start, target]);

  useEffect(() => {
    if (selectedService) {
      if (selectedService.category === 'daily') {
        setStart(0);
        setTarget(7);
      } else if (selectedService.category === 'explore') {
        setStart(0);
        setTarget(100);
      }
    }
  }, [selectedServiceId]);

  return (
    <section className="py-20 px-4 bg-zinc-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Kalkulator Estimasi Harga</h2>
          <p className="text-zinc-500">Hitung biaya joki kamu secara transparan sebelum melakukan pemesanan.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-zinc-200">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">Pilih Layanan</label>
                <select 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  value={selectedServiceId || ''}
                >
                  <option value="" disabled>Pilih Layanan...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>[{s.game.toUpperCase()}] {s.name}</option>
                  ))}
                </select>
              </div>

              {selectedService && selectedService.category !== 'endgame' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">
                        {selectedService.category === 'daily' ? 'Mulai Hari' : 'Progress Awal (%)'}
                      </label>
                      <input 
                        type="number" 
                        value={start}
                        onChange={(e) => setStart(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">
                        {selectedService.category === 'daily' ? 'Total Hari' : 'Target (%)'}
                      </label>
                      <input 
                        type="number" 
                        value={target}
                        onChange={(e) => setTarget(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  {selectedService.category === 'explore' && (
                    <div className="pt-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={target}
                        onChange={(e) => setTarget(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-xs font-bold text-zinc-400 mt-2">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedService && selectedService.category === 'endgame' && (
                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-indigo-900 font-medium text-sm">
                    Layanan ini adalah paket pengerjaan penuh (Full Clear). Harga yang tertera adalah biaya tetap untuk penyelesaian konten.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center">
              <Calculator size={48} className="mb-4 opacity-50" />
              <span className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Estimasi Total</span>
              <div className="text-4xl font-black mb-2">Rp {totalPrice.toLocaleString()}</div>
              {selectedService && selectedService.category !== 'endgame' && (
                <div className="text-xs font-bold opacity-60 mb-6">
                  Rp {selectedService.price_per_unit.toLocaleString()} x {Math.max(0, target - start)} {selectedService.unit_name}
                </div>
              )}
              <div className="mb-6"></div>
              {selectedService && (
                <button 
                  onClick={() => onSelect(selectedService)}
                  className="w-full py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg"
                >
                  Order Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const OrderModal = ({ service, user, onClose, onSuccess }: { service: Service, user: User, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    uid: '',
    server: 'Asia',
    game_username: '',
    game_password: '',
    start_value: 0,
    target_value: service.category === 'daily' ? 7 : 100,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const totalPrice = useMemo(() => {
    if (service.category === 'endgame') return service.price_base;
    const diff = Math.max(0, formData.target_value - formData.start_value);
    return service.price_base + (diff * service.price_per_unit);
  }, [service, formData.start_value, formData.target_value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          user_id: user.id,
          service_id: service.id,
          game: service.game,
          total_price: totalPrice
        })
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">{step === 1 ? 'Form Pemesanan' : 'Konfirmasi Pesanan'}</h2>
            <p className="text-zinc-500 text-sm">{service.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {step === 1 ? (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">UID {service.game === 'genshin' ? 'Genshin' : 'WuWa'}</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Contoh: 812345678"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.uid}
                    onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">Server</label>
                  <select 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.server}
                    onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                  >
                    <option>Asia</option>
                    <option>America</option>
                    <option>Europe</option>
                    <option>TW/HK/MO</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">Username / Email Login</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.game_username}
                    onChange={(e) => setFormData({ ...formData, game_username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">Password Login</label>
                  <input 
                    required
                    type="password" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.game_password}
                    onChange={(e) => setFormData({ ...formData, game_password: e.target.value })}
                  />
                </div>
              </div>

              {service.category !== 'endgame' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">
                      {service.category === 'daily' ? 'Mulai Hari' : 'Progress Awal (%)'}
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.start_value}
                      onChange={(e) => setFormData({ ...formData, start_value: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">
                      {service.category === 'daily' ? 'Total Hari' : 'Target (%)'}
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.target_value}
                      onChange={(e) => setFormData({ ...formData, target_value: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">Catatan Tambahan</label>
                <textarea 
                  rows={3}
                  placeholder="Misal: Jangan pakai resin untuk artifact, fokus boss material..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold text-xs uppercase">Layanan</span>
                  <span className="text-zinc-900 font-bold">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold text-xs uppercase">UID</span>
                  <span className="text-zinc-900 font-bold">{formData.uid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold text-xs uppercase">Server</span>
                  <span className="text-zinc-900 font-bold">{formData.server}</span>
                </div>
                {service.category !== 'endgame' && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold text-xs uppercase">Progress</span>
                    <span className="text-zinc-900 font-bold">{formData.start_value} → {formData.target_value} {service.unit_name}</span>
                  </div>
                )}
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm">
                Pastikan data login yang kamu masukkan sudah benar untuk mempercepat proses pengerjaan.
              </div>
            </div>
          )}

          <div className="p-6 bg-zinc-900 rounded-2xl text-white flex justify-between items-center">
            <div>
              <span className="text-xs font-bold uppercase opacity-60 block">Total Pembayaran</span>
              <span className="text-2xl font-black">Rp {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex gap-3">
              {step === 2 && (
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-zinc-700 rounded-xl font-bold hover:bg-zinc-600 transition-all"
                >
                  Edit
                </button>
              )}
              <button 
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Memproses...' : step === 1 ? 'Lanjut' : 'Konfirmasi Order'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/orders/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, [user.id]);

  if (loading) return <div className="pt-32 px-4 text-center">Loading...</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard Saya</h1>
          <p className="text-zinc-500">Pantau progress pengerjaan joki kamu di sini.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-zinc-200 shadow-sm">
            <span className="text-xs font-bold text-zinc-400 uppercase block">Order Aktif</span>
            <span className="text-xl font-bold text-zinc-900">{orders.filter(o => o.status === 'processing').length}</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-zinc-200 shadow-sm">
            <span className="text-xs font-bold text-zinc-400 uppercase block">Total Order</span>
            <span className="text-xl font-bold text-zinc-900">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-zinc-300 text-center">
            <ClipboardList size={48} className="mx-auto text-zinc-300 mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Belum ada order</h3>
            <p className="text-zinc-500">Kamu belum melakukan pemesanan layanan apapun.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      order.status === 'processing' ? 'bg-indigo-100 text-indigo-600' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-zinc-400 text-sm font-medium">Order #{order.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">{order.service_name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase block">UID</span>
                      <span className="font-bold text-zinc-900">{order.uid}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase block">Server</span>
                      <span className="font-bold text-zinc-900">{order.server}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase block">Total Biaya</span>
                      <span className="font-bold text-zinc-900">Rp {order.total_price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase block">Tanggal</span>
                      <span className="font-bold text-zinc-900">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="md:w-80 flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-zinc-900">Progress</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {Math.round(((order.current_value - order.start_value) / (order.target_value - order.start_value)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, ((order.current_value - order.start_value) / (order.target_value - order.start_value)) * 100))}%` }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-zinc-400 mt-2">
                    <span>{order.current_value} {order.service_category === 'daily' ? 'Hari' : '%'}</span>
                    <span>Target: {order.target_value} {order.service_category === 'daily' ? 'Hari' : '%'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ revenue: 0, activeOrders: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    Promise.all([
      authFetch('/api/orders/admin').then(res => res.json()),
      authFetch('/api/admin/stats').then(res => res.json())
    ]).then(([ordersData, statsData]) => {
      setOrders(ordersData);
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  const updateOrder = async (id: number, status?: string, current_value?: number) => {
    await authFetch(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, current_value })
    });
    // Refresh
    const res = await authFetch('/api/orders/admin');
    const data = await res.json();
    setOrders(data);
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder(data.find((o: Order) => o.id === id));
    }
  };

  if (loading) return <div className="pt-32 px-4 text-center">Loading Admin...</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900">Admin Control Panel</h1>
        <p className="text-zinc-500">Kelola pesanan dan pantau performa bisnis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <TrendingUp className="text-emerald-500 mb-4" size={32} />
          <span className="text-sm font-bold text-zinc-400 uppercase block">Total Pendapatan</span>
          <span className="text-3xl font-black text-zinc-900">Rp {stats.revenue.toLocaleString()}</span>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <Clock className="text-indigo-500 mb-4" size={32} />
          <span className="text-sm font-bold text-zinc-400 uppercase block">Order Aktif</span>
          <span className="text-3xl font-black text-zinc-900">{stats.activeOrders}</span>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <User className="text-orange-500 mb-4" size={32} />
          <span className="text-sm font-bold text-zinc-400 uppercase block">Total Customer</span>
          <span className="text-3xl font-black text-zinc-900">{stats.totalUsers}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="font-bold text-zinc-900">Daftar Pesanan Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">ID / User</th>
                <th className="px-6 py-4">Layanan</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">#{order.id}</div>
                    <div className="text-xs text-zinc-400">{order.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{order.service_name}</div>
                    <div className="text-xs text-zinc-400">{order.uid} ({order.server})</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        className="w-16 px-2 py-1 bg-zinc-100 rounded border border-zinc-200 text-sm font-bold"
                        defaultValue={order.current_value}
                        onBlur={(e) => updateOrder(order.id, undefined, Number(e.target.value))}
                      />
                      <span className="text-zinc-400">/ {order.target_value}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="px-3 py-1 bg-zinc-100 rounded-lg text-xs font-bold uppercase outline-none"
                      value={order.status}
                      onChange={(e) => updateOrder(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Detail Pesanan #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)}><X /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-xl">
                  <span className="text-xs font-bold text-zinc-400 uppercase block">Username Login</span>
                  <span className="font-bold text-zinc-900 select-all">{selectedOrder.game_username || 'N/A'}</span>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl">
                  <span className="text-xs font-bold text-zinc-400 uppercase block">Password</span>
                  <span className="font-bold text-zinc-900 select-all">{selectedOrder.game_password || 'N/A'}</span>
                </div>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl">
                <span className="text-xs font-bold text-zinc-400 uppercase block">Catatan User</span>
                <p className="text-zinc-900 text-sm mt-1">{selectedOrder.notes || 'Tidak ada catatan.'}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => updateOrder(selectedOrder.id, 'completed', selectedOrder.target_value)}
                  className="flex-grow py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  Selesaikan Order
                </button>
                <button 
                  onClick={() => updateOrder(selectedOrder.id, 'processing')}
                  className="flex-grow py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Proses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AuthPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">{isLogin ? 'Selamat Datang' : 'Buat Akun'}</h2>
          <p className="text-zinc-500">{isLogin ? 'Masuk untuk mengelola order kamu.' : 'Daftar untuk mulai order joki.'}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">Username</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase mb-2">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            {isLogin ? 'Masuk' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};


const ServicesPage = ({ services, onSelect }: { services: Service[], onSelect: (s: Service) => void }) => {
  const [gameFilter, setGameFilter] = useState<'all' | 'genshin' | 'wuwa'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'daily' | 'explore' | 'endgame'>('all');

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchGame = gameFilter === 'all' || s.game === gameFilter;
      const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
      return matchGame && matchCategory;
    });
  }, [services, gameFilter, categoryFilter]);

  return (
    <section className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-zinc-900 mb-6">Semua Layanan</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase block mb-3">Pilih Game</span>
            <div className="flex gap-2">
              {['all', 'genshin', 'wuwa'].map(g => (
                <button 
                  key={g}
                  onClick={() => setGameFilter(g as any)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                    gameFilter === g ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase block mb-3">Kategori</span>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'daily', 'explore', 'endgame'].map(c => (
                <button 
                  key={c}
                  onClick={() => setCategoryFilter(c as any)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                    categoryFilter === c ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {filteredServices.map(s => (
          <ServiceCard key={s.id} service={s} onSelect={onSelect} />
        ))}
      </div>
      
      {filteredServices.length === 0 && (
        <div className="py-20 text-center">
          <AlertCircle size={48} className="mx-auto text-zinc-200 mb-4" />
          <p className="text-zinc-400 font-medium">Tidak ada layanan yang ditemukan untuk filter ini.</p>
        </div>
      )}
    </section>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(setServices);
    
    // Simple local storage session
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (u: User & { token?: string }) => {
    const { token, ...userData } = u as any;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) localStorage.setItem('token', token);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentPage('home');
  };

  const handleSelectService = (s: Service) => {
    if (!user) {
      setCurrentPage('auth');
    } else {
      setSelectedService(s);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Navbar user={user} onLogout={handleLogout} onNavigate={setCurrentPage} />
      
      <main>
        {currentPage === 'home' && (
          <>
            <Hero onNavigate={setCurrentPage} />
            <section className="py-20 px-4 max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-zinc-900 mb-4">Layanan Unggulan Kami</h2>
                <p className="text-zinc-500">Pilih paket yang sesuai dengan kebutuhan akun kamu.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {services.slice(0, 3).map(s => (
                  <ServiceCard key={s.id} service={s} onSelect={handleSelectService} />
                ))}
              </div>
            </section>
          </>
        )}

        {currentPage === 'services' && (
          <ServicesPage services={services} onSelect={handleSelectService} />
        )}

        {currentPage === 'calculator' && (
          <div className="pt-16">
            <CalculatorSection services={services} onSelect={handleSelectService} />
          </div>
        )}

        {currentPage === 'dashboard' && user && <Dashboard user={user} />}
        {currentPage === 'admin' && user?.role === 'admin' && <AdminDashboard />}
        {currentPage === 'auth' && <AuthPage onLogin={handleLogin} />}
      </main>

      {selectedService && user && (
        <OrderModal 
          service={selectedService} 
          user={user} 
          onClose={() => setSelectedService(null)} 
          onSuccess={() => {
            setSelectedService(null);
            setCurrentPage('dashboard');
          }}
        />
      )}

      <footer className="bg-zinc-950 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Gamepad2 size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight">ZaiBoost</span>
            </div>
            <p className="text-zinc-400 max-w-md leading-relaxed">
              Solusi terbaik untuk kamu yang ingin menikmati konten Genshin Impact & Wuthering Waves tanpa harus grinding setiap hari. Aman, cepat, dan terpercaya.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-zinc-500">Menu</h4>
            <ul className="space-y-4 text-zinc-400 font-medium">
              <li><button onClick={() => setCurrentPage('home')}>Home</button></li>
              <li><button onClick={() => setCurrentPage('services')}>Layanan</button></li>
              <li><button onClick={() => setCurrentPage('calculator')}>Kalkulator</button></li>
              <li><button onClick={() => setCurrentPage('auth')}>Login</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-zinc-500">Kontak</h4>
            <ul className="space-y-4 text-zinc-400 font-medium">
              <li>WhatsApp: +62 812 3456 7890</li>
              <li>Instagram: @genshinboost.id</li>
              <li>Email: support@genshinboost.com</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900 text-center text-zinc-600 text-sm font-medium">
          &copy; 2026 ZaiBoost. Not affiliated with HoYoverse or Kuro Games.
        </div>
      </footer>
    </div>
  );
}
