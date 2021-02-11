import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { NavController, ModalController,LoadingController,ViewController, AlertController, ToastController, Content } from 'ionic-angular';
import { HomePage } from '../home/home';
import { AddorderPage } from '../addorder/addorder';

import { RegisterPage } from '../register/register';
import { PhoneConfirmationPage } from '../phoneconfirmation/phoneconfirmation';

import { User } from '../../models/User'
import { AuthService } from '../../providers/services/auth'

import { Platform, Slides } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-orderlogin',
  templateUrl: 'orderlogin.html',
  providers: [AuthService]
})
export class OrderLoginPage implements OnInit {
  @ViewChild('phone') myInput;
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Content) content: Content;
  public mask = ['+', '(', '9', '7', '4', ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
  private loginForm: FormGroup;
  private userAuth: User;
  private loading: any;
  private authservice: AuthService;
  private errorMessage: any;
  private platform: any;
  private network: any;
  public language: string;
  public TransArray: string;
  constructor(public navCtrl: NavController,
    //private iab: InAppBrowser,
      public events: Events,
      public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    public translate: TranslateService,
    public toastCtrl: ToastController,
    network: Network,
    platform: Platform,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    authservice: AuthService,
    public alertCtrl: AlertController) {
    this.translate.get(['No network connection', 'Alert', 'Please wait...',
      'Error', 'Password or phone not correct', 'Wrong credintals !', 'OK',
      'Your account has not been activated yet please try to login through our web site to receive the right info'
    ]).subscribe(
      value => {
        this.TransArray = value;
      }
      )
    this.platform = platform;
    this.network = network;
    this.loginForm = this.formBuilder.group({
      phone: ['', [Validators.required,]],
      password: ['', [Validators.required,]],
    });
    this.loading = this.loadingCtrl.create({
      content: this.TransArray['Please wait...']
    });
    this.authservice = authservice;
    this.userAuth = this.loginForm.value;

    platform.ready().then(() => {
      //cordova.plugins.Keyboard.disableScroll(true);
    });

  }

  ngOnInit() {

  }
  input_focus() {
    //$("#mashlogo").slideUp("slow");
  }
  phone_blur() {
    this.userAuth = this.loginForm.value;
    this.loginForm.controls["phone"].setValue(this.userAuth.phone.replace(/_/g, '').substring(0, 16));
  }
  authLogin() {
    this.platform.ready().then(() => {
      if (this.network.type === 'none') {
        let toast = this.toastCtrl.create({
          message: this.TransArray['No network connection'],
          duration: 4000,
          position: 'bottom',
          cssClass: 'lostconnect'
        });
        toast.present();
      } else {
        this.loading = this.loadingCtrl.create({
          content: this.TransArray['Please wait...']
        });
        this.loading.present();
        this.userAuth = this.loginForm.value;

        this.userAuth.phone = this.userAuth.phone.replace(/_/g, '');
        this.userAuth.phone = this.userAuth.phone.substring(0, 16);

        this.authservice.login(this.userAuth.phone.substring(0, 16), this.userAuth.password).subscribe(
          (res) => {
            this.loading.dismiss();
            let resp = res;

            if (resp.status == "ACCESS_GRANTED" || resp.status == "ACCOUNT_ACTIVE") {

                var val = this.navCtrl.last();
                console.log('valłlllllllllll');
                console.log(val);
                if(val == null){
                  this.navCtrl.setRoot(AddorderPage);
                }else{
                    this.viewCtrl.dismiss();
                    this.events.publish('LOGGED_IN',true);
                }
              //this.navCtrl.setRoot(HomePage);
            } else if (resp.status == "ACCOUNT_NOT_ACTIVE") {
              //to the phone verfication
              //var val = this.navCtrl.last();
              //this.navCtrl.push(PhoneConfirmationPage, { "phone": this.userAuth.phone.substring(0, 16), "password": this.userAuth.password });
              let profileModal = this.modalCtrl.create(PhoneConfirmationPage, { "phone": this.userAuth.phone.substring(0, 16), "password": this.userAuth.password });
               profileModal.onDidDismiss(data => {
                 if(data){
                     var val = this.navCtrl.last();
                     if(val == null){
                       this.navCtrl.setRoot(AddorderPage);
                     }else{
                         this.viewCtrl.dismiss();
                         this.events.publish('LOGGED_IN',true);
                     }
                 }else{

                 }
               });
               profileModal.present();

            } else if (resp.status == "INVALID_LOGIN") {
              console.log('invalide login');

              let alert = this.alertCtrl.create({
                title: this.TransArray['Wrong credintals !'],
                subTitle: this.TransArray['Password or phone not correct'],
                buttons: [this.TransArray['OK']]
              });
              alert.present();
            } else {
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



  createTraderAccount() {
    window.open("http://www.mashaweerdoha.com/TraderSignUp/", "_system", "location=no")
    //const browser = this.iab.create('http://www.mashaweerdoha.com/TraderSignUp/');
  }
  createCustomerAccount() {
    this.viewCtrl.dismiss();
    this.navCtrl.push(RegisterPage, {'parent':'neworder'});
    //window.open("http://www.mashaweerdoha.com/CustomerSignUp/","_system","location=no")
    //const browser = this.iab.create('http://www.mashaweerdoha.com/CustomerSignUp/');
  }
  forgotPassword() {
    window.open("http://www.mashaweerdoha.com/ForgotPassword/", "_system", "location=no");
    //const browser = this.iab.create('http://www.mashaweerdoha.com/ForgotPassword/');
  }


}
