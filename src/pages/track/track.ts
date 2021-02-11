import {
    Component,
    NgZone,
    ElementRef,
    ViewChild,
    ChangeDetectorRef
} from '@angular/core';
import {
   IonicPage,
    NavController,
    NavParams,
    ViewController,
    ToastController,
    AlertController,
    Content
} from 'ionic-angular';
import {
    Geolocation
} from '@ionic-native/geolocation';
import {
    Order
} from "../../models/Order";
import {
    OrderService
} from '../../providers/services/orderservice';

import {
    Platform
} from 'ionic-angular';
import {
    LatLng
} from '@ionic-native/google-maps';
import 'rxjs/add/operator/map';

import {
    GlobalDataService
} from '../../providers/services/auth';

import { Network } from '@ionic-native/network';

import { TranslateService } from '@ngx-translate/core';
//import {TranslateService} from 'ng2-translate';

declare var google;
declare var plugin;

@IonicPage()
@Component({
    selector: 'page-track',
    templateUrl: 'track.html'
})
export class TrackPage{
      @ViewChild('map') theMap: ElementRef;
      map: any;

    @ViewChild(Content) content: Content;
    //map: GoogleMap;
    latLng: any;
    public socket:any;
    public cpt :number = 0;
    public onconnect:any;
      public socket2:any;
    public timeleft:any=' Mins';
    public language :string;
    public TransArray:any;
    order: Order;
    trackingMarker: any;
    public delivered:boolean=false;

    constructor(
        public changeref: ChangeDetectorRef,
        public translate: TranslateService,

        //private nativePageTransitions: NativePageTransitions,
        public globaldataservice: GlobalDataService, private _zone: NgZone, public alertCtrl: AlertController,
        //public googleMaps: GoogleMaps,
        public navCtrl: NavController,
         public params: NavParams, public network: Network,
          public platform: Platform, public toastCtrl: ToastController,
           public viewCtrl: ViewController, public geolocation: Geolocation,
            orderservice: OrderService) {

        platform.ready().then(() => {

          this.loadMap();

        });
        this.order = new Order();
        this.order = params.get("order");
    }




