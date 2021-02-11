import { Component } from '@angular/core';
import { IonicPage,App,NavController,ViewController,AlertController,NavParams } from 'ionic-angular';
//import { IonicPage } from 'ionic-angular';
import { AuthService } from '../../providers/services/auth'

import {
    OrderService
} from '../../providers/services/orderservice';

@IonicPage()
@Component({
  selector: 'ordernotifications',
  templateUrl: 'ordernotifications.html',
  providers:[AuthService]
})
export class OrderNotificationsPage {

  public order : any;
  public notifications : any;
  constructor(
    //private nativePageTransitions: NativePageTransitions,
    public appCtrl: App,public viewCtrl: ViewController,
  	public alertCtrl: AlertController,
    public params: NavParams,
    public orderservice: OrderService,
  	public navCtrl: NavController,public authservice:AuthService) {
      this.order = params.get('order');
      this.notifications = params.get('not');
  }



}
