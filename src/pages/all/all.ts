import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';

import { IonicPage,PopoverController, NavController, ModalController, LoadingController, AlertController, ToastController } from 'ionic-angular';


import { OrderDetailsPage } from '../orderdetails/orderdetails';
import { MorePage } from '../more/more';
import { OrderNotificationsPage } from '../ordernotifications/ordernotifications';
import { NewOrderPage } from '../neworder/neworder';
import { TrackPage } from '../track/track';
import { TrackInfoPage } from '../trackinfo/trackinfo';
import { RatingPage } from '../rating/rating';

import { Geolocation } from '@ionic-native/geolocation';

import { Order,Notification } from "../../models/Order";

import { OrderService } from '../../providers/services/orderservice'

import { PhotoViewer } from '@ionic-native/photo-viewer';

import { Network } from '@ionic-native/network';
import { Platform, Content, ActionSheetController } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { AuthService,GlobalDataService } from '../../providers/services/auth'
import { EditOrderPage } from '../editorder/editorder';
//import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { Events } from 'ionic-angular';
import { Badge } from '@ionic-native/badge';
import { TranslateService } from '@ngx-translate/core';
//import {TranslateService} from 'ng2-translate';
import $ from "jquery";

declare var cordova;

@IonicPage()
@Component({
  selector: 'page-all',
  templateUrl: 'all.html'
})
export class AllPage {
  //@ViewChild('map') mapElement: ElementRef;
  @ViewChild(Content) content: Content;
  map: any;
  public loading: any;
  public showAdd = true;
  errorMessage: any;
  orders: Order[];
  today_orders: Order[];
  orderdetails: any;
  orderdetails_id: any;

  public nextPage: string="";
  public language: string;
  public TransArray: string;
  public done_loading:boolean = false;
  public notifications_count= 0;
  public today_notifications_count= 0;
  public notifications:Notification[] = [];
  private changeref: any;
  public NoOrders=false;
  public filters =["PENDING","INROW","INPROGRESS","DELIVERED"];
  private authservice: AuthService;
  constructor(public navCtrl: NavController,
    public translate: TranslateService,
    public globaldataservice: GlobalDataService,
    public actionSheetCtrl: ActionSheetController,
    public storage:Storage,
    private badge: Badge,
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

    public geolocation: Geolocation,public orderservice: OrderService, authservice: AuthService) {

    this.authservice = authservice;
    this.changeref = changeref;
    this.nextPage = "";

    //window['plugins'].spinnerDialog.show( null,"Loading orders", true);

     this.orderservice.getNotifications().subscribe(
      (res) => {
        this.notifications = res.notifications;
      },
      (error) => {
        this.errorMessage = <any>error
      }
    )

    this.done_loading = false;
    this.getAllOrders();
    window['FirebasePlugin'].grantPermission();
    window['FirebasePlugin'].getToken(function(token) {

      }, function(error) {

      });

    window['FirebasePlugin'].subscribe(this.globaldataservice['USER'].phone.substring(7));



  }

  getAllOrders(){

    this.orderservice.getOrders("",this.filters, this.navCtrl).subscribe(
      (res) => {
        if(res.orders.length == 0){
          this.NoOrders = true;
        }
        this.nextPage = res.next;
        this.orders=res.orders;
        this.done_loading = true;
        this.changeref.detectChanges();

      },
      (error) => {
        this.done_loading = true;
        this.errorMessage = <any>error
      }
    )
  }
  openOrderDetails(order) {
    this.orderdetails = order;
    this.navCtrl.push(OrderDetailsPage, { "order": this.orderdetails },{'animate':false});
  }

