import { Injectable }              from '@angular/core';
import { Http,RequestOptionsArgs }          from '@angular/http';

import { AlertController } from 'ionic-angular';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/timeout'

import { TranslateService } from '@ngx-translate/core';
import { GlobalDataService } from '../services/auth'
declare var cordova;

@Injectable()
export class  SafeHttp {
  public TransArray: string;

  private globaldataservice :any;
  constructor (public translate: TranslateService,
    public alertCtrl: AlertController,private http: Http,
    globaldataservice : GlobalDataService) {
      this.globaldataservice = globaldataservice;
      this.translate.get(['No network connection','Alert','Please wait...','Open settings','Cancel',
           'Error','Password or phone not correct','Wrong credintals !','OK','Please check your internet connection.',
           'Your account has not been activated yet please try to login through our web site to receive the right info'
             ]).subscribe(
          value => {
             this.TransArray = value;
          }
        )
  }

  get(url: string, options?: RequestOptionsArgs) {
   if (!this.globaldataservice['is_connected']) {
     //this.showNetworkAlert();
     //return false;
   } else { return this.http.get(url, options) }
 }

 delete(url: string, options?: RequestOptionsArgs) {
  if (!this.globaldataservice['is_connected']) {
    //this.showNetworkAlert();
    //return false;
  } else { return this.http.delete(url, options) }
}


 post(url: string, body: any, options?: RequestOptionsArgs) {
   if (!this.globaldataservice['is_connected']) {
     //this.showNetworkAlert();
     //return false;
   } else { return this.http.post(url, body, options) }
 }

 put(url: string, body: any, options?: RequestOptionsArgs) {
   if (!this.globaldataservice['is_connected']) {
     //this.showNetworkAlert();
   } else { return this.http.put(url, body, options) }
 }

 showNetworkAlert() {
     let networkAlert = this.alertCtrl.create({
       title: this.TransArray['No network connection'],
       message: this.TransArray['Please check your internet connection.'],
       buttons: [
         {
           text: this.TransArray['Cancel'],
           handler: () => {}
         },
         {
           text: this.TransArray['Open settings'],
           handler: () => {
             networkAlert.dismiss().then(() => {
               this.showSettings();
             })
           }
         }
       ]
     });
     networkAlert.present();
   }

   private showSettings() {
      cordova.plugins.diagnostic.switchToSettings();
 }
}
