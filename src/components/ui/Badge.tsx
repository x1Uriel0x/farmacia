import React from 'react';

export type BadgeVariant =
  | 'disponible' |'bajo-stock' |'agotado' |'por-vencer' |'descontinuado' |'administrador' |'vendedor' |'consulta' |'confirmada' |'anulada' |'facturada' |'borrador'|'vencido';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  disponible: 'badge-disponible',
  'bajo-stock': 'badge-bajo-stock',
  agotado: 'badge-agotado',
  'por-vencer': 'badge-por-vencer',
  descontinuado: 'badge-descontinuado',
  vencido: 'badge-vencido',
  administrador: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-info text-white',
  vendedor: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground',
  consulta: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border',
  confirmada: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success text-white',
  anulada: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-danger text-white',
  facturada: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-info text-white',
  borrador: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground',
};

export default function Badge({ variant, label, className = '' }: BadgeProps) {
  return (
    <span className={`${variantMap[variant]} ${className}`}>
      {label}
    </span>
  );
}