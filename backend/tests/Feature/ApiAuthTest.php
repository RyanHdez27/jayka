<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_and_get_token()
    {
        $user = User::factory()->create([
            'email' => 'admin@jayka.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@jayka.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_unauthenticated_user_cannot_access_admin_leads()
    {
        $response = $this->getJson('/api/v1/admin/leads');

        $response->assertStatus(401);
    }

    public function test_authenticated_admin_can_access_leads()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson('/api/v1/admin/leads');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }
}
