import {
    Component,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    OnInit
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
    AuthService, GlobalDataService
} from '../../providers/services/auth'

import { NewOrderPackagePage } from '../neworderpackage/neworderpackage';

import 'rxjs/add/operator/map';
import 'rxjs/util/isNumeric';
import * as moment from 'moment';
//import $ from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular';


@IonicPage()
@Component({
    selector: 'page-newordertime',
    templateUrl: 'newordertime.html'
})

export class NewOrderTimePage implements OnInit{
    @ViewChild(Content) content: Content;

    private newOrderForm: FormGroup;

    public formOk = false;
    public language: string;
    public pickupMIN: any;
    public TransArray: any;
    errorMessage: any;
    orderservice: OrderService;
    private authservice: AuthService;
    public order: Order;
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
    public pickup_time_asap:boolean=true;
    public dropoff_time_asap:boolean=true;
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
        this.buyable = false;

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
                'delivery_price': ['',],
                'package_price': ['',],
            }),
            'pickup_time': ['ASAP', Validators.required],
            'dropoff_time': ['ASAP', Validators.required],
            'package': this.formBuilder.group({
                'title': ['', ],
                'note': ['',],
            }),
            'reciever_phone': ['', ],
            'pickup_time_asap': [true, ],
            'dropoff_time_asap': [true, ],
            'shopping': [false, ]
        });

        this.order = this.newOrderForm.value;
        //this.order = params.get("order");
        //pickup & dropoff time init

        this.order = params.get("order");
        //this.order.reciever_phone = this.order.reciever_phone.replace(/_/g, '');
        //this.order.reciever_phone = this.order.reciever_phone.substring(0, 16);
        // this.order.package.img = this.P_IMG;
        let now = moment();
        this.pickupMIN = moment();
        this.pickup_time_min = moment(now, moment.ISO_8601).format();
        this.dropoff_time_min = moment(moment().add(1, 'hour'), moment.ISO_8601).format();
        this.pickup_time_max = moment(moment().add(2, 'month'), moment.ISO_8601).format();
        this.dropoff_time_max = moment(moment().add(2, 'month').add(1, 'hour'), moment.ISO_8601).format();
        this.order.pickup_time = this.pickup_time_min;
        this.order.dropoff_time = this.dropoff_time_min;

        //this.order.reciever_phone = this.globaldataservice['USER'].phone;
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

        let temp = moment(this.pickupMIN);
        this.dropoff_time_min = moment(temp.add(1, 'hour'), moment.ISO_8601).format();
        this.dropoff_time_max = moment(temp.add(2, 'month').add(1, 'hour'), moment.ISO_8601).format();
        this.order.dropoff_time = this.dropoff_time_min;

        this.changeref.detectChanges();

    }


    pickup_changed(val) {
        let temp = moment(val);
        this.pickupMIN = moment(val);
        this.dropoff_time_min = moment(temp.add(1, 'hour'), moment.ISO_8601).format();
        this.dropoff_time_max = moment(temp.add(2, 'month').add(1, 'hour'), moment.ISO_8601).format();
        this.order.dropoff_time = this.dropoff_time_min;

    }
    isFormValid(){
        return this.newOrderForm.valid;
    }
    ngOnInit() {

    }

    dismiss(data) {
        //let data = { 'foo': 'bar' };
        this.viewCtrl.dismiss();
    }

    orderPackage() {
        this.platform.ready().then(() => {

              this.navCtrl.push(NewOrderPackagePage, { "order": this.order });
               this.events.subscribe('order:updated:package', (data) => {
                 if(data != null){
                     let order = data.order;
                     if(data.status=='backbtn'){
                         this.order = order;
                     }
                 }
              });


        });
    }

    public goBack() {
        this.events.publish('order:updated:time', {'order':this.order,'status':'backbtn'});
        this.viewCtrl.dismiss({'order':this.order,'status':'backbtn'});
    }

    refreshBtn(e){
           this.changeref.detectChanges();
    }

    ionViewWillEnter(){
    this.language = this.translate.currentLang ;
    this.translate.get([
     'No network connection map won\'t operate as expected','Call agent ?','Phone','Call','Cancel']).subscribe(
    value => {
       this.TransArray = value;
    }
  )
}
}