  openOrderTrack(order) {
    if(order.order_status.customer_order_status == 'INPROGRESS'){
      this.orderdetails = order;
      this.navCtrl.push(TrackPage, { "order": this.orderdetails },{'animate':false});
    }else{
      this.modalCtrl.create(TrackInfoPage,{'order':order}).present();
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
    return array.filter((el)=>{return el.order_id==id})
  }

  openOrderImage(order) {
    let ran = Math.floor(Math.random() * 1000);
    this.photoViewer.show(order.package.img+"?ts="+ran, "Order #" + order.num, { share: true });
  }
  openDriverImage(order) {

    let ran = Math.floor(Math.random() * 1000);
    this.photoViewer.show(order.driver_img+"?ts="+ran, order.driver_username, { share: true });
  }

  callPhoneNumber(num){
     let confirm = this.alertCtrl.create({
      title: this.TransArray['Call agent ?'],
      message: '<span style="direction:auto">'+
      this.TransArray['Phone']+ '</span>  <div style="direction:ltr">'+num+'</div>',
      buttons: [
        {
          text: this.TransArray['Cancel'],
          handler: () => {
          }
        },
        {
          text: this.TransArray['Call'],
          handler: () => {

            cordova.InAppBrowser.open('tel:'+'00'+num.substring(2,5)+num.substring(7,11)+num.substring(12), '_system');
          }
        }
      ]
    });
    confirm.present();

  }

  openAddModel() {
    this.platform.ready().then(() => {
            if (this.network.type === 'none') {
                let toast = this.toastCtrl.create({
                    message: this.TransArray['No network connection'],
                    duration: 4000,
                    position: 'bottom',
                    cssClass: 'lostconnect'
                });
                toast.present();
            } else {


    this.navCtrl.push(NewOrderPage, { 'order': null },{'animate':false});

             }
        });


  }

  showRatePopUp(order){
    let ratingModel = this.modalCtrl.create(RatingPage, { 'order': order },{"cssClass": 'rate-popover'});
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



  openMore(event) {
    let popover = this.popoverCtrl.create(MorePage);
    popover.present({
      ev: event
    });

  }

  doRefresh(ev){
    this.authservice.is_authenticated(true).then((res) => {

      let ords;
      this.orderservice.getOrders("",this.filters, this.navCtrl).subscribe(
        (res) => {

          ords = res.orders;
          //console.log(JSON.stringify(ords));
          if(ords.length == 0){
            this.NoOrders = true;
            //this.changeref.detectChanges();
          }
          this.nextPage = res.next;
          this.orders = res.orders;
          this.changeref.detectChanges();
          ev.complete();
          //getting today orders
      //     this.orderservice.getTodayOrders("",this.filters, this.navCtrl).subscribe(
      //   (res) => {
      //     this.today_orders = res.orders;
      //     this.notifications_count = this.notifications.length;
      //     this.today_notifications_count = this.countNotifications(this.notifications);
      //     this.notifications_count = this.notifications_count - this.today_notifications_count;
      //     this.orders = ords.filter((o1)=>{
      //         return this.today_orders.some((o2)=>{
      //             return o1.id != o2.id;
      //         });
      //     })
      //
      //     console.log(this.orders);
      //     this.done_loading = true;
      //     //this.nextPage = res.next;
      //     this.changeref.detectChanges();
      //     ev.complete();
      //   },
      //   (error) => {
      //     ev.complete();
      //     this.done_loading = true;
      //     this.errorMessage = <any>error
      //   }
      // )
        },
        (error) => {
          ev.complete();
          this.done_loading = true;
          this.errorMessage = <any>error
        }
      )

      }, (err) => {
        this.done_loading = true;
        this.navCtrl.setRoot(LoginPage);
    });


  }
  getMoreOrders(scrollevent) {
    if (this.nextPage != "" && this.nextPage != null ) {
       //this.done_loading = true;
        this.authservice.is_authenticated(true).then((rep) => {
        this.orderservice.getOrders(this.nextPage,this.filters, this.navCtrl).subscribe(
          (res) => {
            this.done_loading = true;
            for (let i = 0; i < res.orders.length; ++i) {
              this.orders.push(res.orders[i]);
            }
            this.nextPage = res.next;
            scrollevent.complete();
          },
          error => {
            scrollevent.complete();
            this.done_loading = true;
            this.errorMessage = <any>error;}
        )

    }, (err) => {
      this.done_loading = true;
      this.navCtrl.setRoot(LoginPage);
    });
    }else{
         scrollevent.complete();
    }


  }

  confirmDelivery(order) {

    this.platform.ready().then(() => {
      if (this.network.type === 'none') {
        let toast = this.toastCtrl.create({
          message: this.TransArray['No network connection'],
          duration: 5000,
          position: 'bottom',
          cssClass: 'lostconnect'
        });

        toast.present();
      } else {
        window['plugins'].spinnerDialog.show( null,this.TransArray['Please wait...'], true);
        this.orderservice.confirmDelivery(order).subscribe((res) => {
          window['plugins'].spinnerDialog.hide();
          if (res.status == 200) {
            if(this.orders.findIndex((el) => { return el.id == res.data.id }) != -1){
              this.orders.splice(this.orders.findIndex((el) => { return el.id == res.data.id }), 1, res.data);
            }
            // if(this.today_orders.findIndex((el) => { return el.id == res.data.id })!= -1){
            //   this.today_orders.splice(this.today_orders.findIndex((el) => { return el.id == res.data.id }), 1, res.data);
            // }
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

    }, (err) => {
      //this.navCtrl.setRoot(LoginPage);
    });

  }

  presentActionSheet(order) {

    let actionSheet = this.actionSheetCtrl.create({
      title: this.TransArray['Order Actions'],
      buttons: []
    });

    if (order.order_status.customer_order_status != 'INPROGRESS') {
      let title = this.TransArray['Cancel order'];
        if (order.order_status.customer_order_status == 'DELIVERED' || order.order_status.customer_order_status == 'PENDING'){
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

    this.platform.ready().then(() => {
      if (this.network.type === 'none') {
        let toast = this.toastCtrl.create({
          message: this.TransArray['No network connection'],
          duration: 3000,
          position: 'bottom',
          cssClass: 'lostconnect'
        });

        toast.present();
      } else {
        let title = this.TransArray['Confirm order cancellation'];
        let desc = this.TransArray['You will no longer have access to this order,Are you sure you want to cancel it ?'];
          if (order.order_status.customer_order_status == 'DELIVERED' || order.order_status.customer_order_status == 'PENDING'){
            title = this.TransArray['Confirm order removal'];
            desc = this.TransArray["You will no longer have access to this order,Are you sure you want to remove it ?"];
          }

        let alert = this.alertCtrl.create({
          title: title,
          message:  desc,
          buttons: [
            {
              text:  this.TransArray['Cancel'],
              role: 'cancel',
              handler: () => {
                return true;
              }
            },
            {
              text:  this.TransArray['Confirm'],
              handler: () => {
                this.deleteOrderAction(order);
                return true;
              }
            }
          ]
        });
        alert.present();
      }
    })

  }

  openEditModel(order) {
        this.platform.ready().then(() => {
            if (this.network.type === 'none') {
                let toast = this.toastCtrl.create({
                    message: this.TransArray['No network connection'],
                    duration: 4000,
                    position: 'bottom',
                    cssClass: 'lostconnect'
                });
                toast.present();
            } else {
                   //   let ord_tmp = Object.assign({}, order);
                      let ord_tmp = $.extend(true, {}, order)
                      if (ord_tmp.package.img != null && ord_tmp.package.img != ""){
                              ord_tmp.package.img =  ord_tmp.package.img.split('?')[0];
                              ord_tmp.package.thumbnail_ph =  ord_tmp.package.thumbnail_ph.split('?')[0];

                     }

    this.navCtrl.push(EditOrderPage, { 'order': ord_tmp },{'animate':true});
    this.events.subscribe('order:changed', (uorder) => {
     // this.orders.splice(this.orders.findIndex((el) => { return el.id == uorder.id }), 1, uorder);
       let ran = Math.floor(Math.random() * 1000);
       //  alert(uorder.package.img);
       if(uorder.package.img != null && uorder.package.img != ""){
               uorder.package.img = uorder.package.img+"?ran="+ran;
               uorder.package.thumbnail_ph = uorder.package.thumbnail_ph+"?ran="+ran;
       }

      setTimeout(()=>{

         $( "#"+ord_tmp.id ).fadeOut( "150", () =>{
           if(this.orders.findIndex((el) => { return el.id == uorder.id }) != -1){
              this.orders.splice(this.orders.findIndex((el) => { return el.id == uorder.id }), 1, uorder);
            }
            // if(this.today_orders.findIndex((el) => { return el.id == uorder.id })!= -1){
            //   this.today_orders.splice(this.today_orders.findIndex((el) => { return el.id == uorder.id }), 1, uorder);
            // }

          this.changeref.detectChanges();
            $( "#"+ord_tmp.id ).fadeIn("150");
        });
      },0);

      this.events.unsubscribe('order:updated');
    });

             }
        });



  }

  deleteOrderAction(order) {

    this.authservice.is_authenticated(true).then((res) => {
      window['plugins'].spinnerDialog.show( null,this.TransArray['Please wait...'], true);
      this.orderservice.deleteOrder(order, this.navCtrl).subscribe(
        (res) => {
          window['plugins'].spinnerDialog.hide();
          console.log(res);
          if (res.status === 204) {
            //this.navCtrl.setRoot(HomePage);
            //alert("Your order have been deleted");
            //this.events.publish('order:deleted', this.order);
            //this.viewCtrl.dismiss();
            //$("#"+order.id).addClass('animate');
            //setTimeout(()=>{

            if(this.orders.findIndex((el) => { return el.id == order.id }) != -1){
              this.orders.splice(this.orders.findIndex((el) => { return el.id == order.id }), 1);
            }
            // if(this.today_orders.findIndex((el) => { return el.id == order.id }) != -1){
            //   this.today_orders.splice(this.today_orders.findIndex((el) => { return el.id == order.id }), 1);
            // }

              $( "#"+order.id ).remove();
            this.changeref.detectChanges();
          //     $( "#"+order.id ).slideToggle( "fast", function() {
          //   $( "#"+order.id ).remove();
          // });



          } else {
            let alert = this.alertCtrl.create({
              title: this.TransArray['Oops !'],
              subTitle: this.TransArray['Could not establish connection with the server,check your internet connection!'],
              buttons: [this.TransArray['OK']],
            });
            alert.present();

            //to the phone verfication
            //this.navCtrl.setRoot(PhoneConfirmationPage);
          }
        },
        (error) => {
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
    })
  }

  ngAfterViewInit() {

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

   filterOrders(data){


         window['plugins'].spinnerDialog.show( null,this.TransArray["Loading orders..."], true);
         this.filters=data;
         this.orderservice.getOrders("",this.filters, this.navCtrl).subscribe(
           (res) => {
               window['plugins'].spinnerDialog.hide();
             if(res.orders.length == 0){
               this.NoOrders = true;
             }
             this.nextPage = res.next;
             this.orders=res.orders;
             this.done_loading = true;
             this.changeref.detectChanges();

           },
           (error) => {
               window['plugins'].spinnerDialog.hide();
             this.done_loading = true;
             this.errorMessage = <any>error
           }
         )
  }
  hasNotifications(order_id){
       return this.getnotificationlist(this.notifications,order_id).length > 0 ? true:false;
  }
  orderNotificationCount(id){
    return this.getnotificationlist(this.notifications,id).length;
  }

  openNotification(order,event){
    let notList = this.getnotificationlist(this.notifications,order.id);
    if(notList.length > 0){
       let popover = this.popoverCtrl.create(OrderNotificationsPage,{'order':order,'not':notList});
          popover.present({
            ev: event
          });

          popover.onDidDismiss(() => {

             this.clearOrderNotifications(order.id);
          });

    }
  }

  countNotifications(notarray):number{
    return notarray.length;
  }

  countOrderNotifications(notarray,order_id):number{
    let count = 0;
        for (var j = 0; j < notarray.length; ++j) {
          if(notarray[j].order_id==order_id){
            count = count + 1;
          }
        }
    return count;
  }

  async clearOrderNotifications(id){

    //clearing order notigfication by id
     this.badge.get().then((num)=>{

       let count = this.countOrderNotifications(this.notifications,id);
       if (count < num){
              this.badge.decrease(count);
                     this.orderservice.clearOrderNotification(id).subscribe(
                    (res) => {
                          this.notifications_count = res.notifications.length;
                          this.notifications = res.notifications;
                            },
                   (err)=>{
                           this.badge.set(num);
                          })
       }else{
         //a backup plan call ,server to clear all badge
          this.badge.clear();
         this.orderservice.clearNotification("ALL").subscribe(
        (res) => {
              this.notifications_count = res.notifications.length;
              this.notifications = res.notifications;
              this.today_notifications_count = this.countNotifications(this.notifications);
              this.notifications_count = this.notifications_count - this.today_notifications_count;
               },
       (err)=>{
         this.badge.set(num);
              })
       }
    });

       }


        ionViewWillEnter(){
  this.language = this.translate.currentLang;
  this.translate.get(['No network connection','Remove','More','Edit','Close', 'Alert', 'Please wait...', 'OK',
    'Order', 'Order Actions', 'Open', 'Cancel', 'Order assigned',
    'This order been assigned to you successfully', 'Oops !','Phone',
    'Could not establish connection with the server,check your internet connection!',
    'Order unassigned', 'This order has been removed from your list', 'Awesome',
    'Order picked up', 'This order has been picked up successfully', 'Order dropped off',
    'This order has been dropped off successfully', 'Filter orders', 'Waiting', 'Accepted', 'Picked Up', 'Delivered',
    'Filter', 'Loading orders...','Mind giving us some feedback?','No, Thanks','Remind Me Later','Rate It Now','Yes!','Not really',
    'Would you mind rating ','MashaweerDoha','It will not take more than a minute and helps to promote our app. Thanks for your support',
    'Dismiss','Mind giving us some feedback?','Do you like using ','Cancel order','Confirm order cancellation',
    'Confirm order removal','Delivery Confirmed','Your order has been marked as delivered',
    'You will no longer have access to this order,Are you sure you want to remove it ?','Cancel',
    'Confirm','We really appreciate your feed back.','We will make sure that any inconveniences won\'t happen next time.',
    'Thank you for your feed back we will make it better next time.','Thank you','Network connecion established',
  'Thank you so much we are really glade that you are satisfy with our service.','Call agent ?','Call',
  'You will no longer have access to this order,Are you sure you want to cancel it ?']).subscribe(
    value => {
      this.TransArray = value;
    }
    )
    //this.getAllOrders();
}

}
