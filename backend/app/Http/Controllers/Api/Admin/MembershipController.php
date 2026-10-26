<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Membership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MembershipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Membership::with(['user', 'membershipRequest'])->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('membershipRequest', function ($r) use ($search) {
                    $r->where('reference_number', 'like', "%{$search}%")->orWhere('plan_type', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'expired') {
                $query->where(function ($q) {
                    $q->where('status', 'expired')->orWhere('end_date', '<', Carbon::today());
                });
            } elseif ($request->status === 'active') {
                $query->where('status', 'active')->where('end_date', '>=', Carbon::today());
            } else {
                $query->where('status', $request->status);
            }
        }

        $paginator = $query->paginate($request->get('per_page', 10))->appends($request->query());

        $data = $paginator->getCollection()->map(function (Membership $m) {
            $isExpired = $m->end_date ? Carbon::parse($m->end_date)->isPast() : false;
            $computedStatus = $isExpired ? 'expired' : $m->status;
            return [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'membership_request_id' => $m->membership_request_id,
                'request_id' => $m->membership_request_id,
                'start_date' => $m->start_date?->format('Y-m-d'),
                'end_date' => $m->end_date?->format('Y-m-d'),
                'status' => $computedStatus,
                'raw_status' => $m->status,
                'is_expired' => $isExpired,
                'created_at' => $m->created_at?->toISOString(),
                'updated_at' => $m->updated_at?->toISOString(),
                'user' => $m->user ? [
                    'id' => $m->user->id,
                    'name' => $m->user->name,
                    'email' => $m->user->email,
                    'photo' => $m->user->photo,
                    'photo_url' => $m->user->photo_url,
                ] : null,
                'request' => $m->membershipRequest ? [
                    'id' => $m->membershipRequest->id,
                    'plan_type' => $m->membershipRequest->plan_type,
                    'plan_label' => match ($m->membershipRequest->plan_type) {
                        'daily' => 'Daily Pass',
                        'monthly' => 'Monthly Plan',
                        'yearly' => 'Yearly Plan',
                        default => $m->membershipRequest->plan_type,
                    },
                    'amount' => $m->membershipRequest->amount,
                    'reference_number' => $m->membershipRequest->reference_number,
                    'status' => $m->membershipRequest->status,
                ] : null,
            ];
        });

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
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ]);
    }

    public function update(Request $request, Membership $membership): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:active,expired'],
        ]);

        $membership->update([
            'status' => $data['status'],
        ]);

        if ($membership->user) {
            $member = \App\Models\Member::where('user_id', $membership->user_id)->first();
            if ($member) {
                $member->update(['status' => $data['status'] === 'active' ? 'active' : 'expired']);
            }
        }

        $membership->load(['user', 'membershipRequest']);
        $isExpired = $membership->end_date ? Carbon::parse($membership->end_date)->isPast() : false;
        $computedStatus = $isExpired ? 'expired' : $membership->status;

        return response()->json([
            'message' => 'Membership updated.',
            'data' => [
                'id' => $membership->id,
                'user_id' => $membership->user_id,
                'membership_request_id' => $membership->membership_request_id,
                'request_id' => $membership->membership_request_id,
                'start_date' => $membership->start_date?->format('Y-m-d'),
                'end_date' => $membership->end_date?->format('Y-m-d'),
                'status' => $computedStatus,
                'raw_status' => $membership->status,
                'is_expired' => $isExpired,
            ],
        ]);
    }

    public function show(Membership $membership): JsonResponse
    {
        $membership->load(['user', 'membershipRequest']);

        $isExpired = $membership->end_date ? Carbon::parse($membership->end_date)->isPast() : false;
        $computedStatus = $isExpired ? 'expired' : $membership->status;

        return response()->json([
            'data' => [
                'id' => $membership->id,
                'user_id' => $membership->user_id,
                'membership_request_id' => $membership->membership_request_id,
                'request_id' => $membership->membership_request_id,
                'start_date' => $membership->start_date?->format('Y-m-d'),
                'end_date' => $membership->end_date?->format('Y-m-d'),
                'status' => $computedStatus,
                'raw_status' => $membership->status,
                'is_expired' => $isExpired,
                'created_at' => $membership->created_at?->toISOString(),
                'updated_at' => $membership->updated_at?->toISOString(),
                'user' => $membership->user ? [
                    'id' => $membership->user->id,
                    'name' => $membership->user->name,
                    'email' => $membership->user->email,
                    'photo' => $membership->user->photo,
                    'photo_url' => $membership->user->photo_url,
                ] : null,
                'request' => $membership->membershipRequest ? [
                    'id' => $membership->membershipRequest->id,
                    'plan_type' => $membership->membershipRequest->plan_type,
                    'plan_label' => match ($membership->membershipRequest->plan_type) {
                        'daily' => 'Daily Pass',
                        'monthly' => 'Monthly Plan',
                        'yearly' => 'Yearly Plan',
                        default => $membership->membershipRequest->plan_type,
                    },
                    'amount' => $membership->membershipRequest->amount,
                    'reference_number' => $membership->membershipRequest->reference_number,
                    'status' => $membership->membershipRequest->status,
                ] : null,
            ],
        ]);
    }
}
