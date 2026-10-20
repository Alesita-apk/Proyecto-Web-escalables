import { inject } from '@angular/core';
import { CanActivateFn, Routes, Router } from '@angular/router';
import { RolUsuario } from './interfaces/autocine.interface';
import { AdminPage } from './pages/admin-page/admin-page';
import { AuthPage } from './pages/auth-page/auth-page';
import { CheckoutPage } from './pages/checkout-page/checkout-page';
import { CarteleraPage } from './pages/cartelera-page/cartelera-page';
import { HomePage } from './pages/home-page/home-page';
import { InformacionPage } from './pages/informacion-page/informacion-page';
import { AccountPage } from './pages/account-page/account-page';
import { StaffPage } from './pages/staff-page/staff-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { AutocineService } from './services/autocine-service';

const roleGuard =
  (roles: RolUsuario[]): CanActivateFn =>
  (_route, state) => {
    const router = inject(Router);
    const usuario = inject(AutocineService).usuarioActual();
    if (usuario && roles.includes(usuario.rol)) return true;
    if (!usuario)
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    const destinoPorRol: Record<RolUsuario, string> = {
      cliente: '/cuenta',
      empleado: '/empleado',
      admin: '/admin',
    };
    return router.parseUrl(destinoPorRol[usuario.rol]);
  };

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Inicio | Autocine Luna' },
  { path: 'cartelera', component: CarteleraPage, title: 'Cartelera | Autocine Luna' },
  { path: 'informacion', component: InformacionPage, title: 'Información | Autocine Luna' },
  { path: 'login', component: AuthPage, title: 'Iniciar sesión | Autocine Luna' },
  { path: 'registro', component: AuthPage, title: 'Registro | Autocine Luna' },
  {
    path: 'compra/:funcionId',
    component: CheckoutPage,
    canActivate: [roleGuard(['cliente'])],
    title: 'Reservar | Autocine Luna',
  },
  {
    path: 'cuenta',
    component: AccountPage,
    canActivate: [roleGuard(['cliente'])],
    title: 'Mi cuenta | Autocine Luna',
  },
  {
    path: 'empleado',
    component: StaffPage,
    canActivate: [roleGuard(['empleado'])],
    title: 'Panel empleado | Autocine Luna',
  },
  {
    path: 'admin',
    component: AdminPage,
    canActivate: [roleGuard(['admin'])],
    title: 'Administración | Autocine Luna',
  },
  { path: '**', component: NotFoundPage, title: 'Página no encontrada | Autocine Luna' },
];
