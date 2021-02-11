import {
    Component,
    ChangeDetectorRef
} from '@angular/core';
import {
  IonicPage,
    AlertController,
    PopoverController,
    NavController,
    LoadingController,
    ActionSheetController,
    ToastController
} from 'ionic-angular';

import {
    Profile
} from "../../models/User";
import {
    AuthService,GlobalDataService
} from '../../providers/services/auth'
import {
    Platform
} from 'ionic-angular';
import {
    Network
} from '@ionic-native/network';
import { Storage } from '@ionic/storage';

import { TranslateService } from '@ngx-translate/core';
//import {TranslateService} from 'ng2-translate';
@IonicPage()
@Component({
    selector: 'page-account',
    templateUrl: 'account.html'
})
export class AccountPage {
    public mask = ['+', '(', '9', '7', '4', ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]
    postTitle: any;
    desc: any;
    imageChosen: any = 0;
    imagePath: any;
    imageNewPath: any;
    profile: any;
    customer: any;
    authservice: any;
    editname: Boolean;
    editphone: Boolean;
    editemail: Boolean;
    username: string;
    phone: string;
    email: string;
    changeref: any;
    private platform: any;
    private network: any;
    public language :string;
    public TransArray:string;
      globaldataservice:any;
  storage:any;
    constructor(public translate: TranslateService,
        //private nativePageTransitions: NativePageTransitions,
      storage:Storage,globaldataservice : GlobalDataService,
      public toastCtrl: ToastController, network: Network, platform: Platform,
      public alertCtrl: AlertController, changeref: ChangeDetectorRef,
      authservice: AuthService,public navCtrl: NavController, public actionSheet: ActionSheetController,
        public loadingCtrl: LoadingController, public popoverCtrl: PopoverController) {
        this.profile = new Profile(0, "", "", "", "", "", "", "", "");
        this.authservice = authservice;
        this.editname = false;
        this.editphone = false;
        this.editemail = false;
        this.changeref = changeref;
        this.platform = platform;
        this.network = network;
        this.globaldataservice = globaldataservice;
        this.storage = storage;


    }

