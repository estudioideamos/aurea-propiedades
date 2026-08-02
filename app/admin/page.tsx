import Link from "next/link";
import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "../chatgpt-auth";
import { properties } from "../properties";
import { Brand } from "../site-chrome";
import { PropertyAdmin } from "./property-admin";
import "./property-admin.css";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "r.lavega@ideamos.com.ar";

export default async function AdminPage() {
  if (process.env.GITHUB_PAGES === "true") return <main className="admin-login"><div><Brand/><p className="section-label">Panel privado</p><h1>Administración disponible en la versión privada.</h1><p>GitHub Pages publica la experiencia comercial. La gestión segura permanece en el entorno administrable.</p><Link href="/">Volver al sitio</Link></div></main>;
  const user = await getChatGPTUser();
  if (!user) return <main className="admin-login"><div><Brand/><p className="section-label">Panel privado</p><h1>Administrá tu inmobiliaria.</h1><p>Acceso exclusivo para el equipo autorizado. Publicá, editá y ordená toda la cartera desde una experiencia simple.</p><a href={chatGPTSignInPath("/admin")}>Ingresar al panel &rarr;</a><br/><Link href="/">Volver al sitio</Link></div></main>;
  if (user.email.toLowerCase() !== ADMIN_EMAIL) return <main className="admin-login"><div><Brand/><p className="section-label">Acceso restringido</p><h1>Este usuario no tiene permisos de administración.</h1><p>La gestión está reservada a la cuenta administradora autorizada.</p><a href={chatGPTSignOutPath("/")}>Cerrar sesión</a><br/><Link href="/">Volver al sitio</Link></div></main>;
  return <PropertyAdmin initialProperties={properties} userName={user.fullName ?? "Equipo Ideamos"} signOutPath={chatGPTSignOutPath("/")}/>;
}