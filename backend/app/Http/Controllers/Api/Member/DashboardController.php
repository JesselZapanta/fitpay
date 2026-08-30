<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Membership;
use App\Models\MembershipRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $user = auth('api')->user();

        $latestRequest = MembershipRequest::where('user_id', $user->id)
            ->latest()
            ->first();

        $membership = Membership::where('user_id', $user->id)
            ->with('membershipRequest')
            ->latest('end_date')
            ->first();

        $planData = null;
        if ($membership) {
            $req = $membership->membershipRequest;
            $labels = ['daily' => 'Daily', 'monthly' => 'Monthly', 'yearly' => 'Yearly'];
            $planType = $req?->plan_type ?? $membership->membershipRequest?->plan_type ?? 'monthly';
            $start = Carbon::parse($membership->start_date);
            $expiresAt = Carbon::parse($membership->end_date);
            $now = Carbon::now();
            $days = $start->diffInDays($expiresAt) ?: 1;
            $elapsed = max(0, $now->diffInDays($start, false));
            $progress = $days > 0 ? min(100, max(0, ($elapsed / $days) * 100)) : 0;
            $daysLeft = max(0, $now->diffInDays($expiresAt, false));
            $isExpired = $expiresAt->isPast() || $membership->status === 'expired';
            if ($isExpired) {
                $daysLeft = 0;
                $progress = 100;
            }
            $planData = [
                'id' => $membership->id,
                'request_id' => $membership->membership_request_id,
                'plan_type' => $planType,
                'plan_label' => $labels[$planType] ?? $planType,
                'amount' => $req?->amount ?? 0,
                'status' => $isExpired ? 'expired' : 'active',
                'raw_status' => $membership->status,
                'start_date' => $membership->start_date->format('Y-m-d'),
                'approved_at' => $start->toISOString(),
                'expires_at' => $expiresAt->toISOString(),
                'expires_date' => $expiresAt->format('Y-m-d'),
                'days_left' => (int) $daysLeft,
                'progress' => round($progress),
                'is_expired' => $isExpired,
            ];
        } else {
            $currentPlan = MembershipRequest::where('user_id', $user->id)
                ->where('status', 'approved')
                ->latest('updated_at')
                ->first();
            if ($currentPlan) {
                $labels = ['daily' => 'Daily', 'monthly' => 'Monthly', 'yearly' => 'Yearly'];
                $approvedAt = $currentPlan->updated_at ?? $currentPlan->created_at;
                $expiresAt = match ($currentPlan->plan_type) {
                    'daily' => Carbon::parse($approvedAt)->addDay(),
                    'monthly' => Carbon::parse($approvedAt)->addMonth(),
                    'yearly' => Carbon::parse($approvedAt)->addYear(),
                    default => Carbon::parse($approvedAt)->addMonth(),
                };
                $days = Carbon::parse($approvedAt)->diffInDays($expiresAt) ?: 1;
                $now = Carbon::now();
                $elapsed = $approvedAt ? $now->diffInDays($approvedAt, false) : 0;
                $elapsed = max(0, $elapsed);
                $progress = $days > 0 ? min(100, max(0, ($elapsed / $days) * 100)) : 0;
                $daysLeft = max(0, $now->diffInDays($expiresAt, false));
                if ($expiresAt->isPast()) {
                    $daysLeft = 0;
                    $progress = 100;
                }
                $planData = [
                    'id' => $currentPlan->id,
                    'plan_type' => $currentPlan->plan_type,
                    'plan_label' => $labels[$currentPlan->plan_type] ?? $currentPlan->plan_type,
                    'amount' => $currentPlan->amount,
                    'status' => $currentPlan->status,
                    'approved_at' => $approvedAt?->toISOString(),
                    'expires_at' => $expiresAt->toISOString(),
                    'expires_date' => $expiresAt->format('Y-m-d'),
                    'days_left' => (int) $daysLeft,
                    'progress' => round($progress),
                    'is_expired' => $expiresAt->isPast(),
                ];
            }
        }

        $requestData = null;
        if ($latestRequest) {
            $labels = ['daily' => 'Daily Pass', 'monthly' => 'Monthly Plan', 'yearly' => 'Yearly Plan'];
            $requestData = [
                'id' => $latestRequest->id,
                'plan_type' => $latestRequest->plan_type,
                'plan_label' => $labels[$latestRequest->plan_type] ?? $latestRequest->plan_type,
                'amount' => $latestRequest->amount,
                'status' => $latestRequest->status,
                'reference_number' => $latestRequest->reference_number,
                'receipt_url' => $latestRequest->receipt_url,
                'admin_note' => $latestRequest->admin_note,
                'created_at' => $latestRequest->created_at?->toISOString(),
                'updated_at' => $latestRequest->updated_at?->toISOString(),
            ];
        }

        return response()->json([
            'data' => [
                'role' => $user->role,
                'welcome' => 'Welcome ' . $user->name . ' — keep crushing it!',
                'stats' => [
                    ['label' => 'Check-ins This Month', 'value' => '12', 'icon' => 'CalendarCheck'],
                    ['label' => 'Membership Status', 'value' => $planData ? $planData['plan_label'] : 'No Plan', 'icon' => 'ShieldCheck'],
                    ['label' => 'Next Payment', 'value' => $planData ? Carbon::parse($planData['expires_at'])->format('M d') : '—', 'icon' => 'CreditCard'],
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
                'current_plan' => $planData,
                'latest_request' => $requestData,
            ],
        ]);
    }
}
