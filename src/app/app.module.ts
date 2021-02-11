
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule, JsonpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';

import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { Toast } from '@ionic-native/toast';

import { Keyboard } from '@ionic-native/keyboard';

import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import { AddorderPage } from '../pages/addorder/addorder';
import { WelcomePage } from '../pages/welcome/welcome';
import { LoginPage } from '../pages/login/login';
import { OrderLoginPage } from '../pages/orderlogin/orderlogin';
import { MorePage } from '../pages/more/more';
import { OrderNotificationsPage } from '../pages/ordernotifications/ordernotifications';
import { OrderDetailsPage } from '../pages/orderdetails/orderdetails';
import { NewOrderPage } from '../pages/neworder/neworder';
import { EstimatedPricePage } from '../pages/estimatedprice/estimatedprice';
import { NewOrderPackagePage } from '../pages/neworderpackage/neworderpackage';
import { NewOrderPackageInfo } from '../pages/neworderpackageinfo/neworderpackageinfo';
import { NewOrderTimePage } from '../pages/newordertime/newordertime';
import { EditOrderPage } from '../pages/editorder/editorder';
import { SettingsPage } from '../pages/settings/settings';
import { AccountPage } from '../pages/account/account';
import { TrackPage } from '../pages/track/track';
import { TrackInfoPage } from '../pages/trackinfo/trackinfo';
import { RatingPage } from '../pages/rating/rating';
import { IntroPage } from '../pages/intro/intro';
import { ProfilePage } from '../pages/profile/profile';
import { LocationEditPage } from '../pages/locationedit/locationedit';
import { PackageEditPage } from '../pages/packageedit/packageedit';
import { TimeEditPage } from '../pages/timeedit/timeedit';
import { RegisterPage } from '../pages/register/register';


import { PhoneConfirmationPage } from '../pages/phoneconfirmation/phoneconfirmation';
import { ModalAutocompleteItemsPage } from '../pages/modal-autocomplete-items/modal-autocomplete-items';

import { AllPage } from '../pages/all/all';

//import { NotificationPage } from '../pages/notification/notification';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicStorageModule } from '@ionic/storage';
import { AuthService } from '../providers/services/auth';
import { SafeHttp } from '../providers/services/factory';
import { GlobalDataService } from '../providers/services/auth';
import { OrderService } from '../providers/services/orderservice';

import { Geolocation } from '@ionic-native/geolocation';

import { PhotoViewer } from '@ionic-native/photo-viewer';
import { MomentModule } from 'angular2-moment';

import { Network } from '@ionic-native/network';
import { Camera } from '@ionic-native/camera';

import { File } from '@ionic-native/file';

import { IonicImageLoader } from 'ionic-image-loader';
import { InAppBrowser } from '@ionic-native/in-app-browser';
//import { Keyboard } from '@ionic-native/keyboard';
//import { RatingModule } from 'ngx-rating';
import { Ionic2RatingModule } from 'ionic2-rating';

import { Badge } from '@ionic-native/badge';

//import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
//import { TranslateHttpLoader } from '@ngx-translate/http-loader';

//import {provide} from '@angular/core';
//import {Http, HTTP_PROVIDERS} from '@angular/http';
//import {TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
//import {TranslateModule} from 'ng2-translate'
//import { CallNumber } from '@ionic-native/call-number';


//import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
//import { DatePicker } from '@ionic-native/date-picker';

//import { GoogleMaps } from '@ionic-native/google-maps';
//import { NativePageTransitions } from '@ionic-native/native-page-transitions';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    AboutPage,
    HomePage,
    AddorderPage,
    MorePage,
    OrderNotificationsPage,
    SettingsPage,
    NewOrderPage,
    NewOrderPackagePage,
    NewOrderTimePage,
    EditOrderPage,
    AccountPage,
    ProfilePage,
    TrackPage,
    TrackInfoPage,
    RatingPage,
    IntroPage,

    OrderDetailsPage,
    ModalAutocompleteItemsPage,
    PhoneConfirmationPage,
    AllPage,
    OrderLoginPage,
    EstimatedPricePage,
    LocationEditPage,
    PackageEditPage,
    RegisterPage,
    TimeEditPage,
    WelcomePage,
    NewOrderPackageInfo
  ],
  imports: [
    BrowserModule,
    MomentModule,
    Ionic2RatingModule,
    //RoundProgressModule,
    //TranslateModule.forRoot(),
    IonicStorageModule.forRoot(),
    IonicImageLoader.forRoot(),

      IonicModule.forRoot(MyApp,{
      //  scrollAssist: false,
      //  autoFocusAssist: false,
      backButtonText: '',
      backButtonIcon: 'ios-arrow-back',
      pageTransition: 'ios-transition',

      platforms: {
        ios: {
          statusbarPadding: true,
          tabsHideOnSubPages: true
        }
      }

    },{
        links: [
        //{ component: LoginPage, name: 'Login', segment: 'login' }
      ]
    }),
  HttpClientModule,
  HttpModule,
  TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
  JsonpModule,
  FormsModule,
  TextMaskModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    AboutPage,
    HomePage,
    MorePage,
    OrderNotificationsPage,
    SettingsPage,
    NewOrderPage,
    NewOrderPackagePage,
    NewOrderTimePage,
    EditOrderPage,
    OrderDetailsPage,
    AccountPage,
    ProfilePage,
    TrackPage,
    TrackInfoPage,
    IntroPage,
    RatingPage,
    AddorderPage,
    ModalAutocompleteItemsPage,
    PhoneConfirmationPage,
    AllPage,
    EstimatedPricePage,
    LocationEditPage,
    PackageEditPage,
    TimeEditPage,RegisterPage,
    WelcomePage,
    OrderLoginPage,
    NewOrderPackageInfo
  ],
  providers: [
    StatusBar,
    Toast,
    Network,
    SplashScreen,
    AuthService,
    SafeHttp,
    OrderService,
    GlobalDataService,
    Geolocation,
    PhotoViewer,
    IonicImageLoader,
    Camera,
    Badge,
    Keyboard,
    //CallNumber,
    //GoogleMaps,
    InAppBrowser,
    //NativePageTransitions,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler},

  ]
})
export class AppModule {}
