<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['user', 'membership.membershipRequest'])->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('membership', function ($m) use ($search) {
                    $m->whereHas('membershipRequest', function ($r) use ($search) {
                        $r->where('reference_number', 'like', "%{$search}%")->orWhere('plan_type', 'like', "%{$search}%");
                    });
                });
            });
        }

        if ($request->filled('plan_type') && $request->plan_type !== 'all') {
            $plan = $request->input('plan_type');
            $query->whereHas('membership.membershipRequest', function ($q) use ($plan) {
                $q->where('plan_type', $plan);
            });
        }

        if ($request->filled('month') && $request->month !== 'all') {
            $month = (int) $request->input('month');
            if ($month >= 1 && $month <= 12) {
                $query->whereMonth('created_at', $month);
            }
        }

        $paginator = $query->paginate($request->get('per_page', 10))->appends($request->query());

        $data = $paginator->getCollection()->map(function (Payment $p) {
            return [
                'id' => $p->id,
                'user_id' => $p->user_id,
                'membership_id' => $p->membership_id,
                'amount' => $p->amount,
                'created_at' => $p->created_at?->toISOString(),
                'updated_at' => $p->updated_at?->toISOString(),
                'user' => $p->user ? [
                    'id' => $p->user->id,
                    'name' => $p->user->name,
                    'email' => $p->user->email,
                    'photo' => $p->user->photo,
                    'photo_url' => $p->user->photo_url,
                ] : null,
                'membership' => $p->membership ? [
                    'id' => $p->membership->id,
                    'user_id' => $p->membership->user_id,
                    'membership_request_id' => $p->membership->membership_request_id,
                    'request_id' => $p->membership->membership_request_id,
                    'start_date' => $p->membership->start_date?->format('Y-m-d'),
                    'end_date' => $p->membership->end_date?->format('Y-m-d'),
                    'status' => $p->membership->status,
                ] : null,
                'request' => $p->membership?->membershipRequest ? [
                    'id' => $p->membership->membershipRequest->id,
                    'plan_type' => $p->membership->membershipRequest->plan_type,
                    'plan_label' => match ($p->membership->membershipRequest->plan_type) {
                        'daily' => 'Daily Pass',
                        'monthly' => 'Monthly Plan',
                        'yearly' => 'Yearly Plan',
                        default => $p->membership->membershipRequest->plan_type,
                    },
                    'reference_number' => $p->membership->membershipRequest->reference_number,
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

    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['user', 'membership.membershipRequest']);

        return response()->json([
            'data' => [
                'id' => $payment->id,
                'user_id' => $payment->user_id,
                'membership_id' => $payment->membership_id,
                'amount' => $payment->amount,
                'created_at' => $payment->created_at?->toISOString(),
                'updated_at' => $payment->updated_at?->toISOString(),
                'user' => $payment->user ? [
                    'id' => $payment->user->id,
                    'name' => $payment->user->name,
                    'email' => $payment->user->email,
                    'photo' => $payment->user->photo,
                    'photo_url' => $payment->user->photo_url,
                ] : null,
                'membership' => $payment->membership ? [
                    'id' => $payment->membership->id,
                    'start_date' => $payment->membership->start_date?->format('Y-m-d'),
                    'end_date' => $payment->membership->end_date?->format('Y-m-d'),
                    'status' => $payment->membership->status,
                ] : null,
                'request' => $payment->membership?->membershipRequest ? [
                    'id' => $payment->membership->membershipRequest->id,
                    'plan_type' => $payment->membership->membershipRequest->plan_type,
                    'plan_label' => match ($payment->membership->membershipRequest->plan_type) {
                        'daily' => 'Daily Pass',
                        'monthly' => 'Monthly Plan',
                        'yearly' => 'Yearly Plan',
                        default => $payment->membership->membershipRequest->plan_type,
                    },
                    'reference_number' => $payment->membership->membershipRequest->reference_number,
                    'amount' => $payment->membership->membershipRequest->amount,
                ] : null,
            ],
        ]);
    }
}
