import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AutocineService } from '../../services/autocine-service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
})
export class AuthPage {
  private readonly autocine = inject(AutocineService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  registro = false;
  mensaje = '';
  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  constructor() {
    this.route.url.subscribe((segments) => {
      this.registro = segments[0]?.path === 'registro';
      this.form.controls.nombre.setValidators(
        this.registro ? [Validators.required, Validators.minLength(2)] : [],
      );
      this.form.controls.nombre.updateValueAndValidity();
      this.mensaje = '';
      this.form.reset();
    });
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, correo, contrasena } = this.form.getRawValue();
    const usuario = this.registro
      ? this.autocine.registrar(nombre, correo, contrasena)
      : this.autocine.autenticar(correo, contrasena);
    if (!usuario) {
      this.mensaje = this.registro
        ? 'Ya existe una cuenta con ese correo.'
        : 'Correo o contraseña incorrectos.';
      return;
    }
    this.autocine.establecerUsuario(usuario);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const destinos: Record<string, string> = {
      cliente: '/cuenta',
      empleado: '/empleado',
      admin: '/admin',
    };
    const destinoSeguro =
      returnUrl?.startsWith('/') && !returnUrl.startsWith('//') && !returnUrl.includes('\\')
        ? returnUrl
        : destinos[usuario.rol];
    void this.router.navigateByUrl(destinoSeguro);
  }
}
