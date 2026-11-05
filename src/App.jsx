import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustBadges from './components/TrustBadges';
import AboutFirm from './components/AboutFirm';
import VideoShowcase from './components/VideoShowcase';
import PracticeAreas from './components/PracticeAreas';
import ProcessWorkflow from './components/ProcessWorkflow';
import EligibilityEvaluator from './components/EligibilityEvaluator';
import AttorneyTeam from './components/AttorneyTeam';
import SuccessStories from './components/SuccessStories';
import Testimonials from './components/Testimonials';
import OfficeLocations from './components/OfficeLocations';
import FaqSection from './components/FaqSection';
import BlogPreview from './components/BlogPreview';
import Footer from './components/Footer';
import VirtualAssistant from './components/VirtualAssistant';
import QuickContactFloating from './components/QuickContactFloating';
import VideoReelModal from './components/VideoReelModal';
import CallRequestModal from './components/CallRequestModal';
import ConversionTelemetryModal from './components/ConversionTelemetryModal';
import BlogArticleModal from './components/BlogArticleModal';
import LaborLaw, { ServiceAreaSwitch } from './components/LaborLaw';
import ImmigrationBonds from './components/ImmigrationBonds';
import ClientPortalModal from './components/ClientPortalModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import VisualRedesignPreview from './components/VisualRedesignPreview';

