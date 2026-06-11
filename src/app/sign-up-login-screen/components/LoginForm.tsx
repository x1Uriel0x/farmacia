'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

const demoCredentials = [
  {
    id: 'cred-admin',
    role: 'Administrador',
    email: 'admin@pharmacontrol.ec',
    password: 'Admin#2026!',
    description: 'Acceso completo: inventario, ventas, usuarios, reportes',
    badgeClass: 'bg-info/10 text-info border border-info/20',
  },
  {
    id: 'cred-vendedor',
    role: 'Vendedor',
    email: 'vendedor@pharmacontrol.ec',
    password: 'Vend#2026!',
    description: 'Ventas y consulta de inventario',
    badgeClass: 'bg-primary/10 text-primary border border-primary/20',
  },
  {
    id: 'cred-consulta',
    role: 'Consulta',
    email: 'consulta@pharmacontrol.ec',
    password: 'Cons#2026!',
    description: 'Solo lectura: inventario y reportes',
    badgeClass: 'bg-muted text-muted-foreground border border-border',
  },
];

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAutofill = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    toast.info('Credenciales cargadas — haz clic en Iniciar Sesión');
  };

  // Backend integration point: POST /api/auth/login
 const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);

  try {

    const response = await fetch('http://localhost/farmacia-api/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo: data.email,
        password: data.password,
      }),
    });

    const result = await response.json();

    if (!result.success) {

      setIsLoading(false);

      setError('email', {
        type: 'manual',
        message: 'Correo o contraseña incorrectos',
      });

      return;
    }

    localStorage.setItem('usuario', JSON.stringify(result.usuario));

    toast.success('Sesión iniciada correctamente');

    setIsLoading(false);

    window.location.href = '/';

  } catch (error) {

    setIsLoading(false);

    toast.error('Error al conectar con el servidor');

  }
};
  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14a1 1 0 01-1-1v-3H8a1 1 0 010-2h3V8a1 1 0 012 0v3h3a1 1 0 010 2h-3v3a1 1 0 01-1 1z" />
          </svg>
        </div>
        <span className="font-semibold text-foreground">PharmaControl</span>
      </div>

      <h1 className="text-2xl font-semibold text-foreground mb-1">Iniciar Sesión</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Ingresa tus credenciales para acceder al sistema
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="label-text">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="usuario@farmacia.ec"
            className={`input-field ${errors.email ? 'border-danger focus:ring-danger' : ''}`}
            {...register('email', {
              required: 'El correo electrónico es requerido',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Ingresa un correo electrónico válido',
              },
            })}
          />
          {errors.email && (
            <p className="error-text">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="label-text">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input-field pr-10 ${errors.password ? 'border-danger focus:ring-danger' : ''}`}
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="error-text">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
            {...register('remember')}
          />
          <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
            Recordar sesión
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          style={{ minHeight: '42px' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verificando...</span>
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-8 border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cuentas de demostración
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Haz clic en un rol para autocompletar el formulario
          </p>
        </div>
        <div className="divide-y divide-border">
          {demoCredentials.map((cred) => (
            <div key={cred.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cred.badgeClass}`}>
                  {cred.role}
                </span>
                <button
                  type="button"
                  onClick={() => handleAutofill(cred.email, cred.password)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Usar esta cuenta
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{cred.description}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between bg-background rounded-md px-2.5 py-1.5 border border-border">
                  <span className="text-xs text-foreground font-mono truncate flex-1">{cred.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(cred.email, `${cred.id}-email`)}
                    className="ml-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    aria-label="Copiar email"
                  >
                    {copiedField === `${cred.id}-email` ? (
                      <Check size={12} className="text-success" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-background rounded-md px-2.5 py-1.5 border border-border">
                  <span className="text-xs text-foreground font-mono">{cred.password}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(cred.password, `${cred.id}-pass`)}
                    className="ml-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    aria-label="Copiar contraseña"
                  >
                    {copiedField === `${cred.id}-pass` ? (
                      <Check size={12} className="text-success" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
}