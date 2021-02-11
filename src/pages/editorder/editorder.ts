import {
  Component,
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
  NavParams,
  ActionSheetController
} from 'ionic-angular';
import {
  Validators,
  FormBuilder,
  FormGroup
} from '@angular/forms';

import {
  Geolocation
} from '@ionic-native/geolocation';

import {
  LatLng,
} from '@ionic-native/google-maps';

import {
   Order
} from "../../models/Order";
import {
  OrderService
} from '../../providers/services/orderservice'

import { LocationEditPage } from '../locationedit/locationedit';
import { PackageEditPage } from '../packageedit/packageedit';
import { TimeEditPage } from '../timeedit/timeedit';

import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';


import { LoginPage } from '../login/login';
import { AuthService, GlobalDataService } from '../../providers/services/auth'
import { Events } from 'ionic-angular';
//import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import loadash from 'lodash';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

declare var google:any;
declare var plugin:any;
@IonicPage()
@Component({
  selector: 'page-editorder',
  templateUrl: 'editorder.html'
})
export class EditOrderPage {
//  @ViewChild('map') theMap: ElementRef;
  private editOrderForm: FormGroup;
  public language: string;
  public TransArray: string;
  public mask = ['+', '(', '9', '7', '4', ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]
  public map: any;
  errorMessage: any;
  orderservice: OrderService;
  public order: Order;
  public initorder:Order;
  public polyline: any;

  private pickup_time_min: any;
  private dropoff_time_min: any;
  private pickup_time_max: any;
  private dropoff_time_max: any;
  private buyable: Boolean;
  public P_IMG = null;
  public newImage = false;
  //map vars
  private changeref: any;

  public originMarker: any;
  public destMarker: any;

