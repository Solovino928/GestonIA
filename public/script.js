const TOPE_VALES = 1376.00;
const TOPE_FONDO = 4471.00;
const TASA_IMSS_OBRERO = 0.0163;
const TASA_IMSS_PATRONAL = 0.14;

let datosCalculados = {};

document.getElementById('sueldo-bruto-input').addEventListener('input', calcularNomina);
document.getElementById('aumento-input').addEventListener('input', calcularNomina);

const TABLA_ISR_MENSUAL = [
    { limiteInferior: 0.01,   limiteSuperior: 844.59,   cuotaFija: 0.00,     porcentaje: 1.92 },
    { limiteInferior: 844.60,  limiteSuperior: 7168.51,  cuotaFija: 16.22,    porcentaje: 6.40 },
    { limiteInferior: 7168.52, limiteSuperior: 12598.02, cuotaFija: 420.95,   porcentaje: 10.88 },
    { limiteInferior: 12598.03,limiteSuperior: 14644.64, cuotaFija: 1011.68,  porcentaje: 16.00 },
    { limiteInferior: 14644.65,limiteSuperior: 17533.64, cuotaFija: 1339.14,  porcentaje: 17.92 },
    { limiteInferior: 17533.65,limiteSuperior: 35362.83, cuotaFija: 1856.84,  porcentaje: 21.36 },
    { limiteInferior: 35362.84,limiteSuperior: 55736.68, cuotaFija: 5665.16,  porcentaje: 23.52 },
    { limiteInferior: 55736.69,limiteSuperior: 106410.50,cuotaFija: 10457.09, porcentaje: 30.00 },
    { limiteInferior: 106410.51,limiteSuperior: 141880.66,cuotaFija: 25659.23, porcentaje: 32.00 },
    { limiteInferior: 141880.67,limiteSuperior: 425641.99,cuotaFija: 37009.69, porcentaje: 34.00 },
    { limiteInferior: 425642.00,limiteSuperior: Infinity, cuotaFija: 133488.54,porcentaje: 35.00 }
];

function calcularISRReal(sueldoBruto) {
    if (!sueldoBruto || sueldoBruto <= 0) return 0;
    let rangoEncontrado = TABLA_ISR_MENSUAL[TABLA_ISR_MENSUAL.length - 1];

    for (const rango of TABLA_ISR_MENSUAL) {
        if (sueldoBruto >= rango.limiteInferior && sueldoBruto <= rango.limiteSuperior) {
            rangoEncontrado = rango;
            break;
        }
    }

    const excedente = sueldoBruto - rangoEncontrado.limiteInferior;
    const impuestoExcedente = excedente * (rangoEncontrado.porcentaje / 100);
    return +(rangoEncontrado.cuotaFija + impuestoExcedente).toFixed(2);
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
}

