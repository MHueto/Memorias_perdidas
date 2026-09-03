const modalConfig = document.querySelector('#modal-config');
const botaoConfig = document.querySelector('button.b2');
const botaoFechar = document.querySelector('.fechar-config');
const volumeInput = document.querySelector('#volume');
const btnMudo = document.querySelector('#btn-mudo');

// Configurações padrão
const defaultControls = {
    esquerda: 'ArrowLeft',
    direita: 'ArrowRight',
    pular: 'ArrowUp',
    volume: 50,
    mudo: false
};

// Carregar configurações do localStorage ou usar as padrão
let userSettings = JSON.parse(localStorage.getItem('gameSettings')) || { ...defaultControls };

// Função para salvar configurações
function saveSettings() {
    localStorage.setItem('gameSettings', JSON.stringify(userSettings));
}

// Atualizar a interface com as configurações carregadas
function updateUI() {
    // Atualiza volume
    if (volumeInput) {
        volumeInput.value = userSettings.volume;
    }

    // Atualiza botão mudo
    if (btnMudo) {
        btnMudo.textContent = userSettings.mudo ? '🔇' : '🔊';
    }

    // Atualiza botões de teclas
    document.querySelectorAll('.rebind-btn').forEach(btn => {
        const acao = btn.getAttribute('data-acao');
        if (userSettings[acao]) {
            btn.textContent = userSettings[acao] === ' ' ? 'Espaço' : userSettings[acao];
        }
    });
}

// Eventos do Modal de Configurações
botaoConfig.addEventListener('click', () => {
    modalConfig.classList.add('ativo');
});

botaoFechar.addEventListener('click', () => {
    modalConfig.classList.remove('ativo');
});

modalConfig.addEventListener('click', (e) => {
    if (e.target === modalConfig) {
        modalConfig.classList.remove('ativo');
    }
});

// Controle de Volume
volumeInput.addEventListener('input', (e) => {
    userSettings.volume = e.target.value;
    saveSettings();
});

// Botão de Mudo Rápido
btnMudo.addEventListener('click', () => {
    userSettings.mudo = !userSettings.mudo;
    saveSettings();
    updateUI();

    // Aqui você integraria com o seu sistema de áudio:
    // if (userSettings.mudo) { AudioContext.suspend(); } else { AudioContext.resume(); }
});

// Lógica de Troca de Controles (Rebind)
let activeAction = null;
let activeButton = null;

document.querySelectorAll('.rebind-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        activeAction = btn.getAttribute('data-acao');
        activeButton = btn;
        btn.textContent = '...';
        btn.classList.add('aguardando');
    });
});

window.addEventListener('keydown', (e) => {
    if (activeAction) {
        e.preventDefault();

        const novaTecla = e.code;
        userSettings[activeAction] = novaTecla;

        saveSettings();
        updateUI();

        activeAction = null;
        if (activeButton) {
            activeButton.classList.remove('aguardando');
            activeButton = null;
        }
    }
});

// Inicialização
updateUI();