  private platform: any;
  private network: any;
  private authservice: AuthService;
  public destinationAutocomplete: any;
  public originAutocomplete: any;
  constructor(public navCtrl: NavController,
    public events: Events,
    public translate: TranslateService,
    public actionSheet: ActionSheetController,

    public globaldataservice: GlobalDataService,

    authservice: AuthService,
    public alertCtrl: AlertController,
    public params: NavParams,
    network: Network,
    platform: Platform,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public geolocation: Geolocation,
    orderservice: OrderService,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    changeref: ChangeDetectorRef) {
    this.platform = platform;
    this.network = network;
    this.authservice = authservice;

    this.changeref = changeref;
    this.buyable = true;
    this.orderservice = orderservice;

    //form init
    this.editOrderForm = this.formBuilder.group({
      'location': this.formBuilder.group({
        'pick_up_name': ['', Validators.required],
        'drop_off_name': ['', Validators.required],
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
      'pickup_time': ['', [Validators.required,]],
      'dropoff_time': ['', [Validators.required,]],
      'package': this.formBuilder.group({
        'title': ['', Validators.required],
        'note': ['',],
      }),
      'reciever_phone': ['', [Validators.required, Validators.minLength(16),]],
    });

    this.order = params.get("order");
    if(this.order.package.img != null && this.order.package.img != ""){
      let ran = Math.floor(Math.random() * 1000);
      this.P_IMG = this.order.package.img+"?ran="+ran;
    }
    //pickup & dropoff time init
    let now = moment();
    this.pickup_time_min = moment(now, moment.ISO_8601).format();
    this.dropoff_time_min = moment(now.add(1, 'hour'), moment.ISO_8601).format();
    this.pickup_time_max = moment(now.add(6, 'month'), moment.ISO_8601).format();
    this.dropoff_time_max = moment(now.add(6, 'month').add(1, 'hour'), moment.ISO_8601).format();

    //this.order.pickup_time = this.pickup_time_min;
    //this.order.dropoff_time = this.dropoff_time_min;

    platform.ready().then(() => {
          //this.loadMapx();
        });
    //this.editOrderForm.valueChanges.subscribe(data => console.log('Form changes', data));
        /*orderservice.getOrders().subscribe(
      (res)=>{
        console.log(res);
        this.orders = res;
      },
      error =>  this.errorMessage = <any>error
      )*/
      this.initorder = JSON.parse(JSON.stringify(this.order));
  }

openEditLocation(){
      let cloneorder = JSON.parse(JSON.stringify(this.order));
      this.navCtrl.push(LocationEditPage, { 'order': cloneorder},{'animate':false});
      this.events.subscribe('order:updated', (order) => {
        this.order = order;
        this.changeref.detectChanges();
        this.events.unsubscribe('order:updated');
        //this.updatedPinLocations();
      });
}
openEditPackage(){
  let cloneorder = JSON.parse(JSON.stringify(this.order));
  this.navCtrl.push(PackageEditPage, { 'order': cloneorder },{'animate':true});
  this.events.subscribe('order:updated', (order) => {
    this.order = order;
    this.changeref.detectChanges();
    this.events.unsubscribe('order:updated');
  });
}
openEditTime(){
  let cloneorder = JSON.parse(JSON.stringify(this.order));
  this.navCtrl.push(TimeEditPage, { 'order': cloneorder },{'animate':true});
  this.events.subscribe('order:updated', (order) => {
    this.order = order;
    this.changeref.detectChanges();
    this.events.unsubscribe('order:updated');
  });
}

  dismiss(data) {
    this.viewCtrl.dismiss();
  }


  ionViewWillLeave(){
    if(!loadash.isEqual(this.order,this.initorder)){
          this.events.publish('order:changed', this.order);
    }
  }

  saveOrder() {

    this.platform.ready().then(() => {
      if (this.network.type === 'none') {
        let toast = this.toastCtrl.create({
          message: 'You are offline',
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


  async createMarker(location, label): Promise<{}> {


    return new Promise((resolve, reject) => {
      let icon;
      //this.map.animateCamera({ target: new LatLng(location.lat, location.lng), zoom: 12 });
      var drag = false;
      if (label == "Pick Up") {
        icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAYAAAAffCjxAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAHTSURBVHja7JW7bhNBFIa/M7PemMSGEDvcQrBTEIREQwcFUCGKKC/AI1DCc6RFygtATwqEoKGg4AmIDBIRQVwiByRiEnt3Zw7F2tgJNmstICHBqWZnznx7/pk9/4qqcq11mgOh/Dxk8OFp6S1mSFIWZGiOyQEZmhscXChEICqIgjdKHGbCpA9Sop5q44WoqIgXvAGbgAuyYaZ7dIXebDShWGcQQBSMk7F0/nDYYUdIrMeLogLeaj5QEqQbtVtIhqzRoHE3ZoLyxm8HyS8w5I9Jk7zVDKtI8kBGSZPBpFIzjKc+hfGo9e+TqgoiNGtneL84z/HGBhNGOXQk5GHlPCtnr68JcPvl4+Wl7XV2v0S0E6W5WOdEY5OZN5ug2u/+ySRittOiErV4V6pyv3aJB7MXmI73AFhduMqH0gxLL55zcncL02kx6aL9NtKozLFdneNz+RinKsq9+mWe1C5S39ki9C5tZmNZrV3hlStz8/UzPpbnma4WOdoOONeTduPWCsY5jHMkNiDwjnLcxosArHVfumxU2SkUSYwlcAneWry1PLp7J63o8N7XvuG51Jq6kH3hRZhKOn1rdP3LC9Kh5vt4Bhz3723a/6B/EjTOz2djHLv7NgAVbJ2PbJqhVwAAAABJRU5ErkJggg==';
      } else {
        icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAYAAAAffCjxAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAM0SURBVHja7JXNa1xVGMZ/52s+kkxMJjOdmjEkDZVWSBeCoBU/QBeCQbp3IYIoKC78KPo/KG4LRUXcqLg0Cy24korWTUXUVNG0JrbJpI5pMjOZO/fec14XaSZJZ1oDuuyzPff8znnO+77PVSICSrF6aILVw5OMX1ggzrpjGwdKz9kkfQjkLgBQS97Zs8NX6++bqPNj7cg0ld8XKV1cAhEsu2TjmI1y8W1RnLRpCsiuVamYNL1vc3joFQqDb9k4eXP3Xr3rQ1QIH3pnT3oFIe6A7AYBIgRrCM69oUL4oC9IjHlZiXpGkgStDW5giBBCD0wFQYUA8Kw3+kXRWwglIrRG76guH50+R5JUXTZPafoobrDAtaUFNlaW0MYAij5aCuj7D393flkD1O6eOqF9qIY4Jj9SZKBUxjhLoTKO1ga50eKOJiCc6FoTrR8D0M7RXl+j/Xcd8YHm6hVC8Kj+twHAwOPAVtWUhAqAto6k3aL2yw+YTJak1URpA+rmIIFKF4QQbVdFG4tPEtIoQjuHugXkuqKutTSb+X5PKY3BZDL7gSBwvgsaXb46553t7ZtbSIkQjCHJZee6oOIff36Va7Y+Dc7uG+StJddsfVJZWDzbBZnUk1/ffM1bu7hfULD2Ur7RfnX0cu3GEVGXQZ4M1qwErVF9bCoRgtYEa5Y1MquElT6zBqlzPw3Wr83kGq33Umc7gqIYt6QYt0RQpM528o3Wu4N/rR1Lnf35JkMLwWgyUVS3cfI8SlcPdtYf/KIyM3+mMjN/sLN+XCk9bpP0BRd16sHs2UrP63qlyfuY4ma9/nn5nm9OTT+6oICcj7+drV9g08dEfdqiCxpIY8qdJmNxkytDJT6efIDPyjOMJG0ATh96hJWhIrPz57hzcxXdaTLg472gX8eq1EtV1goHGB8TPpo6zpeT9zLVWCUTPACxNpyefJjffIGnL35NrTDBSCnHaGQ5sh0jT7z0Dtp7tPekxmKDp5BEhC0Lc9cPfUqL0HA5Um2wPiUYQzCGM6de37rRcLu1E6s+RsE2ZG/vKMVg2tkJYE83p7amn/2PBj0RJ73l/y+6DboN+j+0n5C+xL//TPhnAGW/WbwAb5ZaAAAAAElFTkSuQmCC';
      }
      let pos = new LatLng(location.lat, location.lng);
      this.map.addMarker({
        position: pos,
        title: label,
        icon: icon,
        draggable: drag,
        animation: plugin.google.maps.Animation.DROP
      }, (marker) => {

        marker.on(plugin.google.maps.event.MARKER_CLICK, () => {
          let latlng = marker.getPosition();
          var geocoder = new google.maps.Geocoder;
          geocoder.geocode({
            'location': { 'lat': latlng.lat, 'lng': latlng.lng },

          }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
              let address = "";
              for (var i = 0; i < results.length - 1; i++) {
                if (i == 0) {
                  address = results[0].formatted_address + "\n" + results[0].address_components[0].long_name;
                } else {
                  if (results[i].address_components[0].long_name != results[i - 1].address_components[0].long_name) {
                    address = address + "\n" + results[i].address_components[0].long_name
                  }
                }
              }

              let contentString = label + '\n' + latlng.lat + ',' + latlng.lng;
              marker.setTitle(contentString);
              marker.setSnippet(address);
              marker.showInfoWindow();
            } else {
              alert('No info found');
            }
          });

        });

        if (label == "Pick Up") {
          this.originMarker = marker;
        } else if (label == "Drop Off") {
          this.destMarker = marker;
        }
        resolve(marker);
      })
    });


  }
  drawRoude(lastedited) {
    //let me = this;
    if (this.originMarker != null && this.destMarker != null) {
      let latlng_o = this.originMarker.getPosition();
      let latlng_d = this.destMarker.getPosition();
      let request = {
        origin: {
          'location': latlng_o
        },
        destination: {
          'location': latlng_d
        },
        travelMode: 'DRIVING'
      }
      /* this.originMarker.remove();
       this.destMarker.remove();*/
      try {
        this.polyline.remove();
      } catch (exc) {

      }

      let directionsService = new google.maps.DirectionsService();
      setTimeout(() => {
        //window['plugins'].spinnerDialog.show(null, "Calculating price ...", true);
        directionsService.route(request, (response, status) => {
          var me = this;
          if (status == "OK") {
            var bounds = new google.maps.LatLngBounds();
            var legs = response.routes[0].legs;
            let points = [];
            for (let i = 0; i < legs.length; i++) {
              var steps = legs[i].steps;
              for (let j = 0; j < steps.length; j++) {
                var nextSegment = steps[j].path;
                for (let k = 0; k < nextSegment.length; k++) {
                  let cord = new LatLng(parseFloat(nextSegment[k].lat()), parseFloat(nextSegment[k].lng()));
                  points.push(cord);
                  bounds.extend(nextSegment[k]);
                }
              }
            }
            this.map.addPolyline({
              'points': points,
              'color': 'rgba(123, 45, 87,0.51)',
              'width': 4,
              'geodesic': true
            }, (polyline) => {
              me.polyline = polyline;
            });

          } else {

          }
        });
      }, 0);

    }
  }

  ionViewWillEnter(){
this.language = this.translate.currentLang;
this.translate.get(['No network connection','Remove','More','Edit','Close', 'Alert', 'Please wait...', 'OK',
'Order', 'Order Actions', 'Open', 'Cancel', 'Order assigned',
'This order been assigned to you successfully', 'Oops !',
'Could not establish connection with the server,check your internet connection!',
'Order unassigned', 'This order has been removed from your list', 'Awesome',
'Order picked up', 'This order has been picked up successfully', 'Order dropped off',
'This order has been dropped off successfully', 'Filter orders', 'Waiting', 'Accepted', 'Picked Up', 'Delivered',
'Filter', 'Loading orders...',
'Confirm order remove','Delivery Confirmed','Your order has been marked as delivered',
'You will no longer have access to this order,Are you sure you want remove it ?','Cancel',
'Confirm','We really appreciate your feed back.','We will make sure that any inconveniences won\'t happen next time.',
'Thank you for your feed back we will make it better next time.','Thank you']).subscribe(
value => {
this.TransArray = value;
}
)
}

}
