import React from 'react';
import LoginForm from './components/LoginForm';

export default function SignUpLoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-primary flex-col justify-between p-10 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14a1 1 0 01-1-1v-3H8a1 1 0 010-2h3V8a1 1 0 012 0v3h3a1 1 0 010 2h-3v3a1 1 0 01-1 1z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-xl">PharmaControl</span>
        </div>

        {/* Main copy */}
        <div className="relative">
          <h2 className="text-white font-bold text-4xl leading-tight mb-4">
            Control total de tu farmacia
          </h2>
          <p className="text-white/80 text-base leading-relaxed mb-8">
            Gestiona inventario, emite facturas y controla el acceso de tu equipo desde un solo sistema diseñado para farmacias.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {[
              'Inventario en tiempo real con alertas de stock',
              'Facturación con IVA automático y PDF',
              'Control de acceso por roles de usuario',
            ]?.map((feature, i) => (
              <div key={`feature-${i + 1}`} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-white/50 text-xs">© 2026 PharmaControl · Todos los derechos reservados</p>
        </div>
      </div>
      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-background">
        <LoginForm />
      </div>
    </div>
  );
}