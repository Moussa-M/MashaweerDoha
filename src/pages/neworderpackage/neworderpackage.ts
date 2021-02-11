import {
    Component,
    ViewChild,
    ElementRef,
    ChangeDetectorRef
} from '@angular/core';
import {
  IonicPage,
    PopoverController,ModalController,
    NavController,
    LoadingController,
    ViewController,
    AlertController,
    ToastController,
    ActionSheetController,

    NavParams, App
} from 'ionic-angular';
import {
    Validators,
    FormBuilder,
    FormGroup
} from '@angular/forms';


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
    Platform,Slides
} from 'ionic-angular';

import {
    AuthService, GlobalDataService
} from '../../providers/services/auth'

import { NewOrderPackageInfo } from '../neworderpackageinfo/neworderpackageinfo';

import 'rxjs/add/operator/map';
import 'rxjs/util/isNumeric';

//import $ from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular';

declare var cordova;


@IonicPage()
@Component({
    selector: 'page-neworderpackage',
    templateUrl: 'neworderpackage.html'
})

export class NewOrderPackagePage{
    //@ViewChild(Content) content: Content;

    @ViewChild(Slides) slides: Slides;
    public language: string;
    public TransArray: any;
    private newOrderForm: FormGroup;

    public mask = ['+', '(', '9', '7', '4', ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]
    public map: any;
    public formOk = false;
    public recieverMe:boolean = true;
    public shopping:boolean = false;
    public isSubmitted:boolean = false;
    errorMessage: any;
    orderservice: OrderService;
    private authservice: AuthService;
    public order: Order;
    public polyline: any;
    public pickUPT: any;
    public P_IMG=null;
    //map vars
    private changeref: any;
    private platform: any;
    private network: any;

    constructor(
        public navCtrl: NavController,
        public modalCtrl: ModalController,
        public events: Events,
          public translate: TranslateService,
        public appCtrl: App,
        public globaldataservice: GlobalDataService,

        public elm: ElementRef,
        public actionSheet: ActionSheetController,
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
                'delivery_price': [0,],
                'package_price': ['',Validators.maxLength(6)],
            }),
            'pickup_time': ['',],
            'dropoff_time': ['',],
            'package': this.formBuilder.group({
                'title': ['', Validators.required],
                'note': ['',],
            }),
            'reciever_phone': ['', ],
            'pickup_time_asap': [true, ],
            'dropoff_time_asap': [true, ],
            'shopping': [false, ]
        });


        this.order = this.newOrderForm.value;
        this.order = params.get("order");
    }

    isFormValid(){
        return this.newOrderForm.valid;
    }

    dismiss(data) {

        this.viewCtrl.dismiss();
    }

    public goBack() {
        this.events.publish('order:updated:package', {'order':this.order,'status':'backbtn'});
        this.viewCtrl.dismiss({'order':this.order,'status':'backbtn'});
    }

    public orderInfo() {
          if(this.isFormValid()){


                 this.navCtrl.push(NewOrderPackageInfo, { "order": this.order });
                 this.events.subscribe('order:updated:info', (data) => {
                   if(data != null){
                       let order = data.order;
                       if(data.status=='backbtn'){
                           this.order = order;
                       }
                   }
                });
              }

    }


    ionViewWillEnter(){
    this.slides.lockSwipes(true);
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    this.language = this.translate.currentLang;
    this.translate.get(['No network connection','Remove','More','Edit','Close', 'Alert', 'Please wait...', 'OK',
    'Order', 'Order Actions', 'Open', 'Cancel', 'Order assigned',
    'This order been assigned to you successfully', 'Oops !','Location services is off','In order to get your current location please enable location services.',
    'Could not establish connection with the server,check your internet connection!',
    'Order unassigned', 'This order has been removed from your list', 'Awesome',
    'Order picked up', 'This order has been picked up successfully', 'Order dropped off',
    'This order has been dropped off successfully', 'Filter orders', 'Waiting', 'Accepted', 'Picked Up', 'Delivered',
    'Filter', 'Loading orders...','This location is not allowed','Okay','Uploading image...',
    'Confirm order remove','Delivery Confirmed','Your order has been marked as delivered',
    'You will no longer have access to this order,Are you sure you want remove it ?','Cancel','Pick Up address','Drop Off address',
    'Confirm','We really appreciate your feed back.','We will make sure that any inconveniences won\'t happen next time.',
    'Thank you for your feed back we will make it better next time.','Thank you',
      'Your account has been logged out,please login again']).subscribe(
    value => {
    this.TransArray = value;
    }
    )
    }

    ionViewWillLeave(){
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }




}
