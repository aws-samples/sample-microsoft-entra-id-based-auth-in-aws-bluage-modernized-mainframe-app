import { enableProdMode, isDevMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as bootstrap from 'bootstrap';
import * as $ from 'jquery';


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });
