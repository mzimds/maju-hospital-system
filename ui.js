// Serviço de manipulação de UI
const UIService = {
    expandedSections: {},
    
    init: function() {
        this.setupEventListeners();
        document.getElementById('fab-add').addEventListener('click', this.handleFabClick.bind(this));
    },
    
    handleFabClick: function() {
        const activeTab = document.querySelector('.tab.active');
        if (!activeTab) return;
        
        const tabType = activeTab.getAttribute('data-tab');
        
        switch(tabType) {
            case 'intercorrencias':
                this.renderRecordModal('intercorrencia');
                break;
            case 'pendencias':
                this.renderRecordModal('pendencia');
                break;
            case 'altas':
                this.renderRecordModal('alta');
                break;
            default:
                this.renderRecordModal('intercorrencia');
        }
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
                
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                document.getElementById('sidebar').classList.remove('active');
                document.querySelector('.container').classList.remove('active-sidebar');
                
                this.updateContent(target);
            });
        });
        
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                this.updateContent(tabName);
            });
        });
        
        // Fechar modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.id === 'cancel-record') {
                document.getElementById('modal-overlay').classList.remove('active');
            }
        });
        
        // Fechar modal ao clicar no overlay
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-overlay')) {
                document.getElementById('modal-overlay').classList.remove('active');
            }
        });
        
        // Menu toggle para mobile
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
    },
    
    updateUI: function() {
        this.updateUserInfo();
        this.updateShiftInfo();
        this.updateClock();
        this.updateAccessControl();
        
        const activeNavItem = document.querySelector('.nav-item.active');
        if (activeNavItem) {
            const target = activeNavItem.getAttribute('data-target');
            this.updateContent(target);
        } else {
            this.updateContent('dashboard');
        }
    },
    
    updateAccessControl: function() {
        const isCoordinator = AuthService.isCoordinator();
        
        document.querySelectorAll('.coordinator-only').forEach(el => {
            el.style.display = isCoordinator ? 'flex' : 'none';
        });
        
        const sectorName = document.getElementById('sector-name');
        if (sectorName && AuthService.currentSector) {
            sectorName.textContent = AuthService.currentSector.name;
        }
    },
    
    updateUserInfo: function() {
        if (AuthService.currentUser) {
            const avatar = document.querySelector('.profile-avatar');
            const name = document.querySelector('.profile-info > div > div:first-child');
            const role = document.querySelector('.profile-info > div > div:last-child');
            
            if (avatar) {
                const names = AuthService.currentUser.name.split(' ');
                const initials = names[0][0] + (names[1] ? names[1][0] : names[0][1] || '');
                avatar.textContent = initials.toUpperCase();
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
        
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleDateString('pt-BR', options);
        }
    },
    
    updateContent: function(target) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        contentArea.innerHTML = '';
        
        switch (target) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'intercorrencias':
                this.renderIntercorrencias();
                break;
            case 'pendencias':
                this.renderPendencias();
                break;
            case 'altas':
                this.renderAltas();
                break;
            case 'historico':
                this.renderHistorico();
                break;
            case 'auditoria':
                this.renderAuditLog();
                break;
            case 'medicos':
                AdminService.renderPendingDoctors();
                break;
            case 'configuracoes-iniciais':
                this.renderInitialConfig();
                break;
        }
    },
    
    renderDashboard: function() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="indicators-container" id="indicators-container"></div>
            
            <div class="section-title">
                <h3>Pacientes com Intercorrências</h3>
                <a href="#" class="view-all-link" data-target="intercorrencias">Ver todos</a>
            </div>
            <div class="card-container" id="intercorrencias-container"></div>
            
            <div class="section-title">
                <h3>Pacientes com Pendências</h3>
                <a href="#" class="view-all-link" data-target="pendencias">Ver todos</a>
            </div>
            <div class="card-container" id="pendencias-container"></div>
            
            <div class="section-title">
                <h3>Pacientes com Alta</h3>
                <a href="#" class="view-all-link" data-target="altas">Ver todos</a>
            </div>
            <div class="card-container" id="altas-container"></div>
            
            <div class="section-title">
                <h3>Registro de Auditoria</h3>
                <a href="#" class="view-all-link" data-target="auditoria">Ver todos</a>
            </div>
            <div class="audit-log" id="audit-log-container"></div>
        `;
        
        document.querySelectorAll('.view-all-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                document.querySelector(`.tab[data-tab="${target}"]`).classList.add('active');
                this.updateContent(target);
            });
        });
        
        this.renderIndicators();
        this.renderIntercorrencias();
        this.renderPendencias();
        this.renderAltas();
        this.renderAuditLog();
    },
    
    renderIndicators: function() {
        const container = document.getElementById('indicators-container');
        if (!container) return;
        
        const records = StorageService.getData('records') || [];
        const currentShiftId = PlantaoService.currentShift?.id;
        
        if (!currentShiftId) return;
        
        const intercorrenciasCount = records.filter(r => 
            r.type === 'intercorrencia' && 
            r.shiftId === currentShiftId
        ).length;
        
        const pendenciasCount = records.filter(r => 
            r.type === 'pendencia' && 
            r.shiftId === currentShiftId &&
            !r.resolved
        ).length;
        
        const altasCount = records.filter(r => 
            r.type === 'alta' && 
            r.shiftId === currentShiftId
        ).length;
        
        container.innerHTML = `
            <div class="indicator-card slide-in">
                <div class="indicator-icon">
                    <i class="material-icons">assignment</i>
                </div>
                <div class="indicator-content">
                    <div class="indicator-title">Pendências Ativas</div>
                    <div class="indicator-value">${pendenciasCount}</div>
                </div>
            </div>
            <div class="indicator-card slide-in">
                <div class="indicator-icon">
                    <i class="material-icons">local_hospital</i>
                </div>
                <div class="indicator-content">
                    <div class="indicator-title">Intercorrências</div>
                    <div class="indicator-value">${intercorrenciasCount}</div>
                </div>
            </div>
            <div class="indicator-card slide-in">
                <div class="indicator-icon">
                    <i class="material-icons">exit_to_app</i>
                </div>
                <div class="indicator-content">
                    <div class="indicator-title">Altas Recentes</div>
                    <div class="indicator-value">${altasCount}</div>
                </div>
            </div>
            <div class="indicator-card slide-in">
                <div class="indicator-icon">
                    <i class="material-icons">schedule</i>
                </div>
                <div class="indicator-content">
                    <div class="indicator-title">Tempo Médio</div>
                    <div class="indicator-value">42 min</div>
                </div>
            </div>
        `;
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
                this.renderRecordModal('intercorrencia');
            });
            
            return;
        }
        
        records.forEach(record => {
            const card = document.createElement('div');
            card.className = 'card fade-in';
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
            
            card.querySelector('.edit-btn').addEventListener('click', (e) => {
                const recordId = e.currentTarget.getAttribute('data-id');
                this.openEditModal(recordId, 'intercorrencia');
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
                this.renderRecordModal('pendencia');
            });
            
            return;
        }
        
        records.forEach(record => {
            const pendencies = record.description.split('\n');
            const pendencyCount = pendencies.filter(p => p.trim()).length;
            
            const card = document.createElement('div');
            card.className = 'card fade-in';
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
                        <button class="btn btn-success resolve-btn" data-id="${record.id}">
                            <i class="material-icons">check</i> Resolver
                        </button>
                        <button class="btn btn-danger delete-btn" data-id="${record.id}">
                            <i class="material-icons">delete</i> Excluir
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
            
            card.querySelector('.resolve-btn').addEventListener('click', (e) => {
                const recordId = e.currentTarget.getAttribute('data-id');
                RegistroService.resolvePendency(recordId);
            });
            
            card.querySelector('.delete-btn').addEventListener('click', (e) => {
                if (confirm('Tem certeza que deseja excluir esta pendência?')) {
                    const recordId = e.currentTarget.getAttribute('data-id');
                    RegistroService.deleteRecord(recordId);
                }
            });
        });
    },
    
    renderAltas: function() {
        const container = document.getElementById('altas-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const records = RegistroService.getRecords('alta');
        
        if (records.length === 0) {
            container.innerHTML = `
                <div class="no-records">
                    <p>Nenhuma alta registrada neste plantão.</p>
                    <button class="btn btn-primary" id="create-alta">
                        <i class="material-icons">add</i> Registrar Alta
                    </button>
                </div>
            `;
            
            document.getElementById('create-alta')?.addEventListener('click', () => {
                this.renderRecordModal('alta');
            });
            
            return;
        }
        
        records.forEach(record => {
            const card = document.createElement('div');
            card.className = 'card fade-in';
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
                        <button class="btn btn-danger delete-btn" data-id="${record.id}">
                            <i class="material-icons">delete</i> Excluir
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
            
            card.querySelector('.edit-btn').addEventListener('click', (e) => {
                const recordId = e.currentTarget.getAttribute('data-id');
                this.openEditModal(recordId, 'alta');
            });
            
            card.querySelector('.delete-btn').addEventListener('click', (e) => {
                if (confirm('Tem certeza que deseja excluir este registro de alta?')) {
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
            container.innerHTML = '<div class="no-records"><p>Nenhum registro de auditoria encontrado.</p></div>';
            return;
        }
        
        logs.forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item fade-in';
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
                        <label class="form-label">Classificação</label>
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
                        <label class="form-label">Nº de Atendimento</label>
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
        
        document.getElementById('save-record').addEventListener('click', () => {
            const patientName = document.getElementById('patient-name').value;
            const attendanceNumber = document.getElementById('attendance-number').value;
            const bed = document.getElementById('bed').value;
            const description = document.getElementById('description').value;
            
            if (!patientName || !bed || !description) {
                this.showAlert('Preencha os campos obrigatórios', 'warning');
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
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) existingAlert.remove();
        
        const icons = {
            'success': 'check_circle',
            'warning': 'warning',
            'error': 'error',
            'info': 'info'
        };
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="material-icons">${icons[type]}</i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            alert.remove();
        }, 4000);
    }
};