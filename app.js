/* ===== ÍNDICE: 1 Datos · 2 Guardado · 3 Pantalla · 4 Plan · 5 Instrucciones · 6 Presupuesto · 6a Partes · 6b Escenario de tarifa · 7 Arranque ===== */

/* 1. DATOS: todo lo que escribe el usuario vive en este objeto */
const CLAVE = 'planificador-proyecto';
const PRIORIDADES = ['Imprescindible', 'Deseable', 'Futuro'];
let proyecto = proyectoVacio();

function proyectoVacio() {
  return { esEjemplo: false, nombre: '', idea: '', tipo: 'Aplicación de gestión (web)', pais: '', contexto: '',
    cliente: '', problema: '', hoyhacen: '', porque: '', competencia: '', validacion: '', metrica: '', datos: '',
    decisiones: {}, funciones: [], herramienta: 'Lovable', estilo: '', extra: '',
    partes: {}, horas: '', ganarMes: '', horasFacturables: '', precioHora: '',
    gastosUnicos: '', gastosMes: '', horasMes: '', imprevistos: '', iva: '' };
}
// Ejemplo ficticio: solo se carga si el usuario pulsa «Cargar ejemplo»
function proyectoEjemplo() {
  return { esEjemplo: true, nombre: 'Taller de ejemplo', idea: 'App para un taller mecánico ficticio: clientes, vehículos, citas y presupuestos.',
    tipo: 'Aplicación de gestión (web)', pais: 'España', contexto: 'Negocio inventado para probar la herramienta.',
    funciones: [{ texto: 'Ficha de cliente', prioridad: 'Imprescindible' }, { texto: 'Agenda de citas', prioridad: 'Imprescindible' },
      { texto: 'Presupuestos en PDF', prioridad: 'Deseable' }, { texto: 'Estadísticas del mes', prioridad: 'Futuro' }],
    cliente: 'Un taller ficticio de 3 personas.', problema: 'Pierden citas y presupuestos apuntados en papel.', hoyhacen: 'Papel y WhatsApp.', porque: '', competencia: '', validacion: '', metrica: '', datos: 'Nombres, teléfonos y matrículas de clientes.',
    herramienta: 'Lovable', estilo: 'Limpio, azul oscuro, botones grandes', extra: '',
    partes: {},
    horas: '20', ganarMes: '1000', horasFacturables: '50', precioHora: '20', gastosUnicos: '30', gastosMes: '10', horasMes: '1', imprevistos: '10', iva: '21' };
}

const $ = id => document.getElementById(id);
const CAMPOS = { cliente: 'cliente', problema: 'problema', hoyhacen: 'hoyhacen', porque: 'porque', competencia: 'competencia', validacion: 'validacion', metrica: 'metrica', datos: 'datos', nombre: 'nombre', idea: 'texto-idea', tipo: 'tipo', pais: 'pais', contexto: 'contexto', herramienta: 'herramienta',
  estilo: 'estilo', extra: 'extra', horas: 'horas', precioHora: 'precio-hora', gastosUnicos: 'gastos-unicos',
  ganarMes: 'ganar-mes', horasFacturables: 'horas-facturables',
  gastosMes: 'gastos-mes', horasMes: 'horas-mes', imprevistos: 'imprevistos', iva: 'iva' };

/* 2. GUARDADO: solo en localStorage de este navegador, y solo al pulsar «Guardar» */
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(proyecto)); mensaje('Guardado en este navegador.'); }
function cargar() { try { const g = localStorage.getItem(CLAVE); if (g) proyecto = Object.assign(proyectoVacio(), JSON.parse(g)); } catch (e) {} }
function mensaje(t) { $('mensaje').textContent = t; }

