import { Component,ViewChild } from '@angular/core';
import { IonicPage,NavParams } from 'ionic-angular';
import {Validators,FormBuilder, FormGroup } from '@angular/forms';

import { ViewController,ModalController,NavController,LoadingController,AlertController,ToastController,MenuController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { AddorderPage } from '../addorder/addorder';

import { PhoneConfirmationPage } from '../phoneconfirmation/phoneconfirmation';

import { NewUser } from '../../models/User'
import { AuthService } from '../../providers/services/auth'

import { Platform } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';
import { Events ,Slides} from 'ionic-angular';

declare var cordova :any;

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
  providers:[AuthService]
})
export class RegisterPage {
   @ViewChild('phone') myInput ;
  // @ViewChild('signupSlider') slides: Slides;
   @ViewChild(Slides) slides: Slides;
   public slideOneForm: FormGroup;
   public slideTwoForm: FormGroup;
   public parent:string='';
   submitAttempt: boolean = false;
   public mask = ['+','(', '9', '7', '4', ')', ' ', /\d/, /\d/, /\d/,/\d/, '-', /\d/, /\d/, /\d/, /\d/]

   private userAuth : NewUser = new NewUser("","","","");
   public username_error:boolean= false;
   public phone_error:boolean= false;
   public email_error:boolean= false;
   public password_error:boolean= false;
   public password_match:boolean= true;
   public eye_open:boolean= false;
   private loading : any;
   public submitedone = false;
   public submitedtwo = false;
   private authservice:AuthService;
   private errorMessage : any;
   private platform :any;
   private network :any;
   public language: string;
   public TransArray: string;
   constructor(public navCtrl: NavController,
  //private iab: InAppBrowser,
  public params: NavParams,
  public viewCtrl: ViewController,
  public translate: TranslateService,
    public modalCtrl: ModalController,
  public menu: MenuController,
    public toastCtrl: ToastController,
    network: Network ,
    platform: Platform,
  	public loadingCtrl: LoadingController,
  	private formBuilder: FormBuilder,
  	authservice:AuthService,
    public events: Events,
  	public alertCtrl: AlertController){
  this.translate.get(['No network connection','Alert','Please wait...',
       'Error','Password or phone not correct','Wrong credintals !','OK',
       'Your account has not been activated yet please try to login through our web site to receive the right info'
         ]).subscribe(
      value => {
         this.TransArray = value;
      }
    )
    this.loading = this.loadingCtrl.create({
      content: this.TransArray['Please wait...']
      });


    this.platform = platform;
    this.network = network;
        this.slideOneForm = this.formBuilder.group({
          phone: ['', [Validators.required, Validators.minLength(16),Validators.maxLength(16)]],
          email: ['', [Validators.required,Validators.email]],
        });
        this.slideTwoForm = this.formBuilder.group({
          username: ['', [Validators.required,Validators.minLength(2),Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9_.-]*')]],
          password: ['',[Validators.required,Validators.minLength(8)]]
        });
        this.loading = this.loadingCtrl.create({
         content: this.TransArray['Please wait...']
      });

      this.authservice = authservice;

      this.parent = params.get("parent");
      //cordova.plugins.Keyboard.disableScroll(true);
  }
    ionViewWillEnter(){
        this.slides.lockSwipes(true);
    }
toggleEye(){
  this.eye_open = !this.eye_open;

}
next(){
  this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slides.lockSwipes(true);
   }

   prev(){
     this.slides.lockSwipes(false);
       this.slides.slidePrev();
       this.slides.lockSwipes(true);
   }

   save(){

   }
phone_blur(){
  this.userAuth.phone = this.slideOneForm.controls["phone"].value.replace(/_/g, '').substring(0,16);
  //this.slideOneForm.controls["phone"].setValue(this.slideOneForm.controls["phone"].value.replace(/_/g, '').substring(0,16));
}
phone_change(){
  //this.submitedone = false;
  this.phone_error = false;
}
email_change(){
 //this.submitedone = false;
  this.email_error = false;
}
username_change(){
  this.username_error = false;
}
password_change(){
  this.password_error = false;
}
   authLogin() {

     this.platform.ready().then(() => {
          if(this.network.type === 'none'){
               let toast = this.toastCtrl.create({
                  message: this.TransArray['No network connection'],
                  duration: 4000,
                  position: 'bottom',
                  cssClass:'lostconnect'
                });

                toast.present();

          }else{

                  this.loading = this.loadingCtrl.create({
         content: this.TransArray['Please wait...']
      });
     this.loading.present();

     console.log("this.userAuth");
     this.userAuth.phone = this.userAuth.phone.replace(/_/g, '');
     this.userAuth.phone = this.userAuth.phone.substring(0,16);
     console.log(this.userAuth);
     this.authservice.login(this.userAuth.phone.substring(0,16),this.userAuth.password).subscribe(
                     (res) => {
                       this.loading.dismiss();
                       let resp = res;
                       if(resp.status == "ACCESS_GRANTED" || resp.status == "ACCOUNT_ACTIVE"){
                         this.navCtrl.setRoot(HomePage);
                       }else if(resp.status == "ACCOUNT_NOT_ACTIVE"){
                         //to the phone verfication
                         //this.navCtrl.setRoot(PhoneConfirmationPage);
                         this.navCtrl.setRoot(PhoneConfirmationPage,{"phone":this.userAuth.phone,"password":this.userAuth.password});
                        //  let alert = this.alertCtrl.create({
                        //     title: this.TransArray['Account not activated'],
                        //     subTitle: this.TransArray['Your account has not been activated yet please try to login through our web site to recieve the right info'],
                        //     buttons: [this.TransArray['OK']]
                        //   });
                          //alert.present();
                       }else if(resp.status == "INVALID_LOGIN"){
                         console.log('invalide login');
                         let alert = this.alertCtrl.create({
                            title: this.TransArray['Wrong credintals !'],
                            subTitle: this.TransArray['Password or phone not correct'],
                            buttons: [this.TransArray['OK']]
                          });
                          alert.present();
                       }else{
                         console.log("pfffffff !");
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
      });

  }

  register() {

    this.platform.ready().then(() => {
         if(this.network.type === 'none'){
              let toast = this.toastCtrl.create({
                 message: this.TransArray['No network connection'],
                 duration: 4000,
                 position: 'bottom',
                 cssClass:'lostconnect'
               });

               toast.present();

         }else{
           console.log(this.slideOneForm.valid);
           console.log(this.slideTwoForm.valid);

           if(!this.slideOneForm.valid){
             this.submitAttempt = true;
               this.slides.slideTo(0);
           }
           else if(!this.slideTwoForm.valid){
             this.submitAttempt = true;
               this.slides.slideTo(1);
           }
           else {
             this.loading = this.loadingCtrl.create({
                  content: this.TransArray['Please wait...']
              });
             this.loading.present();
             this.userAuth.phone = this.userAuth.phone.replace(/_/g, '');
             this.userAuth.phone = this.userAuth.phone.substring(0,16);
             this.registerUser();
           }



         }
     });

 }
 registerUser(){
      this.authservice.register
          (this.userAuth.phone,
          this.userAuth.email,
          this.userAuth.username,
          this.userAuth.password).subscribe(
                   (res) => {
                     this.loading.dismiss();
                     if(res.status == 201){
                         //cool go to phone confi
                         //this.navCtrl.push(PhoneConfirmationPage,{"phone":this.userAuth.phone,"password":this.userAuth.password});
                         let profileModal = this.modalCtrl.create(PhoneConfirmationPage,{"phone":this.userAuth.phone,"password":this.userAuth.password});
                          profileModal.onDidDismiss(data => {
                            if(data){
                                if(this.parent != 'neworder'){
                                  this.navCtrl.setRoot(AddorderPage);
                                }else{
                                    this.viewCtrl.dismiss();
                                    this.events.publish('LOGGED_IN',true);
                                }
                            }else{

                            }
                          });
                          profileModal.present();

                        //  this.events.subscribe('done', (order) => {
                        //      //phone confirmed go to
                        //      this.authLogin();
                        //  });

                     }else if(res.status == 400){
                         //some field existed
                         if(res.data.result.user){
                           this.username_error = true;
                           this.slides.slideTo(1);
                         }
                         if(res.data.result.phone){
                           this.phone_error = true;
                           this.slides.slideTo(0);
                         }
                         if(res.data.result.email){
                           this.email_error = true;
                           this.slides.slideTo(0);
                         }
                         if(res.data.result.password){
                             this.password_error = true;
                             this.slides.slideTo(1);
                         }

                     }else{
                         //server error
                         let alert = this.alertCtrl.create({
                              title: "Error",
                              subTitle: "error",
                              buttons: ["Error happen while attemption to register please try again later"]
                            });
                            alert.present();
                     }

                   }
                   ,(error) => {
                     this.loading.dismiss();
                     if(error.data.result.user){
                       this.username_error = true;
                       //this.slides.slideTo(1);
                     }
                     if(error.data.result.phone){
                       this.phone_error = true;
                       this.prev();
                       //this.slides.slideTo(0);
                     }
                     if(error.data.result.email){
                       this.email_error = true;
                       //this.slides.slideTo(0);
                       this.prev();
                     }
                     if(error.data.result.password){
                         this.password_error = true;
                      //   this.slides.slideTo(1);
                     }
                     this.errorMessage = <any>error
                   });
 }
 onSubmitONE(){
   if(this.slideOneForm.valid){
     cordova.plugins.Keyboard.close();
     this.next();
   }else{
     this.submitedone = true;
     cordova.plugins.Keyboard.close();
   }
 }
 onSubmit(){
   this.submitedtwo = true;
   if(this.slideTwoForm.valid && this.slideOneForm.valid){
     this.register();
   }else{

     if(!this.slideOneForm.valid){
       this.prev();
       cordova.plugins.Keyboard.close();
     }else{

       cordova.plugins.Keyboard.close();
     }

   }

 }
  createTraderAccount(){
    window.open("http://www.mashaweerdoha.com/TraderSignUp/","_system","location=no")
    //const browser = this.iab.create('http://www.mashaweerdoha.com/TraderSignUp/');
  }
  createCustomerAccount(){
    window.open("http://www.mashaweerdoha.com/CustomerSignUp/","_system","location=no")
    //const browser = this.iab.create('http://www.mashaweerdoha.com/CustomerSignUp/');
  }
  forgotPassword(){
    window.open("http://www.mashaweerdoha.com/ForgotPassword/","_system","location=no")
    //const browser = this.iab.create('http://www.mashaweerdoha.com/ForgotPassword/');
  }

dismiss(){
  this.viewCtrl.dismiss();
}


}