function calcularNomina() {
    const sbInicial = parseFloat(document.getElementById('sueldo-bruto-input').value) || 0;
    const aumento = parseFloat(document.getElementById('aumento-input').value) || 0;

    // ESCENARIO 1
    const e1_sb = sbInicial;
    const e1_vales = 0;
    const e1_fondo = 0;
    const e1_sbtotal = e1_sb;
    const e1_isr = calcularISRReal(e1_sb);
    const e1_imss = +(e1_sb * TASA_IMSS_OBRERO).toFixed(2);
    const e1_deducciones = +(e1_isr + e1_imss).toFixed(2);
    const e1_neto = +(e1_sbtotal - e1_deducciones).toFixed(2);
    const e1_patronal = +(e1_sb * TASA_IMSS_PATRONAL).toFixed(2);

    // ESCENARIO 2
    const e2_sb = sbInicial + aumento;
    const e2_vales = 0;
    const e2_fondo = 0;
    const e2_sbtotal = e2_sb;
    const e2_isr = calcularISRReal(e2_sb);
    const e2_imss = +(e2_sb * TASA_IMSS_OBRERO).toFixed(2);
    const e2_deducciones = +(e2_isr + e2_imss).toFixed(2);
    const e2_neto = +(e2_sbtotal - e2_deducciones).toFixed(2);
    const e2_patronal = +(e2_sb * TASA_IMSS_PATRONAL).toFixed(2);

    // ESCENARIO 3
    let restoAumento = aumento;
    const e3_vales = Math.min(restoAumento, TOPE_VALES);
    restoAumento -= e3_vales;
    const e3_fondo = Math.min(restoAumento, TOPE_FONDO);
    restoAumento -= e3_fondo;

    const e3_sb = sbInicial + restoAumento;
    const e3_sbtotal = e3_sb + e3_vales + e3_fondo;
    const e3_isr = calcularISRReal(e3_sb);
    const e3_imss = +(e3_sb * TASA_IMSS_OBRERO).toFixed(2);
    const e3_deducciones = +(e3_isr + e3_imss).toFixed(2);
    const e3_neto = +(e3_sbtotal - e3_deducciones).toFixed(2);
    const e3_patronal = +(e3_sb * TASA_IMSS_PATRONAL).toFixed(2);

    // DIFERENCIAS EXCLUSIVAS DE DEDUCCIONES (Escenario 2 vs Escenario 3)
    const dif_isr = +(e2_isr - e3_isr).toFixed(2);
    const dif_imss = +(e2_imss - e3_imss).toFixed(2);
    const dif_deducciones = +(e2_deducciones - e3_deducciones).toFixed(2);
    const dif_patronal = +(e2_patronal - e3_patronal).toFixed(2);
    const dif_neto = +(e3_neto - e2_neto).toFixed(2);

    datosCalculados = {
        inputs: { sueldoInicial: sbInicial, aumentoBono: aumento },
        diferencias: { isr: dif_isr, imss: dif_imss, totalDeducciones: dif_deducciones, neto: dif_neto, patronal: dif_patronal },
        e1: { sbBase: e1_sb, vales: e1_vales, fondo: e1_fondo, sbTotal: e1_sbtotal, isr: e1_isr, imss: e1_imss, deducciones: e1_deducciones, neto: e1_neto, patronal: e1_patronal },
        e2: { sbBase: e2_sb, vales: e2_vales, fondo: e2_fondo, sbTotal: e2_sbtotal, isr: e2_isr, imss: e2_imss, deducciones: e2_deducciones, neto: e2_neto, patronal: e2_patronal },
        e3: { sbBase: e3_sb, vales: e3_vales, fondo: e3_fondo, sbTotal: e3_sbtotal, isr: e3_isr, imss: e3_imss, deducciones: e3_deducciones, neto: e3_neto, patronal: e3_patronal }
    };

    document.getElementById('e1-sb').innerText = formatearMoneda(e1_sb);
    document.getElementById('e1-vales').innerText = formatearMoneda(e1_vales);
    document.getElementById('e1-fondo').innerText = formatearMoneda(e1_fondo);
    document.getElementById('e1-total-s').innerText = formatearMoneda(e1_sbtotal);
    document.getElementById('e1-isr').innerText = formatearMoneda(e1_isr);
    document.getElementById('e1-imss').innerText = formatearMoneda(e1_imss);
    document.getElementById('e1-suma-ded').innerText = formatearMoneda(e1_deducciones);
    document.getElementById('e1-neto').innerText = formatearMoneda(e1_neto);
    document.getElementById('e1-patronal').innerText = formatearMoneda(e1_patronal);

    document.getElementById('e2-sb').innerText = formatearMoneda(e2_sb);
    document.getElementById('e2-vales').innerText = formatearMoneda(e2_vales);
    document.getElementById('e2-fondo').innerText = formatearMoneda(e2_fondo);
    document.getElementById('e2-total-s').innerText = formatearMoneda(e2_sbtotal);
    document.getElementById('e2-isr').innerText = formatearMoneda(e2_isr);
    document.getElementById('e2-imss').innerText = formatearMoneda(e2_imss);
    document.getElementById('e2-suma-ded').innerText = formatearMoneda(e2_deducciones);
    document.getElementById('e2-neto').innerText = formatearMoneda(e2_neto);
    document.getElementById('e2-patronal').innerText = formatearMoneda(e2_patronal);

    document.getElementById('e3-sb').innerText = formatearMoneda(e3_sb);
    document.getElementById('e3-vales').innerText = formatearMoneda(e3_vales);
    document.getElementById('e3-fondo').innerText = formatearMoneda(e3_fondo);
    document.getElementById('e3-total-s').innerText = formatearMoneda(e3_sbtotal);
    document.getElementById('e3-isr').innerText = formatearMoneda(e3_isr);
    document.getElementById('e3-imss').innerText = formatearMoneda(e3_imss);
    document.getElementById('e3-suma-ded').innerText = formatearMoneda(e3_deducciones);
    document.getElementById('e3-neto').innerText = formatearMoneda(e3_neto);
    document.getElementById('e3-patronal').innerText = formatearMoneda(e3_patronal);

    document.getElementById('dif-isr').innerText = formatearMoneda(dif_isr);
    document.getElementById('dif-imss').innerText = formatearMoneda(dif_imss);
    document.getElementById('dif-suma-ded').innerText = formatearMoneda(dif_deducciones);
    document.getElementById('dif-neto').innerText = formatearMoneda(dif_neto);
    document.getElementById('dif-patronal').innerText = formatearMoneda(dif_patronal);
}

calcularNomina();

const chatBox = document.getElementById("chat-box");

function escapeHTML(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatChatText(text) {
    let result = escapeHTML(text);
    result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\r?\n/g, "<br>");
    return result;
}

function addMessage(text, sender) {
    const div = document.createElement("div");
    div.classList.add("message", sender);
    div.innerHTML = formatChatText(text);
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value;
    if (!message) return;

    addMessage("Tú: " + message, "user");
    input.value = "";

    const systemPrompt = `Eres un experto en contaduría en México. Responde de forma concisa analizando la tabla.
Sueldo Inicial: $${datosCalculados.inputs.sueldoInicial} | Bono: $${datosCalculados.inputs.aumentoBono}
Ahorros en Deducciones (E2 vs E3):
- ISR: $${datosCalculados.diferencias.isr} | IMSS Obrero: $${datosCalculados.diferencias.imss}
- Ganancia Extra Neta: $${datosCalculados.diferencias.neto} | Ahorro Patronal: $${datosCalculados.diferencias.patronal}
Pregunta del usuario: ${message}`;

    try {
        // Apuntamos a la Cloud Function de Firebase de forma segura e interna
        const response = await fetch("/preguntarContador", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ systemPrompt: systemPrompt })
        });
        const data = await response.json();
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
        addMessage("Contador 👨🏻‍💼: " + botReply, "bot");
    } catch (error) {
        addMessage("Contador 👨🏻‍💼: Error de conexión con el servidor", "bot");
    }
}

document.getElementById('user-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        sendMessage();
    }
});