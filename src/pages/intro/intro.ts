import { Component ,ViewChild} from '@angular/core';
import { IonicPage,NavController,Slides} from 'ionic-angular';


import { Storage } from '@ionic/storage';

import { WelcomePage } from '../welcome/welcome';
import { HomePage } from '../home/home';
import { AddorderPage } from '../addorder/addorder';

import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';
@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html'
})
export class IntroPage {
public showSkip:boolean=false;
   @ViewChild(Slides) slides: Slides;
  constructor(public translate: TranslateService,public storage:Storage,public navCtrl: NavController) {

  }


onSlideChangeStart(slider) {
  this.showSkip = !slider.isEnd();
}
skipIntro() {
  this.storage.set('isIntroShown',true);
  this.navCtrl.setRoot(WelcomePage, {}, {
    animate: true,
    direction: 'forward'
  },()=>{});
}
startEng(){
  this.storage.set('language','en');
  this.translate.use('en');
  this.slides.slideNext();
}
startAr(){
    this.storage.set('language','ar');
    this.translate.use('ar');
    moment.locale('ar-dz');
    this.slides.slideNext();
    // setTimeout(()=>{
    //     this.navCtrl.setRoot(IntroPage);
    // },100);
}
// goToHome(){
//     this.storage.set('isIntroShown',true);
//     setTimeout(()=>{
//         this.navCtrl.setRoot(LoginPage);
//     },100);
//   }
//   goToHomeArabic(){
//       this.storage.set('isIntroShown',true);
//       this.storage.set('language','ar');
//       this.translate.use('ar');
//       moment.locale('ar-dz');
//       setTimeout(()=>{
//           this.navCtrl.setRoot(LoginPage);
//       },100);
//     }
}
