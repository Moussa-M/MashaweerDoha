import { Injectable }              from '@angular/core';
import { Http ,Response }          from '@angular/http';

//import { SafeHttp } from '../services/factory';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout'
import { Headers, RequestOptions ,URLSearchParams} from '@angular/http';
import { Order,Notification } from "../../models/Order";
import { Storage } from '@ionic/storage';

import { AuthService,GlobalDataService } from '../services/auth'

import { LoginPage } from '../../pages/login/login';

//import { NavController } from 'ionic-angular';

@Injectable()
export class  OrderService {


  constructor (private http :Http,
    public storage:Storage,public globaldataservice:GlobalDataService,public authservice:AuthService) {

  }

  getOrders(next:string,filters:Array<string>,navCtrl): Observable<{'orders':Order[],'next':string}> {


    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
     let filter = new URLSearchParams();
        filter.set('order_status', filters.join(','));
    if(next != ""){
      let options = new RequestOptions({ headers: headers});
            return this.http.get(next,options)
                    .timeout(7000).map(this.extractOrdersData)
                    .catch(this.handleError);
    }else{
      let options = new RequestOptions({ headers: headers,search:filter });
          return this.http.get("https://www.mashaweerdoha.com/api/order/",options)
                    .timeout(7000).map(this.extractOrdersData)
                    .catch(this.handleError);
    }


  }

  getTodayOrders(next:string,filters:Array<string>,navCtrl): Observable<{'orders':Order[],'next':string}> {



    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
     let filter = new URLSearchParams();
        filter.set('order_status', filters.join(','));



    if(next != ""){
      let options = new RequestOptions({ headers: headers });
            return this.http.get(next,options)
                    .timeout(7000).map(this.extractOrdersData)
                    .catch(this.handleError);
    }else{
      let options = new RequestOptions({ headers: headers,search:filter });
          return this.http.get("https://www.mashaweerdoha.com/api/order/today/",options)
                    .timeout(7000).map(this.extractOrdersData)
                    .catch(this.handleError);
    }


  }

  getNotifications(): Observable<{'notifications':Notification[]}> {




    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers});

          return this.http.get("https://www.mashaweerdoha.com/api/customers/notifications/",options)
                    .timeout(7000).map(this.extractNotificationsData)
                    .catch(this.handleError);



  }

    clearNotification(id): Observable<{'notifications':Notification[]}> {



    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers});

          return this.http.put("https://www.mashaweerdoha.com/api/customers/notifications/",{'id':id,'status':'Seen'},options)
                    .timeout(7000).map(this.extractNotificationsData)
                    .catch(this.handleError);


  }

  clearOrderNotification(id): Observable<{'notifications':Notification[]}> {




    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers});

          return this.http.put("https://www.mashaweerdoha.com/api/customers/order_notifications/",{'order_id':id},options)
                    .timeout(7000).map(this.extractNotificationsData)
                    .catch(this.handleError);


  }
  addOrder(order,navCtrl): Observable<{'data':Order,'status':any}> {



    let token = this.globaldataservice['USER'].token;
  	let headers = new Headers();
  	headers.append('Authorization', "Bearer "+token);
  	headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });
    return this.http.post("https://www.mashaweerdoha.com/api/order/",order,options)
                    .timeout(7000).map(this.extractOrder)
                    .catch(this.handleError);

  }

  editOrder(order,navCtrl): Observable<{'data':Order,'status':any}> {

    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });
    return this.http.put("https://www.mashaweerdoha.com/api/order/"+order.id+"/",order,options)
                    .timeout(7000).map(this.extractOrder)
                    .catch(this.handleError);

  }

    removeOrderImg(order): Observable<{'data':Order,'status':any}> {

      let token = this.globaldataservice['USER'].token;
      let headers = new Headers();
      headers.append('Authorization', "Bearer "+token);
      headers.append('Content-Type', "application/json");
      let options = new RequestOptions({ headers: headers });
      return this.http.put("https://www.mashaweerdoha.com/api/order/"+order.id+"/unload_img",options)
                      .timeout(7000).map(this.extractOrder)
                      .catch(this.handleError);

  }

    getOrder(id): Observable<{'data':Order,'status':any}> {

    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });
    return this.http.get("https://www.mashaweerdoha.com/api/order/"+id+"/",options)
                    .timeout(7000).map(this.extractOrder)
                    .catch(this.handleError);
  }

  confirmDelivery(order): Observable<{'data':Order,'status':any}> {

    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });
    let conf = {
      order_status: {
                      confirm_delivery : true,
                  }
     }
    return this.http.put("https://www.mashaweerdoha.com/api/order/"+order.id+"/",conf,options)
                    .timeout(7000).map(this.extractOrder)
                    .catch(this.handleError);

  }

  rateDelivery(order,note,stars): Observable<{'data':Order,'status':any}> {

    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });
    let conf = {
                      note : note,
                      stars : stars,
     }

    return this.http.put("https://www.mashaweerdoha.com/api/order/"+order.id+"/rate/",conf,options)
                    .timeout(7000).map(this.extractOrder)
                    .catch(this.handleError);

  }

  estimateFare(distance,duration,Slat,Slong,Elat,Elong): Observable<any> {

    //let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    //headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });
    let conf = {
                      "distance" : distance,
                      "duration" : duration,
                      "s_lat" : Slat,
                      "s_long":Slong,
                      "e_lat" : Elat,
                      "e_long":Elong

     }

    return this.http.post("https://www.mashaweerdoha.com/EstimateFare/",conf,options)
                    .timeout(7000).map(this.extractFare)
                    .catch(this.handleError);

  }

  deleteOrder(order,navCtrl): Observable<{'data':{},'status':any}> {

    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });
    return this.http.delete("https://www.mashaweerdoha.com/api/order/"+order.id+"/",options)
                    .timeout(7000).map(this.extractOrder)
                    .catch(this.handleError);

  }

  private extractOrdersData(res: Response) {

    let body = res.json();
    return {'orders':body.results,'next':body.next }|| { };
  }

    private extractNotificationsData(res: Response) {

    let body = res.json();
    return {'notifications':body }|| { };
  }

  private extractFare(res: Response) {
  let body = res.json();
  return {'data':body,"status":res.status }|| { };
}

  private extractOrder(res: Response) {
  	console.log(JSON.stringify(res));
    let body = res.json();
    return {'data':body,'status':res.status} || { };
  }

  private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.log(errMsg);
    return Observable.throw(errMsg);
  }

  async recheck_authorization(navCtrl):Promise<{}>{
     return await new Promise((resolve, reject) => {
          this.authservice.is_authenticated(true).then((ok)=>{
          console.log("USer is authenticated");
          resolve(true);
           },(rej)=>{
                console.log("User not auth ?; nother device is open ;");
                navCtrl.setRoot(LoginPage);
                reject(false);
           });
     });

  }
}
