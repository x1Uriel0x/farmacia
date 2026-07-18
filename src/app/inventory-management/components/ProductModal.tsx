'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { type Producto, categorias } from './inventoryData';

type ProductFormData = {
  sku: string;
  nombre: string;
  laboratorio: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  precioCompra: number;
  precioVenta: number;
  fechaVencimiento: string;
  lote: string;
  controlado: boolean;
  descontinuado: boolean;
};
interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Producto | null;
  onSave: (data: ProductFormData) => void;
}

export default function ProductModal({ open, onClose, product, onSave }: ProductModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      sku: '',
      nombre: '',
      laboratorio: '',
      categoria: 'Analgésicos',
      stockActual: 0,
      stockMinimo: 10,
      precioCompra: 0,
      precioVenta: 0,
      fechaVencimiento: '',
      lote: '',
      //status: 'disponible',
      controlado: false,
      descontinuado: false,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku,
        nombre: product.nombre,
        laboratorio: product.laboratorio,
        categoria: product.categoria,
        stockActual: product.stockActual,
        stockMinimo: product.stockMinimo,
        precioCompra: product.precioCompra,
        precioVenta: product.precioVenta,
        fechaVencimiento: product.fechaVencimiento,
        lote: product.lote,
        //status: product.status,
        controlado: product.controlado,
      });
    } else {
      reset({
        sku: '',
        nombre: '',
        laboratorio: '',
        categoria: 'Analgésicos',
        stockActual: 0,
        stockMinimo: 10,
        precioCompra: 0,
        precioVenta: 0,
        fechaVencimiento: '',
        lote: '',
        //status: 'disponible',
        controlado: false,
        descontinuado:false,
      });
    }
  }, [product, reset, open]);

  const precioCompra = watch('precioCompra');
  const margen = precioCompra > 0 ? watch('precioVenta') / precioCompra : 0;

  // Backend integration point: POST /api/productos or PUT /api/productos/:id
  const onSubmit = async (data: ProductFormData) => {
    await new Promise((r) => setTimeout(r, 500));
    onSave(data);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Editar Producto' : 'Registrar Nuevo Producto'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Guardando...
              </>
            ) : product ? 'Actualizar Producto' : 'Registrar Producto'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Section: Identificación */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Identificación
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sku" className="label-text">SKU / Código</label>
              <p className="helper-text">Código único del medicamento</p>
              <input
                id="sku"
                type="text"
                placeholder="MED-0001"
                className={`input-field mt-1 ${errors.sku ? 'border-danger' : ''}`}
                {...register('sku', { required: 'El SKU es requerido' })}
              />
              {errors.sku && <p className="error-text">{errors.sku.message}</p>}
            </div>
            <div>
              <label htmlFor="lote" className="label-text">Número de Lote</label>
              <p className="helper-text">Lote del fabricante para trazabilidad</p>
              <input
                id="lote"
                type="text"
                placeholder="L2026-001"
                className={`input-field mt-1 ${errors.lote ? 'border-danger' : ''}`}
                {...register('lote', { required: 'El número de lote es requerido' })}
              />
              {errors.lote && <p className="error-text">{errors.lote.message}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="nombre" className="label-text">Nombre del Medicamento</label>
            <p className="helper-text">Incluye presentación y concentración (ej: Paracetamol 500mg x 20 tab)</p>
            <input
              id="nombre"
              type="text"
              placeholder="Paracetamol 500mg x 20 tabletas"
              className={`input-field mt-1 ${errors.nombre ? 'border-danger' : ''}`}
              {...register('nombre', { required: 'El nombre es requerido', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
            />
            {errors.nombre && <p className="error-text">{errors.nombre.message}</p>}
          </div>
        </div>

        <hr className="border-border" />

        {/* Section: Clasificación */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Clasificación
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="laboratorio" className="label-text">Laboratorio</label>
              <input
                id="laboratorio"
                type="text"
                placeholder="Pharmabrand"
                className={`input-field ${errors.laboratorio ? 'border-danger' : ''}`}
                {...register('laboratorio', { required: 'El laboratorio es requerido' })}
              />
              {errors.laboratorio && <p className="error-text">{errors.laboratorio.message}</p>}
            </div>
            <div>
              <label htmlFor="categoria" className="label-text">Categoría</label>
              <select
                id="categoria"
                className="input-field"
                {...register('categoria')}
              >
                {categorias.filter((c) => c !== 'Todas').map((c) => (
                  <option key={`modal-cat-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              id="controlado"
              type="checkbox"
              className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
              {...register('controlado')}
            />
            <div>
              <label htmlFor="controlado" className="label-text mb-0 cursor-pointer">
                Medicamento controlado
              </label>
              <p className="helper-text">Requiere receta médica para su despacho</p>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Section: Stock */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Control de Stock
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="stockActual" className="label-text">Stock Actual</label>
              <input
                id="stockActual"
                type="number"
                min="0"
                className={`input-field ${errors.stockActual ? 'border-danger' : ''}`}
                {...register('stockActual', { required: true, valueAsNumber: true, min: { value: 0, message: 'No puede ser negativo' } })}
              />
              {errors.stockActual && <p className="error-text">{errors.stockActual.message ?? 'Requerido'}</p>}
            </div>
            <div>
              <label htmlFor="stockMinimo" className="label-text">Stock Mínimo</label>
              <p className="helper-text">Umbral de alerta</p>
              <input
                id="stockMinimo"
                type="number"
                min="1"
                className={`input-field ${errors.stockMinimo ? 'border-danger' : ''}`}
                {...register('stockMinimo', { required: true, valueAsNumber: true, min: { value: 1, message: 'Mínimo 1' } })}
              />
              {errors.stockMinimo && <p className="error-text">{errors.stockMinimo.message ?? 'Requerido'}</p>}
            </div>
            <div>
              <label htmlFor="fechaVencimiento" className="label-text">Fecha de Vencimiento</label>
              <input
                id="fechaVencimiento"
                type="date"
                className={`input-field ${errors.fechaVencimiento ? 'border-danger' : ''}`}
                {...register('fechaVencimiento', { required: 'La fecha de vencimiento es requerida' })}
              />
              {errors.fechaVencimiento && <p className="error-text">{errors.fechaVencimiento.message}</p>}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              id="descontinuado"
              type="checkbox"
              className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
              {...register('descontinuado')}
            />

            <div>
              <label
                htmlFor="descontinuado"
                className="label-text mb-0 cursor-pointer"
              >
                Medicamento descontinuado
              </label>

              <p className="helper-text">
                Marque esta opción únicamente si el medicamento ya no será comercializado.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Section: Precios */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Precios
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="precioCompra" className="label-text">Precio de Compra (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  id="precioCompra"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input-field pl-7 ${errors.precioCompra ? 'border-danger' : ''}`}
                  {...register('precioCompra', { required: true, valueAsNumber: true, min: { value: 0.01, message: 'Debe ser mayor a $0' } })}
                />
              </div>
              {errors.precioCompra && <p className="error-text">{errors.precioCompra.message ?? 'Requerido'}</p>}
            </div>
            <div>
              <label htmlFor="precioVenta" className="label-text">Precio de Venta (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  id="precioVenta"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input-field pl-7 ${errors.precioVenta ? 'border-danger' : ''}`}
                  {...register('precioVenta', { required: true, valueAsNumber: true, min: { value: 0.01, message: 'Debe ser mayor a $0' } })}
                />
              </div>
              {errors.precioVenta && <p className="error-text">{errors.precioVenta.message ?? 'Requerido'}</p>}
              {margen > 1 && (
                <p className="helper-text text-success mt-1">
                  Margen: {((margen - 1) * 100).toFixed(1)}% sobre costo
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}