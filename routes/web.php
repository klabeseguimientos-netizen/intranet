<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Importaciones
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Comercial\ActividadController;
use App\Http\Controllers\Comercial\ContactosController;
use App\Http\Controllers\Comercial\PresupuestosController;
use App\Http\Controllers\Comercial\RecordatoriosController;
use App\Http\Controllers\Comercial\ProspectosController;
use App\Http\Controllers\Comercial\LeadController;
use App\Http\Controllers\Comercial\MotivoPerdidaController;
use App\Http\Controllers\Comercial\LeadsPerdidosController;
use App\Http\Controllers\Comercial\LocalidadController;
use App\Http\Controllers\Comercial\Cuentas\DetallesController;
use App\Http\Controllers\Comercial\Cuentas\CertificadosFlotaController;
use App\Http\Controllers\Comercial\Cuentas\CambioTitularidadController;
use App\Http\Controllers\Comercial\Cuentas\CambioRazonSocialController;
use App\Http\Controllers\Config\Parametros\EstadosLeadController;
use App\Http\Controllers\Config\Parametros\MediosPagoController;
use App\Http\Controllers\Config\Parametros\MotivosBajaController;
use App\Http\Controllers\Config\Parametros\OrigenProspectoController;
use App\Http\Controllers\Config\Parametros\RubrosController;
use App\Http\Controllers\Config\Parametros\TerminosCondicionesController;
use App\Http\Controllers\Config\TarifasController;
use App\Http\Controllers\Config\PromocionController;
use App\Http\Controllers\Config\Usuarios\UsuariosSistemaController;
use App\Http\Controllers\Config\Usuarios\RolesPermisosController;
use App\Http\Controllers\CondComerciales\TarifasConsultaController;
use App\Http\Controllers\CondComerciales\ConveniosVigentesController;
use App\Http\Controllers\CondComerciales\NovedadesController;
use App\Http\Controllers\CondComerciales\ReenviosActivosController;
use App\Http\Controllers\rrhh\Equipos\EquipoComercialController;
use App\Http\Controllers\rrhh\Equipos\EquipoTecnicoController;
use App\Http\Controllers\rrhh\Personal\CumpleanosController;
use App\Http\Controllers\rrhh\Personal\DatosPersonalesController;
use App\Http\Controllers\rrhh\Personal\LicenciasController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\RRHH\Equipos\TecnicoController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\PresupuestoLegacyController;

// ==================== NUEVOS CONTROLADORES PARA CONTRATOS ====================
use App\Http\Controllers\Comercial\Utils\TipoResponsabilidadController;
use App\Http\Controllers\Comercial\Utils\TipoDocumentoController;
use App\Http\Controllers\Comercial\Utils\PaisController;
use App\Http\Controllers\Comercial\Utils\CategoriaFiscalController;
use App\Http\Controllers\Comercial\Utils\PlataformaController;
use App\Http\Controllers\Comercial\Utils\RubroController;
use App\Http\Controllers\Comercial\Utils\ContratoController;
use App\Http\Controllers\Comercial\Utils\LeadDataController;
use App\Http\Controllers\Comercial\Utils\NacionalidadController;

