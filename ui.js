// Serviço de manipulação de UI
const UIService = {
    init: function() {
        // Configura listeners gerais
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        // Navegação na sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                
                if (target === 'logout') {
                    AuthService.logout();
                    return;
                }
                
                // Atualiza item ativo
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Atualiza conteúdo conforme o target
                this.updateContent(target);
            });
        });
        
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                // Atualiza tab ativa
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Atualiza conteúdo conforme a tab
                this.updateContent(tabName);
            });
        });
        
        // Fechar modal
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            document.getElementById('modal-overlay').classList.remove('active');
        });
        
        // Cancelar modal
        document.getElementById('cancel-record')?.addEventListener('click', () => {
            document.getElementById('modal-overlay').classList.remove('active');
        });
    },
    
    updateUI: function() {
        // Atualiza informações do usuário
        this.updateUserInfo();
        
        // Atualiza informações do plantão
        this.updateShiftInfo();
        
        // Atualiza relógio
        this.updateClock();
        
        // Atualiza conteúdo com base no item ativo
        const activeNavItem = document.querySelector('.nav-item.active');
        if (activeNavItem) {
            const target = activeNavItem.getAttribute('data-target');
            this.updateContent(target);
        }
    },
    
    updateUserInfo: function() {
        if (AuthService.currentUser) {
            const avatar = document.querySelector('.profile-avatar');
            const name = document.querySelector('.profile-info > div > div:first-child');
            const role = document.querySelector('.profile-info > div > div:last-child');
            
            if (avatar) {
                // Iniciais do nome
                const initials = AuthService.currentUser.name.split(' ')
                    .map(n => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();
                avatar.textContent = initials;
            }
            
            if (name) name.textContent = AuthService.currentUser.name;
            if (role) {
                const roleText = AuthService.currentUser.role === 'coordinator' ? 
                    'Coordenador' : 'Médico';
                role.textContent = `${roleText} - ${AuthService.currentSector?.name || ''}`;
            }
        }
    },
    
    updateShiftInfo: function() {
        const shiftInfo = PlantaoService.getShiftInfo();
        const shiftTimer = document.querySelector('.shift-timer');
        
        if (shiftInfo && shiftTimer) {
            shiftTimer.textContent = `${shiftInfo.type} (${shiftInfo.start} - ${shiftInfo.end})`;
        } else if (shiftTimer) {
            shiftTimer.textContent = 'Nenhum plantão ativo';
        }
    },
    
    updateClock: function() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const timeElement = document.querySelector('.current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleDateString('pt-BR', options);
        }
    },
    
    updateContent: function(target) {
        // Oculta todos os containers
        document.querySelectorAll('.card-container, .audit-log').forEach(el => {
            el.style.display = 'none';
        });
        
        // Mostra o container relevante
        switch (target) {
            case 'intercorrencias':
                this.renderIntercorrencias();
                document.getElementById('intercorrencias-container').style.display = 'grid';
                break;
                
            case 'pendencias':
                this.renderPendencias();
                document.getElementById('pendencias-container').style.display = 'grid';
                break;
                
            case 'altas':
                this.renderAltas();
                break;
                
            case 'historico':
                this.renderHistorico();
                break;
                
            case 'auditoria':
                this.renderAuditLog();
                document.getElementById('audit-log-container').style.display = 'block';
                break;
                
            case 'dashboard':
                // Mostra todos os elementos do dashboard
                document.querySelectorAll('.card-container, .audit-log').forEach(el => {
                    el.style.display = '';
                });
                break;
        }
    },
    
    renderIntercorrencias: function() {
        const container = document.getElementById('intercorrencias-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const records = RegistroService.getRecords('intercorrencia');
        
        if (records.length === 0) {
            container.innerHTML = `
                <div class="no-records">
                    <p>Nenhuma intercorrência registrada neste plantão.</p>
                    <button class="btn btn-primary" id="create-intercorrencia">
                        <i class="material-icons">add</i> Registrar Intercorrência
                    </button>
                </div>
            `;
            
            document.getElementById('create-intercorrencia')?.addEventListener('click', () => {
                UIService.renderRecordModal('intercorrencia');
            });
            
            return;
        }
        
        records.forEach(record => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <div class="patient-name">${record.patientName}</div>
                    <div class="patient-info">Leito ${record.bed} | Atend: ${record.attendanceNumber}</div>
                </div>
                <div class="card-body">
                    <div class="card-item">
                        <div class="item-title">Descrição</div>
                        <div class="item-content">${record.description}</div>
                    </div>
                    <div class="card-item">
                        <div class="item-title">Registrado por</div>
                        <div class="item-content">${this.getUserName(record.doctorId)} (${this.formatDateTime(record.createdAt)})</div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-outline edit-btn" data-id="${record.id}">
                            <i class="material-icons">edit</i> Editar
                        </button>
                        <button class="btn btn-primary complement-btn" data-id="${record.id}">
                            <i class="material-icons">add</i> Complementar
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
            
            // Configura listeners dos botões
            card.querySelector('.edit-btn').addEventListener('click', (e) => {
                const recordId = e.currentTarget.getAttribute('data-id');
                this.openEditModal(recordId);
            });
            
            card.querySelector('.complement-btn').addEventListener('click', (e) => {
                const recordId = e.currentTarget.getAttribute('data-id');
                this.openComplementModal(recordId);
            });
        });
    },
    
    renderPendencias: function() {
        const container = document.getElementById('pendencias-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const records = RegistroService.getRecords('pendencia');
        
        if (records.length === 0) {
            container.innerHTML = `
                <div class="no-records">
                    <p>Nenhuma pendência registrada neste plantão.</p>
                    <button class="btn btn-primary" id="create-pendencia">
                        <i class="material-icons">add</i> Registrar Pendência
                    </button>
                </div>
            `;
            
            document.getElementById('create-pendencia')?.addEventListener('click', () => {
                UIService.renderRecordModal('pendencia');
            });
            
            return;
        }
        
        records.forEach(record => {
            const pendencies = record.description.split('\n');
            const pendencyCount = pendencies.filter(p => p.trim()).length;
            
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <div>
                            <div class="patient-name">${record.patientName}</div>
                            <div class="patient-info">Leito ${record.bed} | Atend: ${record.attendanceNumber}</div>
                        </div>
                        <div class="pending-count">${pendencyCount}</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-item">
                        <div class="item-title">Pendências</div>
                        <div class="item-content">
                            <ul style="padding-left: 20px;">
                                ${pendencies.map(p => p.trim() ? `<li>${p}</li>` : '').join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-outline resolve-btn" data-id="${record.id}">
                            <i class="material-icons">check</i> Resolver
                        </button>
                        <button class="btn btn-danger delete-btn" data-id="${record.id}">
                            <i class="material-icons">delete</i> Excluir
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
            
            // Configura listeners dos botões
            card.querySelector('.resolve-btn').addEventListener('click', (e) => {
                const recordId = e.currentTarget.getAttribute('data-id');
                RegistroService.deleteRecord(recordId);
            });
            
            card.querySelector('.delete-btn').addEventListener('click', (e) => {
                if (confirm('Tem certeza que deseja excluir esta pendência?')) {
                    const recordId = e.currentTarget.getAttribute('data-id');
                    RegistroService.deleteRecord(recordId);
                }
            });
        });
    },
    
    renderAuditLog: function() {
        const container = document.getElementById('audit-log-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const logs = AuditService.getLogs();
        
        if (logs.length === 0) {
            container.innerHTML = '<p>Nenhum registro de auditoria encontrado.</p>';
            return;
        }
        
        logs.forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.innerHTML = `
                <div class="log-icon">
                    <i class="material-icons">history</i>
                </div>
                <div class="log-content">
                    <div class="log-header">
                        <div class="log-user">${log.userName}</div>
                        <div class="log-time">${this.formatDateTime(log.timestamp)}</div>
                    </div>
                    <div class="log-action">
                        <strong>${log.action}:</strong> ${log.details}
                    </div>
                </div>
            `;
            
            container.appendChild(logItem);
        });
    },
    
    renderRecordModal: function(recordType) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('record-modal');
        
        if (!modalOverlay || !modal) return;
        
        let title, fields;
        
        switch (recordType) {
            case 'intercorrencia':
                title = 'Nova Intercorrência';
                fields = `
                    <div class="form-group">
                        <label class="form-label">Classificação (JCI)</label>
                        <select class="form-control" id="classification">
                            <option>Evento Adverso</option>
                            <option>Incidente sem dano</option>
                            <option>Quase evento</option>
                            <option>Condição insegura</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'pendencia':
                title = 'Nova Pendência';
                fields = `
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-control" id="pendency-type">
                            <option>Medicação</option>
                            <option>Exame</option>
                            <option>Procedimento</option>
                            <option>Documentação</option>
                            <option>Outro</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'alta':
                title = 'Registrar Alta';
                fields = '';
                break;
                
            default:
                title = 'Novo Registro';
                fields = '';
        }
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nome do Paciente</label>
                        <input type="text" class="form-control" id="patient-name" placeholder="Digite o nome do paciente" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Número de Atendimento</label>
                        <input type="text" class="form-control" id="attendance-number" placeholder="Nº de atendimento">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Leito</label>
                        <input type="text" class="form-control" id="bed" placeholder="Número do leito" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Data/Hora</label>
                        <input type="text" class="form-control" id="record-time" value="${this.formatDateTime(new Date())}" readonly>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-control" id="description" rows="4" placeholder="Descreva..." required></textarea>
                </div>
                
                ${fields}
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" id="cancel-record">Cancelar</button>
                <button class="btn btn-primary" id="save-record">Salvar Registro</button>
            </div>
        `;
        
        modalOverlay.classList.add('active');
        
        // Configura listener do botão Salvar
        document.getElementById('save-record').addEventListener('click', () => {
            const patientName = document.getElementById('patient-name').value;
            const attendanceNumber = document.getElementById('attendance-number').value;
            const bed = document.getElementById('bed').value;
            const description = document.getElementById('description').value;
            
            if (!patientName || !bed || !description) {
                this.showAlert('Preencha os campos obrigatórios: Paciente, Leito e Descrição', 'warning');
                return;
            }
            
            RegistroService.createRecord({
                type: recordType,
                patientName,
                attendanceNumber,
                bed,
                description
            });
            
            modalOverlay.classList.remove('active');
        });
    },
    
    getUserName: function(userId) {
        const users = StorageService.getData('users') || [];
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Usuário desconhecido';
    },
    
    formatDateTime: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    showAlert: function(message, type = 'info') {
        // Remove alertas existentes
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) existingAlert.remove();
        
        // Cria novo alerta
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Posiciona no topo
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.padding = '15px 20px';
        alert.style.borderRadius = '4px';
        alert.style.zIndex = '3000';
        alert.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        alert.style.color = 'white';
        
        // Cores por tipo
        switch (type) {
            case 'success':
                alert.style.backgroundColor = 'var(--success)';
                break;
            case 'warning':
                alert.style.backgroundColor = 'var(--warning)';
                break;
            case 'error':
                alert.style.backgroundColor = 'var(--danger)';
                break;
            default:
                alert.style.backgroundColor = 'var(--secondary)';
        }
        
        document.body.appendChild(alert);
        
        // Remove após 3 segundos
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
};
