import { Component, ChangeDetectorRef } from '@angular/core';
import { normalizeURL,IonicPage,PopoverController, NavController, LoadingController, ActionSheetController, ToastController, AlertController } from 'ionic-angular';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

import { Camera } from '@ionic-native/camera';

import { Profile } from "../../models/User";

import { AuthService, GlobalDataService } from '../../providers/services/auth'

import * as moment from 'moment';

import { Storage } from '@ionic/storage';
import {
  Platform
} from 'ionic-angular';
import {
  Network
} from '@ionic-native/network';

import { LoginPage } from '../login/login';
import { TranslateService } from '@ngx-translate/core';

declare var cordova: any;
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  postTitle: any;
  desc: any;
  imageChosen: any = 0;
  imagePath: any;
  imageNewPath: any;
  profile: any;
  customer: any;
  authservice: any;
  editfn: Boolean;
  editln: Boolean;
  editbirthday: Boolean;
  editsexe: Boolean;
  editcity: Boolean;
  firstname: string;
  lastname: string;
  sexe: string;
  city: string;
  birthday: string;
  changeref: any;
  private platform: any;
  private network: any;
  BIRTHDAY_MAX: any;
  BIRTHDAY_MIN: any;
  globaldataservice: any;
  storage: any;
  public language: string;
  public TransArray;
  constructor(public translate: TranslateService,
    //private nativePageTransitions: NativePageTransitions,
    storage: Storage, globaldataservice: GlobalDataService, public toastCtrl: ToastController,
     network: Network, platform: Platform, public alertCtrl: AlertController,
      changeref: ChangeDetectorRef, authservice: AuthService, private camera: Camera,
      private transfer: FileTransfer, public navCtrl: NavController, public actionSheet: ActionSheetController, public loadingCtrl: LoadingController, public popoverCtrl: PopoverController) {
    this.profile = new Profile(0, "", "", "", "", "", "", "", "");
    this.authservice = authservice;
    this.editfn = false;
    this.editln = false;
    this.editbirthday = false;
    this.editsexe = false;
    this.editcity = false;
    this.changeref = changeref;
    this.platform = platform;
    this.network = network;
    this.storage = storage;
    this.globaldataservice = globaldataservice;
    //this.BIRTHDAY_MIN = moment(, moment.ISO_8601).format();
    this.BIRTHDAY_MAX = moment(moment(), moment.ISO_8601).format();

  }


  ionViewCanEnter() {
    this.storage.get('PROFILE').then((val) => {
      console.log(val);
      console.log(JSON.parse(val));
      if (val != null && val != "") {
        this.profile = JSON.parse(val);
        this.firstname = this.profile.firstname;
        this.lastname = this.profile.lastname;
        this.birthday = this.profile.birthday;
        this.city = this.profile.city;
        this.sexe = this.profile.sexe;
        this.globaldataservice['PROFILE'] = this.profile;
        return true;
      } else {
        return false;
      }
    });

  }
  cancelEdit() {
    this.editfn = false;
    this.editln = false;
    this.editbirthday = false;
    this.editsexe = false;
    this.editcity = false;
  }
  editFN() {
    this.editfn = !this.editfn;
  }
  editLN() {
    this.editln = !this.editln;
  }
  editSexe() {
    this.editsexe = !this.editsexe;
  }
  editCity() {
    this.editcity = !this.editcity;
  }
  editBirthDay() {
    this.editbirthday = !this.editbirthday;
  }
  saveFN() {
    if (!this.globaldataservice['is_connected']) {
      let toast = this.toastCtrl.create({
        message: this.TransArray['No network connection'],
        duration: 4000,
        position: 'bottom',
        cssClass: 'lostconnect'
      });

      toast.present();
    } else {


      if (this.firstname != this.profile.firstname) {
        window['plugins'].spinnerDialog.show(null, this.TransArray["Please wait..."], true);
        let tmp = Object.assign({}, this.profile);
        tmp.firstname = this.firstname;
        this.authservice.setProfile(tmp, this.navCtrl).subscribe((res) => {
          window['plugins'].spinnerDialog.hide();
          if (res.status == 200) {
            this.profile = res.data;
            this.editfn = !this.editfn;
            this.changeref.detectChanges();
          } else {
            console.log(res.data);
          }
        }, (err) => {
          window['plugins'].spinnerDialog.hide();
          console.log('err');
          console.log(err);
          if (err.data.result.firstname != null) {
            let alert = this.alertCtrl.create({
              title: this.TransArray['Alert'],
              subTitle: this.TransArray['Too long'],
              buttons: [this.TransArray['OK']]
            });
            alert.present();
          }
          //throw err
        });


      } else {
        this.editfn = false;
      }

    }



  }


  saveLN() {
    if (!this.globaldataservice['is_connected']) {
      let toast = this.toastCtrl.create({
        message: this.TransArray['No network connection'],
        duration: 4000,
        position: 'bottom',
        cssClass: 'lostconnect'
      });

      toast.present();
    } else {



      if (this.lastname != this.profile.lastname) {
        window['plugins'].spinnerDialog.show(null, this.TransArray["Please wait..."], true);
        let tmp = Object.assign({}, this.profile);
        tmp.lastname = this.lastname;
        this.authservice.setProfile(tmp, this.navCtrl).subscribe((res) => {
          window['plugins'].spinnerDialog.hide();
          if (res.status == 200) {
            this.profile = res.data;
            this.editln = !this.editln;
            this.changeref.detectChanges();
          } else {
            console.log(res.data);
          }
        }, (err) => {
          window['plugins'].spinnerDialog.hide();
          console.log('err');
          console.log(err);
          if (err.data.result.lastname != null) {
            let alert = this.alertCtrl.create({
              title: this.TransArray['Alert'],
              subTitle: this.TransArray['Too long'],
              buttons: [this.TransArray['OK']]
            });
            alert.present();
          }
          //throw err
        });

      } else {
        this.editln = false;
      }


    }



  }



  saveSexe() {
    if (!this.globaldataservice['is_connected']) {
      let toast = this.toastCtrl.create({
        message: this.TransArray['No network connection'],
        duration: 4000,
        position: 'bottom',
        cssClass: 'lostconnect'
      });

      toast.present();
    } else {


      if (this.sexe != this.profile.sexe) {
        window['plugins'].spinnerDialog.show(null, this.TransArray["Please wait..."], true);
        let tmp = Object.assign({}, this.profile);
        tmp.sexe = this.sexe;
        this.authservice.setProfile(tmp, this.navCtrl).subscribe((res) => {
          window['plugins'].spinnerDialog.hide();
          if (res.status == 200) {
            this.profile = res.data;
            this.editsexe = !this.editsexe;
            this.changeref.detectChanges();
          } else {
            console.log(res.data);
          }
        }, (err) => {
          window['plugins'].spinnerDialog.hide();
          console.log('err');
          console.log(err);
          if (err.data.result.sexe != null) {
            let alert = this.alertCtrl.create({
              title: this.TransArray['Alert'],
              subTitle: this.TransArray['Could not establish connection with the server,check your internet connection!'],
              buttons: [this.TransArray['OK']]
            });
            alert.present();
          }
          //throw err
        });
      } else {
        this.editsexe = false;
      }

    }


  }

  saveBirthDay() {
    if (!this.globaldataservice['is_connected']) {
      let toast = this.toastCtrl.create({
        message: this.TransArray['No network connection'],
        duration: 4000,
        position: 'bottom',
        cssClass: 'lostconnect'
      });

      toast.present();
    } else {

      if (this.birthday != this.profile.birthday) {
        window['plugins'].spinnerDialog.show(null, this.TransArray["Please wait..."], true);
        let tmp = Object.assign({}, this.profile);
        let bd = moment(this.birthday, moment.ISO_8601).utc().hour(1).format();
        this.birthday = bd;
        console.log("this.birthday");
        console.log(this.birthday);
        tmp.birthday = this.birthday;
        this.authservice.setProfile(tmp, this.navCtrl).subscribe((res) => {
          window['plugins'].spinnerDialog.hide();
          if (res.status == 200) {
            this.profile = res.data;
            this.editbirthday = !this.editbirthday;
            this.changeref.detectChanges();
          } else {
            console.log(res.data);
          }
        }, (err) => {
          window['plugins'].spinnerDialog.hide();
          console.log('err');
          console.log(err);
          if (err.data.result.birthday != null) {
            let alert = this.alertCtrl.create({
              title: this.TransArray['Alert'],
              subTitle: this.TransArray['Could not establish connection with the server,check your internet connection!'],
              buttons: [this.TransArray['OK']]
            });
            alert.present();
          }
          //throw err
        });
      } else {
        this.editbirthday = false;
      }

    }



  }

  saveCity() {
    if (!this.globaldataservice['is_connected']) {
      let toast = this.toastCtrl.create({
        message: this.TransArray['No network connection'],
        duration: 4000,
        position: 'bottom',
        cssClass: 'lostconnect'
      });

      toast.present();
    } else {

      if (this.city != this.profile.city) {
        window['plugins'].spinnerDialog.show(null, this.TransArray["Please wait..."], true);
        let tmp = Object.assign({}, this.profile);
        tmp.city = this.city;
        this.authservice.setProfile(tmp, this.navCtrl).subscribe((res) => {
          window['plugins'].spinnerDialog.hide();
          if (res.status == 200) {
            this.profile = res.data;
            this.editcity = !this.editcity;
            this.changeref.detectChanges();
          } else {
            console.log(res.data);
          }
        }, (err) => {
          window['plugins'].spinnerDialog.hide();
          console.log('err');
          console.log(err);
          if (err.data.result.city != null) {
            let alert = this.alertCtrl.create({
              title: this.TransArray['Alert'],
              subTitle: this.TransArray['Could not establish connection with the server,check your internet connection!'],
              buttons: [this.TransArray['OK']]
            });
            alert.present();
          }
          //throw err
        });

      } else {
        this.editcity = false;
      }
    }


  }




  changeProfileImg() {


    let actionSheet = this.actionSheet.create({
      title: this.TransArray['Choose Picture Source'],
      buttons: [
        {
          text: this.TransArray['Gallery'],
          icon: 'albums',
          handler: () => {
            this.actionHandler(1);
          }
        },
        {
          text: this.TransArray['Camera'],
          icon: 'camera',
          handler: () => {
            this.actionHandler(2);
          }
        },
        {
          text: this.TransArray['Cancel'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();



  }


  //}

  actionHandler(selection: any) {
    var options: any;

    if (selection == 1) {
      options = {
        quality: 75,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 700,
        targetHeight: 700,
        //saveToPhotoAlbum: true
      };
    } else {
      options = {
        quality: 75,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: this.camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 700,
        targetHeight: 700,
        //saveToPhotoAlbum: true
      };
    }

    cordova.plugins.diagnostic.requestCameraAuthorization(
      (status) => {
        if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {
          this.camera.getPicture(options).then((imgUrl) => {
          //  this.authservice.is_authenticated(true).then((res) => {

              //var sourceDirectory = imgUrl.substring(0, imgUrl.lastIndexOf('/') + 1);
              //var sourceFileName = imgUrl.substring(imgUrl.lastIndexOf('/') + 1, imgUrl.length);
              //sourceFileName = sourceFileName.split('?').shift();
              const fileTransfer: FileTransferObject = this.transfer.create();
              let token = this.globaldataservice['USER'].token;

              let options1: FileUploadOptions = {
                fileKey: 'avatar_img',
                fileName: 'avatar_img',
                httpMethod: 'PUT',
                headers: { 'Authorization': "Bearer " + token }
              }

              window['plugins'].spinnerDialog.show(null, this.TransArray["Please wait..."], true);

              let uri = encodeURI('https://www.mashaweerdoha.com/api/customers/me/upload_image/');
              var ur = normalizeURL(imgUrl);
              fileTransfer.upload(ur, uri, options1)
                .then((data) => {
                  setTimeout(() => {
                    this.authservice.getProfile().subscribe((res) => {
                      this.profile = res;
                      this.changeref.detectChanges();
                      //let elm = document.getElementById("avatar");

                      window['plugins'].spinnerDialog.hide();
                    }, (err) => {
                      console.log("profile not up !!");
                      window['plugins'].spinnerDialog.hide();
                      //this.changeref.detectChanges();
                    });
                  }, 1);

                }, (err) => {
                  // error
                  window['plugins'].spinnerDialog.hide();
                  let alert = this.alertCtrl.create({
                    title: this.TransArray['Oops !'],
                    subTitle: this.TransArray["Could not establish connection with the server,check your internet connection!"],
                    buttons: [this.TransArray['OK']],
                  });
                  alert.present();

                });

            // }, (err) => {
            //   this.navCtrl.setRoot(LoginPage);
            // });

          });
        } else {
          let alert = this.alertCtrl.create({
            title: this.TransArray['Camera access is off'],
            subTitle: this.TransArray['In order choose a image please enable access to camera.'],
            buttons: [{
              text: this.TransArray['OK'],
              handler: () => {
                alert.dismiss();
                return false;
              }
            }]
          });
          alert.present();
        }
      }, function(error) {

      }, false);



  }

  ionViewWillEnter() {
    this.language = this.translate.currentLang;
    this.translate.get(['No network connection', 'Alert', 'Please wait...', 'OK', 'Too long',
      'Oops !', 'Camera access is off', 'In order choose a image please enable access to camera.',
      'Could not establish connection with the server,check your internet connection!',
      'Awesome', 'Choose Picture Source', 'Gallery', 'Camera', 'Cancel'
    ]).subscribe(
      value => {
        this.TransArray = value;
      }
      )
  }

}
