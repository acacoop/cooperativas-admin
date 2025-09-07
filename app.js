// Sistema de Gestión de Cooperativas - ACA MVP
// Datos de demostración y lógica principal

// Datos de demo para el MVP
const DEMO_DATA = {
    users: [
        { username: 'admin_aca', password: 'admin123', role: 'admin_aca', name: 'Administrador ACA' },
        { username: 'operador_aca', password: 'operador123', role: 'operador_aca', name: 'Operador ACA' },
        { username: 'admin_coop_1', password: 'coop123', role: 'admin_coop', name: 'Admin Cooperativa', coopId: 1 }
    ],
    
    cooperatives: [
        {
            id: 1,
            codigo: 'COOP001',
            nombre: 'Cooperativa Agropecuaria Limitada de San Nicolás',
            cuit: '30-12345678-9',
            estado: 'activa',
            localidad: 'San Nicolás',
            provincia: 'Buenos Aires',
            region_car: 'CAR I',
            fecha_constitucion: '1951-03-15',
            telefono: '03364-123456',
            email: 'info@coopsan.com.ar',
            representante_legal: 'Juan Carlos Pérez',
            actividad_principal: 'Acopio y comercialización de cereales'
        },
        {
            id: 2,
            codigo: 'COOP002',
            nombre: 'Cooperativa Agrícola Ganadera de Villa María',
            cuit: '30-23456789-0',
            estado: 'activa',
            localidad: 'Villa María',
            provincia: 'Córdoba',
            region_car: 'CAR II',
            fecha_constitucion: '1948-07-20',
            telefono: '0353-987654',
            email: 'contacto@coopvm.com.ar',
            representante_legal: 'María Elena González',
            actividad_principal: 'Servicios agropecuarios y acopio'
        },
        {
            id: 3,
            codigo: 'COOP003',
            nombre: 'Cooperativa de Productores de Leche de Trenque Lauquen',
            cuit: '30-34567890-1',
            estado: 'activa',
            localidad: 'Trenque Lauquen',
            provincia: 'Buenos Aires',
            region_car: 'CAR III',
            fecha_constitucion: '1955-11-08',
            telefono: '02392-445566',
            email: 'gerencia@cooplactea.com.ar',
            representante_legal: 'Roberto Daniel Fernández',
            actividad_principal: 'Industrialización de productos lácteos'
        },
        {
            id: 4,
            codigo: 'COOP004',
            nombre: 'Cooperativa Agropecuaria de Venado Tuerto',
            cuit: '30-45678901-2',
            estado: 'activa',
            localidad: 'Venado Tuerto',
            provincia: 'Santa Fe',
            region_car: 'CAR IV',
            fecha_constitucion: '1960-02-14',
            telefono: '03462-778899',
            email: 'admin@coopvenado.com.ar',
            representante_legal: 'Ana Beatriz Martínez',
            actividad_principal: 'Acopio y venta de insumos agrícolas'
        },
        {
            id: 5,
            codigo: 'COOP005',
            nombre: 'Cooperativa de Servicios Múltiples de General Pico',
            cuit: '30-56789012-3',
            estado: 'activa',
            localidad: 'General Pico',
            provincia: 'La Pampa',
            region_car: 'CAR V',
            fecha_constitucion: '1963-09-30',
            telefono: '02302-556677',
            email: 'info@coopgpico.com.ar',
            representante_legal: 'Luis Alberto Rodríguez',
            actividad_principal: 'Servicios múltiples agropecuarios'
        },
        {
            id: 6,
            codigo: 'COOP006',
            nombre: 'Cooperativa Tambera de Casilda',
            cuit: '30-67890123-4',
            estado: 'activa',
            localidad: 'Casilda',
            provincia: 'Santa Fe',
            region_car: 'CAR II',
            fecha_constitucion: '1952-12-03',
            telefono: '03464-334455',
            email: 'gerencia@cooptambera.com.ar',
            representante_legal: 'Carlos Eduardo Sánchez',
            actividad_principal: 'Recolección y procesamiento de leche'
        },
        {
            id: 7,
            codigo: 'COOP007',
            nombre: 'Cooperativa Agrícola de Pergamino',
            cuit: '30-78901234-5',
            estado: 'activa',
            localidad: 'Pergamino',
            provincia: 'Buenos Aires',
            region_car: 'CAR I',
            fecha_constitucion: '1949-05-18',
            telefono: '02477-112233',
            email: 'contacto@cooppergamino.com.ar',
            representante_legal: 'Patricia Mónica López',
            actividad_principal: 'Comercialización de granos'
        },
        {
            id: 8,
            codigo: 'COOP008',
            nombre: 'Cooperativa de Productores Apícolas de Azul',
            cuit: '30-89012345-6',
            estado: 'activa',
            localidad: 'Azul',
            provincia: 'Buenos Aires',
            region_car: 'CAR III',
            fecha_constitucion: '1968-04-22',
            telefono: '02281-667788',
            email: 'info@coopapicola.com.ar',
            representante_legal: 'Miguel Ángel Torres',
            actividad_principal: 'Producción y comercialización de miel'
        },
        {
            id: 9,
            codigo: 'COOP009',
            nombre: 'Cooperativa Agroganadera de Río Cuarto',
            cuit: '30-90123456-7',
            estado: 'activa',
            localidad: 'Río Cuarto',
            provincia: 'Córdoba',
            region_car: 'CAR IV',
            fecha_constitucion: '1957-10-11',
            telefono: '0358-889900',
            email: 'administracion@cooprc.com.ar',
            representante_legal: 'Silvia Raquel Morales',
            actividad_principal: 'Engorde y comercialización de ganado'
        },
        {
            id: 10,
            codigo: 'COOP010',
            nombre: 'Cooperativa de Fruticultores de General Roca',
            cuit: '30-01234567-8',
            estado: 'activa',
            localidad: 'General Roca',
            provincia: 'Río Negro',
            region_car: 'CAR VI',
            fecha_constitucion: '1965-06-25',
            telefono: '0298-445566',
            email: 'ventas@coopfrutas.com.ar',
            representante_legal: 'Diego Fernando Herrera',
            actividad_principal: 'Empaque y exportación de frutas'
        },
        {
            id: 11,
            codigo: 'COOP011',
            nombre: 'Cooperativa Vitivinícola de Mendoza Norte',
            cuit: '30-11234567-9',
            estado: 'activa',
            localidad: 'Maipú',
            provincia: 'Mendoza',
            region_car: 'CAR VII',
            fecha_constitucion: '1958-01-14',
            telefono: '0261-223344',
            email: 'bodega@coopvinos.com.ar',
            representante_legal: 'Carmen Beatriz Acosta',
            actividad_principal: 'Elaboración y comercialización de vinos'
        },
        {
            id: 12,
            codigo: 'COOP012',
            nombre: 'Cooperativa de Servicios Agropecuarios de Balcarce',
            cuit: '30-22345678-0',
            estado: 'activa',
            localidad: 'Balcarce',
            provincia: 'Buenos Aires',
            region_car: 'CAR III',
            fecha_constitucion: '1961-08-07',
            telefono: '02266-556677',
            email: 'servicios@coopbalcarce.com.ar',
            representante_legal: 'Fernando José Ramírez',
            actividad_principal: 'Servicios de maquinaria agrícola'
        },
        {
            id: 13,
            codigo: 'COOP013',
            nombre: 'Cooperativa Cerealera de Marcos Juárez',
            cuit: '30-33456789-1',
            estado: 'activa',
            localidad: 'Marcos Juárez',
            provincia: 'Córdoba',
            region_car: 'CAR II',
            fecha_constitucion: '1953-03-19',
            telefono: '03472-778899',
            email: 'cereales@coopmj.com.ar',
            representante_legal: 'Adriana Susana Castro',
            actividad_principal: 'Acopio y comercialización de cereales'
        },
        {
            id: 14,
            codigo: 'COOP014',
            nombre: 'Cooperativa de Productores de Algodón del Chaco',
            cuit: '30-44567890-2',
            estado: 'activa',
            localidad: 'Presidencia Roque Sáenz Peña',
            provincia: 'Chaco',
            region_car: 'CAR V',
            fecha_constitucion: '1970-12-12',
            telefono: '03732-889900',
            email: 'algodon@coopchaco.com.ar',
            representante_legal: 'Oscar Rubén Vargas',
            actividad_principal: 'Desmote y comercialización de algodón'
        },
        {
            id: 15,
            codigo: 'COOP015',
            nombre: 'Cooperativa Hortícola de La Plata',
            cuit: '30-55678901-3',
            estado: 'activa',
            localidad: 'La Plata',
            provincia: 'Buenos Aires',
            region_car: 'CAR I',
            fecha_constitucion: '1964-07-04',
            telefono: '0221-112233',
            email: 'hortalizas@cooplp.com.ar',
            representante_legal: 'Mónica Alejandra Paz',
            actividad_principal: 'Producción y venta de hortalizas'
        },
        {
            id: 16,
            codigo: 'COOP016',
            nombre: 'Cooperativa Avícola de Entre Ríos',
            cuit: '30-66789012-4',
            estado: 'activa',
            localidad: 'Concordia',
            provincia: 'Entre Ríos',
            region_car: 'CAR IV',
            fecha_constitucion: '1966-09-15',
            telefono: '0345-334455',
            email: 'avicola@cooper.com.ar',
            representante_legal: 'Ricardo Daniel Molina',
            actividad_principal: 'Producción avícola y huevos'
        },
        {
            id: 17,
            codigo: 'COOP017',
            nombre: 'Cooperativa de Productores de Soja de Pergamino',
            cuit: '30-77890123-5',
            estado: 'activa',
            localidad: 'Pergamino',
            provincia: 'Buenos Aires',
            region_car: 'CAR I',
            fecha_constitucion: '1972-11-28',
            telefono: '02477-445566',
            email: 'soja@coopsoja.com.ar',
            representante_legal: 'Graciela Noemí Blanco',
            actividad_principal: 'Acopio y procesamiento de soja'
        },
        {
            id: 18,
            codigo: 'COOP018',
            nombre: 'Cooperativa Ganadera de Tandil',
            cuit: '30-88901234-6',
            estado: 'activa',
            localidad: 'Tandil',
            provincia: 'Buenos Aires',
            region_car: 'CAR III',
            fecha_constitucion: '1959-04-10',
            telefono: '02293-667788',
            email: 'ganaderia@cooptandil.com.ar',
            representante_legal: 'Héctor Raúl Domínguez',
            actividad_principal: 'Consignación de hacienda'
        },
        {
            id: 19,
            codigo: 'COOP019',
            nombre: 'Cooperativa de Servicios Públicos de Crespo',
            cuit: '30-99012345-7',
            estado: 'activa',
            localidad: 'Crespo',
            provincia: 'Entre Ríos',
            region_car: 'CAR IV',
            fecha_constitucion: '1962-06-16',
            telefono: '0343-889900',
            email: 'servicios@coopcrespo.com.ar',
            representante_legal: 'Elena Rosa Zimmermann',
            actividad_principal: 'Servicios públicos y telecomunicaciones'
        },
        {
            id: 20,
            codigo: 'COOP020',
            nombre: 'Cooperativa Agroindustrial de San Francisco',
            cuit: '30-00123456-8',
            estado: 'activa',
            localidad: 'San Francisco',
            provincia: 'Córdoba',
            region_car: 'CAR II',
            fecha_constitucion: '1967-02-08',
            telefono: '03564-112233',
            email: 'industria@coopsf.com.ar',
            representante_legal: 'Jorge Alberto Mendez',
            actividad_principal: 'Procesamiento agroindustrial'
        }
    ]
};

