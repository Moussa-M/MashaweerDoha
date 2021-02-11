import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { AuthService } from '../providers/services/auth';
import { OrderService } from '../providers/services/orderservice';
import { enableProdMode } from '@angular/core';

enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule,[AuthService,OrderService]);
