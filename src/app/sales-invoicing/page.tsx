'use client';

import React from 'react';
import AppLayout from '../../components/AppLayout';
import SalesContent from './components/SalesContent';

export default function SalesInvoicingPage() {
  return (
    <AppLayout allowedRoles={['admin', 'vendedor']}>
      <SalesContent />
    </AppLayout>
  );
}
