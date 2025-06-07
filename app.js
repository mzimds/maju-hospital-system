class PlantaoManager {
    constructor() {
        // Inicializa o estado do plantão
        this.plantaoAtivo = {
            ativo: JSON.parse(localStorage.getItem('plantaoAtivo')) ?? false,
            registros: JSON.parse(localStorage.getItem('registros')) || [],
            historico: JSON.parse(localStorage.getItem('historicoPlantao')) || [],
            dataInicio: JSON.parse(localStorage.getItem('dataInicio')) || null,
            passagens: JSON.parse(localStorage.getItem('passagens')) || [],
            plantaoId: JSON.parse(localStorage.getItem('plantaoId')) || `plantao-${Date.now()}`,
            turno: JSON.parse(localStorage.getItem('turno')) || null
        };

        // Horário do plantão (07:00 às 19:00 para Plantão A, 19:00 às 07:00 para Plantão B)
        this.HORARIO_INICIO_PLANTAO_A = 7; // 07:00
        this.HORARIO_FIM_PLANTAO_A = 19; // 19:00
        this.HORARIO_INICIO_PLANTAO_B = 19; // 19:00
        this.HORARIO_FIM_PLANTAO_B = 7; // 07:00 do dia seguinte

        this.registroSelecionado = null;
        this.passagemSelecionada = null;
        this.initElements();
        this.initEventos();
        this.atualizarInterface();
        this.atualizarHorario();
        this.atualizarStatusPlantao();
        this.verificarAtividadeSemPlantao();
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
            plantaoTurno: document.getElementById('plantao-turno')
        };
    }

    initEventos() {
        // Botão flutuante principal com comportamento contextual
        this.elements.btnFlutuantePrincipal.addEventListener('click', () => {
            const abaAtiva = document.querySelector('.aba.ativa').dataset.aba;
            if (abaAtiva === 'intercorrencia') {
                this.abrirModal();
            } else if (abaAtiva === 'pendencia') {
                this.abrirModalNovaPassagem();
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

        // Evento para adicionar informação a pendência
        this.elements.passagensContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-acrescentar-passagem')) {
                const passagemId = e.target.dataset.id;
                this.passagemSelecionada = this.plantaoAtivo.passagens.find(p => p.id === passagemId);
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

        // Eventos para o modal de confirmação genérico
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

    fecharModalConfirmacao() {
        this.elements.modalConfirmacao.style.display = 'none';
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

    determinarTurnoAtual() {
        const agora = new Date();
        const hora = agora.getHours();
        
        // Plantão A: 07:00 - 19:00
        if (hora >= this.HORARIO_INICIO_PLANTAO_A && hora < this.HORARIO_FIM_PLANTAO_A) {
            return {
                tipo: 'A',
                inicio: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), this.HORARIO_INICIO_PLANTAO_A, 0),
                termino: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), this.HORARIO_FIM_PLANTAO_A, 0),
                periodo: '07:00 - 19:00'
            };
        } 
        // Plantão B: 19:00 - 07:00 (do dia seguinte)
        else {
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
        const dezMinutos = 10 * 60 * 1000; // 10 minutos em milissegundos
        
        return {
            emZonaCinza: (agora - turno.inicio) < dezMinutos || (turno.termino - agora) < dezMinutos,
            turnoAtual: turno.tipo,
            proximoTurno: turno.tipo === 'A' ? 'B' : 'A'
        };
    }

    iniciarVerificacaoAutomatica() {
        setInterval(() => {
            // Verificar se precisa trocar de plantão
            const agora = new Date();
            const turno = this.determinarTurnoAtual();
            
            if (!this.plantaoAtivo.ativo && 
                agora >= turno.inicio && 
                agora < turno.termino) {
                this.iniciarPlantaoAutomatico();
            }
            
            // Atualizar zona cinza
            this.atualizarZonaCinza();
        }, 60000); // Verificar a cada minuto
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
        this.plantaoAtivo.ativo = false;
        this.plantaoAtivo.registros = [];
        
        // Mantém pendências não resolvidas
        this.plantaoAtivo.passagens = this.plantaoAtivo.passagens.filter(p => !p.resolvido);
        
        // Novo ID para próximo plantão
        this.plantaoAtivo.plantaoId = `plantao-${Date.now()}`;
        
        this.salvarLocalStorage();
        this.atualizarInterface();
        this.atualizarStatusPlantao();
    }

    verificarInicioAutomatico() {
        const turno = this.determinarTurnoAtual();
        const agora = new Date();
        
        if (agora >= turno.inicio && agora < turno.termino) {
            this.iniciarPlantaoAutomatico();
        }
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

            // Atualizar informações do turno
            const turno = this.determinarTurnoAtual();
            this.elements.plantaoTurno.textContent = `Plantão ${turno.tipo} (${turno.periodo})`;
            
            const inicio = new Date(this.plantaoAtivo.dataInicio);
            this.elements.horarioInicio.textContent = 
                inicio.toLocaleString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
        } else {
            this.elements.statusElement.classList.remove('ativo');
            this.elements.statusElement.classList.add('inativo');
            this.elements.statusTexto.textContent = 'Plantão Inativo';
            
            this.elements.barraPesquisaPlantao.style.display = 'none';
            this.elements.abaIntercorrencia.style.display = 'none';
            this.elements.abaPendencia.style.display = 'flex';
            this.mostrarAba('pendencia');

            this.elements.plantaoTurno.textContent = "Plantão Inativo";
            this.elements.horarioInicio.textContent = "";
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
        localStorage.setItem('plantaoAtivo', JSON.stringify(this.plantaoAtivo.ativo));
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
    
    fecharModalNovaPassagem() {
        this.elements.modalNovaPassagem.style.display = 'none';
        this.elements.formNovaPassagem.reset();
    }
    
    abrirEditarPassagem(passagem) {
        this.passagemSelecionada = passagem;
        
        // Preencher campos
        document.getElementById('editar-passagem-paciente').value = passagem.paciente || '';
        document.getElementById('editar-passagem-leito').value = passagem.leito || '';
        document.getElementById('editar-passagem-atendimento').value = passagem.atendimento || '';
        this.elements.inputEditarPassagemTexto.value = passagem.texto;
        
        // Selecionar o tipo correto
        document.getElementById('tipo-editar-passagem').value = passagem.tipo;
        
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

    fecharModal() {
        this.elements.modal.style.display = 'none';
        this.elements.form.reset();
    }

    async salvarRegistro(e) {
        e.preventDefault();
        
        const nomePaciente = document.getElementById('paciente').value.trim();
        const leito = document.getElementById('leito').value.trim();
        const atendimento = document.getElementById('atendimento').value.trim();
        const descricao = document.getElementById('ocorrencia').value.trim();
        
        // Verificar duplicidade
        const pacienteExistente = this.plantaoAtivo.registros.find(
            registro => registro.atendimento.toLowerCase() === atendimento.toLowerCase()
        );
        
        if (pacienteExistente) {
            await this.exibirConfirmacao('Já existe um registro para este paciente no plantão atual.', 'Registro Duplicado');
            return;
        }
        
        const primeiroRegistro = this.plantaoAtivo.registros.length === 0;
        
        if (!this.plantaoAtivo.ativo) {
            if (this.verificarHorarioAtivo()) {
                if (await this.exibirConfirmacao('Plantão encerrado mas dentro do horário ativo. Deseja reabrir o plantão?', 'Reabrir Plantão')) {
                    this.iniciarPlantaoAutomatico();
                } else {
                    return;
                }
            } else {
                const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                if (await this.exibirConfirmacao(`Plantão iniciado às ${horaAtual}. Está correto?`, 'Iniciar Plantão')) {
                    this.iniciarPlantaoAutomatico();
                } else {
                    return; // Usuário cancelou
                }
            }
        }
        
        const novoRegistro = {
            id: Date.now(),
            paciente: nomePaciente,
            leito: leito,
            atendimento: atendimento,
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

    async salvarNovaPassagem() {
        if (!this.plantaoAtivo.ativo) {
            if (await this.exibirConfirmacao('Plantão ainda não iniciado. Deseja iniciar agora?', 'Iniciar Plantão')) {
                this.iniciarPlantaoAutomatico();
            } else {
                return;
            }
        }

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

    salvarEdicaoPassagem() {
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

    salvarAcrescimo() {
        const texto = document.getElementById('input-acrescentar').value.trim();
        
        if (texto && (this.registroSelecionado || this.passagemSelecionada)) {
            const novaEntrada = {
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
        } else if (abaNome === 'pendencia') {
            this.carregarPassagens();
        }
        this.configurarBotaoFlutuante();
    }

    carregarPassagens() {
        this.elements.passagensContainer.innerHTML = '';
        this.atualizarContadorPassagens();
        
        // Ordenar pendências por data (mais recente primeiro)
        const passagensOrdenadas = [...this.plantaoAtivo.passagens].sort((a, b) => 
            new Date(b.dataCriacao) - new Date(a.dataCriacao)
        );
        
        if (passagensOrdenadas.length === 0) {
            const semRegistros = document.createElement('div');
            semRegistros.className = 'sem-registros';
            semRegistros.textContent = 'Nenhuma pendência registrada';
            this.elements.passagensContainer.appendChild(semRegistros);
            return;
        }
        
        passagensOrdenadas.forEach(passagem => {
            const card = document.createElement('div');
            card.className = `passagem-card ${passagem.tipo} ${passagem.resolvido ? 'passagem-resolvida' : ''}`;
            card.dataset.id = passagem.id;
            
            // Informações do paciente (sem rótulos)
            const dadosPaciente = [];
            if (passagem.paciente) dadosPaciente.push(`<span>${passagem.paciente}</span>`);
            if (passagem.leito) dadosPaciente.push(`<span>${passagem.leito}</span>`);
            if (passagem.atendimento) dadosPaciente.push(`<span>${passagem.atendimento}</span>`);
            
            const infoPaciente = dadosPaciente.length 
                ? `<div class="info-paciente">${dadosPaciente.join('')}</div>`
                : '';
            
            card.innerHTML = `
                <div class="cabecalho-registro">
                    <h3><span class="tipo-tag">${this.formatarTipo(passagem.tipo)}</span></h3>
                    <div class="controles-passagem">
                        ${!passagem.resolvido ? `
                            <button class="btn-editar">Editar</button>
                            <button class="btn-resolver">Resolver</button>
                        ` : ''}
                        <button 
                            class="btn-acrescentar btn-acrescentar-passagem" 
                            data-id="${passagem.id}"
                            title="Acrescentar informação"
                        >+</button>
                    </div>
                </div>
                ${infoPaciente}
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

    formatarTipo(tipo) {
        const tipos = {
            'transferencia': 'Transferência',
            'checagem-exame': 'Checagem de exame',
            'reavaliacao': 'Reavaliação',
            'outros': 'Outros'
        };
        return tipos[tipo] || tipo;
    }

    carregarHistoricoPlantao() {
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

        this.elements.historicoContainer.innerHTML = this.plantaoAtivo.historico.length > 0 
            ? this.plantaoAtivo.historico.map(plantao => {
                const inicioDate = new Date(plantao.inicio);
                const terminoDate = new Date(plantao.termino);
                
                // Verificar se o plantão atravessou dias
                const mesmoDia = inicioDate.getDate() === terminoDate.getDate() && 
                                inicioDate.getMonth() === terminoDate.getMonth() &&
                                inicioDate.getFullYear() === terminoDate.getFullYear();
                
                const dataFormatada = mesmoDia ? 
                    inicioDate.toLocaleDateString('pt-BR') : 
                    `${inicioDate.toLocaleDateString('pt-BR')} - ${terminoDate.toLocaleDateString('pt-BR')}`;
                
                return `
                <div class="plantao-card" data-id="${plantao.id}">
                    <div class="cabecalho-registro">
                        <h3>
                            <span class="tipo-tag">Plantão ${plantao.turno}</span>
                            ${dataFormatada}
                        </h3>
                        <div class="duracao-plantao">${plantao.duracao}</div>
                    </div>
                    <div class="resumo-plantao">
                        <span>${plantao.periodo}</span>
                        <span>Registros: ${plantao.registros.length}</span>
                        <span>Pendências: ${plantao.passagens.length}</span>
                        <span>Unidade: ${plantao.setor}</span>
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
                                    <div class="info-paciente">
                                        <span>${registro.leito}</span>
                                        <span>${registro.atendimento}</span>
                                    </div>
                                    ${registro.historico.map(entry => `
                                        <p>${entry.texto}</p>
                                        <small>${entry.autor} - ${entry.data}</small>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                        <div class="historico-passagens">
                            <h4>Pendências</h4>
                            ${plantao.passagens.length > 0 ? 
                                plantao.passagens.map(passagem => `
                                    <div class="passagem-card ${passagem.tipo} ${passagem.resolvido ? 'passagem-resolvida' : ''}">
                                        <div class="cabecalho-registro">
                                            <h3><span class="tipo-tag">${this.formatarTipo(passagem.tipo)}</span></h3>
                                        </div>
                                        <div class="info-paciente">
                                            ${passagem.paciente ? `<span>${passagem.paciente}</span>` : ''}
                                            ${passagem.leito ? `<span>${passagem.leito}</span>` : ''}
                                            ${passagem.atendimento ? `<span>${passagem.atendimento}</span>` : ''}
                                        </div>
                                        <div class="historico-registro">
                                            <div class="entrada-registro">
                                                <p>${passagem.texto}</p>
                                                <small>Criado: ${new Date(passagem.dataCriacao).toLocaleString('pt-BR')}</small>
                                            </div>
                                        </div>
                                    </div>
                                `).join('') 
                                : '<p>Todas as pendências resolvidas</p>'
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
                        <div class="info-paciente">
                            <span>${registro.leito}</span>
                            <span>${registro.atendimento}</span>
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
                
                this.exibirConfirmacao(`Você esqueceu de iniciar seu plantão? Detectamos atividade desde ${new Date().toLocaleTimeString('pt-BR')}. Deseja iniciar agora?`, 'Plantão não iniciado')
                    .then(confirmado => {
                        if (confirmado) {
                            this.iniciarPlantaoAutomatico();
                        }
                    });
            }
        }, 30 * 60 * 1000); // 30 minutos
    }

    // Verifica se está dentro do horário do plantão (07:00 às 19:00)
    verificarHorarioAtivo() {
        const agora = new Date();
        const horaAtual = agora.getHours();
        return horaAtual >= this.HORARIO_INICIO_PLANTAO_A && 
               horaAtual < this.HORARIO_FIM_PLANTAO_A;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const plantao = new PlantaoManager();
});
