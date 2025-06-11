// Serviço de autenticação
const AuthService = {
    currentUser: null,
    currentSector: null,
    
    init: function() {
        // Tenta recuperar sessão ativa
        const session = StorageService.getData('session');
        if (session) {
            this.currentUser = session.user;
            this.currentSector = session.sector;
        }
        
        // Configura listeners
        document.getElementById('login-btn').addEventListener('click', this.login.bind(this));
        document.getElementById('logout-btn')?.addEventListener('click', this.logout.bind(this));
    },
    
    login: function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const sectorId = document.getElementById('login-sector').value;
        
        // Validação básica
        if (!email || !password) {
            UIService.showAlert('Por favor, preencha todos os campos', 'warning');
            return;
        }
        
        // Busca usuário
        const users = StorageService.getData('users') || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            UIService.showAlert('Credenciais inválidas', 'error');
            return;
        }
        
        if (!user.approved && user.role !== 'coordinator') {
            UIService.showAlert('Seu cadastro ainda não foi aprovado pelo coordenador', 'warning');
            return;
        }
        
        // Busca setor
        const sectors = StorageService.getData('sectors') || [];
        const sector = sectors.find(s => s.id === sectorId);
        
        if (!sector) {
            UIService.showAlert('Setor inválido', 'error');
            return;
        }
        
        // Define usuário e setor atuais
        this.currentUser = user;
        this.currentSector = sector;
        
        // Salva sessão
        StorageService.saveData('session', {
            user: this.currentUser,
            sector: this.currentSector
        });
        
        // Fecha modal de login
        document.getElementById('login-modal').classList.remove('active');
        
        // Atualiza UI
        UIService.updateUI();
        
        UIService.showAlert('Login realizado com sucesso!', 'success');
    },
    
    logout: function() {
        // Remove sessão
        StorageService.removeData('session');
        this.currentUser = null;
        this.currentSector = null;
        
        // Mostra modal de login
        document.getElementById('login-modal').classList.add('active');
        
        // Atualiza UI
        UIService.updateUI();
        
        UIService.showAlert('Você saiu do sistema', 'info');
    },
    
    isCoordinator: function() {
        return this.currentUser?.role === 'coordinator';
    }
};
