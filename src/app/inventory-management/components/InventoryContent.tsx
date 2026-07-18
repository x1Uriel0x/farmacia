'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { categorias, type Producto } from './inventoryData';
import InventoryTable from './InventoryTable';
import ProductModal from './ProductModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const statusOptions = ['Todos', 'disponible', 'bajo-stock', 'agotado', 'por-vencer', 'vencidos', 'descontinuado'];

const statusLabels: Record<string, string> = {
  Todos: 'Todos los estados',
  disponible: 'Disponible',
  'bajo-stock': 'Bajo stock',
  agotado: 'Agotado',
  'por-vencer': 'Por vencer',
  vencidos: 'Vencidos',
  descontinuado: 'Descontinuado',
};

const alertFilterLabels: Record<string, string> = {
  'bajo-stock': 'productos con bajo stock',
  agotado: 'productos agotados',
  'por-vencer': 'productos por vencer',
  vencidos: 'productos vencidos',
};

export default function InventoryContent() {
  const [productosList, setProductosList] = useState<Producto[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [rol, setRol] = useState('');
  const bajoStock = productosList.filter((p) => p.status === 'bajo-stock').length;
  const porVencer = productosList.filter((p) => p.status === 'por-vencer').length;
  const agotados = productosList.filter((p) => p.status === 'agotado').length;

const cargarProductos = async () => {
  try {
    const response = await fetch(
      'http://localhost/farmacia-api/productos.php'
    );

    const data = await response.json();

    const productosFormateados = data.map((p: any) => ({
      ...p,
      precioCompra: Number(p.precioCompra),
      precioVenta: Number(p.precioVenta),
      stockActual: Number(p.stockActual),
      stockMinimo: Number(p.stockMinimo),
      controlado: Boolean(Number(p.controlado))
    }));

    setProductosList(productosFormateados);

  } catch (error) {
    console.error(error);
    toast.error('Error al cargar productos');
  }
};
    useEffect(() => {
      cargarProductos();

      const usuario = sessionStorage.getItem('usuario');

      console.log("SESSION STORAGE:", usuario);

      if (usuario) {
        const datos = JSON.parse(usuario);

        console.log("USUARIO:", datos);
        console.log("ROL:", datos.rol);

        setRol(String(datos.rol).toLowerCase());
      }

      const params = new URLSearchParams(window.location.search);
      const estado = params.get('estado');

      if (estado && statusOptions.includes(estado)) {
        setSelectedStatus(estado);
        setCurrentPage(1);
      }
    }, []);


  const filtered = useMemo(() => {
    return productosList.filter((p) => {
      const matchSearch =
        search === '' ||
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.laboratorio.toLowerCase().includes(search.toLowerCase());
      const matchCategoria = selectedCategoria === 'Todas' || p.categoria === selectedCategoria;
      const isExpired = new Date(`${p.fechaVencimiento}T00:00:00`) < new Date(new Date().toDateString());
      const matchStatus =
        selectedStatus === 'Todos' ||
        (selectedStatus === 'vencidos' ? isExpired : p.status === selectedStatus);
      return matchSearch && matchCategoria && matchStatus;
    });
  }, [productosList, search, selectedCategoria, selectedStatus]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (product: Producto) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Producto) => {
    setDeleteTarget(product);
  };

 const handleSave = async (data: Omit<Producto, 'id'>) => {

  try {

    let response;

    if (editingProduct) {

      response = await fetch(
        'http://localhost/farmacia-api/editar_producto.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
            body: JSON.stringify({
              id: editingProduct.id,
              ...data,
              usuario: JSON.parse(sessionStorage.getItem('usuario') || '{}').nombre
          })
        }
      );

    } else {

      response = await fetch(
        'http://localhost/farmacia-api/crear_producto.php',
    {
      method: 'POST',
       headers: {
       'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      ...data,
      usuario: JSON.parse(sessionStorage.getItem('usuario') || '{}').nombre
    })
  }
);

    }

    const result = await response.json();

    if (!result.success) {
      toast.error('Error al guardar producto');
      return;
    }

    toast.success(
      editingProduct
        ? `Producto "${data.nombre}" actualizado correctamente`
        : `Producto "${data.nombre}" registrado correctamente`
    );

    cargarProductos();

    setIsModalOpen(false);
    setEditingProduct(null);

  } catch (error) {

    console.error(error);
    toast.error('Error de conexión con el servidor');

  }

};

  const handleConfirmDelete = async () => {

  if (!deleteTarget) return;

  try {

    const response = await fetch(
      'http://localhost/farmacia-api/eliminar_producto.php',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: deleteTarget.id,
          usuario: JSON.parse(sessionStorage.getItem('usuario') || '{}').nombre
        })
      }
    );

    const result = await response.json();

    if (!result.success) {
      toast.error('Error al eliminar producto');
      return;
    }

    toast.success(`"${deleteTarget.nombre}" eliminado correctamente`);

    cargarProductos();

    setDeleteTarget(null);

  } catch (error) {

    console.error(error);
    toast.error('Error de conexión');

  }

};

  const handleBulkDelete = () => {
    setProductosList((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    toast.success(`${selectedIds.size} producto(s) eliminados del inventario`);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((p) => p.id)));
    }
  };

  const applyStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    window.history.replaceState(
      null,
      '',
      status === 'Todos' ? '/inventory-management' : `/inventory-management?estado=${status}`
    );
  };
