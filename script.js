const dados = {
    'Treino A': [
        { n: "Supino Reto na Barra", d: "Desça a barra até o peito e suba controladamente.", v: "sqOw2Y6uDWQ" },
        { n: "Peitoral Voador", d: "Feche os braços focando na contração do peitoral.", v: "eGjt4P-UunE" },
        { n: "Encolhimento de Ombros", d: "Suba os ombros sem girar, foco no trapézio.", v: "K_pMofU0XGk" },
        { n: "Desenvolvimento c/ Halteres", d: "Empurre os halteres acima da cabeça.", v: "M2rwvNhS90c" },
        { n: "Tríceps Corda no Cross Over", d: "Mantenha cotovelos fixos, abra a corda embaixo.", v: "6YmZ009N5_M" },
        { n: "Tríceps Francês Unilateral", d: "Flexão de cotovelo com o braço acima da cabeça.", v: "49zKsc_FqF0" },
        { n: "Tríceps Pulley", d: "Extensão de braço no cabo com barra reta.", v: "Zp6_V_G_24E" },
        { n: "Abdominal Canivete", d: "Encontre mãos e pés no topo do movimento.", v: "Z4uWnL7E5v0" }
    ],
    'Treino B': [
        { n: "Agachamento Barra Guiada", d: "Agache mantendo a coluna reta e pés firmes.", v: "6_uVq8SUp0I" },
        { n: "Leg Press 45", d: "Empurre a plataforma sem esticar totalmente o joelho.", v: "E6M8L4D3u_M" },
        { n: "Banco Extensor", d: "Chute para cima focando no quadríceps.", v: "6u4mZfM_H8o" },
        { n: "Banco Flexor", d: "Puxe o rolo em direção ao glúteo.", v: "O-2j9YnBfSc" },
        { n: "Banco Abdutor", d: "Abra as pernas contra a resistência da máquina.", v: "U-6Y0Y_rX2I" },
        { n: "Banco Adutor", d: "Feche as pernas focando na parte interna da coxa.", v: "6u4mZfM_H8o" },
        { n: "Panturrilha Vertical", d: "Movimento de ponta de pé máximo.", v: "X8m_v7_6zGk" },
        { n: "Abdominal Oblíquo de Lado", d: "Flexão lateral do tronco no solo.", v: "Z4uWnL7E5v0" }
    ],
    'Treino C': [
        { n: "Pulley Frente Aberta", d: "Puxe a barra até o peito, abrindo as costas.", v: "6u4_mI_A_u0" },
        { n: "Pulldown Máquina", d: "Puxe focando na grande dorsal.", v: "6u4mYmN_8u0" },
        { n: "Remada Baixa Neutra", d: "Puxe o triângulo em direção ao umbigo.", v: "6u4mZfM_H8o" },
        { n: "Rosca Scott Aparelho", d: "Flexão de braço isolada no banco scott.", v: "O-2j9YnBfSc" },
        { n: "Rosca Alternada", d: "Flexão de braço alternando os lados.", v: "X8m_v7_6zGk" },
        { n: "Rosca Martelo", d: "Pegada neutra, foco no braquial.", v: "X8m_v7_6zGk" },
        { n: "Desenvolvimento Aparelho", d: "Empurre os braços da máquina para cima.", v: "M2rwvNhS90c" },
        { n: "Abdominal Infra na Paralela", d: "Eleve as pernas suspenso na paralela.", v: "Z4uWnL7E5v0" },
        { n: "Abdominal Supra Aparelho", d: "Flexão de tronco na máquina.", v: "Z4uWnL7E5v0" }
    ]
};

const container = document.getElementById('treino-container');

Object.keys(dados).forEach(treinoNome => {
    let html = `<button class="treino-btn" onclick="toggleView(this)">${treinoNome}</button><div class="panel-treino" style="display:none">`;
    
    dados[treinoNome].forEach((ex, i) => {
        const id = `${treinoNome}-${i}`.replace(/\s+/g, '');
        const peso = localStorage.getItem(`peso-${id}`) || "";
        
        html += `
        <div class="ex-item" id="item-${id}">
            <div class="ex-header">
                <span class="ex-name" onclick="toggleEx('${id}')">${ex.n}</span>
                <div class="input-row">
                    <input type="number" value="${peso}" placeholder="Kg" onchange="localStorage.setItem('peso-${id}', this.value)">
                </div>
                <button class="btn-check" onclick="toggleDone('${id}')">✅</button>
            </div>
            <div class="ex-content" id="content-${id}">
                <p>${ex.d}</p>
                <div class="video-wrap">
                    <iframe src="https://www.youtube.com/embed/${ex.v}" allowfullscreen></iframe>
                </div>
            </div>
        </div>`;
    });
    
    html += `</div>`;
    container.innerHTML += html;
});

function toggleView(btn) {
    const panel = btn.nextElementSibling;
    panel.style.display = panel.style.display === "block" ? "none" : "block";
}

function toggleEx(id) {
    const content = document.getElementById(`content-${id}`);
    content.style.display = content.style.display === "block" ? "none" : "block";
}

function toggleDone(id) {
    document.getElementById(`item-${id}`).classList.toggle('ex-done');
}