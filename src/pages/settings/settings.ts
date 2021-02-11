import { Component } from '@angular/core';
import {IonicPage, PopoverController,NavController, LoadingController, ActionSheetController,AlertController } from 'ionic-angular';


import { Profile } from "../../models/User";

import { AuthService,GlobalDataService } from '../../providers/services/auth'

import {AccountPage} from  '../account/account';
import {ProfilePage} from  '../profile/profile';

import { LoginPage } from '../login/login';
import { AboutPage } from '../about/about';

import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  postTitle: any;
  desc: any;
  imageChosen: any = 0;
  imagePath: any;
  imageNewPath: any;
  profile:any;
  customer:any;
  authservice:any;
  globaldataservice:any;
  storage:any;
  platform:any;
  network:any;
  public language :string;
  public is_authenticated :boolean = false;
  public TransArray:any;

  constructor(public translate: TranslateService,
    //private nativePageTransitions: NativePageTransitions,
    storage:Storage,globaldataservice : GlobalDataService,platform: Platform
    ,public alertCtrl: AlertController,authservice:AuthService,
    public navCtrl: NavController,public actionSheet: ActionSheetController,
    public loadingCtrl: LoadingController,public popoverCtrl: PopoverController) {
      this.profile = new Profile(0,"","","","","","","","");
      this.authservice = authservice;
      this.globaldataservice = globaldataservice;
      this.storage = storage;
      this.platform = platform;

      if(this.globaldataservice['AUTHENTICATED']){
        this.is_authenticated = true;
      }else{
        this.is_authenticated = false;
      }

  }



  ionViewCanEnter(){
     this.storage.get('CUSTOMER').then((val)=>{
       console.log(val);
          if(val!=null && val != ""){
                this.customer = JSON.parse(val);
                console.log("this.customer");
                console.log(this.customer);
                this.globaldataservice['CUSTOMER'] = this.customer;
                return true;
          }else{
              return false;
          }
      });

      this.storage.get('PROFILE').then((val)=>{
        console.log(val);
        console.log(JSON.parse(val));
          if(val!=null && val != ""){
                this.profile = JSON.parse(val);
                this.globaldataservice['PROFILE'] = this.profile;
                return true;
          }else{
              return false;
          }
      });

      //this.profile = this.globaldataservice['PROFILE'];
      //this.customer = this.globaldataservice['CUSTOMER'];

   /* this.authservice.getProfile().subscribe((res)=>{
            this.profile = res;
      },(err)=>{
            //throw err
      });
        this.authservice.getCustomer().subscribe((res)=>{
            this.customer = res;
      },(err)=>{
            //throw err
      });*/
  }
 openAccountPage(){


       this.navCtrl.push(AccountPage,{'customer':this.customer});
 }
 openAboutPage(){


       this.navCtrl.push(AboutPage,{});
 }
  openProfilePage(){



       this.navCtrl.push(ProfilePage,{'profile':this.profile});
 }

   changeLan(){
    let init_lang = this.translate.currentLang;
    let alert = this.alertCtrl.create();


         alert.setTitle(this.TransArray['Choose a language']);

    let use_en=false;
  if(this.translate.currentLang == "en"){
    use_en= true;
  }
   let use_ar=false;
  if(this.translate.currentLang == "ar"){
    use_ar= true;
  }
    alert.addInput({
      type: 'radio',
      label: 'Arabic',
      value: 'ar',
      checked: use_ar
    });
    alert.addInput({
      type: 'radio',
      label: 'English',
      value: 'en',
      checked: use_en
    });

    alert.addButton(this.TransArray['Cancel']);
    alert.addButton({
      text: this.TransArray['Apply'],
      handler: data => {
        console.log(data);
        if(init_lang != data){
          this.translate.use(data.toString());
          this.language = data;
          this.storage.set('language',data);
          //setlang on server
          if(data.toString() == "ar"){
            moment.locale('ar-dz');
          }else{
              moment.locale('en');
          }

        }
      }
    });
    alert.present();
 }

 LogOut(){

    let loading = this.loadingCtrl.create({
         content: this.TransArray['Please wait...']
      });
     loading.present();
    this.authservice.logout().subscribe(
      (res)=>{
        window['FirebasePlugin'].unregister();
        loading.dismiss();
        this.globaldataservice['AUTHENTICATED'] = false;
        this.navCtrl.setRoot(SettingsPage);
      }
      ,(error) =>{
        loading.dismiss();
        let alert = this.alertCtrl.create({
                            title: 'Sorry could not Logout !',
                            subTitle: 'It looks like there i a trafic in our server ,try again',
                            buttons: ['OK']
                          });
                          alert.present();
      }
    )
 }

 ionViewWillLeave(){
      console.log('leave leave');
 }
 LogIn() {
   this.navCtrl.push(LoginPage);
 }

  ionViewWillEnter(){
    console.log('enter enter');
      this.language = this.translate.currentLang ;
       this.translate.get(['Choose a language','Apply','Cancel','Please wait...']).subscribe(
      value => {
         this.TransArray = value;
      }
    )
    this.authservice.is_authenticated(true).then((res)=>{
      if(this.globaldataservice['AUTHENTICATED']){
        this.is_authenticated = true;
      }else{
        this.is_authenticated = false;
      }
    },(err)=>{

    });


  }

}
