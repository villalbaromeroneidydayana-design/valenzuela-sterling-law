async function testCrmSync() {
  // 1. Auth to get token
  const authRes = await fetch('http://127.0.0.1:3000/api/portal/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseNumber: 'VS-CAS-2026-0842', accessCode: '7941' })
  });
  const authData = await authRes.json();
  const token = authData.token;
  console.log('Original activities count:', authData.caseRecord.activities.length);

  // 2. CRM logs an office activity
  const crmRes = await fetch('http://127.0.0.1:3000/api/portal/crm/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      caseNumber: 'VS-CAS-2026-0842',
      activityTitle: 'Confirmación de Fecha de Entrevista Consular',
      activityDescription: 'El Centro Nacional de Visas (NVC) remitió la cita oficial. Expediente actualizado en CRM.'
    })
  });
  const crmData = await crmRes.json();
  console.log('CRM registration status:', crmRes.status, 'success:', crmData.success);

  // 3. Client Portal queries case
  const portalRes = await fetch(`http://127.0.0.1:3000/api/portal/case?caseNumber=VS-CAS-2026-0842&token=${token}`);
  const portalData = await portalRes.json();
  console.log('Portal updated activities count:', portalData.caseRecord.activities.length);
  console.log('Latest activity title in portal:', portalData.caseRecord.activities[0].title);

  // 4. Test document download
  const docRes = await fetch(`http://127.0.0.1:3000/api/portal/document?caseNumber=VS-CAS-2026-0842&docId=doc-i797c&token=${token}`);
  console.log('Document download status:', docRes.status);
  const docText = await docRes.text();
  console.log('Document length bytes:', docText.length, 'Header:', docText.split('\n')[1]);
}

testCrmSync().catch(console.error);

