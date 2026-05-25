'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../../components/ui/Modal';

interface DeleteConfirmModalProps {
  open: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ open, productName, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar eliminación"
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Eliminar Producto
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-12 h-12 rounded-full bg-danger-bg flex items-center justify-center mb-4">
          <AlertTriangle size={24} className="text-danger" />
        </div>
        <p className="text-sm text-foreground font-medium mb-2">
          ¿Eliminar <span className="font-semibold">"{productName}"</span>?
        </p>
        <p className="text-sm text-muted-foreground">
          Esta acción eliminará el producto del inventario permanentemente. El historial de ventas asociado no se verá afectado.
        </p>
      </div>
    </Modal>
  );
}