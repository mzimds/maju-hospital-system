class PlantaoManager {
    constructor() {
        this.plantaoAtivo = {
            ativo: JSON.parse(localStorage.getItem('plantaoAtivo')) ?? true,
            registros: JSON.parse(localStorage.getItem('registros')) || [],
            historico: JSON.parse(localStorage.getItem('historicoPlantao')) || []
        };
        this.registroSelecionado = null;
        this.initElements();
        this.initEventos();
        this.atualizarInterface();
        this.atualizarHorario();
        this.atualizarStatusPlantao();
    }

    initElements() {
        this.elements = {
            btnNovo: document.getElementById('btn-novo'),
            btnEncerrar: document.getElementById('btn-encerrar'),
            modal: document.getElementById('modal'),
            form: document.getElementById('form'),
            registrosContainer: document.getElementById('registros'),
            horarioInicio: document.getElementById('horario-inicio'),
            statusElement: document.querySelector('.status'),
            statusTexto: document.getElementById('status-texto'),
            modalAcrescentar: document.getElementById('modal-acrescentar'),
            formAcrescentar: document.getElementById('form-acrescentar'),
            inputAcrescentar: document.getElementById('input-acrescentar')
        };
    }

    initEventos() {
        // Botão Novo Registro
        this.elements.btnNovo.addEventListener('click', () => this.abrirModal());
        
        // Botão Encerrar/Iniciar Plantão
        this.elements.btnEncerrar.addEventListener('click', () => {
            this.plantaoAtivo.ativo ? this.encerrarPlantao() : this.iniciarPlantao();
        });

        // Formulário de Novo Registro
        this.elements.form.addEventListener('submit', (e) => this.salvarRegistro(e));
        
        // Fechar Modal Principal
        this.elements.modal.addEventListener('click', (e) => {
            if(e.target.classList.contains('btn-cancelar') || e.target === this.elements.modal) {
                this.fecharModal();
            }
        });

        // Evento para o botão "Acrescentar informação"
        this.elements.registrosContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-acrescentar')) {
                const registroId = parseInt(e.target.dataset.id);
                this.registroSelecionado = this.plantaoAtivo.registros.find(r => r.id === registroId);
                this.abrirModalAcrescentar();
            }
        });

        // Eventos para o modal de acréscimo
        document.addEventListener('click', (e) => {
            // Fechar modal de acréscimo
            if (e.target.classList.contains('btn-cancelar-acrescentar') || 
                e.target.classList.contains('modal-acrescentar')) {
                this.fecharModalAcrescentar();
            }
            
            // Salvar acréscimo
            if (e.target.classList.contains('btn-salvar-acrescentar')) {
                e.preventDefault();
                this.salvarAcrescimo();
            }
        });
    }

    atualizarStatusPlantao() {
        if(this.plantaoAtivo.ativo) {
            this.elements.statusElement.classList.remove('inativo');
            this.elements.statusElement.classList.add('ativo');
            this.elements.statusTexto.textContent = 'Plantão Ativo';
            this.elements.btnEncerrar.textContent = 'Encerrar';
            this.elements.btnEncerrar.style.color = '#e74c3c';
        } else {
            this.elements.statusElement.classList.remove('ativo');
            this.elements.statusElement.classList.add('inativo');
            this.elements.statusTexto.textContent = 'Plantão Inativo';
            this.elements.btnEncerrar.textContent = 'Iniciar';
            this.elements.btnEncerrar.style.color = '#2ecc71';
        }
    }

    encerrarPlantao() {
        if(confirm('Deseja realmente encerrar o plantão?')) {
            this.plantaoAtivo.ativo = false;
            this.plantaoAtivo.historico.push({
                data: new Date().toLocaleString('pt-BR'),
                registros: this.plantaoAtivo.registros
            });
            this.plantaoAtivo.registros = [];
            this.salvarLocalStorage();
            this.atualizarInterface();
            this.atualizarStatusPlantao();
        }
    }

    iniciarPlantao() {
        this.plantaoAtivo.ativo = true;
        this.salvarLocalStorage();
        this.atualizarStatusPlantao();
    }

    salvarLocalStorage() {
        localStorage.setItem('plantaoAtivo', JSON.stringify(this.plantaoAtivo.ativo));
        localStorage.setItem('registros', JSON.stringify(this.plantaoAtivo.registros));
        localStorage.setItem('historicoPlantao', JSON.stringify(this.plantaoAtivo.historico));
    }

    abrirModal() {
        this.elements.modal.style.display = 'flex';
    }

    abrirModalAcrescentar() {
        this.elements.modalAcrescentar.style.display = 'flex';
        this.elements.inputAcrescentar.focus();
    }

    fecharModalAcrescentar() {
        this.elements.modalAcrescentar.style.display = 'none';
        this.elements.inputAcrescentar.value = '';
    }

    salvarRegistro(e) {
        e.preventDefault();
        
        // Inicia plantão apenas ao salvar registro
        if (!this.plantaoAtivo.ativo) {
            this.iniciarPlantao();
        }
        
        const novoRegistro = {
            id: Date.now(),
            paciente: document.getElementById('paciente').value.trim(),
            historico: [{
                texto: document.getElementById('ocorrencia').value.trim(),
                data: new Date().toLocaleString('pt-BR'),
                autor: "Enf. Responsável"
            }]
        };

        this.plantaoAtivo.registros.unshift(novoRegistro);
        this.salvarLocalStorage();
        this.fecharModal();
        this.atualizarInterface();
    }

    salvarAcrescimo() {
        const texto = document.getElementById('input-acrescentar').value.trim();
        
        if (texto && this.registroSelecionado) {
            this.registroSelecionado.historico.push({
                texto,
                data: new Date().toLocaleString('pt-BR'),
                autor: "Enf. Responsável"
            });
            
            this.salvarLocalStorage();
            this.atualizarInterface();
            this.fecharModalAcrescentar();
        }
    }

    atualizarInterface() {
        this.elements.registrosContainer.innerHTML = this.plantaoAtivo.registros.length > 0 
            ? this.plantaoAtivo.registros.map(registro => `
                <div class="registro-card">
                    <div class="cabecalho-registro">
                        <h3>${registro.paciente}</h3>
                        <button 
                            class="btn-acrescentar" 
                            data-id="${registro.id}"
                            title="Acrescentar informação"
                        >+</button>
                    </div>
                    <div class="historico-registro">
                        ${registro.historico.map(entry => `
                            <div class="entrada-registro">
                                <p>${entry.texto}</p>
                                <small>${entry.autor} - ${entry.data}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')
            : '<div class="sem-registros">Nenhum registro encontrado</div>';
    }

    fecharModal() {
        this.elements.modal.style.display = 'none';
        this.elements.form.reset();
    }

    atualizarHorario() {
        this.elements.horarioInicio.textContent = new Date().toLocaleString('pt-BR');
        setInterval(() => {
            this.elements.horarioInicio.textContent = new Date().toLocaleString('pt-BR');
        }, 1000);
    }
}

// Inicialização após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
    const plantao = new PlantaoManager();
});
