import React from 'react';
import AppLayout from '../../components/AppLayout';
import UserAdministrationContent from './components/UserAdministrationContent';

export default function UserAdministrationPage() {
  return (
    <AppLayout allowedRoles={['admin']}>
      <UserAdministrationContent />
    </AppLayout>
  );
}
