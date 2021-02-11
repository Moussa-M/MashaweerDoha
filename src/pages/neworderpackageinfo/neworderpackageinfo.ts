import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  IonicPage,
  PopoverController,
  NavController,
  LoadingController,
  ViewController,
  AlertController,
  ToastController,
  ActionSheetController,
  Content,
  NavParams, App, Scroll,normalizeURL
} from 'ionic-angular';

import {
  Validators,
  FormBuilder,
  FormGroup
} from '@angular/forms';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

import { Camera } from '@ionic-native/camera';

import {
  Order
} from "../../models/Order";
import {
  OrderService
} from '../../providers/services/orderservice'
import {
  Network
} from '@ionic-native/network';
import {
  Platform, Slides
} from 'ionic-angular';

import {
  AuthService, GlobalDataService
} from '../../providers/services/auth'

import 'rxjs/add/operator/map';
import 'rxjs/util/isNumeric';
import {HomePage} from '../home/home';
import {LoginPage} from '../login/login';
import {OrderLoginPage} from '../orderlogin/orderlogin';
//import $ from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular';

declare var cordova:any;
@IonicPage()
@Component({
  selector: 'page-neworderpackageinfo',
  templateUrl: 'neworderpackageinfo.html'
})

export class NewOrderPackageInfo {
  @ViewChild(Content) content: Content;
  @ViewChild(Scroll) scroll: Scroll;
  @ViewChild(Slides) slides: Slides;
  public language: string;
  public TransArray: any;
  private newOrderForm: FormGroup;
  public mask = ['+', '(', '9', '7', '4', ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]
  public map: any;
  public recieverMe: boolean = true;
  public shopping: boolean = false;
  public isSubmitted: boolean = false;
  errorMessage: any;
  orderservice: OrderService;
  private authservice: AuthService;
  public order: Order;
  public polyline: any;
  public pickUPT: any;
  public P_IMG = null;
  //map vars
  private changeref: any;
  private platform: any;
  private network: any;

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public translate: TranslateService,
    public appCtrl: App,
    public globaldataservice: GlobalDataService,
    public elm: ElementRef,
    public actionSheet: ActionSheetController,
    private camera: Camera, private transfer: FileTransfer,
    public params: NavParams,
    authservice: AuthService, public alertCtrl: AlertController,
    network: Network, platform: Platform, public toastCtrl: ToastController,
    public loadingCtrl: LoadingController, public popoverCtrl: PopoverController,
    orderservice: OrderService, public viewCtrl: ViewController,
    private formBuilder: FormBuilder, changeref: ChangeDetectorRef) {
    this.platform = platform;
    this.network = network;
    this.authservice = authservice;
    this.changeref = changeref;

    this.orderservice = orderservice;

    //form init
    this.newOrderForm = this.formBuilder.group({
      // 'location': this.formBuilder.group({
      //     'pick_up_name': ['',],
      //     'drop_off_name': ['',],
      //     'drop_off_lat': ['',],
      //     'drop_off_long': ['',],
      //     'pick_up_lat': ['',],
      //     'pick_up_long': ['',],
      //     'distance': ['',],
      //     'duration': ['',],
      // }),
      'order_payment': this.formBuilder.group({
        'delivery_price': [0,],
        'package_price': ['', Validators.maxLength(8)],
      }),
      'reciever_phone': ['',],
      'shopping': [false,]
    });


    this.order = this.newOrderForm.value;
    this.order = params.get("order");
    this.P_IMG = this.order.package.img;
  }



  recieverMe_toggle() {
    this.recieverMe = !this.recieverMe;
    if (this.recieverMe) {
      this.order.reciever_phone = this.globaldataservice['USER'].phone;
    } else {
      this.order.reciever_phone = "";
    }
  }
  shopping_toggle() {
    this.order.shopping = !this.order.shopping;
    //this.order.order_payment.package_price=0;
  }
  recieverMe_changed() {
    //this.changeref.detectChanges();
    setTimeout(() => {
      //this.changeref.detectChanges();
    }, 1000);
  }
  isFormValid() {
    return !this.isSubmitted && ((this.newOrderForm.valid && this.recieverMe) ||
      (this.newOrderForm.valid && !this.recieverMe &&
        (this.order.reciever_phone.length == 17 || this.order.reciever_phone.length == 16)));
  }
  phone_blur() {
    this.newOrderForm.controls["reciever_phone"].setValue(this.newOrderForm.value.reciever_phone.replace(/_/g, '').substring(0, 16));
  }

  ngAfterViewInit() {
    // this.content.ionScrollStart.subscribe(()=>{
    //       document.getElementById("nocursor").style.cursor="default";
    //
    // });
    // this.content.ionScrollEnd.subscribe(()=>{
    //       document.getElementById("nocursor").style.cursor="none";
    //
    // });
  }

  input_focus() {
    //  document.getElementById('nocursor').style.cursor = 'default';
  }

  dismiss(data) {
    //let data = { 'foo': 'bar' };
    this.viewCtrl.dismiss();
  }

  addOrder() {
    if(this.globaldataservice['AUTHENTICATED']){
      console.log('order submited');
      this.submit_order();
    }else{
      this.events.subscribe('LOGGED_IN',(logged)=>{
          if(logged){
            setTimeout(()=>{
              console.log('order submited');
                this.submit_order();
            },1000);

          }else{
            //
          }
          this.events.unsubscribe('LOGGED_IN');
      });
      this.navCtrl.push(OrderLoginPage);
    }

  }

