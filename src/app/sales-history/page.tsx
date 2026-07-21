import React from 'react';
import AppLayout from '../../components/AppLayout';
import SalesHistoryContent from './components/SalesHistoryContent';

export default function SalesHistoryPage() {
  return (
    <AppLayout allowedRoles={['admin', 'vendedor']}>
      <SalesHistoryContent />
    </AppLayout>
  );
}
