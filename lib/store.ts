import { JSONFilePreset } from "lowdb/node"; import path from "path";
export type Category={id:string;name:string}; export type Texture={id:string;title:string;description:string;imageUrl:string;version:string;downloadUrl:string;categoryId:string;createdAt:string}; export type Data={categories:Category[];textures:Texture[]};
const file=path.join(process.cwd(),"data.json"); const initial:Data={categories:[{id:"seeds",name:"Seeds"}],textures:[]};
export async function db(){return JSONFilePreset<Data>(file,initial)}
