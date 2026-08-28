<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function admin(): JsonResponse
    {
        $user = auth('api')->user();

        $totalUsers = DB::table('users')->count();
        $totalAdmins = DB::table('users')->where('role', 'admin')->count();
        $totalMembers = DB::table('users')->where('role', 'member')->count();

        return response()->json([
            'data' => [
                'role' => $user->role,
                'welcome' => 'Welcome Admin ' . $user->name,
                'stats' => [
                    ['label' => 'Total Users', 'value' => $totalUsers, 'icon' => 'Users'],
                    ['label' => 'Admins', 'value' => $totalAdmins, 'icon' => 'ShieldCheck'],
                    ['label' => 'Members', 'value' => $totalMembers, 'icon' => 'Dumbbell'],
                    ['label' => 'Revenue (mock)', 'value' => '₱86,430', 'icon' => 'Wallet'],
                ],
                'recent' => [
                    ['id' => 1, 'title' => '3 new members this week', 'time' => '2h ago'],
                    ['id' => 2, 'title' => 'Revenue up 5.2%', 'time' => '1d ago'],
                ],
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
        ]);
    }

    public function member(): JsonResponse
    {
        $user = auth('api')->user();

        return response()->json([
            'data' => [
                'role' => $user->role,
                'welcome' => 'Welcome ' . $user->name . ' — keep crushing it!',
                'stats' => [
                    ['label' => 'Check-ins This Month', 'value' => '12', 'icon' => 'CalendarCheck'],
                    ['label' => 'Membership Status', 'value' => 'Active', 'icon' => 'ShieldCheck'],
                    ['label' => 'Next Payment', 'value' => 'Aug 30', 'icon' => 'CreditCard'],
                    ['label' => 'Streak', 'value' => '5 days', 'icon' => 'Flame'],
                ],
                'schedule' => [
                    ['day' => 'Mon', 'activity' => 'Chest & Back', 'time' => '07:00 AM'],
                    ['day' => 'Wed', 'activity' => 'Legs & Core', 'time' => '07:00 AM'],
                    ['day' => 'Fri', 'activity' => 'Full Body', 'time' => '07:00 AM'],
                ],
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
        ]);
    }
}
