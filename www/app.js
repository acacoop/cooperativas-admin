// Simulación de datos para el MVP (sin backend)
const DEMO_DATA = {
    users: [
        { id: 1, username: 'admin_aca', password: 'admin123', role: 'admin_aca', email: 'admin@aca.com' },
        { id: 2, username: 'operador_aca', password: 'operador123', role: 'operador_aca', email: 'operador@aca.com' },
        { id: 3, username: 'admin_coop_1', password: 'coop123', role: 'admin_coop', email: 'admin@coop1.com', cooperative_id: 2 }
    ],
    
    cooperatives: [
        { id: 1, code: 2, cuit: '30528940931', name: 'COOP. AGRIC. GANAD. LTDA. DE ACEVEDO', votes: 5, substitutes: 5, car: 4, car_name: 'Norte de Buenos Aires', status: 'active' },
        { id: 2, code: 3, cuit: '30529717233', name: 'COOP. AGROP. DE ALCORTA LTDA.', votes: 1, substitutes: 2, car: 3, car_name: 'Centro y Sur de Santa Fe', status: 'active' },
        { id: 3, code: 5, cuit: '30533553555', name: 'SOC.COOP. AGROP. DE ALMAFUERTE LDA', votes: 2, substitutes: 5, car: 5, car_name: 'Córdoba', status: 'active' },
        { id: 4, code: 7, cuit: '33526383309', name: 'SOC.COOP. UNION POPULAR LTDA.', votes: 6, substitutes: 4, car: 5, car_name: 'Córdoba', status: 'active' },
        { id: 5, code: 9, cuit: '33533717999', name: 'COOP. AGROPEC. DE ARMSTRONG LTDA', votes: 1, substitutes: 5, car: 3, car_name: 'Centro y Sur de Santa Fe', status: 'active' },
        { id: 6, code: 11, cuit: '33543617119', name: 'COOP. AGROP MIXTA IRIGOYEN LTDA', votes: 5, substitutes: 1, car: 3, car_name: 'Centro y Sur de Santa Fe', status: 'active' },
        { id: 7, code: 13, cuit: '30529478964', name: 'COOP. LTDA. AGR. GAN.DE SUNCHALES', votes: 2, substitutes: 5, car: 1, car_name: 'Norte de Santa Fé', status: 'active' },
        { id: 8, code: 15, cuit: '30526896110', name: 'COOP. AGRIC. GAN. LTDA. DE ASCENSION', votes: 4, substitutes: 3, car: 4, car_name: 'Norte de Buenos Aires', status: 'active' },
        { id: 9, code: 19, cuit: '30511567455', name: 'PRODUC. RURALES DEL SUD COOP. AGROP', votes: 5, substitutes: 6, car: 6, car_name: 'SO Bs. Aires, La Pampa y Río Negro', status: 'active' },
        { id: 10, code: 29, cuit: '30533752035', name: 'COOP. ARROCERA DE S. SALVADOR LTDA', votes: 6, substitutes: 2, car: 2, car_name: 'Entre Ríos', status: 'active' },
        { id: 11, code: 32, cuit: '30529251331', name: 'COOP. AGRIC.MIXTA LTDA. C. GOMEZ', votes: 5, substitutes: 2, car: 3, car_name: 'Centro y Sur de Santa Fe', status: 'active' },
        { id: 12, code: 36, cuit: '33525427639', name: 'COOP. AGROP. LTDA. DE CARABELAS', votes: 1, substitutes: 2, car: 4, car_name: 'Norte de Buenos Aires', status: 'active' },
        { id: 13, code: 37, cuit: '30530711184', name: 'COOP. AGRIC. AGR. UNIDOS LTDA', votes: 3, substitutes: 4, car: 3, car_name: 'Centro y Sur de Santa Fe', status: 'active' },
        { id: 14, code: 38, cuit: '33530143959', name: 'COOP. AGRIC. GAN. LTDA. DE A. ALSINA', votes: 2, substitutes: 5, car: 6, car_name: 'SO Bs. Aires, La Pampa y Río Negro', status: 'active' },
        { id: 15, code: 41, cuit: '30530583534', name: 'COOP. AGROP. DE CARMEN DE ARECO L.', votes: 3, substitutes: 3, car: 4, car_name: 'Norte de Buenos Aires', status: 'active' }
    ],

    currentUser: null
};

// Estado de la aplicación
const APP_STATE = {
    currentScreen: 'login',
    filteredCooperatives: [],
    searchTerm: ''
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    showScreen('login');
}

