import { Component } from '@angular/core';
import { App,NavController,ViewController,LoadingController,AlertController } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';
import { IonicPage } from 'ionic-angular';
import { AuthService } from '../../providers/services/auth'

@IonicPage()
@Component({
  selector: 'page-more',
  templateUrl: 'more.html',
  providers:[AuthService]
})
export class MorePage {
  public settings:any;
  private authservice:AuthService;

  constructor(
    //private nativePageTransitions: NativePageTransitions,
    public appCtrl: App,public viewCtrl: ViewController,
  	public alertCtrl: AlertController,
  	public navCtrl: NavController,public loadingCtrl: LoadingController,authservice:AuthService) {
  		this.settings = SettingsPage;
  		this.authservice = authservice;

  }

  openSettings() {


     this.viewCtrl.dismiss({'data':SettingsPage});
     setTimeout(()=>{


       this.appCtrl.getRootNav().push(SettingsPage,{});
     },90);

  }

}
