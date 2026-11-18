import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {rateLimit} from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import {randomBytes,createHash} from 'node:crypto';
import * as schema from './validation.js';
const digest=s=>createHash('sha256').update(s).digest('hex');
const safeUser='id,name,email,address,role';
const fail=(status,message)=>Object.assign(new Error(message),{status});
const parse=(s,b)=>{const r=s.safeParse(b);if(!r.success)throw fail(400,r.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '));return r.data;};
const id=v=>{if(!/^\d+$/.test(v)||!Number.isSafeInteger(Number(v))||Number(v)<1)throw fail(400,'Invalid ID');return Number(v);};
export function createApp(db,{production=false,disableRateLimit=false}={}){
 const app=express();
 app.use(helmet());app.use(express.json({limit:'16kb'}));app.use(cookieParser());
 // Same-origin JSON writes prevent cross-site form submissions and CSRF.
 app.use('/api',(req,res,next)=>{
  if(['POST','PUT','DELETE','PATCH'].includes(req.method)){
   if(req.get('sec-fetch-site')==='cross-site')return res.status(403).json({error:'Cross-site request rejected'});
   const origin=req.get('origin');
   if(origin && new URL(origin).host!==req.get('host')) return res.status(403).json({error:'Invalid request origin'});
   if(!req.is('application/json'))return res.status(415).json({error:'JSON content type required'});
  }next();
 });
 const cookie={httpOnly:true,sameSite:'lax',secure:production,path:'/',maxAge:7*24*60*60*1000};
 async function session(req,res,user){
  if(req.cookies.sid)await db.query('DELETE FROM sessions WHERE token_hash=$1',[digest(req.cookies.sid)]);
  await db.query('DELETE FROM sessions WHERE expires_at<NOW()');
  const token=randomBytes(32).toString('hex');
  await db.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '7 days')",[digest(token),user.id]);
  res.cookie('sid',token,cookie).json({user});
 }
 if(!disableRateLimit)app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:100,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Too many attempts. Try again later.'}}));
 app.post('/api/auth/signup',async(req,res)=>{
  const b=parse(schema.signup,req.body),hash=await bcrypt.hash(b.password,12);
  const user=(await db.query(`INSERT INTO users(name,email,address,password_hash,role) VALUES($1,$2,$3,$4,'USER') RETURNING ${safeUser}`,[b.name,b.email,b.address,hash])).rows[0];
  await session(req,res,user);
 });
 app.post('/api/auth/login',async(req,res)=>{
  const b=parse(schema.login,req.body),user=(await db.query('SELECT * FROM users WHERE email=$1',[b.email])).rows[0];
  if(!user||!await bcrypt.compare(b.password,user.password_hash))throw fail(401,'Invalid email or password');
  delete user.password_hash;await session(req,res,user);
 });
 app.use('/api',async(req,res,next)=>{
  if(!req.cookies.sid)throw fail(401,'Please log in');
  const user=(await db.query(`SELECT u.id,u.name,u.email,u.address,u.role FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>NOW()`,[digest(req.cookies.sid)])).rows[0];
  if(!user)throw fail(401,'Session expired. Please log in');req.user=user;next();
 });
 const role=(...roles)=>(req,res,next)=>{if(!roles.includes(req.user.role))throw fail(403,'Access denied');next();};
 app.get('/api/auth/me',(req,res)=>res.json({user:req.user}));
 app.post('/api/auth/logout',async(req,res)=>{await db.query('DELETE FROM sessions WHERE token_hash=$1',[digest(req.cookies.sid)]);res.clearCookie('sid',{path:'/'}).json({ok:true});});
 app.put('/api/auth/password',async(req,res)=>{
  const b=parse(schema.changePassword,req.body),u=(await db.query('SELECT password_hash FROM users WHERE id=$1',[req.user.id])).rows[0];
  if(!await bcrypt.compare(b.currentPassword,u.password_hash))throw fail(400,'Current password is incorrect');
  await db.query('UPDATE users SET password_hash=$1 WHERE id=$2',[await bcrypt.hash(b.newPassword,12),req.user.id]);
  await db.query('DELETE FROM sessions WHERE user_id=$1',[req.user.id]);res.clearCookie('sid',{path:'/'}).json({ok:true});
 });
 app.get('/api/admin/stats',role('ADMIN'),async(req,res)=>res.json((await db.query('SELECT (SELECT COUNT(*) FROM users)::int AS users,(SELECT COUNT(*) FROM stores)::int AS stores,(SELECT COUNT(*) FROM ratings)::int AS ratings')).rows[0]));
 app.post('/api/admin/users',role('ADMIN'),async(req,res)=>{
  const b=parse(schema.createUser,req.body);
  res.status(201).json((await db.query(`INSERT INTO users(name,email,address,password_hash,role) VALUES($1,$2,$3,$4,$5) RETURNING ${safeUser}`,[b.name,b.email,b.address,await bcrypt.hash(b.password,12),b.role])).rows[0]);
 });
 app.get('/api/admin/users',role('ADMIN'),async(req,res)=>{
  const p=[],clauses=[];
  for(const k of ['name','email','address','role'])if(req.query[k]){p.push('%'+String(req.query[k])+'%');clauses.push(`u.${k} ILIKE $${p.length}`);}
  const sort=['name','email','address','role'].includes(req.query.sort)?req.query.sort:'name',dir=req.query.direction==='desc'?'DESC':'ASC';
  res.json((await db.query(`SELECT u.id,u.name,u.email,u.address,u.role,s.id AS store_id FROM users u LEFT JOIN stores s ON s.owner_id=u.id ${clauses.length?'WHERE '+clauses.join(' AND '):''} ORDER BY u.${sort} ${dir},u.id`,p)).rows);
 });
 app.get('/api/admin/users/:id',role('ADMIN'),async(req,res)=>{
  const u=(await db.query(`SELECT ${safeUser} FROM users WHERE id=$1`,[id(req.params.id)])).rows[0];if(!u)throw fail(404,'User not found');
  if(u.role==='OWNER')u.store=(await db.query('SELECT s.id,s.name,AVG(r.value)::float AS rating FROM stores s LEFT JOIN ratings r ON r.store_id=s.id WHERE s.owner_id=$1 GROUP BY s.id',[u.id])).rows[0]||null;
  res.json(u);
 });
 app.post('/api/admin/stores',role('ADMIN'),async(req,res)=>{
  const b=parse(schema.createStore,req.body),owner=(await db.query("SELECT id FROM users WHERE id=$1 AND role='OWNER'",[b.ownerId])).rows[0];
  if(!owner)throw fail(400,'Select a store owner');
  res.status(201).json((await db.query('INSERT INTO stores(name,email,address,owner_id) VALUES($1,$2,$3,$4) RETURNING *',[b.name,b.email,b.address,b.ownerId])).rows[0]);
 });
 app.get('/api/stores',role('USER','ADMIN'),async(req,res)=>{
  const p=[req.user.id],clauses=[];
  for(const k of ['name','address','email'])if(req.query[k]){p.push('%'+String(req.query[k])+'%');clauses.push(`s.${k} ILIKE $${p.length}`);}
  const sort={name:'s.name',email:'s.email',address:'s.address',rating:'rating'}[req.query.sort]||'s.name',dir=req.query.direction==='desc'?'DESC':'ASC';
  res.json((await db.query(`SELECT s.id,s.name,s.email,s.address,AVG(r.value)::float AS rating,COUNT(r.user_id)::int AS count,MAX(CASE WHEN r.user_id=$1 THEN r.value END) AS my_rating FROM stores s LEFT JOIN ratings r ON r.store_id=s.id ${clauses.length?'WHERE '+clauses.join(' AND '):''} GROUP BY s.id ORDER BY ${sort} ${dir} NULLS LAST,s.id`,p)).rows);
 });
 app.put('/api/stores/:id/rating',role('USER'),async(req,res)=>{
  const b=parse(schema.rating,req.body),storeId=id(req.params.id);
  if(!(await db.query('SELECT id FROM stores WHERE id=$1',[storeId])).rows.length)throw fail(404,'Store not found');
  await db.query('INSERT INTO ratings(user_id,store_id,value) VALUES($1,$2,$3) ON CONFLICT(user_id,store_id) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()',[req.user.id,storeId,b.value]);res.json({ok:true});
 });
 app.get('/api/owner/dashboard',role('OWNER'),async(req,res)=>{
  const store=(await db.query('SELECT s.id,s.name,s.address,AVG(r.value)::float AS rating,COUNT(r.user_id)::int AS count FROM stores s LEFT JOIN ratings r ON r.store_id=s.id WHERE s.owner_id=$1 GROUP BY s.id',[req.user.id])).rows[0]||null;
  const sort={name:'u.name',email:'u.email',rating:'r.value',updated_at:'r.updated_at'}[req.query.sort]||'u.name',dir=req.query.direction==='desc'?'DESC':'ASC';
  const ratings=store?(await db.query(`SELECT u.id,u.name,u.email,r.value,r.updated_at FROM ratings r JOIN users u ON u.id=r.user_id WHERE r.store_id=$1 ORDER BY ${sort} ${dir},u.id`,[store.id])).rows:[];
  res.json({store,ratings});
 });
 app.use('/api',(req,res)=>res.status(404).json({error:'Endpoint not found'}));
 app.use((err,req,res,next)=>{
  if(err.code==='23505')return res.status(409).json({error:'Email or store owner is already in use'});
  const status=err.status||500;if(status===500)console.error(err);
  res.status(status).json({error:status===500?'Something went wrong. Please try again.':err.message});
 });
 return app;
}