    ionViewDidLoad(){
        // this.content.resize();
             // $("page-track").css('z-index',99);
            // this.navCtrl.setRoot(this.navCtrl.getActive().component);
            // this.thePage.nativeElement.style.zIndex = 98;
            // var dom = document.querySelector('page-track');
            // let el =(document.querySelector('page-track')) ;
            // dom['style'].zIndex = 98;
            // cordova.fireDocumentEvent('plugin_touch', {});
    }
    loadMap() {
        const position = new LatLng(25.2847481785364, 51.5287971496582);
        let mapEle = this.theMap.nativeElement;
            this.map = new plugin.google.maps.Map.getMap(mapEle, {
            'mapType': plugin.google.maps.MapTypeId.ROAD,
            'backgroundColor': 'transparent',
            'controls': {
               'compass': true,
               'myLocationButton': true,
                'indoorPicker': true,
                'zoom': true,
            },
            'gestures': {
                'scroll': true,
                'tilt': true,
                'rotate': true,
                'zoom': true
            },
            'camera': {
                'latLng': position,

                'zoom': 12,

            }
        });
        this.map.one(plugin.google.maps.event.MAP_READY, () => {


            let pickU = new LatLng(this.order.location.pick_up_lat, this.order.location.pick_up_long);
            let PmarkerOptions = {
                position: pickU,
                title: 'Order #'+this.order.num+' Pick Up',
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAYAAAAffCjxAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAHTSURBVHja7JW7bhNBFIa/M7PemMSGEDvcQrBTEIREQwcFUCGKKC/AI1DCc6RFygtATwqEoKGg4AmIDBIRQVwiByRiEnt3Zw7F2tgJNmstICHBqWZnznx7/pk9/4qqcq11mgOh/Dxk8OFp6S1mSFIWZGiOyQEZmhscXChEICqIgjdKHGbCpA9Sop5q44WoqIgXvAGbgAuyYaZ7dIXebDShWGcQQBSMk7F0/nDYYUdIrMeLogLeaj5QEqQbtVtIhqzRoHE3ZoLyxm8HyS8w5I9Jk7zVDKtI8kBGSZPBpFIzjKc+hfGo9e+TqgoiNGtneL84z/HGBhNGOXQk5GHlPCtnr68JcPvl4+Wl7XV2v0S0E6W5WOdEY5OZN5ug2u/+ySRittOiErV4V6pyv3aJB7MXmI73AFhduMqH0gxLL55zcncL02kx6aL9NtKozLFdneNz+RinKsq9+mWe1C5S39ki9C5tZmNZrV3hlStz8/UzPpbnma4WOdoOONeTduPWCsY5jHMkNiDwjnLcxosArHVfumxU2SkUSYwlcAneWry1PLp7J63o8N7XvuG51Jq6kH3hRZhKOn1rdP3LC9Kh5vt4Bhz3723a/6B/EjTOz2djHLv7NgAVbJ2PbJqhVwAAAABJRU5ErkJggg=='
            };
            this.map.addMarker(PmarkerOptions,(mar)=>{
                let dropO = new LatLng(this.order.location.drop_off_lat, this.order.location.drop_off_long);
            let DmarkerOptions = {
                position: dropO,
                title: 'Order #'+this.order.num+' Drop Off',
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAYAAAAffCjxAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAM0SURBVHja7JXNa1xVGMZ/52s+kkxMJjOdmjEkDZVWSBeCoBU/QBeCQbp3IYIoKC78KPo/KG4LRUXcqLg0Cy24korWTUXUVNG0JrbJpI5pMjOZO/fec14XaSZJZ1oDuuyzPff8znnO+77PVSICSrF6aILVw5OMX1ggzrpjGwdKz9kkfQjkLgBQS97Zs8NX6++bqPNj7cg0ld8XKV1cAhEsu2TjmI1y8W1RnLRpCsiuVamYNL1vc3joFQqDb9k4eXP3Xr3rQ1QIH3pnT3oFIe6A7AYBIgRrCM69oUL4oC9IjHlZiXpGkgStDW5giBBCD0wFQYUA8Kw3+kXRWwglIrRG76guH50+R5JUXTZPafoobrDAtaUFNlaW0MYAij5aCuj7D393flkD1O6eOqF9qIY4Jj9SZKBUxjhLoTKO1ga50eKOJiCc6FoTrR8D0M7RXl+j/Xcd8YHm6hVC8Kj+twHAwOPAVtWUhAqAto6k3aL2yw+YTJak1URpA+rmIIFKF4QQbVdFG4tPEtIoQjuHugXkuqKutTSb+X5PKY3BZDL7gSBwvgsaXb46553t7ZtbSIkQjCHJZee6oOIff36Va7Y+Dc7uG+StJddsfVJZWDzbBZnUk1/ffM1bu7hfULD2Ur7RfnX0cu3GEVGXQZ4M1qwErVF9bCoRgtYEa5Y1MquElT6zBqlzPw3Wr83kGq33Umc7gqIYt6QYt0RQpM528o3Wu4N/rR1Lnf35JkMLwWgyUVS3cfI8SlcPdtYf/KIyM3+mMjN/sLN+XCk9bpP0BRd16sHs2UrP63qlyfuY4ma9/nn5nm9OTT+6oICcj7+drV9g08dEfdqiCxpIY8qdJmNxkytDJT6efIDPyjOMJG0ATh96hJWhIrPz57hzcxXdaTLg472gX8eq1EtV1goHGB8TPpo6zpeT9zLVWCUTPACxNpyefJjffIGnL35NrTDBSCnHaGQ5sh0jT7z0Dtp7tPekxmKDp5BEhC0Lc9cPfUqL0HA5Um2wPiUYQzCGM6de37rRcLu1E6s+RsE2ZG/vKMVg2tkJYE83p7amn/2PBj0RJ73l/y+6DboN+j+0n5C+xL//TPhnAGW/WbwAb5ZaAAAAAElFTkSuQmCC'
            };
            this.map.addMarker(DmarkerOptions,(mar)=>{
                  let trackingMarkerLatLng = new LatLng(this.order.location.pick_up_lat, this.order.location.pick_up_long);
            let trackOp = {
                position: trackingMarkerLatLng,
                title: "Order #" + this.order.num + " location",
                icon: 'data:image/png;base64,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'
            };
                this.map.addMarker(trackOp, (marker) => {
                    this.trackingMarker = marker;
                    // marker.showInfoWindow();
                     setTimeout(() => {
                    this._zone.run(() => {
                        // cordova.fireDocumentEvent('plugin_touch', {});
                        this.map.animateCamera({
                            target: pickU,
                            zoom: 12,
                            duration:500
                        });
                    });
                }, 500);
                });

            });
            });
            //drop off marker


            // Geocoder.

          //recieving  Location
        this.socket = new WebSocket("wss://www.mashaweerdoha.com:8020" + "/tracking"+this.order.driver_phone.substring(7));
        this.socket.onmessage = (e) => {
            let data = e.data.split(':');
            var now = new Date();
            console.log(now);
            //condition to see if this socket was sended by the driver === mark as delivery or from the sysytem tracking sys
            //this socket from the driver
            if (data.length == 2) {
                driver_phone = data[0];
                //$scope.removefromlocationTrackingMarkers(driver_phone);
                console.log("Order deiverd !!! remove traking marker from the map");
            } else {
                //from the system
                var driver_phone = e.data.split(':')[0];
                var lat = e.data.split(':')[1];
                var lng = e.data.split(':')[2];
                var speed = e.data.split(':')[3];
                //var heading = e.data.split(':')[4];
                if(!this.delivered){
                  this.updateOrderLocation(driver_phone, lat, lng);
                  console.log("order " + lat + " " + lng+" "+speed);
                }

            }
        }
        this.socket.onopen = ()=> {
          setInterval(() => {
            if (this.socket.readyState === this.socket.CLOSED) {
              this.socket = new WebSocket("wss://www.mashaweerdoha.com:8020" + "/tracking"+this.order.driver_phone.substring(7));
            }
          }, 60000);
        }


        });

        this.socket2 = new WebSocket("wss://www.mashaweerdoha.com:8020" + "/customers");
        this.socket2.onmessage = (e) => {

          var customer_ph = e.data.split(':')[0];
        //  var order_id = e.data.split(':')[1];
          var order_status = e.data.split(':')[2];
          if(this.globaldataservice['USER'].phone == customer_ph && order_status=="DELIVERED"){
                    this.delivered = true;
                    let alert = this.alertCtrl.create({
                      title: this.TransArray['Agent arrived'],
                      subTitle: this.TransArray['The agent arrived at drop off location.'],
                      buttons: [this.TransArray['OK']],
                    });
                    alert.present();
          }
        }

        this.onconnect = this.network.onConnect().subscribe(() => {
          console.log('goood');
          if (this.socket2.readyState === this.socket2.CLOSED) {
              console.log('re connect cus');
            this.socket2 = new WebSocket("wss://www.mashaweerdoha.com:8020" + "/customers");
          }
          if (this.socket.readyState === this.socket.CLOSED) {
              console.log('re connect cus');
            this.socket = new WebSocket("wss://www.mashaweerdoha.com:8020" + "/tracking"+this.order.driver_phone.substring(7));
          }
      });
    }
    public updateOrderLocation(driver_phone, lat, long) {
        if (this.order.driver_phone == driver_phone) {
            let trackingMarkerLatLng = new LatLng(parseFloat(lat), parseFloat(long));
            this.trackingMarker.setPosition(trackingMarkerLatLng);

            if(this.cpt==0){
                this.map.setCameraTarget({'lat':parseFloat(lat), 'lng':parseFloat(long)})
                this.cpt++;
            }

            this.calculateTimeLeft(trackingMarkerLatLng);
        }
    }
    //private onPlatformReady(): void {}
   /* private onMapReady(): void {
        alert('Map ready');
        //this.map.setOptions(mapConfig);
    }*/
    ionViewWillLeave() {
      this.socket.close();
        this.socket2.close();
        this.onconnect.unsubscribe();
      //     this.map.remove();
        /*let options: NativeTransitionOptions = {
    direction: '',
    duration: 400,
    slowdownfactor: 3,
    slidePixels: 20,
    iosdelay: 100,
    androiddelay: 100,
    fixedPixelsTop: 0,
    fixedPixelsBottom: 0
   };

 this.nativePageTransitions.slide(options)*/
    }


calculateTimeLeft(latlng:LatLng){

    let latlng_d = new LatLng(this.order.location.drop_off_lat,this.order.location.drop_off_long);
    let request = {
        origin: {
            'location': latlng
        },
        destination: {
            'location': latlng_d
        },
        travelMode: 'DRIVING'
    }
    let directionsService = new google.maps.DirectionsService();
    directionsService.route(request, (response, status) => {
        if (status == "OK") {
                var legs = response.routes[0].legs;
                this.timeleft = (legs[0].duration.value / 60).toFixed(0)
                if(this.timeleft <=1){
                    this.timeleft = this.timeleft+" "+this.TransArray["Min"];
                }else{
                    this.timeleft = this.timeleft+" "+this.TransArray["Mins"]
                }
        }else{

        }
        this.changeref.detectChanges();
    });

}
  ionViewWillEnter(){
      this.language = this.translate.currentLang ;
      this.translate.get(['Mins','Min','The agent arrived at drop off location.','Agent arrived','OK']).subscribe(
      value => {
         this.TransArray = value;
      }
    )
    // if(this.language == "en"){
    //   this.timeleft = " Mins";
    // }
  }

}
