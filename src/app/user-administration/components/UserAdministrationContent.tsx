'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Edit2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import Badge, { type BadgeVariant } from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';

type UserRole = 'admin' | 'vendedor' | 'consulta';
type UserStatus = 'activo' | 'inactivo';

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  usuario: string;
  telefono: string;
  rol: UserRole;
  estado: UserStatus;
  fechaRegistro: string;
};

type UserFormData = {
  nombre: string;
  email: string;
  usuario: string;
  telefono: string;
  rol: UserRole;
  estado: UserStatus;
  password: string;
};

const API_BASE_URL = 'http://localhost/farmacia-api';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
  consulta: 'Consulta',
};

const roleBadgeVariants: Record<UserRole, BadgeVariant> = {
  admin: 'administrador',
  vendedor: 'vendedor',
  consulta: 'consulta',
};

const statusStyles: Record<UserStatus, string> = {
  activo: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success text-white',
  inactivo: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border',
};

function toRole(value: unknown): UserRole {
  const rol = String(value ?? '').toLowerCase();
  if (rol === 'administrador') return 'admin';
  if (rol === 'vendedor' || rol === 'consulta' || rol === 'admin') return rol;
  return 'consulta';
}

function toStatus(value: unknown): UserStatus {
  const status = String(value ?? '').toLowerCase();
  if (status === '0' || status === 'inactivo' || status === 'desactivado') return 'inactivo';
  return 'activo';
}

function normalizeUser(raw: Record<string, unknown>): Usuario {
  return {
    id: String(raw.id ?? raw.id_usuario ?? raw.usuario_id ?? ''),
    nombre: String(raw.nombre ?? raw.name ?? ''),
    email: String(raw.email ?? raw.correo ?? ''),
    usuario: String(raw.usuario ?? raw.username ?? raw.email ?? raw.correo ?? ''),
    telefono: String(raw.telefono ?? raw.phone ?? ''),
    rol: toRole(raw.rol ?? raw.role),
    estado: toStatus(raw.estado ?? raw.activo ?? raw.status),
    fechaRegistro: String(raw.fechaRegistro ?? raw.fecha_registro ?? raw.created_at ?? ''),
  };
}

function getCurrentUserName() {
  try {
    return JSON.parse(sessionStorage.getItem('usuario') || '{}').nombre ?? 'Administrador';
  } catch {
    return 'Administrador';
  }
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  return JSON.parse(text);
}

