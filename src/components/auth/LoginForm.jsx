"use client";
import React, { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (session) {
        // Redirect based on user role
        if (session.user.role === 'admin') {
          router.push('/dashboards');
        } else {
          router.push(`/portal/${session.user.clientSlug || 'client'}`);
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Email ou senha incorretos');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
      } else if (result?.ok) {
        // Get updated session to check user role
        const session = await getSession();
        
        if (session?.user?.role === 'admin') {
          router.push('/dashboards');
        } else {
          router.push(`/portal/${session?.user?.clientSlug || 'client'}`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login options for development
  const quickLogin = async (userType) => {
    setLoading(true);
    
    const credentials = {
      admin: { email: 'admin@ninetwodash.com', password: 'admin123' },
      catalisti: { email: 'contato@catalisti.com.br', password: 'cliente123' },
    };

    const creds = credentials[userType];
    if (creds) {
      setFormData(creds);
      
      const result = await signIn('credentials', {
        email: creds.email,
        password: creds.password,
        redirect: false,
      });

      if (result?.ok) {
        const session = await getSession();
        if (session?.user?.role === 'admin') {
          router.push('/dashboards');
        } else {
          router.push(`/portal/${session?.user?.clientSlug || 'client'}`);
        }
      }
    }
    setLoading(false);
  };

  return (
    <section className='auth bg-base d-flex flex-wrap'>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='assets/images/auth/auth-img.png' alt='NINETWODASH' />
        </div>
      </div>
      
      <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div className='mb-32'>
            <Link href='/' className='mb-40 max-w-290-px d-block'>
              <img src='assets/images/logo.png' alt='NINETWODASH' />
            </Link>
            <h4 className='mb-12'>Acesse seu Dashboard</h4>
            <p className='mb-32 text-secondary-light text-lg'>
              Bem-vindo ao NINETWODASH! Faça login para continuar
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mb-24 d-flex align-items-center">
              <Icon icon="solar:danger-circle-bold" className="me-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:email' />
              </span>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Email'
                required
                disabled={loading}
              />
            </div>

            <div className='position-relative mb-20'>
              <div className='icon-field'>
                <span className='icon top-50 translate-middle-y'>
                  <Icon icon='solar:lock-password-outline' />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  className='form-control h-56-px bg-neutral-50 radius-12'
                  placeholder='Senha'
                  required
                  disabled={loading}
                />
              </div>
              <span
                className='toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light'
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </span>
            </div>

            <div className='d-flex align-items-center justify-content-between mb-32'>
              <div className='form-check style-check d-flex align-items-center'>
                <input
                  className='form-check-input radius-4 border input-form-dark'
                  type='checkbox'
                  name='remember'
                  id='remember'
                />
                <label className='form-check-label text-secondary-light' htmlFor='remember'>
                  Lembrar de mim
                </label>
              </div>
              <Link
                href='/forgot-password'
                className='text-primary-600 fw-medium'
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type='submit'
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Entrando...
                </>
              ) : (
                <>
                  <Icon icon="solar:login-2-bold" className="me-2" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Quick Login for Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-32 pt-24 border-top">
              <p className="text-center text-secondary-light mb-16 text-sm">
                Acesso rápido (desenvolvimento):
              </p>
              <div className="d-flex gap-12">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm flex-fill"
                  onClick={() => quickLogin('admin')}
                  disabled={loading}
                >
                  <Icon icon="solar:user-bold" className="me-1" />
                  Admin
                </button>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm flex-fill"
                  onClick={() => quickLogin('catalisti')}
                  disabled={loading}
                >
                  <Icon icon="solar:buildings-bold" className="me-1" />
                  Cliente
                </button>
              </div>
            </div>
          )}

          <div className='mt-32 text-center'>
            <span className='text-secondary-light text-sm'>
              Não tem uma conta?{' '}
              <Link href='/sign-up' className='text-primary-600 fw-semibold'>
                Entre em contato
              </Link>
            </span>
          </div>

          {/* System Info */}
          <div className="mt-40 text-center">
            <p className="text-secondary-light text-xs mb-8">
              NINETWODASH v1.0 - Dashboard de Marketing Digital
            </p>
            <p className="text-secondary-light text-xs">
              <Icon icon="solar:buildings-2-bold" className="me-1" />
              Catalisti Holdings / M2Z Agency
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;