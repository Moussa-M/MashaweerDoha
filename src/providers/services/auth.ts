import { Injectable }              from '@angular/core';
import { Http, Response }          from '@angular/http';
//import { SafeHttp } from '../services/factory';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/timeout'
import { Headers, RequestOptions } from '@angular/http';

import { User } from "../../models/User";
import { Profile } from "../../models/User";
import { Customer } from "../../models/User";
import { RESP } from "../../models/resp";
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { LoginPage } from '../../pages/login/login';
interface GLOBAL {
  [ID: string]: any;
}
@Injectable()
export class GlobalDataService {
  globals: GLOBAL = {};
}

@Injectable()
export class  AuthService {

  private user:User;

  constructor (private http: Http,public storage:Storage,public globaldataservice : GlobalDataService) {
      //this.storage = storage;
      ///this.globaldataservice = globaldataservice;
      this.user = new User("","","","","","","");
      // this.storage.get('USER').then((val) => {
      //   this.user = JSON.parse(val);
      // },(err)=>{
      //
      // })

  }


async is_authenticated(isNetworkOn): Promise<{}> {
   return  new Promise((resolve, reject) => {

        this.storage.get('USER').then((val) => {

         if(val != null &&  val != ""){
           this.user = JSON.parse(val);
           console.log(JSON.stringify(this.user));
             if(this.user.token != null && moment().isBefore(moment(this.user.expire_date))){
                      //if the token hasn't expired but the user opened his app from another
                      this.globaldataservice['USER'] = this.user;
                      this.globaldataservice['AUTHENTICATED'] = true;
                      this.check_token().then((res)=>{
                             resolve(true);
                      },(err)=>{
                           this.refresh_token().then((res)=>{
                              resolve(true);
                            },(err)=>{
                              this.globaldataservice['AUTHENTICATED'] = false;
                              reject(false);
                            })
                      });

             }else{
                  if(this.user.token != null){
                        //get new token
                        this.refresh_token().then((res)=>{
                          this.globaldataservice['AUTHENTICATED'] = true;
                          resolve(true);
                        },(err)=>{
                          this.globaldataservice['AUTHENTICATED'] = false;
                          reject(false);
                        })

                  }else{
                    this.globaldataservice['AUTHENTICATED'] = false;
                    reject(false);
                  }
             }
         }else{
           this.globaldataservice['AUTHENTICATED'] = false;
           reject(false);
         }
      },(err)=>{
        this.globaldataservice['AUTHENTICATED'] = false;
        reject(false);
      })
  });
 }


async refresh_token():Promise<{}>{
  return await new Promise((resolve, reject) => {
  if(this.user.refresh_token != "" && this.user.refresh_token != null){

        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded'});
        let options = new RequestOptions({ headers: headers });
        //let body = new URLSearchParams();
        //body.set('client_id', 'fWHQO4gFbvuWaGSRtz8V5CJj5F0uzk5J3yZ0olTu');
        //body.set('grant_type', 'refresh_token');
        //body.set('refresh_token', user.refresh_token);
        let body = `client_id=fWHQO4gFbvuWaGSRtz8V5CJj5F0uzk5J3yZ0olTu&grant_type=refresh_token&refresh_token=`+this.user.refresh_token;
       this.http.post(
        'https://www.mashaweerdoha.com/o/token/',
        body, options

      ).timeout(5000).map((res)=>{
        let body = res.json();
          this.user.token = body.access_token;
          this.user.refresh_token = body.refresh_token;
          this.user.expire_date = moment().add(35000,'seconds').format();

          this.storage.set('USER',JSON.stringify(this.user));
          this.globaldataservice['USER'] = this.user;

       return this.user;
      })
       .catch((this.handleError)).subscribe((res)=>{
         //console.log("res");
         //console.log(res);
         resolve(true);
       },(err)=>{
         //console.log("errrrrr "+err);
         reject(false);
       })

     }else{
       console.log("kiddddd");
       reject(false);
     }

  })
}


