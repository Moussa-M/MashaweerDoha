import { Component, ViewChild } from '@angular/core';
//import { HttpClient, HttpClientModule } from '@angular/common/http';
//import { HttpModule } from '@angular/http';
import { App, Platform, Nav, ToastController, AlertController, ViewController, MenuController } from 'ionic-angular';
//import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { LoginPage } from '../pages/login/login';
import { IntroPage } from '../pages/intro/intro';
import { RegisterPage } from '../pages/register/register';
import { WelcomePage } from '../pages/welcome/welcome';
import { HomePage } from '../pages/home/home';
import { AddorderPage } from '../pages/addorder/addorder';
import { SettingsPage } from '../pages/settings/settings';
import { AllPage } from '../pages/all/all';

import { AuthService, GlobalDataService } from '../providers/services/auth'

import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';
//import {TranslateService} from 'ng2-translate';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { Events } from 'ionic-angular';

declare var cordova: any;

declare var AppRate:any;

//import { Settings } from '../providers/providers';

@Component({
  template: `<ion-menu id="mymenu"  type="overlay" side="left" (ionOpen)="menuOpen()" (ionClose)="menuClose()"  [content]="content">
 <ion-header>
    <ion-toolbar>
      <ion-title>{{'Menu'|translate}}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content no-bounce >
    <ion-list>
      <button  menuClose ion-item (click)="openNewOrder()">
      {{'Add Order'|translate}}
      <ion-icon name="ios-paper-outline" item-left></ion-icon>
      </button>
       <button  menuClose ion-item (click)="openAllOrder()">
      {{'My Orders' | translate}}
        <ion-icon name="ios-albums-outline" item-left></ion-icon>
      </button>
       <button  menuClose ion-item (click)="openSettings()">
      {{'Settings'|translate}}
        <ion-icon name="ios-settings-outline" item-left></ion-icon>
      </button>
    </ion-list>
  </ion-content>
</ion-menu>
<ion-nav [root]="rootPage" #content id="nav" swipeBackEnabled="false"></ion-nav>`
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any;
  public alertpresented: boolean = false;
  public TransArray: string;
  public failed_attempt: number = 0;
  public language: string = "en";

  constructor(
    public alertCtrl: AlertController,
    public events: Events,
    public globaldataservice: GlobalDataService,
    public menuCtrl: MenuController,
    public storage: Storage,
    public translate: TranslateService,
    public toastCtrl: ToastController,
    public network: Network,
    public appCtrl: App,
    public platform: Platform,
    public statusBar: StatusBar,

    public splashScreen: SplashScreen,
    public authservice: AuthService) {
    this.initTranslate();
  }

  // ionViewDidLoad() {
  //   this.platform.ready().then(() => {
  //
  //   });
  // }

  initTranslate() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString("#7b2d57");
      window["plugins"].headerColor.tint("#7b2d57");
      
      setTimeout(() => {
        this.splashScreen.hide();
      }, 1300);
      this.globaldataservice['CUSTOMER_SOCKET'] = new WebSocket("wss://www.mashaweerdoha.com:8020" + "/customers");

      this.translate.get(['Mind giving us some feedback?', 'No, Thanks', 'Remind Me Later', 'Rate It Now', 'Yes!', 'Not really',
        'Would you mind rating ', 'MashaweerDoha', 'It will not take more than a minute and helps to promote our app. Thanks for your support',
        'Dismiss', 'Mind giving us some feedback?', 'Do you like using ', 'Logging out ...', 'Your account has been signed in from another device! You will be logged out',
        'No network connection', 'Network connecion established', 'Lost connection ...', 'Lost connection to server',
        'We are sorry but this version of the application is not supported ,please update to the new version.',
        'We highly recommend you to update to the new version of MashaweerDoha to benefit from all the new features.',
        'New update found', 'Okay', 'Update'
      ]).subscribe(
        value => {
          this.TransArray = value;
        });

      this.translate.setDefaultLang('en');
      this.storage.get('language').then((val) => {
        if (val) {
          this.translate.use(val);
          this.language = this.translate.currentLang;
          //this.initRate();
          if (val == "ar") {
            moment.locale('ar-dz');
          }
        } else {
          this.storage.set('language', 'en');
          this.translate.use('en');
        }
      });



      this.globaldataservice['is_connected'] = true;
      if (this.network.type === 'none') {
        this.globaldataservice['is_connected'] = false;
      }

      this.authservice.is_authenticated(true).then((res)=>{

      },(err)=>{

      });
      // setInterval(() => {
      //   if (this.network.type != 'none') {
      //     this.authservice.is_authenticated(true).then((res) => {
      //       //cool
      //     }, (err) => {
      //
      //       if (this.nav.getActive().component != LoginPage && this.nav.getActive().component != RegisterPage &&
      //         this.nav.getActive().component != IntroPage && this.nav.getActive().component != WelcomePage) {
      //         this.failed_attempt = +1;
      //         console.log("lost connection" + this.failed_attempt);
      //         if (!this.alertpresented && this.failed_attempt >= 5) {
      //
      //           let alert = this.alertCtrl.create({
      //             title: this.TransArray['Lost connection ...'],
      //             message: this.TransArray['Lost connection to server'],
      //             buttons: [
      //               {
      //                 text: this.TransArray['Dismiss'],
      //                 role: 'cancel',
      //                 handler: () => {
      //                   this.alertpresented = false;
      //                   this.failed_attempt = 0;
      //                   window['FirebasePlugin'].unregister();
      //                   this.nav.setRoot(LoginPage);
      //                   return true;
      //                 }
      //               },]
      //           });
      //           this.alertpresented = true;
      //           this.failed_attempt = 0;
      //           alert.present();
      //         }
      //       }
      //     });
      //   } else {
      //
      //   }
      // }, 60000);



      cordova.plugins.backgroundMode.setEnabled(true);
      this.platform.registerBackButtonAction(() => {
        let nav = this.appCtrl.getActiveNav();
        let activeView: ViewController = nav.getActive();
        if (activeView != null) {
          if (nav.canGoBack()) {
            nav.pop();
          } else {
            cordova.plugins.backgroundMode.moveToBackground();
          }
        }
      });

      cordova.plugins.Keyboard.disableScroll(true);
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      this.menuCtrl.enable(false, 'mymenu');

      this.authservice.is_intro_shown().then((shown) => {
        if (shown) {
           this.authservice.is_authenticated(true).then((res) => {
             if (res) {
              //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
              this.menuCtrl.enable(true, 'mymenu');
              this.rootPage = AddorderPage;
              //setTimeout(3000,()=>{
                  this.checkUpdates();
                  //this.events.publish('home:loaded',{});
              //});

            } else {
              //this.rootPage = WelcomePage;
              this.rootPage = AddorderPage;
            }
          }, (err) => {
            this.rootPage = AddorderPage;
            //this.rootPage = WelcomePage;
          });

        } else {
          this.rootPage = IntroPage;
        }
      }, (err) => {
        //this.menuCtrl.enable(true, 'authenticated');
        this.rootPage = AddorderPage;
        //this.rootPage = WelcomePage;
      });

    });
  }



  async checkUpdates() {
    if (this.network.type != 'none') {
      cordova.getAppVersion.getVersionNumber().then((version) => {
        cordova.getAppVersion.getPackageName().then((packname) => {
          let versionx = version.split(".").join("");
          this.authservice.checkAppVersion(versionx).subscribe((res) => {
            //cool
            if (res.status == "CURRENT") {

            } else if (res.status == "UPDATE") {
              let alert = this.alertCtrl.create({
                title: this.TransArray['New update found'],
                message: this.TransArray['We highly recommend you to update to the new version of MashaweerDoha to benefit from all the new features.'],
                buttons: [
                  {
                    text: this.TransArray['Dismiss'],
                    role: 'cancel',
                    handler: () => {
                      return true;
                    }
                  }, {
                    text: this.TransArray['Update'],
                    role: 'cancel',
                    handler: () => {
                      cordova.plugins.market.open('id1260236277', {
                        success: function() {
                          // Your stuff here
                        },
                        error: function() {
                          // Your stuff here
                        }
                      })
                      return true;
                    }
                  }
                ]
              });
              alert.present();
            } else if (res.status == "FORCE_UPDATE") {
              let alert = this.alertCtrl.create({
                title: this.TransArray['New update found'],
                message: this.TransArray['We are sorry but this version of the application is not supported ,please update to the new version.'],
                buttons: [
                  {
                    text: this.TransArray['Okay'],
                    role: 'cancel',
                    handler: () => {
                      cordova.plugins.market.open(packname, {
                        success: function() {
                          // Your stuff here
                        },
                        error: function() {
                          // Your stuff here
                        }
                      })
                      return true;
                    }
                  }
                ]
              });
              alert.present();
            }
          }, (err) => {

          });
        });
      });
    }
  }
  menuOpen(){
      this.events.publish('menuopen',true);
  }
  menuClose(){
    this.events.publish('menuopen',false);
  }
  openTodayOrder() {
    this.nav.setRoot(HomePage);
  }

  openNewOrder() {
    this.nav.setRoot(AddorderPage);
  }
  openAllOrder() {
    this.nav.setRoot(HomePage);
  }
  openSettings() {
    this.nav.setRoot(SettingsPage);
  }
}
