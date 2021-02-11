export class Notification {
  id:number;
  date:string;
  order_id:number;
  order_status:string;
  title:string;
  content:string;
}
export class Order {
  id:number;
  customer:number;
  driver:number;
  num: string;
  reciever_phone : string;
    pickup_time : string;
    dropoff_time : string;
  order_payment:{
    delivery_price:number;
    package_price:number;
    customer_payed:number;
  };
  order_status:{
     customer_order_status:string;
    driver_order_status:string;
    confirm_delivery:boolean;
  };
  location:{
  	pick_up_lat:number;
  	pick_up_long:number;
  	drop_off_lat:number;
  	drop_off_long:number;
  	pick_up_name:string;
  	drop_off_name:string;
  	distance:number;
  	duration:number;
  };
  package:{
  	id:number;
  	note:string;
  	img:string;
    thumbnail:string;
  	thumbnail_ph:string;
  };
  store:number;
  anonymous_id: string;

  customer_phone: string;
  customer_img: string;
  customer_username: string;
  customer_fullname: string;

  driver_phone: string;
  driver_img: string;
  driver_username: string;
  driver_fullname: string;
  pickup_time_asap:boolean;
  dropoff_time_asap:boolean;
  shopping:boolean;
}

export class NewOrder {
  	constructor(){

  	}
   order_payment:{
    delivery_price:number;
    package_price:number;
    customer_payed:number;
       };
    reciever_phone : string;
    pickup_time : string;
    dropoff_time : string;
  location:{
  	pick_up_lat:number;
  	pick_up_long:number;
  	drop_off_lat:number;
  	drop_off_long:number;
  	pick_up_name:string;
  	drop_off_name:string;
  	distance:number;
  	duration:number;
  };
  package:{
  	title:string;
  	note:string;
  	img:string;
  };
}
