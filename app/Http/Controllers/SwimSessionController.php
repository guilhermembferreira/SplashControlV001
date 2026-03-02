<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSwimSessionRequest;
use App\Models\SwimSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SwimSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $sessions = $user->swimSessions()
            ->orderBy('session_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $props = ['sessions' => $sessions];

        if ($user->is_coach) {
            $props['swimGroups'] = $user->swimGroups()
                ->with('athletes:id,name')
                ->get(['id', 'name']);
            $props['athletes'] = $user->athletes()
                ->get(['id', 'name']);
        }

        return Inertia::render('timer', $props);
    }

    public function store(StoreSwimSessionRequest $request): RedirectResponse
    {
        $request->user()->swimSessions()->create($request->validated());

        return redirect()->route('timer');
    }

    public function destroy(Request $request, SwimSession $session): RedirectResponse
    {
        if ($session->user_id !== $request->user()->id) {
            abort(403);
        }

        $session->delete();

        return redirect()->route('timer');
    }
}
