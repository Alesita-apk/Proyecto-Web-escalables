import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutocineService } from '../../services/autocine-service';

type AdminTab =
  'resumen' | 'peliculas' | 'funciones' | 'dulceria' | 'cajones' | 'empleados' | 'reportes';
type Editor = 'pelicula' | 'funcion' | 'alimento' | 'empleado' | null;

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {
  readonly autocine = inject(AutocineService);
  readonly secciones: { id: AdminTab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'peliculas', label: 'Películas' },
    { id: 'funciones', label: 'Funciones' },
    { id: 'dulceria', label: 'Dulcería' },
    { id: 'cajones', label: 'Cajones' },
    { id: 'empleados', label: 'Empleados' },
    { id: 'reportes', label: 'Reportes' },
  ];
  tab: AdminTab = 'resumen';
  editor: Editor = null;
  editId: number | null = null;
  mensaje = '';
  readonly peliculaForm = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sinopsis: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    genero: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    duracion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    clasificacion: new FormControl('A', { nonNullable: true, validators: [Validators.required] }),
    imagen: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly funcionForm = new FormGroup({
    peliculaId: new FormControl(1, { nonNullable: true, validators: [Validators.min(1)] }),
    fecha: new FormControl(new Date().toISOString().slice(0, 10), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    horario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly alimentoForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    categoria: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    precio: new FormControl(0, { nonNullable: true, validators: [Validators.min(0.01)] }),
    existencias: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
  });
  readonly empleadoForm = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });
  get empleados() {
    const actor = this.autocine.usuarioActual();
    return actor ? this.autocine.empleados(actor) : [];
  }
  get ventas() {
    return this.autocine.reservas().reduce((suma, r) => suma + r.total, 0);
  }
  get cajonesVendidos() {
    return this.autocine.reservas().reduce((suma, r) => suma + r.cajones.length, 0);
  }
  get productosVendidos() {
    return this.autocine
      .reservas()
      .reduce((suma, r) => suma + r.alimentos.reduce((n, a) => n + a.cantidad, 0), 0);
  }
  peliculaNombre(id: number) {
    return this.autocine.peliculas().find((p) => p.id === id)?.titulo ?? 'Película eliminada';
  }
  abrir(tipo: Exclude<Editor, null>, id?: number): void {
    this.editor = tipo;
    this.editId = id ?? null;
    this.mensaje = '';
    if (tipo === 'pelicula') {
      const p = this.autocine.peliculas().find((item) => item.id === id);
      this.peliculaForm.setValue({
        titulo: p?.titulo ?? '',
        sinopsis: p?.sinopsis ?? '',
        genero: p?.genero ?? '',
        duracion: p?.duracion ?? '',
        clasificacion: p?.clasificacion ?? 'A',
        imagen: p?.imagen ?? '',
      });
    } else if (tipo === 'funcion') {
      const f = this.autocine.funciones().find((item) => item.id === id);
      this.funcionForm.setValue({
        peliculaId: f?.peliculaId ?? this.autocine.peliculas()[0]?.id ?? 0,
        fecha: f?.fecha ?? new Date().toISOString().slice(0, 10),
        horario: f?.horario ?? '',
      });
    } else if (tipo === 'alimento') {
      const a = this.autocine.alimentos().find((item) => item.id === id);
      this.alimentoForm.setValue({
        nombre: a?.nombre ?? '',
        descripcion: a?.descripcion ?? '',
        categoria: a?.categoria ?? '',
        precio: a?.precio ?? 0,
        existencias: a?.existencias ?? 0,
      });
    } else this.empleadoForm.reset();
  }
  private actor() {
    return this.autocine.usuarioActual()!;
  }
  private cerrarEditor(mensaje: string) {
    this.mensaje = mensaje;
    this.editor = null;
    this.editId = null;
  }
  guardarPelicula(): void {
    if (this.peliculaForm.invalid) {
      this.peliculaForm.markAllAsTouched();
      return;
    }
    const datos = this.peliculaForm.getRawValue();
    const ok =
      this.editId === null
        ? !!this.autocine.agregarPelicula(this.actor(), datos)
        : this.autocine.actualizarPelicula(this.actor(), this.editId, datos);
    this.cerrarEditor(ok ? 'Película guardada.' : 'No fue posible guardar la película.');
  }
  guardarFuncion(): void {
    if (this.funcionForm.invalid) {
      this.funcionForm.markAllAsTouched();
      return;
    }
    const datos = this.funcionForm.getRawValue();
    const ok =
      this.editId === null
        ? !!this.autocine.agregarFuncion(this.actor(), datos)
        : this.autocine.actualizarFuncion(this.actor(), this.editId, datos);
    this.cerrarEditor(
      ok ? 'Función guardada.' : 'No se guardó: revisa la película, horario o reservas existentes.',
    );
  }
  guardarAlimento(): void {
    if (this.alimentoForm.invalid) {
      this.alimentoForm.markAllAsTouched();
      return;
    }
    const datos = this.alimentoForm.getRawValue();
    const ok =
      this.editId === null
        ? !!this.autocine.agregarAlimento(this.actor(), datos)
        : this.autocine.actualizarAlimento(this.actor(), this.editId, datos);
    this.cerrarEditor(ok ? 'Producto guardado.' : 'No fue posible guardar el producto.');
  }
  guardarEmpleado(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }
    const employee = this.autocine.crearEmpleado(this.actor(), this.empleadoForm.getRawValue());
    this.cerrarEditor(
      employee ? `Cuenta creada para ${employee.correo}.` : 'Ese correo ya está registrado.',
    );
  }
  eliminarPelicula(id: number): void {
    this.mensaje = this.autocine.eliminarPelicula(this.actor(), id)
      ? 'Película eliminada.'
      : 'No se puede eliminar: hay funciones que dependen de esta película.';
  }
  eliminarFuncion(id: number): void {
    this.mensaje = this.autocine.eliminarFuncion(this.actor(), id)
      ? 'Función eliminada.'
      : 'No se puede eliminar: la función tiene reservas.';
  }
  eliminarAlimento(id: number): void {
    this.mensaje = this.autocine.eliminarAlimento(this.actor(), id)
      ? 'Producto eliminado.'
      : 'No fue posible eliminar el producto.';
  }
  reservado(id: string): boolean {
    return this.autocine.reservas().some((r) => r.cajones.includes(id));
  }
  cambiarTipo(id: string): void {
    const c = this.autocine.cajones().find((x) => x.id === id);
    if (c)
      this.autocine.cambiarTipoCajon(
        this.actor(),
        id,
        c.tipoVehiculo === 'Automóvil' ? 'Vehículo accesible' : 'Automóvil',
      );
  }
}
