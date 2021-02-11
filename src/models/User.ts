/*export class User {
  phone: string;
  password: string;
  token: string;
  status:string;
}*/


export class NewUser {
  phone: string;
  email: string;
  username: string;
  password:string;

  constructor(
  phone: string,
  password: string,
  email: string,
  username: string
  ) {  }
}

export class User {
  phone: string;
  password: string;
  token: string;
  status:string;
  refresh_token:string;
  server_token:string;
  expire_date:string;


  constructor(
  phone: string,
  password: string,
  token: string,
  refresh_token: string,
  server_token: string,
  expire_date: string,
  status:string,
  ) {  }
}

export class Customer {
  user: {
    username:string;
  };
  email: string;
  phone: string;
  is_trader:string;
  lang:string;


  constructor(
  ) {  }
}

export class Profile {
  id: number;
  firstname: string;
  lastname: string;
  city:string;
  birthday:string;
  sexe:string;
  standard:string;
  img:string;
  thumbnail:string;


  constructor(
  id: number,
  firstname: string,
  lastname: string,
  city:string,
  birthday:string,
  sexe:string,
  standard:string,
  img:string,
  thumbnail:string,
  ) {  }
}
