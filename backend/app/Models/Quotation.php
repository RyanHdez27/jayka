<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Quotation
 * Representa una cotización generada desde el cotizador de Jayka.
 *
 * @property int    $id
 * @property string $client_name
 * @property string $client_phone
 * @property string|null $client_email
 * @property string|null $project_location
 * @property bool   $wants_contact
 * @property float  $grand_total
 * @property array  $services       — line items de la cotización
 * @property array  $result_json    — objeto completo del resultado
 * @property string $type
 */
class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_name',
        'client_phone',
        'client_email',
        'project_location',
        'wants_contact',
        'grand_total',
        'services',
        'result_json',
        'type',
    ];

    protected $casts = [
        'wants_contact' => 'boolean',
        'grand_total'   => 'decimal:2',
        'services'      => 'array',
        'result_json'   => 'array',
    ];
}
