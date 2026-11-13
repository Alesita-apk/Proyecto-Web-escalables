import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AutocineService } from '../../services/autocine-service';

@Component({
  selector: 'app-informacion-page',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './informacion-page.html',
  styleUrl: './informacion-page.css',
})
export class InformacionPage {
  readonly autocine = inject(AutocineService);
}
