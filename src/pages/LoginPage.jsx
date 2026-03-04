import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Building2, ShieldCheck, Store, Package } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ROLE_HOMES = {
    admin: '/admin',
    sales: '/ventas-home',
    warehouse: '/warehouse-orders',
};

const ROLE_LABELS = {
    admin: { label: 'Administrador', icon: ShieldCheck, color: 'text-red-400' },
    sales: { label: 'Ventas', icon: Store, color: 'text-green-400' },
    warehouse: { label: 'Depósito', icon: Package, color: 'text-blue-400' },
};

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAppContext();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();

        const result = login(username, password);
        if (result) {
            const role = result.role || 'sales';
            const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.sales;
            toast({
                title: "¡Bienvenido!",
                description: `Sesión iniciada como ${roleInfo.label}.`,
            });
            navigate(ROLE_HOMES[role] || '/');
        } else {
            toast({
                title: "Error de autenticación",
                description: "Usuario o contraseña incorrectos.",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <Helmet>
                <title>Iniciar Sesión - Alambrados Belgrano</title>
                <meta name="description" content="Inicia sesión en el sistema integral" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl p-8">
                        <div className="flex items-center justify-center mb-8">
                            <div className="bg-orange-500/10 p-4 rounded-full">
                                <Building2 className="w-12 h-12 text-orange-500" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white text-center mb-2">
                            Alambrados Belgrano
                        </h2>
                        <p className="text-slate-400 text-center mb-8">
                            Ingresa tus credenciales para continuar
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                                    Usuario
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        placeholder="tu usuario"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Iniciar Sesión
                            </Button>
                        </form>

                        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                            <p className="text-xs text-slate-400 text-center mb-3">
                                Credenciales de demostración:
                            </p>
                            <div className="space-y-2">
                                {Object.entries(ROLE_LABELS).map(([role, info]) => {
                                    const Icon = info.icon;
                                    const creds = role === 'admin' ? 'admin / admin123'
                                        : role === 'sales' ? 'ventas / ventas123'
                                            : 'deposito / deposito123';
                                    return (
                                        <div key={role} className="flex items-center gap-2 justify-center">
                                            <Icon className={`w-3.5 h-3.5 ${info.color}`} />
                                            <p className="text-sm text-slate-300 font-mono">
                                                <span className="text-orange-500">{creds}</span>
                                                <span className="text-slate-500 ml-2">— {info.label}</span>
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default LoginPage;
