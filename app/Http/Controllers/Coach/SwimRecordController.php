<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SwimRecord;
use App\Models\Athlete;

class SwimRecordController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'athlete_id' => ['required', 'exists:athletes,id'],
            'record_type' => ['required', 'in:practice,competition'],
            'stroke' => ['required', 'string'],
            'distance' => ['required', 'integer'],
            'time_ms' => ['required', 'integer'],
            'pool_length' => ['required', 'in:25m,50m'],
            'date' => ['required', 'date'],
            'competition_name' => ['nullable', 'string', 'max:255'],
            'competition_location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $athlete = Athlete::findOrFail($validated['athlete_id']);
        abort_if($athlete->coach_id !== $request->user()->id, 403);

        $athlete->swimRecords()->create($validated);

        return redirect()->back()->with('message', 'Record added successfully.');
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'records'                  => ['required', 'array', 'min:1'],
            'records.*.athlete_id'    => ['required', 'exists:athletes,id'],
            'records.*.record_type'   => ['required', 'in:practice,competition'],
            'records.*.stroke'        => ['required', 'string', 'max:50'],
            'records.*.distance'      => ['required', 'integer', 'min:1'],
            'records.*.time_ms'       => ['required', 'integer', 'min:1'],
            'records.*.pool_length'   => ['required', 'in:25m,50m'],
            'records.*.date'          => ['required', 'date'],
        ]);

        $user = $request->user();

        foreach ($validated['records'] as $record) {
            $athlete = Athlete::findOrFail($record['athlete_id']);
            abort_if($athlete->coach_id !== $user->id, 403);
            $athlete->swimRecords()->create($record);
        }

        return redirect()->back()->with('message', 'Tempos guardados com sucesso.');
    }

    public function destroy(Request $request, SwimRecord $record)
    {
        $athlete = $record->athlete;
        abort_if($athlete->coach_id !== $request->user()->id, 403);

        $record->delete();

        return redirect()->back()->with('message', 'Record deleted.');
    }
}
