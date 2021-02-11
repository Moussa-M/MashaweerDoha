import {
    Component,ViewChild
} from '@angular/core';
import {IonicPage,
    NavParams,ViewController,Content
} from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
@IonicPage()
@Component({
    selector: 'page-trackinfo',
    templateUrl: 'trackinfo.html'
})

export class TrackInfoPage{
    @ViewChild(Content) content: Content;
    public language: string;
    public TransArray: string;
    public order :any;
    constructor(public translate: TranslateService,public viewCtrl: ViewController,public params: NavParams) {
        this.order = params.get("order");
    }
dismiss(){
  this.viewCtrl.dismiss();
}

ionViewWillEnter(){
this.language = this.translate.currentLang;
}

}