// Variables globales
let currentUser = null;
let filteredCooperatives = [];

// Event listeners principales
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Inicialización de la aplicación
function initializeApp() {
    // Verificar si hay una sesión activa
    const savedSession = localStorage.getItem('aca_session');
    if (savedSession) {
        try {
            currentUser = JSON.parse(savedSession);
            showDashboard();
        } catch (e) {
            localStorage.removeItem('aca_session');
            showLogin();
        }
    } else {
        showLogin();
    }

    // Setup event listeners
    setupEventListeners();
}

// Configurar event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout buttons
    const logoutBtns = ['logoutBtn', 'logoutBtn2'];
    logoutBtns.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', handleLogout);
        }
    });

    // Navigation
    const cooperativesCard = document.getElementById('cooperativesCard');
    if (cooperativesCard) {
        cooperativesCard.addEventListener('click', showCooperatives);
    }

    const backToDashboard = document.getElementById('backToDashboard');
    if (backToDashboard) {
        backToDashboard.addEventListener('click', showDashboard);
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }
}

// Manejo del login
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginError = document.getElementById('loginError');

    // Validación básica
    if (!username || !password) {
        showError(loginError, 'Por favor ingresa usuario y contraseña');
        return;
    }

    // Mostrar loading
    loginBtn.disabled = true;
    loginBtnText.textContent = 'Verificando...';
    loginSpinner.classList.remove('hidden');
    hideError(loginError);

    try {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Buscar usuario en datos demo
        const user = DEMO_DATA.users.find(u => 
            u.username === username && u.password === password
        );

        if (user) {
            currentUser = { ...user };
            delete currentUser.password; // No guardar la contraseña

            // Guardar sesión
            localStorage.setItem('aca_session', JSON.stringify(currentUser));

            // Mostrar dashboard
            showDashboard();
        } else {
            showError(loginError, 'Usuario o contraseña incorrectos');
        }
    } catch (error) {
        showError(loginError, 'Error de conexión. Intenta nuevamente.');
    } finally {
        // Restaurar botón
        loginBtn.disabled = false;
        loginBtnText.textContent = 'Ingresar';
        loginSpinner.classList.add('hidden');
    }
}