    cancelEdit(){
      this.editname = false;
        this.editphone = false;
        this.editemail = false;
    }
    editUserName() {
        this.editname = !this.editname;
    }
    editPhone() {
        console.log('okkkkkk');
        this.editphone = !this.editphone;
    }
    editEmail() {
        console.log('okkkkkk');
        this.editemail = !this.editemail;
    }
    saveUserName() {

         if(!this.globaldataservice['is_connected']){
               let toast = this.toastCtrl.create({
                 message: this.TransArray['No network connection'],
                 duration: 4000,
                 position: 'bottom',
                 cssClass:'lostconnect'
               });

               toast.present();
         }else{

  if(this.username != this.customer.user.username){
              // this.authservice.is_authenticated(true).then((res)=>{
        window['plugins'].spinnerDialog.show( null,this.TransArray["Please wait..."], true);
        let tmp = Object.assign({}, this.customer);
        tmp.user.username = this.username;
        this.authservice.setCustomer(tmp,this.navCtrl).subscribe((res) => {
            window['plugins'].spinnerDialog.hide();
            if (res.status == 200) {
                this.customer = res.data;
                this.editname = !this.editname;
                this.changeref.detectChanges();
            } else {
                console.log(res.data);
            }
        }, (err) => {
            window['plugins'].spinnerDialog.hide();
            console.log('err');
            console.log(err);
            if (err.data.result.user != null) {
                let alert = this.alertCtrl.create({
                    title: this.TransArray['Alert'],
                    subTitle: this.TransArray['This username already exists'],
                    buttons: [this.TransArray['OK']]
                });
                alert.present();
            }
            //throw err
        });
              // },(err)=>{
              //      this.navCtrl.setRoot(LoginPage);
              // });

            }else{
              this.editname = !this.editname;
            }
          }


    }
    savePhone() {
      if(!this.globaldataservice['is_connected']){
            let toast = this.toastCtrl.create({
              message: this.TransArray['No network connection'],
              duration: 4000,
              position: 'bottom',
              cssClass:'lostconnect'
            });

            toast.present();
      }else{

                    this.phone = this.phone.replace(/_/g, '');
                if (this.phone.length != 16 || this.phone==this.customer.phone) {
                    console.log('not correcct format');
                    this.editphone = !this.editphone;
                } else {

                    window['plugins'].spinnerDialog.show( null,this.TransArray["Please wait..."], true);
                    this.authservice.sendPhoneCode(this.phone).subscribe((res) => {
                        window['plugins'].spinnerDialog.hide();
                        console.log("res");
                        console.log(res);
                        if (res.status == 200) {
                            if (res.data.result == 'CODE_SENT') {
                                //enter code
                                let prompt = this.alertCtrl.create({
                                    title: this.TransArray['Phone number verification'],
                                    message: this.TransArray["Please enter the code we sent you"],
                                    inputs: [{
                                        name: 'code',
                                        placeholder: 'Code'
                                    }, ],
                                    buttons: [{
                                        text: 'Cancel',
                                        handler: data => {
                                            this.editphone = !this.editphone;
                                            prompt.dismiss();
                                        }
                                    }, {
                                        text: 'Okay',
                                        handler: data => {
                                            console.log('Saved clicked' + data);
                                            window['plugins'].spinnerDialog.show( null,this.TransArray["Please wait..."], true);
                                            this.authservice.confirmPhoneNumber(data.code, this.phone).subscribe((res) => {
                                                if (res.result == 'CODE_CORRECT') {
                                                    let ph_tmp = Object.assign({}, this.customer);
                                                    ph_tmp.phone = this.phone;
                                                    this.authservice.setCustomer(ph_tmp,this.navCtrl).subscribe((res) => {
                                                        window['plugins'].spinnerDialog.hide();
                                                        if (res.status == 200) {
                                                            this.customer = res.data;
                                                            this.editphone = !this.editphone;
                                                            this.changeref.detectChanges();
                                                        } else {
                                                            console.log(res.data);
                                                        }
                                                    }, (err) => {
                                                        window['plugins'].spinnerDialog.hide();
                                                        console.log('err');
                                                        console.log(err);
                                                        if (err.data.result.phone != null) {
                                                            let alert = this.alertCtrl.create({
                                                                title: this.TransArray['Alert'],
                                                                subTitle: this.TransArray['This phone number already exists'],
                                                                buttons: [this.TransArray['OK']]
                                                            });
                                                            alert.present();
                                                        }
                                                    });
                                                } else if (res.result == 'CODE_INCORRECT') {
                                                    //alert not correct code
                                                    window['plugins'].spinnerDialog.hide();
                                                    let alert = this.alertCtrl.create({
                                                        title: this.TransArray['Alert'],
                                                        subTitle: this.TransArray['The code you entered is not correct'],
                                                        buttons: [this.TransArray['OK']]
                                                    });
                                                    alert.present();
                                                }
                                            }, (err) => {
                                                window['plugins'].spinnerDialog.hide();
                                                console.log(err);
                                            });
                                        }
                                    }]
                                });
                                prompt.present();
                            } else if (res.data.result == 'PHONE_ALREADY_EXISTS') {
                                //this number is used
                               //window['plugins'].spinnerDialog.hide();
                                let alert = this.alertCtrl.create({
                                    title: this.TransArray['Alert'],
                                    subTitle: this.TransArray['This phone number already exists'],
                                    buttons: [this.TransArray['OK']]
                                });
                                alert.present();
                                this.editphone = !this.editphone;
                            }
                        } else {
                            console.log('not 200 ');
                            console.log(res);
                        }
                    }, (err) => {
                        window['plugins'].spinnerDialog.hide();
                        console.log(err);
                    });
                }



            }
        //});
    }
    saveEmail() {

          if(!this.globaldataservice['is_connected']){
                let toast = this.toastCtrl.create({
                  message: this.TransArray['No network connection'],
                  duration: 4000,
                  position: 'bottom',
                  cssClass:'lostconnect'
                });

                toast.present();
          }else{
          if(this.email != this.customer.email){
        window['plugins'].spinnerDialog.show( null,this.TransArray["Please wait..."], true);
        let email_tmp = Object.assign({}, this.customer);
        email_tmp.email = this.email;
        this.authservice.setCustomer(email_tmp,this.navCtrl).subscribe((res) => {
            window['plugins'].spinnerDialog.hide();
            if (res.status == 200) {
                this.customer = res.data;
                this.editemail = !this.editemail;
                this.changeref.detectChanges();
            } else {
                console.log(res.data);
            }
        }, (err) => {
            window['plugins'].spinnerDialog.hide();
            console.log('err');
            console.log(err);
            if (err.data.result.email != null) {
                let alert = this.alertCtrl.create({
                    title: this.TransArray['Alert'],
                    subTitle: this.TransArray['This email already exists'],
                    buttons: [this.TransArray['OK']]
                });
                alert.present();
            }
            //throw err
        });

      }else{
        this.editemail = !this.editemail;
      }


          }


    }
    ionViewCanEnter(){
            this.storage.get('PROFILE').then((val)=>{

          if(val!=null && val != ""){
                this.profile = JSON.parse(val);
                this.globaldataservice['PROFILE'] = this.profile;
          }
      });
      this.storage.get('CUSTOMER').then((val)=>{
          if(val!=null && val != ""){
                this.customer = JSON.parse(val);

                this.username = this.customer.user.username;
                this.phone = this.customer.phone;
                this.email = this.customer.email;
                    this.globaldataservice['CUSTOMER'] = this.customer;
                    return true;
          }else{
                return false;
          }
      });
    }


    /*ionViewDidLoad() {
        this.authservice.getProfile().subscribe((res) => {
            this.profile = res;
            console.log("alohaaaaa");
            console.log(res);
        }, (err) => {
            //throw err
        });
        this.authservice.getCustomer().subscribe((res) => {
            this.customer = res;
            this.username = res.user.username;
            this.phone = res.phone;
            this.email = res.email;
            console.log("alohaaaaa");
            console.log(res);
        }, (err) => {
            //throw err
        });
    }*/

 /*       ionViewWillLeave(){
   let options: NativeTransitionOptions = {
    direction: 'down',
    duration: 350,
    slowdownfactor: 5,
    slidePixels: 20,
    iosdelay: 100,
    androiddelay: 150,
    fixedPixelsTop: 0,
    fixedPixelsBottom: 0
   };

 this.nativePageTransitions.slide(options)
 }*/
  ionViewWillEnter(){
      this.language = this.translate.currentLang ;
      this.translate.get(['No network connection','Alert','Please wait...',
            'This username already exists','Phone number verification',
            'Please enter the code we sent you','This phone number already exists',
            'The code you entered is not correct','This email already exists','OK']).subscribe(
      value => {
         this.TransArray = value;
      }
    )
  }

}
