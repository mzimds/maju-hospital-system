class PlantaoManager {
    constructor() {
        this.plantaoAtivo = {
            ativo: true,
            registros: JSON.parse(localStorage.getItem('registros')) || [],
            historico: JSON.parse(localStorage.getItem('historicoPlantao')) || [],
            dataInicio: JSON.parse(localStorage.getItem('dataInicio')) || new Date().toISOString(),
            passagens: JSON.parse(localStorage.getItem('passagens')) || [],
            plantaoId: JSON.parse(localStorage.getItem('plantaoId')) || `plantao-${Date.now()}`,
            turno: JSON.parse(localStorage.getItem('turno')) || 'A'
        };

        this.HORARIO_INICIO_PLANTAO_A = 7;
        this.HORARIO_FIM_PLANTAO_A = 19;
        this.HORARIO_INICIO_PLANTAO_B = 19;
        this.HORARIO_FIM_PLANTAO_B = 7;

        this.registroSelecionado = null;
        this.passagemSelecionada = null;
        this.ocorrenciaSelecionada = null;
        this.initElements();
        this.initEventos();
        this.atualizarInterface();
        this.atualizarHorario();
        this.atualizarStatusPlantao();
        this.iniciarVerificacaoAutomatica();
    }

    initElements() {
        this.elements = {
            modal: document.getElementById('modal'),
            form: document.getElementById('form'),
            registrosContainer: document.getElementById('registros'),
            historicoContainer: document.getElementById('historico-plantao'),
            horarioInicio: document.getElementById('horario-inicio'),
            statusElement: document.querySelector('.status'),
            statusTexto: document.getElementById('status-texto'),
            modalAcrescentar: document.getElementById('modal-acrescentar'),
            inputAcrescentar: document.getElementById('input-acrescentar'),
            abas: document.querySelectorAll('.aba'),
            conteudoAbas: document.querySelectorAll('.conteudo-aba'),
            inputBusca: document.getElementById('input-busca'),
            inputBuscaHistorico: document.getElementById('input-busca-historico'),
            inputBuscaPassagens: document.getElementById('input-busca-passagens'),
            sugestoesBusca: document.getElementById('sugestoes-busca'),
            barraPesquisaPlantao: document.getElementById('barra-pesquisa-intercorrencia'),
            abaIntercorrencia: document.getElementById('aba-intercorrencia'),
            abaPendencia: document.getElementById('aba-pendencia'),
            passagensContainer: document.getElementById('passagens-container'),
            contadorPassagens: document.getElementById('contador-passagens'),
            modalNovaPassagem: document.getElementById('modal-nova-passagem'),
            formNovaPassagem: document.getElementById('form-nova-passagem'),
            inputPassagemTexto: document.getElementById('input-passagem-texto'),
            modalEditarPassagem: document.getElementById('modal-editar-passagem'),
            formEditarPassagem: document.getElementById('form-editar-passagem'),
            inputEditarPassagemTexto: document.getElementById('input-editar-passagem-texto'),
            btnFlutuantePrincipal: document.getElementById('btn-flutuante-principal'),
            floatingContainer: document.getElementById('floating-container'),
            modalConfirmacao: document.getElementById('modal-confirmacao'),
            confirmacaoTitulo: document.getElementById('confirmacao-titulo'),
            confirmacaoMensagem: document.getElementById('confirmacao-mensagem'),
            btnCancelarConfirmacao: document.getElementById('btn-cancelar-confirmacao'),
            btnConfirmarOk: document.getElementById('btn-confirmar-ok'),
            zonaCinzaAviso: document.getElementById('zona-cinza-aviso'),
            plantaoTurno: document.getElementById('plantao-turno'),
            modalEditarOcorrencia: document.getElementById('modal-editar-ocorrencia'),
            formEditarOcorrencia: document.getElementById('form-editar-ocorrencia'),
            inputEditarOcorrencia: document.getElementById('input-editar-ocorrencia')
        };
    }

    initEventos() {
        this.elements.btnFlutuantePrincipal.addEventListener('click', () => {
            const abaAtiva = document.querySelector('.aba.ativa').dataset.aba;
            if (abaAtiva === 'intercorrencia') {
                this.abrirModal();
            } else if (abaAtiva === 'pendencia') {
                this.abrirModalNovaPassagem();
            }
        });
        
        this.elements.abas.forEach(aba => {
            aba.addEventListener('click', () => {
                const abaAlvo = aba.dataset.aba;
                this.mostrarAba(abaAlvo);
                this.configurarBotaoFlutuante();
            });
        });

        this.elements.form.addEventListener('submit', (e) => this.salvarRegistro(e));
        this.elements.formNovaPassagem.addEventListener('submit', (e) => this.salvarNovaPassagem(e));
        this.elements.formEditarPassagem.addEventListener('submit', (e) => this.salvarEdicaoPassagem(e));
        this.elements.formEditarOcorrencia.addEventListener('submit', (e) => this.salvarEdicaoOcorrencia(e));
        
        // Eventos para fechar modais
        const fecharModal = (modal, btnCancelar) => {
            modal.addEventListener('click', (e) => {
                if(e.target.classList.contains(btnCancelar) || e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        };
        
        fecharModal(this.elements.modal, 'btn-cancelar');
        fecharModal(this.elements.modalNovaPassagem, 'btn-cancelar-nova-passagem');
        fecharModal(this.elements.modalEditarPassagem, 'btn-cancelar-editar-passagem');
        fecharModal(this.elements.modalAcrescentar, 'btn-cancelar-acrescentar');
        fecharModal(this.elements.modalEditarOcorrencia, 'btn-cancelar-editar-ocorrencia');

        // Eventos para adicionar/editar informações
        this.elements.registrosContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-acrescentar')) {
                const registroId = parseInt(e.target.dataset.id);
                this.registroSelecionado = this.plantaoAtivo.registros.find(r => r.id === registroId);
                this.abrirModalAcrescentar();
            }
            else if (e.target.classList.contains('btn-editar-ocorrencia')) {
                const registroId = parseInt(e.target.dataset.registroId);
                const ocorrenciaId = parseInt(e.target.dataset.ocorrenciaId);
                this.abrirModalEditarOcorrencia(registroId, ocorrenciaId);
            }
        });

        this.elements.passagensContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-resolver')) {
                const passagemId = e.target.dataset.id;
                this.resolverPassagem(passagemId);
            }
            else if (e.target.classList.contains('btn-editar-passagem')) {
                const passagemId = e.target.dataset.id;
                const passagem = this.plantaoAtivo.passagens.find(p => p.id === passagemId);
                this.abrirEditarPassagem(passagem);
            }
            else if (e.target.classList.contains('btn-acrescentar-passagem')) {
                const passagemId = e.target.dataset.id;
                this.passagemSelecionada = this.plantaoAtivo.passagens.find(p => p.id === passagemId);
                this.abrirModalAcrescentar();
            }
        });

        // Eventos para salvar acréscimos
        document.querySelector('.btn-salvar-acrescentar').addEventListener('click', (e) => {
            e.preventDefault();
            this.salvarAcrescimo();
        });

        // Barra de busca
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
        
        this.elements.inputBuscaPassagens.addEventListener('input', () => {
            this.filtrarPassagens();
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.pesquisa-container')) {
                this.elements.sugestoesBusca.style.display = 'none';
            }
        });

        // Eventos para confirmação
        this.elements.btnCancelarConfirmacao.addEventListener('click', () => {
            this.fecharModalConfirmacao();
        });
        this.elements.btnConfirmarOk.addEventListener('click', () => {
            this.fecharModalConfirmacao();
        });
    }

    async exibirConfirmacao(mensagem, titulo = 'Confirmação') {
        this.elements.confirmacaoTitulo.textContent = titulo;
        this.elements.confirmacaoMensagem.textContent = mensagem;
        this.elements.modalConfirmacao.style.display = 'flex';

        return new Promise((resolve) => {
            const resolver = (confirmado) => {
                this.elements.modalConfirmacao.style.display = 'none';
                resolve(confirmado);
            };

            this.elements.btnCancelarConfirmacao.onclick = () => resolver(false);
            this.elements.btnConfirmarOk.onclick = () => resolver(true);
        });
    }

    configurarBotaoFlutuante() {
        const abaAtiva = document.querySelector('.aba.ativa').dataset.aba;
        const container = this.elements.floatingContainer;
        
        if (abaAtiva === 'historico') {
            container.style.display = 'none';
        } else {
            container.style.display = 'block';
        }
    }

    determinarTurnoAtual() {
        const agora = new Date();
        const hora = agora.getHours();
        
        if (hora >= this.HORARIO_INICIO_PLANTAO_A && hora < this.HORARIO_FIM_PLANTAO_A) {
            return {
                tipo: 'A',
                inicio: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), this.HORARIO_INICIO_PLANTAO_A, 0),
                termino: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), this.HORARIO_FIM_PLANTAO_A, 0),
                periodo: '07:00 - 19:00'
            };
        } else {
            const termino = new Date(agora);
            termino.setDate(termino.getDate() + 1);
            termino.setHours(this.HORARIO_FIM_PLANTAO_B, 0, 0, 0);
            
            return {
                tipo: 'B',
                inicio: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), this.HORARIO_INICIO_PLANTAO_B, 0),
                termino,
                periodo: '19:00 - 07:00'
            };
        }
    }

    verificarZonaCinza() {
        const agora = new Date();
        const turno = this.determinarTurnoAtual();
        const dezMinutos = 10 * 60 * 1000;
        
        return {
            emZonaCinza: (agora - turno.inicio) < dezMinutos || (turno.termino - agora) < dezMinutos,
            turnoAtual: turno.tipo,
            proximoTurno: turno.tipo === 'A' ? 'B' : 'A'
        };
    }

    iniciarVerificacaoAutomatica() {
        setInterval(() => {
            const agora = new Date();
            const turno = this.determinarTurnoAtual();
            
            if (agora >= turno.termino) {
                this.encerrarPlantaoAutomatico();
                this.iniciarPlantaoAutomatico();
            }
            
            this.atualizarZonaCinza();
        }, 60000);
    }

    atualizarZonaCinza() {
        const zonaCinza = this.verificarZonaCinza();
        const aviso = this.elements.zonaCinzaAviso;
        
        if (zonaCinza.emZonaCinza) {
            aviso.style.display = 'block';
            aviso.innerHTML = `⚠ Estamos na janela de troca de plantão. 
                Intercorrências registradas agora serão vinculadas ao Plantão ${zonaCinza.proximoTurno}.`;
        } else {
            aviso.style.display = 'none';
        }
    }

    iniciarPlantaoAutomatico() {
        const turno = this.determinarTurnoAtual();
        
        this.plantaoAtivo.ativo = true;
        this.plantaoAtivo.dataInicio = new Date().toISOString();
        this.plantaoAtivo.turno = turno.tipo;
        this.salvarLocalStorage();
        this.atualizarStatusPlantao();
    }

    encerrarPlantaoAutomatico() {
        const dataTermino = new Date();
        const turno = this.plantaoAtivo.turno;
        
        const plantaoEncerrado = {
            id: this.plantaoAtivo.plantaoId,
            setor: "UTI-01",
            turno: turno,
            inicio: this.plantaoAtivo.dataInicio,
            termino: dataTermino.toISOString(),
            duracao: this.calcularDuracao(
                new Date(this.plantaoAtivo.dataInicio), 
                dataTermino
            ),
            responsavel: "Enf. Responsável",
            registros: [...this.plantaoAtivo.registros],
            passagens: this.plantaoAtivo.passagens.filter(p => !p.resolvido),
            relatorioFinal: "Plantão encerrado automaticamente"
        };
        
        this.plantaoAtivo.historico.unshift(plantaoEncerrado);
        
        this.plantaoAtivo.passagens = this.plantaoAtivo.passagens.filter(p => !p.resolvido);
        
        this.plantaoAtivo.plantaoId = `plantao-${Date.now()}`;
        this.plantaoAtivo.registros = [];
        this.plantaoAtivo.dataInicio = new Date().toISOString();
        this.plantaoAtivo.turno = turno === 'A' ? 'B' : 'A';
        
        this.salvarLocalStorage();
        this.atualizarInterface();
        this.atualizarStatusPlantao();
    }

    atualizarStatusPlantao() {
        if(this.plantaoAtivo.ativo) {
            this.elements.statusElement.classList.remove('inativo');
            this.elements.statusElement.classList.add('ativo');
            this.elements.statusTexto.textContent = 'Plantão Ativo';
            
            this.elements.barraPesquisaPlantao.style.display = 'block';
            this.elements.abaIntercorrencia.style.display = 'flex';
            this.elements.abaPendencia.style.display = 'flex';
            this.mostrarAba('intercorrencia');

            const turno = this.determinarTurnoAtual();
            this.elements.plantaoTurno.textContent = `Plantão ${turno.tipo} (${turno.periodo})`;
            
            const inicio = new Date(this.plantaoAtivo.dataInicio);
            this.elements.horarioInicio.textContent = 
                inicio.toLocaleString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    hour: '2-digit',
                    minute: '2-digit'
                });
        }
        this.configurarBotaoFlutuante();
        this.atualizarContadorPassagens();
    }

    atualizarContadorPassagens() {
        const emAberto = this.plantaoAtivo.passagens.filter(p => !p.resolvido).length;
        this.elements.contadorPassagens.textContent = emAberto;
        this.elements.contadorPassagens.style.display = emAberto > 0 ? 'inline' : 'none';
    }

    salvarLocalStorage() {
        localStorage.setItem('registros', JSON.stringify(this.plantaoAtivo.registros));
        localStorage.setItem('historicoPlantao', JSON.stringify(this.plantaoAtivo.historico));
        localStorage.setItem('dataInicio', JSON.stringify(this.plantaoAtivo.dataInicio));
        localStorage.setItem('passagens', JSON.stringify(this.plantaoAtivo.passagens));
        localStorage.setItem('plantaoId', JSON.stringify(this.plantaoAtivo.plantaoId));
        localStorage.setItem('turno', JSON.stringify(this.plantaoAtivo.turno));
    }

    abrirModal() {
        this.elements.modal.style.display = 'flex';
    }
    
    abrirModalNovaPassagem() {
        this.elements.modalNovaPassagem.style.display = 'flex';
    }
    
    abrirModalAcrescentar() {
        this.elements.modalAcrescentar.style.display = 'flex';
        this.elements.inputAcrescentar.focus();
    }
    
    abrirModalEditarOcorrencia(registroId, ocorrenciaId) {
        const registro = this.plantaoAtivo.registros.find(r => r.id === registroId);
        if (registro) {
            const ocorrencia = registro.historico.find(o => o.id === ocorrenciaId);
            if (ocorrencia) {
                this.registroSelecionado = registro;
                this.ocorrenciaSelecionada = ocorrencia;
                this.elements.inputEditarOcorrencia.value = ocorrencia.texto;
                this.elements.modalEditarOcorrencia.style.display = 'flex';
            }
        }
    }

    abrirEditarPassagem(passagem) {
        this.passagemSelecionada = passagem;
        document.getElementById('editar-passagem-paciente').value = passagem.paciente || '';
        document.getElementById('editar-passagem-leito').value = passagem.leito || '';
        document.getElementById('editar-passagem-atendimento').value = passagem.atendimento || '';
        this.elements.inputEditarPassagemTexto.value = passagem.texto;
        document.getElementById('tipo-editar-passagem').value = passagem.tipo;
        this.elements.modalEditarPassagem.style.display = 'flex';
    }

    async salvarRegistro(e) {
        e.preventDefault();
        
        const nomePaciente = document.getElementById('paciente').value.trim();
        const leito = document.getElementById('leito').value.trim();
        const atendimento = document.getElementById('atendimento').value.trim();
        const descricao = document.getElementById('ocorrencia').value.trim();
        
        const pacienteExistente = this.plantaoAtivo.registros.find(
            registro => registro.atendimento.toLowerCase() === atendimento.toLowerCase()
        );
        
        if (pacienteExistente) {
            await this.exibirConfirmacao('Já existe um registro para este paciente no plantão atual.', 'Registro Duplicado');
            return;
        }
        
        const novoRegistro = {
            id: Date.now(),
            paciente: nomePaciente,
            leito: leito,
            atendimento: atendimento,
            historico: [{
                id: Date.now(),
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

    async salvarNovaPassagem(e) {
        e.preventDefault();
        
        const texto = this.elements.inputPassagemTexto.value.trim();
        if (!texto) return;
        
        const tipo = document.getElementById('tipo-passagem').value;
        const paciente = document.getElementById('passagem-paciente').value.trim();
        const leito = document.getElementById('passagem-leito').value.trim();
        const atendimento = document.getElementById('passagem-atendimento').value.trim();
        
        const novaPassagem = {
            id: `pa-${Date.now()}`,
            tipo: tipo,
            paciente: paciente,
            leito: leito,
            atendimento: atendimento,
            texto: texto,
            criadoPor: "Enf. Responsável",
            dataCriacao: new Date().toISOString(),
            resolvido: false,
            dataResolucao: null,
            resolvidoPor: null,
            historico: []
        };
        
        this.plantaoAtivo.passagens.unshift(novaPassagem);
        this.salvarLocalStorage();
        this.fecharModalNovaPassagem();
        this.carregarPassagens();
    }

    salvarEdicaoPassagem(e) {
        e.preventDefault();
        
        const texto = this.elements.inputEditarPassagemTexto.value.trim();
        const paciente = document.getElementById('editar-passagem-paciente').value.trim();
        const leito = document.getElementById('editar-passagem-leito').value.trim();
        const atendimento = document.getElementById('editar-passagem-atendimento').value.trim();
        const tipo = document.getElementById('tipo-editar-passagem').value;
        
        if (!texto || !this.passagemSelecionada) return;
        
        this.passagemSelecionada.texto = texto;
        this.passagemSelecionada.paciente = paciente;
        this.passagemSelecionada.leito = leito;
        this.passagemSelecionada.atendimento = atendimento;
        this.passagemSelecionada.tipo = tipo;
        
        this.salvarLocalStorage();
        this.fecharModalEditarPassagem();
        this.carregarPassagens();
    }

    salvarEdicaoOcorrencia(e) {
        e.preventDefault();
        
        const texto = this.elements.inputEditarOcorrencia.value.trim();
        
        if (texto && this.registroSelecionado && this.ocorrenciaSelecionada) {
            this.ocorrenciaSelecionada.texto = texto;
            this.registroSelecionado.ultimaAtualizacao = new Date().toISOString();
            this.salvarLocalStorage();
            this.atualizarInterface();
            this.elements.modalEditarOcorrencia.style.display = 'none';
        }
    }

    salvarAcrescimo() {
        const texto = document.getElementById('input-acrescentar').value.trim();
        
        if (texto && (this.registroSelecionado || this.passagemSelecionada)) {
            const novaEntrada = {
                id: Date.now(),
                texto,
                data: new Date().toLocaleString('pt-BR'),
                autor: "Enf. Responsável"
            };
            
            if (this.registroSelecionado) {
                this.registroSelecionado.historico.unshift(novaEntrada);
                this.registroSelecionado.ultimaAtualizacao = new Date().toISOString();
            } else if (this.passagemSelecionada) {
                this.passagemSelecionada.historico.unshift(novaEntrada);
            }
            
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

    mostrarAba(abaNome) {
        this.elements.abas.forEach(aba => {
            aba.classList.toggle('ativa', aba.dataset.aba === abaNome);
        });
        
        this.elements.conteudoAbas.forEach(aba => {
            aba.classList.toggle('ativa', aba.id === `aba-${abaNome}`);
        });
        
        if (abaNome === 'historico') {
            this.carregarHistoricoPlantao();
        } else if (abaNome === 'pendencia') {
            this.carregarPassagens();
        }
        this.configurarBotaoFlutuante();
    }

    carregarPassagens() {
        this.elements.passagensContainer.innerHTML = '';
        this.atualizarContadorPassagens();
        
        // Agrupar pendências por atendimento
        const grupos = {};
        this.plantaoAtivo.passagens.forEach(p => {
            const key = p.atendimento;
            if (!grupos[key]) {
                grupos[key] = [];
            }
            grupos[key].push(p);
        });
        
        if (Object.keys(grupos).length === 0) {
            const semRegistros = document.createElement('div');
            semRegistros.className = 'sem-registros';
            semRegistros.textContent = 'Nenhuma pendência registrada';
            this.elements.passagensContainer.appendChild(semRegistros);
            return;
        }
        
        for (const key in grupos) {
            const grupo = grupos[key];
            const primeiro = grupo[0];
            
            const card = document.createElement('div');
            card.className = 'passagem-paciente-card';
            
            card.innerHTML = `
                <div class="cabecalho-registro">
                    <h3>${primeiro.paciente} ${primeiro.leito} #${primeiro.atendimento}</h3>
                    <button class="btn-acrescentar-passagem" data-id="${primeiro.id}">+</button>
                </div>
                <div class="pendencias-container"></div>
            `;
            
            const pendenciasContainer = card.querySelector('.pendencias-container');
            
            grupo.forEach(passagem => {
                const pendenciaItem = document.createElement('div');
                pendenciaItem.className = `pendencia-item ${passagem.tipo} ${passagem.resolvido ? 'passagem-resolvida' : ''}`;
                pendenciaItem.dataset.id = passagem.id;
                
                pendenciaItem.innerHTML = `
                    <div class="cabecalho-pendencia">
                        <span class="tipo-tag">${this.formatarTipo(passagem.tipo)}</span>
                        <div class="controles-pendencia">
                            ${!passagem.resolvido ? `
                                <button class="btn-editar-passagem" data-id="${passagem.id}">Editar</button>
                                <button class="btn-resolver" data-id="${passagem.id}">Resolver</button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="historico-registro">
                        <div class="entrada-registro">
                            <p>${passagem.texto}</p>
                            <small>Criado por: ${passagem.criadoPor} - ${new Date(passagem.dataCriacao).toLocaleString('pt-BR')}</small>
                        </div>
                        ${passagem.historico.map(entry => `
                            <div class="entrada-registro">
                                <p>${entry.texto}</p>
                                <small>${entry.autor} - ${entry.data}</small>
                            </div>
                        `).join('')}
                        ${passagem.resolvido ? `
                            <div class="entrada-registro">
                                <small>Resolvido por: ${passagem.resolvidoPor} - ${new Date(passagem.dataResolucao).toLocaleString('pt-BR')}</small>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                pendenciasContainer.appendChild(pendenciaItem);
            });
            
            this.elements.passagensContainer.appendChild(card);
        }
    }

    formatarTipo(tipo) {
        const tipos = {
            'transferencia': 'Transferência',
            'checagem-exame': 'Checagem de exame',
            'reavaliacao': 'Reavaliação',
            'outros': 'Outros'
        };
        return tipos[tipo] || tipo;
    }

    atualizarInterface() {
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
                            <h3>${registro.paciente} ${registro.leito} #${registro.atendimento}</h3>
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
                                    <small>
                                        ${entry.autor} - ${entry.data}
                                        <button 
                                            class="btn-editar-ocorrencia" 
                                            data-registro-id="${registro.id}"
                                            data-ocorrencia-id="${entry.id}"
                                        >Editar</button>
                                    </small>
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
        
        // Adicionar evento de clique para o botão expandir
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
        
        // Adicionar evento de clique para editar ocorrência
        document.querySelectorAll('.btn-editar-ocorrencia').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const registroId = parseInt(btn.dataset.registroId);
                const ocorrenciaId = parseInt(btn.dataset.ocorrenciaId);
                this.abrirModalEditarOcorrencia(registroId, ocorrenciaId);
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

    calcularDuracao(inicio, termino) {
        const diffMs = termino - inicio;
        const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
        const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        return `${diffHrs}h ${diffMins}min`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const plantao = new PlantaoManager();
});
