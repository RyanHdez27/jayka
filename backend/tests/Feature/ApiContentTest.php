<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Service;
use App\Models\Category;
use App\Models\Post;

class ApiContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup basic data
        $this->category = Category::create(['name' => 'Tendencias']);
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->service = Service::create([
            'title' => 'Diseño de Interiores',
            'description' => 'Desc...',
        ]);
        $this->post = Post::create([
            'category_id' => $this->category->id,
            'user_id' => $this->user->id,
            'title' => 'Post de Prueba',
            'excerpt' => 'Extracto...',
            'content' => 'Contenido...',
            'published_at' => now(),
        ]);
    }

    public function test_can_list_services()
    {
        $response = $this->getJson('/api/v1/services');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonStructure(['data' => [
                     ['title', 'description', 'projects']
                 ]]);
    }

    public function test_can_list_posts()
    {
        $response = $this->getJson('/api/v1/posts');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonFragment(['title' => 'Post de Prueba']);
    }

    public function test_can_submit_lead()
    {
        $payload = [
            'name' => 'Juan Perez',
            'email' => 'juan@example.com',
            'message' => 'Hola, me interesa una cotización para mi sala.',
        ];

        $response = $this->postJson('/api/v1/leads', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('success', true);

        $this->assertDatabaseHas('leads', ['email' => 'juan@example.com']);
    }

    public function test_lead_submission_fails_with_invalid_data()
    {
        $payload = [
            'name' => 'Juan Perez',
            'email' => 'invalid-email',
            'message' => 'Corto',
        ];

        $response = $this->postJson('/api/v1/leads', $payload);

        $response->assertStatus(422)
                 ->assertJsonPath('success', false);
    }
}
