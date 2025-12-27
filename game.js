const state = {
    doorClosed: false,
    windowClosed: false,
    monitorOpen: false,
    temperature: 25,
    isCooling: false,
    currentCam: 1,
    hour: 0,
    power: 100,
    extremeTempTimer: 0,
    // Posições (6 = Longe, 0 = Escritório)
    freddyPos: 6,
    babyPos: 5,
    springPos: 4
};

// --- CONTROLES ---
document.getElementById('btn-door').addEventListener('pointerdown', () => {
    state.doorClosed = !state.doorClosed;
    document.getElementById('door-right').classList.toggle('closed');
});

document.getElementById('btn-window').addEventListener('pointerdown', () => {
    state.windowClosed = !state.windowClosed;
    document.getElementById('window').classList.toggle('closed');
});

document.getElementById('btn-monitor').addEventListener('pointerdown', toggleMonitor);

function toggleMonitor() {
    state.monitorOpen = !state.monitorOpen;
    document.getElementById('camera-monitor').style.display = state.monitorOpen ? 'flex' : 'none';
}

document.getElementById('btn-temp').addEventListener('pointerdown', () => {
    state.isCooling = !state.isCooling;
    document.getElementById('btn-temp').style.background = state.isCooling ? "#004466" : "#111";
});

document.getElementById('btn-audio').addEventListener('pointerdown', () => {
    // Springbonnie é atraído para a câmera atual
    state.springPos = parseInt(state.currentCam);
    document.getElementById('office-status').innerText = "ÁUDIO TOCADO NA CAM " + state.currentCam;
});

document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
        state.currentCam = e.target.dataset.cam;
        document.getElementById('cam-name').innerText = "CAM 0" + state.currentCam;
    });
});

// --- LÓGICA PRINCIPAL (Loop de 1 segundo) ---
setInterval(() => {
    // 1. Gestão de Energia
    let drain = 0.05;
    if (state.doorClosed) drain += 0.3;
    if (state.windowClosed) drain += 0.3;
    if (state.monitorOpen) drain += 0.1;
    
    // Recarga na CAM 4
    if (state.monitorOpen && state.currentCam == 4) {
        state.power = Math.min(100, state.power + 0.8);
        document.getElementById('office-status').innerText = "RECARREGANDO...";
    } else {
        state.power -= drain;
    }
    
    document.getElementById('power-display').innerText = `BATERIA: ${Math.floor(state.power)}%`;

    if (state.power <= 0) gameOver("FALTA DE ENERGIA");

    // 2. Lógica de Temperatura
    state.temperature += state.isCooling ? -2 : 1;
    document.getElementById('temp-display').innerText = `TEMP: ${state.temperature}°C`;

    if (state.temperature <= 0 || state.temperature >= 50) {
        state.extremeTempTimer++;
        document.getElementById('visual-feedback').classList.add('danger-flash');
        if (state.extremeTempTimer >= 60) gameOver("SISTEMA DERRETEU/CONGELOU");
    } else {
        state.extremeTempTimer = 0;
        document.getElementById('visual-feedback').classList.remove('danger-flash');
    }

    // 3. Mecânica da Circus Baby (Janela + Frio)
    if (state.babyPos === 0) {
        document.getElementById('window').innerText = "BABY ESTÁ AQUI!";
        if (state.temperature <= 10 && state.isCooling) {
            // Se ficar frio por tempo suficiente (simulado por sorte aqui ou timer)
            if(Math.random() > 0.7) {
                state.babyPos = 5;
                document.getElementById('window').innerText = "JANELA (CENTRO)";
            }
        } else if (!state.windowClosed && Math.random() > 0.95) {
            gameOver("CIRCUS BABY");
        }
    }

    // 4. Movimentação dos Animatrônicos
    if (Math.random() > 0.8) {
        if (state.freddyPos > 0) state.freddyPos--;
        else if (!state.doorClosed) gameOver("FREDDY");
        else state.freddyPos = 6; // Freddy volta se porta fechada
    }

    if (Math.random() > 0.9) {
        if (state.babyPos > 0) state.babyPos--;
    }

    if (Math.random() > 0.85) {
        if (state.springPos < 6) state.springPos++; // Ele tenta chegar no escritório (pos 0)
        // Springbonnie é atraído pelo áudio, então sua "pos" é manipulada pelo botão de áudio
        if (state.springPos <= 0 && !state.doorClosed) gameOver("SPRINGBONNIE");
    }

}, 1000);

// --- RELÓGIO (1h = 60s) ---
setInterval(() => {
    state.hour++;
    document.getElementById('clock').innerText = state.hour + " AM";
    if (state.hour >= 6) {
        alert("6 AM! VOCÊ SOBREVIVEU!");
        location.reload();
    }
}, 60000);

function gameOver(reason) {
    alert("JUMPSCARE: " + reason + "! Fim de jogo.");
    location.reload();
}
