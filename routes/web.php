<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SwimSessionController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (Auth::check()) {
        return Inertia::render('home');
    }

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/timer', [SwimSessionController::class, 'index'])->name('timer');
    Route::post('/swim-sessions', [SwimSessionController::class, 'store'])->name('swim-sessions.store');
    Route::delete('/swim-sessions/{session}', [SwimSessionController::class, 'destroy'])->name('swim-sessions.destroy');
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
});

Route::middleware(['auth', 'coach'])->prefix('coach')->name('coach.')->group(function () {
    // Coach Dashboard
    Route::get('/', function () {
        return Inertia::render('coach/dashboard');
    })->name('dashboard');

    // Athletes
    Route::get('/athletes', [\App\Http\Controllers\Coach\AthleteController::class, 'index'])->name('athletes.index');
    Route::post('/athletes', [\App\Http\Controllers\Coach\AthleteController::class, 'store'])->name('athletes.store');
    Route::get('/athletes/{athlete}', [\App\Http\Controllers\Coach\AthleteController::class, 'show'])->name('athletes.show');
    Route::put('/athletes/{athlete}', [\App\Http\Controllers\Coach\AthleteController::class, 'update'])->name('athletes.update');
    Route::delete('/athletes/{athlete}', [\App\Http\Controllers\Coach\AthleteController::class, 'destroy'])->name('athletes.destroy');

    // Swim Groups
    Route::get('/groups', [\App\Http\Controllers\Coach\SwimGroupController::class, 'index'])->name('groups.index');
    Route::post('/groups', [\App\Http\Controllers\Coach\SwimGroupController::class, 'store'])->name('groups.store');
    Route::get('/groups/{group}', [\App\Http\Controllers\Coach\SwimGroupController::class, 'show'])->name('groups.show');
    Route::post('/groups/{group}/add-athlete', [\App\Http\Controllers\Coach\SwimGroupController::class, 'addAthlete'])->name('groups.addAthlete');
    Route::delete('/groups/{group}/remove-athlete/{athlete}', [\App\Http\Controllers\Coach\SwimGroupController::class, 'removeAthlete'])->name('groups.removeAthlete');
    Route::delete('/groups/{group}', [\App\Http\Controllers\Coach\SwimGroupController::class, 'destroy'])->name('groups.destroy');

    // Swim Records
    Route::post('/records', [\App\Http\Controllers\Coach\SwimRecordController::class, 'store'])->name('records.store');
    Route::post('/records/bulk', [\App\Http\Controllers\Coach\SwimRecordController::class, 'bulkStore'])->name('records.bulkStore');
    Route::delete('/records/{record}', [\App\Http\Controllers\Coach\SwimRecordController::class, 'destroy'])->name('records.destroy');
});

require __DIR__ . '/settings.php';

