'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { ShoppingCart, Package, AlertTriangle, User } from 'lucide-react';
import Badge from '../../components/ui/Badge';



export default function DashboardActivity() {

  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    cargarActividades();
  }, []);

const cargarActividades = async () => {
  try {

    const response = await fetch(
      'http://localhost/farmacia-api/actividad.php'
    );

    const data = await response.json();

    console.log(data);

    setActivities(data);

  } catch (error) {

    console.error(error);

  }
};
  return (
    <div className="card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="section-header">Actividad Reciente</h2>
        <span className="text-xs text-muted-foreground">
          Actualizado hace 2 min
        </span>
      </div>

      <div className="divide-y divide-border">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
          >
            <div className="p-2 rounded-lg flex-shrink-0 bg-primary/10 text-primary">
              <Package size={14} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {item.titulo}
              </p>

              <p className="text-xs text-muted-foreground">
                {item.descripcion}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Por <strong>{item.usuario}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}