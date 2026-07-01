'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //localStorage.removeItem('usuario');

    const usuario = sessionStorage.getItem('usuario');

    if (!usuario) {
      router.replace('/sign-up-login-screen');
      return;
    }

    try {
      const datosUsuario = JSON.parse(usuario);
      const rol = String(datosUsuario.rol ?? '').toLowerCase();

      if (allowedRoles && !allowedRoles.map((role) => role.toLowerCase()).includes(rol)) {
        router.replace('/');
        return;
      }
    } catch {
      sessionStorage.removeItem('usuario');
      router.replace('/sign-up-login-screen');
      return;
    }

    setLoading(false);
  }, [allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando sesion...</p>
      </div>
    );
  }

  return <>{children}</>;
}
