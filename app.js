// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa serviços
    StorageService.init();
    AuthService.init();
    PlantaoService.init();
    RegistroService.init();
    AdminService.init();
    AuditService.init();
    UIService.init();
    
    // Carrega dados iniciais
    loadSampleData();
    
    // Atualiza a interface
    UIService.updateUI();
    
    // Atualiza o relógio a cada minuto
    setInterval(() => {
        UIService.updateClock();
        PlantaoService.checkActiveShift(); // Verifica plantões ativos periodicamente
    }, 60000);
});

// Carrega dados de exemplo
function loadSampleData() {
    // Verifica se já existem dados no localStorage
    if (!StorageService.getData('users')) {
        // Dados iniciais
        const sampleData = {
            users: [
                {
                    id: '1',
                    name: 'Dr. Coordenador',
                    email: 'coordenador@hospital.com',
                    password: '123456',
                    role: 'coordinator',
                    approved: true,
                    sectorId: 'cti-norte'
                },
                {
                    id: '2',
                    name: 'Dr. Roberto Silva',
                    email: 'roberto@hospital.com',
                    password: '123456',
                    role: 'doctor',
                    approved: true,
                    sectorId: 'cti-norte'
                },
                {
                    id: '3',
                    name: 'Dra. Ana Costa',
                    email: 'ana@hospital.com',
                    password: '123456',
                    role: 'doctor',
                    approved: true,
                    sectorId: 'cti-norte'
                },
                {
                    id: '4',
                    name: 'Dr. Carlos Mendes',
                    email: 'carlos@hospital.com',
                    password: '123456',
                    role: 'doctor',
                    approved: false, // Não aprovado ainda
                    sectorId: 'cti-norte'
                }
            ],
            sectors: [
                { id: 'cti-norte', name: 'CTI Norte', grayZone: 10 },
                { id: 'cti-sul', name: 'CTI Sul', grayZone: 10 },
                { id: 'cti-leste', name: 'CTI Leste', grayZone: 10 }
            ],
            shifts: [],
            records: [],
            auditLog: []
        };
        
        // Salva os dados
        StorageService.saveData('users', sampleData.users);
        StorageService.saveData('sectors', sampleData.sectors);
        StorageService.saveData('shifts', sampleData.shifts);
        StorageService.saveData('records', sampleData.records);
        StorageService.saveData('auditLog', sampleData.auditLog);
    }
}