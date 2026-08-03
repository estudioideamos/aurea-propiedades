import { getAdminIdentity, getRecoveryIdentity, hasAdminAccount } from "../admin-auth";
import { properties } from "../properties";
import { PropertyAdmin } from "./property-admin";
import { AdminLogin, PasswordReset } from "./admin-login";
import "./property-admin.css";
export const dynamic="force-dynamic";
export default async function AdminPage(){if(process.env.GITHUB_PAGES==="true")return <AdminLogin/>;const admin=await getAdminIdentity();if(admin)return <PropertyAdmin initialProperties={properties} userName={admin.displayName} signOutPath="/admin/salir"/>;const accountExists=await hasAdminAccount();const recovery=await getRecoveryIdentity();if(!accountExists&&recovery)return <PasswordReset email={recovery.email} initial/>;return <AdminLogin/>;}
