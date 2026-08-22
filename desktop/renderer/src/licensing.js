export const PLAN = {
  FREE:'free',
  PRO:'pro'
};

export const FREE_FEATURES = new Set([
  'open_pdf','view_pdf','annotate_basic','merge','split','rotate','reorder','compress_basic',
  'create_document','edit_document','save_docx','save_odt','save_rtf','save_txt','export_pdf_basic',
  'templates_basic','local_library','find_replace'
]);

export const PRO_FEATURES = new Set([
  'ocr_pdf','ocr_search','redact','encrypt','decrypt','fill_sign','digital_signature','batch_tools',
  'advanced_export','premium_templates','version_history','document_translation','secure_package',
  'custom_themes','advanced_pdf_edit','metadata_tools','forms'
]);

export function featurePlan(feature){
  if(PRO_FEATURES.has(feature))return PLAN.PRO;
  return PLAN.FREE;
}

export function isFeatureAvailable(feature, license){
  if(featurePlan(feature)===PLAN.FREE)return true;
  return license?.plan===PLAN.PRO && license?.valid!==false;
}

export function defaultLicense(){
  return {plan:PLAN.FREE,source:'local',valid:true,owner:null,expiresAt:null};
}

/*
  RUSH intentionally does not place a reusable private activation secret in the renderer.
  Direct-sale licenses are signed outside the app; the desktop shell verifies the signature
  with a public key before exposing Pro. Store builds can replace this adapter with platform
  entitlement checks. The free editor continues to work offline.
*/
