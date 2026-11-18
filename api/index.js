import {connectDatabase} from '../server/db.js';
import {createApp} from '../server/app.js';

// Reuse one pool and Express application per warm function instance.
let application;
export default async function handler(req,res){
 try{
  application ??= connectDatabase().then(db=>createApp(db,{production:true})).catch(error=>{application=undefined;throw error;});
  return (await application)(req,res);
 }catch(error){
  console.error('API initialization failed:',error.message);
  res.status(503).json({error:'Database connection is not configured or is unavailable.'});
 }
}
