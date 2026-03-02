<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SwimGroup;
use App\Models\Athlete;

class SwimGroupController extends Controller
{
    public function index(Request $request)
    {
        $groups = $request->user()->swimGroups()->withCount('athletes')->get();
        return Inertia::render('coach/groups/index', [
            'groups' => $groups,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $request->user()->swimGroups()->create($validated);

        return redirect()->back()->with('message', 'Group created successfully.');
    }

    public function show(Request $request, SwimGroup $group)
    {
        abort_if($group->coach_id !== $request->user()->id, 403);

        $group->loadMissing('athletes');

        $coachAthletes = $request->user()->athletes()->whereNotIn('id', $group->athletes->pluck('id'))->get();

        return Inertia::render('coach/groups/show', [
            'group' => $group,
            'availableAthletes' => $coachAthletes,
        ]);
    }

    public function addAthlete(Request $request, SwimGroup $group)
    {
        abort_if($group->coach_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'athlete_id' => ['required', 'exists:athletes,id'],
        ]);

        $athlete = Athlete::findOrFail($validated['athlete_id']);
        abort_if($athlete->coach_id !== $request->user()->id, 403);

        $group->athletes()->syncWithoutDetaching([$athlete->id]);

        return redirect()->back()->with('message', 'Athlete added to group.');
    }

    public function removeAthlete(Request $request, SwimGroup $group, Athlete $athlete)
    {
        abort_if($group->coach_id !== $request->user()->id, 403);
        abort_if($athlete->coach_id !== $request->user()->id, 403);

        $group->athletes()->detach($athlete->id);

        return redirect()->back()->with('message', 'Athlete removed from group.');
    }

    public function destroy(Request $request, SwimGroup $group)
    {
        abort_if($group->coach_id !== $request->user()->id, 403);
        $group->delete();
        return redirect()->route('coach.groups.index')->with('message', 'Group deleted.');
    }
}
