import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Button, Input, Card } from '@/components/ui';
import { toast } from '@/components/ui/Toast';

export function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            toast.success('¡Bienvenido!', 'Has iniciado sesión correctamente');
            navigate('/dashboard');
        } catch {
            setError('Email o contraseña incorrectos');
            toast.error('Error', 'No se pudo iniciar sesión');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="bg-primary rounded-xl size-12 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl">layers</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SaaS App</h1>
                </div>

                <Card padding="lg" className="shadow-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Iniciar Sesión</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={<span className="material-symbols-outlined text-[20px]">mail</span>}
                            required
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            leftIcon={<span className="material-symbols-outlined text-[20px]">lock</span>}
                            required
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Iniciar Sesión
                        </Button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 text-center mb-3">Credenciales de prueba:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="font-semibold text-slate-600 dark:text-slate-300">Admin</p>
                                <p className="text-slate-400">admin@empresa.com</p>
                                <p className="text-slate-400">admin123</p>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="font-semibold text-slate-600 dark:text-slate-300">Usuario</p>
                                <p className="text-slate-400">user@empresa.com</p>
                                <p className="text-slate-400">user123</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
