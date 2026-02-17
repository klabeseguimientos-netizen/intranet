<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcesarSeguimientoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // La autorización se maneja en el controlador/service
    }

    public function rules(): array
    {
        return [
            'comentario' => 'required|string|min:3',
            'tipo_comentario_id' => 'required|exists:tipo_comentario,id',
            'crea_recordatorio' => 'boolean',
            'fecha_recordatorio' => 'nullable|date|after:today',
            'cambiar_estado_lead' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'comentario.required' => 'El comentario es obligatorio',
            'comentario.min' => 'El comentario debe tener al menos 3 caracteres',
            'tipo_comentario_id.required' => 'Debe seleccionar un tipo de comentario',
            'tipo_comentario_id.exists' => 'El tipo de comentario seleccionado no existe',
            'fecha_recordatorio.after' => 'La fecha de recordatorio debe ser futura',
        ];
    }
}