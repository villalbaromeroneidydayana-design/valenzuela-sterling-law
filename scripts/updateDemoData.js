import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demoDataPath = path.resolve(__dirname, '../src/data/demoData.js');
let fileContent = fs.readFileSync(demoDataPath, 'utf8');

const updatedPracticeAreasCode = `export const PRACTICE_AREAS = [
  {
    id: "residencia-green-card",
    category: "familia",
    titleEs: "Residencia Permanente (Green Card)",
    titleEn: "Permanent Residency (Green Card)",
    taglineEs: "Ajuste de estatus y procesamiento consular seguro",
    taglineEn: "Adjustment of status and reliable consular processing",
    descriptionEs: "Guiamos cada etapa del proceso de ajuste de estatus bajo la sección 245(i), procesamiento consular y residencias basadas en empleo o parentesco directo sin riesgos innecesarios.",
    descriptionEn: "We guide every stage of adjustment of status under section 245(i), consular processing, and residency applications based on family or employment safely and thoroughly.",
    highlights: ["Ajuste de Estatus dentro de EE. UU.", "Procesamiento Consular en embajadas", "Eliminación de condiciones I-751", "Permisos de trabajo y viaje anticipado (Advance Parole)"],
    situations: [
      { es: "Matrimonio con ciudadano(a) estadounidense o residente permanente para ajustar estatus sin salir de EE. UU.", en: "Marriage to a U.S. citizen or permanent resident to adjust status without leaving the country." },
      { es: "Petición familiar I-130 aprobada con fecha de prioridad vigente en el Boletín de Visas.", en: "Approved I-130 family petition with current priority date in the Visa Bulletin." },
      { es: "Ingreso con visa o parole humanitario buscando regularización formal permanente.", en: "Entry with inspection, tourist visa or parole seeking lawful permanent status." },
      { es: "Eliminación de condiciones en residencia condicional de 2 años (Formulario I-751).", en: "Removal of conditions on 2-year conditional residency (Form I-751)." }
    ],
    guidingQuestions: [
      { es: "¿Ingresó legalmente con visa, parole o tiene el amparo de la ley 245(i)?", en: "Did you enter lawfully with inspection/parole or qualify under 245(i)?" },
      { es: "¿Su cónyuge o familiar peticionario es ciudadano de EE. UU. o residente legal?", en: "Is your sponsoring relative a U.S. citizen or legal permanent resident?" },
      { es: "¿Desea obtener permiso de trabajo y seguro social mientras se aprueba su residencia?", en: "Do you wish to obtain work authorization while your residency is pending?" }
    ],
    dynamicQuestions: [
      {
        id: "entry_method",
        labelEs: "¿Cómo fue su última entrada a los Estados Unidos?",
        labelEn: "How was your most recent entry into the United States?",
        options: [
          { value: "con_visa_parole", labelEs: "Con visa válida, parole humanitario o inspección migratoria", labelEn: "Lawful entry with visa, parole, or CBP inspection" },
          { value: "sin_inspeccion", labelEs: "Sin inspección fronteriza / por frontera sur", labelEn: "Entry without inspection at border" },
          { value: "fuera_eeuu", labelEs: "Actualmente resido fuera de los Estados Unidos", labelEn: "Currently residing outside the United States" }
        ]
      },
      {
        id: "sponsor_relation",
        labelEs: "¿Quién patrocina su trámite de residencia?",
        labelEn: "Who is sponsoring your permanent residency?",
        options: [
          { value: "conyuge_ciudadano", labelEs: "Cónyuge ciudadano estadounidense", labelEn: "U.S. Citizen Spouse" },
          { value: "conyuge_residente", labelEs: "Cónyuge residente permanente legal", labelEn: "Lawful Permanent Resident Spouse" },
          { value: "padres_hijos", labelEs: "Padre/Madre ciudadano o hijo mayor de 21 años", labelEn: "U.S. Citizen parent or adult child (21+)" },
          { value: "empleador", labelEs: "Petición basada en empleo o inversión", labelEn: "Employment or investment sponsor" }
        ]
      },
      {
        id: "prior_issues",
        labelEs: "¿Tiene antecedentes penales o salidas previas no autorizadas?",
        labelEn: "Do you have any criminal history or prior unlawful departures?",
        options: [
          { value: "limpio", labelEs: "Ninguno, récord penal y migratorio limpio", labelEn: "None, clean criminal & immigration record" },
          { value: "infraccion_menor", labelEs: "Infracción menor de tránsito o falta no penal", labelEn: "Minor traffic citation only" },
          { value: "previo_complicado", labelEs: "Presencia irregular previa o contacto con ICE", labelEn: "Prior unlawful presence or immigration contact" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo evaluar mi caso para Residencia Permanente (Green Card) y Ajuste de Estatus."
  },
  {
    id: "peticiones-familiares",
    category: "familia",
    titleEs: "Peticiones Familiares (I-130)",
    titleEn: "Family Petitions (Form I-130)",
    taglineEs: "Reunificando a su familia en los Estados Unidos",
    taglineEn: "Reuniting families lawfully across the United States",
    descriptionEs: "Peticiones para cónyuges, hijos, padres y hermanos de ciudadanos estadounidenses y residentes permanentes. Planificamos la estrategia para evitar demoras innecesarias.",
    descriptionEn: "Petitions for spouses, children, parents, and siblings of U.S. citizens and legal permanent residents with strategic timeline planning.",
    highlights: ["Petición para cónyuge de ciudadano o residente", "Petición de padres e hijos inmediatos", "Visas de prometido K-1 (Fiancé Visa)", "Seguimiento en el Centro Nacional de Visas (NVC)"],
    situations: [
      { es: "Ciudadano estadounidense que desea pedir a su cónyuge, hijos, padres o hermanos.", en: "U.S. citizen sponsoring a spouse, children, parents, or siblings." },
      { es: "Residente permanente que solicita a su cónyuge o hijos solteros menores/mayores.", en: "Green card holder petitioning for spouse or unmarried children." },
      { es: "Pareja comprometida que busca la Visa K-1 de prometido(a) para casarse en EE. UU.", en: "Engaged couple applying for K-1 Fiancé Visa to marry in the U.S." },
      { es: "Trámite retrasado en USCIS o Centro Nacional de Visas (NVC) que requiere impulso legal.", en: "Case stalled at USCIS or NVC requiring aggressive legal follow-up." }
    ],
    guidingQuestions: [
      { es: "¿Cuál es el estatus migratorio del familiar que servirá de peticionario?", en: "What is the immigration status of the petitioning sponsor?" },
      { es: "¿Qué parentesco directo tiene con el beneficiario a quien desea patrocinar?", en: "What is your direct relationship to the beneficiary?" },
      { es: "¿El familiar vive en el extranjero o ya reside dentro de EE. UU.?", en: "Is your relative abroad or already residing inside the U.S.?" }
    ],
    dynamicQuestions: [
      {
        id: "petitioner_status",
        labelEs: "¿Cuál es el estatus legal de la persona que patrocinará?",
        labelEn: "What is the legal status of the petitioner?",
        options: [
          { value: "ciudadano", labelEs: "Ciudadano estadounidense (por nacimiento o naturalización)", labelEn: "U.S. Citizen (by birth or naturalization)" },
          { value: "residente", labelEs: "Residente permanente legal (Green Card holder)", labelEn: "Lawful Permanent Resident" }
        ]
      },
      {
        id: "beneficiary_relation",
        labelEs: "¿A qué familiar desea solicitar?",
        labelEn: "Which family member do you wish to petition for?",
        options: [
          { value: "conyuge", labelEs: "Cónyuge (Esposo o Esposa)", labelEn: "Spouse" },
          { value: "hijo_menor", labelEs: "Hijo o hija menor de 21 años", labelEn: "Child under 21 years old" },
          { value: "padre_madre", labelEs: "Padre o Madre (solo ciudadanos mayores de 21)", labelEn: "Parent (citizens 21+ only)" },
          { value: "hijo_adulto_hermano", labelEs: "Hijo adulto o Hermano/a (con tiempo de espera preferencial)", labelEn: "Adult son/daughter or Sibling" }
        ]
      },
      {
        id: "beneficiary_location",
        labelEs: "¿Dónde se encuentra el familiar actualmente?",
        labelEn: "Where does the beneficiary reside currently?",
        options: [
          { value: "en_origen", labelEs: "En su país de origen (Proceso Consular)", labelEn: "In home country (Consular Processing)" },
          { value: "en_usa", labelEs: "Dentro de los Estados Unidos", labelEn: "Inside the United States" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo asesoría para una Petición Familiar I-130."
  },
  {
    id: "ciudadania-naturalizacion",
    category: "familia",
    titleEs: "Ciudadanía y Naturalización (N-400)",
    titleEn: "Citizenship & Naturalization (Form N-400)",
    taglineEs: "El paso definitivo hacia sus derechos plenos como estadounidense",
    taglineEn: "The final milestone to full United States citizenship",
    descriptionEs: "Preparación rigurosa para el examen de naturalización, revisión exhaustiva de viajes y antecedentes penales para garantizar una entrevista impecable ante USCIS.",
    descriptionEn: "Rigorous preparation for civics and English examinations, travel log reviews, and moral character vetting to ensure approval.",
    highlights: ["Revisión de tiempo de presencia física y viajes", "Exenciones médicas por idioma (N-648)", "Ciudadanía derivada para hijos menores", "Preparación simulada de entrevista oficial"],
    situations: [
      { es: "Residente permanente por 5 años (o 3 años casado con ciudadano) listo para el examen N-400.", en: "Green card holder for 5 years (or 3 years married to USC) ready for N-400." },
      { es: "Residentes con viajes al exterior mayores a 6 meses que temen haber roto la continuidad de residencia.", en: "Residents with extended international travel (over 6 months) seeking continuous residence review." },
      { es: "Personas mayores o con condiciones de salud que califican para examen en español (reglas 50/20, 55/15 o N-648).", en: "Qualifying seniors or medical exemption applicants eligible for Spanish exam." },
      { es: "Padres naturalizados que desean obtener el Certificado de Ciudadanía N-600 para hijos menores.", en: "Naturalized parents securing Form N-600 Certificates of Citizenship for minors." }
    ],
    guidingQuestions: [
      { es: "¿Lleva al menos 5 años como residente (o 3 años si está casado con ciudadano)?", en: "Have you held your green card for at least 5 years (or 3 if married to USC)?" },
      { es: "¿Ha permanecido fuera de EE. UU. por más de 6 meses continuos en los últimos 5 años?", en: "Have you spent more than 6 consecutive months outside the U.S.?" },
      { es: "¿Desea prepararse para la prueba cívica y de idioma con simulacros dirigidos?", en: "Do you want attorney guidance and mock interviews for your civics test?" }
    ],
    dynamicQuestions: [
      {
        id: "lpr_years",
        labelEs: "¿Cuántos años lleva con residencia permanente válida?",
        labelEn: "How many years have you been a lawful permanent resident?",
        options: [
          { value: "mas_5", labelEs: "5 años o más", labelEn: "5 years or more" },
          { value: "3_a_5_casado", labelEs: "Entre 3 y 5 años (casado/a con ciudadano)", labelEn: "3 to 5 years (married to U.S. citizen)" },
          { value: "menos_3", labelEs: "Menos de 3 años de residencia", labelEn: "Less than 3 years" }
        ]
      },
      {
        id: "travel_duration",
        labelEs: "¿Ha tenido viajes fuera de EE. UU. superiores a 6 meses?",
        labelEn: "Any trips outside the U.S. lasting longer than 6 months?",
        options: [
          { value: "no", labelEs: "No, solo viajes cortos de vacaciones o negocios", labelEn: "No, short trips only" },
          { value: "si_6_12", labelEs: "Sí, un viaje entre 6 y 11 meses", labelEn: "Yes, a trip between 6 and 11 months" },
          { value: "si_mas_12", labelEs: "Sí, estuve fuera de EE. UU. más de 1 año continuo", labelEn: "Yes, over 1 consecutive year abroad" }
        ]
      },
      {
        id: "language_exemption",
        labelEs: "¿Requiere presentar el examen en español o exención médica?",
        labelEn: "Do you qualify for a language exemption or medical waiver?",
        options: [
          { value: "en_ingles", labelEs: "Presentaré el examen en inglés", labelEn: "I will take the civics & English test" },
          { value: "espanol_edad", labelEs: "Califico por edad (50/20 o 55/15) para examen en español", labelEn: "Age exemption (50/20 or 55/15 rules in native language)" },
          { value: "medica_n648", labelEs: "Tengo certificado de discapacidad médica Form N-648", labelEn: "Medical disability waiver Form N-648" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo una evaluación para mi Ciudadanía y Naturalización N-400."
  },
  {
    id: "asilo-politico",
    category: "defensa",
    titleEs: "Asilo Político y Refugio",
    titleEn: "Political Asylum & Refugee Protection",
    taglineEs: "Protección legal para quienes huyen de persecución real",
    taglineEn: "Zealous legal defense for individuals fleeing persecution",
    descriptionEs: "Defensa jurídica sólida para solicitudes de asilo afirmativo ante USCIS y defensivo ante las Cortes de Inmigración (EOIR). Construcción probatoria minuciosa de informes de país y testimonios periciales.",
    descriptionEn: "Tenacious defense for affirmative asylum with USCIS and defensive asylum before EOIR immigration courts, backed by exhaustive country condition reports.",
    highlights: ["Asilo Afirmativo y Asilo Defensivo", "Convenio contra la Tortura (CAT)", "Suspensión de Remoción (Withholding of Removal)", "Permiso de trabajo bajo la regla de 180 días"],
    situations: [
      { es: "Persecución política comprobada, amenazas de muerte o violencia por parte de regímenes o grupos armados.", en: "Political persecution, death threats, or violence by regimes or armed cartels." },
      { es: "Llegada reciente a EE. UU. que requiere radicar el Formulario I-589 antes del límite legal de 1 año.", en: "Recent entry into the U.S. requiring Form I-589 filing before the 1-year statutory bar." },
      { es: "Proceso derivado de entrevista de Miedo Creíble en frontera remitido ante un Juez de Inmigración.", en: "Credible fear interview referral to an EOIR Immigration Judge." },
      { es: "Solicitantes con caso de asilo pendiente que necesitan tramitar o renovar su Permiso de Trabajo.", en: "Applicants with pending asylum seeking initial or renewed work authorization (EAD)." }
    ],
    guidingQuestions: [
      { es: "¿Llegó a EE. UU. hace menos de 1 año o tiene motivos que justifiquen una excepción?", en: "Did you arrive under 1 year ago or qualify for an extraordinary circumstances exception?" },
      { es: "¿Teme por su vida o libertad si es forzado a regresar a su país de origen?", en: "Do you fear for your life, physical integrity, or freedom if forced to return?" },
      { es: "¿Cuenta con denuncias policiales, informes médicos, fotos o testigos de las amenazas?", en: "Do you possess corroborating evidence such as police reports, medical notes, or threats?" }
    ],
    dynamicQuestions: [
      {
        id: "time_in_us",
        labelEs: "¿Hace cuánto tiempo ingresó a los Estados Unidos?",
        labelEn: "When did you enter the United States?",
        options: [
          { value: "menos_1_ano", labelEs: "Hace menos de 1 año (dentro del plazo estatutario)", labelEn: "Less than 1 year ago (within statutory window)" },
          { value: "mas_1_ano_justificado", labelEs: "Hace más de 1 año (con circunstancia extraordinaria o cambio de país)", labelEn: "Over 1 year ago with exceptional circumstances" },
          { value: "no_ingresado", labelEs: "Aún no he ingresado / Estoy planeando refugio", labelEn: "Have not entered the U.S. yet" }
        ]
      },
      {
        id: "persecution_ground",
        labelEs: "¿Cuál es la causa principal de la persecución o peligro que enfrenta?",
        labelEn: "What is the primary protected ground for your fear of return?",
        options: [
          { value: "politica", labelEs: "Opinión o activismo político en contra del gobierno", labelEn: "Political opinion or anti-regime activism" },
          { value: "grupo_social", labelEs: "Violencia de pandillas, violencia de género o grupo social", labelEn: "Gang extortion, gender-based violence, or particular social group" },
          { value: "religion_etnia", labelEs: "Religión, raza, nacionalidad o etnia", labelEn: "Religion, race, ethnicity, or nationality" }
        ]
      },
      {
        id: "case_forum",
        labelEs: "¿Tiene fecha de audiencia asignada ante la Corte de Inmigración?",
        labelEn: "Do you have an Immigration Court (EOIR) hearing date?",
        options: [
          { value: "si_corte", labelEs: "Sí, tengo audiencia programada ante la Corte EOIR", labelEn: "Yes, pending EOIR court hearing" },
          { value: "no_uscis", labelEs: "No, mi caso es afirmativo ante la oficina de asilo de USCIS", labelEn: "No, affirmative application with USCIS" },
          { value: "no_presentado", labelEs: "Aún no he radicado mi solicitud formal I-589", labelEn: "Have not filed Form I-589 yet" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, necesito asesoría urgente para un caso de Asilo Político en EE. UU."
  },
  {
    id: "defensa-deportacion",
    category: "defensa",
    titleEs: "Defensa contra la Deportación",
    titleEn: "Deportation & Removal Defense",
    taglineEs: "Litigio feroz ante jueces de inmigración de la EOIR",
    taglineEn: "Aggressive courtroom advocacy before EOIR immigration judges",
    descriptionEs: "Representación inmediata ante detenciones de ICE, audiencias de fianza migratoria, cancelación de remoción para no residentes y mociones de reapertura ante la corte o BIA.",
    descriptionEn: "Immediate representation for ICE detentions, bond hearings, non-LPR cancellation of removal, and emergency motions to reopen before EOIR and the BIA.",
    highlights: ["Audiencias de fianza y liberación inmediata", "Cancelación de Expulsión (Ley de 10 Años)", "Mociones de Reapertura y Apelaciones BIA", "Cierre administrativo y discreción procesal"],
    situations: [
      { es: "Familiar bajo custodia de ICE que requiere fianza migratoria urgente para quedar en libertad.", en: "Loved one detained by ICE requiring immediate bond motion for release." },
      { es: "Recepción de Notificación de Comparecencia (NTA) con audiencia preliminar (Master Calendar).", en: "Notice to Appear (NTA) issued with Master Calendar Hearing scheduled." },
      { es: "Inmigrantes con más de 10 años continuos en EE. UU. e hijos ciudadanos (Ley de 10 Años).", en: "Non-citizens with 10+ years physical presence and U.S. citizen relatives (Cancellation of Removal)." },
      { es: "Orden previa de remoción emitida en rebeldía que necesita Moción de Reapertura urgente.", en: "In absentia removal order requiring emergency Motion to Reopen and stay of removal." }
    ],
    guidingQuestions: [
      { es: "¿Tiene usted o su familiar una fecha de corte o notificación NTA en mano?", en: "Do you or a relative have a court date or Form I-862 Notice to Appear?" },
      { es: "¿Lleva más de 10 años viviendo de forma continua en territorio estadounidense?", en: "Have you resided continuously inside the United States for over 10 years?" },
      { es: "¿Cuenta con familiares ciudadanos o residentes que sufrirían perjuicio grave?", en: "Do you have citizen or resident family who would suffer extreme hardship?" }
    ],
    dynamicQuestions: [
      {
        id: "court_status",
        labelEs: "¿Cuál es la urgencia de su situación judicial?",
        labelEn: "What is the status of your immigration court case?",
        options: [
          { value: "detenido_ice", labelEs: "Urgente: Familiar actualmente detenido por ICE", labelEn: "Urgent: Relative currently detained by ICE" },
          { value: "audiencia_proxima", labelEs: "Tengo cita de Corte (Master Calendar o Individual) fijada", labelEn: "I have an upcoming court hearing date" },
          { value: "orden_previa", labelEs: "Tengo orden previa de deportación que necesito reabrir", labelEn: "Prior deportation order requiring reopening" },
          { value: "nta_sin_fecha", labelEs: "Recibí papel de corte pero no tiene fecha todavía", labelEn: "Received NTA without a designated date" }
        ]
      },
      {
        id: "years_in_us",
        labelEs: "¿Cuánto tiempo continuo lleva en los Estados Unidos?",
        labelEn: "How many continuous years have you lived in the U.S.?",
        options: [
          { value: "mas_10_anos", labelEs: "Más de 10 años continuos (Elegible para Ley de 10 Años)", labelEn: "Over 10 continuous years (potential Non-LPR Cancellation)" },
          { value: "5_a_10_anos", labelEs: "Entre 5 y 10 años", labelEn: "Between 5 and 10 years" },
          { value: "menos_5_anos", labelEs: "Menos de 5 años", labelEn: "Less than 5 years" }
        ]
      },
      {
        id: "us_relatives",
        labelEs: "¿Tiene hijos, cónyuge o padres con ciudadanía o residencia en EE. UU.?",
        labelEn: "Do you have children, spouse, or parents with U.S. citizenship or green cards?",
        options: [
          { value: "hijos_ciudadanos", labelEs: "Sí, tengo hijos ciudadanos estadounidenses", labelEn: "Yes, U.S. citizen children" },
          { value: "conyuge_padres", labelEs: "Sí, cónyuge o padres ciudadanos o residentes", labelEn: "Yes, citizen/resident spouse or parents" },
          { value: "ninguno", labelEs: "No tengo familiares con estatus legal", labelEn: "No direct relatives with legal status" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, necesito defensa urgente ante la Corte de Inmigración / ICE."
  },
  {
    id: "visas-inversion-eb5-e2",
    category: "corporativo",
    titleEs: "Visas de Inversión (E-2 y EB-5)",
    titleEn: "Investment Visas (E-2 & EB-5)",
    taglineEs: "Crecimiento empresarial y residencia por inversión",
    taglineEn: "Business expansion and permanent residency through investment",
    descriptionEs: "Estructuración jurídica integral para inversionistas de tratados comerciales (E-2) y programas de residencia por inversión EB-5 (Centro Regional o inversión directa).",
    descriptionEn: "Comprehensive legal structuring for treaty investor visas (E-2) and the EB-5 immigrant investor program (Regional Centers or direct investment).",
    highlights: ["Trámite de Visa E-2 para inversionistas y empleados esenciales", "Peticiones EB-5 con creación de empleo verificable", "Revisión de origen lícito de fondos (Source of Funds)", "Planes de negocios migratorios certificados"],
    situations: [
      { es: "Empresarios de países con tratado (México, Colombia, España, Argentina, etc.) invirtiendo en negocios en EE. UU.", en: "Entrepreneurs from treaty nations investing in active U.S. businesses or franchises." },
      { es: "Inversionistas que buscan la Green Card directa para su familia mediante el programa EB-5 ($800,000+).", en: "High-net-worth investors pursuing direct Green Cards via EB-5 Regional Centers ($800k+)." },
      { es: "Compra o adquisición mayoritaria de franquicias operativas o negocios en marcha en Florida o Texas.", en: "Acquisition or launch of operating franchises or startups across Florida, Texas, or nationwide." },
      { es: "Estructuración y blindaje del origen lícito de los fondos (Source of Funds audit).", en: "Comprehensive lawful source and path of funds audit and business plan design." }
    ],
    guidingQuestions: [
      { es: "¿Tiene pasaporte de un país que mantiene tratado comercial E-2 con Estados Unidos?", en: "Do you hold citizenship in a treaty country maintaining an E-2 treaty with the U.S.?" },
      { es: "¿Cuenta con capital propio de origen lícito y demostrable disponible para invertir?", en: "Do you have verifiable lawful capital ready for commercial investment?" },
      { es: "¿Busca una visa de negocios renovable indefinidamente (E-2) o la residencia definitiva (EB-5)?", en: "Are you seeking a renewable business visa (E-2) or direct permanent residency (EB-5)?" }
    ],
    dynamicQuestions: [
      {
        id: "investment_goal",
        labelEs: "¿Qué objetivo migratorio de inversión persigue?",
        labelEn: "What is your primary investment immigration objective?",
        options: [
          { value: "visa_e2", labelEs: "Visa de Negocios E-2 (Inversión activa desde $100k-$150k)", labelEn: "E-2 Treaty Investor Visa (Active enterprise from $100k+)" },
          { value: "residencia_eb5", labelEs: "Residencia Permanente EB-5 para familia ($800k en Centro Regional)", labelEn: "EB-5 Permanent Residency ($800k in Regional Center TEA)" },
          { value: "asesoria_inicial", labelEs: "Deseo comparar opciones y analizar viabilidad de capital", labelEn: "Seek feasibility review to compare routes" }
        ]
      },
      {
        id: "nationality_treaty",
        labelEs: "¿Cuál es su nacionalidad / pasaporte principal?",
        labelEn: "What is your primary country of nationality/citizenship?",
        options: [
          { value: "pais_con_tratado", labelEs: "País con Tratado E-2 (México, Colombia, España, Argentina, Chile, Costa Rica, etc.)", labelEn: "Treaty nation (Mexico, Colombia, Spain, Argentina, Chile, etc.)" },
          { value: "pais_sin_tratado", labelEs: "País sin tratado (Venezuela, Brasil, Perú, etc. - requiere EB-5 o doble ciudadanía)", labelEn: "Non-treaty nation (requires EB-5 or second treaty nationality)" },
          { value: "doble_nacionalidad", labelEs: "Tengo doble nacionalidad con un país europeo o de tratado", labelEn: "Dual citizen with European or treaty nation passport" }
        ]
      },
      {
        id: "investment_status",
        labelEs: "¿En qué etapa se encuentra su inversión?",
        labelEn: "What is the current status of your proposed investment?",
        options: [
          { value: "capital_listo", labelEs: "Fondos disponibles, buscando empresa o franquicia", labelEn: "Funds ready, currently scouting businesses or franchises" },
          { value: "empresa_operando", labelEs: "Negocio ya constituido o comprado en EE. UU.", labelEn: "Business already formed or purchased in the U.S." },
          { value: "fase_planificacion", labelEs: "Planificando a mediano plazo (6 a 12 meses)", labelEn: "Planning for the next 6 to 12 months" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo una consulta sobre Visas de Inversión E-2 o EB-5."
  },
  {
    id: "visas-trabajo-empleo",
    category: "corporativo",
    titleEs: "Visas de Trabajo y Empleo (H-1B, L-1, EB-2/EB-3)",
    titleEn: "Work & Employment Visas (H-1B, L-1, EB-2/3)",
    taglineEs: "Atracción de talento global y transferencias corporativas",
    taglineEn: "Global corporate talent mobility and labor certifications",
    descriptionEs: "Asesoramiento para empresas y profesionales internacionales: visas H-1B de especialidad, transferencias intraempresariales L-1 y residencias permanentes mediante Certificación Laboral PERM.",
    descriptionEn: "Counseling for corporations and international professionals: H-1B specialty occupations, L-1 intra-company transferees, and PERM Labor Certifications.",
    highlights: ["Visas H-1B y registro anual de lotería", "Visas L-1A/L-1B para ejecutivos y gerentes", "Certificación Laboral PERM ante el DOL", "Peticiones EB-2 y EB-3 de residencia"],
    situations: [
      { es: "Empresas estadounidenses contratando profesionales titulados mediante la lotería y visa H-1B.", en: "U.S. employers sponsoring specialty occupation professionals via H-1B lottery." },
      { es: "Corporaciones multinacionales transfiriendo ejecutivos o gerentes a sus filiales en EE. UU. (L-1A).", en: "Multinational corporations transferring executives/managers via L-1A intra-company visas." },
      { es: "Trabajadores calificados o profesionales en proceso de Certificación Laboral PERM (EB-2 / EB-3).", en: "Skilled workers and degree holders undergoing Department of Labor PERM certification." },
      { es: "Graduados universitarios con visa F-1 en periodo de OPT buscando transición hacia estatus laboral.", en: "F-1 OPT university graduates transitioning to sponsored employment status." }
    ],
    guidingQuestions: [
      { es: "¿Cuenta con una empresa patrocinadora en EE. UU. dispuesta a presentar la petición?", en: "Do you have an active U.S. employer willing to file a petition?" },
      { es: "¿Tiene título universitario de licenciatura (Bachelor's Degree) o maestría?", en: "Do you hold a university degree (Bachelor's or Master's) or equivalent credentials?" },
      { es: "¿Trabaja para una empresa internacional con operaciones o planes de expansión en EE. UU.?", en: "Do you work for an international enterprise with U.S. corporate ties?" }
    ],
    dynamicQuestions: [
      {
        id: "employer_status",
        labelEs: "¿Cuenta con un empleador o empresa patrocinadora en EE. UU.?",
        labelEn: "Do you have an employer sponsor in the United States?",
        options: [
          { value: "si_empresa_usa", labelEs: "Sí, una empresa estadounidense está lista para patrocinarme", labelEn: "Yes, a U.S. company is ready to file on my behalf" },
          { value: "multinacional", labelEs: "Trabajo en filial en el extranjero y seré transferido a EE. UU. (L-1)", labelEn: "Employed abroad by affiliate, seeking transfer (L-1)" },
          { value: "buscando_opciones", labelEs: "Soy profesional buscando evaluar alternativas viables", labelEn: "Individual professional exploring qualifying routes" }
        ]
      },
      {
        id: "education_level",
        labelEs: "¿Cuál es su nivel académico más alto completado?",
        labelEn: "What is your highest completed level of education?",
        options: [
          { value: "maestria_phd", labelEs: "Maestría o Doctorado (EE. UU. o equivalente extranjero)", labelEn: "Master's or Ph.D. (U.S. or foreign equivalent)" },
          { value: "licenciatura", labelEs: "Licenciatura / Grado Universitario (Bachelor's)", labelEn: "Bachelor's Degree" },
          { value: "tecnico_experiencia", labelEs: "Técnico o amplia experiencia laboral especializada", labelEn: "Technical degree or extensive specialized work experience" }
        ]
      },
      {
        id: "visa_preference",
        labelEs: "¿Qué tipo de trámite de empleo necesita gestionar?",
        labelEn: "Which employment immigration track are you pursuing?",
        options: [
          { value: "h1b_loteria", labelEs: "Visa H-1B de ocupación especializada", labelEn: "H-1B Specialty Occupation Visa" },
          { value: "l1_ejecutivo", labelEs: "Visa L-1A / L-1B de transferencia ejecutiva", labelEn: "L-1A/L-1B Intra-company Transfer Visa" },
          { value: "perm_residencia", labelEs: "Residencia laboral PERM (EB-2 / EB-3 Green Card)", labelEn: "PERM Labor Certification / Employment Green Card" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo una consulta corporativa sobre Visas de Trabajo y Empleo."
  },
  {
    id: "visas-talento-o1-eb1",
    category: "corporativo",
    titleEs: "Visas de Habilidad Extraordinaria (EB-1 y O-1)",
    titleEn: "Extraordinary Ability Visas (EB-1 & O-1)",
    taglineEs: "Para líderes en ciencias, artes, negocios o deportes",
    taglineEn: "For proven leaders in sciences, arts, business, or athletics",
    descriptionEs: "Estrategias de alto perfil para profesionales destacados sin necesidad de oferta de trabajo mediante la Exención por Interés Nacional (EB-2 NIW) o visas O-1 y EB-1A de habilidades extraordinarias.",
    descriptionEn: "High-caliber petitions for accomplished professionals, including National Interest Waivers (EB-2 NIW) and EB-1A / O-1 extraordinary ability classifications.",
    highlights: ["EB-2 National Interest Waiver (NIW)", "EB-1A para logros extraordinarios comprobados", "Visa O-1A (Ciencia y Negocios) y O-1B (Artes y Cine)", "Estrategia probatoria sin patrocinador empleador"],
    situations: [
      { es: "Científicos, médicos, ingenieros o investigadores buscando Green Card por mérito propio (EB-2 NIW).", en: "Researchers, physicians, and engineers seeking self-petitioned Green Cards via EB-2 NIW." },
      { es: "Artistas, músicos, directores de cine o actores destacados solicitando Visa O-1 o EB-1A.", en: "Artists, performers, and filmmakers filing O-1 or EB-1A extraordinary talent petitions." },
      { es: "Emprendedores de tecnología con proyectos innovadores de impacto sustancial para los EE. UU.", en: "Tech founders and innovators leading endeavors of substantial national importance." },
      { es: "Atletas y entrenadores de alto rendimiento con premios nacionales o internacionales.", en: "High-level athletes and coaches holding recognized national/international accolades." }
    ],
    guidingQuestions: [
      { es: "¿Tiene publicaciones científicas, patentes, premios de industria o amplia prensa en su campo?", en: "Do you have scholarly publications, patents, major awards, or high-profile media coverage?" },
      { es: "¿Su proyecto profesional aportará un beneficio sustancial a los Estados Unidos?", en: "Does your proposed endeavor have substantial merit and national importance for the U.S.?" },
      { es: "¿Desea obtener la residencia permanente legal sin requerir el patrocinio de un empleador?", en: "Do you wish to secure a Green Card independently without needing employer sponsorship?" }
    ],
    dynamicQuestions: [
      {
        id: "professional_field",
        labelEs: "¿En qué área destaca su trayectoria profesional?",
        labelEn: "What is your primary professional field of distinction?",
        options: [
          { value: "stem_investigacion", labelEs: "Ciencia, Tecnología, Ingeniería, Salud o Matemáticas (STEM)", labelEn: "Science, Technology, Engineering, or Health (STEM)" },
          { value: "artes_entretenimiento", labelEs: "Artes visuales, Música, Cine, Diseño o Entretenimiento", labelEn: "Arts, Music, Film, Design, or Entertainment" },
          { value: "negocios_tech", labelEs: "Negocios, Emprendimiento Tecnológico o Finanzas", labelEn: "Business, FinTech, or Tech Entrepreneurship" },
          { value: "deportes", labelEs: "Deportes o Atletismo de alto rendimiento", labelEn: "Athletics or professional coaching" }
        ]
      },
      {
        id: "achievements",
        labelEs: "¿Con cuáles elementos probatorios cuenta en su historial?",
        labelEn: "What documented evidentiary elements do you have?",
        options: [
          { value: "premios_publicaciones", labelEs: "Publicaciones especializadas, citas, premios o patentes registradas", labelEn: "Peer-reviewed articles, citations, patents, or prestigious awards" },
          { value: "prensa_liderazgo", labelEs: "Artículos en medios de comunicación y roles clave de liderazgo", labelEn: "Prominent press coverage and key critical leadership roles" },
          { value: "evaluacion_cv", labelEs: "Deseo que un abogado senior analice mi currículum completo", labelEn: "I wish to have a senior attorney evaluate my full CV/portfolio" }
        ]
      },
      {
        id: "talent_track",
        labelEs: "¿Qué vía de talento desea evaluar?",
        labelEn: "Which talent pathway are you targeting?",
        options: [
          { value: "eb2_niw", labelEs: "EB-2 NIW (Exención por Interés Nacional - Sin Patrocinador)", labelEn: "EB-2 National Interest Waiver (Self-Petition)" },
          { value: "eb1a", labelEs: "EB-1A (Habilidad Extraordinaria para Green Card Inmediata)", labelEn: "EB-1A Extraordinary Ability Green Card" },
          { value: "visa_o1", labelEs: "Visa O-1A / O-1B de Trabajo Temporal de Talento", labelEn: "O-1 Nonimmigrant Extraordinary Ability Visa" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo una evaluación de perfil para EB-2 NIW / Visa O-1."
  },
  {
    id: "programa-vawa",
    category: "humanitario",
    titleEs: "Protección Humanitaria VAWA",
    titleEn: "VAWA Humanitarian Protection",
    taglineEs: "Residencia confidencial para víctimas de violencia o abuso",
    taglineEn: "Confidential green card pathway for survivors of abuse",
    descriptionEs: "Vía de residencia confidencial para cónyuges, hijos y padres maltratados por ciudadanos estadounidenses o residentes permanentes, sin que el agresor se entere del trámite.",
    descriptionEn: "Strictly confidential green card petition for spouses, children, and parents subjected to abuse by U.S. citizens or lawful permanent residents.",
    highlights: ["Proceso 100% confidencial protegido por ley federal", "No se requiere el consentimiento ni firma del cónyuge agresor", "Aprobación de permiso de trabajo y número de Seguro Social", "Acceso directo a la residencia permanente legal"],
    situations: [
      { es: "Cónyuge de ciudadano o residente que sufre abuso psicológico, humillaciones, amenazas o agresión física.", en: "Spouse of USC/LPR enduring emotional abuse, humiliation, threats, or physical domestic violence." },
      { es: "Personas intimidadas con amenazas de deportación o con retención de pasaportes y documentos legales.", en: "Individuals controlled by threats of deportation or withheld identification documents." },
      { es: "Padres de ciudadanos estadounidenses mayores de 21 años maltratados emocional o económicamente por sus hijos.", en: "Parents of U.S. citizens (21+) subjected to abuse or severe mistreatment by their child." },
      { es: "Hijos menores de 21 años víctimas de maltrato intrafamiliar por parte de un progenitor con estatus.", en: "Children under 21 abused by a citizen or permanent resident parent." }
    ],
    guidingQuestions: [
      { es: "¿Estuvo o está casado con un ciudadano estadounidense o residente permanente?", en: "Were you or are you married to a U.S. citizen or permanent resident?" },
      { es: "¿Ha sufrido maltrato verbal, control económico, amenazas de llamar a ICE o violencia?", en: "Have you suffered verbal cruelty, financial deprivation, threats of ICE, or violence?" },
      { es: "¿Sabía que la ley federal prohíbe terminantemente notificar a su cónyuge sobre este trámite?", en: "Did you know federal law strictly protects confidentiality and never notifies the abuser?" }
    ],
    dynamicQuestions: [
      {
        id: "abuser_status",
        labelEs: "¿Cuál es el estatus legal del familiar agresor?",
        labelEn: "What is the legal status of the abusive relative?",
        options: [
          { value: "conyuge_ciudadano", labelEs: "Cónyuge ciudadano estadounidense", labelEn: "U.S. Citizen Spouse" },
          { value: "conyuge_residente", labelEs: "Cónyuge residente permanente legal", labelEn: "Lawful Permanent Resident Spouse" },
          { value: "hijo_ciudadano", labelEs: "Hijo/a ciudadano estadounidense mayor de 21 años", labelEn: "U.S. Citizen adult child (21+)" },
          { value: "padre_madre", labelEs: "Padre o Madre ciudadano o residente", labelEn: "Citizen or Resident parent" }
        ]
      },
      {
        id: "abuse_type",
        labelEs: "¿Qué formas de agresión o control ha experimentado?",
        labelEn: "What forms of abuse or control have occurred?",
        options: [
          { value: "psicologico_amenazas", labelEs: "Amenazas de deportación, humillaciones, control de dinero y aislamiento", labelEn: "Deportation threats, extreme control, insults, or financial abuse" },
          { value: "fisico_domestico", labelEs: "Agresiones físicas, empujones o violencia doméstica", labelEn: "Physical assault, intimidation, or domestic violence" },
          { value: "ambas_conductas", labelEs: "Ambas conductas combinadas de manera continuada", labelEn: "Combined physical and emotional/psychological cruelty" }
        ]
      },
      {
        id: "cohabitation",
        labelEs: "¿Convivió bajo el mismo techo en algún momento con su agresor?",
        labelEn: "Did you live together in the same residence at any point?",
        options: [
          { value: "si_eeuu", labelEs: "Sí, vivimos juntos en los Estados Unidos", labelEn: "Yes, lived together inside the U.S." },
          { value: "si_fuera_y_dentro", labelEs: "Sí, vivimos juntos fuera y dentro de EE. UU.", labelEn: "Yes, lived together abroad and in the U.S." }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo una consulta estrictamente confidencial sobre el Programa VAWA."
  },
  {
    id: "visa-u-visa-t",
    category: "humanitario",
    titleEs: "Visas Humanitarias U y T",
    titleEn: "Humanitarian U & T Visas",
    taglineEs: "Protección para víctimas de delitos y trata de personas",
    taglineEn: "Relief for victims of qualifying crimes and human trafficking",
    descriptionEs: "Estatus legal y camino a la residencia para personas que han sido víctimas de delitos calificados en EE. UU. (asalto, violencia, chantaje) y han cooperado con las autoridades policiales.",
    descriptionEn: "Legal status and path to permanent residency for victims of qualifying crimes who assist law enforcement, as well as victims of labor or sex trafficking.",
    highlights: ["Certificación policial Formulario I-918B", "Perdón migratorio amplio para entradas indocumentadas", "Inclusión de familiares derivados calificados", "Residencia permanente tras 3 años de estatus U o T"],
    situations: [
      { es: "Víctimas de asalto agravado, robo a mano armada, agresiones con armas o violencia doméstica en EE. UU.", en: "Victims of armed robbery, felony assault, weapon attacks, or domestic violence in the U.S." },
      { es: "Colaboración con la policía mediante llamada al 911, informe policial o declaración ante detectives.", en: "Assistance to law enforcement via 911 calls, official police reports, or witness testimony." },
      { es: "Víctimas de extorsión, chantaje o retención forzada de libertad personal.", en: "Victims of extortion, felony blackmail, or unlawful restraint." },
      { es: "Trabajadores sometidos a trata laboral bajo amenazas de patrones inescrupulosos (Visa T).", en: "Laborers subjected to trafficking, coercion, or withheld pay under threats (T-Visa)." }
    ],
    guidingQuestions: [
      { es: "¿Fue víctima de un asalto violento, agresión o delito calificado en EE. UU.?", en: "Were you a victim of a qualifying crime or felonious assault on U.S. soil?" },
      { es: "¿Llamó a la policía o colaboró con la investigación de las autoridades?", en: "Did you call the police or assist detectives in investigating the incident?" },
      { es: "¿Desea incluir a su cónyuge e hijos menores en este amparo humanitario?", en: "Do you wish to derive legal status for your spouse and unmarried minor children?" }
    ],
    dynamicQuestions: [
      {
        id: "crime_type",
        labelEs: "¿Cuál fue el incidente delictivo ocurrido en EE. UU.?",
        labelEn: "What was the qualifying crime committed in the U.S.?",
        options: [
          { value: "asalto_robo", labelEs: "Asalto a mano armada, robo agravado o ataque físico", labelEn: "Armed robbery, aggravated assault, or physical battery" },
          { value: "violencia_intrafamiliar", labelEs: "Violencia doméstica o acoso grave", labelEn: "Domestic violence or felony stalking" },
          { value: "chantaje_trata", labelEs: "Extorsión, secuestro o explotación laboral forzada (Visa T)", labelEn: "Extortion, kidnapping, or labor trafficking (T-Visa)" }
        ]
      },
      {
        id: "police_report",
        labelEs: "¿Cuenta con número de reporte policial o denuncia formal?",
        labelEn: "Do you have a police incident report or case number?",
        options: [
          { value: "si_reporte_mano", labelEs: "Sí, tengo copia del reporte policial con el número de caso", labelEn: "Yes, I hold a copy of the police report" },
          { value: "reporto_sin_copia", labelEs: "La policía intervino pero necesito que soliciten la copia", labelEn: "Police intervened; need attorneys to request certified records" },
          { value: "dudas_reporte", labelEs: "Deseo verificar si el incidente califica legalmente", labelEn: "Need review to confirm if the crime qualifies" }
        ]
      },
      {
        id: "police_cooperation",
        labelEs: "¿Ha colaborado o está dispuesto a colaborar con la policía o fiscalía?",
        labelEn: "Did you assist or are you willing to assist law enforcement?",
        options: [
          { value: "si_coopero", labelEs: "Sí, colaboré con las autoridades y respondí a sus preguntas", labelEn: "Yes, fully assisted officers/prosecutors" },
          { value: "dispuesto", labelEs: "Estoy dispuesto a prestar la cooperación que requieran", labelEn: "Willing to provide any required assistance" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo consultar sobre la Visa Humanitaria U / T por delito calificado."
  },
  {
    id: "tps-daca",
    category: "humanitario",
    titleEs: "TPS y Acción Diferida DACA",
    titleEn: "TPS & Deferred Action (DACA)",
    taglineEs: "Estatus de protección temporal y permisos de trabajo",
    taglineEn: "Temporary Protected Status and work authorization",
    descriptionEs: "Renovaciones e inscripciones iniciales de Estatus de Protección Temporal (TPS) para Venezuela, Haití, El Salvador, Honduras, Nicaragua, y protecciones para Dreamers bajo DACA.",
    descriptionEn: "Renewals and initial registrations for TPS beneficiaries and continuous representation for Dreamers under DACA provisions.",
    highlights: ["Renovación de permisos de trabajo vigentes", "Solicitud de Advance Parole para viaje y reingreso legal", "Transición de TPS/DACA hacia residencia permanente", "Defensa ante cancelaciones arbitrarias"],
    situations: [
      { es: "Beneficiarios de TPS de Venezuela, Haití, Nicaragua u otros países que necesitan renovar su estatus y permiso de trabajo.", en: "TPS holders from Venezuela, Haiti, Nicaragua, etc., renewing status and EAD." },
      { es: "Jóvenes protegidos bajo DACA (Dreamers) que requieren renovar su amparo bianual antes del vencimiento.", en: "DACA Dreamers requiring timely biennial deferred action and work renewals." },
      { es: "Titulares de TPS o DACA tramitando Advance Parole para reingresar legalmente con inspección a EE. UU.", en: "TPS/DACA recipients applying for Advance Parole to cure unlawful entry via lawful admission." },
      { es: "Estrategias de transición desde TPS/DACA hacia la residencia permanente definitiva (Green Card).", en: "Strategic conversion from TPS/DACA to lawful permanent residency via family/employment." }
    ],
    guidingQuestions: [
      { es: "¿Es ciudadano originario de un país designado para Estatus de Protección Temporal (TPS)?", en: "Are you a national of a country currently designated for TPS?" },
      { es: "¿Su amparo de DACA o TPS vence en los próximos 6 a 9 meses?", en: "Is your current DACA or TPS work authorization expiring within 6-9 months?" },
      { es: "¿Le gustaría solicitar un permiso de viaje Advance Parole para reingresar legalmente a EE. UU.?", en: "Would you like to obtain Advance Parole travel authorization for a lawful re-entry?" }
    ],
    dynamicQuestions: [
      {
        id: "program_type",
        labelEs: "¿Qué protección humanitaria requiere gestionar?",
        labelEn: "Which humanitarian program are you applying under?",
        options: [
          { value: "tps_renovacion", labelEs: "Renovación de TPS y Permiso de Trabajo (EAD)", labelEn: "TPS Renewal and Work Authorization (EAD)" },
          { value: "tps_inicial", labelEs: "Inscripción inicial de TPS bajo designación vigente", labelEn: "Initial TPS Registration under designated country rules" },
          { value: "daca_renovacion", labelEs: "Renovación de Acción Diferida DACA (Dreamers)", labelEn: "DACA Renewal for Dreamers" },
          { value: "advance_parole", labelEs: "Solicitud de Permiso de Viaje y Reingreso (Advance Parole)", labelEn: "Advance Parole Travel Authorization" }
        ]
      },
      {
        id: "tps_country",
        labelEs: "¿De qué país es ciudadano/nacional?",
        labelEn: "What is your country of nationality?",
        options: [
          { value: "venezuela", labelEs: "Venezuela", labelEn: "Venezuela" },
          { value: "haiti", labelEs: "Haití", labelEn: "Haiti" },
          { value: "centroamerica", labelEs: "El Salvador, Honduras o Nicaragua", labelEn: "El Salvador, Honduras, or Nicaragua" },
          { value: "otro_tps", labelEs: "Otro país designado (Ucrania, Sudán, etc.)", labelEn: "Other TPS-designated nation" }
        ]
      },
      {
        id: "greencard_pathway",
        labelEs: "¿Tiene cónyuge o hijos ciudadanos para evaluar el salto a la Residencia?",
        labelEn: "Do you have USC relatives to explore permanent residency conversion?",
        options: [
          { value: "si_posible_residencia", labelEs: "Sí, me interesa evaluar la residencia permanente definitiva", labelEn: "Yes, interested in transitioning to lawful permanent residency" },
          { value: "solo_tps", labelEs: "Por ahora deseo asegurar mi permiso de trabajo y estatus", labelEn: "Just need to secure work authorization and protection" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo gestionar mi trámite de TPS / DACA."
  },
  {
    id: "perdones-migratorios",
    category: "defensa",
    titleEs: "Perdones Migratorios (Waivers I-601 / I-601A)",
    titleEn: "Immigration Waivers (I-601 & I-601A)",
    taglineEs: "Superando causales de inadmisibilidad por presencia o fraude",
    taglineEn: "Overcoming inadmissibility grounds through hardship waivers",
    descriptionEs: "Elaboración de paquetes probatorios de 'Dificultad Extrema' (Extreme Hardship) para superar el castigo de los 3 y 10 años, entradas no autorizadas o acusaciones previas de tergiversación.",
    descriptionEn: "Meticulous legal briefs documenting Extreme Hardship to qualifying relatives to waive 3/10-year unlawful presence bars and prior immigration misrepresentations.",
    highlights: ["Perdón provisional I-601A dentro de EE. UU.", "Perdón I-601 por fraude o antecedentes", "Perdón I-212 para reingreso tras deportación", "Evaluaciones psicológicas y financieras periciales"],
    situations: [
      { es: "Personas con más de 180 días o 1 año de presencia indocumentada enfrentando el castigo de 3 o 10 años.", en: "Individuals facing 3/10-year unlawful presence bars seeking Form I-601A provisional waiver." },
      { es: "Candidatos con cita consular próxima en Ciudad Juárez u otros consulados que deben asegurar su perdón.", en: "Applicants with pending consular processing requiring an approved waiver before interview." },
      { es: "Acusaciones consulares de tergiversación (misrepresentation), fraude o antecedentes penales menores.", en: "Inadmissibility findings due to prior misrepresentation, false documents, or minor criminal records." },
      { es: "Perdón de permiso para volver a solicitar admisión tras deportación previa (Formulario I-212).", en: "Permission to reapply for admission following prior deportation (Form I-212)." }
    ],
    guidingQuestions: [
      { es: "¿Tiene cónyuge o padres que sean ciudadanos estadounidenses o residentes permanentes?", en: "Do you have a U.S. citizen or legal permanent resident spouse or parent?" },
      { es: "¿Su familiar sufriría dificultad extrema médica, financiera o emocional si usted no está con ellos?", en: "Would your qualifying relative experience extreme hardship if you were unable to live in the U.S.?" },
      { es: "¿Desea tramitar el perdón provisional I-601A dentro de EE. UU. antes de viajar a su entrevista?", en: "Do you want to secure the I-601A provisional waiver domestically before departing?" }
    ],
    dynamicQuestions: [
      {
        id: "waiver_reason",
        labelEs: "¿Cuál es la causa principal de inadmisibilidad a perdonar?",
        labelEn: "What is the primary inadmissibility bar requiring a waiver?",
        options: [
          { value: "presencia_indocumentada", labelEs: "Castigo de 3 o 10 años por presencia indocumentada (I-601A)", labelEn: "3 or 10-year unlawful presence bar (Form I-601A)" },
          { value: "fraude_declaracion", labelEs: "Acusación de fraude, tergiversación o documento falso (I-601)", labelEn: "Misrepresentation or immigration fraud ground (I-601)" },
          { value: "deportacion_previa", labelEs: "Deportación u orden de salida previa (I-212)", labelEn: "Prior deportation or removal order (I-212)" }
        ]
      },
      {
        id: "qualifying_relative",
        labelEs: "¿Quién es su 'Familiar Calificado' para demostrar Dificultad Extrema?",
        labelEn: "Who is your qualifying relative for Extreme Hardship?",
        options: [
          { value: "conyuge_ciudadano", labelEs: "Cónyuge ciudadano estadounidense", labelEn: "U.S. Citizen Spouse" },
          { value: "conyuge_residente", labelEs: "Cónyuge residente permanente", labelEn: "Lawful Permanent Resident Spouse" },
          { value: "padres_ciudadanos", labelEs: "Padre o madre ciudadano/a o residente", labelEn: "U.S. Citizen or LPR parent" }
        ]
      },
      {
        id: "case_stage",
        labelEs: "¿En qué etapa se encuentra su trámite consular o de perdón?",
        labelEn: "What stage is your waiver/consular case currently in?",
        options: [
          { value: "preparacion", labelEs: "Preparando el caso para someter el I-601A en EE. UU.", labelEn: "Preparing to file domestic I-601A package" },
          { value: "en_nvc", labelEs: "Caso aprobado en USCIS, en trámite ante el NVC", labelEn: "Approved at USCIS, currently at NVC" },
          { value: "entrevista_denegada", labelEs: "Ya tuve la entrevista consular y fui declarado inadmisible", labelEn: "Already attended consular interview and found inadmissible" }
        ]
      }
    ],
    whatsappPrefill: "Hola Valenzuela & Sterling, deseo asesoría para un Perdón Migratorio (Waiver I-601 / I-601A)."
  }
];`;

const startIndex = fileContent.indexOf('export const PRACTICE_AREAS = [');
const endIndex = fileContent.indexOf('export const SUCCESS_STORIES = [');

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find PRACTICE_AREAS boundaries");
  process.exit(1);
}

const newFileContent = fileContent.slice(0, startIndex) + updatedPracticeAreasCode + '\n\n' + fileContent.slice(endIndex);
fs.writeFileSync(demoDataPath, newFileContent, 'utf8');
console.log("Successfully updated demoData.js with enriched PRACTICE_AREAS!");

