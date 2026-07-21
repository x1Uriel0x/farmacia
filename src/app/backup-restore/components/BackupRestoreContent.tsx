'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  DatabaseBackup,
  Download,
  FileArchive,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../../../components/ui/Modal';

type BackupFile = {
  id: string;
  nombre: string;
  fecha: string;
  tamano: string;
  url: string;
};

type ApiResult = {
  success?: boolean;
  message?: string;
  error?: string;
  backup?: BackupFile;
  backups?: BackupFile[];
  data?: BackupFile[];
};

const API_BASE_URL = 'http://localhost/farmacia-api/backup';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringValue(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function normalizeBackup(row: unknown, index: number): BackupFile {
  const item = isRecord(row) ? row : {};
  const nombre = toStringValue(item.nombre ?? item.name ?? item.archivo ?? item.filename, `backup-${index + 1}.sql`);

  return {
    id: toStringValue(item.id ?? nombre, nombre),
    nombre,
    fecha: toStringValue(item.fecha ?? item.created_at ?? item.date, ''),
    tamano: toStringValue(item.tamano ?? item.size ?? item.peso, ''),
    url: toStringValue(item.url ?? item.download_url ?? `${API_BASE_URL}/descargar_backup.php?archivo=${encodeURIComponent(nombre)}`),
  };
}

function normalizeBackups(payload: unknown): BackupFile[] {
  if (Array.isArray(payload)) return payload.map(normalizeBackup);
  if (!isRecord(payload)) return [];

  const rows = payload.backups ?? payload.data ?? payload.archivos ?? payload.resultado;
  return Array.isArray(rows) ? rows.map(normalizeBackup) : [];
}

async function readApiResult(response: Response): Promise<ApiResult> {
  const text = await response.text();
  if (!text) return { success: response.ok };

  try {
    return JSON.parse(text) as ApiResult;
  } catch {
    return {
      success: false,
      message: text || `Error del servidor (${response.status})`,
    };
  }
}

function formatDate(value: string): string {
  if (!value) return 'Sin fecha';
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getCurrentUserName() {
  try {
    const data = JSON.parse(sessionStorage.getItem('usuario') || '{}') as Record<string, unknown>;
    return toStringValue(data.nombre ?? data.usuario ?? data.email ?? data.correo, 'Administrador');
  } catch {
    return 'Administrador';
  }
}

export default function BackupRestoreContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BackupFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cargarBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/listar_backups.php`);
      const data = await response.json();
      setBackups(normalizeBackups(data));
    } catch (error) {
      console.error('Error al cargar respaldos:', error);
      toast.error('No se pudo cargar la lista de respaldos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void cargarBackups();
    });
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/backup_database.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: getCurrentUserName(),
        }),
      });

      const result = await readApiResult(response);
      if (!response.ok || result.success === false) {
        toast.error(result.message || result.error || 'No se pudo crear el respaldo');
        return;
      }

      toast.success(result.message || 'Respaldo creado correctamente');
      await cargarBackups();
    } catch (error) {
      console.error('Error al crear respaldo:', error);
      toast.error('Error de conexion al crear respaldo');
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo .sql para restaurar');
      return;
    }

    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append('backup', selectedFile);
      formData.append('usuario', getCurrentUserName());

      const response = await fetch(`${API_BASE_URL}/restore_database.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await readApiResult(response);
      if (!response.ok || result.success === false) {
        toast.error(result.message || result.error || 'No se pudo restaurar el respaldo');
        return;
      }

      toast.success(result.message || 'Base de datos restaurada correctamente');
      setSelectedFile(null);
      setConfirmOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await cargarBackups();
    } catch (error) {
      console.error('Error al restaurar respaldo:', error);
      toast.error('Error de conexion al restaurar respaldo');
    } finally {
      setRestoring(false);
    }
  };

  const handleCancelRestore = () => {
    setSelectedFile(null);
    setConfirmOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Restauracion cancelada');
  };

  const handleDeleteBackup = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/eliminar_backup.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archivo: deleteTarget.nombre,
          
          usuario: getCurrentUserName(),
        }),
      });

      const result = await readApiResult(response);
      if (!response.ok || result.success === false) {
        toast.error(result.message || result.error || 'No se pudo eliminar el respaldo');
        return;
      }

      toast.success(result.message || 'Respaldo eliminado correctamente');
      setDeleteTarget(null);
      await cargarBackups();
    } catch (error) {
      console.error('Error al eliminar respaldo:', error);
      toast.error('Error de conexion al eliminar respaldo');
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.sql')) {
      toast.error('Solo se permiten archivos .sql');
      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Respaldo y Restauracion</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Copias de seguridad y restauracion de la base de datos
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateBackup}
          disabled={creating}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : <DatabaseBackup size={16} />}
          Crear Respaldo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard
          icon={<ShieldCheck size={18} />}
          label="Acceso"
          value="Solo administradores"
        />
        <InfoCard
          icon={<FileArchive size={18} />}
          label="Respaldos"
          value={`${backups.length} archivo(s)`}
        />
        <InfoCard
          icon={<AlertTriangle size={18} />}
          label="Restauracion"
          value="Reemplaza datos actuales"
          warning
        />
      </div>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="section-header">Restaurar desde archivo SQL</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Antes de restaurar, el backend debe crear un respaldo preventivo automaticamente.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql"
            onChange={handleFileChange}
            className="input-field"
          />
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!selectedFile || restoring}
            className="btn-danger flex items-center justify-center gap-2"
          >
            {restoring ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Restaurar Base de Datos
          </button>
          <button
            type="button"
            onClick={handleCancelRestore}
            disabled={!selectedFile || restoring}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            Cancelar
          </button>
        </div>

        {selectedFile && (
          <p className="mt-2 text-xs text-muted-foreground">
            Archivo seleccionado: <span className="font-semibold text-foreground">{selectedFile.name}</span>
          </p>
        )}
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="section-header">Respaldos disponibles</h2>
            <p className="mt-1 text-xs text-muted-foreground">Archivos generados por el sistema</p>
          </div>
          <button
            type="button"
            onClick={cargarBackups}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCcw size={15} />
            Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-muted/40">
                <th className="table-header">Archivo</th>
                <th className="table-header">Fecha</th>
                <th className="table-header">Tamaño</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Cargando respaldos...
                    </span>
                  </td>
                </tr>
              )}

              {!loading && backups.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No hay respaldos generados.
                  </td>
                </tr>
              )}

              {!loading && backups.map((backup) => (
                <tr key={backup.id} className="table-row">
                  <td className="table-cell font-semibold">{backup.nombre}</td>
                  <td className="table-cell text-muted-foreground">{formatDate(backup.fecha)}</td>
                  <td className="table-cell text-muted-foreground">{backup.tamano || 'No disponible'}</td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-2">
                      <a
                        href={backup.url}
                        className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs"
                      >
                        <Download size={14} />
                        Descargar
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(backup)}
                        className="btn-danger inline-flex items-center gap-2 px-3 py-1.5 text-xs"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={confirmOpen}
        onClose={handleCancelRestore}
        title="Confirmar restauracion"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={handleCancelRestore}
              className="btn-secondary"
              disabled={restoring}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleRestore}
              className="btn-danger flex min-w-[140px] items-center justify-center gap-2"
              disabled={restoring}
            >
              {restoring ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Restaurando...
                </>
              ) : 'Confirmar'}
            </button>
          </>
        }
      >
        <div className="rounded-lg border border-danger/30 bg-danger-bg p-4 text-sm text-danger">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle size={16} />
            Esta accion es critica.
          </div>
          <p>
            Restaurar una base de datos puede reemplazar informacion actual. Verifica que el archivo SQL sea correcto
            antes de continuar.
          </p>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar respaldo"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="btn-secondary"
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteBackup}
              className="btn-danger flex min-w-[120px] items-center justify-center gap-2"
              disabled={deleting}
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
          Se eliminara permanentemente el respaldo{' '}
          <span className="font-semibold text-foreground">{deleteTarget?.nombre}</span>.
        </p>
      </Modal>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
        warning ? 'bg-warning-bg text-warning' : 'bg-primary/10 text-primary'
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
