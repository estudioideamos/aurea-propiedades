import { getRecoveryIdentity } from "../../admin-auth";
import { chatGPTSignInPath } from "../../chatgpt-auth";
import { PasswordReset, RecoveryVerification } from "../admin-login";
import "../property-admin.css";
export const dynamic="force-dynamic";
export default async function RecoveryPage(){const identity=await getRecoveryIdentity();if(identity)return <PasswordReset email={identity.email}/>;return <RecoveryVerification verificationPath={chatGPTSignInPath("/admin/recuperar")}/>;}
