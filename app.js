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
            statusTexto: document.getElementById('status-texto')
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
            if(e.target.classList.contains('btn-cancelar') || e.target.classList.contains('modal')) {
                this.fecharModal();
            }
        });

        // CORREÇÃO CRÍTICA: Delegando evento para o container de registros
        this.elements.registrosContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-acrescentar')) {
                const registroId = parseInt(e.target.dataset.id);
                this.registroSelecionado = this.plantaoAtivo.registros.find(r => r.id === registroId);
                if (this.registroSelecionado) {
                    this.abrirModalAcrescentar();
                }
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
        if (!this.plantaoAtivo.ativo) {
            this.iniciarPlantao();
        }
        this.elements.modal.style.display = 'flex';
    }

    abrirModalAcrescentar() {
        // Criar o modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'modal-acrescentar';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>➕ Nova Informação</h2>
                <form id="form-acrescentar">
                    <div class="form-group">
                        <textarea 
                            id="input-acrescentar" 
                            placeholder="Descreva a nova ocorrência..." 
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <div class="modal-botoes">
                        <button type="button" class="btn-cancelar">Cancelar</button>
                        <button type="submit" class="btn-salvar">Salvar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar eventos para o novo modal
        const form = modal.querySelector('#form-acrescentar');
        const btnCancelar = modal.querySelector('.btn-cancelar');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const texto = modal.querySelector('#input-acrescentar').value.trim();
            
            if (texto) {
                this.registroSelecionado.historico.push({
                    texto,
                    data: new Date().toLocaleString('pt-BR'),
                    autor: "Enf. Responsável"
                });
                
                this.salvarLocalStorage();
                this.atualizarInterface();
                modal.remove();
            }
        });
        
        btnCancelar.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    salvarRegistro(e) {
        e.preventDefault();
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

// CORREÇÃO FINAL: Instância única após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
    const plantao = new PlantaoManager();
});
