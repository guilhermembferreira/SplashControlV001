<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Athlete;

class AthleteController extends Controller
{
    public function index(Request $request)
    {
        $athletes = $request->user()->athletes()->withCount('swimRecords')->with('swimGroups')->get();
        return Inertia::render('coach/athletes/index', [
            'athletes' => $athletes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'club' => ['nullable', 'string', 'max:255'],
            'started_year' => ['nullable', 'integer', 'min:1900', 'max:' . date('Y')],
            'height_cm' => ['nullable', 'integer', 'min:50', 'max:250'],
            'weight_kg' => ['nullable', 'numeric', 'min:10', 'max:200'],
        ]);

        $request->user()->athletes()->create($validated);

        return redirect()->back()->with('message', 'Athlete created successfully.');
    }

    public function update(Request $request, Athlete $athlete)
    {
        abort_if($athlete->coach_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'club' => ['nullable', 'string', 'max:255'],
            'started_year' => ['nullable', 'integer', 'min:1900', 'max:' . date('Y')],
            'height_cm' => ['nullable', 'integer', 'min:50', 'max:250'],
            'weight_kg' => ['nullable', 'numeric', 'min:10', 'max:200'],
        ]);

        $athlete->update($validated);

        return redirect()->back()->with('message', 'Athlete updated.');
    }

    public function show(Request $request, Athlete $athlete)
    {
        abort_if($athlete->coach_id !== $request->user()->id, 403);

        $athlete->loadMissing([
            'swimGroups',
            'swimRecords' => function ($query) {
                $query->orderBy('date', 'desc')->orderBy('created_at', 'desc');
            }
        ]);

        // Compute personal bests: best time per (stroke, distance, pool_length)
        $personalBests = $athlete->swimRecords
            ->groupBy(fn ($r) => $r->stroke . '|' . $r->distance . '|' . $r->pool_length)
            ->map(fn ($group) => $group->sortBy('time_ms')->first())
            ->values();

        return Inertia::render('coach/athletes/show', [
            'athlete' => $athlete,
            'personalBests' => $personalBests,
        ]);
    }

    public function destroy(Request $request, Athlete $athlete)
    {
        abort_if($athlete->coach_id !== $request->user()->id, 403);
        $athlete->delete();
        return redirect()->route('coach.athletes.index')->with('message', 'Athlete deleted.');
    }
}
