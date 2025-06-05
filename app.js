class PlantaoManager {
    constructor() {
        // Inicializa o estado do plantão
        this.plantaoAtivo = {
            ativo: JSON.parse(localStorage.getItem('plantaoAtivo')) ?? true,
            registros: JSON.parse(localStorage.getItem('registros')) || [],
            historico: JSON.parse(localStorage.getItem('historicoPlantao')) || [],
            dataInicio: JSON.parse(localStorage.getItem('dataInicio')) || new Date().toISOString(),
            passagens: JSON.parse(localStorage.getItem('passagens')) || []
        };

        this.registroSelecionado = null;
        this.passagemSelecionada = null;
        this.initElements();
        this.initEventos();
        this.atualizarInterface();
        this.atualizarHorario();
        this.atualizarStatusPlantao();
        this.verificarAtividadeSemPlantao();
        this.agendarConfirmacaoPosJornada();
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
            inputBuscaPassagens: document.getElementById('input-busca-passagens'),
            sugestoesBusca: document.getElementById('sugestoes-busca'),
            barraPesquisaPlantao: document.getElementById('barra-pesquisa-plantao'),
            abaPlantaoAtivo: document.getElementById('aba-plantao-ativo'),
            abaPassagens: document.getElementById('aba-passagens'),
            passagensContainer: document.getElementById('passagens-container'),
            contadorPassagens: document.getElementById('contador-passagens'),
            modalNovaPassagem: document.getElementById('modal-nova-passagem'),
            formNovaPassagem: document.getElementById('form-nova-passagem'),
            inputPassagemTexto: document.getElementById('input-passagem-texto'),
            modalEditarPassagem: document.getElementById('modal-editar-passagem'),
            formEditarPassagem: document.getElementById('form-editar-passagem'),
            inputEditarPassagemTexto: document.getElementById('input-editar-passagem-texto'),
            btnFlutuantePrincipal: document.getElementById('btn-flutuante-principal'),
            floatingContainer: document.getElementById('floating-container')
        };
    }

    initEventos() {
        // Botão flutuante principal com comportamento contextual
        this.elements.btnFlutuantePrincipal.addEventListener('click', () => {
            const abaAtiva = document.querySelector('.aba.ativa').dataset.aba;
            if (abaAtiva === 'plantao') {
                this.abrirModal();
            } else if (abaAtiva === 'passagens') {
                this.abrirModalNovaPassagem();
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
                this.configurarBotaoFlutuante();
            });
        });

        // Formulário de novo registro
        this.elements.form.addEventListener('submit', (e) => this.salvarRegistro(e));
        
        // Formulário de encerramento
        this.elements.formEncerrar.addEventListener('submit', (e) => {
            e.preventDefault();
            this.encerrarPlantao();
        });
        
        // Formulário de nova pendência
        this.elements.formNovaPassagem.addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarNovaPassagem();
        });
        
        // Formulário de editar pendência
        this.elements.formEditarPassagem.addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarEdicaoPassagem();
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

        this.elements.modalNovaPassagem.addEventListener('click', (e) => {
            if(e.target.classList.contains('btn-cancelar-nova-passagem') || 
               e.target === this.elements.modalNovaPassagem) {
                this.fecharModalNovaPassagem();
            }
        });

        this.elements.modalEditarPassagem.addEventListener('click', (e) => {
            if(e.target.classList.contains('btn-cancelar-editar-passagem') || 
               e.target === this.elements.modalEditarPassagem) {
                this.fecharModalEditarPassagem();
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
        
        // Barra de busca de pendências
        this.elements.inputBuscaPassagens.addEventListener('input', () => {
            this.filtrarPassagens();
        });
        
        // Fechar sugestões ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.pesquisa-container')) {
                this.elements.sugestoesBusca.style.display = 'none';
            }
        });
    }

    configurarBotaoFlutuante() {
        const abaAtiva = document.querySelector('.aba.ativa').dataset.aba;
        const container = this.elements.floatingContainer;
        
        // O botão não deve aparecer na aba de histórico
        if (abaAtiva === 'historico') {
            container.style.display = 'none';
        } else {
            container.style.display = 'block';
        }
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
            this.elements.abaPassagens.style.display = 'flex';
            this.mostrarAba('plantao');
        } else {
            this.elements.statusElement.classList.remove('ativo');
            this.elements.statusElement.classList.add('inativo');
            this.elements.statusTexto.textContent = 'Plantão Inativo';
            this.elements.btnEncerrar.textContent = 'Iniciar';
            this.elements.btnEncerrar.style.color = '#2ecc71';
            
            this.elements.barraPesquisaPlantao.style.display = 'none';
            this.elements.abaPlantaoAtivo.style.display = 'none';
            this.elements.abaPassagens.style.display = 'flex';
            this.mostrarAba('passagens');
        }
        this.configurarBotaoFlutuante();
        this.atualizarContadorPassagens();
    }

    atualizarContadorPassagens() {
        const emAberto = this.plantaoAtivo.passagens.filter(p => !p.resolvido).length;
        this.elements.contadorPassagens.textContent = emAberto;
        this.elements.contadorPassagens.style.display = emAberto > 0 ? 'inline' : 'none';
    }

    abrirModalEncerrar() {
        const temPendenciasAbertas = this.plantaoAtivo.passagens.some(p => !p.resolvido);
        const temRegistrosCriticos = this.plantaoAtivo.registros.some(r => 
            r.historico.some(entry => 
                entry.texto.toLowerCase().includes('crítico') || 
                entry.texto.toLowerCase().includes('emergência')
            )
        );
        
        if (!temPendenciasAbertas && !temRegistrosCriticos) {
            if (confirm('Plantão tranquilo. Deseja encerrar sem relatório?')) {
                this.encerrarPlantaoRapido();
                return;
            }
        }
        this.elements.modalEncerrar.style.display = 'flex';
    }

    encerrarPlantaoRapido() {
        this.plantaoAtivo.ativo = false;
        
        const dataTermino = new Date();
        const dataInicio = new Date(this.plantaoAtivo.dataInicio);
        
        // Filtrar pendências não resolvidas para transferir
        const passagensNaoResolvidas = this.plantaoAtivo.passagens.filter(p => !p.resolvido);
        
        const plantaoEncerrado = {
            id: `plantao-${Date.now()}`,
            setor: "UTI-01",
            inicio: dataInicio.toISOString(),
            termino: dataTermino.toISOString(),
            duracao: this.calcularDuracao(dataInicio, dataTermino),
            responsavel: "Enf. Responsável",
            registros: [...this.plantaoAtivo.registros],
            passagens: [...passagensNaoResolvidas],
            relatorioFinal: "Plantão encerrado sem relatório (modo rápido)"
        };
        
        // Adiciona ao histórico e limpa registros
        this.plantaoAtivo.historico.unshift(plantaoEncerrado);
        this.plantaoAtivo.registros = [];
        
        // Mantém apenas pendências não resolvidas para o próximo plantão
        this.plantaoAtivo.passagens = passagensNaoResolvidas;
        
        this.salvarLocalStorage();
        this.atualizarInterface();
        this.atualizarStatusPlantao();
        
        alert('Plantão encerrado com sucesso!');
    }

    encerrarPlantao() {
        const relatorio = document.getElementById('relatorio-encerramento').value.trim();
        
        this.plantaoAtivo.ativo = false;
        
        const dataTermino = new Date();
        const dataInicio = new Date(this.plantaoAtivo.dataInicio);
        
        // Filtrar pendências não resolvidas para transferir
        const passagensNaoResolvidas = this.plantaoAtivo.passagens.filter(p => !p.resolvido);
        
        const plantaoEncerrado = {
            id: `plantao-${Date.now()}`,
            setor: "UTI-01",
            inicio: dataInicio.toISOString(),
            termino: dataTermino.toISOString(),
            duracao: this.calcularDuracao(dataInicio, dataTermino),
            responsavel: "Enf. Responsável",
            registros: [...this.plantaoAtivo.registros],
            passagens: [...passagensNaoResolvidas],
            relatorioFinal: relatorio || "Nenhum relatório fornecido"
        };
        
        // Adiciona ao histórico e limpa registros
        this.plantaoAtivo.historico.unshift(plantaoEncerrado);
        this.plantaoAtivo.registros = [];
        
        // Mantém apenas pendências não resolvidas para o próximo plantão
        this.plantaoAtivo.passagens = passagensNaoResolvidas;
        
        this.salvarLocalStorage();
        this.atualizarInterface();
        this.atualizarStatusPlantao();
        this.fecharModalEncerrar();
        
        this.mostrarDashboardTransicao(plantaoEncerrado);
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
        localStorage.setItem('passagens', JSON.stringify(this.plantaoAtivo.passagens));
    }

    abrirModal() {
        this.elements.modal.style.display = 'flex';
    }
    
    abrirModalNovaPassagem() {
        this.elements.modalNovaPassagem.style.display = 'flex';
    }
    
    fecharModalNovaPassagem() {
        this.elements.modalNovaPassagem.style.display = 'none';
        this.elements.formNovaPassagem.reset();
    }
    
    abrirEditarPassagem(passagem) {
        this.passagemSelecionada = passagem;
        this.elements.inputEditarPassagemTexto.value = passagem.texto;
        
        // Marcar o radio correto
        document.querySelectorAll('input[name="gravidade-editar"]').forEach(radio => {
            if (radio.value === passagem.gravidade) {
                radio.checked = true;
            }
        });
        
        this.elements.modalEditarPassagem.style.display = 'flex';
    }
    
    fecharModalEditarPassagem() {
        this.elements.modalEditarPassagem.style.display = 'none';
    }

    abrirModalAcrescentar() {
        this.elements.modalAcrescentar.style.display = 'flex';
        this.elements.inputAcrescentar.focus();
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
        
        const primeiroRegistro = this.plantaoAtivo.registros.length === 0;
        
        if (!this.plantaoAtivo.ativo && primeiroRegistro) {
            const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const confirmarHora = confirm(`Plantão iniciado às ${horaAtual}. Está correto?`);
            
            if (confirmarHora) {
                this.iniciarPlantao();
            } else {
                return; // Usuário cancelou
            }
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

    salvarNovaPassagem() {
        const texto = this.elements.inputPassagemTexto.value.trim();
        if (!texto) return;
        
        const gravidade = document.querySelector('input[name="gravidade"]:checked').value;
        
        const novaPassagem = {
            id: `pa-${Date.now()}`,
            texto,
            criadoPor: "Enf. Responsável",
            dataCriacao: new Date().toISOString(),
            resolvido: false,
            dataResolucao: null,
            resolvidoPor: null,
            gravidade
        };
        
        this.plantaoAtivo.passagens.unshift(novaPassagem);
        this.salvarLocalStorage();
        this.fecharModalNovaPassagem();
        this.carregarPassagens();
    }

    salvarEdicaoPassagem() {
        const texto = this.elements.inputEditarPassagemTexto.value.trim();
        if (!texto || !this.passagemSelecionada) return;
        
        const gravidade = document.querySelector('input[name="gravidade-editar"]:checked').value;
        
        this.passagemSelecionada.texto = texto;
        this.passagemSelecionada.gravidade = gravidade;
        
        this.salvarLocalStorage();
        this.fecharModalEditarPassagem();
        this.carregarPassagens();
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

    resolverPassagem(id) {
        const passagem = this.plantaoAtivo.passagens.find(p => p.id === id);
        if (passagem) {
            passagem.resolvido = true;
            passagem.dataResolucao = new Date().toISOString();
            passagem.resolvidoPor = "Enf. Responsável";
            this.salvarLocalStorage();
            this.carregarPassagens();
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

    filtrarPassagens() {
        const termo = this.elements.inputBuscaPassagens.value.toLowerCase().trim();
        
        document.querySelectorAll('.passagem-card').forEach(card => {
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
        } else if (abaNome === 'passagens') {
            this.carregarPassagens();
        }
        this.configurarBotaoFlutuante();
    }

    carregarPassagens() {
        this.elements.passagensContainer.innerHTML = '';
        this.atualizarContadorPassagens();
        
        // Ordenar pendências: não resolvidas por gravidade (alta > média > baixa) e depois resolvidas
        const passagensOrdenadas = [...this.plantaoAtivo.passagens].sort((a, b) => {
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
        
        if (passagensOrdenadas.length === 0) {
            const semRegistros = document.createElement('div');
            semRegistros.className = 'sem-registros';
            semRegistros.textContent = 'Nenhuma pendência registrada';
            this.elements.passagensContainer.appendChild(semRegistros);
            return;
        }
        
        passagensOrdenadas.forEach(passagem => {
            const card = document.createElement('div');
            card.className = `passagem-card ${passagem.gravidade} ${passagem.resolvido ? 'passagem-resolvida' : ''}`;
            card.dataset.id = passagem.id;
            
            card.innerHTML = `
                <div class="cabecalho-registro">
                    <h3><span class="gravidade-tag">${passagem.gravidade.toUpperCase()}</span></h3>
                    <div>
                        ${!passagem.resolvido ? `
                            <button class="btn-editar">Editar</button>
                            <button class="btn-resolver">Marcar como Resolvido</button>
                        ` : ''}
                    </div>
                </div>
                <div class="historico-registro">
                    <div class="entrada-registro">
                        <p>${passagem.texto}</p>
                        <small>Criado por: ${passagem.criadoPor} - ${new Date(passagem.dataCriacao).toLocaleString('pt-BR')}</small>
                    </div>
                    ${passagem.resolvido ? `
                        <div class="entrada-registro">
                            <p><strong>RESOLVIDO</strong></p>
                            <small>Resolvido por: ${passagem.resolvidoPor} - ${new Date(passagem.dataResolucao).toLocaleString('pt-BR')}</small>
                        </div>
                    ` : ''}
                </div>
            `;
            
            this.elements.passagensContainer.appendChild(card);
            
            // Evento para marcar como resolvido
            if (!passagem.resolvido) {
                const btnResolver = card.querySelector('.btn-resolver');
                btnResolver.addEventListener('click', () => {
                    this.resolverPassagem(passagem.id);
                });
                
                const btnEditar = card.querySelector('.btn-editar');
                btnEditar.addEventListener('click', () => {
                    this.abrirEditarPassagem(passagem);
                });
            }
        });
        
        // Aplicar filtro atual
        this.filtrarPassagens();
    }

    carregarHistoricoPlantao() {
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

        this.elements.historicoContainer.innerHTML = this.plantaoAtivo.historico.length > 0 
            ? this.plantaoAtivo.historico.map(plantao => {
                const inicioDate = new Date(plantao.inicio);
                const terminoDate = new Date(plantao.termino);
                const diaSemana = diasSemana[inicioDate.getDay()];
                const dataFormatada = inicioDate.toLocaleDateString('pt-BR');
                
                return `
                <div class="plantao-card" data-id="${plantao.id}">
                    <div class="cabecalho-registro">
                        <h3>${diaSemana}, ${dataFormatada}</h3>
                        <div class="duracao-plantao">${plantao.duracao}</div>
                    </div>
                    <div class="resumo-plantao">
                        <small>${plantao.registros.length} registros</small>
                        <small>${plantao.passagens.length} pendências</small>
                    </div>
                    <div class="ocorrencias-expandidas" style="display: none;">
                        <div class="plantao-detalhes">
                            <div class="entrada-registro">
                                <p><strong>Período:</strong> ${inicioDate.toLocaleString('pt-BR')} - ${terminoDate.toLocaleString('pt-BR')}</p>
                            </div>
                            <div class="entrada-registro">
                                <p><strong>Responsável:</strong> ${plantao.responsavel}</p>
                            </div>
                            <div class="entrada-registro">
                                <p><strong>Relatório Final:</strong> ${plantao.relatorioFinal}</p>
                            </div>
                        </div>
                        <div class="historico-registros">
                            ${plantao.registros.map(registro => `
                                <div class="ocorrencia-item">
                                    <p><strong>${registro.paciente}</strong></p>
                                    ${registro.historico.map(entry => `
                                        <p>${entry.texto}</p>
                                        <small>${entry.autor} - ${entry.data}</small>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                        <div class="historico-passagens">
                            <h4>Pendências não resolvidas:</h4>
                            ${plantao.passagens.length > 0 ? 
                                plantao.passagens.map(passagem => `
                                    <div class="passagem-item ${passagem.gravidade}">
                                        <p>${passagem.texto}</p>
                                        <small>Gravidade: ${passagem.gravidade}</small>
                                    </div>
                                `).join('') 
                                : '<p>Todas as pendências foram resolvidas.</p>'
                            }
                        </div>
                    </div>
                </div>
            `;
            }).join('')
            : '<div class="sem-registros">Nenhum plantão encerrado encontrado</div>';
        
        // Adicionar evento de clique para expandir/detalhar
        document.querySelectorAll('.plantao-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Evitar expandir ao clicar em links dentro do card
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
                
                const ocorrencias = card.querySelector('.ocorrencias-expandidas');
                if (ocorrencias) {
                    if (ocorrencias.style.display === 'none') {
                        ocorrencias.style.display = 'block';
                        card.classList.add('expandido');
                    } else {
                        ocorrencias.style.display = 'none';
                        card.classList.remove('expandido');
                    }
                }
            });
        });
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
        this.carregarPassagens();
    }

    atualizarHorario() {
        if (this.elements.horarioInicio) {
            this.elements.horarioInicio.textContent = new Date().toLocaleString('pt-BR');
            setInterval(() => {
                this.elements.horarioInicio.textContent = new Date().toLocaleString('pt-BR');
            }, 1000);
        }
    }

    verificarAtividadeSemPlantao() {
        setInterval(() => {
            if (!this.plantaoAtivo.ativo && 
                (this.plantaoAtivo.registros.length > 0 || this.plantaoAtivo.passagens.length > 0)) {
                
                if (confirm(`Você esqueceu de iniciar seu plantão? Detectamos atividade desde ${new Date().toLocaleTimeString('pt-BR')}. Deseja iniciar agora?`)) {
                    this.iniciarPlantao();
                }
            }
        }, 30 * 60 * 1000); // 30 minutos
    }

    agendarConfirmacaoPosJornada() {
        if (!this.plantaoAtivo.ativo) return;

        const TERMINO_PREVISTO = 12 * 60 * 60 * 1000; // 12 horas
        const inicio = new Date(this.plantaoAtivo.dataInicio);
        const terminoPrevisto = new Date(inicio.getTime() + TERMINO_PREVISTO);
        
        setTimeout(() => {
            if (this.plantaoAtivo.ativo) {
                const resposta = confirm('Você ainda está em plantão?');
                if (!resposta) {
                    this.abrirModalEncerrar();
                }
            }
        }, TERMINO_PREVISTO + (30 * 60 * 1000)); // 30 min após término
    }

    mostrarDashboardTransicao(plantao) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>PLANTÃO #${plantao.id.split('-')[1]} - ENCERRADO</h2>
                <div class="dashboard-transicao">
                    <div class="dash-item">
                        <div class="dash-valor">${plantao.registros.length}</div>
                        <div class="dash-label">Registros</div>
                    </div>
                    <div class="dash-item">
                        <div class="dash-valor">${plantao.passagens.length}</div>
                        <div class="dash-label">Pendências</div>
                    </div>
                    <div class="dash-item">
                        <div class="dash-valor">${plantao.duracao}</div>
                        <div class="dash-label">Duração</div>
                    </div>
                </div>
                <div class="modal-botoes">
                    <button id="btn-assumir-plantao" class="btn-salvar">Assumir próximo plantão</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        document.getElementById('btn-assumir-plantao').addEventListener('click', () => {
            this.iniciarPlantao();
            document.body.removeChild(modal);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const plantao = new PlantaoManager();
});
