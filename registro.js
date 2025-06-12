// Serviço de CRUD de registros
const RegistroService = {
    init: function() {},
    
    getRecords: function(type, resolved = false) {
        if (!PlantaoService.currentShift) return [];
        
        const records = StorageService.getData('records') || [];
        return records.filter(r => 
            r.type === type && 
            r.shiftId === PlantaoService.currentShift.id &&
            (resolved ? r.resolved : !r.resolved)
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
            resolved: false,
            shiftId: PlantaoService.currentShift.id,
            doctorId: AuthService.currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const records = StorageService.getData('records') || [];
        records.push(newRecord);
        StorageService.saveData('records', records);
        
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
        
        UIService.updateUI();
        UIService.showAlert('Registro excluído com sucesso!', 'success');
        
        return deletedRecord;
    },
    
    resolvePendency: function(recordId) {
        const records = StorageService.getData('records') || [];
        const recordIndex = records.findIndex(r => r.id === recordId);
        
        if (recordIndex === -1) {
            UIService.showAlert('Pendência não encontrada', 'error');
            return;
        }
        
        const record = records[recordIndex];
        record.resolved = true;
        record.updatedAt = new Date().toISOString();
        
        StorageService.saveData('records', records);
        
        UIService.updateUI();
        UIService.showAlert('Pendência resolvida com sucesso!', 'success');
        
        return record;
    }
};