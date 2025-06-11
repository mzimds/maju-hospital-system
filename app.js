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
                }
            ],
            sectors: [
                { id: 'cti-norte', name: 'CTI Norte', grayZone: 10 },
                { id: 'cti-sul', name: 'CTI Sul', grayZone: 10 },
                { id: 'cti-leste', name: 'CTI Leste', grayZone: 10 }
            ],
            shifts: [
                {
                    id: 'shift-1',
                    type: 'night',
                    startTime: '2025-06-12T19:00:00',
                    endTime: '2025-06-13T07:00:00',
                    sectorId: 'cti-norte',
                    doctorId: '2',
                    active: true
                }
            ],
            records: [
                {
                    id: 'rec-1',
                    type: 'intercorrencia',
                    patientName: 'Maria Oliveira',
                    bed: '205',
                    attendanceNumber: '87452',
                    description: 'Febre persistente acima de 38.5°C, sem resposta à medicação inicial. Monitorar sinais vitais a cada 30 min.',
                    shiftId: 'shift-1',
                    doctorId: '2',
                    createdAt: '2025-06-12T20:15:00',
                    updatedAt: '2025-06-12T20:15:00'
                },
                {
                    id: 'rec-2',
                    type: 'intercorrencia',
                    patientName: 'Carlos Mendes',
                    bed: '312',
                    attendanceNumber: '89124',
                    description: 'Queda de saturação de O2 para 88%, requer aumento de suporte ventilatório. Realizar gasometria arterial.',
                    shiftId: 'shift-1',
                    doctorId: '3',
                    createdAt: '2025-06-12T18:45:00',
                    updatedAt: '2025-06-12T18:45:00'
                },
                {
                    id: 'rec-3',
                    type: 'pendencia',
                    patientName: 'Fernanda Almeida',
                    bed: '402',
                    attendanceNumber: '89234',
                    description: 'Solicitar ecocardiograma\nAjustar dose de anticoagulante\nReavaliar função renal',
                    shiftId: 'shift-1',
                    doctorId: '2',
                    createdAt: '2025-06-12T19:30:00',
                    updatedAt: '2025-06-12T19:30:00'
                }
            ],
            auditLog: [
                {
                    id: 'log-1',
                    userId: '2',
                    action: 'Registrou intercorrência',
                    details: 'Paciente: Maria Oliveira (Leito 205)',
                    timestamp: '2025-06-12T20:15:00'
                },
                {
                    id: 'log-2',
                    userId: '3',
                    action: 'Registrou intercorrência',
                    details: 'Paciente: Carlos Mendes (Leito 312)',
                    timestamp: '2025-06-12T18:45:00'
                },
                {
                    id: 'log-3',
                    userId: '2',
                    action: 'Registrou pendência',
                    details: 'Paciente: Fernanda Almeida (Leito 402)',
                    timestamp: '2025-06-12T19:30:00'
                }
            ]
        };
        
        // Salva os dados
        StorageService.saveData('users', sampleData.users);
        StorageService.saveData('sectors', sampleData.sectors);
        StorageService.saveData('shifts', sampleData.shifts);
        StorageService.saveData('records', sampleData.records);
        StorageService.saveData('auditLog', sampleData.auditLog);
    }
}
