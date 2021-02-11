import {
    Component,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    NgZone
} from '@angular/core';
import {
  IonicPage,
    PopoverController,
    NavController,
    ViewController,
    AlertController,
    ToastController,
    ModalController ,
    Content,
    NavParams
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
    Order
} from "../../models/Order";
import {
    OrderService
} from '../../providers/services/orderservice';
import {
    Network
} from '@ionic-native/network';
import {
    Platform
} from 'ionic-angular';

import { LoginPage } from '../login/login';

import { EstimatedPricePage } from '../estimatedprice/estimatedprice';
import { ModalAutocompleteItemsPage } from '../modal-autocomplete-items/modal-autocomplete-items';
import {
    AuthService, GlobalDataService
} from '../../providers/services/auth'
import {
    LatLng,
} from '@ionic-native/google-maps';
import 'rxjs/add/operator/map';
import 'rxjs/util/isNumeric';

//import loadash from 'lodash';
import * as _ from "lodash";


import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular';
declare var google;
declare var plugin;


@IonicPage()
@Component({
    selector: 'page-locationedit',
    templateUrl: 'locationedit.html'
})

export class LocationEditPage {
    @ViewChild(Content) content: Content;

    @ViewChild('map') theMap: ElementRef;
    public language: string;
    public TransArray: string;
    //@ViewChild('map') theMap: ElementRef;
    private editOrderForm: FormGroup;
    public location_choose_type :string = "AUTO_COMPLETE";
    public EDIT_LOCATION :string = "ORIG";
    public draglistener :any;
    public map: any;
    public formOk=false;
    errorMessage: any;
    orderservice: OrderService;
    private authservice: AuthService;
    private path = {};
    public order: Order;
    public cloneorder:Order;
    public polyline: any;
    public address:any = {
        place: '',
        set: false,
    };
    public placesService:any;

    //map vars
    private changeref: any;
    private originMarker: any = null;
    private destMarker: any = null;
    private platform: any;
    private network: any;


    constructor(public navCtrl: NavController,
        public events: Events,
        public globaldataservice: GlobalDataService,
        private _zone: NgZone,
        public modalCtrl: ModalController,
        public params: NavParams,
        public elm: ElementRef,
        public translate: TranslateService,
        authservice: AuthService, public alertCtrl: AlertController,
        network: Network, platform: Platform, public toastCtrl: ToastController,
        public popoverCtrl: PopoverController,
        public geolocation: Geolocation, orderservice: OrderService,
         public viewCtrl: ViewController, private formBuilder: FormBuilder,
          changeref: ChangeDetectorRef) {
        this.platform = platform;
        this.network = network;
        this.authservice = authservice;
        this.changeref = changeref;

        this.orderservice = orderservice;

        //form init
        this.editOrderForm = this.formBuilder.group({
            'location': this.formBuilder.group({
                'pick_up_name': [{'value':'','disabled':true}, Validators.required],
                'drop_off_name': [{'value':'','disabled':true}, Validators.required],
                'drop_off_lat': ['',],
                'drop_off_long': ['',],
                'pick_up_lat': ['',],
                'pick_up_long': ['',],
                'distance': ['',],
                'duration': ['',],
            }),
            'order_payment': this.formBuilder.group({
                'delivery_price': [0,],
                'package_price': ['',],
            }),
            'package': this.formBuilder.group({
                'title': ['',],
                'note': ['',],
            }),
            'pickup_time': ['',],
            'dropoff_time': ['',],
            'reciever_phone': ['',],
            'pickup_time_asap': ['', ],
            'dropoff_time_asap': ['', ],
            'shopping': ['', ]
        });
        this.order = this.editOrderForm.value;
        this.order = params.get("order");
        this.cloneorder = JSON.parse(JSON.stringify(this.order));//_.clone(this.order);
        //this.order.reciever_phone = this.globaldataservice['USER'].phone;
         platform.ready().then(() => {
          this.loadMap();
        });
    }

