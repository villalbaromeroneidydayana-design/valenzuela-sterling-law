async function runTests() {
  const baseUrl = 'http://127.0.0.1:3000';

  console.log("=== INICIANDO PRUEBAS DE ENDPOINTS DE CONVERSIÓN ===");

  // 1. Probar POST /api/leads (Formulario de Portada)
  try {
    const leadRes = await fetch(`${baseUrl}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Carlos Méndez Test",
        phone: "(305) 555-0199",
        email: "carlos.mendez@example.com",
        caseType: "asilo",
        preferredLanguage: "es",
        smsConsent: true
      })
    });
    const leadData = await leadRes.json();
    console.log("[1] POST /api/leads ->", leadRes.status, leadData);
  } catch (err) {
    console.error("[1] Error en leads:", err.message);
  }

  // 2. Probar POST /api/evaluations (Evaluador Adaptativo)
  try {
    const evalRes = await fetch(`${baseUrl}/api/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Elena Rostova Test",
        phone: "(786) 555-4321",
        email: "elena.rostova@example.com",
        preferredLanguage: "es",
        consultationType: "zoom",
        state: "Florida",
        notes: "Urgencia con fecha de corte de asilo",
        practiceAreaId: "asilo-politico",
        practiceAreaTitle: "Asilo Político y Refugio",
        answers: {
          time_in_us: "menos_1_ano",
          persecution_ground: "politica",
          case_forum: "si_corte"
        }
      })
    });
    const evalData = await evalRes.json();
    console.log("[2] POST /api/evaluations ->", evalRes.status, evalData);
  } catch (err) {
    console.error("[2] Error en evaluations:", err.message);
  }

  // 3. Probar POST /api/call-requests (Llamada Inmediata)
  try {
    const callRes = await fetch(`${baseUrl}/api/call-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Javier Morales Test",
        phone: "(407) 555-8822",
        caseType: "deportacion",
        callTime: "inmediato",
        notes: "Familiar detenido por ICE en Orlando"
      })
    });
    const callData = await callRes.json();
    console.log("[3] POST /api/call-requests ->", callRes.status, callData);
  } catch (err) {
    console.error("[3] Error en call-requests:", err.message);
  }

  // 4. Probar POST /api/telemetry (Eventos de telemetría)
  try {
    const telRes = await fetch(`${baseUrl}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: "whatsapp_click",
        eventData: { context: "practice_modal", serviceId: "residencia-green-card" }
      })
    });
    const telData = await telRes.json();
    console.log("[4] POST /api/telemetry ->", telRes.status, telData);
  } catch (err) {
    console.error("[4] Error en telemetry:", err.message);
  }

  // 5. Probar GET /api/conversion-stats (Métricas agregadas)
  try {
    const statsRes = await fetch(`${baseUrl}/api/conversion-stats`);
    const statsData = await statsRes.json();
    console.log("[5] GET /api/conversion-stats ->", statsRes.status, JSON.stringify(statsData, null, 2));
  } catch (err) {
    console.error("[5] Error en conversion-stats:", err.message);
  }

  console.log("=== PRUEBAS DE ENDPOINTS FINALIZADAS ===");
}

runTests();

