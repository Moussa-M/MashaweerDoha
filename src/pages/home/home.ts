import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';

import {
  IonicPage,
  MenuController, PopoverController, NavController, ModalController,
  ViewController, LoadingController, AlertController, ToastController
} from 'ionic-angular';

import { Toast } from '@ionic-native/toast';
import { OrderDetailsPage } from '../orderdetails/orderdetails';
import { MorePage } from '../more/more';
import { OrderNotificationsPage } from '../ordernotifications/ordernotifications';
import { NewOrderPage } from '../neworder/neworder';
import { TrackPage } from '../track/track';
import { LoginPage } from '../login/login';
import { AllPage } from '../all/all';
import { TrackInfoPage } from '../trackinfo/trackinfo';
import { RatingPage } from '../rating/rating';

import { Geolocation } from '@ionic-native/geolocation';

import { Order, Notification } from "../../models/Order";

import { OrderService } from '../../providers/services/orderservice'

import { PhotoViewer } from '@ionic-native/photo-viewer';


import { Network } from '@ionic-native/network';
import { Platform, Content, ActionSheetController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { AuthService, GlobalDataService } from '../../providers/services/auth'
import { EditOrderPage } from '../editorder/editorder';
//import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
//import {TranslateService} from 'ng2-translate';
import $ from "jquery";
//import * as _ from 'lodash';
import { Badge } from '@ionic-native/badge';

declare var cordova;
declare var AppRate;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  //@ViewChild('map') mapElement: ElementRef;
  @ViewChild(Content) content_all: Content;
  map: any;
  public loading: any;
  public showAdd = true;
  public onconnect :any;
  public ondesconnect :any;
  errorMessage: any;
  orderservice: OrderService;
  orders: Order[];
  today_orders: Order[];
  orderdetails: any;
  orderdetails_id: any;
  public language: string;
  public TransArray: any;
  public nextPage: string;
  public done_loading: boolean = true;
  public notifications_count = 0;
  public today_notifications_count = 0;
  public notifications: Notification[] = [];
  public nextTodayPage: string;
  private changeref: any;
  public NoOrders = false;
  public is_authenticated = false;
  public NoTodayOrders = false;
  public type: string = "today";
  public filters = ["PENDING", "INROW", "INPROGRESS", "DELIVERED"];
  private authservice: AuthService;
  public notsocket: any;
  public socket: WebSocket;
  constructor(
    public navCtrl: NavController,
    private toast: Toast,
    public viewCtrl: ViewController,
    private badge: Badge,
    public translate: TranslateService,
    public globaldataservice: GlobalDataService,
    public actionSheetCtrl: ActionSheetController,
    public storage: Storage,
    //public nativePageTransitions: NativePageTransitions,
    changeref: ChangeDetectorRef,
    public modalCtrl: ModalController,
    private photoViewer: PhotoViewer,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public network: Network,
    public platform: Platform,
    public toastCtrl: ToastController,
    public events: Events,
    public menuCtrl: MenuController,
    public geolocation: Geolocation, orderservice: OrderService, authservice: AuthService) {
    this.orderservice = orderservice;
    this.authservice = authservice;
    this.changeref = changeref;
    this.nextPage = "";
    this.nextTodayPage = "";
    this.menuCtrl.enable(true, 'mymenu');
    // getting Today orders
    this.getOrdersAndNotifications();
    //ios registerPermission for badge
    this.init_connection();
  }

  init_connection(){
    if(this.globaldataservice['AUTHENTICATED']){
      this.is_authenticated = true;
      this.badge.registerPermission();
      window['FirebasePlugin'].grantPermission();
      window['FirebasePlugin'].getToken(function(token) {
        //
      }, function(error) {
      });
      //subscribeing to groub
      window['FirebasePlugin'].subscribe(this.globaldataservice['USER'].phone.substring(7));
      // on notification click event
      window['FirebasePlugin'].onNotificationOpen((notification) => {
        if (this.navCtrl.getActive().component != HomePage) {
                this.navCtrl.setRoot(HomePage);
        }
      }, function(error) {
        console.error(error);
      });

        this.socket = this.globaldataservice['CUSTOMER_SOCKET'];
        var typesoc = typeof(this.socket);
        if ( typesoc === 'undefined') {
            // subscribing to customers socket to get live updates
            this.globaldataservice['CUSTOMER_SOCKET'] = new WebSocket("wss://www.mashaweerdoha.com:8020" + "/customers");
            this.socket = this.globaldataservice['CUSTOMER_SOCKET'];
        }else{
          this.refrech_socket();
        }

      // on event arrival action
      this.socket.onmessage = (e) => {
        var customer_ph = e.data.split(':')[0];
        var order_id = e.data.split(':')[1];
        if (this.globaldataservice['USER'].phone == customer_ph) {
          this.nextTodayPage = "";
          this.detectOrderChanges(order_id);
          //this.badge.increase(1);
        }
      }
      // to make sure that the socket is ready and to make sure it never dies
      this.socket.onopen = (e) => {
        setInterval(() => {
          this.refrech_socket();
        }, 60000);
      }
      let timer;
      cordova.plugins.backgroundMode.setEnabled(true);
      cordova.plugins.backgroundMode.on('activate', () => {
        console.log("Moved back");
        cordova.plugins.backgroundMode.disableWebViewOptimizations();
        this.socket.onmessage = (e) => {
          var customer_ph = e.data.split(':')[0];
          var order_id = e.data.split(':')[1];
          //var status = e.data.split(':')[2];
          if (this.globaldataservice['USER'].phone == customer_ph) {
            this.nextTodayPage = "";
            this.detectOrderChanges(order_id);
            //this.badge.increase(1);
          }
        }
        timer = setInterval(() => {
          this.refrech_socket();

        }, 60000);
      });

      cordova.plugins.backgroundMode.on('deactivate', () => {
        clearInterval(timer);
        this.socket.onmessage = (e) => {
          var customer_ph = e.data.split(':')[0];
          if (this.globaldataservice['USER'].phone == customer_ph) {
            this.nextTodayPage = "";
            this.getOrdersAndNotifications();
            //this.badge.increase(1);
          }
        }
      });
    }else{
      this.is_authenticated = false;
    }
  }

  login(){
    this.navCtrl.push(LoginPage);
  }
  detectOrderChanges(id) {
    if (this.today_orders.findIndex((el) => { return el.id == id }) != -1) {
      //bring to top and remove from its place
      //console.log('fiund');
      this.orderservice.getOrder(id).subscribe(
        (res) => {
          let order = res.data;
          //console.log('replace');
          this.today_orders.splice(this.today_orders.findIndex((el) => { return el.id == id }), 1);
          setTimeout(() => {
            this.today_orders.unshift(order);
          }, 100);

          this.orderservice.getNotifications().subscribe(
            (res) => {
              this.notifications_count = res.notifications.length;
              this.badge.set(this.notifications_count);
              this.notifications = res.notifications;
              this.today_notifications_count = this.countTodayNotifications(this.notifications);
              this.notifications_count = this.notifications_count - this.today_notifications_count;
            },
            (error) => {
              this.errorMessage = <any>error
            }
          )
          this.changeref.detectChanges();
        },
        (error) => {
          this.errorMessage = <any>error
        }
      )

    } else {
      //append it on top
      //console.log('on top');
      this.orderservice.getOrder(id).subscribe(
        (res) => {
          let order = res.data;
          this.today_orders.unshift(order);
          this.orderservice.getNotifications().subscribe(
            (res) => {
              this.notifications_count = res.notifications.length;
              this.notifications = res.notifications;
              this.today_notifications_count = this.countTodayNotifications(this.notifications);
              this.notifications_count = this.notifications_count - this.today_notifications_count;
            },
            (error) => {
              this.errorMessage = <any>error
            }
          )

          this.changeref.detectChanges();
        },
        (error) => {
          this.errorMessage = <any>error
        }
      )
    }
  }
  getOrdersAndNotifications() {
    console.log('Domm yeah');
    console.log(this.globaldataservice['AUTHENTICATED']);
    if(this.globaldataservice['AUTHENTICATED']){
    if (this.network.type != 'none') {
      this.done_loading = false;
      this.orderservice.getOrders(this.nextTodayPage, this.filters, this.navCtrl).subscribe(
        (res) => {
          this.done_loading = true;
          this.today_orders = res.orders;
          this.orderservice.getNotifications().subscribe(
            (res) => {
              this.notifications_count = res.notifications.length;
              this.badge.set(this.notifications_count);
              this.notifications = res.notifications;
              this.today_notifications_count = this.countTodayNotifications(this.notifications);
              this.notifications_count = this.notifications_count - this.today_notifications_count;
            },
            (error) => {
              this.done_loading = true;
              this.errorMessage = <any>error
            }
          )
          if (this.today_orders.length == 0) {
            this.NoTodayOrders = true;
          }
          this.nextTodayPage = res.next;
          this.changeref.detectChanges();
        },
        (error) => {
          this.done_loading = true;
          this.errorMessage = <any>error
        }
      )
    } else {
      this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
    }
  }else{
    console.log("not auth sdsdsds");
  }
  }
  openOrderDetails(order) {
    this.orderdetails = order;
    this.navCtrl.push(OrderDetailsPage, { "order": this.orderdetails }, { 'animate': false });
  }

  openOrderTrack(order) {
    if (order.order_status.customer_order_status == 'INPROGRESS') {
      this.orderdetails = order;
      this.navCtrl.push(TrackPage, { "order": this.orderdetails }, { 'animate': false });
    } else {
      this.modalCtrl.create(TrackInfoPage, { 'order': order }).present();
    }

  }


  getorderindex(array, id) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].id == id) {
        return i;
      }
    }
    return -1;
  }
  getnotificationlist(array, id) {
    return array.filter((el) => { return el.order_id == id })
  }

  openOrderImage(order) {

    let ran = Math.floor(Math.random() * 1000);
    this.photoViewer.show(order.package.img + "?ts=" + ran, "Order #" + order.num, { share: true });
  }

  openDriverImage(order) {
    let ran = Math.floor(Math.random() * 1000);
    this.photoViewer.show(order.driver_img + "?ts=" + ran, order.driver_username, { share: true });
  }

  callPhoneNumber(num) {
    let confirm = this.alertCtrl.create({
      title: this.TransArray['Call agent ?'],
      message: '<span style="direction:auto">' +
      this.TransArray['Phone'] + '</span>  <div style="direction:ltr">' + num + '</div>',
      buttons: [
        {
          text: this.TransArray['Cancel'],
          handler: () => {
          }
        },
        {
          text: this.TransArray['Call'],
          handler: () => {
            cordova.InAppBrowser.open('tel:' + '00' + num.substring(2, 5) + num.substring(7, 11) + num.substring(12), '_system');
          }
        }
      ]
    });
    confirm.present();
  }

  openAddModel() {
    this.platform.ready().then(() => {
      if (this.network.type === 'none') {
        this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
      } else {


      this.navCtrl.push(NewOrderPage, { 'order': null }, { 'animate': false });

        this.events.subscribe('order:created', (order) => {
          this.navCtrl.getActive().dismiss();
          this.NoTodayOrders = false;
          this.today_orders.unshift(order);
          try {
            setTimeout(() => {
              this.content_all.scrollToTop();
            }, 1000)

          } catch (err) {

          }
          this.events.unsubscribe('order:created');
        });

      }
    });


  }



  openMore(event) {
    let popover = this.popoverCtrl.create(MorePage);
    popover.present({
      ev: event
    });

  }

  doRefresh(ev) {
    if(this.globaldataservice['AUTHENTICATED']){
    if (this.network.type != 'none') {
      //this.done_loading = false;
      this.orderservice.getOrders("", this.filters, this.navCtrl).subscribe(
        (res) => {
          //this.done_loading = true;
          this.today_orders = res.orders;
          this.nextTodayPage = res.next;
          if (res.orders.length != 0) {
            this.NoTodayOrders = false;
          } else {
            this.NoTodayOrders = true;
          }
          this.changeref.detectChanges();
          ev.complete();
        },
        error => {
          //  this.done_loading = true;
          ev.complete();
          this.errorMessage = <any>error;

        }
      )
    } else {
      ev.complete();
      this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
    }
  }else{
    ev.complete();
  }
  }
  getMoreOrders(scrollevent) {
    if (this.network.type != 'none') {
      if (this.nextPage != "" && this.nextPage != null) {
        this.done_loading = false;
        if (this.nextTodayPage != "" && this.nextTodayPage != null) {
          this.orderservice.getOrders(this.nextTodayPage, this.filters, this.navCtrl).subscribe(
            (res) => {
              this.done_loading = true;
              for (let i = 0; i < res.orders.length; ++i) {
                this.today_orders.push(res.orders[i]);
              }
              this.nextTodayPage = res.next;
              this.changeref.detectChanges();
              scrollevent.complete();
            },
            error => {
              this.errorMessage = <any>error;
              scrollevent.complete();
            }
          )
        } else {
          this.done_loading = true;
          this.changeref.detectChanges();
          scrollevent.complete();
        }

      } else {
        scrollevent.complete();
      }
    } else {
      scrollevent.complete();
      this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
    }

  }

  confirmDelivery(order) {

    if (!this.globaldataservice['is_connected']) {
      this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
    } else {
      window['plugins'].spinnerDialog.show(null, this.TransArray['Please wait...'], true);
      this.orderservice.confirmDelivery(order).subscribe((res) => {
        window['plugins'].spinnerDialog.hide();
        if (res.status == 200) {
          // if(this.orders.findIndex((el) => { return el.id == res.data.id }) != -1){
          //   this.orders.splice(this.orders.findIndex((el) => { return el.id == res.data.id }), 1, res.data);
          // }
          if (this.today_orders.findIndex((el) => { return el.id == res.data.id }) != -1) {
            this.today_orders.splice(this.today_orders.findIndex((el) => { return el.id == res.data.id }), 1, res.data);
          }

          this.showRatePopUp(order);


        } else {
          let alert = this.alertCtrl.create({
            title: this.TransArray['Oops !'],
            subTitle: this.TransArray['Could not establish connection with the server,check your internet connection!'],
            buttons: [this.TransArray['OK']],
          });
          alert.present();
        }
      }, (err) => {
        window['plugins'].spinnerDialog.hide();

      });
    }

  }
  showRatePopUp(order) {
    let ratingModel = this.modalCtrl.create(RatingPage, { 'order': order }, { "cssClass": 'rate-popover' });
    ratingModel.onDidDismiss(data => {
      if (data.submitted) {
        let subtitle = this.TransArray["We really appreciate your feed back."];
        if (data.stars < 3) {
          subtitle = this.TransArray["We will make sure that any inconveniences won't happen next time."]
        } else if (data.stars >= 3 && data.stars < 5) {
          subtitle = this.TransArray["Thank you for your feed back we will make it better next time."]
        }
        else if (data.stars == 5) {
          subtitle = this.TransArray["Thank you so much we are really glade that you are satisfy with our service."]
        }

        let alert = this.alertCtrl.create({
          title: this.TransArray['Thank you'],
          subTitle: subtitle,
          buttons: [this.TransArray['OK']],
        });
        alert.present();
      }
    });

    ratingModel.present();
  }
  presentActionSheet(order) {
    let actionSheet = this.actionSheetCtrl.create({
      title: this.TransArray['Order Actions'],
      buttons: []
    });

    if (order.order_status.customer_order_status != 'INPROGRESS') {
      let title = this.TransArray['Cancel order'];
      if (order.order_status.customer_order_status == 'DELIVERED' || order.order_status.customer_order_status == 'PENDING') {
        title = this.TransArray['Remove'];
      }
      let actionSheetBtn = {
        text: title,
        role: 'destructive',
        icon: 'ios-trash-outline',
        handler: () => {
          this.deleteOrder(order);

          return true;
        }
      }
      actionSheet.addButton(actionSheetBtn);
    }


    if (order.order_status.customer_order_status === 'PENDING' || order.order_status.customer_order_status === 'INROW') {
      let actionSheetBtn = {
        text: this.TransArray['Edit'],
        icon: 'ios-create-outline',
        handler: () => {
          this.openEditModel(order);
          return true;
        }
      }
      actionSheet.addButton(actionSheetBtn);
    }
    //more btn
    let actionSheetBtn = {
      text: this.TransArray['More'],
      icon: 'ios-open-outline',
      handler: () => {
        this.openOrderDetails(order);
        return true;
      }
    }
    actionSheet.addButton(actionSheetBtn);

    let actionSheetBtnC = {
      text: this.TransArray['Close'],
      role: 'cancel',
      icon: 'ios-close-outline',
      handler: () => {

        return true;
      }
    }
    actionSheet.addButton(actionSheetBtnC);
    actionSheet.present();

  }

  deleteOrder(order) {

    if (this.network.type === 'none') {
      this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
    } else {
      let title = this.TransArray['Confirm order cancellation'];
      let desc = this.TransArray['You will no longer have access to this order,Are you sure you want to cancel it ?'];
      if (order.order_status.customer_order_status == 'DELIVERED' || order.order_status.customer_order_status == 'PENDING') {
        title = this.TransArray['Confirm order removal'];
        desc = this.TransArray["You will no longer have access to this order,Are you sure you want to remove it ?"];
      }

      let alert = this.alertCtrl.create({
        title: title,
        message: desc,
        buttons: [
          {
            text: this.TransArray['Cancel'],
            role: 'cancel',
            handler: () => {
              return true;
            }
          },
          {
            text: this.TransArray['Confirm'],
            handler: () => {
              this.deleteOrderAction(order);
              return true;
            }
          }
        ]
      });
      alert.present();
    }


  }

  openEditModel(order) {
    this.platform.ready().then(() => {
      if (this.network.type === 'none') {
        this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
      } else {
        //   let ord_tmp = Object.assign({}, order);
        let ord_tmp = $.extend(true, {}, order)
        if (ord_tmp.package.img != null && ord_tmp.package.img != "") {
          ord_tmp.package.img = ord_tmp.package.img.split('?')[0];
          ord_tmp.package.thumbnail_ph = ord_tmp.package.thumbnail_ph.split('?')[0];

        }

        this.navCtrl.push(EditOrderPage, { 'order': ord_tmp }, { 'animate': true });
        this.events.subscribe('order:changed', (uorder) => {
          // this.orders.splice(this.orders.findIndex((el) => { return el.id == uorder.id }), 1, uorder);
          let ran = Math.floor(Math.random() * 1000);
          //  alert(uorder.package.img);
          if (uorder.package.img != null && uorder.package.img != "") {
            uorder.package.img = uorder.package.img + "?ran=" + ran;
            uorder.package.thumbnail_ph = uorder.package.thumbnail_ph + "?ran=" + ran;
          }

          setTimeout(() => {

            $("#" + ord_tmp.id).fadeOut("150", () => {
              //  if(this.orders.findIndex((el) => { return el.id == uorder.id }) != -1){
              //     this.orders.splice(this.orders.findIndex((el) => { return el.id == uorder.id }), 1, uorder);
              //   }
              if (this.today_orders.findIndex((el) => { return el.id == uorder.id }) != -1) {
                this.today_orders.splice(this.today_orders.findIndex((el) => { return el.id == uorder.id }), 1, uorder);
              }

              this.changeref.detectChanges();
              $("#" + ord_tmp.id).fadeIn("150");
            });
          }, 0);

          this.events.unsubscribe('order:changed');
        });
      }
    });
  }

  deleteOrderAction(order) {

    if (this.network.type != 'none') {
      window['plugins'].spinnerDialog.show(null, this.TransArray['Please wait...'], true);
      this.orderservice.deleteOrder(order, this.navCtrl).subscribe(
        (res) => {
          window['plugins'].spinnerDialog.hide();
          console.log(res);
          if (res.status === 204) {

            if (this.today_orders.findIndex((el) => { return el.id == order.id }) != -1) {
              this.today_orders.splice(this.today_orders.findIndex((el) => { return el.id == order.id }), 1);
            }

            $("#" + order.id).remove();
            this.changeref.detectChanges();
            if (this.today_orders.length == 0) {
              this.NoTodayOrders = true;
            }


          } else {
            let alert = this.alertCtrl.create({
              title: this.TransArray['Oops !'],
              subTitle: this.TransArray['Could not establish connection with the server,check your internet connection!'],
              buttons: [this.TransArray['OK']],
            });
            alert.present();

          }
        },
        (error) => {
          window['plugins'].spinnerDialog.hide();
          console.log(error);

        });
    } else {
      this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
    }
  }


  showFilter() {

    let alert = this.alertCtrl.create();
    alert.setTitle(this.TransArray['Filter orders']);
    alert.addInput({
      type: 'checkbox',
      label: this.TransArray['Waiting'],
      value: 'PENDING',
      checked: this.filters.indexOf("PENDING") > -1 ? true : false
    });

    alert.addInput({
      type: 'checkbox',
      label: this.TransArray['Accepted'],
      value: 'INROW',
      checked: this.filters.indexOf("INROW") > -1 ? true : false
    });
    alert.addInput({
      type: 'checkbox',
      label: this.TransArray['Picked Up'],
      value: 'INPROGRESS',
      checked: this.filters.indexOf("INPROGRESS") > -1 ? true : false
    });
    alert.addInput({
      type: 'checkbox',
      label: this.TransArray['Delivered'],
      value: 'DELIVERED',
      checked: this.filters.indexOf("DELIVERED") > -1 ? true : false
    });

    alert.addButton(this.TransArray['Cancel']);
    alert.addButton({
      text: this.TransArray['Filter'],
      handler: data => {
        console.log('Checkbox data:', data);
        //this.testCheckboxOpen = false;
        this.filters = data;
        this.filterOrders(data);
        //this.testCheckboxResult = data;
      }
    });
    alert.present();

  }

  filterOrders(data) {

    //today
    if (this.network.type != 'none') {
      window['plugins'].spinnerDialog.show(null, this.TransArray["Loading orders..."], true);
      this.orderservice.getOrders("", data, this.navCtrl).subscribe(
        (res) => {
          window['plugins'].spinnerDialog.hide();
          this.today_orders = res.orders;
          if (this.today_orders.length == 0) {
            this.NoTodayOrders = true;
          }
          this.changeref.detectChanges();
          this.nextTodayPage = res.next;
        },
        (error) => {
          this.changeref.detectChanges();
          window['plugins'].spinnerDialog.hide();
          this.errorMessage = <any>error
        }
      )
    } else {
      this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
    }

  }
  hasNotifications(order_id) {
    return this.getnotificationlist(this.notifications, order_id).length > 0 ? true : false;
  }
  orderNotificationCount(id) {
    return this.getnotificationlist(this.notifications, id).length;
  }
  openNotification(order, event) {
    let notList = this.getnotificationlist(this.notifications, order.id);
    if (notList.length > 0) {
      this.clearOrderNotifications(order.id);
      let popover = this.popoverCtrl.create(OrderNotificationsPage, { 'order': order, 'not': notList });
      popover.present({
        ev: event
      });

      popover.onDidDismiss(() => {

      });

    }
  }

  countTodayNotifications(notarray): number {
    let count = 0;
    for (var i = 0; i < this.today_orders.length; ++i) {
      for (var j = 0; j < notarray.length; ++j) {
        if (notarray[j].order_id == this.today_orders[i].id) {
          count = count + 1;
        }
      }
    }
    return count;
  }
  countOrderNotifications(notarray, order_id): number {
    let count = 0;

    for (var j = 0; j < notarray.length; ++j) {
      if (notarray[j].order_id == order_id) {
        count = count + 1;
      }
    }

    return count;
  }

  async clearOrderNotifications(id) {

    //clearing order notigfication by id
    this.badge.get().then((num) => {

      let count = this.countOrderNotifications(this.notifications, id);
      if (count < num) {
        this.badge.decrease(count);
        this.orderservice.clearOrderNotification(id).subscribe(
          (res) => {
            this.notifications_count = res.notifications.length;
            this.notifications = res.notifications;
            this.today_notifications_count = this.countTodayNotifications(this.notifications);
            this.notifications_count = this.notifications_count - this.today_notifications_count;

          },
          (err) => {
            this.badge.set(num);
          })
      } else {
        //a backup plan call ,server to clear all badge
        this.badge.clear();
        this.orderservice.clearNotification("ALL").subscribe(
          (res) => {
            this.notifications_count = res.notifications.length;
            this.notifications = res.notifications;
            this.today_notifications_count = this.countTodayNotifications(this.notifications);
            this.notifications_count = this.notifications_count - this.today_notifications_count;
          },
          (err) => {
            this.badge.set(num);
          })
      }
    });

  }
  ionViewWillEnter() {
    this.language = this.translate.currentLang;
    this.translate.get(['No network connection', 'Remove', 'More', 'Edit', 'Close', 'Alert', 'Please wait...', 'OK',
      'Order', 'Order Actions', 'Open', 'Cancel', 'Order assigned',
      'This order been assigned to you successfully', 'Oops !', 'Phone',
      'Could not establish connection with the server,check your internet connection!',
      'Order unassigned', 'This order has been removed from your list', 'Awesome',
      'Order picked up', 'This order has been picked up successfully', 'Order dropped off',
      'This order has been dropped off successfully', 'Filter orders', 'Waiting', 'Accepted', 'Picked Up', 'Delivered',
      'Filter', 'Loading orders...', 'Mind giving us some feedback?', 'No, Thanks', 'Remind Me Later', 'Rate It Now', 'Yes!', 'Not really',
      'Would you mind rating ', 'MashaweerDoha', 'It will not take more than a minute and helps to promote our app. Thanks for your support',
      'Dismiss', 'Mind giving us some feedback?', 'Do you like using ', 'Cancel order', 'Confirm order cancellation',
      'Confirm order removal', 'Delivery Confirmed', 'Your order has been marked as delivered',
      'You will no longer have access to this order,Are you sure you want to remove it ?', 'Cancel',
      'Confirm', 'We really appreciate your feed back.', 'We will make sure that any inconveniences won\'t happen next time.',
      'Thank you for your feed back we will make it better next time.', 'Thank you', 'Network connecion established',
      'Thank you so much we are really glade that you are satisfy with our service.', 'Call agent ?', 'Call',
      'You will no longer have access to this order,Are you sure you want to cancel it ?',
      'Mind giving us some feedback?', 'No, Thanks', 'Remind Me Later', 'Rate It Now', 'Yes!', 'Not really',
      'Would you mind rating ', 'MashaweerDoha', 'It will not take more than a minute and helps to promote our app. Thanks for your support',
      'Dismiss', 'Mind giving us some feedback?', 'Do you like using ', 'Logging out ...', 'Your account has been signed in from another device! You will be logged out',
      'No network connection', 'Network connecion established', 'Lost connection ...', 'Lost connection to server',
      'We are sorry but this version of the application is not supported ,please update to the new version.',
      'We highly recommend you to update to the new version of MashaweerDoha to benefit from all the new features.',
      'New update found', 'Okay', 'Update']).subscribe(
      value => {
        this.TransArray = value;
      }
      )

      this.globalInit();
      this.initRate();

      //this.init_connection();
       this.getOrdersAndNotifications();
       console.log('HOME ENTER');

  }
  globalInit() {
    this.ondesconnect = this.network.onDisconnect().subscribe(() => {
      this.toast.show(this.TransArray['No network connection'], '5000', 'bottom').subscribe();
      this.globaldataservice['is_connected'] = false;
    });

  this.onconnect  = this.network.onConnect().subscribe(() => {
      this.toast.show(this.TransArray['Network connecion established'], '5000', 'bottom').subscribe();
      this.globaldataservice['is_connected'] = true;
      if (this.navCtrl.getActive().component == HomePage) {
        setTimeout(() => {
          if (this.network.type != "none") {
            this.getOrdersAndNotifications();
          } else {
          }
        }, 2000);
      }
      this.refrech_socket();
    });
  }
 refrech_socket(){
   if(this.socket.readyState === this.socket.CLOSED){
     // subscribing to customers socket to get live updates
     this.globaldataservice['CUSTOMER_SOCKET'] = new WebSocket("wss://www.mashaweerdoha.com:8020" + "/customers");
     this.socket = this.globaldataservice['CUSTOMER_SOCKET'];
   }
 }
  ionViewWillLeave() {
    this.onconnect.unsubscribe();
    this.ondesconnect.unsubscribe();
    //this.socket.close();
    //this.notsocket.close();
  }

  initRate() {
    AppRate.preferences = {
      displayAppName: this.TransArray['MashaweerDoha'],
      usesUntilPrompt: 5,
      //   useLanguage:"ar",
      promptAgainForEachNewVersion: true,
      inAppReview: true,
      simpleMode: true,
      storeAppURL: {
        ios: '1260236277',
        android: 'market://details?id=com.mashaweerdoha.mashdc',
      },
      customLocale: {
        title: this.TransArray["Would you mind rating "] +" "+ this.TransArray['MashaweerDoha'],
        message: this.TransArray["It will not take more than a minute and helps to promote our app. Thanks for your support"],
        cancelButtonLabel: this.TransArray["No, Thanks"],
        laterButtonLabel: this.TransArray["Remind Me Later"],
        rateButtonLabel: this.TransArray["Rate It Now"],
        yesButtonLabel: this.TransArray["Yes!"],
        noButtonLabel: this.TransArray["Not really"],
        appRatePromptTitle: this.TransArray['Do you like using '] +" "+ this.TransArray['MashaweerDoha'],
        feedbackPromptTitle: this.TransArray['Mind giving us some feedback?'],
      },
      callbacks: {
        handleNegativeFeedback: function() {
          // window.open('mailto:info@mashaweerdoha.com','_system');
        },
        onRateDialogShow: function(callback) {
          //callback(1) // cause immediate click on 'Rate Now' button
        },
        onButtonClicked: function(buttonIndex) {
          console.log("onButtonClicked -> " + buttonIndex);
        }
      }
    };
    AppRate.promptForRating(false);
  }
  // async checkUpdates() {
  //   if (this.network.type != 'none') {
  //     cordova.getAppVersion.getVersionNumber().then((version) => {
  //       cordova.getAppVersion.getPackageName().then((packname) => {
  //         let versionx = version.split(".").join("");
  //         this.authservice.checkAppVersion(versionx).subscribe((res) => {
  //           //cool
  //           if (res.status == "CURRENT") {
  //
  //           } else if (res.status == "UPDATE") {
  //             let alert = this.alertCtrl.create({
  //               title: this.TransArray['New update found'],
  //               message: this.TransArray['We highly recommend you to update to the new version of MashaweerDoha to benefit from all the new features.'],
  //               buttons: [
  //                 {
  //                   text: this.TransArray['Dismiss'],
  //                   role: 'cancel',
  //                   handler: () => {
  //                     return true;
  //                   }
  //                 }, {
  //                   text: this.TransArray['Update'],
  //                   role: 'cancel',
  //                   handler: () => {
  //                     cordova.plugins.market.open('id1260236277', {
  //                       success: function() {
  //                         // Your stuff here
  //                       },
  //                       error: function() {
  //                         // Your stuff here
  //                       }
  //                     })
  //                     return true;
  //                   }
  //                 }
  //               ]
  //             });
  //             alert.present();
  //           } else if (res.status == "FORCE_UPDATE") {
  //             let alert = this.alertCtrl.create({
  //               title: this.TransArray['New update found'],
  //               message: this.TransArray['We are sorry but this version of the application is not supported ,please update to the new version.'],
  //               buttons: [
  //                 {
  //                   text: this.TransArray['Okay'],
  //                   role: 'cancel',
  //                   handler: () => {
  //                     cordova.plugins.market.open(packname, {
  //                       success: function() {
  //                         // Your stuff here
  //                       },
  //                       error: function() {
  //                         // Your stuff here
  //                       }
  //                     })
  //                     return true;
  //                   }
  //                 }
  //               ]
  //             });
  //             alert.present();
  //           }
  //         }, (err) => {
  //
  //         });
  //       });
  //     });
  //   }
  // }

}
