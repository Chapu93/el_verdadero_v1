import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { Button, Card, Input, Skeleton } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { useCurrentUser, usersApi, UpdateUserDto } from '../api/users.api';

export function ProfilePage() {
    const queryClient = useQueryClient();
    const { data: userData, isLoading, isError } = useCurrentUser();
    const user = userData?.data;

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateUserDto>({
        firstName: '',
        lastName: '',
        phone: '',
        bio: '',
        avatar: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
            });
        }
    }, [user]);

    const mutation = useMutation({
        mutationFn: (data: UpdateUserDto) => usersApi.updateMe(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
            toast.success('Perfil actualizado', 'Tu información ha sido guardada correctamente.');
            setIsEditing(false);
        },
        onError: () => {
            toast.error('Error', 'No se pudo actualizar tu perfil. Intenta de nuevo.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            avatar: formData.avatar || undefined,
            phone: formData.phone || undefined,
            bio: formData.bio || undefined,
        };
        mutation.mutate(dataToSend);
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                    <Skeleton className="h-10 w-48" />
                    <Card>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-6">
                                <Skeleton className="size-24 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    if (isError || !user) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <span className="material-symbols-outlined text-6xl text-slate-400">error</span>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Error al cargar perfil
                    </h2>
                    <p className="text-slate-500">No se pudo cargar tu información de perfil.</p>
                    <Button onClick={() => window.location.reload()}>Reintentar</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Mi Perfil
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Gestiona tu información personal y preferencias
                        </p>
                    </div>
                    {!isEditing && (
                        <Button
                            variant="outline"
                            leftIcon={<span className="material-symbols-outlined text-[18px]">edit</span>}
                            onClick={() => setIsEditing(true)}
                        >
                            Editar Perfil
                        </Button>
                    )}
                </div>

                {/* Profile Card */}
                <Card>
                    <form onSubmit={handleSubmit}>
                        {/* Avatar Section */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-6">
                                <div
                                    className="size-24 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
                                    style={
                                        user.avatar
                                            ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover' }
                                            : undefined
                                    }
                                >
                                    {!user.avatar && user.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                                    <span className="inline-flex items-center mt-2 rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary">
                                        {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                                    </span>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-4">
                                    <Input
                                        label="URL de Avatar"
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.avatar}
                                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Form Fields */}
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                                        Nombre
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Tu nombre"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    ) : (
                                        <p className="text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            {user.firstName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                                        Apellido
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Tu apellido"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    ) : (
                                        <p className="text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            {user.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                                    Email
                                </label>
                                <p className="text-slate-500 dark:text-slate-400 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    {user.email}
                                    <span className="ml-2 text-xs text-slate-400">(no editable)</span>
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                                    Teléfono
                                </label>
                                {isEditing ? (
                                    <Input
                                        placeholder="+54 9 11 1234-5678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        {user.phone || <span className="text-slate-400 italic">No especificado</span>}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                                    Biografía
                                </label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full h-24 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        placeholder="Cuéntanos un poco sobre ti..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        maxLength={500}
                                    />
                                ) : (
                                    <p className="text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg min-h-[60px]">
                                        {user.bio || <span className="text-slate-400 italic">No hay biografía</span>}
                                    </p>
                                )}
                                {isEditing && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {formData.bio?.length || 0}/500 caracteres
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={mutation.isPending}>
                                    Guardar Cambios
                                </Button>
                            </div>
                        )}
                    </form>
                </Card>

                {/* Account Info */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Información de la Cuenta
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500">ID de Usuario</span>
                                <p className="font-mono text-slate-700 dark:text-slate-300 mt-1">
                                    {user.id}
                                </p>
                            </div>
                            <div>
                                <span className="text-slate-500">Miembro desde</span>
                                <p className="text-slate-700 dark:text-slate-300 mt-1">
                                    {new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(user.createdAt))}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
