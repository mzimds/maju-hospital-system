class PlantaoManager {
    constructor() {
        // Inicializa o estado do plantão
        this.plantaoAtivo = {
            ativo: JSON.parse(localStorage.getItem('plantaoAtivo')) ?? true,
            registros: JSON.parse(localStorage.getItem('registros')) || [],
            historico: JSON.parse(localStorage.getItem('historicoPlantao')) || [],
            dataInicio: JSON.parse(localStorage.getItem('dataInicio')) || new Date().toISOString(),
            pontosAtencao: JSON.parse(localStorage.getItem('pontosAtencao')) || []
        };

        this.registroSelecionado = null;
        this.pontoSelecionado = null;
        this.initElements();
        this.initEventos();
        this.atualizarInterface();
        this.atualizarHorario();
        this.atualizarStatusPlantao();
    }

    initElements() {
        this.elements = {
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
            pontosAtencaoContainer: document.getElementById('pontos-atencao-container'),
            modalNovoPonto: document.getElementById('modal-novo-ponto'),
            formNovoPonto: document.getElementById('form-novo-ponto'),
            inputPontoTexto: document.getElementById('input-ponto-texto'),
            // Botão flutuante principal
            btnFlutuantePrincipal: document.getElementById('btn-flutuante-principal'),
            floatingMenu: document.getElementById('floating-menu'),
            btnNovoRegistro: document.getElementById('btn-novo-registro'),
            btnNovoPonto: document.getElementById('btn-novo-ponto')
        };
    }

    initEventos() {
        // Botão flutuante principal
        this.elements.btnFlutuantePrincipal.addEventListener('click', () => {
            this.elements.floatingMenu.classList.toggle('ativo');
        });
        
        // Opções do menu flutuante
        this.elements.btnNovoRegistro.addEventListener('click', () => {
            this.abrirModal();
            this.elements.floatingMenu.classList.remove('ativo');
        });
        
        this.elements.btnNovoPonto.addEventListener('click', () => {
            this.abrirModalNovoPonto();
            this.elements.floatingMenu.classList.remove('ativo');
        });
        
        // Fechar menu flutuante ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.floating-container')) {
                this.elements.floatingMenu.classList.remove('ativo');
            }
        });
        
        // Botão encerrar/iniciar plantão
        this.elements.btnEncerrar.addEventListener('click', () => {
            if (this.plantaoAtivo.ativo) {
                this.abrirModalEncerrar();
            } else {
                this.iniciarPlantao();
            }
        });

        // Abas
        this.elements.abas.forEach(aba => {
            aba.addEventListener('click', () => {
                const abaAlvo = aba.dataset.aba;
                this.mostrarAba(abaAlvo);
            });
        });

        // Formulário de novo registro
        this.elements.form.addEventListener('submit', (e) => this.salvarRegistro(e));
        
        // Formulário de encerramento
        this.elements.formEncerrar.addEventListener('submit', (e) => {
            e.preventDefault();
            this.encerrarPlantao();
        });
        
        // Formulário de novo ponto
        this.elements.formNovoPonto.addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarNovoPonto();
        });
        
        // Fechar modais
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

        this.elements.modalNovoPonto.addEventListener('click', (e) => {
            if(e.target.classList.contains('btn-cancelar-novo-ponto') || 
               e.target === this.elements.modalNovoPonto) {
                this.fecharModalNovoPonto();
            }
        });

        // Evento para adicionar informação a registro
        this.elements.registrosContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-acrescentar')) {
                const registroId = parseInt(e.target.dataset.id);
                this.registroSelecionado = this.plantaoAtivo.registros.find(r => r.id === registroId);
                this.abrirModalAcrescentar();
            }
        });

        // Eventos para o modal de acréscimo
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
        
        // Barra de busca
        this.elements.inputBusca.addEventListener('input', () => {
            this.atualizarSugestoes();
            this.filtrarRegistros();
        });
        
        this.elements.inputBusca.addEventListener('focus', () => {
            this.atualizarSugestoes();
        });
        
        // Barra de busca do histórico
        this.elements.inputBuscaHistorico.addEventListener('input', () => {
            this.filtrarHistorico();
        });
        
        // Fechar sugestões ao clicar fora
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
            
            this.elements.barraPesquisaPlantao.style.display = 'block';
            this.elements.abaPlantaoAtivo.style.display = 'flex';
            this.elements.abaPontosAtencao.style.display = 'flex';
            this.mostrarAba('plantao');
        } else {
            this.elements.statusElement.classList.remove('ativo');
            this.elements.statusElement.classList.add('inativo');
            this.elements.statusTexto.textContent = 'Plantão Inativo';
            this.elements.btnEncerrar.textContent = 'Iniciar';
            this.elements.btnEncerrar.style.color = '#2ecc71';
            
            this.elements.barraPesquisaPlantao.style.display = 'none';
            this.elements.abaPlantaoAtivo.style.display = 'none';
            this.elements.abaPontosAtencao.style.display = 'flex';
            this.mostrarAba('pontos-atencao');
        }
    }

    encerrarPlantao() {
        const relatorio = document.getElementById('relatorio-encerramento').value.trim();
        
        this.plantaoAtivo.ativo = false;
        
        const dataTermino = new Date();
        const dataInicio = new Date(this.plantaoAtivo.dataInicio);
        
        // Filtrar pontos não resolvidos para transferir
        const pontosNaoResolvidos = this.plantaoAtivo.pontosAtencao.filter(p => !p.resolvido);
        
        const plantaoEncerrado = {
            id: `plantao-${Date.now()}`,
            setor: "UTI-01",
            inicio: dataInicio.toISOString(),
            termino: dataTermino.toISOString(),
            duracao: this.calcularDuracao(dataInicio, dataTermino),
            responsavel: "Enf. Responsável",
            registros: [...this.plantaoAtivo.registros],
            pontosAtencao: [...pontosNaoResolvidos],
            relatorioFinal: relatorio || "Nenhum relatório fornecido"
        };
        
        this.plantaoAtivo.historico.unshift(plantaoEncerrado);
        this.plantaoAtivo.registros = [];
        this.plantaoAtivo.pontosAtencao = pontosNaoResolvidos;
        
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
        localStorage.setItem('pontosAtencao', JSON.stringify(this.plantaoAtivo.pontosAtencao));
    }

    abrirModal() {
        this.elements.modal.style.display = 'flex';
    }
    
    abrirModalNovoPonto() {
        this.elements.modalNovoPonto.style.display = 'flex';
    }
    
    fecharModalNovoPonto() {
        this.elements.modalNovoPonto.style.display = 'none';
        this.elements.formNovoPonto.reset();
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

    fecharModal() {
        this.elements.modal.style.display = 'none';
        this.elements.form.reset();
    }

    salvarRegistro(e) {
        e.preventDefault();
        
        if (!this.plantaoAtivo.ativo) {
            this.iniciarPlantao();
        }
        
        const nomePaciente = document.getElementById('paciente').value.trim();
        const descricao = document.getElementById('ocorrencia').value.trim();
        
        // Verificar duplicidade
        const pacienteExistente = this.plantaoAtivo.registros.find(
            registro => registro.paciente.toLowerCase() === nomePaciente.toLowerCase()
        );
        
        if (pacienteExistente) {
            alert('Já existe um registro para este paciente no plantão atual.');
            return;
        }
        
        const novoRegistro = {
            id: Date.now(),
            paciente: nomePaciente,
            historico: [{
                texto: descricao,
                data: new Date().toLocaleString('pt-BR'),
                autor: "Enf. Responsável"
            }],
            mostrarTodas: false,
            ultimaAtualizacao: new Date().toISOString()
        };

        this.plantaoAtivo.registros.unshift(novoRegistro);
        this.salvarLocalStorage();
        this.fecharModal();
        this.atualizarInterface();
    }

    salvarNovoPonto() {
        const texto = this.elements.inputPontoTexto.value.trim();
        if (!texto) return;
        
        const gravidade = document.querySelector('input[name="gravidade"]:checked').value;
        
        const novoPonto = {
            id: `pa-${Date.now()}`,
            texto,
            criadoPor: "Enf. Responsável",
            dataCriacao: new Date().toISOString(),
            resolvido: false,
            dataResolucao: null,
            gravidade
        };
        
        this.plantaoAtivo.pontosAtencao.unshift(novoPonto);
        this.salvarLocalStorage();
        this.fecharModalNovoPonto();
        this.carregarPontosAtencao();
    }

    salvarAcrescimo() {
        const texto = document.getElementById('input-acrescentar').value.trim();
        
        if (texto && this.registroSelecionado) {
            this.registroSelecionado.historico.unshift({
                texto,
                data: new Date().toLocaleString('pt-BR'),
                autor: "Enf. Responsável"
            });
            
            // Atualizar timestamp e reordenar
            this.registroSelecionado.ultimaAtualizacao = new Date().toISOString();
            
            this.salvarLocalStorage();
            this.atualizarInterface();
            this.fecharModalAcrescentar();
        }
    }

    resolverPontoAtencao(id) {
        const ponto = this.plantaoAtivo.pontosAtencao.find(p => p.id === id);
        if (ponto) {
            ponto.resolvido = true;
            ponto.dataResolucao = new Date().toISOString();
            this.salvarLocalStorage();
            this.carregarPontosAtencao();
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
        this.elements.pontosAtencaoContainer.innerHTML = '';
        
        // Ordenar pontos: não resolvidos primeiro (alta > média > baixa) e depois resolvidos
        const pontosOrdenados = [...this.plantaoAtivo.pontosAtencao].sort((a, b) => {
            // Se ambos não resolvidos, ordenar por gravidade
            if (!a.resolvido && !b.resolvido) {
                const prioridade = { alta: 3, media: 2, baixa: 1 };
                return prioridade[b.gravidade] - prioridade[a.gravidade];
            }
            // Se um resolvido e o outro não, o não resolvido vem primeiro
            if (a.resolvido && !b.resolvido) return 1;
            if (!a.resolvido && b.resolvido) return -1;
            // Se ambos resolvidos, manter ordem de criação
            return new Date(b.dataCriacao) - new Date(a.dataCriacao);
        });
        
        if (pontosOrdenados.length === 0) {
            const semRegistros = document.createElement('div');
            semRegistros.className = 'sem-registros';
            semRegistros.textContent = 'Nenhum ponto de atenção registrado';
            this.elements.pontosAtencaoContainer.appendChild(semRegistros);
            return;
        }
        
        pontosOrdenados.forEach(ponto => {
            const card = document.createElement('div');
            card.className = `ponto-atencao-card ${ponto.gravidade} ${ponto.resolvido ? 'ponto-resolvido' : ''}`;
            card.dataset.id = ponto.id;
            
            card.innerHTML = `
                <div class="cabecalho-registro">
                    <h3>Ponto de Atenção <span class="gravidade-tag">${ponto.gravidade.toUpperCase()}</span></h3>
                    ${!ponto.resolvido ? `
                        <button class="btn-resolver">Marcar como Resolvido</button>
                    ` : ''}
                </div>
                <div class="historico-registro">
                    <div class="entrada-registro">
                        <p>${ponto.texto}</p>
                        <small>Criado por: ${ponto.criadoPor} - ${new Date(ponto.dataCriacao).toLocaleString('pt-BR')}</small>
                    </div>
                    ${ponto.resolvido ? `
                        <div class="entrada-registro">
                            <p><strong>RESOLVIDO</strong></p>
                            <small>Resolvido em: ${new Date(ponto.dataResolucao).toLocaleString('pt-BR')}</small>
                        </div>
                    ` : ''}
                </div>
            `;
            
            this.elements.pontosAtencaoContainer.appendChild(card);
            
            // Evento para marcar como resolvido
            if (!ponto.resolvido) {
                const btnResolver = card.querySelector('.btn-resolver');
                btnResolver.addEventListener('click', () => {
                    this.resolverPontoAtencao(ponto.id);
                });
            }
        });
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
                    <div class="cabecalho-registro">
                        <h3>Plantão ${inicioDate.toLocaleDateString('pt-BR')}</h3>
                        <div>${plantao.duracao}</div>
                    </div>
                    <div class="historico-registro">
                        <div class="entrada-registro">
                            <p><strong>${diaSemanaInicio}</strong></p>
                            <small>Início: ${inicioDate.toLocaleString('pt-BR')}</small>
                            <small>Término: ${terminoDate.toLocaleString('pt-BR')}</small>
                        </div>
                        <div class="entrada-registro">
                            <p><strong>Relatório Final:</strong> ${plantao.relatorioFinal}</p>
                        </div>
                        <div class="entrada-registro">
                            <p><strong>${plantao.registros.length} registros</strong></p>
                        </div>
                    </div>
                </div>
            `}).join('')
            : '<div class="sem-registros">Nenhum plantão encerrado encontrado</div>';
    }

    atualizarInterface() {
        // Ordenar registros pela última atualização (mais recente primeiro)
        const registrosOrdenados = [...this.plantaoAtivo.registros].sort((a, b) => 
            new Date(b.ultimaAtualizacao) - new Date(a.ultimaAtualizacao)
        );

        this.elements.registrosContainer.innerHTML = registrosOrdenados.length > 0 
            ? registrosOrdenados.map(registro => {
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
                        <div class="historico-registro">
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
        this.carregarPontosAtencao();
    }

    atualizarHorario() {
        if (this.elements.horarioInicio) {
            this.elements.horarioInicio.textContent = new Date().toLocaleString('pt-BR');
            setInterval(() => {
                this.elements.horarioInicio.textContent = new Date().toLocaleString('pt-BR');
            }, 1000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const plantao = new PlantaoManager();
});
