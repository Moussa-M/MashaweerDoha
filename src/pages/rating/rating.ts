import { Component,ViewChild } from '@angular/core';
import { IonicPage,App, NavController, ViewController,
  LoadingController, AlertController, NavParams,
 ToastController, Platform } from 'ionic-angular';
//import { IonicPage } from 'ionic-angular';
import { AuthService } from '../../providers/services/auth'
import { OrderService } from '../../providers/services/orderservice'
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-rating',
  templateUrl: 'rating.html',
  providers: [AuthService]
})
export class RatingPage {
@ViewChild('note') myInput ;
  public stars;
  public timing:number=5;
  public fare:boolean=false;
  public treatment:number=5;
  public overall:number=5;

  public rate = { "note": "","stars":5 };
  public order;
  public language: string;
  public TransArray: any;
  constructor(
    public appCtrl: App,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public platform: Platform,
    public network: Network,
    public navCtrl: NavController,
    public params: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public authservice: AuthService,
    public orderservice: OrderService) {
          this.order = params.get("order");
  }

dismiss(){
  this.viewCtrl.dismiss();
}
  submitRating() {


    this.platform.ready().then(() => {
      if (this.network.type === 'none') {
        let toast = this.toastCtrl.create({
          message: this.TransArray['No network connection'],
          duration: 5000,
          position: 'bottom',
          cssClass: 'lostconnect'
        });

        toast.present();
      } else {
          window['plugins'].spinnerDialog.show( null,this.TransArray["Please wait..."], true);
          let note = "timing:"+this.timing+"treatment:"+this.treatment+"overall:"+this.overall;
          this.orderservice.rateDelivery(this.order, note, this.rate.stars).subscribe(
            (res) => {
              window['plugins'].spinnerDialog.hide();
              let status = res.status;
              if (status === 200) {
                this.viewCtrl.dismiss({ 'submitted': true, 'stars': this.rate.stars });

              } else {
                let alert = this.alertCtrl.create({
                  title: this.TransArray['Oops !'],
                  subTitle: this.TransArray['Could not establish connection with the server,check your internet connection!'],
                  buttons: [this.TransArray['OK']],
                });
                alert.present();

                //to the phone verfication
                //this.navCtrl.setRoot(PhoneConfirmationPage);
              }
            },
            (error) => {
              window['plugins'].spinnerDialog.hide();
              console.log(error);
              /*let alert = this.alertCtrl.create({
                   title: 'Wrong credintals !',
                   subTitle: error,
                   buttons: ['OK']
                 });
                 alert.present();
              this.errorMessage = <any>error*/
            });


      }
    });

  }
   ionViewDidLoad() {
    setTimeout(() => {
      this.myInput.setFocus();
    },150);

 }

 ionViewWillEnter(){
 this.language = this.translate.currentLang;
 this.translate.get(['No network connection','Remove','More','Edit','Close', 'Alert', 'Please wait...', 'OK',
 'Order', 'Order Actions', 'Open', 'Cancel', 'Order assigned',
 'This order been assigned to you successfully', 'Oops !','Location services is off','In order to get your current location please enable location services.',
 'Could not establish connection with the server,check your internet connection!',
 'Order unassigned', 'This order has been removed from your list', 'Awesome',
 'Order picked up', 'This order has been picked up successfully', 'Order dropped off',
 'This order has been dropped off successfully', 'Filter orders', 'Waiting', 'Accepted', 'Picked Up', 'Delivered',
 'Filter', 'Loading orders...','This location is not allowed','Okay',
 'Confirm order remove','Delivery Confirmed','Your order has been marked as delivered',
 'You will no longer have access to this order,Are you sure you want remove it ?','Cancel','Pick Up address','Drop Off address',
 'Confirm','We really appreciate your feed back.','We will make sure that any inconveniences won\'t happen next time.',
 'Thank you for your feed back we will make it better next time.','Thank you']).subscribe(
 value => {
 this.TransArray = value;
 }
 )


 }

}
