<?php
// web.php - versión limpia

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Comercial\ActividadController;
use App\Http\Controllers\Comercial\ContactosController;
use App\Http\Controllers\Comercial\PresupuestosController;
use App\Http\Controllers\Comercial\RecordatoriosController;
use App\Http\Controllers\Comercial\ProspectosController;
use App\Http\Controllers\Comercial\Cuentas\DetallesController;
use App\Http\Controllers\Comercial\Cuentas\CertificadosFlotaController;
use App\Http\Controllers\Comercial\Cuentas\CambioTitularidadController;
use App\Http\Controllers\Comercial\Cuentas\CambioRazonSocialController;
use App\Http\Controllers\Config\Parametros\EstadosContactosController;
use App\Http\Controllers\Config\Parametros\MediosPagoController;
use App\Http\Controllers\Config\Parametros\MotivosBajaController;
use App\Http\Controllers\Config\Parametros\OrigenProspectoController;
use App\Http\Controllers\Config\Parametros\RubrosController;
use App\Http\Controllers\Config\Parametros\TerminosCondicionesController;
use App\Http\Controllers\Config\Tarifas\AbonosController;
use App\Http\Controllers\Config\Tarifas\AccesoriosController;
use App\Http\Controllers\Config\Tarifas\ConveniosController;
use App\Http\Controllers\Config\Tarifas\ServiciosController;
use App\Http\Controllers\Config\Tarifas\TasasController;
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
use App\Http\Controllers\NotificacionController as NotificacionViewController;
use App\Http\Controllers\Api\NotificacionController as NotificacionApiController;
use Inertia\Inertia;