// Manejo del logout
function handleLogout() {
    localStorage.removeItem('aca_session');
    currentUser = null;
    showLogin();
}

// Mostrar pantalla de login
function showLogin() {
    hideAllScreens();
    document.getElementById('loginScreen').classList.remove('hidden');
    
    // Limpiar formulario
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    hideError(document.getElementById('loginError'));
    
    // Focus en username
    setTimeout(() => {
        document.getElementById('username').focus();
    }, 100);
}

// Mostrar dashboard
function showDashboard() {
    if (!currentUser) {
        showLogin();
        return;
    }

    hideAllScreens();
    document.getElementById('dashboardScreen').classList.remove('hidden');

    // Actualizar información del usuario
    updateUserInfo();

    // Mostrar/ocultar cards según rol
    updateDashboardCards();
}

// Actualizar información del usuario en la UI
function updateUserInfo() {
    const userInfo1 = document.getElementById('userInfo');
    const userInfo2 = document.getElementById('userInfo2');
    
    const roleDisplay = {
        'admin_aca': 'Administrador ACA',
        'operador_aca': 'Operador ACA',
        'admin_coop': 'Admin Cooperativa'
    };

    const displayText = `${currentUser.name} (${roleDisplay[currentUser.role]})`;
    
    if (userInfo1) userInfo1.textContent = displayText;
    if (userInfo2) userInfo2.textContent = displayText;
}

