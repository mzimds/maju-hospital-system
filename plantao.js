// Serviço de gerenciamento de plantões
const PlantaoService = {
    currentShift: null,
    
    init: function() {
        // Tenta recuperar plantão ativo
        const shifts = StorageService.getData('shifts') || [];
        this.currentShift = shifts.find(s => s.active);
    },
    
    startShift: function(shiftType) {
        const now = new Date();
        const startTime = new Date(now);
        const endTime = new Date(now);
        
        // Define horários conforme o tipo de plantão
        if (shiftType === 'day') {
            startTime.setHours(7, 0, 0, 0);
            endTime.setHours(19, 0, 0, 0);
        } else {
            startTime.setHours(19, 0, 0, 0);
            endTime.setDate(endTime.getDate() + 1);
            endTime.setHours(7, 0, 0, 0);
        }
        
        // Cria novo plantão
        const newShift = {
            id: `shift-${Date.now()}`,
            type: shiftType,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            sectorId: AuthService.currentSector.id,
            doctorId: AuthService.currentUser.id,
            active: true
        };
        
        // Desativa qualquer plantão ativo do mesmo médico
        const shifts = StorageService.getData('shifts') || [];
        shifts.forEach(shift => {
            if (shift.doctorId === AuthService.currentUser.id && shift.active) {
                shift.active = false;
            }
        });
        
        // Adiciona o novo plantão
        shifts.push(newShift);
        StorageService.saveData('shifts', shifts);
        
        this.currentShift = newShift;
        
        // Registra ação na auditoria
        AuditService.logAction('Iniciou plantão', `Tipo: ${shiftType === 'day' ? 'Diurno' : 'Noturno'}`);
        
        // Atualiza UI
        UIService.updateUI();
        
        UIService.showAlert('Plantão iniciado com sucesso!', 'success');
    },
    
    endShift: function() {
        if (!this.currentShift) return;
        
        const shifts = StorageService.getData('shifts') || [];
        const shift = shifts.find(s => s.id === this.currentShift.id);
        
        if (shift) {
            shift.active = false;
            shift.endTime = new Date().toISOString();
            StorageService.saveData('shifts', shifts);
            
            // Registra ação na auditoria
            AuditService.logAction('Finalizou plantão', `ID: ${shift.id}`);
            
            this.currentShift = null;
            
            // Atualiza UI
            UIService.updateUI();
            
            UIService.showAlert('Plantão finalizado com sucesso!', 'success');
        }
    },
    
    getShiftInfo: function() {
        if (!this.currentShift) return null;
        
        const shiftType = this.currentShift.type === 'day' ? 'Diurno' : 'Noturno';
        const startTime = new Date(this.currentShift.startTime);
        const endTime = new Date(this.currentShift.endTime);
        
        return {
            type: shiftType,
            start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            end: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }
};