        isFormValid(){
          let changed = !_.isEqual(this.order, this.cloneorder);
          //console.log(changed);
          return changed && this.order.location.pick_up_name != "" &&
           this.order.location.drop_off_name != "" && this.order.location.pick_up_name != null &&
            this.order.location.drop_off_name != null && this.order.order_payment.delivery_price != 0;
        }
        dismiss(data) {
            this.viewCtrl.dismiss();
        }
        loadMap() {
            // this.platform.ready().then(() => {
            //     if (this.network.type === 'none') {
            //         let toast = this.toastCtrl.create({
            //             message: "No network connection nmap and location autocomplete won't operate as expected",
            //             duration: 4000,
            //             position: 'bottom',
            //             cssClass: 'lostconnect'
            //         });
            //         toast.present();
            //     } else { }
            // });
                //doha location
                const position = new LatLng(25.2847481785364, 51.5287971496582);
                let mapEle = this.theMap.nativeElement;
                this.map = new plugin.google.maps.Map.getMap(mapEle, {
                    'backgroundColor': 'white',
                    'controls': {
                        'compass': false,
                        'myLocationButton': false,
                        'indoorPicker': false,
                        'zoom': false,
                    },
                    'gestures': {
                        'scroll': true,
                        'tilt': true,
                        'rotate': true,
                        'zoom': true
                    },
                    'camera': {
                        'latLng': position,
                        'tilt': 30,
                        'zoom': 10,
                        'bearing': 50
                    }

                });

                this.map.one(plugin.google.maps.event.MAP_READY, () => {
                    this.map.setPadding( 0, 0 , 0, 0 );

                    this.map.clear();
                    this._zone.run(() => {
                        setTimeout(()=>{
                          let origin_lat_lng = new google.maps.LatLng(this.order.location.pick_up_lat,this.order.location.pick_up_long );
                          let dest_lat_lng = new google.maps.LatLng(this.order.location.drop_off_lat,this.order.location.drop_off_long );


                          this.createMarker(origin_lat_lng, "Pick Up").then((res) => {
                            this.createMarker(dest_lat_lng, "Drop Off").then((res) => {
                              this.drawRoude("Pick Up");

                            }, (err) => {
                              //alert(err);
                            });
                          }, (err) => {
                            //alert(err);
                          });
                          // this._zone.run(() => {
                          //   this.map.animateCamera({ target: new LatLng(origin_lat_lng.lat(), origin_lat_lng.lng()), zoom: 10,duration:250 });
                          // });
                        },0);


                    });
                });
        }