function setupEventListeners() {
    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Navigation
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('logoutBtn2').addEventListener('click', handleLogout);
    document.getElementById('cooperativesCard').addEventListener('click', () => showCooperativesList());
    document.getElementById('backToDashboard').addEventListener('click', () => showScreen('dashboard'));
    
    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Demo buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.demo-login')) {
            const role = e.target.closest('.demo-login').dataset.role;
            fillDemoCredentials(role);
        }
    });
}

function fillDemoCredentials(role) {
    const credentials = {
        'admin_aca': { username: 'admin_aca', password: 'admin123' },
        'operador_aca': { username: 'operador_aca', password: 'operador123' },
        'admin_coop': { username: 'admin_coop_1', password: 'coop123' }
    };

    if (credentials[role]) {
        document.getElementById('username').value = credentials[role].username;
        document.getElementById('password').value = credentials[role].password;
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    const spinner = document.getElementById('loginSpinner');
    const btnText = document.getElementById('loginBtnText');
    
    // Show loading
    spinner.classList.remove('hidden');
    btnText.textContent = 'Ingresando...';
    errorDiv.classList.add('hidden');
    
    // Simulate API call delay
    setTimeout(() => {
        const user = DEMO_DATA.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            DEMO_DATA.currentUser = user;
            localStorage.setItem('demoUser', JSON.stringify(user));
            showScreen('dashboard');
        } else {
            errorDiv.textContent = 'Credenciales inválidas';
            errorDiv.classList.remove('hidden');
        }
        
        // Hide loading
        spinner.classList.add('hidden');
        btnText.textContent = 'Ingresar';
    }, 1000);
}

function handleLogout() {
    DEMO_DATA.currentUser = null;
    localStorage.removeItem('demoUser');
    showScreen('login');
    
    // Clear form
    document.getElementById('loginForm').reset();
}

function showScreen(screenName) {
    // Hide all screens
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.add('hidden');
    document.getElementById('cooperativesScreen').classList.add('hidden');
    
    // Show target screen
    document.getElementById(screenName + 'Screen').classList.remove('hidden');
    
    APP_STATE.currentScreen = screenName;
    
    if (screenName === 'dashboard') {
        setupDashboard();
    } else if (screenName === 'cooperatives') {
        setupCooperativesList();
    }
}

function setupDashboard() {
    const user = DEMO_DATA.currentUser;
    if (!user) return;
    
    // Update user info
    document.getElementById('userInfo').textContent = user.username;
    
    // Show/hide cards based on role
    const pendingChangesCard = document.getElementById('pendingChangesCard');
    const myCoopCard = document.getElementById('myCoopCard');
    
    if (user.role === 'admin_aca') {
        pendingChangesCard.classList.remove('hidden');
        myCoopCard.classList.add('hidden');
    } else if (user.role === 'admin_coop') {
        pendingChangesCard.classList.add('hidden');
        myCoopCard.classList.remove('hidden');
    } else {
        pendingChangesCard.classList.add('hidden');
        myCoopCard.classList.add('hidden');
    }
}

function showCooperativesList() {
    showScreen('cooperatives');
}

function setupCooperativesList() {
    const user = DEMO_DATA.currentUser;
    if (!user) return;
    
    // Update user info
    document.getElementById('userInfo2').textContent = user.username;
    
    // Show loading
    document.getElementById('cooperativesLoading').classList.remove('hidden');
    document.getElementById('cooperativesList').classList.add('hidden');
    document.getElementById('cooperativesError').classList.add('hidden');
    
    // Simulate API call
    setTimeout(() => {
        try {
            let cooperatives = [...DEMO_DATA.cooperatives];
            
            // Filter based on user role
            if (user.role === 'admin_coop') {
                cooperatives = cooperatives.filter(coop => coop.id === user.cooperative_id);
            }
            
            APP_STATE.filteredCooperatives = cooperatives;
            renderCooperativesList(cooperatives);
            
            // Hide loading, show list
            document.getElementById('cooperativesLoading').classList.add('hidden');
            document.getElementById('cooperativesList').classList.remove('hidden');
            
            // Update count
            document.getElementById('cooperativesCount').textContent = `Total: ${cooperatives.length} cooperativas`;
            
        } catch (error) {
            document.getElementById('cooperativesLoading').classList.add('hidden');
            document.getElementById('cooperativesError').textContent = 'Error al cargar cooperativas';
            document.getElementById('cooperativesError').classList.remove('hidden');
        }
    }, 800);
}

