import { clearSessionCookie, deleteSession } from "../../admin-auth";
export async function GET(request:Request){await deleteSession(request);return new Response(null,{status:303,headers:{Location:new URL("/admin",request.url).toString(),"Set-Cookie":clearSessionCookie(new URL(request.url).protocol==="https:")}});}
