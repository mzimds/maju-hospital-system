class PlantaoManager {
    constructor() {
        this.plantaoAtivo = {
            ativo: JSON.parse(localStorage.getItem('plantaoAtivo')) ?? true,
            registros: JSON.parse(localStorage.getItem('registros')) || [],
            historico: JSON.parse(localStorage.getItem('historicoPlantao')) || [],
            dataInicio: JSON.parse(localStorage.getItem('dataInicio')) || new Date().toISOString(),
            pontoAtencaoVisto: JSON.parse(localStorage.getItem('pontoAtencaoVisto')) || false
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
            barraPesquisaPlantao: document.getElementById('barra-pesquisa-plantao'),
            abaPlantaoAtivo: document.getElementById('aba-plantao-ativo'),
            abaPontosAtencao: document.getElementById('aba-pontos-atencao'),
            pontosAtencaoContainer: document.getElementById('pontos-atencao-container')
        };
    }

    initEventos() {
        this.elements.btnNovo.addEventListener('click', () => this.abrirModal());
        
        this.elements.btnEncerrar.addEventListener('click', () => {
            if (this.plantaoAtivo.ativo) {
                // Verifica se há ponto de atenção pendente
                if (this.temPontoAtencaoPendente()) {
                    alert('Não é possível encerrar o plantão enquanto houver um ponto de atenção pendente.');
                    return;
                }
                this.abrirModalEncerrar();
            } else {
                this.iniciarPlantao();
            }
        });

        this.elements.abas.forEach(aba => {
            aba.addEventListener('click', () => {
                const abaAlvo = aba.dataset.aba;
                this.mostrarAba(abaAlvo);
            });
        });

        this.elements.form.addEventListener('submit', (e) => this.salvarRegistro(e));
        
        this.elements.formEncerrar.addEventListener('submit', (e) => {
            e.preventDefault();
            this.encerrarPlantao();
        });
        
        this.elements.modal.addEventListener('click', (e) => {
            if(e.target.classList.contains('btn-cancelar') || e.target === this.elements.modal) {
                this.fecharModal();
            }
        });

        this.elements.modalEncerrar.addEventListener('click', (e) => {
            if(e.target.classList.contains('btn-cancelar') || e.target === this.elements.modalEncerrar) {
                this.fecharModalEncerrar();
            }
        });

        this.elements.registrosContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-acrescentar')) {
                const registroId = parseInt(e.target.dataset.id);
                this.registroSelecionado = this.plantaoAtivo.registros.find(r => r.id === registroId);
                this.abrirModalAcrescentar();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-cancelar-acrescentar') || 
                e.target.classList.contains('modal-acrescentar')) {
                this.fecharModalAcrescentar();
            }
            
            if (e.target.classList.contains('btn-salvar-acrescentar')) {
                e.preventDefault();
                this.salvarAcrescimo();
            }
        });
        
        this.elements.inputBusca.addEventListener('input', () => {
            this.atualizarSugestoes();
            this.filtrarRegistros();
        });
        
        this.elements.inputBusca.addEventListener('focus', () => {
            this.atualizarSugestoes();
        });
        
        this.elements.inputBuscaHistorico.addEventListener('input', () => {
            this.filtrarHistorico();
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.pesquisa-container')) {
                this.elements.sugestoesBusca.style.display = 'none';
            }
        });
    }

    temPontoAtencaoPendente() {
        // Se já foi marcado como visto, não há pendência
        if (this.plantaoAtivo.pontoAtencaoVisto) return false;
        
        // Verifica se existe um plantão anterior com observações para o próximo plantão
        // Considera o último plantão encerrado (o primeiro do histórico)
        const plantaoAnterior = this.plantaoAtivo.historico[0];
        if (plantaoAnterior && plantaoAnterior.observacoesProximoPlantao) {
            return true;
        }
        return false;
    }

    atualizarStatusPlantao() {
        if(this.plantaoAtivo.ativo) {
            this.elements.statusElement.classList.remove('inativo');
            this.elements.statusElement.classList.add('ativo');
            this.elements.statusTexto.textContent = 'Plantão Ativo';
            this.elements.btnEncerrar.textContent = 'Encerrar';
            this.elements.btnEncerrar.style.color = '#e74c3c';
            
            this.elements.barraPesquisaPlantao.style.display = 'block';
            document.getElementById('btn-novo').style.display = 'flex';

            this.elements.abaPlantaoAtivo.style.display = 'flex';
            this.elements.abaPontosAtencao.style.display = 'none';
            this.mostrarAba('plantao');
        } else {
            this.elements.statusElement.classList.remove('ativo');
            this.elements.statusElement.classList.add('inativo');
            this.elements.statusTexto.textContent = 'Plantão Inativo';
            this.elements.btnEncerrar.textContent = 'Iniciar';
            this.elements.btnEncerrar.style.color = '#2ecc71';
            
            this.elements.barraPesquisaPlantao.style.display = 'none';
            document.getElementById('btn-novo').style.display = 'none';

            this.elements.abaPlantaoAtivo.style.display = 'none';
            this.elements.abaPontosAtencao.style.display = 'flex';
            this.mostrarAba('pontos-atencao');
        }
    }

    encerrarPlantao() {
        const relatorio = document.getElementById('relatorio-encerramento').value.trim();
        const observacoesProximoPlantao = document.getElementById('observacoes-proximo-plantao').value.trim();
        
        this.plantaoAtivo.ativo = false;
        this.plantaoAtivo.pontoAtencaoVisto = false;
        
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
            relatorioFinal: relatorio || "Nenhum relatório fornecido",
            observacoesProximoPlantao: observacoesProximoPlantao ? {
                texto: observacoesProximoPlantao,
                autor: "Enf. Responsável",
                data: new Date().toLocaleString('pt-BR')
            } : null
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
        localStorage.setItem('pontoAtencaoVisto', JSON.stringify(this.plantaoAtivo.pontoAtencaoVisto));
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
        document.getElementById('observacoes-proximo-plantao').value = '';
    }

    salvarRegistro(e) {
        e.preventDefault();
        
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
            this.registroSelecionado.historico.unshift({
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
            const conteudo = card.textContent.toLowerCase();
            if (termo === '' || nomePaciente.includes(termo) || conteudo.includes(termo)) {
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
        this.elements.abas.forEach(aba => {
            aba.classList.toggle('ativa', aba.dataset.aba === abaNome);
        });
        
        this.elements.conteudoAbas.forEach(aba => {
            aba.classList.toggle('ativa', aba.id === `aba-${abaNome}`);
        });
        
        if (abaNome === 'historico') {
            this.carregarHistoricoPlantao();
        } else if (abaNome === 'pontos-atencao') {
            this.carregarPontosAtencao();
        }
    }

    carregarPontosAtencao() {
        if (this.plantaoAtivo.pontoAtencaoVisto) {
            this.elements.pontosAtencaoContainer.innerHTML = '<div class="sem-registros">Nenhum ponto de atenção pendente.</div>';
            return;
        }

        // Busca o plantão anterior com observações
        const plantaoAnterior = this.plantaoAtivo.historico[0];
        
        if (plantaoAnterior && plantaoAnterior.observacoesProximoPlantao) {
            const obs = plantaoAnterior.observacoesProximoPlantao;
            this.elements.pontosAtencaoContainer.innerHTML = `
                <div class="ponto-atencao-card">
                    <div class="cabecalho-registro">
                        <h3>Ponto de Atenção</h3>
                        <div class="toggle-container" title="Marcar como resolvido">
                            <label class="switch">
                                <input type="checkbox" class="toggle-visto">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="conteudo-ponto">
                        <p>${obs.texto}</p>
                        <small>${obs.autor} - ${obs.data}</small>
                    </div>
                </div>
            `;

            const toggle = this.elements.pontosAtencaoContainer.querySelector('.toggle-visto');
            toggle.addEventListener('change', () => {
                this.plantaoAtivo.pontoAtencaoVisto = true;
                this.salvarLocalStorage();
                this.carregarPontosAtencao();
            });
        } else {
            this.elements.pontosAtencaoContainer.innerHTML = '<div class="sem-registros">Nenhum ponto de atenção foi registrado no plantão anterior.</div>';
        }
    }

    carregarHistoricoPlantao() {
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

        this.elements.historicoContainer.innerHTML = this.plantaoAtivo.historico.length > 0 
            ? this.plantaoAtivo.historico.map(plantao => {
                const inicioDate = new Date(plantao.inicio);
                const terminoDate = new Date(plantao.termino);
                const diaSemanaInicio = diasSemana[inicioDate.getDay()];
                
                return `
                <div class="plantao-card">
                    <div class="plantao-info">
                        <div>
                            <div class="plantao-resumo">${inicioDate.toLocaleDateString('pt-BR')} - ${diaSemanaInicio}</div>
                            <div class="plantao-data">Início: ${inicioDate.toLocaleString('pt-BR')}</div>
                            <div class="plantao-data">Término: ${terminoDate.toLocaleString('pt-BR')}</div>
                            <div class="plantao-data">Duração: ${plantao.duracao}</div>
                        </div>
                        <div>${plantao.registros.length} registros</div>
                    </div>
                    <div class="plantao-detalhes">
                        <h3>Relatório Final:</h3>
                        <p>${plantao.relatorioFinal}</p>
                        ${plantao.observacoesProximoPlantao ? `
                        <h3>Observações para o próximo plantão:</h3>
                        <p>${plantao.observacoesProximoPlantao.texto}</p>
                        ` : ''}
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
            `}).join('')
            : '<div class="sem-registros">Nenhum plantão encerrado encontrado</div>';
        
        document.querySelectorAll('.plantao-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('expandido');
            });
        });
    }

    atualizarInterface() {
        this.elements.registrosContainer.innerHTML = this.plantaoAtivo.registros.length > 0 
            ? this.plantaoAtivo.registros.map(registro => {
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

document.addEventListener('DOMContentLoaded', () => {
    const plantao = new PlantaoManager();
});
