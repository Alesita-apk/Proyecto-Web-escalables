import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from './components/site-footer';
import { SiteHeader } from './components/site-header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  templateUrl: './app.html',
})
export class App {}