export default function UserAdministrationContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Todos' | UserRole>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | UserStatus>('Todos');
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios.php`);
      const data = await response.json();
      const rows = Array.isArray(data) ? data : data.usuarios ?? [];
      setUsuarios(rows.map((item: Record<string, unknown>) => normalizeUser(item)));
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void cargarUsuarios();
    });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return usuarios.filter((user) => {
      const matchSearch =
        query === '' ||
        user.nombre.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.usuario.toLowerCase().includes(query);
      const matchRole = selectedRole === 'Todos' || user.rol === selectedRole;
      const matchStatus = selectedStatus === 'Todos' || user.estado === selectedStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [usuarios, search, selectedRole, selectedStatus]);

  const activos = usuarios.filter((user) => user.estado === 'activo').length;
  const administradores = usuarios.filter((user) => user.rol === 'admin').length;
  const vendedores = usuarios.filter((user) => user.rol === 'vendedor').length;

  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: Usuario) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSave = async (data: UserFormData) => {
    setSaving(true);
    try {
      const endpoint = editingUser ? 'editar_usuario.php' : 'crear_usuario.php';
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingUser?.id,
          ...data,
          usuario_registra: getCurrentUserName(),
        }),
      });

      const result = await readJsonResponse(response);
      if (result.success === false) {
        toast.error(String(result.message ?? 'No se pudo guardar el usuario'));
        return;
      }

      toast.success(editingUser ? 'Usuario actualizado correctamente' : 'Usuario registrado correctamente');
      setIsModalOpen(false);
      setEditingUser(null);
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error('Error de conexion con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: Usuario) => {
    await handleSaveStatus(user, user.estado === 'activo' ? 'inactivo' : 'activo');
  };

  const handleSaveStatus = async (user: Usuario, estado: UserStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/editar_usuario.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          estado,
          usuario_registra: getCurrentUserName(),
        }),
      });

      const result = await readJsonResponse(response);
      if (result.success === false) {
        toast.error(String(result.message ?? 'No se pudo actualizar el estado'));
        return;
      }

      toast.success(estado === 'activo' ? 'Usuario activado' : 'Usuario desactivado');
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error('Error de conexion con el servidor');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/eliminar_usuario.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deleteTarget.id,
          usuario_registra: getCurrentUserName(),
        }),
      });

      const result = await readJsonResponse(response);
      if (result.success === false) {
        toast.error(String(result.message ?? 'No se pudo eliminar el usuario'));
        return;
      }

      toast.success(`"${deleteTarget.nombre}" eliminado correctamente`);
      setDeleteTarget(null);
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error('Error de conexion con el servidor');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Administracion de Usuarios</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {usuarios.length} usuarios registrados
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard icon={<Users size={18} />} label="Usuarios activos" value={activos} tone="primary" />
        <MetricCard icon={<ShieldCheck size={18} />} label="Administradores" value={administradores} tone="info" />
        <MetricCard icon={<UserCheck size={18} />} label="Vendedores" value={vendedores} tone="success" />
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o usuario..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as 'Todos' | UserRole)}
            className="input-field lg:w-52"
          >
            <option value="Todos">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="vendedor">Vendedor</option>
            <option value="consulta">Consulta</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value as 'Todos' | UserStatus)}
            className="input-field lg:w-44"
          >
            <option value="Todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <UsersTable
        loading={loading}
        usuarios={filtered}
        onEdit={openEditModal}
        onDelete={setDeleteTarget}
        onToggleStatus={handleToggleStatus}
      />

      <UserModal
        open={isModalOpen}
        user={editingUser}
        saving={saving}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSave}
      />

      <DeleteUserModal
        user={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'primary' | 'info' | 'success';
}) {
  const toneMap = {
    primary: 'bg-primary/10 text-primary',
    info: 'bg-info-bg text-info',
    success: 'bg-success-bg text-success',
  };

  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneMap[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}

function UsersTable({
  loading,
  usuarios,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  loading: boolean;
  usuarios: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
  onToggleStatus: (user: Usuario) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-muted/40">
              <th className="table-header">Usuario</th>
              <th className="table-header">Contacto</th>
              <th className="table-header">Rol</th>
              <th className="table-header">Estado</th>
              <th className="table-header">Registro</th>
              <th className="table-header text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Cargando usuarios...
                </td>
              </tr>
            )}

            {!loading && usuarios.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No se encontraron usuarios con los filtros seleccionados.
                </td>
              </tr>
            )}

            {!loading && usuarios.map((user) => (
              <tr key={user.id} className="table-row">
                <td className="table-cell">
                  <div>
                    <p className="font-semibold">{user.nombre || 'Sin nombre'}</p>
                    <p className="text-xs text-muted-foreground">@{user.usuario || user.email}</p>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Mail size={14} />
                      {user.email || 'Sin correo'}
                    </p>
                    {user.telefono && (
                      <p className="flex items-center gap-2">
                        <Phone size={14} />
                        {user.telefono}
                      </p>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  <Badge variant={roleBadgeVariants[user.rol]} label={roleLabels[user.rol]} />
                </td>
                <td className="table-cell">
                  <span className={statusStyles[user.estado]}>
                    {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="table-cell text-muted-foreground">
                  {user.fechaRegistro || 'Sin fecha'}
                </td>
                <td className="table-cell">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(user)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title={user.estado === 'activo' ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      <UserCheck size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      title="Editar usuario"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger-bg hover:text-danger"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserModal({
  open,
  user,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  user: Usuario | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      nombre: '',
      email: '',
      usuario: '',
      telefono: '',
      rol: 'vendedor',
      estado: 'activo',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        nombre: user.nombre,
        email: user.email,
        usuario: user.usuario,
        telefono: user.telefono,
        rol: user.rol,
        estado: user.estado,
        password: '',
      });
      return;
    }

    reset({
      nombre: '',
      email: '',
      usuario: '',
      telefono: '',
      rol: 'vendedor',
      estado: 'activo',
      password: '',
    });
  }, [user, reset, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Editar Usuario' : 'Usuario Registrado'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={saving}
            className="btn-primary flex min-w-[136px] items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Guardando...
              </>
            ) : user ? 'Actualizar' : 'Registrar'}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(onSave)} className="space-y-5" noValidate>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Datos personales</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nombre" className="label-text">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                className={`input-field ${errors.nombre ? 'border-danger' : ''}`}
                placeholder="Maria Perez"
                {...register('nombre', {
                  required: 'El nombre es requerido',
                  minLength: { value: 3, message: 'Minimo 3 caracteres' },
                })}
              />
              {errors.nombre && <p className="error-text">{errors.nombre.message}</p>}
            </div>
            <div>
              <label htmlFor="telefono" className="label-text">Telefono</label>
              <input
                id="telefono"
                type="tel"
                className="input-field"
                placeholder="0999999999"
                {...register('telefono')}
              />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Acceso al sistema</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="label-text">Correo electronico</label>
              <input
                id="email"
                type="email"
                className={`input-field ${errors.email ? 'border-danger' : ''}`}
                placeholder="usuario@farmacia.ec"
                {...register('email', {
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Correo invalido',
                  },
                })}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="usuario" className="label-text">Usuario</label>
              <input
                id="usuario"
                type="text"
                className={`input-field ${errors.usuario ? 'border-danger' : ''}`}
                placeholder="mperez"
                {...register('usuario', { required: 'El usuario es requerido' })}
              />
              {errors.usuario && <p className="error-text">{errors.usuario.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="label-text">
                {user ? 'Nueva contrasena' : 'Contrasena'}
              </label>
              <input
                id="password"
                type="password"
                className={`input-field ${errors.password ? 'border-danger' : ''}`}
                placeholder={user ? 'Dejar en blanco para conservar' : 'Minimo 6 caracteres'}
                {...register('password', {
                  required: user ? false : 'La contrasena es requerida',
                  minLength: {
                    value: 6,
                    message: 'Minimo 6 caracteres',
                  },
                })}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rol" className="label-text">Rol</label>
                <select id="rol" className="input-field" {...register('rol')}>
                  <option value="admin">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="consulta">Consulta</option>
                </select>
              </div>
              <div>
                <label htmlFor="estado" className="label-text">Estado</label>
                <select id="estado" className="input-field" {...register('estado')}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function DeleteUserModal({
  user,
  deleting,
  onClose,
  onConfirm,
}: {
  user: Usuario | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={user !== null}
      onClose={onClose}
      title="Eliminar Usuario"
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={deleting}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="btn-danger flex min-w-[112px] items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Eliminando...
              </>
            ) : 'Eliminar'}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        Esta accion eliminara permanentemente el usuario{' '}
        <span className="font-semibold text-foreground">{user?.nombre}</span>.
      </p>
    </Modal>
  );
}
