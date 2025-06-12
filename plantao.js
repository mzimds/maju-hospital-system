// Serviço de gerenciamento de plantões
const PlantaoService = {
    currentShift: null,
    
    init: function() {
        this.activateCurrentShift();
    },
    
    checkActiveShift: function() {
        const now = new Date();
        const currentHour = now.getHours();
        let shiftType;
        
        if (currentHour >= 7 && currentHour < 19) {
            shiftType = 'day';
        } else {
            shiftType = 'night';
        }
        
        if (this.currentShift && this.currentShift.type === shiftType) {
            return;
        }
        
        this.activateCurrentShift();
    },
    
    activateCurrentShift: function() {
        if (!AuthService.currentUser || !AuthService.currentSector) {
            return;
        }
        
        const now = new Date();
        const currentHour = now.getHours();
        let shiftType, startTime, endTime;
        
        if (currentHour >= 7 && currentHour < 19) {
            shiftType = 'day';
            startTime = new Date(now);
            startTime.setHours(7, 0, 0, 0);
            
            if (now < startTime) {
                startTime.setDate(startTime.getDate() - 1);
            }
            
            endTime = new Date(startTime);
            endTime.setDate(endTime.getDate() + 1);
            endTime.setHours(7, 0, 0, 0);
        } else {
            shiftType = 'night';
            startTime = new Date(now);
            startTime.setHours(19, 0, 0, 0);
            
            if (now < startTime) {
                startTime.setDate(startTime.getDate() - 1);
            }
            
            endTime = new Date(startTime);
            endTime.setDate(startTime.getDate() + 1);
            endTime.setHours(7, 0, 0, 0);
        }
        
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
        
        shifts.forEach(shift => {
            if (shift.sectorId === AuthService.currentSector.id) {
                shift.active = false;
            }
        });
        
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