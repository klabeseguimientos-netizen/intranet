<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\OrigenContacto;

class LeadControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear datos necesarios
        OrigenContacto::create([
            'id' => 1,
            'nombre' => 'Web',
            'activo' => true,
            'created' => now(),
            'modified' => now()
        ]);
        
        // También necesitarías un estado_lead por defecto (id: 1)
        \DB::table('estados_lead')->insert([
            'id' => 1,
            'nombre' => 'Nuevo',
            'color_hex' => '#000000',
            'tipo' => 'nuevo',
            'activo' => true,
            'created' => now(),
            'modified' => now()
        ]);
    }

    /** @test */
    public function it_can_create_a_lead()
    {
        // Arrange
        $user = User::factory()->create();
        $this->actingAs($user);

        $leadData = [
            'nombre_completo' => 'Juan Perez',
            'genero' => 'masculino',
            'origen_id' => 1,
            'telefono' => '123456789',
            'email' => 'juan@test.com',
            'prefijo_id' => null,
            'localidad_id' => null,
            'rubro_id' => null
        ];

        // Act
        $response = $this->post(route('comercial.leads.store'), $leadData);

        // Assert - Para Inertia, esperamos redirección (302)
        $response->assertRedirect(route('comercial.prospectos.index'));
        $response->assertSessionHas('success');
        
        // Verificar en la base de datos
        $this->assertDatabaseHas('leads', [
            'nombre_completo' => 'Juan Perez',
            'email' => 'juan@test.com'
        ]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->post(route('comercial.leads.store'), [
            'nombre_completo' => 'Test',
            'genero' => 'masculino',
            'origen_id' => 1
        ]);

        // Debería redirigir al login
        $response->assertRedirect('/login');
    }
}