<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MembershipRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MembershipRequest::with('user')->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('plan_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $paginator = $query->paginate($request->get('per_page', 15))->appends($request->query());

        return response()->json([
            'data' => $paginator->items(),
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

    public function show(MembershipRequest $membershipRequest): JsonResponse
    {
        $membershipRequest->load('user');
        $member = Member::where('user_id', $membershipRequest->user_id)->first();

        return response()->json([
            'data' => [
                'id' => $membershipRequest->id,
                'plan_type' => $membershipRequest->plan_type,
                'amount' => $membershipRequest->amount,
                'reference_number' => $membershipRequest->reference_number,
                'receipt_path' => $membershipRequest->receipt_path,
                'receipt_url' => $membershipRequest->receipt_url,
                'status' => $membershipRequest->status,
                'admin_note' => $membershipRequest->admin_note,
                'created_at' => $membershipRequest->created_at?->toISOString(),
                'updated_at' => $membershipRequest->updated_at?->toISOString(),
                'user' => $membershipRequest->user ? [
                    'id' => $membershipRequest->user->id,
                    'name' => $membershipRequest->user->name,
                    'email' => $membershipRequest->user->email,
                    'role' => $membershipRequest->user->role,
                    'status' => $membershipRequest->user->status,
                    'photo' => $membershipRequest->user->photo,
                    'photo_url' => $membershipRequest->user->photo_url,
                ] : null,
                'member' => $member ? [
                    'id' => $member->id,
                    'member_code' => $member->member_code,
                    'phone' => $member->phone,
                    'address' => $member->address,
                    'birthdate' => $member->birthdate?->format('Y-m-d'),
                    'gender' => $member->gender,
                    'status' => $member->status,
                    'photo' => $member->photo,
                    'photo_url' => $member->photo_url,
                ] : null,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plan_type' => ['required', Rule::in(['daily', 'monthly', 'yearly'])],
            'amount' => ['required', 'numeric', 'min:0'],
            'reference_number' => ['required', 'string', 'max:100'],
            'receipt' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $user = $request->user('api') ?? auth('api')->user();

        $receiptPath = $request->file('receipt')->store('receipts', 'public');

        $membershipRequest = MembershipRequest::create([
            'user_id' => $user->id,
            'plan_type' => $data['plan_type'],
            'amount' => $data['amount'],
            'reference_number' => $data['reference_number'],
            'receipt_path' => $receiptPath,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Payment submitted successfully. Waiting for admin approval.',
            'data' => [
                'id' => $membershipRequest->id,
                'plan_type' => $membershipRequest->plan_type,
                'amount' => $membershipRequest->amount,
                'reference_number' => $membershipRequest->reference_number,
                'receipt_url' => $membershipRequest->receipt_url,
                'status' => $membershipRequest->status,
                'created_at' => $membershipRequest->created_at->toISOString(),
            ],
        ], 201);
    }

    public function update(Request $request, MembershipRequest $membershipRequest): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'admin_note' => $request->input('status') === 'rejected'
                ? ['required', 'string', 'max:500']
                : ['nullable', 'string', 'max:500'],
        ], [
            'admin_note.required' => 'Admin note is required when rejecting.',
        ]);

        $membership = null;
        $payment = null;

        DB::transaction(function () use ($membershipRequest, $data, &$membership, &$payment) {
            $membershipRequest->update([
                'status' => $data['status'],
                'admin_note' => $data['admin_note'] ?? null,
            ]);

            if ($data['status'] === 'approved') {
                $existing = Membership::where('membership_request_id', $membershipRequest->id)->first();
                if (!$existing) {
                    $start = Carbon::today();
                    $end = match ($membershipRequest->plan_type) {
                        'daily' => $start->copy()->addDay(),
                        'monthly' => $start->copy()->addMonth(),
                        'yearly' => $start->copy()->addYear(),
                        default => $start->copy()->addMonth(),
                    };

                    $membership = Membership::create([
                        'user_id' => $membershipRequest->user_id,
                        'membership_request_id' => $membershipRequest->id,
                        'start_date' => $start->toDateString(),
                        'end_date' => $end->toDateString(),
                        'status' => 'active',
                    ]);

                    $member = Member::where('user_id', $membershipRequest->user_id)->first();
                    if ($member) {
                        $member->update(['status' => 'active']);
                    }
                } else {
                    $membership = $existing;
                }

                if ($membership) {
                    $existingPayment = Payment::where('membership_id', $membership->id)->first();
                    if (!$existingPayment) {
                        $payment = Payment::create([
                            'user_id' => $membership->user_id,
                            'membership_id' => $membership->id,
                            'amount' => $membershipRequest->amount,
                        ]);
                    } else {
                        $payment = $existingPayment;
                    }
                }
            }
        });

        $response = [
            'message' => 'Membership request ' . $data['status'] . '.',
            'data' => [
                'id' => $membershipRequest->id,
                'status' => $membershipRequest->status,
                'admin_note' => $membershipRequest->admin_note,
            ],
        ];

        if ($membership) {
            $response['data']['membership'] = [
                'id' => $membership->id,
                'user_id' => $membership->user_id,
                'membership_request_id' => $membership->membership_request_id,
                'request_id' => $membership->membership_request_id,
                'start_date' => $membership->start_date->format('Y-m-d'),
                'end_date' => $membership->end_date->format('Y-m-d'),
                'status' => $membership->status,
            ];
        }

        if ($payment) {
            $response['data']['payment'] = [
                'id' => $payment->id,
                'user_id' => $payment->user_id,
                'membership_id' => $payment->membership_id,
                'amount' => $payment->amount,
            ];
        }

        return response()->json($response);
    }
}
