import React, { useState } from "react";
import { useModalFocus } from "./useModalFocus";
interface Props { isOpen: boolean; onClose: () => void; showToast: (message: string, type: "success" | "error" | "info" | "warning") => void; }
export const PlayStoreModal = ({ isOpen, onClose, showToast }: Props) => {
  const [step, setStep] = useState(0);
  const ref = useModalFocus(isOpen, onClose);
  if (!isOpen) return null;
  const steps = [
    ["Ficha de la aplicación", "Truec-app: registro de usuarios, catálogo, propuestas y subastas de demostración. Categoría: Compras. Idioma: español. Las capturas y el APK se incluyen en la entrega."],
    ["Datos y privacidad", "Android guarda los datos en Room dentro del dispositivo. La web de demostración usa un servidor local. No hay cobros, publicidad ni publicación real. Antes de distribuir se debe definir la política pública de privacidad y completar Seguridad de los datos."],
    ["Pruebas y artefacto", "La entrega contiene un APK debug instalable, firmado con la clave de desarrollo, y su SHA-256. No es un AAB de producción. Una publicación real requiere generar y firmar el AAB, configurar Play App Signing y revisar los requisitos de la consola."],
    ["Revisión de publicación", "Simulamos una solicitud para una pista de pruebas. Revisa ficha, capturas, clasificación de contenido, acceso de revisión y privacidad. No se envía ningún archivo a Google Play."],
    ["Solicitud simulada completada", "El recorrido de publicación ha terminado. No se publicó ni se instaló una aplicación mediante esta pantalla."]
  ];
  return <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="playstore-title" className="fixed inset-0 z-50 bg-slate-900/80 p-4 flex items-center justify-center">
    <section className="bg-white rounded-2xl max-w-xl w-full max-h-[90dvh] overflow-auto p-6 text-slate-900">
      <div className="flex justify-between gap-4"><h2 id="playstore-title" className="text-xl font-bold">Simulación de publicación en Google Play</h2><button onClick={onClose} aria-label="Cerrar simulación">Cerrar</button></div>
      <p className="my-4 font-semibold text-teal-800">Ejercicio académico · paso {step + 1} de {steps.length}</p>
      <div aria-live="polite"><h3 className="text-lg font-bold">{steps[step][0]}</h3><p className="my-4 leading-relaxed">{steps[step][1]}</p></div>
      <div className="flex justify-between gap-3 mt-6"><button disabled={step === 0} onClick={() => setStep(step - 1)} className="p-3 rounded border">Anterior</button><button className="p-3 rounded bg-teal-700 text-white" onClick={() => { if (step < 4) { setStep(step + 1); if (step === 3) showToast("Simulación terminada. No se envió a Google Play.", "success"); } else { setStep(0); onClose(); } }}>{step === 3 ? "Simular envío a revisión" : step === 4 ? "Finalizar" : "Continuar"}</button></div>
    </section>
  </div>;
};
