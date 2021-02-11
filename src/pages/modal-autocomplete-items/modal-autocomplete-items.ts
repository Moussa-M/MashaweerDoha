import { Component, OnInit, ChangeDetectorRef,ViewChild} from '@angular/core';
import { IonicPage,ViewController ,NavParams,} from 'ionic-angular';

declare var google: any;


@IonicPage()
@Component({
    selector: 'page-modal-autocomplete-items',
    templateUrl: 'modal-autocomplete-items.html'
})
export class ModalAutocompleteItemsPage implements OnInit{
  //  @ViewChild('myinput') myInput;
  @ViewChild('search') search;
    autocompleteItems: any;
    autocomplete: any;
    acService:any;
    placesService: any;
    title:any;

    constructor(public viewCtrl: ViewController,public params: NavParams,public changeref: ChangeDetectorRef) {
    	this.title = params.get("title");
    }

    ngOnInit() {
      console.log('on init');
        this.acService = new google.maps.places.AutocompleteService();
        this.autocompleteItems = [];
        this.autocomplete = {
            query: ''
        };

    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    chooseItem(item: any) {
        //console.log('modal > chooseItem > item > ');
        setTimeout(()=>{
        	this.viewCtrl.dismiss(item);
        },250);

    }

    updateSearch() {
      //  console.log('modal > updateSearch');
        if (this.autocomplete.query == '') {
            this.autocompleteItems = [];
            this.changeref.detectChanges();
            return;
        }

        let config = {
            //types:  ['geocode',"establishment","regions","cities",],
            // other types available in the API: 'establishment', 'regions', and 'cities'
            input: this.autocomplete.query,
            componentRestrictions: { country: 'QA' }
        }
        this.acService.getPlacePredictions(config,  (predictions, status) =>{
            //console.log('modal > getPlacePredictions > status > ', status);
            if(status=="ZERO_RESULTS"){
            	this.autocompleteItems = [];
            	   this.changeref.detectChanges();
            }else{
            	 this.autocompleteItems = [];
            predictions.forEach( (prediction) =>{
                this.autocompleteItems.push(prediction);
            });
              this.changeref.detectChanges();
            }

        });

    }
    ionViewDidEnter(){
    //  console.log('before');
        //  this.keyboard.show();
          setTimeout(()=>{
              this.search.setFocus();
          },0);

    }

    chooseFromMap(){
      setTimeout(()=>{
        this.viewCtrl.dismiss("CHOOSE_FROM_MAP");
      },250);
    }
    setCurrentLocation(){
      setTimeout(()=>{
        this.viewCtrl.dismiss("CURRENT_LOCATION");
      },250);
    }
}
