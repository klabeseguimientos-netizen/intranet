<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lead\StoreLeadRequest;
use App\Services\Lead\LeadCreationService;
use App\Services\Lead\LeadDetailsService;
use App\Services\Lead\LeadFormService;
use App\Services\Lead\LeadFilterService;
use App\DTOs\LeadData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function __construct(
        private LeadCreationService $leadService,
        private LeadDetailsService $detailsService,
        private LeadFormService $formService,
        private LeadFilterService $filterService 
    ) {}

    /**
     * Mostrar un lead individual
     */
    public function show($id): Response
    {
        $dashboardData = $this->detailsService->getLeadDashboardData($id, auth()->id());
        
        if (empty($dashboardData)) {
            abort(404, 'Lead no encontrado');
        }

        $formData = $this->formService->getFormData();
        
        $datosFiltros = app(LeadFilterService::class)->getDatosFiltros();
        $comerciales = $this->filterService->getComercialesActivos(auth()->user());

        return Inertia::render('Comercial/Leads/Show', array_merge(
            $dashboardData, 
            $formData,
            $datosFiltros,
            [
                'comerciales' => $comerciales,
            ]
        ));
    }

    /**
     * Almacenar nuevo lead - VERSIÓN PARA INERTIA
     */
    public function store(StoreLeadRequest $request): RedirectResponse
    {
        try {
            $leadData = LeadData::fromRequest(
                $request->validated(),
                auth()->id()
            );

            $leadId = $this->leadService->createLead($leadData);

            $mensaje = $leadData->shouldCreateNote() 
                ? 'Lead creado exitosamente con nota'
                : 'Lead creado exitosamente';

            return redirect()
                ->back()
                ->with('success', $mensaje)
                ->with('lead_id', $leadId)
                ->with('nota_agregada', $leadData->shouldCreateNote());

        } catch (\Exception $e) {
            Log::error('Error en LeadController::store:', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al crear el lead: ' . $e->getMessage()])
                ->withInput();
        }
    }
    
    /**
     * Endpoint para obtener tiempos entre estados (API)
     */
    public function tiemposEstados($leadId): \Illuminate\Http\JsonResponse
    {
        $tiempos = $this->detailsService->getStateTransitionTimes($leadId);

        if (empty($tiempos)) {
            return response()->json(['error' => 'Lead no encontrado'], 404);
        }

        return response()->json($tiempos);
    }
}