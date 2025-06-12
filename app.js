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
            records: [
                {
                    id: 'rec-1',
                    type: 'intercorrencia',
                    patientName: 'João da Silva',
                    attendanceNumber: 'ATD-2023-001',
                    bed: '102A',
                    description: 'Paciente apresentou febre alta de 39°C às 15h. Administrado dipirona 1g IV.',
                    shiftId: '',
                    doctorId: '2',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'rec-2',
                    type: 'pendencia',
                    patientName: 'Maria Oliveira',
                    attendanceNumber: 'ATD-2023-002',
                    bed: '205B',
                    description: 'Realizar exame de sangue\nAtualizar prontuário\nEntrar em contato com família',
                    shiftId: '',
                    doctorId: '3',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    resolved: false
                },
                {
                    id: 'rec-3',
                    type: 'alta',
                    patientName: 'Carlos Santos',
                    attendanceNumber: 'ATD-2023-003',
                    bed: '301C',
                    description: 'Paciente com condições clínicas estáveis para alta médica. Orientado retorno em 7 dias.',
                    shiftId: '',
                    doctorId: '2',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
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