        async createMarker(location, label): Promise<{}> {
            return new Promise((resolve, reject) => {
                let icon;
                let me = this;

                this.map.animateCamera({ target: new LatLng(location.lat(), location.lng()), zoom: 12,duration:300 });
                var drag = true;
                if (label == "Pick Up") {
                    icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAYAAAAffCjxAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAHTSURBVHja7JW7bhNBFIa/M7PemMSGEDvcQrBTEIREQwcFUCGKKC/AI1DCc6RFygtATwqEoKGg4AmIDBIRQVwiByRiEnt3Zw7F2tgJNmstICHBqWZnznx7/pk9/4qqcq11mgOh/Dxk8OFp6S1mSFIWZGiOyQEZmhscXChEICqIgjdKHGbCpA9Sop5q44WoqIgXvAGbgAuyYaZ7dIXebDShWGcQQBSMk7F0/nDYYUdIrMeLogLeaj5QEqQbtVtIhqzRoHE3ZoLyxm8HyS8w5I9Jk7zVDKtI8kBGSZPBpFIzjKc+hfGo9e+TqgoiNGtneL84z/HGBhNGOXQk5GHlPCtnr68JcPvl4+Wl7XV2v0S0E6W5WOdEY5OZN5ug2u/+ySRittOiErV4V6pyv3aJB7MXmI73AFhduMqH0gxLL55zcncL02kx6aL9NtKozLFdneNz+RinKsq9+mWe1C5S39ki9C5tZmNZrV3hlStz8/UzPpbnma4WOdoOONeTduPWCsY5jHMkNiDwjnLcxosArHVfumxU2SkUSYwlcAneWry1PLp7J63o8N7XvuG51Jq6kH3hRZhKOn1rdP3LC9Kh5vt4Bhz3723a/6B/EjTOz2djHLv7NgAVbJ2PbJqhVwAAAABJRU5ErkJggg==';
                } else {
                    icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAYAAAAffCjxAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAM0SURBVHja7JXNa1xVGMZ/52s+kkxMJjOdmjEkDZVWSBeCoBU/QBeCQbp3IYIoKC78KPo/KG4LRUXcqLg0Cy24korWTUXUVNG0JrbJpI5pMjOZO/fec14XaSZJZ1oDuuyzPff8znnO+77PVSICSrF6aILVw5OMX1ggzrpjGwdKz9kkfQjkLgBQS97Zs8NX6++bqPNj7cg0ld8XKV1cAhEsu2TjmI1y8W1RnLRpCsiuVamYNL1vc3joFQqDb9k4eXP3Xr3rQ1QIH3pnT3oFIe6A7AYBIgRrCM69oUL4oC9IjHlZiXpGkgStDW5giBBCD0wFQYUA8Kw3+kXRWwglIrRG76guH50+R5JUXTZPafoobrDAtaUFNlaW0MYAij5aCuj7D393flkD1O6eOqF9qIY4Jj9SZKBUxjhLoTKO1ga50eKOJiCc6FoTrR8D0M7RXl+j/Xcd8YHm6hVC8Kj+twHAwOPAVtWUhAqAto6k3aL2yw+YTJak1URpA+rmIIFKF4QQbVdFG4tPEtIoQjuHugXkuqKutTSb+X5PKY3BZDL7gSBwvgsaXb46553t7ZtbSIkQjCHJZee6oOIff36Va7Y+Dc7uG+StJddsfVJZWDzbBZnUk1/ffM1bu7hfULD2Ur7RfnX0cu3GEVGXQZ4M1qwErVF9bCoRgtYEa5Y1MquElT6zBqlzPw3Wr83kGq33Umc7gqIYt6QYt0RQpM528o3Wu4N/rR1Lnf35JkMLwWgyUVS3cfI8SlcPdtYf/KIyM3+mMjN/sLN+XCk9bpP0BRd16sHs2UrP63qlyfuY4ma9/nn5nm9OTT+6oICcj7+drV9g08dEfdqiCxpIY8qdJmNxkytDJT6efIDPyjOMJG0ATh96hJWhIrPz57hzcxXdaTLg472gX8eq1EtV1goHGB8TPpo6zpeT9zLVWCUTPACxNpyefJjffIGnL35NrTDBSCnHaGQ5sh0jT7z0Dtp7tPekxmKDp5BEhC0Lc9cPfUqL0HA5Um2wPiUYQzCGM6de37rRcLu1E6s+RsE2ZG/vKMVg2tkJYE83p7amn/2PBj0RJ73l/y+6DboN+j+0n5C+xL//TPhnAGW/WbwAb5ZaAAAAAElFTkSuQmCC';
                }

                this.map.addMarker({
                    position: { 'lat': location.lat(), 'lng': location.lng() },
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
                                let contentString = label + '\n' + latlng.lat + ',' + latlng.lng;
                                marker.setTitle(contentString);
                                marker.setSnippet(address);
                                marker.showInfoWindow();
                            } else {
                                let alert = this.alertCtrl.create({
                                        title: 'No info found',
                                        subTitle: '',
                                        buttons: [{
                                            text: this.TransArray['OK'],
                                            handler: () => {
                                                alert.dismiss();
                                                return true;
                                            }
                                        }]
                                    });
                                    alert.present();
                            }
                        });
                    });
                    marker.on(plugin.google.maps.event.MARKER_DRAG_END, () => {
                        let latlng = marker.getPosition();
                        var geocoder = new google.maps.Geocoder;
                        geocoder.geocode({
                            'location': { 'lat': latlng.lat, 'lng': latlng.lng }
                        }, (results, status) => {

                            if (me.isnotWithinQatar(results)) { status = "NOT_FOUND"; }
                            if (status === google.maps.GeocoderStatus.OK) {
                                setTimeout(() => {
                                    var address = "";
                                    for (var i = 0; i < results.length - 1; i++) {
                                        if (i == 0) {
                                            address = results[0].address_components[0].long_name
                                        } else {
                                            if (results[i].address_components[0].long_name != results[i - 1].address_components[0].long_name) {
                                                address = address + "," + results[i].address_components[0].long_name
                                            }
                                        }
                                    }
                                    if (label == "Pick Up") {
                                        me.order.location.pick_up_name = address;
                                        me.order.location.pick_up_lat = latlng.lat;
                                        me.order.location.pick_up_long = latlng.lng;
                                        me.changeref.detectChanges();
                                        this.drawRoude("Pick Up");
                                    } else if (label == "Drop Off") {
                                        me.order.location.drop_off_name = address;
                                        me.order.location.drop_off_lat = latlng.lat;
                                        me.order.location.drop_off_long = latlng.lng;
                                        me.changeref.detectChanges();
                                        this.drawRoude("Drop Off");
                                    }
                                }, 0);

                            } else {
                                me.path = {};
                                me.polyline.remove();
                                me.order.order_payment.delivery_price = 0;
                                me.order.location.distance = 0;
                                me.order.location.duration = 0;
                                if (label == "Pick Up") {
                                    me.originMarker.remove();
                                    me.originMarker = null;
                                    me.order.location.pick_up_name = "";
                                    me.order.location.pick_up_lat = 0;
                                    me.order.location.pick_up_long = 0;
                                } else if (label == "Drop Off") {
                                    me.destMarker.remove();
                                    me.destMarker = null;
                                    me.order.location.drop_off_name = "";
                                    me.order.location.drop_off_lat = 0;
                                    me.order.location.drop_off_long = 0;
                                }
                                let alert = this.alertCtrl.create({
                                        title: this.TransArray['Not allowed'],
                                        subTitle: this.TransArray['This location is not allowed'],
                                        buttons: [{
                                            text: this.TransArray['OK'],
                                            handler: () => {
                                                alert.dismiss();
                                                return true;
                                            }
                                        }]
                                    });
                                    alert.present();
                            }
                        });
                    })

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

