import { Component } from '@angular/core';
import { IonicPage,NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
//import {TranslateService} from 'ng2-translate';
declare var cordova;

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
	   public language: string;
     public version:string="1.8.1";
  constructor(public navCtrl: NavController,  public translate: TranslateService,) {
      cordova.getAppVersion.getVersionNumber().then( (version)=> {
        this.version = version;
      });
  }


   ionViewWillEnter(){
  this.language = this.translate.currentLang;

}

}