console.log("ROL EN EL COMPONENTE:", rol);
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gestión de Inventario</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {productosList.length} productos registrados · Actualizado hace 2 min
          </p>
        </div>
        {rol === 'admin' && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} />
            Registrar Producto
          </button>
        )}
      </div>

      {/* Alerts de aviso */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {bajoStock > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-warning-bg border border-warning/30">
            <AlertTriangle size={16} className="text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-warning">{bajoStock} Bajo Stock</p>
              <p className="text-xs text-warning/80">Requieren reorden urgente</p>
            </div>
          </div>
        )}
        {porVencer > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/10 border border-accent/30">
            <Clock size={16} className="text-accent flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-accent">{porVencer} Por Vencer</p>
              <p className="text-xs text-accent/80">Vencen en menos de 30 días</p>
            </div>
          </div>
        )}
        {agotados > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-danger-bg border border-danger/30">
            <AlertTriangle size={16} className="text-danger flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-danger">{agotados} Agotados</p>
              <p className="text-xs text-danger/80">Sin stock disponible</p>
            </div>
          </div>
        )}
      </div>

      {/* Filtrar */}
      <div className="card p-4">
        {selectedStatus !== 'Todos' && (
          <div className="mb-3 flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-primary">
              Mostrando {alertFilterLabels[selectedStatus] ?? statusLabels[selectedStatus].toLowerCase()}
            </p>
            <button
              type="button"
              onClick={() => applyStatusFilter('Todos')}
              className="self-start text-xs font-semibold text-primary underline underline-offset-2 hover:no-underline sm:self-auto"
            >
              Quitar filtro
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o laboratorio..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="input-field pl-9"
            />
          </div>
          <select
            value={selectedCategoria}
            onChange={(e) => { setSelectedCategoria(e.target.value); setCurrentPage(1); }}
            className="input-field sm:w-52"
          >
            {categorias.map((c) => (
              <option key={`cat-opt-${c}`} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => applyStatusFilter(e.target.value)}
            className="input-field sm:w-44"
          >
            {statusOptions.map((s) => (
              <option key={`status-opt-${s}`} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg slide-up">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size} producto(s) seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedIds(new Set())} className="btn-secondary text-xs py-1.5 px-3">
              Deseleccionar
            </button>
            <button onClick={handleBulkDelete} className="btn-danger text-xs py-1.5 px-3">
              Eliminar seleccionados
            </button>
          </div>
        </div>
      )}

      {/* tabla */}
      <InventoryTable
        productos={paginated}
        allSelected={selectedIds.size === paginated.length && paginated.length > 0}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rol={rol}
        totalItems={filtered.length}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
      />

      {/* Modal */}
      <ProductModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        open={deleteTarget !== null}
        productName={deleteTarget?.nombre ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