  login(phone:string, password:string):Observable<User> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post(
        'https://www.mashaweerdoha.com/LogIn/',
        { 'phone':phone, 'password':password, 'isdriver':false},
        options
      ).timeout(5000).map((res)=>{
        let body = res.json();
        if(body.status == "ACCESS_GRANTED" || body.status == "ACCOUNT_ACTIVE"){
          this.user.password = password;
          this.user.phone = body.phone;
          this.user.token = body.token;
          this.user.refresh_token = body.refresh_token;
          this.user.expire_date = body.expire_date;
          this.user.server_token = body.server_token;

          this.storage.set('USER',JSON.stringify(this.user));
          this.globaldataservice['USER'] = this.user;
          this.globaldataservice['AUTHENTICATED'] = true;


          setTimeout(()=>{
            this.getProfile().subscribe((res)=>{
              console.log("profile is up");
            },(err)=>{
              console.log("profile not up !!");
            });
          },1);
          setTimeout(()=>{
            this.getCustomer().subscribe((res)=>{
              console.log("customer is up");
            },(err)=>{
              console.log("customer not up !!");
            });
          },1);
          console.log(this.globaldataservice['USER'])

        }else{
          this.globaldataservice['AUTHENTICATED'] = false;
        }
       return body || { };
      })
       .catch(this.handleError);

  }

  register(phone:string,email:string,username:string, password:string):Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post(
        'https://www.mashaweerdoha.com/api/customers/',
        { 'user':{'username':username, 'password':password},'phone':phone,'email':email },
        options
      ).timeout(5000).map((res)=>{
        let body = res.json();

        console.log("herere ");
       return {'data':body,'status':res.status} || { };
      })
       .catch(this.myhandleError);

  }


async check_token():Promise<{}>{

return await new Promise((resolve, reject) => {
    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/x-www-form-urlencoded");
    let options = new RequestOptions({ headers: headers });

      let body = `Authorization=Bearer `;+token;
     this.http.post('https://www.mashaweerdoha.com/api/check_token/',body,options).timeout(5000).map((res)=>{

           if(res.status == 200){
                 return true;
           }else{
               return false;
           }
     }).catch((this.handleError)).subscribe((res)=>{
         console.log("res");
         console.log(res);
         if(res){
           resolve(true);
         }else{
           reject(false);
         }
       },(err)=>{
         console.log("err "+err);
        reject(false);
       })
   });
}


