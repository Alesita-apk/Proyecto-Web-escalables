import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { App } from './app';
import { routes } from './app.routes';
import { RouterTestingHarness } from '@angular/router/testing';
import { HomePage } from './pages/home-page/home-page';
import { CarteleraPage } from './pages/cartelera-page/cartelera-page';
import { AuthPage } from './pages/auth-page/auth-page';
import { StaffPage } from './pages/staff-page/staff-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { AutocineService } from './services/autocine-service';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  const loadSite = async (): Promise<void> => {
    const initialization = TestBed.inject(AutocineService).inicializar();
    await Promise.resolve();
    http.expectOne('http://localhost:8080/api/site').flush({
      peliculas: [
        {
          id: 1,
          titulo: 'Prueba',
          sinopsis: 'Sinopsis',
          genero: 'Drama',
          duracion: '90 min',
          clasificacion: 'A',
          imagen: 'https://example.com/movie.jpg',
        },
      ],
      funciones: [],
      cajones: [],
      alimentos: [],
      precioPorCajon: 200,
    });
    await initialization;
  };

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the application shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.brand strong')?.textContent,
    ).toContain('Autocine Luna');
    expect((fixture.nativeElement as HTMLElement).querySelector('router-outlet')).toBeTruthy();
  });

  it('should render only the landing page on the home route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', HomePage);
    expect(harness.routeNativeElement?.querySelector('.hero h1')?.textContent).toContain(
      'Cine bajo',
    );
    expect(harness.routeNativeElement?.querySelector('.movie-grid')).toBeNull();
  });

  it('should open the movie listings on the Cartelera route', async () => {
    await loadSite();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/cartelera', CarteleraPage);
    expect(harness.routeNativeElement?.querySelector('main h1')?.textContent).toContain(
      'Cartelera',
    );
    expect(harness.routeNativeElement?.querySelectorAll('.movie-card').length).toBeGreaterThan(0);
  });

  it('should show a not-found page for unknown routes', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/ruta-que-no-existe', NotFoundPage);
    expect(harness.routeNativeElement?.textContent).toContain('No encontramos esta página');
  });

  it('should keep a protected destination when a visitor needs to sign in', async () => {
    const initialization = TestBed.inject(AutocineService).inicializar();
    await Promise.resolve();
    http.expectOne('http://localhost:8080/api/site').flush({
      peliculas: [],
      funciones: [],
      cajones: [],
      alimentos: [],
      precioPorCajon: 200,
    });
    await initialization;
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/compra/1', AuthPage);
    expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2Fcompra%2F1');
  });

  it('should redirect an authenticated user to their own role page', async () => {
    const autocine = TestBed.inject(AutocineService);
    autocine.establecerUsuario({
      id: 2,
      nombre: 'Empleado de prueba',
      correo: 'empleado@autocine.mx',
      rol: 'empleado',
    });
    vi.spyOn(autocine, 'inicializar').mockResolvedValue();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin', StaffPage);
    expect(TestBed.inject(Router).url).toBe('/empleado');
  });
});