export default function App() {
  const [lang, setLang] = useState('es');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEvaluatorModalOpen, setIsEvaluatorModalOpen] = useState(false);
  const [evaluatorPracticeId, setEvaluatorPracticeId] = useState('residencia-green-card');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callCaseType, setCallCaseType] = useState('general');
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedBlogArticle, setSelectedBlogArticle] = useState(null);

  const handleOpenEvaluator = (practiceId = 'residencia-green-card') => {
    if (typeof practiceId === 'string') {
      setEvaluatorPracticeId(practiceId);
    }
    setIsEvaluatorModalOpen(true);
  };

  const handleCloseEvaluator = () => {
    setIsEvaluatorModalOpen(false);
  };

  const handleSelectPractice = (practiceId) => {
    setEvaluatorPracticeId(practiceId);
    setIsEvaluatorModalOpen(true);
  };

  const handleOpenCallRequest = (caseType = 'general') => {
    setCallCaseType(caseType);
    setIsCallModalOpen(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      if (params.get('portal') === 'true' || params.get('expediente') === 'true' || hash === '#portal' || hash === '#expediente') {
        setIsPortalModalOpen(true);
      }
      if (params.get('admin') === 'true' || params.get('backoffice') === 'true' || hash === '#admin' || hash === '#backoffice') {
        setIsAdminModalOpen(true);
      }
    }
  }, []);

  const isPreviewMode = typeof window !== 'undefined' && window.location.search.includes('preview=redesign');
  if (isPreviewMode) {
    return <VisualRedesignPreview lang={lang} />;
  }

  return (
    <div className="min-h-screen bg-[#081426] text-white flex flex-col font-sans selection:bg-blue-900 selection:text-amber-300 relative">

      {/* 1. Encabezado Institucional & Navegación Bilingüe */}
      <Header
        lang={lang}
        setLang={setLang}
        onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
        onOpenCallRequest={() => handleOpenCallRequest('general')}
        onSelectPractice={handleSelectPractice}
        onOpenPortal={() => setIsPortalModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* CONTENIDO PRINCIPAL: 6 BLOQUES MAESTROS INTEGRADOS */}
      <main className="flex-1">

        {/* BLOQUE 1: Bienvenida & Acción Inmediata (Hero con Formulario + Sellos de Prestigio) */}
        <Hero
          lang={lang}
          onOpenVideo={() => setIsVideoModalOpen(true)}
          onOpenEvaluator={() => handleOpenEvaluator('asilo-politico')}
        />
        <TrustBadges lang={lang} />

        {/* BLOQUE 2: Áreas de práctica — Inmigración (12 áreas) y Derecho Laboral */}
        <ServiceAreaSwitch lang={lang} />
        <PracticeAreas
          lang={lang}
          onSelectPractice={handleSelectPractice}
          onOpenCallRequest={handleOpenCallRequest}
        />

        {/* BLOQUE 3: Evaluador de Elegibilidad Centralizado (Diagnóstico Interactivo) */}
        <div id="evaluador">
          <EligibilityEvaluator
            lang={lang}
            isOpen={false}
            initialPracticeId={evaluatorPracticeId}
          />
        </div>

        {/* BLOQUE 3-B: Derecho Laboral (6 áreas, calculadora y solicitud de orientación) */}
        <LaborLaw
          lang={lang}
          onRequestGuidance={handleOpenCallRequest}
        />

        {/* BLOQUE 3-C: Fianzas Migratorias & Recuperación de Fondos I-352 / I-391 */}
        <ImmigrationBonds
          lang={lang}
          onOpenCallRequest={handleOpenCallRequest}
          onOpenEvaluator={handleOpenEvaluator}
        />

        {/* BLOQUE 4: Autoridad Legal, Abogados & Metodología de Representación */}
        <AttorneyTeam
          lang={lang}
          onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
        />
        <AboutFirm
          lang={lang}
          onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
        />
        <ProcessWorkflow
          lang={lang}
          onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
        />
        <VideoShowcase
          lang={lang}
          onOpenVideoModal={() => setIsVideoModalOpen(true)}
        />

        {/* BLOQUE 5: Respaldo Comunitario (Casos de Éxito, Testimonios y Acordeón FAQs) */}
        <div id="testimonios">
          <SuccessStories
            lang={lang}
            onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
          />
          <Testimonials lang={lang} />
        </div>
        <FaqSection lang={lang} />

        {/* BLOQUE 6: Recursos Jurídicos & Sedes Corporativas */}
        <BlogPreview
          lang={lang}
          onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
          onOpenArticle={(post) => setSelectedBlogArticle(post)}
        />
        <div id="contacto">
          <OfficeLocations
            lang={lang}
            onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
          />
        </div>

      </main>

      {/* 15. Pie de Página Corporativo con Avisos Éticos y Enlace a Métricas */}
      <Footer
        lang={lang}
        onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
        onOpenCallRequest={() => handleOpenCallRequest('general')}
        onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
        onOpenPortal={() => setIsPortalModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* 16. Asistente Virtual Inteligente ("Sofía") */}
      <VirtualAssistant
        lang={lang}
        onOpenEvaluator={handleOpenEvaluator}
        onOpenCallRequest={() => handleOpenCallRequest('general')}
      />

      {/* 17. Barra de Contacto Permanente para Móviles */}
      <QuickContactFloating
        lang={lang}
        onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
      />

      {/* 18. Modal de Video Institucional en Pantalla Completa */}
      <VideoReelModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        lang={lang}
        onOpenEvaluator={() => handleOpenEvaluator('residencia-green-card')}
      />

      {/* 19. Modal Emergente del Evaluador (cuando se invoca desde botones CTA o Especialidades) */}
      {isEvaluatorModalOpen && (
        <EligibilityEvaluator
          lang={lang}
          isOpen={true}
          onClose={handleCloseEvaluator}
          initialPracticeId={evaluatorPracticeId}
        />
      )}

      {/* 20. Modal de Solicitud de Llamada Inmediata */}
      <CallRequestModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        lang={lang}
        initialCaseType={callCaseType}
      />

      {/* 21. Modal de Telemetría y Métricas en Tiempo Real */}
      <ConversionTelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        lang={lang}
      />

      {/* 22. Modal de Lectura Completa de Artículos del Blog (Etapa 4.3-B) */}
      {selectedBlogArticle && (
        <BlogArticleModal
          article={selectedBlogArticle}
          lang={lang}
          onClose={() => setSelectedBlogArticle(null)}
          onOpenEvaluator={handleOpenEvaluator}
        />
      )}

      {/* 23. Modal de Consulta y Seguimiento de Expedientes (Portal de Clientes) */}
      <ClientPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        lang={lang}
      />

      {/* 24. Modal de Administración Interna y Control de Expedientes (Backoffice de la Firma) */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        lang={lang}
      />

    </div>
  );
}
