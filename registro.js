// Serviço de CRUD de registros
const RegistroService = {
    init: function() {
        // Configura listeners
        document.getElementById('fab').addEventListener('click', this.openCreateModal.bind(this));
    },
    
    getRecords: function(type) {
        if (!PlantaoService.currentShift) return [];
        
        const records = StorageService.getData('records') || [];
        return records.filter(r => 
            r.type === type && 
            r.shiftId === PlantaoService.currentShift.id
        );
    },
    
    createRecord: function(recordData) {
        if (!PlantaoService.currentShift) {
            UIService.showAlert('Nenhum plantão ativo', 'warning');
            return;
        }
        
        const newRecord = {
            id: `rec-${Date.now()}`,
            ...recordData,
            shiftId: PlantaoService.currentShift.id,
            doctorId: AuthService.currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const records = StorageService.getData('records') || [];
        records.push(newRecord);
        StorageService.saveData('records', records);
        
        // Registra ação na auditoria
        AuditService.logAction(`Registrou ${recordData.type}`, `Paciente: ${recordData.patientName}`);
        
        // Atualiza UI
        UIService.updateUI();
        
        UIService.showAlert('Registro criado com sucesso!', 'success');
        
        return newRecord;
    },
    
    updateRecord: function(recordId, updates) {
        const records = StorageService.getData('records') || [];
        const recordIndex = records.findIndex(r => r.id === recordId);
        
        if (recordIndex === -1) {
            UIService.showAlert('Registro não encontrado', 'error');
            return;
        }
        
        const updatedRecord = {
            ...records[recordIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        records[recordIndex] = updatedRecord;
        StorageService.saveData('records', records);
        
        // Registra ação na auditoria
        AuditService.logAction(`Atualizou ${updatedRecord.type}`, `ID: ${recordId}`);
        
        // Atualiza UI
        UIService.updateUI();
        
        UIService.showAlert('Registro atualizado com sucesso!', 'success');
        
        return updatedRecord;
    },
    
    deleteRecord: function(recordId) {
        const records = StorageService.getData('records') || [];
        const recordIndex = records.findIndex(r => r.id === recordId);
        
        if (recordIndex === -1) {
            UIService.showAlert('Registro não encontrado', 'error');
            return;
        }
        
        const [deletedRecord] = records.splice(recordIndex, 1);
        StorageService.saveData('records', records);
        
        // Registra ação na auditoria
        AuditService.logAction(`Excluiu ${deletedRecord.type}`, `ID: ${recordId}`);
        
        // Atualiza UI
        UIService.updateUI();
        
        UIService.showAlert('Registro excluído com sucesso!', 'success');
        
        return deletedRecord;
    },
    
    openCreateModal: function() {
        // Determina o tipo de registro com base na aba ativa
        const activeTab = document.querySelector('.tab.active');
        if (!activeTab) return;
        
        const recordType = activeTab.getAttribute('data-tab');
        UIService.renderRecordModal(recordType);
    }
};