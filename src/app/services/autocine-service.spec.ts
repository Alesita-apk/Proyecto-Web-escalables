import { TestBed } from '@angular/core/testing';
import { AutocineService } from './autocine-service';

describe('AutocineService', () => {
  let service: AutocineService;
  let cliente: NonNullable<ReturnType<AutocineService['autenticar']>>;
  let empleado: NonNullable<ReturnType<AutocineService['autenticar']>>;
  let administrador: NonNullable<ReturnType<AutocineService['autenticar']>>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutocineService);
    cliente = service.autenticar('cliente@autocine.mx', '123456')!;
    empleado = service.autenticar('empleado@autocine.mx', '123456')!;
    administrador = service.autenticar('admin@autocine.mx', '123456')!;
  });

  it('authenticates the sample customer account', () => {
    expect(cliente.rol).toBe('cliente');
  });

  it('registers a customer and rejects duplicate email addresses', () => {
    const usuario = service.registrar('Ana Luna', 'ana@example.com', 'abcdef');
    expect(usuario?.nombre).toBe('Ana Luna');
    expect(service.registrar('Otra persona', 'ANA@example.com', 'abcdef')).toBeNull();
  });

  it('allows customers to edit their profile and manage only their own vehicles', () => {
    const actualizado = service.actualizarPerfil(cliente, 'Cliente Luna', 'nuevo@autocine.mx');
    expect(actualizado?.correo).toBe('nuevo@autocine.mx');

    expect(
      service.guardarVehiculo(actualizado!, {
        modelo: 'Sedán',
        color: 'Azul',
        placas: 'XYZ-123',
      }),
    ).toBe(true);
    expect(service.vehiculosDe(actualizado!).some((vehiculo) => vehiculo.placas === 'XYZ-123')).toBe(true);
    expect(
      service.guardarVehiculo(empleado, {
        modelo: 'Camioneta',
        color: 'Negro',
        placas: 'EMP-123',
      }),
    ).toBe(false);
  });

  it('creates a reservation with its function, spaces and food items', () => {
    const funcion = service.funciones().find((actual) => actual.peliculaId === 1)!;
    const reserva = service.crearReserva(cliente, funcion.id, ['A1', 'A2'], { 1: 1 });

    expect(reserva?.total).toBe(495);
    expect(reserva?.funcionId).toBe(funcion.id);
    expect(reserva?.alimentos[0]).toMatchObject({
      alimentoId: 1,
      cantidad: 1,
      entregado: false,
    });
    expect(service.alimentos().find((alimento) => alimento.id === 1)?.existencias).toBe(39);
    expect(service.obtenerCajonesOcupados(funcion.id)).toContain('A1');
  });

  it('rejects reservations by a visitor, an employee, or for unavailable spaces', () => {
    const funcion = service.funciones()[0];
    expect(service.crearReserva(empleado, funcion.id, ['A1'], {})).toBeNull();
    expect(service.crearReserva(cliente, funcion.id, ['A3'], {})).toBeNull();
    expect(service.crearReserva(cliente, funcion.id, ['A1', 'A1'], {})).toBeNull();
  });

  it('allows only administrators to manage the catalog', () => {
    const datos = {
      titulo: 'Nueva película',
      sinopsis: 'Sinopsis',
      genero: 'Drama',
      duracion: '90 min',
      clasificacion: 'A',
      imagen: 'https://example.com/poster.jpg',
    };
    expect(service.agregarPelicula(empleado, datos)).toBeNull();
    const pelicula = service.agregarPelicula(administrador, datos);
    expect(pelicula?.titulo).toBe(datos.titulo);
    expect(service.peliculas()).toContain(pelicula);
  });

  it('creates employee accounts for administrators only', () => {
    const datos = {
      nombre: 'Acomodador Uno',
      correo: 'acomodador@example.com',
      contrasena: 'temporal123',
    };
    expect(service.crearEmpleado(cliente, datos)).toBeNull();
    const creado = service.crearEmpleado(administrador, datos);
    expect(creado?.rol).toBe('empleado');
    expect(service.empleados(administrador).some((usuario) => usuario.id === creado?.id)).toBe(true);
    expect(service.autenticar(datos.correo, datos.contrasena)?.id).toBe(creado?.id);
  });

  it('reserves inventory and does not allow ordering more than available', () => {
    const funcion = service.funciones()[0];
    const disponible = service.alimentos().find((alimento) => alimento.id === 1)!.existencias;
    expect(
      service.crearReserva(cliente, funcion.id, ['A1'], { 1: disponible + 1 }),
    ).toBeNull();
    expect(service.alimentos().find((alimento) => alimento.id === 1)?.existencias).toBe(disponible);
  });

  it('validates access once and independently records food delivery', () => {
    const funcion = service.funciones()[1];
    const reserva = service.crearReserva(cliente, funcion.id, ['A1'], { 4: 1 })!;

    expect(service.validarAcceso(cliente, reserva.codigo)).toBeNull();
    expect(service.validarAcceso(empleado, reserva.codigo)?.estado).toBe('acceso-validado');
    expect(service.validarAcceso(empleado, reserva.codigo)).toBeNull();
    expect(service.validarEntregaDulceria(empleado, reserva.codigo)?.alimentos[0].entregado).toBe(true);
    expect(service.validarEntregaDulceria(empleado, reserva.codigo)).toBeNull();
  });

  it('prevents removing a movie with scheduled screenings', () => {
    expect(service.eliminarPelicula(administrador, 1)).toBe(false);
  });
});
