<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MemberController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'app' => config('app.name')]));

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::get('/dashboard/admin', [DashboardController::class, 'admin'])->middleware('role:admin');
    Route::get('/dashboard/member', [DashboardController::class, 'member'])->middleware('role:member');

    Route::get('/admin-only', fn () => response()->json(['message' => 'Admin access granted']))->middleware('role:admin');
    Route::get('/member-only', fn () => response()->json(['message' => 'Member access granted']))->middleware('role:member');

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('members', MemberController::class);
    });
});
