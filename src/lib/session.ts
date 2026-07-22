export type SessionRole = 'admin' | 'vendedor' | 'consulta' | '';

export type SessionUser = {
  id: string;
  nombre: string;
  usuario: string;
  rol: SessionRole;
};

export function toSessionRole(value: unknown): SessionRole {
  const rol = String(value ?? '').toLowerCase();
  if (rol === 'admin' || rol === 'administrador') return 'admin';
  if (rol === 'vendedor') return 'vendedor';
  if (rol === 'consulta') return 'consulta';
  return '';
}

export function getSessionUser(): SessionUser {
  try {
    const data = JSON.parse(sessionStorage.getItem('usuario') || '{}') as Record<string, unknown>;

    return {
      id: String(data.id ?? data.id_usuario ?? data.usuario_id ?? ''),
      nombre: String(data.nombre ?? data.name ?? data.usuario ?? data.email ?? data.correo ?? ''),
      usuario: String(data.usuario ?? data.username ?? data.email ?? data.correo ?? ''),
      rol: toSessionRole(data.rol ?? data.role),
    };
  } catch {
    return {
      id: '',
      nombre: '',
      usuario: '',
      rol: '',
    };
  }
}

