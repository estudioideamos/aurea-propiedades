import { env } from "cloudflare:workers";
import { ensureDatabaseSchema } from "../../../db/ensure-schema";
export async function GET(){try{await ensureDatabaseSchema();const settings=await env.DB.prepare(`SELECT agency_name AS agencyName,contact_name AS contactName,contact_email AS contactEmail,phone,address,schedule,updated_at AS updatedAt FROM site_settings WHERE id=1`).first();return Response.json({settings});}catch(error){return Response.json({error:error instanceof Error?error.message:"No se pudieron cargar los datos."},{status:500});}}
