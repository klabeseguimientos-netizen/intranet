<?php

namespace App\Http\Requests\Lead;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'prefijo_id' => 'nullable|integer|exists:prefijos,id',
            'nombre_completo' => 'required|string|max:100',
            'genero' => [
                'required',
                Rule::in(['masculino', 'femenino', 'otro', 'no_especifica'])
            ],
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'localidad_id' => 'nullable|integer|exists:localidades,id',
            'rubro_id' => 'nullable|integer|exists:rubros,id',
            'origen_id' => 'required|integer|exists:origenes_contacto,id',
            'nota.observacion' => 'nullable|string',
            'nota.tipo' => 'nullable|string|in:observacion_inicial,seguimiento,recordatorio'
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_completo.required' => 'El nombre completo es obligatorio',
            'genero.required' => 'El género es obligatorio',
            'genero.in' => 'El género debe ser uno de: masculino, femenino, otro, no_especifica',
            'email.email' => 'El email debe ser válido',
            'origen_id.required' => 'El origen del contacto es obligatorio',
            'origen_id.exists' => 'El origen seleccionado no es válido'
        ];
    }
}