public submit_order(){
  if (this.isSubmitted == false) {
    this.isSubmitted = true;
    //this.platform.ready().then(() => {
    if (this.network.type === 'none') {
      this.isSubmitted = false;
      let toast = this.toastCtrl.create({
        message: this.TransArray['No network connection'],
        duration: 5000,
        position: 'bottom',
        cssClass: 'lostconnect'
      });
      toast.present();
    } else {

      // this.authservice.is_authenticated(true).then((res) => {
      // }, (err) => {
      //     this.navCtrl.setRoot(LoginPage);
      // });
      window['plugins'].spinnerDialog.show(null, this.TransArray["Please wait..."], true);

      //this.order = this.newOrderForm.value;
      //console.log("this.order");
      if (!this.order.shopping) {
        this.order.order_payment.package_price = 0;
      }
      if (isNaN(+this.order.order_payment.package_price) || this.order.order_payment.package_price.toString() == '') {
        this.order.order_payment.package_price = 0;
      }
      if (this.recieverMe) {
        this.order.reciever_phone = this.globaldataservice['USER'].phone;
      }
      //plugin fix
      this.order.reciever_phone = this.order.reciever_phone.replace(/_/g, '');
      this.order.reciever_phone = this.order.reciever_phone.replace(/_/g, '');
      this.order.reciever_phone = this.order.reciever_phone.substring(0, 16);
      //plugin fix end

      this.order.package.img = null;
      this.orderservice.addOrder(this.order, this.navCtrl).subscribe(
        (res) => {

          window['plugins'].spinnerDialog.hide();
          let order = res.data;
          let status = res.status;
          if (status === 201) {
            this.uploadImage(this.P_IMG, order);

          } else {
            this.isSubmitted = false;
            let alert = this.alertCtrl.create({
              title: this.TransArray['Oops !'],
              subTitle: this.TransArray['Could not establish connection with the server,check your internet connection!'],
              buttons: [this.TransArray['OK']],
            });
            alert.present();
            //to the phone verfication
            //this.navCtrl.setRoot(PhoneConfirmationPage);
          }
        }, (error) => {
          this.isSubmitted = false;
          window['plugins'].spinnerDialog.hide();
          console.log(error);

        });

    }
    //});
  }
}

  public goBack() {
    this.events.publish('order:updated:info', { 'order': this.order, 'status': 'backbtn' });
    this.viewCtrl.dismiss({ 'order': this.order, 'status': 'backbtn' });
  }

  changePackageImg() {
    let actionSheet = this.actionSheet.create({
      title: this.TransArray['Choose Picture Source'],
      buttons: [
        {
          text: this.TransArray['Gallery'],
          icon: 'albums',
          handler: () => {
            this.actionHandler(1);
          }
        },
        {
          text: this.TransArray['Camera'],
          icon: 'camera',
          handler: () => {
            this.actionHandler(2);
          }
        },
        {
          text: this.TransArray['Cancel'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    if (this.P_IMG != null) {
      actionSheet.addButton({
        text: this.TransArray['Remove'],
        role: 'destructive',
        icon: 'ios-trash-outline',
        handler: () => {
          this.removePackageImg();
          this.refreshBtn();
          return true;
        }
      });
    }

    actionSheet.present();



  }


  //}

  actionHandler(selection: any) {



    var options: any;

    if (selection == 1) {
      options = {
        quality: 75,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 600,
        targetHeight: 600,
        //saveToPhotoAlbum: false
      };
    } else {
      options = {
        quality: 75,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: this.camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 600,
        targetHeight: 600,
        //saveToPhotoAlbum: true
      };
    }

    cordova.plugins.diagnostic.requestCameraAuthorization(
      (status) => {
        if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {
          this.camera.getPicture(options).then((imgUrl) => {
            // window['resolveLocalFileSystemURL'](imgUrl, (fileEntry) =>{
            //     console.log("got file: " + fileEntry.fullPath);
            //     console.log('cdvfile URI: ' + fileEntry.toInternalURL());
            //     console.log(imgUrl);
            //     let ran = Math.floor(Math.random() * 1000);
            //     this.P_IMG = imgUrl + "?ran=" + ran;
            //     this.order.package.img = imgUrl;
            //     this.changeref.detectChanges();
            // });
            //replace(/^file:\/\//, '');
            console.log(imgUrl);
            //normalizeURL(imgUrl)
            let ran = Math.floor(Math.random() * 1000);
            this.P_IMG = normalizeURL(imgUrl)+ "?ran=" + ran;
            this.order.package.img = normalizeURL(imgUrl);
            this.changeref.detectChanges();

          }, (err) => {

          });
        } else {
          let alert = this.alertCtrl.create({
            title: this.TransArray['Camera access is off'],
            subTitle: this.TransArray['In order choose a image please enable access to camera.'],
            buttons: [{
              text: this.TransArray['OK'],
              handler: () => {
                alert.dismiss();
                return false;
              }
            }]
          });
          alert.present();
        }
      }, function(error) {

      }, false
    );
  }

   getFileEntry(imgUri) {
            window['resolveLocalFileSystemURL'](imgUri, function success(fileEntry) {
                console.log("got file: " + fileEntry.fullPath);
                console.log('cdvfile URI: ' + fileEntry.toInternalURL());
                return fileEntry.toInternalURL();
            });
        }

  uploadImage(img, order) {
    if (img) {
      const fileTransfer: FileTransferObject = this.transfer.create();
      let token = this.globaldataservice['USER'].token;
      let options1: FileUploadOptions = {
        fileKey: 'order_img',
        fileName: 'order_img',
        httpMethod: 'PUT',
        headers: { 'Authorization': "Bearer " + token }
      }

      window['plugins'].spinnerDialog.show(null, this.TransArray["Uploading image..."], true);

      let uri = encodeURI('https://www.mashaweerdoha.com/api/order/' + order.id + '/upload_image/');
      fileTransfer.upload(img, uri, options1)
        .then((data) => {
          this.orderservice.getOrder(order.id).subscribe((res) => {
            this.isSubmitted = false;
            window['plugins'].spinnerDialog.hide();
            this.order = res.data;
            this.navCtrl.setRoot(HomePage);
            // let firstViewCtrl = this.navCtrl.first();
            // this.navCtrl.popToRoot({ animate: false }).then(() => {
            //   firstViewCtrl.dismiss();
            //   setTimeout(() => {
            //     this.events.publish('order:created', this.order);
            //   }, 200);
            // });


            //this.viewCtrl.dismiss({'order':this.order,'status':'done'});
            //this.navCtrl.setRoot(HomePage);
          }, (err) => {
            this.isSubmitted = false;
            window['plugins'].spinnerDialog.hide();
            this.navCtrl.setRoot(HomePage);
            // let firstViewCtrl = this.navCtrl.first();
            // this.navCtrl.popToRoot({ animate: false }).then(() => {
            //   firstViewCtrl.dismiss();
            //   setTimeout(() => {
            //     this.events.publish('order:created', order);
            //   }, 200);
            // });
          });

        });
    } else {
      //window['plugins'].spinnerDialog.hide();
      this.isSubmitted = false;
      this.navCtrl.setRoot(HomePage);
      // let firstViewCtrl = this.navCtrl.first();
      // this.navCtrl.popToRoot({ animate: false }).then(() => {
      //   firstViewCtrl.dismiss();
      //   setTimeout(() => {
      //     this.events.publish('order:created', order);
      //   }, 200);
      // });
    }

  }
  removePackageImg() {
    //e.stopPropagation();
    this.P_IMG = null;
    this.order.package.img = null;
    this.changeref.detectChanges();
  }
  refreshBtn() {
    this.changeref.detectChanges();
  }
  getProfileImageStyle() {
    return 'url(' + this.P_IMG + ')'
  }

  ionViewWillEnter() {
    this.slides.lockSwipes(true);
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    this.language = this.translate.currentLang;
    this.translate.get(['No network connection', 'Remove', 'More', 'Edit', 'Close', 'Alert', 'Please wait...', 'OK',
      'Order', 'Order Actions', 'Open', 'Cancel', 'Order assigned', 'Gallery', 'Camera',
      'This order been assigned to you successfully', 'Oops !', 'Location services is off', 'In order to get your current location please enable location services.',
      'Could not establish connection with the server,check your internet connection!',
      'Order unassigned', 'This order has been removed from your list', 'Awesome', 'Choose Picture Source',
      'Order picked up', 'This order has been picked up successfully', 'Order dropped off',
      'This order has been dropped off successfully', 'Filter orders', 'Waiting', 'Accepted', 'Picked Up', 'Delivered',
      'Filter', 'Loading orders...', 'This location is not allowed', 'Okay', 'Uploading image...',
      'Confirm order remove', 'Delivery Confirmed', 'Your order has been marked as delivered',
      'You will no longer have access to this order,Are you sure you want remove it ?', 'Cancel', 'Pick Up address', 'Drop Off address',
      'Confirm', 'We really appreciate your feed back.', 'We will make sure that any inconveniences won\'t happen next time.',
      'Thank you for your feed back we will make it better next time.', 'Thank you', 'In order choose a image please enable access to camera.',
      'Your account has been logged out,please login again', 'Camera access is off']).subscribe(
      value => {
        this.TransArray = value;
      }
      )

    cordova.plugins.Keyboard.close();
    //check the user is authentice
  }

  ionViewWillLeave() {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
  }



  next() {
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slides.lockSwipes(true);
  }

  prev() {
    this.slides.lockSwipes(false);
    this.slides.slidePrev();
    this.slides.lockSwipes(true);
  }


}
