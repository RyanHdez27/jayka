<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Service;
use App\Models\Project;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin Jayka',
            'email' => 'admin@jayka.com',
            'password' => Hash::make('secret123'),
            'role' => 'admin',
        ]);

        // Seed Services from Frontend Mocks
        $services = [
            [
                'title' => 'Diseño de Interiores',
                'description' => 'Transformamos cada espacio en una experiencia visual y funcional...',
                'image_url' => 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&h=400&fit=crop&auto=format',
            ],
            [
                'title' => 'Carpintería a Medida',
                'description' => 'Fabricamos piezas únicas con maderas seleccionadas...',
                'image_url' => 'https://images.unsplash.com/photo-1497219055242-93359eeed651?w=600&h=400&fit=crop&auto=format',
            ],
            [
                'title' => 'Mobiliario en RH',
                'description' => 'Diseño, fabricación e instalación integral de mobiliario...',
                'image_url' => 'https://images.unsplash.com/photo-1618582383736-ed9080511254?w=600&h=400&fit=crop&auto=format',
            ],
        ];

        foreach ($services as $s) {
            $service = Service::create($s);

            // Seed Projects for this service
            Project::create([
                'service_id' => $service->id,
                'label' => 'Proyecto Ejemplo ' . $service->title,
                'image_url' => 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?w=600&h=500&fit=crop&auto=format',
            ]);
        }

        // Seed Categories
        $catTendencias = Category::create(['name' => 'Tendencias']);
        $catCuidado = Category::create(['name' => 'Cuidado de Madera']);

        // Seed Blog Posts from Frontend Mocks
        Post::create([
            'category_id' => $catTendencias->id,
            'user_id' => 1,
            'title' => 'Madera y minimalismo: la tendencia que transforma hogares en 2025',
            'excerpt' => 'El contraste entre lo natural y lo geométrico lidera el diseño de interiores este año.',
            'content' => 'Contenido completo del artículo...',
            'image_url' => 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=700&h=480&fit=crop&auto=format',
            'read_time' => '5 min',
            'is_featured' => true,
            'published_at' => now(),
        ]);
    }
}
