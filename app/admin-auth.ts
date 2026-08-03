import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { ensureDatabaseSchema } from "../db/ensure-schema";
import { getChatGPTUser } from "./chatgpt-auth";

const DEFAULT_ADMIN_EMAIL = "r.lavega@ideamos.com.ar";
const SESSION_COOKIE = "ideamos_admin_session";
const SESSION_DAYS = 7;
const ITERATIONS = 210000;
const ATTEMPT_LIMIT = 5;

type AdminRow = { id:number; email:string; passwordHash:string; passwordSalt:string; passwordIterations:number; displayName:string };
export type AdminIdentity = { id:number; email:string; displayName:string };

const normalizeEmail = (value:string) => value.trim().toLowerCase();
function encode(bytes:Uint8Array){let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");}
function decode(value:string){const normalized=value.replace(/-/g,"+").replace(/_/g,"/");const padded=normalized+"=".repeat((4-normalized.length%4)%4);return Uint8Array.from(atob(padded),character=>character.charCodeAt(0));}
function randomToken(size=32){return encode(crypto.getRandomValues(new Uint8Array(size)));}
async function digest(value:string){return encode(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))));}
async function derive(password:string,salt:Uint8Array,iterations:number){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt,iterations},key,256);return encode(new Uint8Array(bits));}
function equal(a:string,b:string){const left=new TextEncoder().encode(a),right=new TextEncoder().encode(b);if(left.length!==right.length)return false;let difference=0;for(let index=0;index<left.length;index+=1)difference|=left[index]^right[index];return difference===0;}
function cookieValue(header:string|null,name:string){if(!header)return null;for(const part of header.split(";")){const [key,...rest]=part.trim().split("=");if(key===name)return decodeURIComponent(rest.join("="));}return null;}

async function adminByEmail(email:string){await ensureDatabaseSchema();return env.DB.prepare("SELECT id,email,password_hash AS passwordHash,password_salt AS passwordSalt,password_iterations AS passwordIterations,display_name AS displayName FROM admin_users WHERE email=? LIMIT 1").bind(normalizeEmail(email)).first<AdminRow>();}
async function adminByToken(token:string|null){if(!token)return null;await ensureDatabaseSchema();return (await env.DB.prepare("SELECT u.id,u.email,u.display_name AS displayName FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? LIMIT 1").bind(await digest(token),new Date().toISOString()).first<AdminIdentity>())??null;}

export async function getAdminIdentity(){const requestHeaders=await headers();return adminByToken(cookieValue(requestHeaders.get("cookie"),SESSION_COOKIE));}
export async function getAdminIdentityFromRequest(request:Request){return adminByToken(cookieValue(request.headers.get("cookie"),SESSION_COOKIE));}
export async function isAdminRequestAuthorized(request:Request){if(!["GET","HEAD","OPTIONS"].includes(request.method)){const origin=request.headers.get("origin");if(origin&&new URL(origin).host!==new URL(request.url).host)return false;}return Boolean(await getAdminIdentityFromRequest(request));}

export function passwordProblem(password:string){if(password.length<10)return "Us\u00e1 al menos 10 caracteres.";if(!/[a-z]/i.test(password)||!/\d/.test(password))return "Combin\u00e1 letras y al menos un n\u00famero.";return null;}
export async function verifyCredentials(email:string,password:string,ip:string){await ensureDatabaseSchema();const normalized=normalizeEmail(email);const cutoff=new Date(Date.now()-15*60000).toISOString();await env.DB.prepare("DELETE FROM admin_login_attempts WHERE attempted_at<?").bind(cutoff).run();const attempts=await env.DB.prepare("SELECT COUNT(*) AS total FROM admin_login_attempts WHERE email=? AND ip=? AND attempted_at>=?").bind(normalized,ip,cutoff).first<{total:number}>();if(Number(attempts?.total??0)>=ATTEMPT_LIMIT)return{error:"Demasiados intentos. Esper? 15 minutos antes de volver a probar."};const admin=await adminByEmail(normalized);let valid=false;if(admin){valid=equal(await derive(password,decode(admin.passwordSalt),admin.passwordIterations),admin.passwordHash);}else{await derive(password||"invalid-password",crypto.getRandomValues(new Uint8Array(16)),ITERATIONS);}if(!admin||!valid){await env.DB.prepare("INSERT INTO admin_login_attempts(email,ip,attempted_at) VALUES(?,?,?)").bind(normalized,ip,new Date().toISOString()).run();return{error:"El email o la contrase?a no son correctos."};}await env.DB.prepare("DELETE FROM admin_login_attempts WHERE email=? AND ip=?").bind(normalized,ip).run();return{admin:{id:admin.id,email:admin.email,displayName:admin.displayName} as AdminIdentity};}