// Rutas públicas
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::middleware(['auth', 'usuario.activo'])->group(function () {
    // ==================== RUTAS PRINCIPALES ====================
    Route::get('/welcome', [LoginController::class, 'welcome'])->name('welcome');
    Route::get('/', [DashboardController::class, 'index'])->name('home');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // ==================== GESTIÓN COMERCIAL ====================
    Route::prefix('comercial')->group(function () {
        // Rutas simples (sin parámetros) - PRIMERO
        Route::get('/actividad', [ActividadController::class, 'index'])->name('comercial.actividad');
        Route::get('/contactos', [ContactosController::class, 'index'])->name('comercial.contactos');
        Route::get('/prospectos', [ProspectosController::class, 'index'])->name('comercial.prospectos');
        Route::get('/leads-perdidos', [LeadsPerdidosController::class, 'index'])->name('comercial.leadsperdidos');
        Route::get('/tarifas', [TarifasConsultaController::class, 'index'])->name('comercial.tarifas');
        Route::get('/convenios', [ConveniosVigentesController::class, 'index'])->name('comercial.convenios');
        Route::get('/novedades', [NovedadesController::class, 'index'])->name('comercial.novedades');
        Route::get('/reenvios', [ReenviosActivosController::class, 'index'])->name('comercial.reenvios');
        Route::post('/empresa/responsables', [App\Http\Controllers\Comercial\EmpresaResponsableController::class, 'store'])->name('comercial.empresa.responsables.store');
        Route::delete('/empresa/responsables/{id}', [App\Http\Controllers\Comercial\EmpresaResponsableController::class, 'destroy'])->name('comercial.empresa.responsables.destroy');
        // Rutas de creación (sin parámetros) - SEGUNDO
        Route::post('/leads', [LeadController::class, 'store'])->name('comercial.leads.store');
        Route::get('/motivos-perdida-activos', [MotivoPerdidaController::class, 'getMotivosActivos']);
        Route::get('/localidades/buscar', [LocalidadController::class, 'buscar'])->name('comercial.localidades.buscar');
        
        // Rutas con parámetros - ÚLTIMAS
        Route::prefix('leads/{lead}')->group(function () {
            Route::get('/', [LeadController::class, 'show'])->name('comercial.leads.show');
            Route::put('/', [ProspectosController::class, 'update'])->name('leads.update');
            Route::get('/comentarios', [ProspectosController::class, 'comentarios']);
            Route::post('/comentarios', [ProspectosController::class, 'guardarComentario']);
            Route::get('/tiempos-estados', [ProspectosController::class, 'tiemposEntreEstados'])->name('leads.tiempos-estados');
            Route::get('/comentarios-modal-data', [ProspectosController::class, 'comentariosModalData'])->name('leads.comentarios-modal-data');
            Route::get('/datos-alta', [App\Http\Controllers\Comercial\Utils\LeadDataController::class, 'getDatosAlta']);
        });
        
        // Leads perdidos con parámetros
        Route::prefix('leads-perdidos/{lead}')->group(function () {
            Route::get('/modal-seguimiento', [LeadsPerdidosController::class, 'modalSeguimiento'])->name('leads-perdidos.modal-seguimiento');
            Route::post('/seguimiento', [LeadsPerdidosController::class, 'procesarSeguimiento'])->name('leads-perdidos.seguimiento');
        });
        
        // Presupuestos
        Route::get('/presupuestos', [PresupuestosController::class, 'index'])->name('comercial.presupuestos');
        Route::get('/presupuestos/create', [PresupuestosController::class, 'create'])->name('comercial.presupuestos.create');
        Route::post('/presupuestos', [PresupuestosController::class, 'store'])->name('comercial.presupuestos.store');
        Route::get('/presupuestos/{presupuesto}', [PresupuestosController::class, 'show'])->name('comercial.presupuestos.show');
        Route::get('/presupuestos/{presupuesto}/edit', [PresupuestosController::class, 'edit'])->name('comercial.presupuestos.edit');
        Route::put('/presupuestos/{presupuesto}', [PresupuestosController::class, 'update'])->name('comercial.presupuestos.update');
        Route::delete('/presupuestos/{presupuesto}', [PresupuestosController::class, 'destroy'])->name('comercial.presupuestos.destroy');
        Route::get('/presupuestos/{presupuesto}/pdf', [PresupuestosController::class, 'generarPdf'])->name('comercial.presupuestos.pdf');

    Route::prefix('contratos')->group(function () {
        Route::get('/', [App\Http\Controllers\Comercial\ContratoController::class, 'index'])
            ->name('comercial.contratos.index');
        
        // Ruta de creación - SIN PARÁMETROS
        Route::get('/crear/{presupuestoId}', [App\Http\Controllers\Comercial\ContratoController::class, 'create'])
            ->name('comercial.contratos.create');
        
        Route::post('/', [App\Http\Controllers\Comercial\ContratoController::class, 'store'])
            ->name('comercial.contratos.store');
        
        // Rutas con parámetros - ÚLTIMAS
        Route::get('/{id}/pdf', [App\Http\Controllers\Comercial\ContratoController::class, 'generarPdf'])
            ->name('comercial.contratos.pdf');
        
        Route::get('/{id}', [App\Http\Controllers\Comercial\ContratoController::class, 'show'])
            ->name('comercial.contratos.show');
    });



        // Endpoints AJAX para presupuestos
        Route::prefix('api/presupuestos')->group(function () {
            Route::get('/tasas', [PresupuestosController::class, 'getTasas']);
            Route::get('/abonos', [PresupuestosController::class, 'getAbonos']);
            Route::get('/accesorios', [PresupuestosController::class, 'getAccesorios']);
            Route::get('/servicios', [PresupuestosController::class, 'getServicios']);
        });
        
        // Cuentas
        Route::prefix('cuentas')->group(function () {
            Route::get('/', [DetallesController::class, 'index'])->name('comercial.cuentas.detalles');
            Route::get('/certificados', [CertificadosFlotaController::class, 'index'])->name('comercial.cuentas.certificados');
            Route::get('/cambio-titularidad', [CambioTitularidadController::class, 'index'])->name('comercial.cuentas.cambio-titularidad');
            Route::get('/cambio-razon-social', [CambioRazonSocialController::class, 'index'])->name('comercial.cuentas.cambio-razon-social');
        });
        
        // ==================== UTILS PARA CONTRATOS (DENTRO DE COMERCIAL) ====================
        Route::prefix('utils')->group(function () {
            // Tipos de responsabilidad
            Route::get('/tipos-responsabilidad/activos', [TipoResponsabilidadController::class, 'activos']);
            
            // Tipos de documento
            Route::get('/tipos-documento/activos', [TipoDocumentoController::class, 'activos']);
            
            // Nacionalidades
            Route::get('/nacionalidades', [NacionalidadController::class, 'index']);
            
            // Categorías fiscales
            Route::get('/categorias-fiscales/activas', [CategoriaFiscalController::class, 'activas']);
            
            // Plataformas
            Route::get('/plataformas/activas', [PlataformaController::class, 'activas']);
            
            // Rubros activos
            Route::get('/rubros/activos', [RubroController::class, 'activos']);
            
            Route::post('/empresa/paso1', [App\Http\Controllers\Comercial\Utils\Paso1LeadController::class, 'update']);
    
            // Paso 2: Crear Contacto
            Route::post('/empresa/paso2', [App\Http\Controllers\Comercial\Utils\Paso2ContactoController::class, 'store']);
            
            // Paso 3: Crear Empresa
            Route::post('/empresa/paso3', [App\Http\Controllers\Comercial\Utils\Paso3EmpresaController::class, 'store']);
            Route::post('/auditoria/dato-sensible', [App\Http\Controllers\Comercial\Utils\AuditoriaDatoSensibleController::class, 'store'])->name('comercial.utils.auditoria.dato-sensible');
            
        });
    });
    
    // ==================== CONFIGURACIÓN ====================
    Route::prefix('config')->group(function () {
        // Parámetros
        Route::prefix('parametros')->group(function () {
            Route::get('/medios-pago', [MediosPagoController::class, 'index'])->name('config.medios-pago');
            Route::get('/motivos-baja', [MotivosBajaController::class, 'index'])->name('config.motivos-baja');
            Route::get('/origen-prospecto', [OrigenProspectoController::class, 'index'])->name('config.origen-prospecto');
            Route::get('/rubros', [RubrosController::class, 'index'])->name('config.rubros');
            Route::get('/terminos-condiciones', [TerminosCondicionesController::class, 'index'])->name('config.terminos-condiciones');
            
            // Estados Lead CRUD
            Route::prefix('estados-lead')->group(function () {
                Route::get('/', [EstadosLeadController::class, 'index'])->name('config.estados-lead');
                Route::post('/', [EstadosLeadController::class, 'store']);
                Route::put('/{id}', [EstadosLeadController::class, 'update']);
                Route::delete('/{id}', [EstadosLeadController::class, 'destroy']);
                Route::post('/{id}/toggle-activo', [EstadosLeadController::class, 'toggleActivo']);
            });
        });
        
        // Tarifas
        Route::prefix('tarifas')->name('tarifas.')->group(function () {
            Route::get('/', [TarifasController::class, 'index'])->name('index');
            Route::post('/', [TarifasController::class, 'store'])->name('store');
            Route::put('/{id}', [TarifasController::class, 'update'])->name('update');
            Route::put('/{id}/toggle-activo', [TarifasController::class, 'toggleActivo'])->name('toggle-activo');
            Route::delete('/{id}', [TarifasController::class, 'destroy'])->name('destroy');
            Route::get('/export', [TarifasController::class, 'export'])->name('export');
            Route::post('/procesar-archivo', [TarifasController::class, 'procesarArchivo'])->name('procesar-archivo');
            Route::post('/confirmar-actualizacion', [TarifasController::class, 'confirmarActualizacion'])->name('confirmar-actualizacion');
        });

        // Promociones
        Route::prefix('promociones')->group(function () {
            Route::get('/', [PromocionController::class, 'index'])->name('config.promociones.index');
            Route::get('/create', [PromocionController::class, 'create'])->name('config.promociones.create');
            Route::post('/', [PromocionController::class, 'store'])->name('config.promociones.store');
            Route::get('/{promocione}/edit', [PromocionController::class, 'edit'])->name('config.promociones.edit');
            Route::put('/{promocione}', [PromocionController::class, 'update'])->name('config.promociones.update');
            Route::delete('/{promocione}', [PromocionController::class, 'destroy'])->name('config.promociones.destroy');
            
            // Endpoints API
            Route::prefix('api')->group(function () {
                Route::get('/productos', [PromocionController::class, 'getProductos'])->name('config.promociones.api.productos');
                Route::get('/productos/tipo/{tipo}', [PromocionController::class, 'getProductosPorTipo'])->name('config.promociones.api.productos-por-tipo');
            });
        });
                            
        // Usuarios
        Route::prefix('usuarios')->group(function () {
            Route::get('/', [UsuariosSistemaController::class, 'index'])->name('config.usuarios');
            Route::get('/roles', [RolesPermisosController::class, 'index'])->name('config.usuarios.roles');
        });
    });
    
    // ==================== RRHH ====================
    Route::prefix('rrhh')->group(function () {
        // Equipos
        Route::prefix('equipos')->group(function () {
            Route::get('/comercial', [EquipoComercialController::class, 'index'])->name('rrhh.equipos.comercial');
            Route::get('/tecnico', [EquipoTecnicoController::class, 'index'])->name('rrhh.equipos.tecnico');
            
            // Técnicos CRUD
            Route::prefix('tecnicos')->group(function () {
                Route::get('/create', [TecnicoController::class, 'create'])->name('rrhh.tecnicos.create');
                Route::post('/', [TecnicoController::class, 'store'])->name('rrhh.tecnicos.store');
                Route::get('/{tecnico}/edit', [TecnicoController::class, 'edit'])->name('rrhh.tecnicos.edit');
                Route::put('/{tecnico}', [TecnicoController::class, 'update'])->name('rrhh.tecnicos.update');
                Route::delete('/{tecnico}', [TecnicoController::class, 'destroy'])->name('rrhh.tecnicos.destroy');
            });
        });
        
        // Personal
        Route::prefix('personal')->group(function () {
            Route::get('/datos', [DatosPersonalesController::class, 'index'])->name('rrhh.personal.datos-personales');
            Route::get('/cumpleanos', [CumpleanosController::class, 'index'])->name('rrhh.personal.cumpleanos');
            Route::get('/licencias', [LicenciasController::class, 'index'])->name('rrhh.personal.licencias');
        });
    });
    
    // ==================== NOTIFICACIONES ====================
    Route::prefix('notificaciones')->group(function () {
        // Vistas Inertia
        Route::get('/', [NotificacionController::class, 'index'])->name('notificaciones.index');
        Route::get('/programadas', [NotificacionController::class, 'programadas'])->name('notificaciones.programadas');
        
        // Endpoints AJAX
        Route::prefix('ajax')->group(function () {
            Route::get('/', [NotificacionController::class, 'ajaxIndex'])->name('notificaciones.ajax.index');
            Route::post('/{id}/marcar-leida', [NotificacionController::class, 'marcarLeida'])->name('notificaciones.marcar-leida');
            Route::post('/marcar-todas-leidas', [NotificacionController::class, 'marcarTodasLeidas'])->name('notificaciones.marcar-todas');
            Route::delete('/{id}', [NotificacionController::class, 'destroy'])->name('notificaciones.destroy');
            Route::get('/contador', [NotificacionController::class, 'contador'])->name('notificaciones.contador');
        });
    });

    // ==================== PRESUPUESTOS LEGACY ====================
    Route::prefix('presupuestos-legacy')->group(function () {
        Route::get('/{id}/pdf', [PresupuestoLegacyController::class, 'verPdf'])->name('presupuestos-legacy.pdf');
        Route::get('/{id}/descargar', [PresupuestoLegacyController::class, 'descargarPdf'])->name('presupuestos-legacy.descargar');
    });
    
    // ==================== FALLBACK ====================
    Route::fallback(function () {
        return Inertia::render('Errors/404');
    });
});