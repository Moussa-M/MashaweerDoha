import { Component ,NgZone,ChangeDetectorRef,ViewChild,ElementRef} from '@angular/core';

import { IonicPage,PopoverController,NavController,AlertController ,NavParams,ViewController,ModalController,ToastController,LoadingController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

import { Order } from "../../models/Order";


import { OrderService } from '../../providers/services/orderservice';

import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';

import { PhotoViewer } from '@ionic-native/photo-viewer';
import { AuthService } from '../../providers/services/auth'
import { Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import {
    LatLng,
} from '@ionic-native/google-maps';

declare var google;
declare var plugin;
declare var cordova;
declare var launchnavigator;
@IonicPage()
@Component({
  selector: 'page-orderdetails',
  templateUrl: 'orderdetails.html'
})
export class OrderDetailsPage {
  @ViewChild('map') theMap: ElementRef;
  map: any;
  errorMessage : any;
  orderservice : OrderService;
  order:Order;
  showDel:Boolean;
  showFab : Boolean;
  public language :string;
  public TransArray:any;
  private authservice:AuthService;
   private platform :any;
   private network :any;

  private originMarker1:any;
  private destMarker1:any;
  public polyline:any;
  private path = {};
  public updated:boolean = false;
  constructor(public navCtrl: NavController,
    public translate: TranslateService,
  //  public callNumber: CallNumber,
   private _zone: NgZone,
   public changeref :ChangeDetectorRef,
    //private nativePageTransitions: NativePageTransitions,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public params:NavParams,
       network: Network ,
        public events: Events,
        authservice:AuthService,
    platform: Platform,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
  	public popoverCtrl: PopoverController,
    private photoViewer: PhotoViewer,
  	public geolocation: Geolocation,orderservice:OrderService) {
    this.orderservice = orderservice;
    this.authservice = authservice;
    this.platform = platform;
    this.network = network;
    this.order = new Order();
    this.order = params.get("order");

    platform.ready().then(() => {

          this.loadMapx();

        });


  }

loadMapx(){
//this.loadMap();
const position = new LatLng(this.order.location.drop_off_lat, this.order.location.drop_off_long);
            //let div = document.getElementById("map");
            let mapEle = this.theMap.nativeElement;
            this.map = new plugin.google.maps.Map.getMap(mapEle, {
              'mapType': plugin.google.maps.MapTypeId.ROADMAP,
                'backgroundColor': 'red',
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
            //let map_id = document.getElementById("map_canvas");
            //this.map.setDiv(map_id);
            //this.map.setPadding(0);
            //this.map.refreshLayout();
            this.loadMap();
}
 /* ionViewWillUnload() {
    //console.log('dfdfdfdfdfdfdfdfd');
    this.viewCtrl.dismiss({'order':this.order,'status':'UPDATED'});
  }*/


  loadMap(){
      this.platform.ready().then(() => {
            if (this.network.type === 'none') {
                let toast = this.toastCtrl.create({
                    message: "No network connection map won't operate as expected",
                    duration: 4000,
                    position: 'bottom',
                    cssClass: 'lostconnect'
                });
                toast.present();
            } else {

            }
          });

       this.platform.ready().then(() => {
          this.map.one(plugin.google.maps.event.MAP_READY, () => {


                    this.map.clear();
                 // alert("orderdetail map ready");
                    let origin_lat_lng = {'lat':this.order.location.pick_up_lat,'lng':this.order.location.pick_up_long};
                    let dest_lat_lng = {'lat':this.order.location.drop_off_lat,'lng':this.order.location.drop_off_long};


                       this.createMarker(origin_lat_lng, "Pick Up").then((res)=>{
                       this.createMarker(dest_lat_lng, "Drop Off").then((res)=>{
                         if(this.order.order_status.customer_order_status=="INROW" || this.order.order_status.customer_order_status=="PENDING"){
                           this.drawRoude("Pick Up").then((res)=>{
                              setTimeout(() => {
                                  this._zone.run(() => {
                                                     this.map.animateCamera({ target: new LatLng(origin_lat_lng.lat, origin_lat_lng.lng), zoom: 12 ,duration:400});
                                                  });
                                    },0);
                           },(err)=>{
                               alert(err);
                           });
                         }else{
                           this._zone.run(() => {
                                              this.map.animateCamera({ target: new LatLng(origin_lat_lng.lat, origin_lat_lng.lng), zoom: 12 ,duration:400});
                                           });
                         }


                       },(err)=>{
                         alert(err);
                       });
                      },(err)=>{
                        alert(err);
                      });


    });

            //doha location


        });




  }

   async createMarker(location, label)  {

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
            draggable: drag
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

                            let contentString = label + '\n' + latlng.lat+','+latlng.lng;
                            marker.setTitle(contentString);
                            marker.setSnippet(address);
                            marker.showInfoWindow();
                        } else {
                            alert('No info found');
                        }
                    });


            });

            if (label == "Pick Up") {
                this.originMarker1 = marker;
            } else if (label == "Drop Off") {
                this.destMarker1 = marker;
            }
            resolve(marker);
        })
        });

   }

    drawRoude(lastedited):Promise<any> {
        //let me = this;
        return new Promise((resolve, reject) => {

        if (this.originMarker1 != null && this.destMarker1 != null) {
            let latlng_o = this.originMarker1.getPosition();
               let latlng_d =  this.destMarker1.getPosition();
                    let request = {
                        origin: {
                            'location': latlng_o
                        },
                        destination: {
                            'location': latlng_d
                        },
                        travelMode: 'DRIVING'
                    }
                    /* this.originMarker1.remove();
                     this.destMarker1.remove();*/
                    try {
                        this.polyline.remove();
                    } catch (exc) {

                    }

                    let directionsService = new google.maps.DirectionsService();
                    setTimeout(() => {
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
                                          let cord = new LatLng(parseFloat(nextSegment[k].lat()),parseFloat(nextSegment[k].lng()));
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

                                me.path = {
                                    'distance': (legs[0].distance.value / 1000).toFixed(2),
                                    'duration': (legs[0].duration.value / 60).toFixed(2),
                                    'start_address': String(legs[0].start_address),
                                    'start_location': legs[0].start_location,
                                    'end_address': String(legs[0].end_address),
                                    'end_location': legs[0].end_location
                                }

                            } else {
                                alert("Rouds are restricted for Qatar only");
                                me.path={};
                                me.polyline.remove();
                                me.order.order_payment.delivery_price = 0;
                                me.order.location.distance = 0;
                                me.order.location.duration = 0;
                                if(lastedited=="Pick Up"){
                                me.originMarker1.remove();
                                me.originMarker1= null;
                                me.order.location.pick_up_name = "";
                                me.order.location.pick_up_lat = 0;
                                me.order.location.pick_up_long = 0;
                                }else if(lastedited=="Drop Off"){
                                me.destMarker1.remove();
                                me.destMarker1 = null;
                                me.order.location.drop_off_name = "";
                                me.order.location.drop_off_lat = 0;
                                me.order.location.drop_off_long = 0;
                                }
                                me.changeref.detectChanges();
                            }
                        });

                    }, 1000);



        }
        resolve(true);
      });
    }


  dismiss(data) {
       //let data = { 'foo': 'bar' };
       if(this.updated){
         this.events.publish('order:updated', this.order);
           this.viewCtrl.dismiss();
       }else{
         this.viewCtrl.dismiss();
           //this.viewCtrl.dismiss({'status':'exit'});
       }
}
      openLocationStart(){
             launchnavigator.isAppAvailable(launchnavigator.APP.GOOGLE_MAPS, (isAvailable)=>{
               if(isAvailable){
                   launchnavigator.navigate([this.order.location.pick_up_lat,this.order.location.pick_up_long ],{'app':launchnavigator.APP.GOOGLE_MAPS});
               }else{
                 launchnavigator.isAppAvailable(launchnavigator.APP.APPLE_MAPS, (isAvailable)=>{
                   if(isAvailable){
                     launchnavigator.navigate([this.order.location.pick_up_lat,this.order.location.pick_up_long ],{'app':launchnavigator.APP.APPLE_MAPS});
                       }
                 });

               }

             });


      }
     openLocationEnd(){
         launchnavigator.isAppAvailable(launchnavigator.APP.GOOGLE_MAPS, (isAvailable)=>{
               if(isAvailable){
                 launchnavigator.navigate([this.order.location.drop_off_lat,this.order.location.drop_off_long ],{'app':launchnavigator.APP.GOOGLE_MAPS});
               }else{
                 launchnavigator.isAppAvailable(launchnavigator.APP.APPLE_MAPS, (isAvailable)=>{
                   if(isAvailable){
                     launchnavigator.navigate([this.order.location.drop_off_lat,this.order.location.drop_off_long ],{'app':launchnavigator.APP.APPLE_MAPS});
                       }
                 })

               }
             });

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
  callPhoneNumber(num){
     let confirm = this.alertCtrl.create({
      title: this.TransArray['Call agent ?'],
      message: '<span style="direction:auto">'+
      this.TransArray['Phone']+ '</span>  <div style="direction:ltr">'+this.order.driver_phone+'</div>',
      buttons: [
        {
          text: this.TransArray['Cancel'],
          handler: () => {
            // this.callNumber.callNumber(num, false)
            // .then(() => console.log('Launched dialer!'))
            // .catch(() => console.log('Error launching dialer'));
          }
        },
        {
          text: this.TransArray['Call'],
          handler: () => {
            // cordova.InAppBrowser.open('tel:00'+num.substring(2,5)+num.substring(7,11)+num.substring(12), '_system');
            //window.open('tel:'+num, '_system');
            cordova.InAppBrowser.open('tel:'+'00'+num.substring(2,5)+num.substring(7,11)+num.substring(12), '_system');
            // window['plugins'].CallNumber.callNumber(() =>
            // {console.log('Launched dialer!')},() =>
            // {console.log('Error launching dialer')},
            // '00'+num.substring(2,5)+num.substring(7,11)+num.substring(12),false);
            //  this.callNumber.callNumber(num, false)
            // .then(() => console.log('Launched dialer!'))
            // .catch(() => console.log('Error launching dialer'));
          }
        }
      ]
    });
    confirm.present();

  }

  openDriverImage(order) {

    let ran = Math.floor(Math.random() * 1000);
    this.photoViewer.show(order.driver_img+"?ts="+ran, order.driver_username, { share: true });
  }

}
