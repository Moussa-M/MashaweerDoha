import {
    Component,ViewChild
} from '@angular/core';
import {
    IonicPage,NavParams,ViewController,Content
} from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
@IonicPage()
@Component({
    selector: 'page-estimatedprice',
    templateUrl: 'estimatedprice.html'
})

export class EstimatedPricePage{
    @ViewChild(Content) content: Content;
    public language: string;
    public TransArray: string;
    public price :string;
    constructor(public translate: TranslateService,public viewCtrl: ViewController,public params: NavParams) {
        this.price = params.get("order");
    }
dismiss(){
  this.viewCtrl.dismiss();
}

ionViewWillEnter(){
this.language = this.translate.currentLang;
}

}
