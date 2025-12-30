import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Button, Card, CardHeader, Input, Select, Toggle } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/auth.store';

export function SettingsPage() {
    const { user, logout } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        bio: '',
        language: 'es',
        timezone: 'America/Argentina/Buenos_Aires',
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        marketingEmails: false,
    });

    const handleSave = async () => {
        setIsSaving(true);
        // Simular guardado
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSaving(false);
        toast.success('Configuración guardada', 'Tus cambios han sido guardados correctamente.');
    };

    const handleLogout = () => {
        logout();
        toast.info('Sesión cerrada', 'Has cerrado sesión correctamente.');
    };

    return (
        <AppLayout>
            <div className="flex flex-col gap-8 max-w-4xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Administra tu cuenta y preferencias
                    </p>
                </div>

                {/* Profile Section */}
                <Card padding="lg">
                    <CardHeader
                        title="Información Personal"
                        description="Actualiza tu información de perfil"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Input
                            label="Nombre"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <Input
                            label="Apellido"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Teléfono"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+54 11 1234-5678"
                        />
                    </div>
                </Card>

                {/* Regional Settings */}
                <Card padding="lg">
                    <CardHeader
                        title="Preferencias Regionales"
                        description="Configura tu idioma y zona horaria"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Select
                            label="Idioma"
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            options={[
                                { value: 'es', label: 'Español' },
                                { value: 'en', label: 'English' },
                                { value: 'pt', label: 'Português' },
                            ]}
                        />
                        <Select
                            label="Zona Horaria"
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            options={[
                                { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
                                { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
                                { value: 'America/New_York', label: 'New York (GMT-5)' },
                                { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
                            ]}
                        />
                    </div>
                </Card>

                {/* Notifications */}
                <Card padding="lg">
                    <CardHeader
                        title="Notificaciones"
                        description="Elige qué notificaciones deseas recibir"
                    />
                    <div className="flex flex-col gap-6 mt-6">
                        <Toggle
                            label="Notificaciones por email"
                            description="Recibe alertas importantes por correo electrónico"
                            checked={notifications.emailNotifications}
                            onChange={(e) =>
                                setNotifications({ ...notifications, emailNotifications: e.target.checked })
                            }
                        />
                        <Toggle
                            label="Notificaciones push"
                            description="Recibe notificaciones en tu navegador"
                            checked={notifications.pushNotifications}
                            onChange={(e) =>
                                setNotifications({ ...notifications, pushNotifications: e.target.checked })
                            }
                        />
                        <Toggle
                            label="Resumen semanal"
                            description="Recibe un resumen de actividad cada semana"
                            checked={notifications.weeklyDigest}
                            onChange={(e) =>
                                setNotifications({ ...notifications, weeklyDigest: e.target.checked })
                            }
                        />
                        <Toggle
                            label="Emails de marketing"
                            description="Recibe noticias y ofertas especiales"
                            checked={notifications.marketingEmails}
                            onChange={(e) =>
                                setNotifications({ ...notifications, marketingEmails: e.target.checked })
                            }
                        />
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card padding="lg" className="border-error/20">
                    <CardHeader
                        title="Zona de Peligro"
                        description="Acciones irreversibles de tu cuenta"
                    />
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <Button variant="outline" onClick={handleLogout}>
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Cerrar Sesión
                        </Button>
                        <Button variant="danger">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Eliminar Cuenta
                        </Button>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} isLoading={isSaving} size="lg">
                        Guardar Cambios
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
