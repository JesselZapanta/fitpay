<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Membership;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $user = auth('api')->user();

        // Members
        $totalMembers = Member::count();
        $activeMembers = Member::where('status', 'active')->count();
        $expiredMembers = Member::where('status', 'expired')->count();
        $inactiveMembers = Member::where('status', 'inactive')->count();

        // Memberships
        $totalMemberships = Membership::count();
        $activeMemberships = Membership::where('status', 'active')->where('end_date', '>=', today())->count();
        $expiredMemberships = $totalMemberships - $activeMemberships;
        $membershipsByPlan = Membership::with('membershipRequest')
            ->get()
            ->groupBy(fn($m) => $m->membershipRequest?->plan_type ?? 'unknown')
            ->map(fn($g) => $g->count());

        // Payments
        $totalPayments = Payment::count();
        $totalRevenue = Payment::sum('amount');
        $paymentsLast6Months = collect(range(5, 0))->map(function ($i) {
            $month = now()->copy()->subMonths($i);
            $sum = Payment::whereYear('created_at', $month->year)->whereMonth('created_at', $month->month)->sum('amount');
            return [
                'month' => $month->format('M'),
                'month_num' => $month->month,
                'revenue' => round((float) $sum, 2),
                'count' => Payment::whereYear('created_at', $month->year)->whereMonth('created_at', $month->month)->count(),
            ];
        })->values();

        // Attendance
        $today = today()->format('Y-m-d');
        $todayTotal = Attendance::where('attendance_date', $today)->count();
        $todayPresent = Attendance::where('attendance_date', $today)->whereNotNull('check_in')->whereNull('check_out')->count();
        $todayCompleted = Attendance::where('attendance_date', $today)->whereNotNull('check_in')->whereNotNull('check_out')->count();
        $attendanceLast7 = collect(range(6, 0))->map(function ($i) {
            $date = now()->copy()->subDays($i);
            $count = Attendance::whereDate('attendance_date', $date->format('Y-m-d'))->count();
            return [
                'date' => $date->format('Y-m-d'),
                'label' => $date->format('D'),
                'count' => $count,
            ];
        })->values();

        // Recent tables
        $recentMembers = Member::with('user')->latest()->limit(5)->get()->map(fn(Member $m) => [
            'id' => $m->id,
            'member_code' => $m->member_code,
            'name' => $m->name,
            'email' => $m->email,
            'status' => $m->status,
            'created_at' => $m->created_at->format('Y-m-d'),
        ]);
        $recentMemberships = Membership::with(['user', 'membershipRequest'])->latest('start_date')->limit(5)->get()->map(function (Membership $m) {
            $isExpired = $m->end_date->isPast() || $m->status === 'expired';
            return [
                'id' => $m->id,
                'user_name' => $m->user?->name,
                'plan_label' => match ($m->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => 'No plan' },
                'period' => $m->start_date->format('Y-m-d') . ' → ' . $m->end_date->format('Y-m-d'),
                'status' => $isExpired ? 'expired' : 'active',
            ];
        });
        $recentPayments = Payment::with(['user', 'membership.membershipRequest'])->latest()->limit(5)->get()->map(fn(Payment $p) => [
            'id' => $p->id,
            'user_name' => $p->user?->name,
            'plan_label' => match ($p->membership?->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => 'No plan' },
            'amount' => $p->amount,
            'created_at' => $p->created_at->format('Y-m-d'),
        ]);
        $recentAttendances = Attendance::with(['member.user'])->latest('attendance_date')->latest('check_in')->limit(5)->get()->map(function (Attendance $a) {
            return [
                'id' => $a->id,
                'member_name' => $a->member?->name ?? $a->user?->name,
                'member_code' => $a->member?->member_code,
                'attendance_date' => $a->attendance_date->format('Y-m-d'),
                'check_in' => $a->check_in ? Carbon::parse($a->check_in)->format('H:i') : null,
                'check_out' => $a->check_out ? Carbon::parse($a->check_out)->format('H:i') : null,
                'status' => $a->check_in && !$a->check_out ? 'present' : ($a->check_in && $a->check_out ? 'completed' : 'unknown'),
            ];
        });

        $memberStatusDonut = [
            'active' => $totalMembers ? round($activeMembers / $totalMembers * 100) : 0,
            'expired' => $totalMembers ? round($expiredMembers / $totalMembers * 100) : 0,
            'inactive' => $totalMembers ? max(0, 100 - round($activeMembers / $totalMembers * 100) - round($expiredMembers / $totalMembers * 100)) : 0,
        ];

        return response()->json([
            'data' => [
                'role' => $user->role,
                'welcome' => 'Welcome ' . $user->name,
                'stats' => [
                    ['label' => 'Total Members', 'value' => $totalMembers, 'icon' => 'Users'],
                    ['label' => 'Active Memberships', 'value' => $activeMemberships, 'icon' => 'ShieldCheck'],
                    ['label' => 'Total Revenue', 'value' => '₱' . number_format($totalRevenue, 2), 'icon' => 'Wallet'],
                    ['label' => 'Today Attendance', 'value' => $todayTotal, 'icon' => 'Dumbbell'],
                ],
                'kpis' => [
                    'members' => ['total' => $totalMembers, 'active' => $activeMembers, 'expired' => $expiredMembers, 'inactive' => $inactiveMembers],
                    'memberships' => ['total' => $totalMemberships, 'active' => $activeMemberships, 'expired' => $expiredMemberships, 'by_plan' => $membershipsByPlan],
                    'payments' => ['total' => $totalPayments, 'revenue' => round((float) $totalRevenue, 2), 'last_6_months' => $paymentsLast6Months],
                    'attendance' => ['today_total' => $todayTotal, 'today_present' => $todayPresent, 'today_completed' => $todayCompleted, 'last_7_days' => $attendanceLast7],
                ],
                'graphs' => [
                    'memberships_by_plan' => $membershipsByPlan,
                    'payments_last_6_months' => $paymentsLast6Months,
                    'attendance_last_7_days' => $attendanceLast7,
                    'member_status_donut' => $memberStatusDonut,
                ],
                'tables' => [
                    'recent_members' => $recentMembers,
                    'recent_memberships' => $recentMemberships,
                    'recent_payments' => $recentPayments,
                    'recent_attendances' => $recentAttendances,
                ],
                'recent' => [
                    ['id' => 1, 'title' => $totalMembers . ' total members', 'time' => now()->format('M d')],
                    ['id' => 2, 'title' => '₱' . number_format($totalRevenue, 2) . ' total revenue', 'time' => now()->format('M d')],
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
