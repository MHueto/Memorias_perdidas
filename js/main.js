const btnJogar = document.querySelector('#btn-jogar');
const btnControles = document.querySelector('.b3');
const notificacao = document.querySelector('#notificacao-controles');

const modalJogar = document.querySelector('#modal-jogar');
const modalSlots = document.querySelector('#modal-slots');

// Botões do modal de jogo
const btnContinuar = document.querySelector('.btn-continuar');
const btnNovoJogo = document.querySelector('.btn-novo-jogo');
const btnFecharModal = document.querySelectorAll('.fechar-modal');

// Sistema de Saves
const defaultSaves = {
    slot1: null,
    slot2: null,
    slot3: null,
    lastSlot: null
};

let gameSaves = { ...defaultSaves };
try {
    const saved = JSON.parse(localStorage.getItem('gameSaves'));
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) gameSaves = { ...defaultSaves, ...saved };
} catch { /* Um save inválido não deve impedir o acesso ao menu da campanha. */ }

function saveGameData(slot, data) {
    gameSaves[slot] = data;
    gameSaves.lastSlot = slot;
    localStorage.setItem('gameSaves', JSON.stringify(gameSaves));
}

// Abrir Menu Jogar
btnJogar.addEventListener('click', () => {
    modalJogar.classList.add('ativo');
});

// Botão Continuar
btnContinuar.addEventListener('click', () => {
    const campaign = window.RomaCampaign.snapshot();
    if (campaign.completed.length || Object.values(campaign.eras).some(era => era.started)) {
        window.location.href = 'campanha-roma.html';
        return;
    }
    const ultimoSlot = gameSaves.lastSlot;
    if (ultimoSlot && gameSaves[ultimoSlot]) {
        window.location.href = 'teste-escola.html';
    } else {
        alert('Nenhum jogo salvo para continuar! Comece um novo jogo.');
        modalJogar.classList.remove('ativo');
        modalSlots.classList.add('ativo');
    }
});

// Botão Novo Jogo
document.querySelector('#btn-campanha-roma').addEventListener('click', () => {
    window.location.href = 'campanha-roma.html';
});

btnNovoJogo.addEventListener('click', () => {
    modalJogar.classList.remove('ativo');
    modalSlots.classList.add('ativo');
});

// Seleção de Slot
document.querySelectorAll('.slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const slot = btn.getAttribute('data-slot');
        const slotId = 'slot' + slot;

        if (gameSaves[slotId]) {
            if (!confirm(`O ${slotId} já tem um jogo. Deseja apagar e começar do zero?`)) {
                return;
            }
        }

        saveGameData(slotId, { level: 1, progress: 0 }); // Salvando dados iniciais
        window.location.href = 'teste-escola.html';
    });
});

// Fechar Modais
btnFecharModal.forEach(btn => {
    btn.addEventListener('click', () => {
        modalJogar.classList.remove('ativo');
        modalSlots.classList.remove('ativo');
    });
});

// Lógica de Controles (Original)
btnControles.addEventListener('click', function() {
    notificacao.classList.toggle('mostrar');
});
