<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use App\Services\Lead\LeadStatisticsService;
use App\Services\Lead\LeadQueryService;
use App\Services\Lead\LeadPresupuestoLegacyService; // Importar nuevo servicio
use App\Services\Presupuesto\PresupuestoNotificationService;
use Illuminate\Support\Facades\URL; 

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LeadStatisticsService::class);
        $this->app->singleton(LeadQueryService::class);
        $this->app->singleton(LeadPresupuestoLegacyService::class); // Registrar nuevo servicio
        $this->app->singleton(PresupuestoNotificationService::class);
        $this->app->singleton(\App\Services\Lead\LeadDetailsService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}