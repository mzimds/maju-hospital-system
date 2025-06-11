// Serviço de painel administrativo
const AdminService = {
    init: function() {
        // Configura listeners específicos para coordenadores
        if (AuthService.isCoordinator()) {
            // Adiciona funcionalidades administrativas
        }
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
        
        // Registra ação na auditoria
        AuditService.logAction('Aprovou médico', `ID: ${doctorId}`);
        
        // Atualiza UI
        UIService.updateUI();
        
        UIService.showAlert('Médico aprovado com sucesso!', 'success');
        
        return users[userIndex];
    }
};