// Actualizar cards del dashboard según rol
function updateDashboardCards() {
    const pendingChangesCard = document.getElementById('pendingChangesCard');
    const myCoopCard = document.getElementById('myCoopCard');

    // Mostrar/ocultar según rol
    if (currentUser.role === 'admin_aca') {
        pendingChangesCard?.classList.remove('hidden');
        myCoopCard?.classList.add('hidden');
    } else if (currentUser.role === 'admin_coop') {
        pendingChangesCard?.classList.add('hidden');
        myCoopCard?.classList.remove('hidden');
    } else {
        pendingChangesCard?.classList.add('hidden');
        myCoopCard?.classList.add('hidden');
    }
}

// Mostrar lista de cooperativas
async function showCooperatives() {
    if (!currentUser) {
        showLogin();
        return;
    }

    hideAllScreens();
    document.getElementById('cooperativesScreen').classList.remove('hidden');

    // Actualizar información del usuario
    updateUserInfo();

    // Mostrar loading
    showLoading();

    try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 800));

        // Filtrar cooperativas según rol
        let cooperativesToShow = [...DEMO_DATA.cooperatives];
        
        if (currentUser.role === 'admin_coop') {
            // Solo mostrar la cooperativa del usuario
            cooperativesToShow = cooperativesToShow.filter(c => c.id === currentUser.coopId);
        }

        filteredCooperatives = cooperativesToShow;
        renderCooperatives();
        
    } catch (error) {
        showCooperativesError('Error al cargar las cooperativas');
    }
}

