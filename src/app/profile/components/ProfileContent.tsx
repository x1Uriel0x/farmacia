'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  CheckCircle,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserCog,
} from 'lucide-react';
import Badge, { type BadgeVariant } from '../../../components/ui/Badge';

type SessionUser = {
  id: string;
  nombre: string;
  usuario: string;
  email: string;
  telefono: string;
  rol: 'admin' | 'vendedor' | 'consulta';
  estado: 'activo' | 'inactivo';
  fechaRegistro: string;
};

const emptyUser: SessionUser = {
  id: '',
  nombre: 'Usuario',
  usuario: '',
  email: '',
  telefono: '',
  rol: 'consulta',
  estado: 'activo',
  fechaRegistro: '',
};

const roleLabels: Record<SessionUser['rol'], string> = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
  consulta: 'Consulta',
};

const roleBadges: Record<SessionUser['rol'], BadgeVariant> = {
  admin: 'administrador',
  vendedor: 'vendedor',
  consulta: 'consulta',
};

function normalizeRole(value: unknown): SessionUser['rol'] {
  const role = String(value ?? '').toLowerCase();
  if (role === 'admin' || role === 'administrador') return 'admin';
  if (role === 'vendedor') return 'vendedor';
  return 'consulta';
}

function normalizeStatus(value: unknown): SessionUser['estado'] {
  const status = String(value ?? '').toLowerCase();
  if (status === '0' || status === 'inactivo' || status === 'desactivado') return 'inactivo';
  return 'activo';
}

function readSessionUser(): SessionUser {
  try {
    const data = JSON.parse(sessionStorage.getItem('usuario') || '{}') as Record<string, unknown>;

    return {
      id: String(data.id ?? data.id_usuario ?? data.usuario_id ?? ''),
      nombre: String(data.nombre ?? data.name ?? data.usuario ?? 'Usuario'),
      usuario: String(data.usuario ?? data.username ?? data.email ?? data.correo ?? ''),
      email: String(data.email ?? data.correo ?? ''),
      telefono: String(data.telefono ?? data.phone ?? ''),
      rol: normalizeRole(data.rol ?? data.role),
      estado: normalizeStatus(data.estado ?? data.activo ?? data.status),
      fechaRegistro: String(data.fechaRegistro ?? data.fecha_registro ?? data.created_at ?? ''),
    };
  } catch {
    return emptyUser;
  }
}

export default function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser>(emptyUser);

  useEffect(() => {
    queueMicrotask(() => {
      setUser(readSessionUser());
    });
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('usuario');
    localStorage.removeItem('usuario');
    router.replace('/sign-up-login-screen');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mi Perfil</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Informacion de la cuenta activa en PharmaControl
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-secondary flex items-center gap-2 self-start text-danger hover:bg-danger-bg sm:self-auto"
        >
          <LogOut size={16} />
          Cerrar Sesion
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#06B6D4]">
              <User size={34} className="text-white" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">{user.nombre}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.usuario ? `@${user.usuario}` : 'Usuario del sistema'}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge variant={roleBadges[user.rol]} label={roleLabels[user.rol]} />
              <span className="inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-xs font-medium text-white">
                <CheckCircle size={12} />
                {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </section>

        <section className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h2 className="section-header">Datos de la cuenta</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ProfileField icon={<Mail size={16} />} label="Correo" value={user.email || 'No registrado'} />
            <ProfileField icon={<Phone size={16} />} label="Telefono" value={user.telefono || 'No registrado'} />
            <ProfileField icon={<UserCog size={16} />} label="Rol" value={roleLabels[user.rol]} />
            <ProfileField icon={<CalendarDays size={16} />} label="Fecha de registro" value={user.fechaRegistro || 'No registrada'} />
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
            {user.rol === 'admin' && (
              <Link href="/user-administration" className="btn-primary flex items-center justify-center gap-2">
                <UserCog size={16} />
                Administrar Usuarios
              </Link>
            )}
            <button type="button" className="btn-secondary flex items-center justify-center gap-2" disabled>
              <KeyRound size={16} />
              Cambiar Contrasena
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase">{label}</span>
      </div>
      <p className="break-words text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
