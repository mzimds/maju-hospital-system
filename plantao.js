// Serviço de gerenciamento de plantões
const PlantaoService = {
    currentShift: null,
    
    init: function() {
        // Tenta ativar o plantão correspondente
        this.activateCurrentShift();
    },
    
    // Verifica e ativa o plantão correspondente ao horário atual
    checkActiveShift: function() {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Determina o turno atual
        let shiftType;
        if (currentHour >= 7 && currentHour < 19) {
            shiftType = 'day';
        } else {
            shiftType = 'night';
        }
        
        // Se já temos um plantão ativo do tipo correto, não faz nada
        if (this.currentShift && this.currentShift.type === shiftType) {
            return;
        }
        
        // Ativa o plantão correspondente
        this.activateCurrentShift();
    },
    
    // Ativa o plantão correspondente ao horário atual
    activateCurrentShift: function() {
        if (!AuthService.currentUser || !AuthService.currentSector) {
            // Usuário não autenticado, não podemos ativar plantão
            return;
        }
        
        const now = new Date();
        const currentHour = now.getHours();
        let shiftType, startTime, endTime;
        
        // Define horários conforme o tipo de plantão
        if (currentHour >= 7 && currentHour < 19) {
            // Plantão diurno
            shiftType = 'day';
            startTime = new Date(now);
            startTime.setHours(7, 0, 0, 0);
            
            // Se o horário atual for antes das 7h, ajusta para o dia anterior
            if (now < startTime) {
                startTime.setDate(startTime.getDate() - 1);
            }
            
            endTime = new Date(startTime);
            endTime.setDate(endTime.getDate() + 1);
            endTime.setHours(7, 0, 0, 0);
        } else {
            // Plantão noturno
            shiftType = 'night';
            startTime = new Date(now);
            startTime.setHours(19, 0, 0, 0);
            
            // Se o horário atual for antes das 19h, ajusta para o dia anterior
            if (now < startTime) {
                startTime.setDate(startTime.getDate() - 1);
            }
            
            endTime = new Date(startTime);
            endTime.setDate(startTime.getDate() + 1);
            endTime.setHours(7, 0, 0, 0);
        }
        
        // Verifica se já existe um plantão ativo para este setor e tipo
        const shifts = StorageService.getData('shifts') || [];
        const existingShift = shifts.find(s => 
            s.active && 
            s.sectorId === AuthService.currentSector.id &&
            s.type === shiftType
        );
        
        if (existingShift) {
            this.currentShift = existingShift;
            return;
        }
        
        // Desativa todos os outros plantões do setor
        shifts.forEach(shift => {
            if (shift.sectorId === AuthService.currentSector.id) {
                shift.active = false;
            }
        });
        
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
        
        shifts.push(newShift);
        StorageService.saveData('shifts', shifts);
        
        this.currentShift = newShift;
        
        // Atualiza UI
        UIService.updateUI();
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