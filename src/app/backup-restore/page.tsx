import React from 'react';
import AppLayout from '../../components/AppLayout';
import BackupRestoreContent from './components/BackupRestoreContent';

export default function BackupRestorePage() {
  return (
    <AppLayout allowedRoles={['admin']}>
      <BackupRestoreContent />
    </AppLayout>
  );
}
