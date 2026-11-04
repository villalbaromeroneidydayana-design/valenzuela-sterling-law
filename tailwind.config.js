/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nueva Paleta Artística Premium
        ivory: {
          DEFAULT: '#FDFBF7', // Fondo principal marfil
          warm: '#F8F6F0',    // Marfil cálido secundario
          dark: '#EFECE6',    // Marfil frontera
        },
        linen: {
          DEFAULT: '#F4F1EA', // Lino suave para superficies
          dark: '#E8E3D8',    // Lino de borde
        },
        charcoal: {
          DEFAULT: '#1A1D20', // Carbón profundo tipografía
          muted: '#2B3035',   // Carbón secundario
          soft: '#4A5056',    // Texto de apoyo y subtítulos
          light: '#717882',   // Texto terciario
        },
        teal: {
          DEFAULT: '#0D3B36', // Verde petróleo institucional
          deep: '#092925',    // Verde petróleo profundo
          dark: '#133E38',    // Verde petróleo medio
          light: '#1B524A',   // Verde petróleo acento
          soft: '#E8F1EF',    // Verde petróleo fondo traslúcido
        },
        bronze: {
          DEFAULT: '#A67C52', // Bronce institucional
          light: '#B88656',   // Bronce claro
          dark: '#845F3C',    // Bronce oscuro
          soft: '#F5EFE8',    // Bronce fondo suave
        },
        // Compatibilidad semántica
        legal: {
          navy: '#0D3B36',     // Mapeado a verde petróleo institucional
          dark: '#FDFBF7',     // Mapeado a fondo marfil
          deep: '#133E38',     // Verde petróleo profundo
          blue: '#E8E3D8',     // Bordes lino
          gold: '#A67C52',     // Acentos bronce
          goldLight: '#B88656',
          goldDark: '#845F3C',
          slate: '#F4F1EA',    // Lino
          border: '#E8E3D8',
          textMuted: '#4A5056',
          textDark: '#1A1D20',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(26, 29, 32, 0.05)',
        'premium': '0 12px 36px -4px rgba(13, 59, 54, 0.08)',
        'elevated': '0 20px 48px -8px rgba(13, 59, 54, 0.12)',
        'bronze': '0 8px 24px -4px rgba(166, 124, 82, 0.25)',
      }
    },
  },
  plugins: [],
}
