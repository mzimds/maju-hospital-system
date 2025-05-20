class PlantaoManager {
    constructor() {
        this.registros = JSON.parse(localStorage.getItem('registros')) || [];
        this.initElements();
        this.initEventos();
        this.atualizarInterface();
        this.atualizarHorario();
    }

    initElements() {
        this.elements = {
            btnNovo: document.getElementById('btn-novo'),
            btnEncerrar: document.getElementById('btn-encerrar'),
            btnCancelar: document.querySelector('.btn-cancelar'),
            modal: document.getElementById('modal'),
            form: document.getElementById('form'),
            registrosContainer: document.getElementById('registros'),
            horarioInicio: document.getElementById('horario-inicio')
        };
    }

    initEventos() {
        // Evento para abrir modal
        this.elements.btnNovo.addEventListener('click', () => this.abrirModal());
        
        // Evento para encerrar plantão
        this.elements.btnEncerrar.addEventListener('click', () => this.encerrarPlantao());
        
        // Evento para cancelar registro
        this.elements.btnCancelar.addEventListener('click', () => this.fecharModal());
        
        // Evento para salvar registro
        this.elements.form.addEventListener('submit', (e) => this.salvarRegistro(e));
    }

    abrirModal() {
        this.elements.modal.style.display = 'flex';
    }

    fecharModal() {
        this.elements.modal.style.display = 'none';
        this.elements.form.reset();
    }

    salvarRegistro(e) {
        e.preventDefault();
        const paciente = document.getElementById('paciente').value.trim();
        const ocorrencia = document.getElementById('ocorrencia').value.trim();

        if(paciente && ocorrencia) {
            this.registros.unshift({
                id: Date.now(),
                paciente,
                ocorrencia,
                data: new Date().toLocaleString('pt-BR'),
                autor: "Enf. Responsável"
            });
            
            this.salvarLocalStorage();
            this.atualizarInterface();
            this.fecharModal();
        }
    }

    encerrarPlantao() {
        if(confirm('Tem certeza que deseja encerrar o plantão?')) {
            localStorage.removeItem('registros');
            this.registros = [];
            this.atualizarInterface();
        }
    }

    atualizarInterface() {
        this.elements.registrosContainer.innerHTML = this.registros
            .map(registro => `
                <div class="registro-card">
                    <h3>${registro.paciente}</h3>
                    <p>${registro.ocorrencia}</p>
                    <small>${registro.data} - ${registro.autor}</small>
                </div>
            `).join('');
    }

    atualizarHorario() {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        this.elements.horarioInicio.textContent = new Date().toLocaleString('pt-BR', options);
    }

    salvarLocalStorage() {
        localStorage.setItem('registros', JSON.stringify(this.registros));
    }
}

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', () => new PlantaoManager());