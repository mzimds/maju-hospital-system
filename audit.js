// Serviço de registro de auditoria
const AuditService = {
    init: function() {},
    
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
        logs.unshift(newLog);
        StorageService.saveData('auditLog', logs);
        
        if (document.querySelector('.nav-item[data-target="auditoria"]')?.classList.contains('active')) {
            UIService.renderAuditLog();
        }
        
        return newLog;
    },
    
    getLogs: function() {
        const logs = StorageService.getData('auditLog') || [];
        const users = StorageService.getData('users') || [];
        
        return logs.map(log => {
            const user = users.find(u => u.id === log.userId);
            return {
                ...log,
                userName: user ? user.name : 'Usuário desconhecido'
            };
        });
    }
};