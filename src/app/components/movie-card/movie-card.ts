import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Funcion, Pelicula, RolUsuario } from '../../interfaces/autocine.interface';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-movie-card',
  styleUrl: './movie-card.css',
  templateUrl: './movie-card.html',
})
export class MovieCard {
  pelicula = input.required<Pelicula>();
  funciones = input.required<Funcion[]>();
  rol = input.required<RolUsuario | null>();
  seleccionarFuncion = output<Funcion>();

  solicitarCompra(funcion: Funcion): void {
    this.seleccionarFuncion.emit(funcion);
  }
}
