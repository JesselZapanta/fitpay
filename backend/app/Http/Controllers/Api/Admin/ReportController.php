<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'type' => ['nullable', 'in:members,memberships,payments,attendance,general'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'status' => ['nullable', 'string'],
            'plan_type' => ['nullable', 'in:all,daily,monthly,yearly'],
            'month' => ['nullable', 'in:all,1,2,3,4,5,6,7,8,9,10,11,12'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $type = $request->input('type', 'general');
        $from = $request->input('from');
        $to = $request->input('to');

        if ($type === 'general' || !$request->filled('type')) {
            return $this->generalReport($request, $from, $to);
        }

        return match ($type) {
            'members' => $this->membersReport($request, $from, $to),
            'memberships' => $this->membershipsReport($request, $from, $to),
            'payments' => $this->paymentsReport($request, $from, $to),
            'attendance' => $this->attendanceReport($request, $from, $to),
        };
    }

    private function membersReport(Request $request, ?string $from, ?string $to): JsonResponse
    {
        $query = Member::with('user');

        if ($from) $query->whereDate('created_at', '>=', $from);
        if ($to) $query->whereDate('created_at', '<=', $to);
        if ($request->filled('search')) $query->search($request->input('search'));
        if ($request->filled('status') && $request->status !== 'all') $query->where('status', $request->status);
        if ($request->filled('plan_type') && $request->plan_type !== 'all') {
            $plan = $request->plan_type;
            $query->whereHas('user.memberships.membershipRequest', function ($q) use ($plan) {
                $q->where('plan_type', $plan);
            });
        }

        $all = (clone $query)->get();
        $total = $all->count();
        $active = $all->where('status', 'active')->count();
        $expired = $all->where('status', 'expired')->count();
        $inactive = $all->where('status', 'inactive')->count();

        $paginator = $query->latest()->paginate($request->get('per_page', 10))->appends($request->query());

        $data = $paginator->getCollection()->map(function (Member $m) {
            $latestMembership = \App\Models\Membership::where('user_id', $m->user_id)->latest('end_date')->first();
            $plan = $latestMembership?->membershipRequest?->plan_type;
            if (!$plan) {
                $latestRequest = \App\Models\MembershipRequest::where('user_id', $m->user_id)->latest()->first();
                $plan = $latestRequest?->plan_type;
            }
            return [
                'id' => $m->id,
                'member_code' => $m->member_code,
                'name' => $m->name,
                'email' => $m->email,
                'phone' => $m->phone,
                'status' => $m->status,
                'gender' => $m->gender,
                'birthdate' => $m->birthdate?->format('Y-m-d'),
                'created_at' => $m->created_at?->format('Y-m-d'),
                'latest_plan' => $plan,
                'latest_plan_label' => match ($plan) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => $plan ?? 'No plan' },
                'has_active_membership' => $latestMembership && $latestMembership->status === 'active' && Carbon::parse($latestMembership->end_date)->gte(today()),
            ];
        });

        return $this->paginatedResponse($data, $paginator, [
            'total' => $total,
            'active' => $active,
            'expired' => $expired,
            'inactive' => $inactive,
        ]);
    }

    private function membershipsReport(Request $request, ?string $from, ?string $to): JsonResponse
    {
        $query = Membership::with(['user', 'membershipRequest']);

        if ($from) $query->whereDate('start_date', '>=', $from);
        if ($to) $query->whereDate('start_date', '<=', $to);
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                  ->orWhereHas('membershipRequest', fn($r) => $r->where('reference_number', 'like', "%{$search}%"));
            });
        }
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'expired') {
                $query->where(function ($q) { $q->where('status', 'expired')->orWhere('end_date', '<', today()); });
            } else {
                $query->where('status', $request->status)->where('end_date', '>=', today());
            }
        }
        if ($request->filled('plan_type') && $request->plan_type !== 'all') {
            $query->whereHas('membershipRequest', fn($q) => $q->where('plan_type', $request->plan_type));
        }

        $all = (clone $query)->get();
        $total = $all->count();
        $active = $all->filter(fn($m) => !$m->end_date->isPast() && $m->status === 'active')->count();
        $expired = $total - $active;

        $paginator = $query->latest('start_date')->paginate($request->get('per_page', 10))->appends($request->query());

        $data = $paginator->getCollection()->map(function (Membership $m) {
            $isExpired = $m->end_date->isPast() || $m->status === 'expired';
            return [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'user_name' => $m->user?->name,
                'user_email' => $m->user?->email,
                'plan_type' => $m->membershipRequest?->plan_type,
                'plan_label' => match ($m->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => $m->membershipRequest?->plan_type ?? 'No plan' },
                'reference_number' => $m->membershipRequest?->reference_number,
                'amount' => $m->membershipRequest?->amount,
                'start_date' => $m->start_date->format('Y-m-d'),
                'end_date' => $m->end_date->format('Y-m-d'),
                'status' => $isExpired ? 'expired' : 'active',
                'raw_status' => $m->status,
                'created_at' => $m->created_at->format('Y-m-d'),
            ];
        });

        return $this->paginatedResponse($data, $paginator, ['total' => $total, 'active' => $active, 'expired' => $expired]);
    }

    private function paymentsReport(Request $request, ?string $from, ?string $to): JsonResponse
    {
        $query = Payment::with(['user', 'membership.membershipRequest']);

        if ($from) $query->whereDate('created_at', '>=', $from);
        if ($to) $query->whereDate('created_at', '<=', $to);
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                  ->orWhereHas('membership.membershipRequest', fn($r) => $r->where('reference_number', 'like', "%{$search}%"));
            });
        }
        if ($request->filled('plan_type') && $request->plan_type !== 'all') {
            $query->whereHas('membership.membershipRequest', fn($q) => $q->where('plan_type', $request->plan_type));
        }
        if ($request->filled('month') && $request->month !== 'all') {
            $query->whereMonth('created_at', (int) $request->month);
        }

        $all = (clone $query)->get();
        $total = $all->count();
        $revenue = $all->sum(fn($p) => (float) $p->amount);

        $paginator = $query->latest()->paginate($request->get('per_page', 10))->appends($request->query());

        $data = $paginator->getCollection()->map(function (Payment $p) {
            return [
                'id' => $p->id,
                'user_id' => $p->user_id,
                'user_name' => $p->user?->name,
                'user_email' => $p->user?->email,
                'membership_id' => $p->membership_id,
                'plan_type' => $p->membership?->membershipRequest?->plan_type,
                'plan_label' => match ($p->membership?->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => $p->membership?->membershipRequest?->plan_type ?? 'No plan' },
                'reference_number' => $p->membership?->membershipRequest?->reference_number,
                'amount' => $p->amount,
                'created_at' => $p->created_at->format('Y-m-d'),
                'paid_at' => $p->created_at->format('Y-m-d H:i'),
            ];
        });

        return $this->paginatedResponse($data, $paginator, ['total' => $total, 'revenue' => round($revenue, 2)]);
    }

    private function attendanceReport(Request $request, ?string $from, ?string $to): JsonResponse
    {
        $query = Attendance::with(['member.user', 'user']);

        if ($from) $query->whereDate('attendance_date', '>=', $from);
        if ($to) $query->whereDate('attendance_date', '<=', $to);
        if ($request->filled('search')) $query->search($request->input('search'));
        if ($request->filled('month') && $request->month !== 'all') {
            $query->whereMonth('attendance_date', (int) $request->month);
        }

        $all = (clone $query)->get();
        $total = $all->count();
        $present = $all->whereNotNull('check_in')->whereNull('check_out')->count();
        $completed = $all->whereNotNull('check_in')->whereNotNull('check_out')->count();

        $paginator = $query->latest('attendance_date')->latest('check_in')->paginate($request->get('per_page', 10))->appends($request->query());

        $data = $paginator->getCollection()->map(function (Attendance $a) {
            $member = $a->member;
            return [
                'id' => $a->id,
                'member_id' => $a->member_id,
                'member_code' => $member?->member_code,
                'member_name' => $member?->name ?? $a->user?->name,
                'member_email' => $member?->email ?? $a->user?->email,
                'attendance_date' => $a->attendance_date->format('Y-m-d'),
                'check_in' => $a->check_in ? Carbon::parse($a->check_in)->format('H:i') : null,
                'check_out' => $a->check_out ? Carbon::parse($a->check_out)->format('H:i') : null,
                'status' => $a->check_in && !$a->check_out ? 'present' : ($a->check_in && $a->check_out ? 'completed' : 'unknown'),
                'created_at' => $a->created_at->format('Y-m-d'),
            ];
        });

        return $this->paginatedResponse($data, $paginator, ['total' => $total, 'present' => $present, 'completed' => $completed]);
    }

    private function generalReport(Request $request, ?string $from, ?string $to): JsonResponse
    {
        $memberQuery = Member::query();
        if ($from) $memberQuery->whereDate('created_at', '>=', $from);
        if ($to) $memberQuery->whereDate('created_at', '<=', $to);
        $membersAll = $memberQuery->get();
        $membersSummary = [
            'total' => $membersAll->count(),
            'active' => $membersAll->where('status', 'active')->count(),
            'expired' => $membersAll->where('status', 'expired')->count(),
            'inactive' => $membersAll->where('status', 'inactive')->count(),
        ];

        $membershipQuery = Membership::with(['user', 'membershipRequest']);
        if ($from) $membershipQuery->whereDate('start_date', '>=', $from);
        if ($to) $membershipQuery->whereDate('start_date', '<=', $to);
        $membershipsAll = $membershipQuery->get();
        $membershipsActive = $membershipsAll->filter(fn($m) => !$m->end_date->isPast() && $m->status === 'active')->count();

        $paymentQuery = Payment::query();
        if ($from) $paymentQuery->whereDate('created_at', '>=', $from);
        if ($to) $paymentQuery->whereDate('created_at', '<=', $to);
        $paymentsAll = $paymentQuery->get();
        $paymentsRevenue = $paymentsAll->sum(fn($p) => (float) $p->amount);

        $attendanceQuery = Attendance::query();
        if ($from) $attendanceQuery->whereDate('attendance_date', '>=', $from);
        if ($to) $attendanceQuery->whereDate('attendance_date', '<=', $to);
        $attendancesAll = $attendanceQuery->get();

        $recentMembers = Member::with('user')->latest()->limit(5)->get()->map(fn(Member $m) => [
            'member_code' => $m->member_code,
            'name' => $m->name,
            'status' => $m->status,
            'created_at' => $m->created_at->format('Y-m-d'),
        ]);
        $recentMemberships = Membership::with(['user', 'membershipRequest'])->latest('start_date')->limit(5)->get()->map(function (Membership $m) {
            $isExpired = $m->end_date->isPast() || $m->status === 'expired';
            return [
                'user_name' => $m->user?->name,
                'plan_label' => match ($m->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => 'No plan' },
                'period' => $m->start_date->format('Y-m-d') . ' → ' . $m->end_date->format('Y-m-d'),
                'status' => $isExpired ? 'expired' : 'active',
            ];
        });
        $recentPayments = Payment::with(['user', 'membership.membershipRequest'])->latest()->limit(5)->get()->map(fn(Payment $p) => [
            'user_name' => $p->user?->name,
            'plan_label' => match ($p->membership?->membershipRequest?->plan_type) { 'daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan', default => 'No plan' },
            'amount' => $p->amount,
            'created_at' => $p->created_at->format('Y-m-d'),
        ]);
        $recentAttendances = Attendance::with(['member.user'])->latest('attendance_date')->latest('check_in')->limit(5)->get()->map(function (Attendance $a) {
            return [
                'member_name' => $a->member?->name ?? $a->user?->name,
                'member_code' => $a->member?->member_code,
                'attendance_date' => $a->attendance_date->format('Y-m-d'),
                'check_in' => $a->check_in ? Carbon::parse($a->check_in)->format('H:i') : null,
                'check_out' => $a->check_out ? Carbon::parse($a->check_out)->format('H:i') : null,
                'status' => $a->check_in && !$a->check_out ? 'present' : ($a->check_in && $a->check_out ? 'completed' : 'unknown'),
            ];
        });

        return response()->json([
            'data' => [
                'members' => $recentMembers,
                'memberships' => $recentMemberships,
                'payments' => $recentPayments,
                'attendances' => $recentAttendances,
            ],
            'summary' => [
                'members_total' => $membersSummary['total'],
                'members_active' => $membersSummary['active'],
                'memberships_total' => $membershipsAll->count(),
                'memberships_active' => $membershipsActive,
                'memberships_expired' => $membershipsAll->count() - $membershipsActive,
                'payments_total' => $paymentsAll->count(),
                'payments_revenue' => round($paymentsRevenue, 2),
                'attendances_total' => $attendancesAll->count(),
                'attendances_present' => $attendancesAll->whereNotNull('check_in')->whereNull('check_out')->count(),
                'attendances_completed' => $attendancesAll->whereNotNull('check_in')->whereNotNull('check_out')->count(),
            ],
            'meta' => ['from' => $from, 'to' => $to],
        ]);
    }

    private function paginatedResponse($data, $paginator, array $summary): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'summary' => $summary,
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ]);
    }
}
