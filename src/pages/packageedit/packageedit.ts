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
  NavParams, App,normalizeURL
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
  Platform
} from 'ionic-angular';
import {
  LoginPage
} from '../login/login';
import {
  AuthService, GlobalDataService
} from '../../providers/services/auth'

import 'rxjs/add/operator/map';
import 'rxjs/util/isNumeric';


import { Events } from 'ionic-angular';

import loadash from 'lodash';
import { TranslateService } from '@ngx-translate/core';

declare var cordova:any;

@IonicPage()
@Component({
  selector: 'page-packageedit',
  templateUrl: 'packageedit.html'
})

export class PackageEditPage {
  @ViewChild(Content) content: Content;

  @ViewChild('map') theMap: ElementRef;
  //@ViewChild('map') theMap: ElementRef;

  private editOrderForm: FormGroup;
  public mask = ['+', '(', '9', '7', '4', ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]
  public map: any;
  public formOk = false;
  public recieverMe: boolean = true;
  public shopping: boolean = false;
  public isSubmitted: boolean = false;

  public language: string;
  public TransArray: any;
  errorMessage: any;
  orderservice: OrderService;
  private authservice: AuthService;
  public order: Order;
  public polyline: any;

  public pickUPT: any;
  public P_IMG = null;
  public cloneorder: Order;
  public P_IMG_CHANGE: boolean = false;
  //map vars
  private changeref: any;
  private buyable: Boolean;
  private platform: any;
  private network: any;

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    public events: Events,
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
    this.buyable = false;

    this.orderservice = orderservice;

    this.order = params.get("order");
    //form init
    this.editOrderForm = this.formBuilder.group({
      'location': this.formBuilder.group({
        'pick_up_name': ['',],
        'drop_off_name': ['',],
        'drop_off_lat': ['',],
        'drop_off_long': ['',],
        'pick_up_lat': ['',],
        'pick_up_long': ['',],
        'distance': ['',],
        'duration': ['',],
      }),
      'order_payment': this.formBuilder.group({
        'delivery_price': [this.order.order_payment.delivery_price,],
        'package_price': [this.order.order_payment.package_price, Validators.maxLength(6)],
      }),
      'pickup_time': ['',],
      'dropoff_time': ['',],
      'package': this.formBuilder.group({
        'title': ['', Validators.required],
        'note': ['',],
      }),
      'reciever_phone': ['',],
      'pickup_time_asap': [this.order.pickup_time_asap,],
      'dropoff_time_asap': [this.order.dropoff_time_asap,],
      'shopping': [this.order.shopping,]
    });

    //this.order = this.editOrderForm.value;

    //this.order = params.get("order");
    //pickup & dropoff time init

    //console.log(JSON.stringify(this.order));


