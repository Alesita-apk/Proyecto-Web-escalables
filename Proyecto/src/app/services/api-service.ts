import { inject, Service } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Service()
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.baseUrl}${path}`, { headers: this.headers() }));
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(
      this.http.post<T>(`${this.baseUrl}${path}`, body, { headers: this.headers() }),
    );
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(
      this.http.put<T>(`${this.baseUrl}${path}`, body, { headers: this.headers() }),
    );
  }

  patch<T>(path: string, body: unknown = {}): Promise<T> {
    return firstValueFrom(
      this.http.patch<T>(`${this.baseUrl}${path}`, body, { headers: this.headers() }),
    );
  }

  delete(path: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}${path}`, { headers: this.headers() }),
    );
  }

  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem('autocine-token', token);
    } else {
      localStorage.removeItem('autocine-token');
    }
  }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('autocine-token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
