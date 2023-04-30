import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';
import { Status } from '../enum/status.enum';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private readonly appUrl = 'http://localhost:9111';

  constructor(private http: HttpClient) { }

  //procedural approcah
  // getServers(): Observable<CustomResponse> {
  //   return this.http.get<CustomResponse>('http://localhost:9111/server/list');
  // }

  //reactive approach
  //get all servers
  servers$ = <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.appUrl}/server/list`)
      .pipe(
        tap(console.log),
        catchError(this.handleErrors)
      );

  //save server
  save$ = (server: Server) => <Observable<CustomResponse>>
    this.http.post<CustomResponse>(`${this.appUrl}/server/save`, server)
      .pipe(
        tap(console.log),
        catchError(this.handleErrors)
      );

  //ping server
  ping$ = (ipAddress: string) => <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.appUrl}/server/ping/${ipAddress}`)
      .pipe(
        tap(console.log),
        catchError(this.handleErrors)
      );

  //filter servers
  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      subscriber => {
        console.log(response);
        subscriber.next(
          status === Status.ALL ? { ...response, message: `Servers filtered by ${status} status` } :
            {
              ...response,
              message: response.data.servers.filter(server => server.status === status).length > 0 ? `Servers filtered by
          ${status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'} status` : `No servers of ${status} found`,
              data: { servers: response.data.servers.filter(server => server.status === status) }
            }
        );
        subscriber.complete();
      }
    )
      .pipe(
        tap(console.log),
        catchError(this.handleErrors)
      );

  //delete server
  delete$ = (serverId: number) => <Observable<CustomResponse>>
    this.http.delete<CustomResponse>(`${this.appUrl}/server/delete/${serverId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleErrors)
      );

  private handleErrors(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured - Error code: ${error.status}`);
  }
}