export async function createSession(userId:number){await ensureDatabaseSchema();const token=randomToken();const now=new Date();await env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at<=?").bind(now.toISOString()).run();await env.DB.prepare("INSERT INTO admin_sessions(user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?)").bind(userId,await digest(token),new Date(now.getTime()+SESSION_DAYS*86400000).toISOString(),now.toISOString()).run();return token;}
export function sessionCookie(token:string,secure:boolean){return SESSION_COOKIE+"="+encodeURIComponent(token)+"; Path=/; HttpOnly; SameSite=Lax; Max-Age="+SESSION_DAYS*86400+(secure?"; Secure":"");}
export function clearSessionCookie(secure:boolean){return SESSION_COOKIE+"=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"+(secure?"; Secure":"");}
export async function deleteSession(request:Request){const token=cookieValue(request.headers.get("cookie"),SESSION_COOKIE);if(token){await ensureDatabaseSchema();await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(await digest(token)).run();}}

export async function getRecoveryIdentity(){const external=await getChatGPTUser();if(!external)return null;await ensureDatabaseSchema();const current=await env.DB.prepare("SELECT email FROM admin_users ORDER BY id LIMIT 1").first<{email:string}>();const expected=normalizeEmail(current?.email??DEFAULT_ADMIN_EMAIL);return normalizeEmail(external.email)===expected?{email:expected,displayName:external.fullName??"Equipo Ideamos"}:null;}
export async function savePassword(email:string,password:string,displayName="Equipo Ideamos"){const problem=passwordProblem(password);if(problem)throw new Error(problem);await ensureDatabaseSchema();const salt=crypto.getRandomValues(new Uint8Array(16));const hash=await derive(password,salt,ITERATIONS);const normalized=normalizeEmail(email);const existing=await env.DB.prepare("SELECT id FROM admin_users ORDER BY id LIMIT 1").first<{id:number}>();const now=new Date().toISOString();if(existing){await env.DB.prepare("UPDATE admin_users SET email=?,password_hash=?,password_salt=?,password_iterations=?,display_name=?,updated_at=? WHERE id=?").bind(normalized,hash,encode(salt),ITERATIONS,displayName,now,existing.id).run();await env.DB.prepare("DELETE FROM admin_sessions WHERE user_id=?").bind(existing.id).run();return existing.id;}const result=await env.DB.prepare("INSERT INTO admin_users(email,password_hash,password_salt,password_iterations,display_name,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").bind(normalized,hash,encode(salt),ITERATIONS,displayName,now,now).run();return Number(result.meta.last_row_id);}
export async function changeAccount(admin:AdminIdentity,currentPassword:string,email:string,newPassword:string,displayName:string){const verified=await verifyCredentials(admin.email,currentPassword,"account-change");if(!verified.admin)throw new Error("La contrase\u00f1a actual no es correcta.");const nextEmail=normalizeEmail(email);if(!/^\S+@\S+\.\S+$/.test(nextEmail))throw new Error("Ingres\u00e1 un email v\u00e1lido.");const nextName=displayName.trim()||"Equipo Ideamos";if(newPassword){await savePassword(nextEmail,newPassword,nextName);}else{await env.DB.prepare("UPDATE admin_users SET email=?,display_name=?,updated_at=? WHERE id=?").bind(nextEmail,nextName,new Date().toISOString(),admin.id).run();}return{email:nextEmail,displayName:nextName};}

export async function hasAdminAccount(){await ensureDatabaseSchema();const row=await env.DB.prepare("SELECT id FROM admin_users LIMIT 1").first<{id:number}>();return Boolean(row);}
