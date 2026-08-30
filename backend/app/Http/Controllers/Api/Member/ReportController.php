<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Membership;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'type' => ['nullable', 'in:memberships,payments,attendance,general'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $type = $request->input('type', 'general');
        $from = $request->input('from');
        $to = $request->input('to');

        if ($type === 'general' || !$request->filled('type')) {
            return $this->generalReport($request, $from, $to);
        }

        return match ($type) {
            'memberships' => $this->membershipsReport($from, $to),
            'payments' => $this->paymentsReport($from, $to),
            'attendance' => $this->attendanceReport($from, $to),
        };
    }

    private function generalReport(Request $request, ?string $from, ?string $to): JsonResponse
    {
        $user = auth('api')->user();
        $member = Member::where('user_id', $user->id)->first();

        $membershipQuery = Membership::where('user_id', $user->id)->with('membershipRequest');
        if ($from) $membershipQuery->whereDate('start_date', '>=', $from);
        if ($to) $membershipQuery->whereDate('start_date', '<=', $to);
        $membershipsAll = $membershipQuery->get();
        $membershipsActive = $membershipsAll->filter(fn($m) => !$m->end_date->isPast() && $m->status === 'active')->count();

        $paymentQuery = Payment::where('user_id', $user->id);
        if ($from) $paymentQuery->whereDate('created_at', '>=', $from);
        if ($to) $paymentQuery->whereDate('created_at', '<=', $to);
        $paymentsAll = $paymentQuery->get();
        $revenue = $paymentsAll->sum(fn($p) => (float) $p->amount);

        $attendanceQuery = Attendance::where('member_id', $member?->id);
        if ($from) $attendanceQuery->whereDate('attendance_date', '>=', $from);
        if ($to) $attendanceQuery->whereDate('attendance_date', '<=', $to);
        $attendancesAll = $attendanceQuery->get();

        $recentMemberships = Membership::where('user_id', $user->id)->with('membershipRequest')->latest('start_date')->limit(5)->get()->map(function (Membership $m) {
            $isExpired = $m->end_date->isPast() || $m->status === 'expired';
            return [
                'plan_label' => match ($m->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => 'No plan' },
                'period' => $m->start_date->format('Y-m-d') . ' → ' . $m->end_date->format('Y-m-d'),
                'status' => $isExpired ? 'expired' : 'active',
                'amount' => $m->membershipRequest?->amount,
            ];
        });
        $recentPayments = Payment::where('user_id', $user->id)->with('membership.membershipRequest')->latest()->limit(5)->get()->map(fn(Payment $p) => [
            'plan_label' => match ($p->membership?->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => 'No plan' },
            'amount' => $p->amount,
            'created_at' => $p->created_at->format('Y-m-d'),
        ]);
        $recentAttendances = Attendance::where('member_id', $member?->id)->latest('attendance_date')->latest('check_in')->limit(5)->get()->map(function (Attendance $a) {
            return [
                'attendance_date' => $a->attendance_date->format('Y-m-d'),
                'check_in' => $a->check_in ? Carbon::parse($a->check_in)->format('H:i') : null,
                'check_out' => $a->check_out ? Carbon::parse($a->check_out)->format('H:i') : null,
                'status' => $a->check_in && !$a->check_out ? 'present' : ($a->check_in && $a->check_out ? 'completed' : 'unknown'),
            ];
        });

        return response()->json([
            'data' => [
                'memberships' => $recentMemberships,
                'payments' => $recentPayments,
                'attendances' => $recentAttendances,
            ],
            'summary' => [
                'memberships_total' => $membershipsAll->count(),
                'memberships_active' => $membershipsActive,
                'memberships_expired' => $membershipsAll->count() - $membershipsActive,
                'payments_total' => $paymentsAll->count(),
                'payments_revenue' => round($revenue, 2),
                'attendances_total' => $attendancesAll->count(),
                'attendances_present' => $attendancesAll->whereNotNull('check_in')->whereNull('check_out')->count(),
                'attendances_completed' => $attendancesAll->whereNotNull('check_in')->whereNotNull('check_out')->count(),
            ],
            'meta' => ['from' => $from, 'to' => $to],
        ]);
    }

    private function membershipsReport(?string $from, ?string $to): JsonResponse
    {
        $user = auth('api')->user();
        $query = Membership::where('user_id', $user->id)->with('membershipRequest');
        if ($from) $query->whereDate('start_date', '>=', $from);
        if ($to) $query->whereDate('start_date', '<=', $to);
        $all = $query->get();
        $active = $all->filter(fn($m) => !$m->end_date->isPast() && $m->status === 'active')->count();
        $paginator = $query->latest('start_date')->paginate(10);
        $data = $paginator->getCollection()->map(function (Membership $m) {
            $isExpired = $m->end_date->isPast() || $m->status === 'expired';
            return [
                'plan_label' => match ($m->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => 'No plan' },
                'period' => $m->start_date->format('Y-m-d') . ' → ' . $m->end_date->format('Y-m-d'),
                'status' => $isExpired ? 'expired' : 'active',
                'amount' => $m->membershipRequest?->amount,
                'created_at' => $m->created_at->format('Y-m-d'),
            ];
        });
        return response()->json([
            'data' => $data,
            'meta' => ['current_page' => $paginator->currentPage(), 'per_page' => $paginator->perPage(), 'total' => $paginator->total(), 'last_page' => $paginator->lastPage(), 'from' => $paginator->firstItem(), 'to' => $paginator->lastItem()],
            'summary' => ['total' => $all->count(), 'active' => $active, 'expired' => $all->count() - $active],
        ]);
    }

    private function paymentsReport(?string $from, ?string $to): JsonResponse
    {
        $user = auth('api')->user();
        $query = Payment::where('user_id', $user->id)->with('membership.membershipRequest');
        if ($from) $query->whereDate('created_at', '>=', $from);
        if ($to) $query->whereDate('created_at', '<=', $to);
        $all = $query->get();
        $revenue = $all->sum(fn($p) => (float) $p->amount);
        $paginator = $query->latest()->paginate(10);
        $data = $paginator->getCollection()->map(fn(Payment $p) => [
            'plan_label' => match ($p->membership?->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => 'No plan' },
            'amount' => $p->amount,
            'created_at' => $p->created_at->format('Y-m-d'),
            'paid_at' => $p->created_at->format('Y-m-d H:i'),
        ]);
        return response()->json([
            'data' => $data,
            'meta' => ['current_page' => $paginator->currentPage(), 'per_page' => $paginator->perPage(), 'total' => $paginator->total(), 'last_page' => $paginator->lastPage(), 'from' => $paginator->firstItem(), 'to' => $paginator->lastItem()],
            'summary' => ['total' => $all->count(), 'revenue' => round($revenue, 2)],
        ]);
    }

    private function attendanceReport(?string $from, ?string $to): JsonResponse
    {
        $user = auth('api')->user();
        $member = Member::where('user_id', $user->id)->first();
        if (!$member) {
            return response()->json(['data' => [], 'meta' => ['current_page' => 1, 'per_page' => 10, 'total' => 0, 'last_page' => 1, 'from' => null, 'to' => null], 'summary' => ['total' => 0, 'present' => 0, 'completed' => 0]]);
        }
        $query = Attendance::where('member_id', $member->id);
        if ($from) $query->whereDate('attendance_date', '>=', $from);
        if ($to) $query->whereDate('attendance_date', '<=', $to);
        $all = $query->get();
        $paginator = $query->latest('attendance_date')->latest('check_in')->paginate(10);
        $data = $paginator->getCollection()->map(function (Attendance $a) {
            return [
                'attendance_date' => $a->attendance_date->format('Y-m-d'),
                'check_in' => $a->check_in ? Carbon::parse($a->check_in)->format('H:i') : null,
                'check_out' => $a->check_out ? Carbon::parse($a->check_out)->format('H:i') : null,
                'status' => $a->check_in && !$a->check_out ? 'present' : ($a->check_in && $a->check_out ? 'completed' : 'unknown'),
                'created_at' => $a->created_at->format('Y-m-d'),
            ];
        });
        return response()->json([
            'data' => $data,
            'meta' => ['current_page' => $paginator->currentPage(), 'per_page' => $paginator->perPage(), 'total' => $paginator->total(), 'last_page' => $paginator->lastPage(), 'from' => $paginator->firstItem(), 'to' => $paginator->lastItem()],
            'summary' => ['total' => $all->count(), 'present' => $all->whereNotNull('check_in')->whereNull('check_out')->count(), 'completed' => $all->whereNotNull('check_in')->whereNotNull('check_out')->count()],
        ]);
    }
}