// Mostrar loading
function showLoading() {
    document.getElementById('cooperativesLoading').classList.remove('hidden');
    document.getElementById('cooperativesList').classList.add('hidden');
    document.getElementById('cooperativesError').classList.add('hidden');
}

// Mostrar error en cooperativas
function showCooperativesError(message) {
    document.getElementById('cooperativesLoading').classList.add('hidden');
    document.getElementById('cooperativesList').classList.add('hidden');
    const errorDiv = document.getElementById('cooperativesError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Renderizar lista de cooperativas
function renderCooperatives() {
    document.getElementById('cooperativesLoading').classList.add('hidden');
    document.getElementById('cooperativesError').classList.add('hidden');
    
    const cooperativesList = document.getElementById('cooperativesList');
    const cooperativesUl = document.getElementById('cooperativesUl');
    const noResults = document.getElementById('noResults');
    const cooperativesCount = document.getElementById('cooperativesCount');

    // Actualizar contador
    const totalCount = DEMO_DATA.cooperatives.length;
    const filteredCount = filteredCooperatives.length;
    cooperativesCount.textContent = `Mostrando ${filteredCount} de ${totalCount} cooperativas`;

    if (filteredCooperatives.length === 0) {
        cooperativesList.classList.remove('hidden');
        cooperativesUl.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    // Renderizar cooperativas
    noResults.classList.add('hidden');
    cooperativesUl.classList.remove('hidden');
    cooperativesList.classList.remove('hidden');

    cooperativesUl.innerHTML = filteredCooperatives.map(coop => `
        <li class="px-6 py-4 hover:bg-gray-50">
            <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0">
                            <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                                <span class="text-sm font-medium text-blue-600">${coop.codigo}</span>
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">
                                ${coop.nombre}
                            </p>
                            <p class="text-sm text-gray-500">
                                ${coop.localidad}, ${coop.provincia} | ${coop.region_car}
                            </p>
                            <p class="text-xs text-gray-400">
                                CUIT: ${coop.cuit} | ${coop.actividad_principal}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="flex-shrink-0 flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${coop.estado}
                    </span>
                    ${currentUser.role !== 'admin_coop' ? `
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Ver detalles
                        </button>
                    ` : ''}
                </div>
            </div>
        </li>
    `).join('');
}

// Manejo de búsqueda
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        // Mostrar todas las cooperativas según rol
        let allCoops = [...DEMO_DATA.cooperatives];
        if (currentUser.role === 'admin_coop') {
            allCoops = allCoops.filter(c => c.id === currentUser.coopId);
        }
        filteredCooperatives = allCoops;
    } else {
        // Filtrar por búsqueda
        let baseCoops = [...DEMO_DATA.cooperatives];
        if (currentUser.role === 'admin_coop') {
            baseCoops = baseCoops.filter(c => c.id === currentUser.coopId);
        }
        
        filteredCooperatives = baseCoops.filter(coop => 
            coop.nombre.toLowerCase().includes(searchTerm) ||
            coop.codigo.toLowerCase().includes(searchTerm) ||
            coop.cuit.includes(searchTerm) ||
            coop.localidad.toLowerCase().includes(searchTerm) ||
            coop.provincia.toLowerCase().includes(searchTerm)
        );
    }
    
    renderCooperatives();
}

// Utilidades para UI
function hideAllScreens() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.add('hidden');
    document.getElementById('cooperativesScreen').classList.add('hidden');
}

function showError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function hideError(errorElement) {
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

// Manejo de responsive design y eventos de resize
window.addEventListener('resize', function() {
    // Aquí se pueden agregar ajustes responsive adicionales si es necesario
});

// Prevenir comportamientos no deseados en formularios
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.type !== 'submit') {
        // Permitir Enter solo en campos de texto específicos
        if (e.target.id === 'searchInput') {
            e.preventDefault();
            return;
        }
    }
});

// Cleanup al cerrar la aplicación
window.addEventListener('beforeunload', function() {
    // Aquí se puede agregar cleanup adicional si es necesario
});

console.log('Sistema de Gestión de Cooperativas ACA - MVP Cargado');
console.log('Datos de demo disponibles:', DEMO_DATA.cooperatives.length, 'cooperativas');
