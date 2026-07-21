'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ReceiptText,
  BarChart3,
  DatabaseBackup,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  group: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Panel Principal',
    href: '/',
    icon: <LayoutDashboard size={18} />,
    group: 'principal',
  },
  {
    id: 'nav-inventory',
    label: 'Inventario',
    href: '/inventory-management',
    icon: <Package size={18} />,
    group: 'operaciones',
  },
  {
    id: 'nav-sales',
    label: 'Ventas y Facturacion',
    href: '/sales-invoicing',
    icon: <ShoppingCart size={18} />,
    group: 'operaciones',
  },
  {
    id: 'nav-sales-history',
    label: 'Historial de Ventas',
    href: '/sales-history',
    icon: <ReceiptText size={18} />,
    group: 'operaciones',
    roles: ['admin', 'vendedor'],
  },
  {
    id: 'nav-users',
    label: 'Usuarios',
    href: '/user-administration',
    icon: <UserCog size={18} />,
    group: 'administracion',
    roles: ['admin'],
  },
  {
    id: 'nav-reports',
    label: 'Reportes',
    href: '/reports',
    icon: <BarChart3 size={18} />,
    group: 'administracion',
    roles: ['admin'],
  },
  {
    id: 'nav-backup-restore',
    label: 'Respaldo BD',
    href: '/backup-restore',
    icon: <DatabaseBackup size={18} />,
    group: 'administracion',
    roles: ['admin'],
  },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const [rol, setRol] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('Farmacia');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => {
      const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
      setRol(String(usuario.rol || '').toLowerCase());
      setNombreUsuario(String(usuario.nombre || usuario.usuario || usuario.email || usuario.correo || 'Farmacia'));
    });
  }, []);

  const visibleNavItems = navItems.filter((item) => {
    if (item.roles && !item.roles.includes(rol)) return false;
    if (rol === 'consulta' && item.href === '/sales-invoicing') return false;
    return true;
  });

  const groups = [
    { key: 'principal', label: 'Principal' },
    { key: 'operaciones', label: 'Operaciones' },
    { key: 'administracion', label: 'Administracion' },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('usuario');
    localStorage.removeItem('usuario');
    router.replace('/sign-up-login-screen');
  };

  return (
    <>
      <aside
        className={`
          hidden lg:flex flex-col bg-[#1E3A8A] border-r border-[#1E3A8A] sidebar-transition relative z-10
          ${collapsed ? 'w-16' : 'w-60'}
        `}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          pathname={pathname}
          navItems={visibleNavItems}
          groups={groups}
          rol={rol}
          nombreUsuario={nombreUsuario}
          onLogout={handleLogout}
        />
      </aside>

      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-[#1E3A8A] border-r border-[#1E3A8A]
          transition-transform duration-300 ease-in-out flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AppLogo size={32} />
            <span className="font-semibold text-white text-sm">PharmaControl</span>
          </div>
          <button onClick={onMobileClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <ChevronLeft size={16} className="text-blue-100" />
          </button>
        </div>
        <SidebarContent
          collapsed={false}
          onToggleCollapse={() => {}}
          pathname={pathname}
          navItems={visibleNavItems}
          groups={groups}
          rol={rol}
          nombreUsuario={nombreUsuario}
          isMobile
          onMobileClose={onMobileClose}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  pathname: string;
  navItems: NavItem[];
  groups: { key: string; label: string }[];
  rol: string;
  nombreUsuario: string;
  onLogout: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
  pathname,
  navItems,
  groups,
  rol,
  nombreUsuario,
  onLogout,
  isMobile,
  onMobileClose,
}: SidebarContentProps) {
  const rolVisible = rol
    ? rol.charAt(0).toUpperCase() + rol.slice(1)
    : 'Usuario';

  return (
    <div className="flex flex-col h-full">
      {!isMobile && (
        <div className={`flex items-center border-b border-white/10 px-3 py-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <AppLogo size={32} />
              <span className="font-semibold text-white text-sm leading-tight">PharmaControl</span>
            </div>
          )}
          {collapsed && <AppLogo size={32} />}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Colapsar sidebar"
            >
              <ChevronLeft size={16} className="text-blue-100" />
            </button>
          )}
        </div>
      )}

      {collapsed && !isMobile && (
        <button
          onClick={onToggleCollapse}
          className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Expandir sidebar"
        >
          <ChevronRight size={16} className="text-blue-100" />
        </button>
      )}

      <nav className="flex-1 px-2 py-3 overflow-y-auto no-scrollbar">
        {groups.map((group) => {
          const groupItems = navItems.filter((item) => item.group === group.key);
          if (groupItems.length === 0) return null;

          return (
            <div key={`group-${group.key}`} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-semibold text-blue-100/80 uppercase tracking-wider px-3 mb-1.5">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="border-t border-white/10 mx-2 mb-2" />}
              {groupItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={isMobile ? onMobileClose : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`
                      nav-item mb-0.5 relative
                      ${isActive ? 'nav-item-active' : ''}
                      ${collapsed ? 'justify-center px-2' : ''}
                    `}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span className="ml-auto bg-warning text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-warning" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={`border-t border-white/10 px-2 py-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed ? (
          <>
            <Link
              href="/profile"
              onClick={isMobile ? onMobileClose : undefined}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#06B6D4] flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{nombreUsuario}</p>
                <p className="text-xs text-blue-100 truncate">{rolVisible}</p>
              </div>
              <Bell size={14} className="text-blue-100 flex-shrink-0" />
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="nav-item mt-1 w-full text-red-100 hover:bg-red-500/15 hover:text-white"
            >
              <LogOut size={16} />
              <span>Cerrar Sesion</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/profile"
              onClick={isMobile ? onMobileClose : undefined}
              className="w-8 h-8 rounded-full bg-[#06B6D4] flex items-center justify-center cursor-pointer"
              title={`Farmacia - ${rolVisible}`}
            >
              <User size={14} className="text-primary-foreground" />
            </Link>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Configuracion">
              <Settings size={16} className="text-blue-100" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-500/15 transition-colors"
              title="Cerrar Sesion"
            >
              <LogOut size={16} className="text-red-100" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
