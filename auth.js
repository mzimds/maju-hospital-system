// Serviço de autenticação
const AuthService = {
    currentUser: null,
    currentSector: null,
    
    init: function() {
        const session = StorageService.getData('session');
        if (session) {
            this.currentUser = session.user;
            this.currentSector = session.sector;
        }
        
        document.getElementById('login-btn').addEventListener('click', this.login.bind(this));
    },
    
    login: function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const sectorId = document.getElementById('login-sector').value;
        
        if (!email || !password) {
            UIService.showAlert('Preencha todos os campos', 'warning');
            return;
        }
        
        const users = StorageService.getData('users') || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            UIService.showAlert('Credenciais inválidas', 'error');
            return;
        }
        
        if (!user.approved && user.role !== 'coordinator') {
            UIService.showAlert('Cadastro não aprovado', 'warning');
            return;
        }
        
        const sectors = StorageService.getData('sectors') || [];
        const sector = sectors.find(s => s.id === sectorId);
        
        if (!sector) {
            UIService.showAlert('Setor inválido', 'error');
            return;
        }
        
        this.currentUser = user;
        this.currentSector = sector;
        
        StorageService.saveData('session', {
            user: this.currentUser,
            sector: this.currentSector
        });
        
        document.getElementById('login-modal').classList.remove('active');
        UIService.updateUI();
        UIService.showAlert('Login realizado com sucesso!', 'success');
    },
    
    logout: function() {
        StorageService.removeData('session');
        this.currentUser = null;
        this.currentSector = null;
        document.getElementById('login-modal').classList.add('active');
        UIService.updateUI();
        UIService.showAlert('Você saiu do sistema', 'info');
    },
    
    isCoordinator: function() {
        return this.currentUser?.role === 'coordinator';
    }
};