<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\MemberController;
use App\Http\Controllers\Api\Admin\MembershipController;
use App\Http\Controllers\Api\Member\DashboardController as MemberDashboardController;
use App\Http\Controllers\Api\MembershipRequestController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'app' => config('app.name')]));

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile', [ProfileController::class, 'update']);

    Route::get('/dashboard/admin', AdminDashboardController::class)->middleware('role:admin');
    Route::get('/dashboard/member', MemberDashboardController::class)->middleware('role:member');

    Route::get('/admin-only', fn () => response()->json(['message' => 'Admin access granted']))->middleware('role:admin');
    Route::get('/member-only', fn () => response()->json(['message' => 'Member access granted']))->middleware('role:member');

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('members', MemberController::class);
        Route::get('/membership-requests', [MembershipRequestController::class, 'index']);
        Route::get('/membership-requests/{membershipRequest}', [MembershipRequestController::class, 'show']);
        Route::put('/membership-requests/{membershipRequest}', [MembershipRequestController::class, 'update']);
        Route::get('/memberships', [MembershipController::class, 'index']);
        Route::get('/memberships/{membership}', [MembershipController::class, 'show']);
        Route::put('/memberships/{membership}', [MembershipController::class, 'update']);
    });

    Route::middleware('role:member')->group(function () {
        Route::post('/membership-requests', [MembershipRequestController::class, 'store']);
    });
});