function renderCooperativesList(cooperatives) {
    const ul = document.getElementById('cooperativesUl');
    const noResults = document.getElementById('noResults');
    
    if (cooperatives.length === 0) {
        ul.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    ul.innerHTML = cooperatives.map(coop => `
        <li class="hover:bg-gray-50 px-4 py-4 sm:px-6 cursor-pointer" onclick="showCooperativeDetail(${coop.id})">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-blue-600 truncate">${coop.name}</p>
                        <div class="ml-2 flex-shrink-0">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Activa
                            </span>
                        </div>
                    </div>
                    <div class="mt-2 sm:flex sm:justify-between">
                        <div class="sm:flex">
                            <p class="text-sm text-gray-500">Código: ${coop.code}</p>
                            <p class="mt-2 text-sm text-gray-500 sm:mt-0 sm:ml-6">CUIT: ${coop.cuit}</p>
                        </div>
                        <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>CAR: ${coop.car_name}</p>
                        </div>
                    </div>
                    <div class="mt-2 text-sm text-gray-500">
                        <span class="mr-4">Votos: ${coop.votes}</span>
                        <span>Suplentes: ${coop.substitutes}</span>
                    </div>
                </div>
                <div class="ml-4">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            </div>
        </li>
    `).join('');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    APP_STATE.searchTerm = searchTerm;
    
    if (!searchTerm) {
        renderCooperativesList(APP_STATE.filteredCooperatives);
        return;
    }
    
    const filtered = APP_STATE.filteredCooperatives.filter(coop => 
        coop.name.toLowerCase().includes(searchTerm) ||
        coop.code.toString().includes(searchTerm) ||
        coop.cuit.includes(searchTerm)
    );
    
    renderCooperativesList(filtered);
}

function showCooperativeDetail(cooperativeId) {
    const coop = DEMO_DATA.cooperatives.find(c => c.id === cooperativeId);
    if (!coop) return;
    
    const user = DEMO_DATA.currentUser;
    const canEdit = user.role === 'admin_aca' || (user.role === 'admin_coop' && user.cooperative_id === cooperativeId);
    
    alert(`Detalle de Cooperativa (MVP):\n\n` +
          `Nombre: ${coop.name}\n` +
          `Código: ${coop.code}\n` +
          `CUIT: ${coop.cuit}\n` +
          `Votos: ${coop.votes}\n` +
          `Suplentes: ${coop.substitutes}\n` +
          `CAR: ${coop.car_name}\n\n` +
          `Permisos: ${canEdit ? 'Puede editar' : 'Solo lectura'}\n\n` +
          `(En la versión completa se abriría una página de detalle con formulario de edición)`);
}

// Check if user is already logged in
window.addEventListener('load', function() {
    const savedUser = localStorage.getItem('demoUser');
    if (savedUser) {
        DEMO_DATA.currentUser = JSON.parse(savedUser);
        showScreen('dashboard');
    }
});

// Demo data expansion (more cooperatives)
DEMO_DATA.cooperatives.push(
    { id: 16, code: 46, cuit: '30581856942', name: 'GRAN. Y ELEV. ARG. DE COLON S.C.L.', votes: 5, substitutes: 5, car: 4, car_name: 'Norte de Buenos Aires', status: 'active' },
    { id: 17, code: 51, cuit: '33525689099', name: 'COOP. AGRICOLA CONESA LTDA.', votes: 2, substitutes: 4, car: 4, car_name: 'Norte de Buenos Aires', status: 'active' },
    { id: 18, code: 59, cuit: '30507878365', name: 'COOP. DEFENSA DE AGRICULTORES LT', votes: 4, substitutes: 2, car: 4, car_name: 'Norte de Buenos Aires', status: 'active' },
    { id: 19, code: 64, cuit: '33503225099', name: 'LA EMANCIPACIONS. C. MIXTA LTDA', votes: 6, substitutes: 1, car: 6, car_name: 'SO Bs. Aires, La Pampa y Río Negro', status: 'active' },
    { id: 20, code: 67, cuit: '30540904061', name: 'COOP. AGROPECUARIA DE DOBLAS LTDA', votes: 2, substitutes: 2, car: 6, car_name: 'SO Bs. Aires, La Pampa y Río Negro', status: 'active' }
);

console.log('🎉 MVP Sistema de Cooperativas cargado');
console.log('👤 Usuarios disponibles:');
console.log('  - admin_aca / admin123 (Admin ACA)');
console.log('  - operador_aca / operador123 (Operador ACA)');
console.log('  - admin_coop_1 / coop123 (Admin Cooperativa)');
