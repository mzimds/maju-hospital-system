// Serviço de painel administrativo
const AdminService = {
    init: function() {
        if (AuthService.isCoordinator()) {
            this.setupCoordinatorFeatures();
        }
    },
    
    setupCoordinatorFeatures: function() {
        document.querySelector('.nav-item[data-target="medicos"]')?.addEventListener('click', () => {
            this.renderPendingDoctors();
        });
    },
    
    getPendingDoctors: function() {
        const users = StorageService.getData('users') || [];
        return users.filter(u => u.role === 'doctor' && !u.approved);
    },
    
    approveDoctor: function(doctorId) {
        const users = StorageService.getData('users') || [];
        const userIndex = users.findIndex(u => u.id === doctorId);
        
        if (userIndex === -1) {
            UIService.showAlert('Médico não encontrado', 'error');
            return;
        }
        
        users[userIndex].approved = true;
        StorageService.saveData('users', users);
        
        UIService.updateUI();
        UIService.showAlert('Médico aprovado com sucesso!', 'success');
        
        return users[userIndex];
    },
    
    rejectDoctor: function(doctorId) {
        const users = StorageService.getData('users') || [];
        const userIndex = users.findIndex(u => u.id === doctorId);
        
        if (userIndex === -1) return;
        
        users.splice(userIndex, 1);
        StorageService.saveData('users', users);
        
        UIService.updateUI();
        UIService.showAlert('Médico rejeitado com sucesso!', 'success');
    },
    
    renderPendingDoctors: function() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="card-container" id="medicos-container"></div>
        `;
        
        const container = document.getElementById('medicos-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const pendingDoctors = this.getPendingDoctors();
        
        if (pendingDoctors.length === 0) {
            container.innerHTML = '<div class="no-records"><p>Todos os médicos estão aprovados.</p></div>';
            return;
        }
        
        pendingDoctors.forEach(doctor => {
            const card = document.createElement('div');
            card.className = 'card fade-in';
            card.innerHTML = `
                <div class="card-header">
                    <div class="patient-name">${doctor.name}</div>
                    <div class="patient-info">${doctor.email}</div>
                </div>
                <div class="card-body">
                    <div class="card-item">
                        <div class="item-title">Setor</div>
                        <div class="item-content">${doctor.sectorId}</div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-success approve-btn" data-id="${doctor.id}">
                            <i class="material-icons">check</i> Aprovar
                        </button>
                        <button class="btn btn-danger reject-btn" data-id="${doctor.id}">
                            <i class="material-icons">close</i> Rejeitar
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
            
            card.querySelector('.approve-btn').addEventListener('click', (e) => {
                const doctorId = e.currentTarget.getAttribute('data-id');
                this.approveDoctor(doctorId);
            });
            
            card.querySelector('.reject-btn').addEventListener('click', (e) => {
                if (confirm('Tem certeza que deseja rejeitar este médico?')) {
                    const doctorId = e.currentTarget.getAttribute('data-id');
                    this.rejectDoctor(doctorId);
                }
            });
        });
    }
};