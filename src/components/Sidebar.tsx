'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
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
    badge: 3,
    group: 'operaciones',
  },
  {
    id: 'nav-sales',
    label: 'Ventas y Facturacion',
    href: '/sales-invoicing',
    icon: <ShoppingCart size={18} />,
    group: 'operaciones',
  },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const [rol, setRol] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
    setRol(String(usuario.rol || '').toLowerCase());
  }, []);

  const visibleNavItems = rol === 'consulta'
    ? navItems.filter((item) => item.href !== '/sales-invoicing')
    : navItems;

  const groups = [
    { key: 'principal', label: 'Principal' },
    { key: 'operaciones', label: 'Operaciones' },
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
          hidden lg:flex flex-col bg-card border-r border-border sidebar-transition relative z-10
          ${collapsed ? 'w-16' : 'w-60'}
        `}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          pathname={pathname}
          navItems={visibleNavItems}
          groups={groups}
          onLogout={handleLogout}
        />
      </aside>

      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border
          transition-transform duration-300 ease-in-out flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AppLogo size={32} />
            <span className="font-semibold text-foreground text-sm">PharmaControl</span>
          </div>
          <button onClick={onMobileClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
        </div>
        <SidebarContent
          collapsed={false}
          onToggleCollapse={() => {}}
          pathname={pathname}
          navItems={visibleNavItems}
          groups={groups}
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
  onLogout,
  isMobile,
  onMobileClose,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {!isMobile && (
        <div className={`flex items-center border-b border-border px-3 py-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <AppLogo size={32} />
              <span className="font-semibold text-foreground text-sm leading-tight">PharmaControl</span>
            </div>
          )}
          {collapsed && <AppLogo size={32} />}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Colapsar sidebar"
            >
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {collapsed && !isMobile && (
        <button
          onClick={onToggleCollapse}
          className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Expandir sidebar"
        >
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      )}

      <nav className="flex-1 px-2 py-3 overflow-y-auto no-scrollbar">
        {groups.map((group) => {
          const groupItems = navItems.filter((item) => item.group === group.key);
          if (groupItems.length === 0) return null;

          return (
            <div key={`group-${group.key}`} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1.5">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="border-t border-border mx-2 mb-2" />}
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

      <div className={`border-t border-border px-2 py-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">Admin Farmacia</p>
                <p className="text-xs text-muted-foreground truncate">Administrador</p>
              </div>
              <Bell size={14} className="text-muted-foreground flex-shrink-0" />
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="nav-item mt-1 w-full text-danger hover:bg-danger-bg hover:text-danger"
            >
              <LogOut size={16} />
              <span>Cerrar Sesion</span>
            </button>
          </>
        ) : (
          <>
            <div
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer"
              title="Admin Farmacia"
            >
              <User size={14} className="text-primary-foreground" />
            </div>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Configuracion">
              <Settings size={16} className="text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-danger-bg transition-colors"
              title="Cerrar Sesion"
            >
              <LogOut size={16} className="text-danger" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
