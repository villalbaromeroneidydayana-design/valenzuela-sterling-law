/**
 * VALENZUELA & STERLING | TELEMETRY & CONVERSION ANALYTICS
 * 
 * Capa de medición y analítica comercial de conversiones.
 * Rastrea interacciones del embudo comercial respetando la privacidad (sin PII sensible).
 * Integra con backend (/api/telemetry) y dataLayer (Google Analytics 4 / Google Tag Manager).
 */

class AnalyticsService {
  constructor() {
    this.sessionStartTime = Date.now();
    this.eventsBuffer = [];
  }

  track(eventName, eventData = {}) {
    const timestamp = new Date().toISOString();
    const eventPayload = {
      event: eventName,
      ...eventData,
      path: window.location.pathname + window.location.hash,
      timestamp
    };

    // 1. DataLayer para Google Tag Manager / GA4
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(eventPayload);
    }

    // 2. Registro local para auditoría en frontend
    this.eventsBuffer.unshift(eventPayload);
    if (this.eventsBuffer.length > 50) this.eventsBuffer.pop();

    // 3. Envío asíncrono al backend para métricas del bufete
    if (typeof fetch !== 'undefined') {
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, eventData })
      }).catch(() => {
        // Silencioso para no interrumpir la experiencia del usuario
      });
    }

    console.log(`[ANALYTICS] Evento registrado: ${eventName}`, eventData);
  }

  // Métodos de conveniencia para eventos clave
  trackServiceView(serviceId, category) {
    this.track('service_viewed', { serviceId, category });
  }

  trackEvaluatorStart(serviceId) {
    this.track('evaluator_started', { serviceId });
  }

  trackEvaluatorStep(serviceId, stepNumber, totalSteps) {
    this.track('evaluator_step_progress', { serviceId, stepNumber, totalSteps });
  }

  trackEvaluatorAbandon(serviceId, lastStep) {
    this.track('evaluator_abandoned', { serviceId, lastStep });
  }

  trackEvaluatorCompleted(serviceId) {
    this.track('evaluator_completed', { serviceId });
  }

  trackWhatsAppClick(context, serviceId = 'general') {
    this.track('whatsapp_click', { context, serviceId });
  }

  trackPhoneClick(location = 'header') {
    this.track('phone_click', { location });
  }

  trackCallRequest(caseType) {
    this.track('call_request_submitted', { caseType });
  }

  trackFormSubmission(formType, caseType) {
    this.track('form_submitted', { formType, caseType });
  }
}

export const analytics = new AnalyticsService();

