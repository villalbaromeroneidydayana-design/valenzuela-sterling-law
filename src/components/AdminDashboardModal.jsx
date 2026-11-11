import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Lock, X, Plus, Search, FileText, CheckCircle2, 
  AlertCircle, KeyRound, Clock, UserCheck, RefreshCw, Eye, 
  Download, ArrowRight, LogOut, FileCheck, Phone, UserX, Edit3,
  Upload, Trash2, Shield, EyeOff, Save, Check, Award, PenTool
} from 'lucide-react';

export default function AdminDashboardModal({ isOpen, onClose, lang = 'es' }) {
  const [adminToken, setAdminToken] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState('');
  const [actionErrorNotice, setActionErrorNotice] = useState('');

  // Form: Nuevo Expediente
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [newCaseData, setNewCaseData] = useState({
    clientName: '',
    clientLastName: '',
    clientPhone: '',
    clientEmail: '',
    service: 'Petición Familiar I-130 & Ajuste de Estatus',
    attorneyAssigned: 'Abogado Titular de Guardia',
    status: 'Fase Inicial de Preparación y Revisión Documental',
    nextDeadline: 'Recepción y Cotejo de Certificados Civiles'
  });

  // Form: Editar Expediente
  const [isEditingCase, setIsEditingCase] = useState(false);
  const [editCaseData, setEditCaseData] = useState({
    clientName: '',
    clientLastName: '',
    clientPhone: '',
    clientEmail: '',
    service: '',
    attorneyAssigned: '',
    status: '',
    statusColor: 'blue',
    nextDeadline: ''
  });

  // Form: Nueva Actividad
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivityData, setNewActivityData] = useState({
    title: '',
    description: '',
    nextDeadline: ''
  });

  // Form: Subir Archivo Real
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Petición / Formulario Oficial USCIS');
  const [uploadIsClientVisible, setUploadIsClientVisible] = useState(true);
  const [uploadRequiresSignature, setUploadRequiresSignature] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form: Cambiar Contraseña del Personal
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  const fetchAdminCases = async (token = adminToken) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/cases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCases(data.cases || []);
        if (selectedCase) {
          const updated = (data.cases || []).find(c => c.caseNumber === selectedCase.caseNumber);
          if (updated) setSelectedCase(updated);
        }
      }
    } catch (err) {
      console.error('Error al consultar expedientes:', err);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAdminCases(adminToken);
    }
  }, [adminToken]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAdminToken(data.token);
        setAdminUser(data.user);
        setUsername('');
        setPassword('');
        fetchAdminCases(data.token);
      } else {
        setLoginError(data.error || 'Credenciales administrativas no autorizadas.');
      }
    } catch (err) {
      setLoginError('Error de conexión con el servidor seguro.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    setSelectedCase(null);
    setIsCreatingCase(false);
    setIsEditingCase(false);
    setIsAddingActivity(false);
    setIsUploadingDoc(false);
    setIsChangingPassword(false);
  };

  const triggerSuccessNotice = (msg) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(''), 4500);
  };

  const triggerErrorNotice = (msg) => {
    setActionErrorNotice(msg);
    setTimeout(() => setActionErrorNotice(''), 5000);
  };

  // Crear expediente
  const handleCreateCaseSubmit = async (e) => {
    e.preventDefault();
    if (!newCaseData.clientName || !newCaseData.clientLastName) return;

    try {
      const res = await fetch('/api/admin/cases/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(newCaseData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerSuccessNotice(`Expediente ${data.caseRecord.caseNumber} creado con clave de acceso asignada.`);
        setIsCreatingCase(false);
        setNewCaseData({
          clientName: '',
          clientLastName: '',
          clientPhone: '',
          clientEmail: '',
          service: 'Petición Familiar I-130 & Ajuste de Estatus',
          attorneyAssigned: 'Abogado Titular de Guardia',
          status: 'Fase Inicial de Preparación y Revisión Documental',
          nextDeadline: 'Recepción y Cotejo de Certificados Civiles'
        });
        fetchAdminCases();
      } else {
        triggerErrorNotice(data.error || 'Error al crear expediente.');
      }
    } catch (e) {
      triggerErrorNotice('Error de conexión.');
    }
  };

  // Abrir formulario de edición de caso
  const handleOpenEditCase = () => {
    if (!selectedCase) return;
    setEditCaseData({
      clientName: selectedCase.clientName?.split(' ')[0] || '',
      clientLastName: selectedCase.clientLastName || '',
      clientPhone: selectedCase.clientPhoneLast4 || '',
      clientEmail: selectedCase.clientEmail || '',
      service: selectedCase.service || '',
      attorneyAssigned: selectedCase.attorneyAssigned || '',
      status: selectedCase.status || '',
      statusColor: selectedCase.statusColor || 'blue',
      nextDeadline: selectedCase.nextDeadline || ''
    });
    setIsEditingCase(true);
  };

  // Guardar edición de caso
  const handleUpdateCaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      const res = await fetch('/api/admin/cases/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          caseNumber: selectedCase.caseNumber,
          ...editCaseData
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerSuccessNotice(`Expediente ${selectedCase.caseNumber} actualizado correctamente.`);
        setIsEditingCase(false);
        fetchAdminCases();
      } else {
        triggerErrorNotice(data.error || 'Error al actualizar expediente.');
      }
    } catch (err) {
      triggerErrorNotice('Error de conexión al actualizar expediente.');
    }
  };

  // Agregar actividad
  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase || !newActivityData.title) return;

    try {
      const res = await fetch('/api/portal/crm/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          caseNumber: selectedCase.caseNumber,
          activityTitle: newActivityData.title,
          activityDescription: newActivityData.description,
          nextDeadline: newActivityData.nextDeadline
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerSuccessNotice(`Novedad «${newActivityData.title}» publicada en el expediente.`);
        setIsAddingActivity(false);
        setNewActivityData({ title: '', description: '', nextDeadline: '' });
        fetchAdminCases();
      }
    } catch (e) {
      triggerErrorNotice('Error al registrar novedad.');
    }
  };

  // Subir archivo real a la bóveda (Supabase Storage)
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadDocSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase || !uploadFile) {
      triggerErrorNotice('Seleccione un archivo para subir a la bóveda.');
      return;
    }

    setUploadLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          const res = await fetch('/api/admin/cases/upload-document', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
              caseNumber: selectedCase.caseNumber,
              fileName: uploadFile.name,
              fileType: uploadFile.type || 'application/octet-stream',
              fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB`,
              fileBase64: base64Data,
              docType: uploadCategory,
              isClientVisible: uploadIsClientVisible,
              requiresSignature: uploadRequiresSignature
            })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            triggerSuccessNotice(`Archivo «${uploadFile.name}» cargado en la bóveda privada.`);
            setIsUploadingDoc(false);
            setUploadFile(null);
            setUploadRequiresSignature(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchAdminCases();
          } else {
            triggerErrorNotice(data.error || 'Error al procesar el archivo.');
          }
        } catch (innerErr) {
          triggerErrorNotice('Error al procesar el archivo en el navegador.');
        } finally {
          setUploadLoading(false);
        }
      };

      reader.onerror = () => {
        triggerErrorNotice('Error al leer el archivo local.');
        setUploadLoading(false);
      };

      reader.readAsDataURL(uploadFile);
    } catch (err) {
      triggerErrorNotice('Error en la subida.');
      setUploadLoading(false);
    }
  };

  // Descarga segura de documento para el personal
  const handleDownloadDoc = async (doc) => {
    if (!selectedCase) return;
    try {
      const res = await fetch('/api/portal/document/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          caseNumber: selectedCase.caseNumber,
          docId: doc.id
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        triggerErrorNotice(errData.error || 'No fue posible descargar el archivo.');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      triggerSuccessNotice(`Descargando «${doc.name}».`);
    } catch (err) {
      triggerErrorNotice('Error al descargar el archivo.');
    }
  };

  // Eliminar documento
  const handleDeleteDoc = async (doc) => {
    if (!confirm(`¿Confirma que desea retirar el documento «${doc.name}» de la bóveda? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch('/api/admin/cases/document/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          caseNumber: selectedCase.caseNumber,
          docId: doc.id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerSuccessNotice(`Documento «${doc.name}» retirado de la bóveda.`);
        fetchAdminCases();
      } else {
        triggerErrorNotice(data.error || 'No fue posible eliminar el documento.');
      }
    } catch (err) {
      triggerErrorNotice('Error de conexión al eliminar documento.');
    }
  };

  // Solicitar o Modificar Firma Manuscrita
  const handleToggleSignatureRequest = async (doc) => {
    if (!selectedCase) return;
    const nextReq = !(doc.requiresSignature && doc.signatureStatus !== 'signed');
    try {
      const res = await fetch('/api/admin/cases/document/request-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          caseNumber: selectedCase.caseNumber,
          docId: doc.id,
          requiresSignature: nextReq
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado de firma.');
      triggerSuccessNotice(data.message || 'Solicitud de firma actualizada.');
      fetchAdminCases();
    } catch (err) {
      triggerErrorNotice(err.message || 'Error al modificar solicitud de firma.');
    }
  };

  // Restablecer clave
  const handleResetCode = async (caseNumber) => {
    if (!confirm(`¿Desea generar una nueva clave criptográfica para el expediente ${caseNumber}? Las sesiones activas del cliente se revocarán de inmediato.`)) return;

    try {
      const res = await fetch('/api/admin/cases/reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ caseNumber })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerSuccessNotice(`Nueva clave para ${caseNumber}: ${data.newAccessCode}`);
        fetchAdminCases();
      } else {
        triggerErrorNotice(data.error || 'Error al restablecer clave.');
      }
    } catch (e) {
      triggerErrorNotice('Error al restablecer clave.');
    }
  };

  // Revocar / Reactivar acceso
  const handleToggleRevoke = async (caseNumber, currentRevoked) => {
    const actionName = currentRevoked ? 'reactivar' : 'revocar de inmediato';
    if (!confirm(`¿Confirma que desea ${actionName} el acceso al expediente ${caseNumber}?`)) return;

    try {
      const res = await fetch('/api/admin/cases/revoke-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ caseNumber, revoke: !currentRevoked })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerSuccessNotice(data.message);
        fetchAdminCases();
      } else {
        triggerErrorNotice(data.error || 'Error al modificar revocación.');
      }
    } catch (e) {
      triggerErrorNotice('Error al cambiar estado de revocación.');
    }
  };

  // Cambiar contraseña del usuario actual
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerErrorNotice('La confirmación de la contraseña no coincide.');
      return;
    }
    if (newPassword.length < 8) {
      triggerErrorNotice('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setPasswordChangeLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerSuccessNotice('Contraseña actualizada exitosamente.');
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        triggerErrorNotice(data.error || 'Error al cambiar contraseña.');
      }
    } catch (err) {
      triggerErrorNotice('Error de conexión.');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      (c.caseNumber || '').toLowerCase().includes(q) ||
      (c.clientName || '').toLowerCase().includes(q) ||
      (c.service || '').toLowerCase().includes(q)
    );
  });

  const isAdminRole = adminUser?.role === 'admin';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0B1E3D] border border-amber-500/40 rounded-2xl shadow-2xl text-white my-6 max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Cabecera del Panel */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-blue-900/60 bg-[#081426]/95 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Panel Administrativo y Bóveda Segura</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                Valenzuela & Sterling — Control de Expedientes
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {adminUser && (
              <>
                <div className="hidden sm:flex items-center space-x-1.5 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-900/70 text-xs">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-amber-300">{adminUser.roleLabel || adminUser.role}</span>
                </div>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-blue-900/40 hover:bg-blue-900/70 rounded-lg border border-blue-800 transition-colors flex items-center space-x-1"
                  title="Cambiar contraseña"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Contraseña</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-xs text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-950/70 rounded-lg border border-red-900/50 transition-colors flex items-center space-x-1"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificaciones de Éxito / Error */}
        {actionSuccessNotice && (
          <div className="px-5 py-2.5 bg-emerald-950/90 border-b border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
        )}
        {actionErrorNotice && (
          <div className="px-5 py-2.5 bg-red-950/90 border-b border-red-500/50 text-red-200 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{actionErrorNotice}</span>
          </div>
        )}

        {/* Modal: Cambiar Contraseña del Personal */}
        {isChangingPassword && (
          <div className="p-5 bg-[#081426] border-b border-amber-500/30 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <strong className="text-amber-400 text-sm flex items-center space-x-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Actualizar Contraseña de Acceso del Personal</span>
              </strong>
              <button onClick={() => setIsChangingPassword(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Contraseña Actual *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1E3D] border border-blue-800 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Nueva Contraseña (mín. 8 caracteres) *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1E3D] border border-blue-800 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1E3D] border border-blue-800 rounded-md text-white"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end space-x-2 pt-1">
                <button type="button" onClick={() => setIsChangingPassword(false)} className="px-3 py-1.5 bg-slate-800 rounded text-slate-300">Cancelar</button>
                <button type="submit" disabled={passwordChangeLoading} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded">
                  {passwordChangeLoading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Estado 1: No autenticado (Login) */}
        {!adminToken ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-serif text-2xl font-bold text-white mb-2">
                Acceso Exclusivo para el Personal
              </h4>
              <p className="text-xs text-slate-300">
                Ingrese sus credenciales de Abogado Director o Asistente Legal para administrar expedientes, novedades y la bóveda documental.
              </p>
            </div>

            {loginError && (
              <div className="w-full p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-xl flex items-center space-x-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="w-full space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Usuario o Correo Institucional
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin@valenzuelasterling.com o asistente"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#081426] border border-blue-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contraseña de Seguridad
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#081426] border border-blue-900 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando Credenciales...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Ingresar al Backoffice</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-[11px] text-slate-400 border-t border-blue-900/60 w-full">
              Sistema protegido por Hash SHA-512, scrypt, RLS en Supabase y Bóveda Cifrada.
            </div>
          </div>
        ) : (
          /* Estado 2: Autenticado (Dashboard Principal) */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Columna Izquierda: Listado y Búsqueda de Expedientes */}
            <div className="w-full md:w-5/12 border-r border-blue-900/60 flex flex-col bg-[#081426]/70">
              
              <div className="p-4 border-b border-blue-900/60 space-y-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    Expedientes Registrados ({cases.length})
                  </h4>
                  <button
                    onClick={() => { setIsCreatingCase(true); setSelectedCase(null); setIsEditingCase(false); }}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Caso</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por caso, cliente o trámite..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0B1E3D] border border-blue-900/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Lista scrollable de casos */}
              <div className="flex-1 overflow-y-auto divide-y divide-blue-900/40">
                {filteredCases.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No se encontraron expedientes con el criterio de búsqueda.
                  </div>
                ) : (
                  filteredCases.map(c => {
                    const isSelected = selectedCase?.caseNumber === c.caseNumber;
                    return (
                      <button
                        key={c.caseNumber}
                        onClick={() => { setSelectedCase(c); setIsCreatingCase(false); setIsEditingCase(false); }}
                        className={`w-full text-left p-3.5 transition-colors flex items-start justify-between cursor-pointer ${
                          isSelected ? 'bg-blue-900/50 border-l-4 border-amber-400' : 'hover:bg-blue-950/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-amber-300">{c.caseNumber}</span>
                            {c.isTestRecord && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 font-bold border border-amber-500/40">
                                PRUEBA
                              </span>
                            )}
                            {c.isRevoked && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900/80 text-red-200 font-bold">
                                REVOCADO
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-white">{c.clientName}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[220px]">{c.service}</div>
                        </div>

                        <span className="text-[10px] text-slate-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                          {c.documents?.length || 0} docs
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Columna Derecha: Detalle, Edición o Creación de Expediente */}
            <div className="flex-1 flex flex-col bg-[#0B1E3D]/50 overflow-y-auto p-4 sm:p-6">
              
              {/* VISTA 1: Crear nuevo expediente */}
              {isCreatingCase ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
                    <h4 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                      <Plus className="w-5 h-5 text-amber-400" />
                      <span>Registrar Nuevo Expediente de Inmigración</span>
                    </h4>
                    <button onClick={() => setIsCreatingCase(false)} className="text-xs text-slate-400 hover:text-white">✕ Cancelar</button>
                  </div>

                  <form onSubmit={handleCreateCaseSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Nombre(s) del Cliente *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Roberto"
                          value={newCaseData.clientName}
                          onChange={(e) => setNewCaseData({ ...newCaseData, clientName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Apellido(s) del Cliente *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Morales"
                          value={newCaseData.clientLastName}
                          onChange={(e) => setNewCaseData({ ...newCaseData, clientLastName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Teléfono Móvil (Confirmación Factor 3)</label>
                        <input
                          type="tel"
                          placeholder="Ej. +1 (314) 618-5666"
                          value={newCaseData.clientPhone}
                          onChange={(e) => setNewCaseData({ ...newCaseData, clientPhone: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Correo Electrónico</label>
                        <input
                          type="email"
                          placeholder="cliente@ejemplo.com"
                          value={newCaseData.clientEmail}
                          onChange={(e) => setNewCaseData({ ...newCaseData, clientEmail: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Materia Jurídica / Trámite Migratorio *</label>
                      <select
                        value={newCaseData.service}
                        onChange={(e) => setNewCaseData({ ...newCaseData, service: e.target.value })}
                        className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                      >
                        <option value="Petición Familiar I-130 & Ajuste de Estatus I-485">Petición Familiar I-130 & Ajuste de Estatus I-485</option>
                        <option value="Defensa de Asilo ante Corte EOIR & Retención">Defensa de Asilo ante Corte EOIR & Retención</option>
                        <option value="Defensa de Deportación y Cancelación de Remoción EOIR-42B">Defensa de Deportación y Cancelación EOIR-42B</option>
                        <option value="Fianzas Migratorias de Detención ICE / Krome">Fianzas Migratorias de Detención ICE / Krome</option>
                        <option value="Perdón Legal / Waivers I-601A por Dureza Extrema">Perdón Legal / Waivers I-601A</option>
                        <option value="Visas Humanitarias: VAWA, Visa U, Visa T">Visas Humanitarias: VAWA, Visa U, Visa T</option>
                        <option value="Ciudadanía y Naturalización N-400">Ciudadanía y Naturalización N-400</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Abogado Asignado</label>
                        <input
                          type="text"
                          value={newCaseData.attorneyAssigned}
                          onChange={(e) => setNewCaseData({ ...newCaseData, attorneyAssigned: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Próximo Vencimiento / Paso Inicial</label>
                        <input
                          type="text"
                          value={newCaseData.nextDeadline}
                          onChange={(e) => setNewCaseData({ ...newCaseData, nextDeadline: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreatingCase(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow cursor-pointer"
                      >
                        Registrar Expediente y Generar Clave
                      </button>
                    </div>
                  </form>
                </div>
              ) : isEditingCase && selectedCase ? (
                /* VISTA 2: Editar expediente existente */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
                    <h4 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                      <Edit3 className="w-5 h-5 text-amber-400" />
                      <span>Editar Expediente {selectedCase.caseNumber}</span>
                    </h4>
                    <button onClick={() => setIsEditingCase(false)} className="text-xs text-slate-400 hover:text-white">✕ Cancelar</button>
                  </div>

                  <form onSubmit={handleUpdateCaseSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Nombre Completo Titular *</label>
                        <input
                          type="text"
                          required
                          value={editCaseData.clientName}
                          onChange={(e) => setEditCaseData({ ...editCaseData, clientName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Apellido Titular (Factor Confirmación) *</label>
                        <input
                          type="text"
                          required
                          value={editCaseData.clientLastName}
                          onChange={(e) => setEditCaseData({ ...editCaseData, clientLastName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Teléfono / Últimos 4 dígitos</label>
                        <input
                          type="text"
                          value={editCaseData.clientPhone}
                          onChange={(e) => setEditCaseData({ ...editCaseData, clientPhone: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Correo Electrónico</label>
                        <input
                          type="email"
                          value={editCaseData.clientEmail}
                          onChange={(e) => setEditCaseData({ ...editCaseData, clientEmail: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Materia Jurídica</label>
                        <input
                          type="text"
                          value={editCaseData.service}
                          onChange={(e) => setEditCaseData({ ...editCaseData, service: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Abogado Asignado</label>
                        <input
                          type="text"
                          value={editCaseData.attorneyAssigned}
                          onChange={(e) => setEditCaseData({ ...editCaseData, attorneyAssigned: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Estado Procesal</label>
                        <input
                          type="text"
                          value={editCaseData.status}
                          onChange={(e) => setEditCaseData({ ...editCaseData, status: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Próximo Vencimiento / Cita</label>
                        <input
                          type="text"
                          value={editCaseData.nextDeadline}
                          onChange={(e) => setEditCaseData({ ...editCaseData, nextDeadline: e.target.value })}
                          className="w-full px-3 py-2 bg-[#081426] border border-blue-900 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingCase(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Cambios</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : selectedCase ? (
                /* VISTA 3: Ficha Detallada del Expediente */
                <div className="space-y-4">
                  
                  {/* Encabezado del caso */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#081426] p-4 rounded-xl border border-blue-900/60">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-amber-400">{selectedCase.caseNumber}</span>
                        {selectedCase.isTestRecord && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 font-bold border border-amber-500/40">
                            REGISTRO DE PRUEBA
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-white mt-1">
                        {selectedCase.clientName}
                      </h3>
                      <p className="text-xs text-slate-300">{selectedCase.service}</p>
                    </div>

                    {/* Acciones principales del expediente */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleOpenEditCase}
                        className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {isAdminRole ? (
                        <>
                          <button
                            onClick={() => handleResetCode(selectedCase.caseNumber)}
                            className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                            title="Genera nueva clave criptográfica para el cliente"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Reset Clave</span>
                          </button>

                          <button
                            onClick={() => handleToggleRevoke(selectedCase.caseNumber, selectedCase.isRevoked)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors ${
                              selectedCase.isRevoked
                                ? 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/50'
                                : 'bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/50'
                            }`}
                          >
                            {selectedCase.isRevoked ? <Check className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            <span>{selectedCase.isRevoked ? 'Reactivar' : 'Revocar'}</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Acciones de control reservadas a Dirección</span>
                      )}
                    </div>
                  </div>

                  {/* Metadatos y Seguridad */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#081426]/60 p-3.5 rounded-xl border border-blue-900/40 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Factor Confirmación:</span>
                      <span className="font-semibold text-white">
                        {selectedCase.clientLastName} / Tel: ****{selectedCase.clientPhoneLast4}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Estado de Conexión:</span>
                      <span className={`font-bold ${selectedCase.isRevoked ? 'text-red-400' : 'text-emerald-400'}`}>
                        {selectedCase.isRevoked ? '🔴 Acceso Revocado' : '🟢 Acceso Habilitado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Próximo Vencimiento / Paso:</span>
                      <span className="font-semibold text-amber-300">
                        {selectedCase.nextDeadline}
                      </span>
                    </div>
                  </div>

                  {/* Formulario: Publicar Novedad */}
                  {isAddingActivity ? (
                    <div className="p-4 bg-[#081426] border border-emerald-500/40 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                        <strong className="text-xs text-emerald-400 flex items-center space-x-1.5">
                          <Clock className="w-4 h-4" />
                          <span>Registrar Novedad Procesal Oficial</span>
                        </strong>
                        <button onClick={() => setIsAddingActivity(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
                      </div>
                      <form onSubmit={handleAddActivitySubmit} className="space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-300 mb-1">Título de la Gestión *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Notificación de Radicación USCIS I-797C Recibida"
                            value={newActivityData.title}
                            onChange={(e) => setNewActivityData({ ...newActivityData, title: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0B1E3D] border border-blue-800 rounded-md text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1">Descripción Detallada (visible para el cliente en portal)</label>
                          <textarea
                            rows={2}
                            placeholder="Detalle los avances del trámite y las gestiones efectuadas por la firma..."
                            value={newActivityData.description}
                            onChange={(e) => setNewActivityData({ ...newActivityData, description: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0B1E3D] border border-blue-800 rounded-md text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1">Próximo Paso / Fecha Límite Actualizada</label>
                          <input
                            type="text"
                            placeholder="Ej. Cita de Huellas Biométricas programada para 18 Diciembre 2026"
                            value={newActivityData.nextDeadline}
                            onChange={(e) => setNewActivityData({ ...newActivityData, nextDeadline: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0B1E3D] border border-blue-800 rounded-md text-white"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button type="button" onClick={() => setIsAddingActivity(false)} className="px-3 py-1.5 bg-slate-800 rounded text-slate-300">Cancelar</button>
                          <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded">Publicar Novedad</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Historial de Gestiones ({selectedCase.activities?.length || 0})</span>
                      </span>
                      <button
                        onClick={() => setIsAddingActivity(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Novedad</span>
                      </button>
                    </div>
                  )}

                  {/* Listado de actividades */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {(selectedCase.activities || []).map((act, i) => (
                      <div key={act.id || i} className="p-3 bg-[#081426] border border-blue-900/60 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-100">{act.title}</strong>
                          <span className="text-slate-400 text-[11px]">{act.date}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] font-light leading-relaxed">{act.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* SECCIÓN DOCUMENTOS: Subida Real y Clasificación */}
                  {isUploadingDoc ? (
                    <div className="p-4 bg-[#081426] border border-amber-500/40 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                        <strong className="text-xs text-amber-400 flex items-center space-x-1.5">
                          <Upload className="w-4 h-4" />
                          <span>Subir Archivo Real a la Bóveda Privada (Supabase Storage)</span>
                        </strong>
                        <button onClick={() => setIsUploadingDoc(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
                      </div>
                      <form onSubmit={handleUploadDocSubmit} className="space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-300 mb-1">Seleccionar Archivo (PDF, Pasaporte, Foto, Word, JPG, PNG) *</label>
                          <input
                            type="file"
                            ref={fileInputRef}
                            required
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 bg-[#0B1E3D] border border-blue-800 rounded-md text-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                          />
                          {uploadFile && (
                            <span className="text-[11px] text-amber-300 mt-1 block">
                              Archivo: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-300 mb-1">Clasificación / Categoría Legal</label>
                            <select
                              value={uploadCategory}
                              onChange={(e) => setUploadCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-[#0B1E3D] border border-blue-800 rounded-md text-white"
                            >
                              <option value="Petición / Formulario Oficial USCIS">Petición / Formulario Oficial USCIS</option>
                              <option value="Pasaporte / Identificación Oficial">Pasaporte / Identificación Oficial</option>
                              <option value="Fotografía / Registro Biométrico">Fotografía / Registro Biométrico</option>
                              <option value="Notice of Action / Recibo Oficial I-797C">Notice of Action / Recibo I-797C</option>
                              <option value="Resolución de Corte / Dictamen EOIR">Resolución de Corte / Dictamen EOIR</option>
                              <option value="Evidencia de Apoyo / Declaración Jurada">Evidencia de Apoyo / Declaración Jurada</option>
                              <option value="Expediente Administrativo Interno FOIA">Expediente Administrativo FOIA (Privado)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-300 mb-1">Privacidad / Visibilidad en Portal</label>
                            <div className="flex items-center space-x-3 pt-2">
                              <label className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="visibility"
                                  checked={uploadIsClientVisible === true}
                                  onChange={() => setUploadIsClientVisible(true)}
                                  className="text-emerald-500 focus:ring-0"
                                />
                                <span className="text-emerald-300 flex items-center space-x-1">
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Visible para el Cliente</span>
                                </span>
                              </label>

                              <label className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="visibility"
                                  checked={uploadIsClientVisible === false}
                                  onChange={() => setUploadIsClientVisible(false)}
                                  className="text-amber-500 focus:ring-0"
                                />
                                <span className="text-amber-300 flex items-center space-x-1">
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Privado / Solo Firma</span>
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Opción de Solicitar Firma Manuscrita */}
                        <div className="pt-2 border-t border-blue-900/60">
                          <label className="flex items-center space-x-2 text-xs text-amber-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={uploadRequiresSignature}
                              onChange={(e) => setUploadRequiresSignature(e.target.checked)}
                              className="rounded border-blue-700 bg-blue-950 text-amber-500 focus:ring-0 cursor-pointer"
                            />
                            <span className="font-semibold flex items-center space-x-1.5">
                              <PenTool className="w-3.5 h-3.5" />
                              <span>Solicitar Firma Manuscrita Digital al Cliente</span>
                            </span>
                          </label>
                        </div>

                        <div className="flex justify-end space-x-2 pt-1">
                          <button type="button" onClick={() => setIsUploadingDoc(false)} className="px-3 py-1.5 bg-slate-800 rounded text-slate-300">Cancelar</button>
                          <button
                            type="submit"
                            disabled={uploadLoading}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded flex items-center space-x-1.5"
                          >
                            {uploadLoading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Cifrando y Subiendo...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Subir a Bóveda</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-blue-900/60">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Bóveda Documental ({selectedCase.documents?.length || 0})</span>
                      </span>
                      <button
                        onClick={() => setIsUploadingDoc(true)}
                        className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Archivo Real</span>
                      </button>
                    </div>
                  )}

                  {/* Listado de Documentos con Clasificación de Privacidad */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(selectedCase.documents || []).length === 0 ? (
                      <div className="p-4 bg-[#081426] border border-blue-900/40 rounded-lg text-center text-xs text-slate-400">
                        No hay documentos registrados en este expediente.
                      </div>
                    ) : (
                      (selectedCase.documents || []).map((doc) => (
                        <div key={doc.id} className="p-3 bg-[#081426] border border-blue-900/60 rounded-lg flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-2">
                              <strong className="text-white truncate block max-w-[230px] sm:max-w-md">{doc.name}</strong>
                              <span className="text-[10px] text-slate-400 bg-blue-950 px-1.5 py-0.2 rounded border border-blue-900 flex-shrink-0">
                                {doc.size}
                              </span>
                              {doc.isClientVisible ? (
                                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-semibold flex items-center space-x-0.5 flex-shrink-0">
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>Visible Cliente</span>
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/40 rounded font-semibold flex items-center space-x-0.5 flex-shrink-0">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Privado Firma</span>
                                </span>
                              )}
                              {doc.signatureStatus === 'signed' && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-semibold flex items-center space-x-0.5 flex-shrink-0">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Firmado</span>
                                </span>
                              )}
                              {doc.requiresSignature && doc.signatureStatus !== 'signed' && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/40 rounded font-semibold flex items-center space-x-0.5 flex-shrink-0">
                                  <PenTool className="w-2.5 h-2.5" />
                                  <span>Firma Solicitada</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {doc.type} • Autorizado por: {doc.authorizedBy} ({doc.date})
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            {/* Botón para solicitar/cancelar firma en documentos no firmados */}
                            {doc.signatureStatus !== 'signed' && (
                              <button
                                onClick={() => handleToggleSignatureRequest(doc)}
                                className={`p-1.5 rounded cursor-pointer transition-colors ${
                                  doc.requiresSignature 
                                    ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40' 
                                    : 'bg-blue-950/80 hover:bg-blue-900 text-slate-300 border border-blue-800'
                                }`}
                                title={doc.requiresSignature ? 'Cancelar solicitud de firma' : 'Solicitar firma manuscrita al cliente'}
                              >
                                <PenTool className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDownloadDoc(doc)}
                              className="p-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded cursor-pointer"
                              title="Descargar y verificar archivo"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {isAdminRole && (
                              <button
                                onClick={() => handleDeleteDoc(doc)}
                                className="p-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded cursor-pointer"
                                title="Eliminar documento de la bóveda"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              ) : (
                /* Estado sin caso seleccionado */
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
                  <FileCheck className="w-12 h-12 text-slate-500" />
                  <p className="text-sm">Seleccione un expediente de la lista izquierda para consultar o actualizar su expediente.</p>
                  <p className="text-xs text-slate-500">O haga clic en «Nuevo Caso» para dar de alta a un cliente.</p>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
