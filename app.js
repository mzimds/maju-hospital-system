class PlantaoManager {
    constructor() {
        this.plantaoAtivo = {
            ativo: JSON.parse(localStorage.getItem('plantaoAtivo')) ?? true,
            registros: JSON.parse(localStorage.getItem('registros')) || [],
            historico: JSON.parse(localStorage.getItem('historicoPlantao')) || [],
            dataInicio: JSON.parse(localStorage.getItem('dataInicio')) || new Date().toISOString()
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
            historicoContainer: document.getElementById('historico-plantao'),
            horarioInicio: document.getElementById('horario-inicio'),
            statusElement: document.querySelector('.status'),
            statusTexto: document.getElementById('status-texto'),
            modalAcrescentar: document.getElementById('modal-acrescentar'),
            inputAcrescentar: document.getElementById('input-acrescentar'),
            modalEncerrar: document.getElementById('modal-encerrar'),
            formEncerrar: document.getElementById('form-encerrar'),
            abas: document.querySelectorAll('.aba'),
            conteudoAbas: document.querySelectorAll('.conteudo-aba'),
            inputBusca: document.getElementById('input-busca'),
            inputBuscaHistorico: document.getElementById('input-busca-historico'),
            sugestoesBusca: document.getElementById('sugestoes-busca'),
            barraPesquisaPlantao: document.getElementById('barra-pesquisa-plantao')
        };
    }

    initEventos() {
        // Botão Novo Registro
        this.elements.btnNovo.addEventListener('click', () => this.abrirModal());
        
        // Botão Encerrar/Iniciar Plantão
        this.elements.btnEncerrar.addEventListener('click', () => {
            if (this.plantaoAtivo.ativo) {
                this.abrirModalEncerrar();
            } else {
                this.iniciarPlantao();
            }
        });

        // Troca de abas
        this.elements.abas.forEach(aba => {
            aba.addEventListener('click', () => {
                const abaAlvo = aba.dataset.aba;
                this.mostrarAba(abaAlvo);
            });
        });

        // Formulário de Novo Registro
        this.elements.form.addEventListener('submit', (e) => this.salvarRegistro(e));
        
        // Formulário de Encerramento
        this.elements.formEncerrar.addEventListener('submit', (e) => {
            e.preventDefault();
            this.encerrarPlantao();
        });
        
        // Fechar Modal Principal
        this.elements.modal.addEventListener('click', (e) => {
            if(e.target.classList.contains('btn-cancelar') || e.target === this.elements.modal) {
                this.fecharModal();
            }
        });

        // Fechar Modal de Encerramento
        this.elements.modalEncerrar.addEventListener('click', (e) => {
            if(e.target.classList.contains('btn-cancelar') || e.target === this.elements.modalEncerrar) {
                this.fecharModalEncerrar();
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
        
        // Barra de pesquisa plantão ativo
        this.elements.inputBusca.addEventListener('input', () => {
            this.atualizarSugestoes();
            this.filtrarRegistros();
        });
        
        this.elements.inputBusca.addEventListener('focus', () => {
            this.atualizarSugestoes();
        });
        
        // Barra de pesquisa histórico
        this.elements.inputBuscaHistorico.addEventListener('input', () => {
            this.filtrarHistorico();
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.pesquisa-container')) {
                this.elements.sugestoesBusca.style.display = 'none';
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
            
            // Mostrar barra de pesquisa e botão flutuante
            this.elements.barraPesquisaPlantao.style.display = 'block';
            document.getElementById('btn-novo').style.display = 'flex';
        } else {
            this.elements.statusElement.classList.remove('ativo');
            this.elements.statusElement.classList.add('inativo');
            this.elements.statusTexto.textContent = 'Plantão Inativo';
            this.elements.btnEncerrar.textContent = 'Iniciar';
            this.elements.btnEncerrar.style.color = '#2ecc71';
            
            // Ocultar barra de pesquisa e botão flutuante
            this.elements.barraPesquisaPlantao.style.display = 'none';
            document.getElementById('btn-novo').style.display = 'none';
        }
    }

    encerrarPlantao() {
        const relatorio = document.getElementById('relatorio-encerramento').value.trim();
        
        this.plantaoAtivo.ativo = false;
        
        const dataTermino = new Date();
        const dataInicio = new Date(this.plantaoAtivo.dataInicio);
        
        const plantaoEncerrado = {
            id: `plantao-${Date.now()}`,
            setor: "UTI-01",
            inicio: dataInicio.toISOString(),
            termino: dataTermino.toISOString(),
            duracao: this.calcularDuracao(dataInicio, dataTermino),
            responsavel: "Enf. Responsável",
            registros: [...this.plantaoAtivo.registros],
            relatorioFinal: relatorio || "Nenhum relatório fornecido"
        };
        
        this.plantaoAtivo.historico.unshift(plantaoEncerrado);
        this.plantaoAtivo.registros = [];
        
        this.salvarLocalStorage();
        this.atualizarInterface();
        this.atualizarStatusPlantao();
        this.fecharModalEncerrar();
        
        alert('Plantão encerrado com sucesso!');
    }

    calcularDuracao(inicio, termino) {
        const diffMs = termino - inicio;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        return `${hours}h${minutes.toString().padStart(2, '0')}m`;
    }

    iniciarPlantao() {
        this.plantaoAtivo.ativo = true;
        this.plantaoAtivo.dataInicio = new Date().toISOString();
        this.salvarLocalStorage();
        this.atualizarStatusPlantao();
    }

    salvarLocalStorage() {
        localStorage.setItem('plantaoAtivo', JSON.stringify(this.plantaoAtivo.ativo));
        localStorage.setItem('registros', JSON.stringify(this.plantaoAtivo.registros));
        localStorage.setItem('historicoPlantao', JSON.stringify(this.plantaoAtivo.historico));
        localStorage.setItem('dataInicio', JSON.stringify(this.plantaoAtivo.dataInicio));
    }

    abrirModal() {
        this.elements.modal.style.display = 'flex';
    }

    abrirModalAcrescentar() {
        this.elements.modalAcrescentar.style.display = 'flex';
        this.elements.inputAcrescentar.focus();
    }

    abrirModalEncerrar() {
        this.elements.modalEncerrar.style.display = 'flex';
    }

    fecharModalAcrescentar() {
        this.elements.modalAcrescentar.style.display = 'none';
        this.elements.inputAcrescentar.value = '';
    }

    fecharModalEncerrar() {
        this.elements.modalEncerrar.style.display = 'none';
        document.getElementById('relatorio-encerramento').value = '';
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
            }],
            mostrarTodas: false
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

    atualizarSugestoes() {
        const termo = this.elements.inputBusca.value.toLowerCase().trim();
        this.elements.sugestoesBusca.innerHTML = '';
        
        if (termo === '') {
            this.elements.sugestoesBusca.style.display = 'none';
            return;
        }
        
        const pacientes = this.plantaoAtivo.registros.map(registro => registro.paciente);
        const sugestoes = pacientes.filter(paciente => 
            paciente.toLowerCase().includes(termo)
        );
        
        if (sugestoes.length === 0) {
            this.elements.sugestoesBusca.innerHTML = `
                <div class="sugestao-item">
                    Nenhum paciente encontrado
                </div>
            `;
            this.elements.sugestoesBusca.style.display = 'block';
            return;
        }
        
        sugestoes.slice(0, 5).forEach(sugestao => {
            const item = document.createElement('div');
            item.className = 'sugestao-item';
            item.textContent = sugestao;
            
            // Destacar o termo buscado
            const termoIndex = sugestao.toLowerCase().indexOf(termo);
            if (termoIndex !== -1) {
                const antes = sugestao.substring(0, termoIndex);
                const destaque = sugestao.substring(termoIndex, termoIndex + termo.length);
                const depois = sugestao.substring(termoIndex + termo.length);
                
                item.innerHTML = `
                    ${antes}<strong>${destaque}</strong>${depois}
                `;
            }
            
            item.addEventListener('click', () => {
                this.elements.inputBusca.value = sugestao;
                this.filtrarRegistros();
                this.elements.sugestoesBusca.style.display = 'none';
            });
            
            this.elements.sugestoesBusca.appendChild(item);
        });
        
        this.elements.sugestoesBusca.style.display = 'block';
    }

    filtrarRegistros() {
        const termo = this.elements.inputBusca.value.toLowerCase().trim();
        
        document.querySelectorAll('.registro-card').forEach(card => {
            const nomePaciente = card.querySelector('h3').textContent.toLowerCase();
            if (termo === '' || nomePaciente.includes(termo)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filtrarHistorico() {
        const termo = this.elements.inputBuscaHistorico.value.toLowerCase().trim();
        
        document.querySelectorAll('.plantao-card').forEach(card => {
            const conteudo = card.textContent.toLowerCase();
            card.style.display = conteudo.includes(termo) ? 'block' : 'none';
        });
    }

    mostrarAba(abaNome) {
        // Atualizar abas
        this.elements.abas.forEach(aba => {
            aba.classList.toggle('ativa', aba.dataset.aba === abaNome);
        });
        
        // Atualizar conteúdo das abas
        this.elements.conteudoAbas.forEach(aba => {
            aba.classList.toggle('ativa', aba.id === `aba-${abaNome}`);
        });
        
        // Se for a aba de histórico, carregar os dados
        if (abaNome === 'historico') {
            this.carregarHistoricoPlantao();
        }
    }

    carregarHistoricoPlantao() {
        this.elements.historicoContainer.innerHTML = this.plantaoAtivo.historico.length > 0 
            ? this.plantaoAtivo.historico.map(plantao => `
                <div class="plantao-card">
                    <div class="plantao-info">
                        <div>
                            <div class="plantao-resumo">Plantão encerrado</div>
                            <div class="plantao-data">${new Date(plantao.inicio).toLocaleString('pt-BR')} - ${new Date(plantao.termino).toLocaleString('pt-BR')}</div>
                            <div class="plantao-data">Duração: ${plantao.duracao}</div>
                        </div>
                        <div>${plantao.registros.length} registros</div>
                    </div>
                    <div class="plantao-detalhes">
                        <h3>Relatório Final:</h3>
                        <p>${plantao.relatorioFinal}</p>
                        
                        <h3>Registros:</h3>
                        <div class="plantao-registros">
                            ${plantao.registros.slice(0, 3).map(registro => `
                                <div class="plantao-registro-item">
                                    <strong>${registro.paciente}</strong>
                                    <p>${registro.historico[0].texto.substring(0, 100)}...</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')
            : '<div class="sem-registros">Nenhum plantão encerrado encontrado</div>';
        
        // Adicionar eventos para expandir os detalhes
        document.querySelectorAll('.plantao-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('expandido');
            });
        });
    }

    atualizarInterface() {
        this.elements.registrosContainer.innerHTML = this.plantaoAtivo.registros.length > 0 
            ? this.plantaoAtivo.registros.map(registro => {
                // Mostrar apenas as 3 últimas entradas por padrão
                const entradasVisiveis = registro.mostrarTodas 
                    ? registro.historico 
                    : registro.historico.slice(0, 3);
                
                const entradasOcultas = registro.historico.length - entradasVisiveis.length;
                
                return `
                    <div class="registro-card">
                        <div class="cabecalho-registro">
                            <h3>${registro.paciente}</h3>
                            <button 
                                class="btn-acrescentar" 
                                data-id="${registro.id}"
                                title="Acrescentar informação"
                            >+</button>
                        </div>
                        <div class="historico-registro ${registro.mostrarTodas ? 'expandido' : ''}">
                            ${entradasVisiveis.map(entry => `
                                <div class="entrada-registro">
                                    <p>${entry.texto}</p>
                                    <small>${entry.autor} - ${entry.data}</small>
                                </div>
                            `).join('')}
                        </div>
                        ${registro.historico.length > 3 ? `
                            <button class="btn-expandir" data-id="${registro.id}">
                                ${registro.mostrarTodas ? 'Recolher' : `Expandir (+${entradasOcultas})`}
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('')
            : '<div class="sem-registros">Nenhum registro encontrado</div>';
        
        // Adiciona eventos aos botões de expandir
        document.querySelectorAll('.btn-expandir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const registroId = parseInt(e.target.dataset.id);
                const registro = this.plantaoAtivo.registros.find(r => r.id === registroId);
                
                if (registro) {
                    registro.mostrarTodas = !registro.mostrarTodas;
                    this.salvarLocalStorage();
                    this.atualizarInterface();
                }
            });
        });
        
        // Aplicar filtro se houver texto na busca
        this.filtrarRegistros();
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