/* 3. PANTALLA: del objeto a los campos y al revés */
function pintarCampos() {
  for (const k in CAMPOS) $(CAMPOS[k]).value = proyecto[k];
  $('aviso-ejemplo').hidden = !proyecto.esEjemplo;
  pintarFunciones(); pintarPartes(); recalcular();
}
function leerCampos() {
  for (const k in CAMPOS) proyecto[k] = $(CAMPOS[k]).value;
}
function pintarFunciones() {
  const cont = $('lista-funciones'); cont.innerHTML = '';
  proyecto.funciones.forEach((f, i) => {
    const fila = document.createElement('div'); fila.className = 'funcion';
    const entrada = document.createElement('input'); entrada.value = f.texto; entrada.placeholder = 'Función';
    entrada.oninput = () => { f.texto = entrada.value; recalcular(); };
    const sel = document.createElement('select');
    PRIORIDADES.forEach(p => { const o = document.createElement('option'); o.textContent = p; sel.appendChild(o); });
    sel.value = f.prioridad; sel.onchange = () => { f.prioridad = sel.value; recalcular(); };
    const b = document.createElement('button'); b.className = 'borrar-fila'; b.textContent = '🗑'; b.title = 'Borrar función';
    b.onclick = () => { proyecto.funciones.splice(i, 1); pintarFunciones(); recalcular(); };
    fila.append(entrada, sel, b); cont.appendChild(fila);
  });
}
function escapar(t) { return String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

/* 4. PLAN: agrupa por la prioridad que eligió el usuario */
function funcionesDe(prioridad) {
  const propias = proyecto.funciones.filter(f => f.texto.trim() && f.prioridad === prioridad).map(f => f.texto.trim());
  const dec = prioridad === 'Imprescindible' ? 'v1' : prioridad === 'Deseable' ? 'despues' : null;
  const aceptadas = dec ? propuestasActivas().filter(x => proyecto.decisiones[x.id] === dec).map(x => x.texto + ' (propuesta aceptada)') : [];
  return propias.concat(aceptadas);
}
function pintarPlan() {
  const lista = a => a.length ? '<ul>' + a.map(x => '<li>' + escapar(x) + '</li>').join('') + '</ul>' : '<p class="nota">Ninguna.</p>';
  $('resultado-plan').innerHTML = '<h2>' + escapar(proyecto.nombre || 'Proyecto sin nombre') + '</h2><p>' + escapar(proyecto.idea) + '</p>'
    + '<h3>Imprescindible (versión 1)</h3>' + lista(funcionesDe('Imprescindible'))
    + '<h3>Deseable</h3>' + lista(funcionesDe('Deseable')) + '<h3>Futuro</h3>' + lista(funcionesDe('Futuro'))
    + '<h3>Antes de entregar</h3><ul><li>Probar con un usuario real</li><li>Revisar permisos y datos personales</li><li>Decidir copia de seguridad y soporte</li></ul>';
}

/* 5. INSTRUCCIONES: texto con plantilla fija para pegar en la herramienta de IA */
function pintarInstrucciones() {
  const p = proyecto, linea = (t, v) => v && v.trim() ? t + v.trim() : '';
  const lista = a => a.length ? a.map((f, i) => (i + 1) + '. ' + f).join('\n') : '(sin funciones todavía)';
  const despues = funcionesDe('Deseable').concat(funcionesDe('Futuro')).map(f => '- ' + f).join('\n') || '-';
  const bloques = [
    'Construye con ' + p.herramienta + ' (' + p.tipo.toLowerCase() + ')' + (p.nombre.trim() ? ' llamada "' + p.nombre.trim() + '"' : ' (nombre pendiente)') + (p.pais.trim() ? ' para ' + p.pais.trim() : '') + '.',
    ['CONTEXTO', p.idea.trim(), p.contexto.trim(), linea('Cliente: ', p.cliente), linea('Problema: ', p.problema), linea('Alternativa actual: ', p.hoyhacen), linea('Datos que maneja: ', p.datos)].filter(Boolean).join('\n'),
    'VERSIÓN 1 (solo esto):\n' + lista(funcionesDe('Imprescindible')),
    'DESPUÉS (no construir aún):\n' + despues,
    ['ESTILO', (p.estilo.trim() ? p.estilo.trim() + '. ' : '') + 'Interfaz en castellano, pensada primero para móvil.', p.extra.trim()].filter(Boolean).join('\n'),
    'REQUISITOS\n- Usa solo datos de ejemplo ficticios.\n- Valida formularios y muestra errores claros.\n- Explica dónde se guardan los datos.\n- Código ordenado, con comentarios.',
    'Al terminar, di qué has hecho y qué falta.'];
  $('resultado-instrucciones').textContent = bloques.join('\n\n');
}

/* 6. PRESUPUESTO: aritmética simple con los datos del usuario */
function pintarPresupuesto() {
  const n = v => parseFloat(v) || 0, p = proyecto;
  const trabajo = n(p.horas) * n(p.precioHora), unicos = n(p.gastosUnicos), imprev = (trabajo + unicos) * n(p.imprevistos) / 100;
  const base = trabajo + unicos + imprev, mes = n(p.gastosMes) + n(p.horasMes) * n(p.precioHora), iva = n(p.iva) / 100;
  const e = x => x.toFixed(2).replace('.', ',') + ' €';
  // Sin horas o sin tarifa no hay presupuesto: los totales solo suman lo cubierto y se avisa bien visible
  const faltaT = !(n(p.horas) > 0), faltaP = !(n(p.precioHora) > 0), incompleto = faltaT || faltaP;
  const aviso = incompleto ? '<p class="aviso-parcial"><b>Presupuesto incompleto:</b> falta '
    + (faltaT && faltaP ? 'poner las horas de trabajo y tu precio por hora' : faltaT ? 'poner las horas de trabajo' : 'poner tu precio por hora')
    + '. Los totales de abajo suman solo lo que has cubierto; no es el precio final.</p>' : '';
  $('resultado-presupuesto').innerHTML = aviso + '<table>'
    + '<tr><td>Trabajo</td><td>' + e(trabajo) + '</td></tr><tr><td>Gastos únicos</td><td>' + e(unicos) + '</td></tr>'
    + '<tr><td>Imprevistos</td><td>' + e(imprev) + '</td></tr><tr><td><b>' + (incompleto ? 'Total parcial sin IVA' : 'Pago único sin IVA') + '</b></td><td><b>' + e(base) + '</b></td></tr>'
    + '<tr><td>Con IVA (' + n(p.iva) + ' %)' + (incompleto ? ' (parcial)' : '') + '</td><td>' + e(base * (1 + iva)) + '</td></tr>'
    + '<tr><td><b>Mantenimiento/mes sin IVA</b>' + (incompleto ? ' (parcial)' : '') + '</td><td><b>' + e(mes) + '</b></td></tr>'
    + '<tr><td>Mantenimiento/mes con IVA</td><td>' + e(mes * (1 + iva)) + '</td></tr></table>'
    + (incompleto ? '<p class="total">Incompleto: de momento solo suma ' + e(base) + ' + ' + e(mes) + '/mes</p>' : '<p class="total">' + e(base) + ' + ' + e(mes) + '/mes</p>')
    + (p.esEjemplo ? '<p class="nota">Importes del ejemplo ficticio.</p>' : '');
}

/* 4a. RECORRIDO: reconoce el tema por palabras y propone decisiones. Son propuestas de diseño, no obligaciones legales verificadas */
const CATALOGO = [
  { tema: 'reservas', detecta: /reserva|mesa/i, titulo: 'Reservas',
    propuestas: [
      { id: 'r-form', texto: 'Formulario de reserva: nombre, teléfono, comensales, fecha y hora', motivo: 'Es lo mínimo para que una reserva exista.', dato: true },
      { id: 'r-aforo', texto: 'Límite de comensales por franja horaria', motivo: 'Evita aceptar más gente de la que cabe. Hay que saber el aforo real.' },
      { id: 'r-estado', texto: 'Estado de cada reserva: pendiente, confirmada, no vino, cancelada', motivo: 'Permite ver cuántas reservas no aparecen.' },
      { id: 'r-dia', texto: 'Vista del día para el restaurante, ordenada por hora', motivo: 'Lo que más usará el personal durante el servicio.' },
      { id: 'r-aviso', texto: 'Confirmación o recordatorio al cliente', motivo: 'Puede reducir plantones, pero enviar SMS o WhatsApp tiene costes y normas.', mensajes: true }] },
  { tema: 'carta', detecta: /carta|menú|menu|platos/i, titulo: 'Carta',
    propuestas: [
      { id: 'c-lista', texto: 'Carta con categorías, platos y precios', motivo: 'Base de cualquier carta digital.' },
      { id: 'c-ocultar', texto: 'Marcar un plato como agotado u ocultarlo sin borrarlo', motivo: 'Cambia a diario en un restaurante real; hay que confirmarlo con el cliente.' },
      { id: 'c-alergenos', texto: 'Alérgenos por plato', motivo: 'Suele ser importante en carta; qué exige la normativa hay que comprobarlo con fuente oficial.' },
      { id: 'c-qr', texto: 'Enlace o código QR para ver la carta desde el móvil', motivo: 'Es la forma habitual de usarla en la mesa.' },
      { id: 'c-fotos', texto: 'Fotos de los platos', motivo: 'Gustan, pero añaden peso y trabajo de mantenimiento.' }] }];
const INCOGNITAS = {
  reservas: ['¿Cómo reservan hoy? (teléfono, Instagram, otra plataforma)', '¿Cuántas mesas y comensales caben, y hay turnos?', '¿Qué hace el restaurante con quien no aparece?'],
  carta: ['¿Quién cambia la carta y cada cuánto?', '¿Hay platos del día o de temporada?', '¿Necesita más de un idioma?']};
function temasDetectados() {
  const t = [proyecto.idea, proyecto.nombre].concat(proyecto.funciones.map(f => f.texto)).join(' ');
  return CATALOGO.filter(c => c.detecta.test(t));
}
function propuestasActivas() { return temasDetectados().reduce((l, c) => l.concat(c.propuestas), []); }
function decidir(id, valor) { proyecto.decisiones[id] = proyecto.decisiones[id] === valor ? '' : valor; recalcular(); }
function pintarRecorrido() {
  const p = proyecto, temas = temasDetectados(), esc = escapar;
  let h = '<h2>Recorrido de la idea</h2>';
  h += '<h3><span class="etiqueta hecho">HECHO</span>Lo que has escrito</h3><ul>'
    + '<li>Idea: ' + esc(p.idea || '(vacía)') + '</li>'
    + (p.funciones.filter(f => f.texto.trim()).length ? '<li>Funciones: ' + p.funciones.filter(f => f.texto.trim()).map(f => esc(f.texto) + ' (' + f.prioridad + ')').join(', ') + '</li>' : '') + '</ul>';
  if (!temas.length) {
    h += '<p>Todavía no reconozco el tipo de proyecto. Escribe la idea o añade funciones en la pestaña Plan. La herramienta solo reconoce unos pocos temas (ahora: reservas y carta).</p>';
  } else {
    h += '<h3><span class="etiqueta supuesto">SUPUESTO</span>Mientras no se sepa otra cosa</h3><p>Trabajamos con un solo local y un solo equipo. Si no es así, cambia casi todo lo de abajo.</p>';
    h += '<h3><span class="etiqueta propuesta">PROPUESTA</span>Decide qué entra</h3><p class="nota">Son ideas de diseño de la herramienta, no requisitos verificados. Elige una opción en cada una; entran en Plan e Instrucciones.</p>';
    temas.forEach(c => {
      h += '<h4>' + c.titulo + '</h4>';
      c.propuestas.forEach(x => {
        const d = p.decisiones[x.id] || '';
        h += '<div class="decision"><p><b>' + esc(x.texto) + '</b></p><p class="nota">' + esc(x.motivo) + '</p><div class="opciones">'
          + ['v1:Versión 1', 'despues:Después', 'no:No'].map(o => { const [k, t] = o.split(':'); return '<button data-id="' + x.id + '" data-v="' + k + '" class="' + (d === k ? 'elegida' : '') + '">' + t + '</button>'; }).join('') + '</div></div>';
      });
    });
    h += '<h3><span class="etiqueta incognita">INCÓGNITA</span>Solo lo sabe el cliente real</h3><p class="nota">No hace falta contestarlas ahora. Son las preguntas para tu primera conversación con el restaurante.</p><ul>'
      + temas.reduce((l, c) => l.concat(INCOGNITAS[c.tema]), []).map(q => '<li>' + q + '</li>').join('') + '</ul>';
  }
  $('recorrido').innerHTML = h;
  $('recorrido').querySelectorAll('button[data-id]').forEach(b => b.onclick = () => decidir(b.dataset.id, b.dataset.v));
}

/* 4b. IDEA: detecta huecos y hace preguntas con reglas fijas (sin IA, no puntúa la calidad de la idea) */
const PREGUNTAS = [
  ['cliente', 'Cliente', '¿Podrías llamarle por teléfono mañana? Si no tienes a quién, aún no hay cliente.'],
  ['problema', 'Problema', '¿Te lo ha dicho el cliente o lo supones tú? Pregúntale cuánto tiempo o dinero pierde al mes.'],
  ['hoyhacen', 'Alternativa actual', 'Si ya lo resuelve con papel o Excel y le funciona, ¿qué le obligaría a cambiar?'],
  ['porque', 'Motivo para pagar', 'Escribe una frase: «pagaría X porque ahorra Y». Si no puedes, falta propuesta de valor.'],
  ['competencia', 'Competencia', 'Busca 3 apps parecidas. Si no encuentras ninguna, puede que no haya mercado, no que estés solo.'],
  ['validacion', 'Prueba esta semana', 'Enseña una maqueta a 3 personas reales antes de construir más.'],
  ['metrica', 'Medida de éxito', 'Pon un número: por ejemplo «3 negocios la usan 2 semanas seguidas».'],
  ['datos', 'Datos sensibles', 'Si hay datos personales o de dinero, hay que decidir dónde se guardan y quién accede.']];
const AVISOS = [ // [palabra que aparece en lo escrito, aviso]
  [/factura|cobro|pago|iva/i, 'Facturas o cobros: las facturas tienen requisitos legales; no la presentes como facturación oficial sin asesorarte.'],
  [/dni|salud|médic|menor|teléfono|telefono|email|correo|dirección|direccion|matrícula|matricula|nombre/i, 'Datos personales: toca RGPD (aviso de privacidad, dónde se guardan, borrado). El guardado local no es una copia de seguridad.'],
  [/\bia\b|inteligencia artificial|chatgpt|gpt/i, 'IA: cada uso suele costar dinero; calcula el coste por cliente antes de prometer «ilimitado».'],
  [/whatsapp|sms|notificaci/i, 'Mensajes automáticos: el WhatsApp oficial y los SMS tienen costes y normas; no es gratis ni inmediato.'],
  [/login|usuarios|cuenta|contraseña|contrasena/i, 'Cuentas de usuario: añaden seguridad, recuperación de contraseña y soporte. ¿De verdad hacen falta en la versión 1?']];
function pintarIdea() {
  const p = proyecto, texto = PREGUNTAS.filter(q => q[0] !== 'hoyhacen').map(q => p[q[0]]).concat(p.idea, p.contexto, p.funciones.map(f => f.texto)).join(' ');
  const resp = PREGUNTAS.filter(q => (p[q[0]] || '').trim().length > 0), faltan = PREGUNTAS.filter(q => !resp.includes(q));
  const aceptadas = propuestasActivas().filter(x => ['v1', 'despues'].includes(proyecto.decisiones[x.id]));
  const avisos = AVISOS.filter(a => a[0].test(texto)).map(a => a[1]);
  if (aceptadas.some(x => x.dato) && !avisos.some(a => a.startsWith('Datos personales'))) avisos.push('Datos personales: la propuesta de reserva recoge nombre y teléfono de clientes. Toca revisar privacidad (RGPD): aviso, dónde se guardan, cuánto tiempo y cómo se borran. Aquí no se ha verificado qué exige exactamente tu caso.');
  if (aceptadas.some(x => x.mensajes)) avisos.push('Mensajes al cliente: tienen coste y normas del canal elegido. Sin comprobar todavía.');
  const imprescind = funcionesDe('Imprescindible').length;
  let h = '<h2>Riesgos y alcance</h2>';
  // Las preguntas avanzadas solo aparecen aquí si el usuario ha contestado alguna
  if (resp.length) h += '<p><b>' + resp.length + ' de ' + PREGUNTAS.length + '</b> preguntas avanzadas con texto. No mide la calidad de lo escrito.</p>' + (faltan.length ? '<ul>' + faltan.map(q => '<li><b>' + q[1] + ':</b> ' + q[2] + '</li>').join('') + '</ul>' : '');
  h += '<h3>Riesgos detectados en lo que escribes</h3>' + (avisos.length ? '<ul>' + avisos.map(a => '<li>' + a + '</li>').join('') + '</ul><p class="nota">Detección solo por palabras: puede avisar de lo que no aplica y no avisar de lo que sí. No sustituye a un asesor.</p>' : '<p><b>Esto no significa que no haya riesgos.</b> No he podido evaluarlos con lo escrito. Revisa siempre estos cuatro: datos personales, dinero o cobros, mensajes automáticos y cuentas de usuario.</p>');
  h += '<h3>Alcance</h3><p>' + (imprescind === 0 ? 'Aún no marcaste funciones imprescindibles (pestaña Plan).' : 'Tienes ' + imprescind + ' marcadas como imprescindibles. El número no mide la complejidad: una sola función (pagos, cuentas, tiempo real) puede ser más difícil que cinco sencillas. Pregúntate cuál es la mínima que ya sirve a un cliente real.') + '</p>';
  $('resultado-idea').innerHTML = h;
}
function recalcular() { leerCampos(); pintarRecorrido(); pintarIdea(); pintarPlan(); pintarInstrucciones(); pintarTarifa(); pintarPresupuesto(); }

/* 6a. PARTES: lo que incluye la versión 1, sacado de las decisiones del usuario. Las horas las pone él; la herramienta solo suma */
const PARTES_FIJAS = [
  ['f-diseno', 'Diseño y estructura de la app'],
  ['f-almacenamiento', 'Dónde se guardan los datos (en el navegador o en un servidor)'],
  ['f-datos', 'Datos y privacidad (aviso, guardado, borrado)'],
  ['f-pruebas', 'Pruebas con usuarios reales y correcciones'],
  ['f-puesta', 'Puesta en marcha (dominio, publicación)']];
// Referencias de horas por tarea: juicio orientativo para una versión sencilla hecha con ayuda de IA, con mucha incertidumbre
const REFS = {
  'f-diseno': [3, 8], 'f-almacenamiento': [1, 6], 'f-datos': [1, 4], 'f-pruebas': [3, 8], 'f-puesta': [1, 3],
  'f-acceso': [2, 6], 'c-editar': [2, 6],
  'r-form': [2, 5], 'r-aforo': [2, 4], 'r-estado': [1, 3], 'r-dia': [2, 4], 'r-aviso': [3, 8],
  'c-lista': [1, 3], 'c-ocultar': [1, 2], 'c-alergenos': [1, 3], 'c-qr': [1, 2], 'c-fotos': [1, 3] };
function referenciaDe(id) { return REFS[id.startsWith('p-') ? id.slice(2) : id] || null; }
// Las funciones imprescindibles son agrupadores: solo se estiman aparte si no las cubre ningún tema reconocido
function funcionesSinTema() {
  const temas = temasDetectados();
  return proyecto.funciones.filter(f => f.texto.trim() && f.prioridad === 'Imprescindible' && !temas.some(c => c.detecta.test(f.texto)));
}
function partesDecididas() {
  const v1 = propuestasActivas().filter(x => proyecto.decisiones[x.id] === 'v1').map(x => ['p-' + x.id, x.texto]);
  const fun = funcionesSinTema().map(f => ['fun-' + f.texto.trim().toLowerCase(), f.texto.trim()]);
  // Gestionar datos (ver reservas, tocar la carta) exige entrar de forma segura y poder editar: se estiman aparte
  const gestion = [];
  if (v1.length) gestion.push(['f-acceso', 'Acceso protegido a la zona de gestión (entrar de forma segura)']);
  if (v1.some(([id]) => id.indexOf('p-c-') === 0)) gestion.push(['c-editar', 'Edición de la carta por el restaurante (cambiar platos, precios y categorías)']);
  return PARTES_FIJAS.concat(gestion, v1, fun);
}
function sincronizarPartes() {
  const queridas = {};
  partesDecididas().forEach(([id, texto]) => { queridas[id] = texto; });
  for (const id in proyecto.partes) {
    if (id.startsWith('x-')) continue; // las partes añadidas a mano no se tocan
    if (!(id in queridas)) delete proyecto.partes[id];
    else proyecto.partes[id].texto = queridas[id];
  }
  for (const id in queridas) if (!(id in proyecto.partes)) proyecto.partes[id] = { texto: queridas[id], horas: '' };
}
function excluidas() {
  const dec = propuestasActivas().filter(x => ['despues', 'no'].includes(proyecto.decisiones[x.id])).map(x => x.texto);
  const fun = proyecto.funciones.filter(f => f.texto.trim() && f.prioridad !== 'Imprescindible').map(f => f.texto.trim() + ' (' + f.prioridad.toLowerCase() + ')');
  return dec.concat(fun);
}
function sumaPartes() { let s = 0; for (const id in proyecto.partes) s += parseFloat(proyecto.partes[id].horas) || 0; return s; }
function partesSinHoras() { return Object.keys(proyecto.partes).filter(id => !(parseFloat(proyecto.partes[id].horas) > 0)).length; }
function pintarSuma() {
  const s = sumaPartes(), faltan = partesSinHoras(), total = Object.keys(proyecto.partes).length, b = $('boton-usar-horas');
  if (!total) { $('suma-partes').textContent = 'Añade partes o decide la versión 1 en Idea y Plan.'; b.disabled = true; b.textContent = 'Usar estas horas'; return; }
  if (faltan) {
    $('suma-partes').textContent = 'Suma parcial: ' + s + ' h, pero faltan horas en ' + faltan + ' de ' + total + ' partes. No es la estimación completa.';
    b.disabled = true; b.textContent = 'Faltan horas en ' + faltan + ' partes';
  } else {
    $('suma-partes').textContent = 'Suma completa: ' + s + ' h (todas las partes tienen horas). No se copian solas: usa el botón si quieres llevarlas abajo.';
    b.disabled = false; b.textContent = 'Usar ' + s + ' h en horas estimadas';
  }
}
function pintarPartes() {
  sincronizarPartes();
  const agrupadores = proyecto.funciones.filter(f => f.texto.trim() && f.prioridad === 'Imprescindible').map(f => f.texto.trim());
  $('linea-v1').textContent = agrupadores.length
    ? 'Tu versión 1 según Plan: ' + agrupadores.join(', ') + '. Abajo se estima por tareas, para no contar lo mismo dos veces.'
    : 'Aún no has marcado funciones imprescindibles en Plan.';
  const cont = $('lista-partes'); cont.innerHTML = '';
  const ids = Object.keys(proyecto.partes);
  ids.forEach(id => {
    const p = proyecto.partes[id], manual = id.startsWith('x-');
    const fila = document.createElement('div'); fila.className = 'parte';
    const texto = document.createElement('div'); texto.className = 'parte-texto';
    if (manual) {
      const entrada = document.createElement('input'); entrada.value = p.texto; entrada.placeholder = 'Nombre de la parte';
      entrada.oninput = () => { p.texto = entrada.value; };
      texto.appendChild(entrada);
    } else {
      texto.textContent = p.texto;
      const ref = referenciaDe(id);
      if (ref) { const r = document.createElement('span'); r.className = 'rango'; r.textContent = 'Referencia orientativa: ' + ref[0] + '–' + ref[1] + ' h'; texto.appendChild(r); }
    }
    const horas = document.createElement('input'); horas.type = 'number'; horas.min = '0'; horas.className = 'parte-horas';
    horas.value = p.horas; horas.placeholder = 'h'; horas.title = 'Horas de esta parte (las pones tú)';
    horas.oninput = () => { p.horas = horas.value; pintarSuma(); };
    fila.append(texto, horas);
    if (manual) {
      const b = document.createElement('button'); b.className = 'borrar-fila'; b.textContent = '🗑'; b.title = 'Borrar parte';
      b.onclick = () => { delete proyecto.partes[id]; pintarPartes(); };
      fila.appendChild(b);
    }
    cont.appendChild(fila);
  });
  const ex = excluidas();
  $('lista-excluidas').innerHTML = ex.length
    ? '<ul>' + ex.map(t => '<li>' + escapar(t) + '</li>').join('') + '</ul><p class="nota">Si entra algo de esto, las horas cambian.</p>'
    : '<p class="nota">Nada marcado como «Después» o «No» en Idea, y ninguna función fuera de versión 1.</p>';
  pintarSuma();
}

/* 6b. ESCENARIO de tarifa: ingreso deseado entre horas facturables. No es una tarifa suficiente ni de mercado */
function tarifaCalculada() { const g = parseFloat(proyecto.ganarMes) || 0, h = parseFloat(proyecto.horasFacturables) || 0; return g > 0 && h > 0 ? g / h : 0; }
function pintarTarifa() {
  const t = tarifaCalculada();
  $('tarifa-orientativa').textContent = t > 0
    ? 'En ese escenario saldría a ' + t.toFixed(2).replace('.', ',') + ' €/h, antes de gastos e impuestos y contando solo las horas que cobras.'
    : 'Rellena los dos campos para ver el escenario.';
  const b = $('boton-usar-tarifa');
  b.disabled = t <= 0;
  b.textContent = t > 0 ? 'Usar ' + t.toFixed(2).replace('.', ',') + ' €/h como precio por hora' : 'Usar esta tarifa';
}

/* 7. ARRANQUE */
function mostrarPestana(id) {
  document.querySelectorAll('.pestana').forEach(b => b.classList.toggle('activa', b.dataset.pestana === id));
  document.querySelectorAll('.panel').forEach(s => s.classList.toggle('activo', s.id === id));
  if (id === 'presupuesto') pintarPartes();
}
function entrar() { $('pantalla-bienvenida').hidden = true; $('pantalla-app').hidden = false; }
cargar(); pintarCampos();
$('boton-entrar').onclick = entrar;
document.querySelectorAll('.pestana').forEach(b => b.onclick = () => mostrarPestana(b.dataset.pestana));
document.querySelectorAll('input,select,textarea').forEach(el => { if (!el.closest('.funcion') && !el.closest('.parte')) el.addEventListener('input', recalcular); });
$('boton-usar-horas').onclick = () => { const s = sumaPartes(); if (s > 0) { proyecto.horas = String(s); $('horas').value = proyecto.horas; recalcular(); mensaje('Horas copiadas; puedes seguir editándolas.'); } };
$('boton-usar-tarifa').onclick = () => { const t = tarifaCalculada(); if (t > 0) { proyecto.precioHora = String(Math.round(t * 100) / 100); $('precio-hora').value = proyecto.precioHora; recalcular(); mensaje('Tarifa copiada; puedes seguir editándola.'); } };
$('boton-anadir-parte').onclick = () => { let n = 1; while (proyecto.partes['x-' + n]) n++; proyecto.partes['x-' + n] = { texto: '', horas: '' }; pintarPartes(); };
$('boton-referencias').onclick = () => {
  let n = 0;
  for (const id in proyecto.partes) {
    const ref = referenciaDe(id);
    if (ref && !(parseFloat(proyecto.partes[id].horas) > 0)) { proyecto.partes[id].horas = String(Math.round((ref[0] + ref[1]) / 2)); n++; }
  }
  pintarPartes();
  mensaje(n ? 'Referencia aplicada a ' + n + ' parte(s) vacía(s); puedes cambiar cada una.' : 'No había partes vacías con referencia.');
};
$('boton-anadir').onclick = () => { proyecto.funciones.push({ texto: '', prioridad: 'Imprescindible' }); pintarFunciones(); };
$('boton-guardar').onclick = () => { leerCampos(); guardar(); };
$('boton-ejemplo').onclick = () => { proyecto = proyectoEjemplo(); pintarCampos(); mensaje('Ejemplo ficticio cargado (sin guardar).'); };
$('boton-borrar').onclick = () => { proyecto = proyectoVacio(); localStorage.removeItem(CLAVE); pintarCampos(); mensaje('Todo vaciado, también lo guardado.'); };
$('boton-copiar').onclick = () => { navigator.clipboard && navigator.clipboard.writeText($('resultado-instrucciones').textContent); mensaje('Instrucciones copiadas.'); };
