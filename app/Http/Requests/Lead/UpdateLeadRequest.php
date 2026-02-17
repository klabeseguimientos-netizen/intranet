<?php

namespace App\Http\Requests\Lead;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'nombre_completo' => 'sometimes|string|max:100',
            'genero' => [
                'sometimes',
                Rule::in(['masculino', 'femenino', 'otro', 'no_especifica'])
            ],
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'localidad_id' => 'nullable|integer|exists:localidades,id',
            'rubro_id' => 'nullable|integer|exists:rubros,id',
            'origen_id' => 'sometimes|integer|exists:origenes_contacto,id',
            'estado_lead_id' => 'sometimes|integer|exists:estados_lead,id',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_completo.max' => 'El nombre no puede exceder 100 caracteres',
            'email.email' => 'El email debe ser válido',
            'estado_lead_id.exists' => 'El estado seleccionado no es válido',
        ];
    }
}