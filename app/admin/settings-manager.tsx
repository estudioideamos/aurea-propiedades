"use client";

import { Check, Globe2, Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AccountManager } from "./account-manager";
import { TokkoIntegrationManager } from "./tokko-integration-manager";

type Settings = { agencyName:string; contactName:string; contactEmail:string; contactRecipients:string; valuationRecipients:string; phone:string; address:string; schedule:string; updatedAt?:string };
const initial: Settings = { agencyName:"Ideamos Propiedades", contactName:"Equipo Ideamos", contactEmail:"hola@ideamos.com.ar", contactRecipients:"hola@ideamos.com.ar", valuationRecipients:"hola@ideamos.com.ar", phone:"+54 11 5555 0190", address:"Av. del Libertador 2424, Buenos Aires", schedule:"Lun. a vie. / 9 a 18 h" };

export function SettingsManager({ signOutPath }:{ signOutPath:string }) {
  const [draft,setDraft] = useState(initial);
  const [saving,setSaving] = useState(false);
  const [notice,setNotice] = useState("");
  useEffect(() => { void (async () => { try { const response=await fetch("/api/admin/settings",{cache:"no-store"}); const data=await response.json() as {settings?:Settings}; if(response.ok&&data.settings)setDraft(data.settings); } catch { setNotice("No se pudieron cargar los ajustes guardados."); } })(); },[]);
  const update=(key:keyof Settings,value:string)=>setDraft(current=>({...current,[key]:value}));
  async function submit(event:FormEvent){event.preventDefault();setSaving(true);setNotice("");try{const response=await fetch("/api/admin/settings",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(draft)});const data=await response.json() as {settings?:Settings;error?:string};if(!response.ok||!data.settings)throw new Error(data.error||"No se pudieron guardar.");setDraft(data.settings);setNotice("Ajustes guardados correctamente.");}catch(error){setNotice(error instanceof Error?error.message:"No se pudieron guardar.");}finally{setSaving(false);}}
  return <div className="admin-settings-stack">
    <section className="admin-content-card admin-settings-card settings-manager">
      <div className="admin-list-head"><div><p>CONFIGURACION GENERAL</p><h2>Identidad y contacto</h2><span>Actualiza los datos publicos y decide a que correos llega cada consulta.</span></div><ShieldCheck/></div>
      {notice&&<p className="admin-inline-notice">{notice}</p>}
      <div className="settings-layout"><form onSubmit={submit}><div className="settings-form-grid">
        <label><span>NOMBRE DE LA INMOBILIARIA</span><div><Globe2/><input value={draft.agencyName} onChange={event=>update("agencyName",event.target.value)}/></div></label>
        <label><span>PERSONA / EQUIPO DE CONTACTO</span><div><UserRound/><input value={draft.contactName} onChange={event=>update("contactName",event.target.value)}/></div></label>
        <label><span>CORREO PUBLICO</span><div><Mail/><input type="email" value={draft.contactEmail} onChange={event=>update("contactEmail",event.target.value)}/></div></label>
        <label className="wide"><span>CONSULTAS GENERALES - DESTINATARIOS</span><div><Mail/><input type="text" value={draft.contactRecipients} onChange={event=>update("contactRecipients",event.target.value)} placeholder="ventas@inmobiliaria.com, direccion@inmobiliaria.com"/></div><small>Separalos con coma. Hasta 5 correos internos; no se muestran en la web.</small></label>
        <label className="wide"><span>TASACIONES - DESTINATARIOS</span><div><Mail/><input type="text" value={draft.valuationRecipients} onChange={event=>update("valuationRecipients",event.target.value)} placeholder="tasaciones@inmobiliaria.com"/></div><small>Pueden ser distintos de los destinatarios de consultas generales.</small></label>
        <label><span>TELEFONO</span><div><Phone/><input value={draft.phone} onChange={event=>update("phone",event.target.value)}/></div></label>
        <label className="wide"><span>DIRECCION</span><div><MapPin/><input value={draft.address} onChange={event=>update("address",event.target.value)}/></div></label>
        <label className="wide"><span>HORARIOS DE ATENCION</span><div><Check/><input value={draft.schedule} onChange={event=>update("schedule",event.target.value)}/></div></label>
      </div><button className="settings-save" disabled={saving}><Save/>{saving?"Guardando...":"Guardar informacion"}</button></form><AccountManager signOutPath={signOutPath}/></div>
    </section>
    <TokkoIntegrationManager/>
  </div>;
}
