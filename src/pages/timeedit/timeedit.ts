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
    NavParams, App,ModalController
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
import * as moment from 'moment';
//import $ from 'jquery';

import { Events } from 'ionic-angular';
import loadash from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'page-timeedit',
    templateUrl: 'timeedit.html'
})

export class TimeEditPage{
    @ViewChild(Content) content: Content;

    private editOrderForm: FormGroup;

    public formOk = false;
    public language :string;
    public TransArray:any;
    public pickupMIN: any;
    errorMessage: any;
    orderservice: OrderService;
    private authservice: AuthService;
    public order: Order;
    public cloneorder: Order;
    public polyline: any;
    private pickup_time_min: any;
    private dropoff_time_min: any;
    private pickup_time_max: any;
    private dropoff_time_max: any;
    public pickUPT: any;
    public P_IMG=null;
    //map vars
    private changeref: any;
    private buyable: Boolean;
    private platform: any;
    private network: any;
    //public pickup_time_asap:boolean=true;
    //public dropoff_time_asap:boolean=true;
    constructor(
      public modalCtrl: ModalController,
        public navCtrl: NavController,
        public translate: TranslateService,
        public events: Events,
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
        this.initPage();

    }
    initPage(){


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
            'delivery_price': ['',],
            'package_price': ['',],
        }),
        'pickup_time': ['', Validators.required],
        'dropoff_time': ['', Validators.required],
        'package': this.formBuilder.group({
            'title': ['', ],
            'note': ['',],
        }),
        'reciever_phone': ['', ],
        'pickup_time_asap': [false,],
        'dropoff_time_asap': [false, ],
        'shopping': ['', ]

    });

      this.order = this.params.get("order");


    let now = moment();
    this.pickupMIN = moment();
    this.pickup_time_min = moment(now, moment.ISO_8601).format();
    this.dropoff_time_min = moment(moment().add(1, 'hour'), moment.ISO_8601).format();
    this.pickup_time_max = moment(moment().add(2, 'month'), moment.ISO_8601).format();
    this.dropoff_time_max = moment(moment().add(2, 'month').add(1, 'hour'), moment.ISO_8601).format();

    //if(!this.order.pickup_time_asap){
      this.order.pickup_time = moment(this.order.pickup_time, moment.ISO_8601).format();
    //}
    //if(!this.order.dropoff_time_asap){
      this.order.dropoff_time = moment(this.order.dropoff_time, moment.ISO_8601).format();
    //}
    this.cloneorder = JSON.parse(JSON.stringify(this.order));
    //this.order.reciever_phone = this.globaldataservice['USER'].phone;
    console.log(JSON.stringify(this.order));
    }



    isFormValid(){
      console.log(this.order.dropoff_time_asap);
      let changed = !loadash.isEqual(this.order, this.cloneorder);
      console.log(this.order.dropoff_time_asap);
        return changed;
    }

    pickup_toggle(){
      if(this.order.pickup_time_asap==false){

        this.pickupMIN = moment();
        this.pickup_time_min = moment(moment(), moment.ISO_8601).format();
        this.pickup_time_max = moment(moment().add(2, 'month'), moment.ISO_8601).format();
        this.order.pickup_time = this.pickup_time_min;


          this.dropoff_time_min = moment(moment().add(1, 'hour'), moment.ISO_8601).format();
          this.dropoff_time_max = moment(moment().add(1, 'hour').add(2, 'month'), moment.ISO_8601).format();
          this.order.dropoff_time = this.dropoff_time_min;



        this.changeref.detectChanges();

      }else{

        this.pickupMIN = moment().add(1, 'hour');
        this.pickup_time_min = moment(moment().add(1, 'hour'), moment.ISO_8601).format();
        this.pickup_time_max = moment(moment().add(1, 'hour').add(2, 'month'), moment.ISO_8601).format();
        this.order.pickup_time = this.pickup_time_min;

        this.dropoff_time_min = moment(moment().add(2, 'hour'), moment.ISO_8601).format();
        this.dropoff_time_max = moment(moment().add(2, 'hour').add(2, 'month'), moment.ISO_8601).format();
        this.order.dropoff_time = this.dropoff_time_min;

        this.changeref.detectChanges();
      }
    }
    dropoff_toggle(){
        console.log("drop of time toggle");
        let temp = moment(this.pickupMIN);
        this.dropoff_time_min = moment(temp.add(1, 'hour'), moment.ISO_8601).format();
        this.dropoff_time_max = moment(temp.add(2, 'month').add(1, 'hour'), moment.ISO_8601).format();
        this.order.dropoff_time = this.dropoff_time_min;

        this.changeref.detectChanges();

    }


    pickup_changed(val) {
      console.log("pickup_time chqnged");
        let temp = moment(val);
        this.pickupMIN = moment(val);
        this.dropoff_time_min = moment(temp.add(1, 'hour'), moment.ISO_8601).format();
        this.dropoff_time_max = moment(temp.add(2, 'month').add(1, 'hour'), moment.ISO_8601).format();
        this.order.dropoff_time = this.dropoff_time_min;

    }

    dismiss(data) {
        //let data = { 'foo': 'bar' };
        this.viewCtrl.dismiss();
    }

    doneEditing() {
          this.platform.ready().then(() => {
            if (this.network.type === 'none') {
              let toast = this.toastCtrl.create({
                message: 'No network connection',
                duration: 5000,
                position: 'bottom',
                cssClass: 'lostconnect'
              });

              toast.present();
            } else {

              this.authservice.is_authenticated(true).then((res) => {

                window['plugins'].spinnerDialog.show(null, "Please wait...", true);

                if (isNaN(+this.order.order_payment.package_price) || this.order.order_payment.package_price.toString() == '') {
                  this.order.order_payment.package_price = 0;
                }

                this.order.reciever_phone = this.order.reciever_phone.replace(/_/g, '');
                this.order.reciever_phone = this.order.reciever_phone.substring(0, 16);
                delete this.order.package.img;
                delete this.order.package.thumbnail;
                delete this.order.package.thumbnail_ph;
                if (this.order.order_payment.package_price == null) {
                  this.order.order_payment.package_price = 0;
                }
                this.orderservice.editOrder(this.order, this.navCtrl).subscribe(
                  (res) => {
                    window['plugins'].spinnerDialog.hide();
                    this.events.publish('order:updated', res.data);
                    this.viewCtrl.dismiss();
                  },
                  (error) => {

                    window['plugins'].spinnerDialog.hide();

                  });
              }, (err) => {
                this.navCtrl.setRoot(LoginPage);
              });

            }
          });
    }


    isBuyAble() {
        this.buyable = !this.buyable;
    }


    public goBack() {
        this.viewCtrl.dismiss({'order':this.order,'status':'backbtn'});
    }



    refreshBtn(e){
           this.changeref.detectChanges();
    }

    ionViewWillEnter(){
        this.language = this.translate.currentLang ;
         this.translate.get(['Choose a language','Apply','Cancel','Please wait...']).subscribe(
        value => {
           this.TransArray = value;
        }
      )


    }
}