getProfile():Observable<Profile> {
    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });

    return this.http
      .get(
        'https://www.mashaweerdoha.com/api/profile/me/',
        options
      ).timeout(5000).map((res)=>{
        console.log();
        let body = res.json();
        console.log("body");
        console.log(body);
        if(res.status == 200){
          setTimeout(()=>{
          this.storage.set('PROFILE',JSON.stringify(body));
          this.globaldataservice['PROFILE'] = body;
          },1);
        }
       return body || { };
      })
       .catch(this.handleError);

  }

    getCustomer():Observable<Customer> {

    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });

    return this.http
      .get(
        'https://www.mashaweerdoha.com/api/customers/me/',
        options
      ).timeout(5000).map((res)=>{
        let body = res.json();
        if(res.status == 200){
          setTimeout(()=>{
          this.storage.set('CUSTOMER',JSON.stringify(body));
          this.globaldataservice['CUSTOMER'] = body;
          },1);
        }
       return body || { };
      })
       .catch(this.handleError);

  }

  setCustomer(customer,navCtrl):Observable<{'data':Customer,'status':any}> {
    //this.recheck_authorization(navCtrl);
    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });

    return this.http
      .put(
        'https://www.mashaweerdoha.com/api/customers/me/',customer,
        options
      ).timeout(5000).map((res)=>{

        let body = res.json();
        if(res.status == 200){
          this.storage.set('CUSTOMER',JSON.stringify(body));
          this.globaldataservice['CUSTOMER'] = body;
        }else{

        }
        console.log("body");
        console.log(body);
        return {'data':body,'status':res.status} || { };
      })
       .catch(this.myhandleError);

  }

  setProfile(profile,navCtrl):Observable<{'data':Profile,'status':any}> {
    //this.recheck_authorization(navCtrl);
    let token = this.globaldataservice['USER'].token;
    let headers = new Headers();
    headers.append('Authorization', "Bearer "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });
    delete profile.img
    delete profile.thumbnail
    delete profile.standard

    return this.http
      .put(
        'https://www.mashaweerdoha.com/api/profile/me/',profile,
        options
      ).timeout(5000).map((res)=>{
        console.log("res");
        console.log(res);
        let body = res.json();
        if(res.status == 200){
          this.storage.set('PROFILE',JSON.stringify(body));
          this.globaldataservice['PROFILE'] = body;
        }else{

        }

        return {'data':body,'status':res.status} || { };
      })
       .catch(this.myhandleError);

  }


  logout(){
      let token = this.globaldataservice['USER'].token;
      this.storage.set('USER',"");
      let headers = new Headers();
      headers.append('Authorization', "Bearer "+token);
      headers.append('Content-Type', "application/json");
      let options = new RequestOptions({ headers: headers });
      return this.http.get("https://www.mashaweerdoha.com/LogOut/",options)
                      .map(this.extractData)
                      .catch(this.handleError);
  }



  confirmPhoneNumber(code:string,phone:string):Observable<RESP> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    //headers.append('Autherization', this.storage.get('AUTH_TOKEN'));

    return this.http
      .post(
        'https://www.mashaweerdoha.com/Verify/',
        { 'code':code,'phone':phone},
        options
      ).timeout(5000).map(this.extractData)
       .catch(this.handleError);

  }

   sendPhoneCode(phone:string):Observable<{'data':RESP,'status':any}> {
      let token = this.globaldataservice['USER'].token;
      let headers = new Headers();
      headers.append('Authorization', "Bearer "+token);
      headers.append('Content-Type', "application/json");
      let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        'https://www.mashaweerdoha.com/sendPhoneCode/',
        {'phone':phone},
        options
      ).timeout(5000).map((res)=>{
         let body = res.json();
         return {'data':body,'status':res.status} || { };
      })
       .catch(this.handleError);

  }

    resendPhoneCode(phone:string):Observable<RESP> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    //headers.append('Autherization', this.storage.get('AUTH_TOKEN'));
    return this.http
      .post(
        'https://www.mashaweerdoha.com/ResendCode/',
        {'phone':phone},
        options
      ).timeout(5000).map(this.extractData)
       .catch(this.handleError);

  }

  checkAppVersion(version:string):Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let token = this.user.server_token;
    headers.append('Authorization', "Token "+token);
    headers.append('Content-Type', "application/json");
    let options = new RequestOptions({ headers: headers });

    return this.http
      .get(
        'https://www.mashaweerdoha.com/CheckAppVersion/'+version+'/',
        options
      ).timeout(5000).map(this.extractData)
       .catch(this.handleError);

  }


  private extractData(res: Response) {

    let body = res.json();
    return body || { };
  }
  private handleError (error: Response | any) {
    console.log(error);
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    //console.error(errMsg);
    return Observable.throw(errMsg);
  }

  private myhandleError (error: Response | any) {
    console.log("error");
    console.log(error);
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
        return Observable.throw({'data':body,'status':error.status});

     } else {
      errMsg = error.message ? error.message : error.toString();
    return Observable.throw(errMsg);
    }
    //console.error(errMsg);
  }


   async recheck_authorization(navCtrl):Promise<{}>{
     return  new Promise((resolve, reject) => {
         this.is_authenticated(true).then((ok)=>{
         console.log("USer is authenticated");
          resolve(true);
         },(rej)=>{
              console.log("User not auth ?; nother device is open ;");
              navCtrl.setRoot(LoginPage);
              reject(false);
              //this.logout().subscribe((res)=>{
                //    return false;
                    // beta Test
                    /*this.authservice.login(this.globaldataservice['USER'].phone,this.globaldataservice['USER'].password).subscribe((res)=>{
                            canE = true;
                      },(err)=>{
                          canE = false;
                      })*/

             // },(err)=>{

               //     console.log("Can LogOut !!!!!");
              //})
         });
     });

  }

async is_intro_shown(): Promise<{}> {
   return  new Promise((resolve, reject) => {
     this.storage.get('isIntroShown').then((val) => {
       if(val){
         resolve(true);
       }else{
         resolve(false);
       }
     });

   });
 }

}
