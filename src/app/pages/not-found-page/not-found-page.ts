import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-not-found-page',
  styleUrl: './not-found-page.css',
  templateUrl: './not-found-page.html',
})
export class NotFoundPage {}