                    window['plugins'].spinnerDialog.show(null, this.TransArray["Calculating fare ..."], true);
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

                            me.path = {
                                'distance': (legs[0].distance.value / 1000).toFixed(2),
                                'duration': (legs[0].duration.value / 60).toFixed(2),
                                'start_address': String(legs[0].start_address),
                                'start_location': legs[0].start_location,
                                'end_address': String(legs[0].end_address),
                                'end_location': legs[0].end_location
                            }

                            let estimated_price;
                            this.orderservice.estimateFare(me.path['distance'],me.path['duration']
                          ,this.order.location.pick_up_lat,this.order.location.pick_up_long,
                          this.order.location.drop_off_lat,this.order.location.drop_off_long).subscribe(
                          (data)=>{
                            console.log("We got it ");
                              console.log(JSON.stringify(data));
                            estimated_price = data.data.fare;
                            me.order.order_payment.delivery_price = estimated_price;
                            me.order.location.distance = me.path['distance'];
                            me.order.location.duration = me.path['duration'];
                            this.formOk = true;
                            me.changeref.detectChanges();
                            window['plugins'].spinnerDialog.hide();
                          },
                          (error)=>{
                            //in case server fails
                            estimated_price = (me.path['distance'] * 1.65).toFixed(2);

                            if (estimated_price < 40) {
                                estimated_price = 40;
                            }
                            if (estimated_price > 200) {
                                estimated_price = 200;
                            }
                            me.order.order_payment.delivery_price = estimated_price;

                            me.order.location.distance = me.path['distance'];
                            me.order.location.duration = me.path['duration'];
                            this.formOk = true;
                            me.changeref.detectChanges();
                            window['plugins'].spinnerDialog.hide();
                          },
                        );

                        } else {
                            window['plugins'].spinnerDialog.hide();
                             let alert = this.alertCtrl.create({
                                        title: this.TransArray['Not allowed'],
                                        subTitle: this.TransArray['This location is not allowed'],
                                        buttons: [{
                                            text: this.TransArray['OK'],
                                            handler: () => {
                                                alert.dismiss();
                                                return true;
                                            }
                                        }]
                                    });
                                    alert.present();
                           // alert("Rouds are restricted for Qatar only");
                            me.path = {};
                            me.polyline.remove();
                            me.order.order_payment.delivery_price = 0;
                            me.order.location.distance = 0;
                            me.order.location.duration = 0;
                            if (lastedited == "Pick Up") {
                                me.originMarker.remove();
                                me.originMarker = null;
                                me.order.location.pick_up_name = "";
                                me.order.location.pick_up_lat = 0;
                                me.order.location.pick_up_long = 0;
                            } else if (lastedited == "Drop Off") {
                                me.destMarker.remove();
                                me.destMarker = null;
                                me.order.location.drop_off_name = "";
                                me.order.location.drop_off_lat = 0;
                                me.order.location.drop_off_long = 0;
                            }
                            me.changeref.detectChanges();
                        }
                    });
                    //me.originMarker.setMap(me.map);
                    //me.destMarker.setMap(me.map);
                }, 0);
            }
        }
        geolocationError(error) {
               let alert = this.alertCtrl.create({
                                        title: this.TransArray['Location services is off'],
                                        subTitle: this.TransArray['In order to get your current location please enable location services.'],
                                        buttons: [{
                                            text: this.TransArray['OK'],
                                            handler: () => {
                                                alert.dismiss();
                                                return false;
                                            }
                                        }]
                                    });
                                    alert.present();
            //alert("GPS is disabled" + error);
        }
        setPickUpCurrentLocation(isvisible,drawRoude,callback) {
            //let me = this;
            //ev.stopPropagation();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    let latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude );
                    var geocoder = new google.maps.Geocoder;
                    //set the input text when drag is madedd
                    geocoder.geocode({
                        'location': latlng
                    }, (results, status) => {
                        if (this.isnotWithinQatar(results)) { status = "NOT_FOUND"; }

                        if (status === google.maps.GeocoderStatus.OK) {

                            if (!this.originMarker) {
                                this.createMarker(latlng, "Pick Up").then((res) =>
                                    {
                                        this.originMarker.setVisible(isvisible);
                                        if(drawRoude){
                                          this.drawRoude("Pick Up");
                                        }

                                   }, (err) => {});
                            } else {
                                this.originMarker.setPosition(new LatLng(latlng.lat(), latlng.lng()));

                                setTimeout(() => {this.map.animateCamera({ target: new LatLng(latlng.lat(), latlng.lng()), zoom: 12,duration:500  });}, 0);
                                setTimeout(() => {
                                  if(drawRoude){
                                  this.drawRoude("Pick Up");
                                }
                              }, 50);
                            }
                            setTimeout(() => {
                                var address = "";
                                for (var i = 0; i < results.length - 1; i++) {
                                    if (i == 0) {
                                        address = results[0].address_components[0].long_name
                                    } else {
                                        if (results[i].address_components[0].long_name != results[i - 1].address_components[0].long_name) {
                                            address = address + "," + results[i].address_components[0].long_name
                                        }
                                    }
                                }

                                this.order.location.pick_up_name = address;
                                this.order.location.pick_up_lat = latlng.lat();
                                this.order.location.pick_up_long = latlng.lng();
                                this.changeref.detectChanges();
                                callback("DONE");
                            }, 0);

                            return true;
                            //alert(JSON.stringify(me.order));
                        } else {

                            let alert = this.alertCtrl.create({
                                        title: this.TransArray['Not allowed'],
                                        subTitle: this.TransArray['This location is not allowed'],
                                        buttons: [{
                                            text: this.TransArray['OK'],
                                            handler: () => {
                                                alert.dismiss();
                                                return true;
                                            }
                                        }]
                                    });
                                    alert.present();
                                    callback("FAILED");
                                    return false;
                        }
                    });

                }, (err) => {
                  callback("FAILED");
                    this.geolocationError(err);
                });
        }

        setPickUpCenterLocation(callback) {
                    let latlng = new google.maps.LatLng(25.2847481785364, 51.5287971496582);
                    var geocoder = new google.maps.Geocoder;
                    //set the input text when drag is madedd
                    geocoder.geocode({
                        'location': latlng
                    }, (results, status) => {
                       if (this.isnotWithinQatar(results)) { status = "NOT_FOUND"; }

                        if (status === google.maps.GeocoderStatus.OK) {

                            if (!this.originMarker) {
                                this.createMarker(latlng, "Pick Up").then((res) =>
                                    {
                                        this.originMarker.setVisible(false);

                                   }, (err) => {});
                            } else {
                                this.originMarker.setPosition(new LatLng(latlng.lat(), latlng.lng()));
                                //setTimeout(() => {this.map.animateCamera({ target: new LatLng(latlng.lat(), latlng.lng()), zoom: 12,duration:500  });}, 0);
                            }
                            setTimeout(() => {
                                var address = "";
                                for (var i = 0; i < results.length - 1; i++) {
                                    if (i == 0) {
                                        address = results[0].address_components[0].long_name
                                    } else {
                                        if (results[i].address_components[0].long_name != results[i - 1].address_components[0].long_name) {
                                            address = address + "," + results[i].address_components[0].long_name;
                                        }
                                    }
                                }

                                this.order.location.pick_up_name = address;
                                this.order.location.pick_up_lat = latlng.lat();
                                this.order.location.pick_up_long = latlng.lng();
                                this.changeref.detectChanges();
                                callback("DONE");
                            }, 0);

                            return true;
                            //alert(JSON.stringify(me.order));
                        } else {

                            let alert = this.alertCtrl.create({
                                        title: this.TransArray['Not allowed'],
                                        subTitle: this.TransArray['This location is not allowed'],
                                        buttons: [{
                                            text: this.TransArray['OK'],
                                            handler: () => {
                                                alert.dismiss();
                                                return true;
                                            }
                                        }]
                                    });
                                    alert.present();
                                    callback("FAILED");
                                    return false;
                        }
                    });

        }

        setDropOffCurrentLocation(isvisible,drawRoude,callback) {
          //ev.stopPropagation();
            let me = this;
            navigator.geolocation.getCurrentPosition((position) => {
                let latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude );
                var geocoder = new google.maps.Geocoder;
                //set the input text when drag is madedd
                geocoder.geocode({
                    'location': latlng,
                }, (results, status) => {
                    if (this.isnotWithinQatar(results)) { status = "NOT_FOUND"; }
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (!this.destMarker) {

                            this.createMarker(latlng, "Drop Off").then((res) => {
                              this.destMarker.setVisible(isvisible);
                              if(drawRoude){
                                this.drawRoude("Drop Off");
                              }

                            }, (err) => { });
                        } else {
                           this.destMarker.setPosition(new LatLng(latlng.lat(), latlng.lng()));
                            setTimeout(() => { this.map.animateCamera({ target: latlng, zoom: 12,duration:500  });}, 0);
                            setTimeout(() => {
                              if(drawRoude){
                                this.drawRoude("Drop Off");
                              }
                             }, 50);
                        }
                        setTimeout(() => {
                            var address = "";
                            for (var i = 0; i < results.length - 1; i++) {
                                if (i == 0) {
                                    address = results[0].address_components[0].long_name
                                } else {
                                    if (results[i].address_components[0].long_name != results[i - 1].address_components[0].long_name) {
                                        address = address + "," + results[i].address_components[0].long_name
                                    }
                                }
                            }

                            this.order.location.drop_off_name = address;
                            this.order.location.drop_off_lat = latlng.lat();
                            this.order.location.drop_off_long = latlng.lng();
                            me.changeref.detectChanges();
                            callback("DONE");
                        }, 0);

                        return true;

                    } else {
                         let alert = this.alertCtrl.create({
                                        title: this.TransArray['Not allowed'],
                                        subTitle: this.TransArray['This location is not allowed'],
                                        buttons: [{
                                            text: this.TransArray['OK'],
                                            handler: () => {
                                                alert.dismiss();
                                                return true;
                                            }
                                        }]
                                    });
                                    alert.present();
                                    callback("FAILED");
                          return false;
                    }
                });

            }, (err) => {
              callback("FAILED");
                this.geolocationError(err);
            });
        }
        setDropOffCenterLocation(callback) {
          //ev.stopPropagation();
            let me = this;
                let latlng = new google.maps.LatLng(25.2847481785364, 51.5287971496582);
                var geocoder = new google.maps.Geocoder;
                //set the input text when drag is madedd
                geocoder.geocode({
                    'location': latlng,
                }, (results, status) => {
                    if (this.isnotWithinQatar(results)) { status = "NOT_FOUND"; }
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (!this.destMarker) {

                            this.createMarker(latlng, "Drop Off").then((res) => {
                              this.destMarker.setVisible(false);
                            }, (err) => { });
                        } else {
                           this.destMarker.setPosition(new LatLng(latlng.lat(), latlng.lng()));
                          //  setTimeout(() => { this.map.animateCamera({ target: latlng, zoom: 12,duration:500  });}, 0);
                        }
                        setTimeout(() => {
                            var address = "";
                            for (var i = 0; i < results.length - 1; i++) {
                                if (i == 0) {
                                    address = results[0].address_components[0].long_name
                                } else {
                                    if (results[i].address_components[0].long_name != results[i - 1].address_components[0].long_name) {
                                        address = address + "," + results[i].address_components[0].long_name
                                    }
                                }
                            }

                            this.order.location.drop_off_name = address;
                            this.order.location.drop_off_lat = latlng.lat();
                            this.order.location.drop_off_long = latlng.lng();
                            me.changeref.detectChanges();
                            callback("DONE");
                        }, 0);

                        return true;

                    } else {
                         let alert = this.alertCtrl.create({
                                        title: this.TransArray['Not allowed'],
                                        subTitle: this.TransArray['This location is not allowed'],
                                        buttons: [{
                                            text: this.TransArray['OK'],
                                            handler: () => {
                                                alert.dismiss();
                                                return true;
                                            }
                                        }]
                                    });
                                    alert.present();
                                    callback("FAILED");
                          return false;
                    }
                });

        }



        public isnotWithinQatar(results): boolean {
            for (var i = 0; i < results.length; i++) {
                for (var z = 0; z < results[i].address_components.length; z++) {
                    if (results[i].address_components[z].long_name == 'Qatar' || results[i].address_components[z].long_name == 'Doha' ||
                  results[i].address_components[z].long_name == 'قطر' || results[i].address_components[z].long_name == 'الدوحة') {
                        return false;
                    }
                }
            }
            return true;
        }

    showModal(input,event) {
            // reset
            //this.reset();
          //  event.stopPropagation();
            // show modal|
            let modal;
            if(input == "ORIG"){
                     modal = this.modalCtrl.create(ModalAutocompleteItemsPage,{'title':this.TransArray['Pick Up address']});
            }else{
                     modal = this.modalCtrl.create(ModalAutocompleteItemsPage,{'title':this.TransArray['Drop Off address']});
            }

            modal.onDidDismiss(data => {
                if(data == "CURRENT_LOCATION"){
                  if(input == "ORIG"){
                        this.setPickUpCurrentLocation(true,true,()=>{});
                  }else{
                        this.setDropOffCurrentLocation(true,true,()=>{});
                  }
                }else if(data == "CHOOSE_FROM_MAP"){
                  this.location_choose_type = data;
                  this.map.setPadding( 0, 0 , 0, 0 );
                  if(input == "ORIG"){
                    if(this.originMarker){
                        this.setMapDragType(input);
                    }else{
                      this.setPickUpCenterLocation(()=>{
                        this.setMapDragType(input);
                      });
                    }

                  }else{
                    if(this.destMarker){
                      this.setMapDragType(input);
                    }else{
                      this.setDropOffCenterLocation(()=>{
                        this.setMapDragType(input);
                      });
                    }
                  }
                }else{
                    this.getPlaceDetail(data,input);
                   //this.changeref.detectChanges();

                }
            })
            modal.present();
        }

        setMapDragType(input){
          try{
            this.polyline.remove();
          }catch(EX){

          }
          //this.polyline.remove();
            if(input == "ORIG"){
              try{
                this.originMarker.setVisible(false);
              }catch(EX){

              }
                this.EDIT_LOCATION = "ORIG";
                this.draglistener = this.map.on(plugin.google.maps.event.CAMERA_MOVE,(event) =>{
                  if(this.location_choose_type == 'CHOOSE_FROM_MAP' && this.EDIT_LOCATION == "ORIG"){
                    this.originMarker.setPosition( this.map.getCameraTarget() );
                  }
               });

           }else{
             try{
               this.destMarker.setVisible(false);
             }catch(EX){

             }
             this.EDIT_LOCATION = "DEST";
              this.draglistener = this.map.addEventListener(plugin.google.maps.event.CAMERA_MOVE,(event) =>{
                if(this.location_choose_type == 'CHOOSE_FROM_MAP' && this.EDIT_LOCATION == "DEST"){
                        this.destMarker.setPosition( this.map.getCameraTarget() );
                }
           });

           }
        }
        chooseLocation(){
          //this.originMarker.setDraggable(true);
          //this.destMarker.setDraggable(true);
          //google.maps.event.removeListener(this.draglistener);
          this.location_choose_type = "AUTO_COMPLETE";
          this.map.setPadding( 0, 0 , 0, 0 );
          if(this.EDIT_LOCATION == "ORIG"){
            try{
              this.originMarker.setVisible(true);
            }catch(EX){

            }
            this.mapDragEnd(this.originMarker,"Pick Up");
          }else{
            try{
              this.destMarker.setVisible(true);
            }catch(EX){

            }

            this.mapDragEnd(this.destMarker,"Drop Off");
          }

        }


        mapDragEnd(marker,label){
          let me = this;

              let latlng = marker.getPosition();
              var geocoder = new google.maps.Geocoder;
              geocoder.geocode({
                  'location': { 'lat': latlng.lat, 'lng': latlng.lng }
              }, (results, status) => {

                  if (me.isnotWithinQatar(results)) { status = "NOT_FOUND"; }
                  if (status === google.maps.GeocoderStatus.OK) {
                      setTimeout(() => {
                          var address = "";
                          for (var i = 0; i < results.length - 1; i++) {
                              if (i == 0) {
                                  address = results[0].address_components[0].long_name
                              } else {
                                  if (results[i].address_components[0].long_name != results[i - 1].address_components[0].long_name) {
                                      address = address + "," + results[i].address_components[0].long_name
                                  }
                              }
                          }
                          if (label == "Pick Up") {
                              me.order.location.pick_up_name = address;
                              me.order.location.pick_up_lat = latlng.lat;
                              me.order.location.pick_up_long = latlng.lng;
                              me.changeref.detectChanges();
                              this.drawRoude("Pick Up");
                          } else if (label == "Drop Off") {
                              me.order.location.drop_off_name = address;
                              me.order.location.drop_off_lat = latlng.lat;
                              me.order.location.drop_off_long = latlng.lng;
                              me.changeref.detectChanges();
                              this.drawRoude("Drop Off");
                          }
                      }, 0);

                  } else {
                      me.path = {};
                      me.polyline.remove();
                      me.order.order_payment.delivery_price = 0;
                      me.order.location.distance = 0;
                      me.order.location.duration = 0;
                      if (label == "Pick Up") {
                          me.originMarker.remove();
                          me.originMarker = null;
                          me.order.location.pick_up_name = "";
                          me.order.location.pick_up_lat = 0;
                          me.order.location.pick_up_long = 0;
                      } else if (label == "Drop Off") {
                          me.destMarker.remove();
                          me.destMarker = null;
                          me.order.location.drop_off_name = "";
                          me.order.location.drop_off_lat = 0;
                          me.order.location.drop_off_long = 0;
                      }
                      let alert = this.alertCtrl.create({
                              title: this.TransArray['Not allowed'],
                              subTitle: this.TransArray['This location is not allowed'],
                              buttons: [{
                                  text: this.TransArray['OK'],
                                  handler: () => {
                                      alert.dismiss();
                                      return true;
                                  }
                              }]
                          });
                          alert.present();
                  }
              });

        }
        private getPlaceDetail(place:any,input:string):void {

             var geocoder = new google.maps.Geocoder;
            var me=this;
            geocoder.geocode({
                        'placeId': place.place_id
                    }, (results, status) => {
                        //if (me.isnotWithinQatar(results)) { status = "NOT_FOUND"; }
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                let latlng = results[0].geometry.location;
                                if (input === 'ORIG') {
                                    if (!me.originMarker) {
                                        me.createMarker(latlng, "Pick Up").then((res) => {
                                            me.drawRoude("Pick Up");
                                        }, (err) => { });
                                    } else {
                                        me.originMarker.setPosition(new LatLng(latlng.lat(), latlng.lng()))
                                        me.map.animateCamera({ target: new LatLng(latlng.lat(), latlng.lng()), zoom: 12,duration:500  });
                                        setTimeout(() => { me.drawRoude("Pick Up"); }, 300);
                                    }
                                    me.order.location.pick_up_name = place.description
                                    me.order.location.pick_up_lat = latlng.lat();
                                    me.order.location.pick_up_long = latlng.lng();
                                      me.changeref.detectChanges();
                                } else {
                                    if (!me.destMarker) {
                                        me.createMarker(latlng, "Drop Off").then((res) => {
                                            me.drawRoude("Drop Off");
                                        }, (err) => { });
                                    } else {
                                        me.destMarker.setPosition(new LatLng(latlng.lat(), latlng.lng()))
                                        me.map.animateCamera({ target: new LatLng(latlng.lat(), latlng.lng()), zoom: 12,duration:500  });
                                        setTimeout(() => { me.drawRoude("Drop Off"); }, 300);
                                    }

                                    me.order.location.drop_off_name =place.description;
                                    me.order.location.drop_off_lat = latlng.lat();
                                    me.order.location.drop_off_long = latlng.lng();
                                      me.changeref.detectChanges();
                                }

                            }
                        } else {
                            me.path = {};
                            me.polyline.remove();
                            me.order.order_payment.delivery_price = 0;
                            me.order.location.distance = 0;
                            me.order.location.duration = 0;
                            if (input == "ORIG") {
                                me.originMarker.remove();
                                me.originMarker = null;
                                me.order.location.pick_up_name = "";
                                me.order.location.pick_up_lat = 0;
                                me.order.location.pick_up_long = 0;
                            } else {
                                me.destMarker.remove();
                                me.destMarker = null;
                                me.order.location.drop_off_name = "";
                                me.order.location.drop_off_lat = 0;
                                me.order.location.drop_off_long = 0;
                            }
                            me.changeref.detectChanges();
                             let alert = this.alertCtrl.create({
                                        title: this.TransArray['Not allowed'],
                                        subTitle: this.TransArray['This location is not allowed'],
                                        buttons: [{
                                            text: this.TransArray['OK'],
                                            handler: () => {

                                                alert.dismiss();

                                                return true;
                                            }
                                        }]
                                    });
                                    alert.present();
                            //alert("This location is not allowed");
                        }
                    });
        }

    openPriceWindow(){
        this.modalCtrl.create(EstimatedPricePage,{'price':this.order.order_payment.delivery_price}).present();
    }

    ionViewWillEnter(){
    this.language = this.translate.currentLang;

    this.translate.get(['No network connection','Remove','More','Edit','Close', 'Alert', 'Please wait...', 'OK',
    'Order', 'Order Actions', 'Open', 'Cancel', 'Order assigned','Calculating fare ...',
    'This order been assigned to you successfully', 'Oops !','Location services is off','In order to get your current location please enable location services.',
    'Could not establish connection with the server,check your internet connection!',
    'Order unassigned', 'This order has been removed from your list', 'Awesome','Location services is off',
    'Order picked up', 'This order has been picked up successfully', 'Order dropped off',
    'This order has been dropped off successfully', 'Filter orders', 'Waiting', 'Accepted', 'Picked Up', 'Delivered',
    'Filter', 'Loading orders...','This location is not allowed','Okay','Not allowed',
    'Confirm order remove','Delivery Confirmed','Your order has been marked as delivered',
    'You will no longer have access to this order,Are you sure you want remove it ?','Cancel','Pick Up address','Drop Off address',
    'Confirm','We really appreciate your feed back.','We will make sure that any inconveniences won\'t happen next time.',
    'Thank you for your feed back we will make it better next time.','Thank you',
    'In order to get your current location please enable location services.']).subscribe(
    value => {
    this.TransArray = value;
    }
    )
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

                window['plugins'].spinnerDialog.show(null, this.TransArray["Please wait..."], true);

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

    }
