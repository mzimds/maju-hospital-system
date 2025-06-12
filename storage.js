// Serviço de armazenamento (LocalStorage)
const StorageService = {
    init: function() {
        if (typeof(Storage) === "undefined") {
            console.error('LocalStorage não suportado');
            return;
        }
    },
    
    getData: function(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    
    saveData: function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    removeData: function(key) {
        localStorage.removeItem(key);
    }
};