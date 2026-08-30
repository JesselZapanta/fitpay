<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Membership;
use App\Models\MembershipRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class HistoryController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        $memberships = Membership::with('membershipRequest')
            ->where('user_id', $user->id)
            ->latest('start_date')
            ->get()
            ->map(function (Membership $m) {
                $req = $m->membershipRequest;
                $isExpired = $m->end_date ? Carbon::parse($m->end_date)->isPast() : false;
                $computed = $isExpired ? 'expired' : $m->status;
                return [
                    'id' => $m->id,
                    'request_id' => $m->membership_request_id,
                    'plan_type' => $req?->plan_type,
                    'plan_label' => match ($req?->plan_type) {
                        'daily' => 'Daily Pass',
                        'monthly' => 'Monthly Plan',
                        'yearly' => 'Yearly Plan',
                        default => $req?->plan_type ?? '—',
                    },
                    'start_date' => $m->start_date?->format('Y-m-d'),
                    'end_date' => $m->end_date?->format('Y-m-d'),
                    'status' => $computed,
                    'raw_status' => $m->status,
                    'is_expired' => $isExpired,
                    'amount' => $req?->amount,
                    'reference_number' => $req?->reference_number,
                    'created_at' => $m->created_at?->toISOString(),
                ];
            });

        $payments = Payment::with('membership.membershipRequest')
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function (Payment $p) {
                $req = $p->membership?->membershipRequest;
                return [
                    'id' => $p->id,
                    'membership_id' => $p->membership_id,
                    'request_id' => $p->membership?->membership_request_id,
                    'plan_type' => $req?->plan_type,
                    'plan_label' => match ($req?->plan_type) {
                        'daily' => 'Daily Pass',
                        'monthly' => 'Monthly Plan',
                        'yearly' => 'Yearly Plan',
                        default => $req?->plan_type ?? '—',
                    },
                    'amount' => $p->amount,
                    'reference_number' => $req?->reference_number,
                    'start_date' => $p->membership?->start_date?->format('Y-m-d'),
                    'end_date' => $p->membership?->end_date?->format('Y-m-d'),
                    'created_at' => $p->created_at?->toISOString(),
                    'paid_at' => $p->created_at?->format('Y-m-d'),
                ];
            });

        $requests = MembershipRequest::where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function (MembershipRequest $r) {
                return [
                    'id' => $r->id,
                    'plan_type' => $r->plan_type,
                    'plan_label' => match ($r->plan_type) {
                        'daily' => 'Daily Pass',
                        'monthly' => 'Monthly Plan',
                        'yearly' => 'Yearly Plan',
                        default => $r->plan_type,
                    },
                    'amount' => $r->amount,
                    'reference_number' => $r->reference_number,
                    'status' => $r->status,
                    'admin_note' => $r->admin_note,
                    'created_at' => $r->created_at?->toISOString(),
                    'updated_at' => $r->updated_at?->toISOString(),
                ];
            });

        return response()->json([
            'data' => [
                'memberships' => $memberships,
                'payments' => $payments,
                'requests' => $requests,
            ],
        ]);
    }
}
