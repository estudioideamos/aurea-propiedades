"use client";

import { CheckCircle2, CloudCog, DatabaseZap, EyeOff, KeyRound, Link2, LoaderCircle, RefreshCw, Save, ShieldCheck, Unplug } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type Integration = {
  enabled: boolean;
  apiKeyConfigured: boolean;
  apiKeyHint: string;
  companyId: number | null;
  branchId: number | null;
  lastSyncAt: string | null;
  lastSyncStatus: string;
  lastSyncCount: number;
  lastSyncError: string;
};
type TestResult = { total: number; companyId: number | null; companyName: string; branchId: number | null; branchName: string };
const initial: Integration = { enabled: false, apiKeyConfigured: false, apiKeyHint: "", companyId: null, branchId: null, lastSyncAt: null, lastSyncStatus: "never", lastSyncCount: 0, lastSyncError: "" };

function dateLabel(value: string | null) {
  if (!value) return "Todavia no se sincronizo";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function TokkoIntegrationManager() {
  const [integration, setIntegration] = useState(initial);
  const [apiKey, setApiKey] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [working, setWorking] = useState<"load" | "save" | "test" | "sync" | "">("load");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/tokko", { cache: "no-store", credentials: "same-origin" });
        const data = await response.json() as { integration?: Integration; error?: string };
        if (!response.ok || !data.integration) throw new Error(data.error || "No se pudo cargar Tokko.");
        setIntegration(data.integration);
        setCompanyId(data.integration.companyId ? String(data.integration.companyId) : "");
        setBranchId(data.integration.branchId ? String(data.integration.branchId) : "");
      } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo cargar Tokko."); }
      finally { setWorking(""); }
    })();
  }, []);

  const payload = { enabled: integration.enabled, apiKey: apiKey.trim() || undefined, companyId: companyId || null, branchId: branchId || null };

  async function testConnection() {
    setWorking("test"); setNotice(""); setTestResult(null);
    try {
      const response = await fetch("/api/admin/tokko", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, action: "test" }) });
      const data = await response.json() as { result?: TestResult; error?: string };
      if (!response.ok || !data.result) throw new Error(data.error || "No se pudo probar la conexion.");
      setTestResult(data.result);
      if (!companyId && data.result.companyId) setCompanyId(String(data.result.companyId));
      if (!branchId && data.result.branchId) setBranchId(String(data.result.branchId));
      setNotice(data.result.total ? "Conexion correcta. Tokko encontro " + data.result.total + " propiedades publicables." : "Conexion correcta. La cuenta no tiene propiedades habilitadas para web.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo probar la conexion."); }
    finally { setWorking(""); }
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setWorking("save"); setNotice("");
    try {
      const response = await fetch("/api/admin/tokko", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { integration?: Integration; error?: string };
      if (!response.ok || !data.integration) throw new Error(data.error || "No se pudo guardar Tokko.");
      setIntegration(data.integration); setApiKey("");
      setNotice(data.integration.enabled ? "Tokko quedo activo. Ya podes sincronizar el catalogo." : "Tokko quedo desactivado. La carga manual sigue funcionando normalmente.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo guardar Tokko."); }
    finally { setWorking(""); }
  }

  async function syncNow() {
    setWorking("sync"); setNotice("");
    try {
      const response = await fetch("/api/admin/tokko", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "sync" }) });
      const data = await response.json() as { result?: { imported: number; removed: number; totalProcessed: number }; integration?: Integration; error?: string };
      if (!response.ok || !data.result || !data.integration) throw new Error(data.error || "No se pudo sincronizar.");
      setIntegration(data.integration);
      setNotice("Sincronizacion completa: " + data.result.imported + " actualizadas y " + data.result.removed + " retiradas.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo sincronizar."); }
    finally { setWorking(""); }
  }

  const disabled = Boolean(working);
  return <section className="tokko-integration">
    <header className="tokko-heading">
      <div className="tokko-heading-icon"><CloudCog/></div>
      <div><p>INTEGRACIONES</p><h2>Tokko Broker</h2><span>Conecta el inventario de Tokko sin perder la carga manual del panel.</span></div>
      <button type="button" className={integration.enabled ? "tokko-toggle active" : "tokko-toggle"} onClick={() => setIntegration(current => ({ ...current, enabled: !current.enabled }))} aria-pressed={integration.enabled}>
        <i/><b>{integration.enabled ? "Activo" : "Inactivo"}</b>
      </button>
    </header>

    <div className="tokko-mode-note"><DatabaseZap/><div><b>Dos formas de publicar, un solo catalogo</b><span>Las propiedades manuales siguen editables. Tokko solo agrega y actualiza los registros que vienen de esa cuenta.</span></div></div>

    <form onSubmit={save} className="tokko-form">
      <label className="tokko-key-field"><span>API KEY DE TOKKO</span><div><KeyRound/><input type="password" value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder={integration.apiKeyConfigured ? "Guardada y protegida - termina en " + integration.apiKeyHint : "Pega la API key"} autoComplete="new-password"/><EyeOff/></div><small>Se cifra antes de guardarse y nunca vuelve a mostrarse completa.</small></label>
      <div className="tokko-id-grid">
        <label><span>ID DE EMPRESA</span><div><Link2/><input inputMode="numeric" value={companyId} onChange={event => setCompanyId(event.target.value.replace(/\D/g, ""))} placeholder="Ej. 1234"/></div></label>
        <label><span>ID DE SUCURSAL <i>OPCIONAL</i></span><div><Link2/><input inputMode="numeric" value={branchId} onChange={event => setBranchId(event.target.value.replace(/\D/g, ""))} placeholder="Todas"/></div></label>
      </div>
      {testResult && <div className="tokko-detected"><CheckCircle2/><div><b>{testResult.companyName || "Empresa identificada"}</b><span>Empresa {testResult.companyId ?? "-"}{testResult.branchName ? " / " + testResult.branchName : ""}{testResult.branchId ? " (" + testResult.branchId + ")" : ""}</span></div></div>}
      {notice && <p className={integration.lastSyncStatus === "error" ? "tokko-notice error" : "tokko-notice"}>{notice}</p>}
      <div className="tokko-actions">
        <button type="button" onClick={() => void testConnection()} disabled={disabled || (!apiKey.trim() && !integration.apiKeyConfigured)}>{working === "test" ? <LoaderCircle className="spin"/> : <ShieldCheck/>} Probar conexion</button>
        <button type="submit" className="primary" disabled={disabled}>{working === "save" ? <LoaderCircle className="spin"/> : <Save/>} Guardar configuracion</button>
      </div>
    </form>

    <footer className="tokko-sync-panel">
      <div className={integration.enabled ? "tokko-sync-state active" : "tokko-sync-state"}>{integration.enabled ? <RefreshCw/> : <Unplug/>}<div><b>{integration.enabled ? "Sincronizacion disponible" : "Modo manual"}</b><span>{dateLabel(integration.lastSyncAt)}{integration.lastSyncStatus === "success" ? " / " + integration.lastSyncCount + " registros procesados" : ""}</span>{integration.lastSyncError && <small>{integration.lastSyncError}</small>}</div></div>
      <button type="button" onClick={() => void syncNow()} disabled={disabled || !integration.enabled || !integration.apiKeyConfigured}>{working === "sync" ? <LoaderCircle className="spin"/> : <RefreshCw/>} Sincronizar ahora</button>
    </footer>
  </section>;
}
