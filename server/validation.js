import {z} from 'zod';
export const password = z.string().min(8).max(16).regex(/[A-Z]/,'Include an uppercase letter').regex(/[^A-Za-z0-9\s]/,'Include a special character');
export const profile = z.object({name:z.string().trim().min(20).max(60),email:z.email().max(254).transform(v=>v.toLowerCase()),address:z.string().trim().min(1).max(400)});
export const signup = profile.extend({password});
export const createUser = signup.extend({role:z.enum(['ADMIN','USER','OWNER'])});
export const createStore = profile.extend({ownerId:z.number().int().positive()});
export const login = z.object({email:z.email().transform(v=>v.toLowerCase()),password:z.string().min(1).max(100)});
export const changePassword = z.object({currentPassword:z.string().min(1).max(100),newPassword:password});
export const rating = z.object({value:z.number().int().min(1).max(5)});
