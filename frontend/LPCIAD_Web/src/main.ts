import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { App} from './app/app';
import { routes } from './app/app.routes'; 

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(), 
    provideRouter(routes || []) 
  ]
}).catch(err => console.error(err));