    this.cloneorder = JSON.parse(JSON.stringify(this.order));
    this.recieverMe = (this.order.reciever_phone == this.globaldataservice['USER'].phone) ? true : false;
    this.P_IMG = this.order.package.img;
    //this.order.reciever_phone = this.order.reciever_phone.replace(/_/g, '');
    //this.order.reciever_phone = this.order.reciever_phone.substring(0, 16);
    // this.order.package.img = this.P_IMG;
    // let now = moment();
    // this.pickup_time_min = moment(now, moment.ISO_8601).format();
    // this.dropoff_time_min = moment(now.add(1, 'hour'), moment.ISO_8601).format();
    // this.pickup_time_max = moment(now.add(6, 'month'), moment.ISO_8601).format();
    // this.dropoff_time_max = moment(now.add(6, 'month').add(1, 'hour'), moment.ISO_8601).format();
    // this.order.pickup_time = this.pickup_time_min;
    // this.order.dropoff_time = this.dropoff_time_min;
    //this.order.reciever_phone = this.globaldataservice['USER'].phone;
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
  }



  recieverMe_toggle() {
    //this.recieverMe = !this.recieverMe;
    if (this.recieverMe) {
      this.order.reciever_phone = this.globaldataservice['USER'].phone;
    } else {
      this.order.reciever_phone = "";
    }
  }
  shopping_toggle() {
    //this.order.shopping = !this.order.shopping;
    //this.order.order_payment.package_price=0;
  }
  recieverMe_changed() {
    //this.changeref.detectChanges();
    setTimeout(() => {
      //this.changeref.detectChanges();
    }, 1000);
  }

  phone_blur() {
    this.editOrderForm.controls["reciever_phone"].setValue(this.editOrderForm.value.reciever_phone.replace(/_/g, '').substring(0, 16));
  }
  isFormValid() {
    let changed = !loadash.isEqual(this.order, this.cloneorder);

    return changed && ((this.editOrderForm.valid && this.recieverMe) ||
      (this.editOrderForm.valid && !this.recieverMe && (this.order.reciever_phone.length == 17 || this.order.reciever_phone.length == 16)));


  }

  ngAfterViewInit() {
    this.content.ionScrollStart.subscribe(() => {
      document.getElementById("nocursor").style.cursor = "default";

    });
    this.content.ionScrollEnd.subscribe(() => {
      document.getElementById("nocursor").style.cursor = "none";

    });
  }
  input_focus() {
    document.getElementById('nocursor').style.cursor = 'default';
  }

  dismiss(data) {
    this.viewCtrl.dismiss();
  }

  doneEditing() {
    if (this.isSubmitted == false) {
      this.isSubmitted = true;

      this.platform.ready().then(() => {
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

          this.authservice.is_authenticated(true).then((res) => {

            window['plugins'].spinnerDialog.show(null, this.TransArray["Please wait..."], true);

            //this.order = this.editOrderForm.value;
            //console.log("this.order");
            if (!this.order.shopping) {
              this.order.order_payment.package_price = 0;
            } else {
              if (isNaN(+this.order.order_payment.package_price) || this.order.order_payment.package_price.toString() == '') {
                this.order.order_payment.package_price = 0;
              }
            }


            if (this.recieverMe) {
              this.order.reciever_phone = this.globaldataservice['USER'].phone;
            }

            //plugin fix
            this.order.reciever_phone = this.order.reciever_phone.replace(/_/g, '');
            this.order.reciever_phone = this.order.reciever_phone.replace(/_/g, '');
            this.order.reciever_phone = this.order.reciever_phone.substring(0, 16);

            //plugin fix end

            delete this.order.package.img;
            delete this.order.package.thumbnail;
            delete this.order.package.thumbnail_ph;
            this.orderservice.editOrder(this.order, this.navCtrl).subscribe(
              (res) => {

                window['plugins'].spinnerDialog.hide();
                let order = res.data;
                let status = res.status;
                if (status === 200) {
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
                /*let alert = this.alertCtrl.create({
                     title: 'Wrong credintals !',
                     subTitle: error,
                     buttons: ['OK']
                   });
                   alert.present();
                this.errorMessage = <any>error*/
              });
          }, (err) => {
            this.navCtrl.setRoot(LoginPage);
          });
        }
      });
    }
  }



  public goBack() {
    this.viewCtrl.dismiss({ 'order': this.order, 'status': 'backbtn' });
  }


  changePackageImg() {
    this.platform.ready().then(() => {
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
      actionSheet.present();






    });

  }


  refreshBtn() {
    this.changeref.detectChanges();
  }
  getProfileImageStyle() {
    return 'url(' + this.P_IMG + ')'
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
        //saveToPhotoAlbum: false
      };
    }

    this.camera.getPicture(options).then((imgUrl) => {

      let ran = Math.floor(Math.random() * 1000);
      let pth = normalizeURL(imgUrl);
      this.P_IMG = pth + "?ran=" + ran;
      this.order.package.img = pth;
      this.P_IMG_CHANGE = true;
      this.changeref.detectChanges();


    });

  }

  uploadImage(img, order) {
    if (this.P_IMG_CHANGE) {
      if (img != null) {
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

            this.orderservice.getOrder(order.id).subscribe(
              (res) => {
                this.isSubmitted = false;
                window['plugins'].spinnerDialog.hide();
                this.order = res.data;

                this.viewCtrl.dismiss();
                this.events.publish('order:updated', this.order);
              }, (err) => {
                this.isSubmitted = false;
                window['plugins'].spinnerDialog.hide();
                let alert = this.alertCtrl.create({
                  title: this.TransArray['Oops !'],
                  subTitle: this.TransArray["Could not establish connection with the server,check your internet connection!"],
                  buttons: [this.TransArray['OK']],
                });
                alert.present();
              });

          });
      } else {
        this.orderservice.removeOrderImg(order.id).subscribe(
          (res) => {
            this.isSubmitted = false;
            window['plugins'].spinnerDialog.hide();
            this.order = res.data;

            this.viewCtrl.dismiss();
            this.events.publish('order:updated', this.order);
          }, (err) => {
            this.isSubmitted = false;
            window['plugins'].spinnerDialog.hide();
            let alert = this.alertCtrl.create({
              title: this.TransArray['Oops !'],
              subTitle: this.TransArray["Could not establish connection with the server,check your internet connection!"],
              buttons: [this.TransArray['OK']],
            });
            alert.present();
          });

      }
    } else {
      window['plugins'].spinnerDialog.hide();
      this.isSubmitted = false;
      this.viewCtrl.dismiss();
      this.events.publish('order:updated', order);
    }


  }
  removePackageImg() {
    this.P_IMG_CHANGE = true;
    this.P_IMG = null;
    this.changeref.detectChanges();
  }

  ionViewWillEnter() {
    this.language = this.translate.currentLang;
    this.translate.get(['No network connection', 'Remove', 'More', 'Edit', 'Close', 'Alert', 'Please wait...', 'OK',
      'Order', 'Order Actions', 'Open', 'Cancel', 'Order assigned',
      'This order been assigned to you successfully', 'Oops !', 'Location services is off', 'In order to get your current location please enable location services.',
      'Could not establish connection with the server,check your internet connection!',
      'Order unassigned', 'This order has been removed from your list', 'Awesome',
      'Order picked up', 'This order has been picked up successfully', 'Order dropped off',
      'This order has been dropped off successfully', 'Filter orders', 'Waiting', 'Accepted', 'Picked Up', 'Delivered',
      'Filter', 'Loading orders...', 'This location is not allowed', 'Okay', 'Uploading image...',
      'Confirm order remove', 'Delivery Confirmed', 'Your order has been marked as delivered',
      'You will no longer have access to this order,Are you sure you want remove it ?', 'Cancel', 'Pick Up address', 'Drop Off address',
      'Confirm', 'We really appreciate your feed back.', 'We will make sure that any inconveniences won\'t happen next time.',
      'Thank you for your feed back we will make it better next time.', 'Thank you',
      'Choose Picture Source', 'Gallery', 'Camera']).subscribe(
      value => {
        this.TransArray = value;
      }
      )
  }

    ionViewWillLeave() {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }


}
