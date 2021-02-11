import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import { NavController,LoadingController,ViewController,AlertController ,NavParams} from 'ionic-angular';
import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';
import { Events } from 'ionic-angular';
import { AuthService } from '../../providers/services/auth'
import { TranslateService } from '@ngx-translate/core';
@IonicPage()
@Component({
  templateUrl: 'phoneconfirmation.html',
  providers:[AuthService]
})
export class PhoneConfirmationPage {
   public mask = [/[0-9]/,/[0-9]/, /[0-9]/, /[0-9]/,/[0-9]/]
   private loading : any;
   private authservice:AuthService;
   public code : string="";
   private errorMessage : any;
   public isSubmitted:boolean = false;
   public phone:any;
   public language: string;
   public TransArray: string;
    public password:any;
  constructor(public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public events: Events,
    public params: NavParams,
    authservice:AuthService,
      public translate: TranslateService,
    public alertCtrl: AlertController){

		    this.loading = this.loadingCtrl.create({
		     content: 'Please wait...'
		  });
		  this.authservice = authservice;
      this.phone = params.get("phone");
      this.password = params.get("password");
      this.translate.get(['No network connection','Alert','Please wait...',
      'Code not correct!','Code sent','Code has been sent successfully','The code you entered is not correct!',
      'Phone number verified!','Your phone number has already been verified',
           'Error','Password or phone not correct','Wrong credintals !','OK'
             ]).subscribe(
          value => {
             this.TransArray = value;
          }
        )
  }

  codeChange(){
    console.log(this.code);
    console.log(this.code.length);
    // if(this.code.length >= 5){
    //   this.code = this.code.replace(/_/g, '').substring(0,5);
    // }
  }
  isFormValid(){
    console.log(this.code);
    console.log(this.code.length);
    this.code = this.code.replace(/_/g, '').substring(0,5);
    if(this.code.length >= 5){

      return true;
    }else{
      return false;
    }
  }
  code_blur(){
    this.code = this.code.replace(/_/g, '').substring(0,5);
  }
   confirmPhoneNumber() {
     if(this.isSubmitted==false){
     this.isSubmitted = true;
     this.loading.present();

     this.authservice.confirmPhoneNumber(this.code,this.phone).subscribe(
                     (res) => {
                       this.loading.dismiss();
                      if(res.result == "CODE_CORRECT"){

                        this.login();
                        //this.events.publish('done',this.phone);
                          //this.navCtrl.setRoot(LoginPage);
                      }else{
                          this.isSubmitted==false;
                          let alert = this.alertCtrl.create({
                            title: this.TransArray['Code not correct!'],
                            subTitle: this.TransArray['The code you entered is not correct!'],
                            buttons: [this.TransArray['OK']]
                          });
                          alert.present();
                           //this.navCtrl.setRoot(HomePage);
                      }
                     },
                     (error) =>  {
                         this.isSubmitted==false;
                       this.loading.dismiss();
                       this.errorMessage = <any>error
                     }
                     );

   }else{

   }

  }

  sendCode() {
     this.loading.present();
     this.authservice.resendPhoneCode(this.phone).subscribe(
                     (res) => {
                       this.loading.dismiss();
                      if(res.result == "CODE_SENDED"){
                        let alert = this.alertCtrl.create({
                            title: this.TransArray['Code sent'],
                            subTitle: this.TransArray['Code has been sent successfully'],
                            buttons: [this.TransArray['OK']]
                          });
                          alert.present();

                          //this.navCtrl.setRoot(LoginPage);
                      }else{
                          let alert = this.alertCtrl.create({
                            title: this.TransArray['Phone number verified!'],
                            subTitle: this.TransArray['Your phone number has already been verified'],
                            buttons: [this.TransArray['OK']]
                          });
                          alert.present();
                          this.navCtrl.setRoot(LoginPage);
                      }
                     },
                     (error) =>  {
                       this.loading.dismiss();
                       this.errorMessage = <any>error;
                      });
 }
 login(){
   this.authservice.login(this.phone,this.password).subscribe(
                   (res) => {
                     this.loading.dismiss();
                     let resp = res;
                     if(resp.status == "ACCESS_GRANTED" || resp.status == "ACCOUNT_ACTIVE"){
                    //   this.navCtrl.setRoot(HomePage);
                        this.viewCtrl.dismiss(true);
                     }else if(resp.status == "ACCOUNT_NOT_ACTIVE"){
                       //this never likely to happen
                       this.navCtrl.setRoot(LoginPage);

                     }else if(resp.status == "INVALID_LOGIN"){
                       console.log('invalide login');
                       //this also never likely to happen
                       this.navCtrl.setRoot(LoginPage);

                     }else{
                       console.log("pfffffff !");
                       this.navCtrl.setRoot(LoginPage);
                     }
                   },
                   (error) => {
                     console.log(error);
                     this.loading.dismiss();
                     let alert = this.alertCtrl.create({
                          title: this.TransArray['Error'],
                          subTitle: error,
                          buttons: [this.TransArray['OK']]
                        });
                        alert.present();
                     this.errorMessage = <any>error
                   });
 }

}