use Illuminate\Support\Facades\Route;

Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::middleware(['auth', 'usuario.activo'])->group(function () {
    // welcome
    Route::get('/welcome', [LoginController::class, 'welcome'])->name('welcome');
    
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Gestión Comercial
    Route::get('/comercial/actividad', [ActividadController::class, 'index'])->name('comercial.actividad');
    Route::get('/comercial/contactos', [ContactosController::class, 'index'])->name('comercial.contactos');
    Route::get('/comercial/presupuestos', [PresupuestosController::class, 'index'])->name('comercial.presupuestos');
    Route::get('/comercial/recordatorios', [RecordatoriosController::class, 'index'])->name('comercial.recordatorios');
    Route::get('/comercial/prospectos', [ProspectosController::class, 'index'])->name('comercial.prospectos');

    // Cuentas
    Route::get('/comercial/cuentas', [DetallesController::class, 'index'])->name('comercial.cuentas');
    Route::get('/comercial/cuentas/certificados', [CertificadosFlotaController::class, 'index'])->name('comercial.cuentas.certificados');
    Route::get('/comercial/cuentas/cambio-titularidad', [CambioTitularidadController::class, 'index'])->name('comercial.cuentas.cambio-titularidad');
    Route::get('/comercial/cuentas/cambio-razon-social', [CambioRazonSocialController::class, 'index'])->name('comercial.cuentas.cambio-razon-social');

    // Configuración - Parámetros Generales
    Route::get('/config/parametros/estados-contactos', [EstadosContactosController::class, 'index'])->name('config.estados-contactos');
    Route::get('/config/parametros/medios-pago', [MediosPagoController::class, 'index'])->name('config.medios-pago');
    Route::get('/config/parametros/motivos-baja', [MotivosBajaController::class, 'index'])->name('config.motivos-baja');
    Route::get('/config/parametros/origen-prospecto', [OrigenProspectoController::class, 'index'])->name('config.origen-prospecto');
    Route::get('/config/parametros/rubros', [RubrosController::class, 'index'])->name('config.rubros');
    Route::get('/config/parametros/terminos-condiciones', [TerminosCondicionesController::class, 'index'])->name('config.terminos-condiciones');

    // Gestión de Tarifas
    Route::get('/config/tarifas/abonos', [AbonosController::class, 'index'])->name('config.tarifas.abonos');
    Route::get('/config/tarifas/accesorios', [AccesoriosController::class, 'index'])->name('config.tarifas.accesorios');
    Route::get('/config/tarifas/convenios', [ConveniosController::class, 'index'])->name('config.tarifas.convenios');
    Route::get('/config/tarifas/servicios', [ServiciosController::class, 'index'])->name('config.tarifas.servicios');
    Route::get('/config/tarifas/tasas', [TasasController::class, 'index'])->name('config.tarifas.tasas');

    // Gestión de Usuarios
    Route::get('/config/usuarios', [UsuariosSistemaController::class, 'index'])->name('config.usuarios');
    Route::get('/config/usuarios/roles', [RolesPermisosController::class, 'index'])->name('config.usuarios.roles');

    // Condiciones Comerciales
    Route::get('/comercial/tarifas', [TarifasConsultaController::class, 'index'])->name('comercial.tarifas');
    Route::get('/comercial/convenios', [ConveniosVigentesController::class, 'index'])->name('comercial.convenios');
    Route::get('/comercial/novedades', [NovedadesController::class, 'index'])->name('comercial.novedades');
    Route::get('/comercial/reenvios', [ReenviosActivosController::class, 'index'])->name('comercial.reenvios');

    // RRHH 
    Route::get('/rrhh/equipos/comercial', [EquipoComercialController::class, 'index'])->name('rrhh.equipos.comercial');
    Route::get('/rrhh/equipos/tecnico', [EquipoTecnicoController::class, 'index'])->name('rrhh.equipos.tecnico');
    Route::get('/rrhh/personal/datos', [DatosPersonalesController::class, 'index'])->name('rrhh.personal.datos-personales');
    Route::get('/rrhh/personal/cumpleanos', [CumpleanosController::class, 'index'])->name('rrhh.personal.cumpleanos');
    Route::get('/rrhh/personal/licencias', [LicenciasController::class, 'index'])->name('rrhh.personal.licencias');

    // Estadísticas (solo para usuarios 3 y 5 con rol Administrador)
    Route::get('/estadisticas/comercial-grupal', [\App\Http\Controllers\Estadisticas\ComercialGrupalController::class, 'index'])
        ->name('estadisticas.comercial-grupal');
    Route::get('/estadisticas/comercial-individual', [\App\Http\Controllers\Estadisticas\ComercialIndividualController::class, 'index'])
        ->name('estadisticas.comercial-individual');

    // Leads y Localidades
    Route::prefix('comercial')->group(function () {
        Route::get('/leads/create', [LeadController::class, 'create'])->name('comercial.leads.create');
        Route::post('/leads', [LeadController::class, 'store'])->name('comercial.leads.store');
        Route::get('/leads', [LeadController::class, 'index'])->name('comercial.leads.index');
    });

    Route::get('/comercial/localidades/buscar', [\App\Http\Controllers\Comercial\LocalidadController::class, 'buscar'])
        ->name('comercial.localidades.buscar');
    
    Route::post('/comercial/leads', [\App\Http\Controllers\Comercial\LeadController::class, 'store'])
        ->name('comercial.leads.store');


Route::prefix('rrhh/tecnicos')->group(function () {
    Route::get('/create', [TecnicoController::class, 'create'])->name('rrhh.tecnicos.create');
    Route::post('/', [TecnicoController::class, 'store'])->name('rrhh.tecnicos.store');
    Route::get('/{tecnico}/edit', [TecnicoController::class, 'edit'])->name('rrhh.tecnicos.edit');
    Route::put('/{tecnico}', [TecnicoController::class, 'update'])->name('rrhh.tecnicos.update');
    Route::delete('/{tecnico}', [TecnicoController::class, 'destroy'])->name('rrhh.tecnicos.destroy');
});
    Route::get('/notificaciones', [NotificacionViewController::class, 'index'])
        ->name('notificaciones.index');

    // Rutas API con prefijo AJAX para evitar conflicto
    Route::prefix('ajax/notificaciones')->group(function () {
        Route::get('/', [NotificacionApiController::class, 'index'])->name('notificaciones.api.index');
        Route::post('/{id}/marcar-leida', [NotificacionApiController::class, 'marcarLeida'])->name('notificaciones.api.marcar-leida');
        Route::post('/marcar-todas-leidas', [NotificacionApiController::class, 'marcarTodasLeidas'])->name('notificaciones.api.marcar-todas');
        Route::delete('/{id}', [NotificacionApiController::class, 'destroy'])->name('notificaciones.api.destroy');
        Route::get('/contador', [NotificacionApiController::class, 'contador'])->name('notificaciones.api.contador');
    });

    // Ruta catch-all para Inertia SPA
    Route::fallback(function () {
        return Inertia::render('Errors/404');
    });
});