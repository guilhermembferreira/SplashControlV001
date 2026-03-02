<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSwimSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_name'    => ['required', 'string', 'max:80'],
            'session_date'  => ['required', 'date_format:Y-m-d'],
            'elapsed_ms'    => ['required', 'integer', 'min:1'],
            'distance_m'    => ['nullable', 'integer', 'min:1', 'max:10000'],
            'swimmer_count' => ['required', 'integer', 'min:1', 'max:12'],
            'splits'        => ['nullable', 'array'],
            'splits.*'      => ['integer', 'min:0'],
        ];
    }
}
