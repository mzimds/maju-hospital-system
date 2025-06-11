// Serviço de registro de auditoria
const AuditService = {
    init: function() {
        // Inicialização se necessário
    },
    
    logAction: function(action, details) {
        if (!AuthService.currentUser) return;
        
        const newLog = {
            id: `log-${Date.now()}`,
            userId: AuthService.currentUser.id,
            action,
            details,
            timestamp: new Date().toISOString()
        };
        
        const logs = StorageService.getData('auditLog') || [];
        logs.unshift(newLog); // Adiciona no início
        StorageService.saveData('auditLog', logs);
        
        // Atualiza UI se estiver na aba de auditoria
        if (document.querySelector('.nav-item[data-target="auditoria"]')?.classList.contains('active')) {
            UIService.renderAuditLog();
        }
        
        return newLog;
    },
    
    getLogs: function() {
        const logs = StorageService.getData('auditLog') || [];
        const users = StorageService.getData('users') || [];
        
        // Enriquece os logs com informações do usuário
        return logs.map(log => {
            const user = users.find(u => u.id === log.userId);
            return {
                ...log,
                userName: user ? user.name : 'Usuário desconhecido'
            };
        });
    }
};