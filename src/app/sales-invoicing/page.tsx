'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import SalesContent from './components/SalesContent';

export default function SalesInvoicingPage() {
  const router = useRouter();

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');

    if (!usuario) {
      router.replace('/sign-up-login-screen');
      return;
    }

    const datosUsuario = JSON.parse(usuario);

    // El rol consulta no puede acceder al módulo de ventas
    if (datosUsuario.rol === 'consulta') {
      router.replace('/');
    }
  }, [router]);

  return (
    <AppLayout>
      <SalesContent />
    </AppLayout>
  );
}