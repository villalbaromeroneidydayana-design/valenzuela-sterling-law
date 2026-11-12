import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, 
  Building2, ShieldCheck, Sparkles, Video
} from 'lucide-react';
import { FIRM_CONFIG } from '../data/demoData';

export default function VideoShowcase({ lang = 'es' }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Fuente oficial del video institucional
  const videoSrcEncoded = '/VALENZUELA%20&%20STERLING%20IMMIGRATION%20LAW%20GROUP,%20P.A..mp4';
  const videoSrcRaw = '/VALENZUELA & STERLING IMMIGRATION LAW GROUP, P.A..mp4';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      if (video) setIsMuted(video.muted);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    // Iniciar reproducción cuando el usuario se acerque a la sección para no saturar la red móvil inicial
    let observer;
    if ('IntersectionObserver' in window && containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const p = video.play();
              if (p !== undefined) {
                p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
              }
            }
          });
        },
        { rootMargin: '400px 0px' }
      );
      observer.observe(containerRef.current);
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }

    return () => {
      if (observer) observer.disconnect();
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <section id="video-showcase" className="py-20 bg-[#07152B] text-white relative overflow-hidden border-b border-blue-900/60 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Encabezado Principal de la Sección */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1E3D] border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Recorrido Virtual Oficial' : 'Official Virtual Tour'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {lang === 'es' ? (
              <>
                Recorrido Virtual por Nuestras <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Instalaciones Corporativas</span>
              </>
            ) : (
              <>
                Virtual Tour of Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 italic">Corporate Facilities</span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            {lang === 'es' 
              ? 'Conozca los espacios e infraestructura de Valenzuela & Sterling Immigration Law Group, P.A. Instalaciones de primer nivel diseñadas para garantizar confidencialidad jurídica, preparación para audiencias de litigio federal y atención integral para su familia.'
              : 'Explore the corporate infrastructure of Valenzuela & Sterling Immigration Law Group, P.A. Premier facilities built for attorney-client confidentiality, federal hearing preparation, and dignified service for your family.'
            }
          </p>
        </div>

        {/* CONTENEDOR PRINCIPAL DEL VIDEO INSTITUCIONAL */}
        <div 
          ref={containerRef}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(true)}
          className="relative max-w-5xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border border-blue-800/80 shadow-2xl bg-[#050D1A] group"
        >
          {/* Contenedor con Proporción 16:9 Nativa */}
          <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/showcase/boardroom.webp"
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
            >
              <source src={videoSrcEncoded} type="video/mp4" />
              <source src={videoSrcRaw} type="video/mp4" />
              Tu navegador no soporta la reproducción de video HTML5.
            </video>

            {/* Gradiente superior e inferior para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050D1A]/90 via-transparent to-[#050D1A]/60 pointer-events-none" />

            {/* Badge Superior Izquierdo: Identificación de la Firma */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center space-x-2 pointer-events-none">
              <span className="px-3 py-1.5 rounded-lg bg-[#081426]/90 backdrop-blur-md text-amber-300 text-[11px] sm:text-xs font-semibold tracking-wider uppercase border border-amber-400/30 shadow-lg flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Valenzuela & Sterling • Video Oficial</span>
              </span>
            </div>

            {/* Badge Superior Derecho: Calidad Original 1080p */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 pointer-events-none">
              <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-white font-mono text-[10px] sm:text-xs font-bold border border-white/20">
                Full HD 1080p
              </span>
            </div>

            {/* Botón flotante central de Reproducir/Pausar (visible si está pausado) */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <button
                  onClick={togglePlay}
                  className="pointer-events-auto flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-amber-300/80 cursor-pointer"
                  aria-label="Reanudar video"
                >
                  <Play className="w-8 h-8 fill-slate-950 ml-1 text-slate-950" />
                </button>
              </div>
            )}

            {/* BARRA DE CONTROLES INFERIOR FLOTANTE */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-t from-[#050D1A] via-[#050D1A]/80 to-transparent">
              <div className="text-left space-y-0.5">
                <h3 className="font-serif text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Sede Corporativa & Salas de Litigio Federal</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 font-light">
                  {lang === 'es'
                    ? 'Reproducción automática en bucle • Toque el video o use los controles'
                    : 'Automatic looping playback • Click video or use controls'
                  }
                </p>
              </div>

              {/* Botones de Control Interactivo */}
              <div className="flex items-center space-x-2 bg-[#0B1E3D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-800 shadow-lg">
                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg text-slate-200 hover:text-amber-400 hover:bg-[#16386E] transition-colors cursor-pointer"
                  title={isPlaying ? 'Pausar video' : 'Reproducir video'}
                  aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                {/* Mute / Unmute */}
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg text-slate-200 hover:text-amber-400 hover:bg-[#16386E] transition-colors cursor-pointer flex items-center space-x-1"
                  title={isMuted ? 'Activar sonido' : 'Silenciar video'}
                  aria-label={isMuted ? 'Activar sonido' : 'Silenciar video'}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-semibold text-amber-400 hidden sm:inline">Sin sonido</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-semibold text-emerald-400 hidden sm:inline">Audio</span>
                    </>
                  )}
                </button>

                {/* Pantalla Completa */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg text-slate-200 hover:text-amber-400 hover:bg-[#16386E] transition-colors cursor-pointer"
                  title="Pantalla completa"
                  aria-label="Pantalla completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Tarjetas de Pilares de Infraestructura */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto pt-2">
          <div className="p-4 bg-[#081426] rounded-xl border border-blue-900/60 text-left space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Salas de Juntas & Cortes</span>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Equipamiento tecnológico para audiencias virtuales ante cortes de inmigración (EOIR) y entrevistas consulares.
            </p>
          </div>

          <div className="p-4 bg-[#081426] rounded-xl border border-blue-900/60 text-left space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Secreto Profesional</span>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Instalaciones privadas diseñadas para salvaguardar el Privilegio Abogado-Cliente y la confidencialidad de su caso.
            </p>
          </div>

          <div className="p-4 bg-[#081426] rounded-xl border border-blue-900/60 text-left space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Alcance Nacional</span>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Sedes en distritos financieros clave con facultad jurídica federal para litigar en los 50 estados de la Unión.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
