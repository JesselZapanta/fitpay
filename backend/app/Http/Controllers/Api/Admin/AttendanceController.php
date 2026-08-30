<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with(['member.user', 'user'])
            ->whereHas('member', function ($q) {
                $q->whereHas('user.memberships', function ($mq) {
                    $mq->where('status', 'active')->where('end_date', '>=', today());
                });
            })
            ->latest('attendance_date')->latest('check_in');

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('member_id')) {
            $query->where('member_id', $request->input('member_id'));
        }

        if ($request->filled('date')) {
            $query->where('attendance_date', $request->input('date'));
        } elseif ($request->filled('attendance_date')) {
            $query->where('attendance_date', $request->input('attendance_date'));
        }

        if ($request->filled('type')) {
            if ($request->input('type') === 'present') {
                $query->whereNotNull('check_in')->whereNull('check_out');
            } elseif ($request->input('type') === 'completed') {
                $query->whereNotNull('check_in')->whereNotNull('check_out');
            }
        }

        $paginator = $query->paginate($request->get('per_page', 15))->appends($request->query());

        $data = $paginator->getCollection()->map(function (Attendance $a) {
            $member = $a->member;
            $user = $a->user ?? $member?->user;
            return [
                'id' => $a->id,
                'member_id' => $a->member_id,
                'user_id' => $a->user_id,
                'attendance_date' => $a->attendance_date?->format('Y-m-d'),
                'check_in' => $a->check_in ? Carbon::parse($a->check_in)->format('H:i') : null,
                'check_in_full' => $a->check_in ? Carbon::parse($a->check_in)->format('H:i:s') : null,
                'check_out' => $a->check_out ? Carbon::parse($a->check_out)->format('H:i') : null,
                'check_out_full' => $a->check_out ? Carbon::parse($a->check_out)->format('H:i:s') : null,
                'remarks' => $a->remarks,
                'status' => $a->check_in && !$a->check_out ? 'present' : ($a->check_in && $a->check_out ? 'completed' : 'unknown'),
                'created_at' => $a->created_at?->toISOString(),
                'updated_at' => $a->updated_at?->toISOString(),
                'member' => $member ? [
                    'id' => $member->id,
                    'member_code' => $member->member_code,
                    'name' => $member->name,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'photo' => $member->photo,
                    'photo_url' => $member->photo_url,
                    'status' => $member->status,
                ] : null,
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'photo' => $user->photo,
                    'photo_url' => $user->photo_url,
                ] : null,
            ];
        });

        $today = today()->format('Y-m-d');
        $activeScope = function ($q) {
            $q->whereHas('member', function ($mq) {
                $mq->whereHas('user.memberships', function ($mmq) {
                    $mmq->where('status', 'active')->where('end_date', '>=', today());
                });
            });
        };
        $todayPresent = Attendance::where('attendance_date', $today)->whereNotNull('check_in')->whereNull('check_out')->where($activeScope)->count();
        $todayCompleted = Attendance::where('attendance_date', $today)->whereNotNull('check_in')->whereNotNull('check_out')->where($activeScope)->count();
        $todayTotal = Attendance::where('attendance_date', $today)->where($activeScope)->count();

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
            'stats' => [
                'today_total' => $todayTotal,
                'today_present' => $todayPresent,
                'today_completed' => $todayCompleted,
                'today_date' => $today,
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ]);
    }

    public function checkIn(Request $request): JsonResponse
    {
        $data = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
            'attendance_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $member = Member::with('user')->findOrFail($data['member_id']);
        $hasActive = \App\Models\Membership::where('user_id', $member->user_id)->where('status', 'active')->where('end_date', '>=', today())->exists();
        if (!$hasActive) {
            return response()->json(['message' => 'Member does not have an active membership (most current fee).'], 422);
        }
        $date = $data['attendance_date'] ?? today()->format('Y-m-d');
        $now = now()->format('H:i:s');

        $attendance = Attendance::where('member_id', $member->id)->where('attendance_date', $date)->first();

        if ($attendance) {
            if ($attendance->check_in && is_null($attendance->check_out)) {
                return response()->json(['message' => 'Member already checked in today. Please check out first.', 'data' => $attendance], 422);
            }
            if ($attendance->check_in && $attendance->check_out) {
                return response()->json(['message' => 'Member already completed attendance for today.', 'data' => $attendance], 422);
            }
            $attendance->update(['check_in' => $now, 'user_id' => $member->user_id, 'remarks' => $data['remarks'] ?? $attendance->remarks]);
        } else {
            $attendance = Attendance::create([
                'member_id' => $member->id,
                'user_id' => $member->user_id,
                'attendance_date' => $date,
                'check_in' => $now,
                'remarks' => $data['remarks'] ?? null,
            ]);
        }

        $attendance->load(['member.user', 'user']);

        return response()->json([
            'message' => 'Checked in successfully.',
            'data' => [
                'id' => $attendance->id,
                'member_id' => $attendance->member_id,
                'attendance_date' => $attendance->attendance_date?->format('Y-m-d'),
                'check_in' => $attendance->check_in ? Carbon::parse($attendance->check_in)->format('H:i') : null,
                'check_out' => $attendance->check_out ? Carbon::parse($attendance->check_out)->format('H:i') : null,
                'status' => 'present',
            ],
        ]);
    }

    public function checkOut(Request $request): JsonResponse
    {
        $data = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
            'attendance_date' => ['nullable', 'date'],
        ]);

        $member = Member::findOrFail($data['member_id']);
        $date = $data['attendance_date'] ?? today()->format('Y-m-d');
        $now = now()->format('H:i:s');

        $attendance = Attendance::where('member_id', $member->id)->where('attendance_date', $date)->first();

        if (!$attendance || !$attendance->check_in) {
            return response()->json(['message' => 'Member has not checked in today.'], 422);
        }

        if ($attendance->check_out) {
            return response()->json(['message' => 'Member already checked out today.', 'data' => $attendance], 422);
        }

        $attendance->update(['check_out' => $now]);

        $attendance->load(['member.user', 'user']);

        return response()->json([
            'message' => 'Checked out successfully.',
            'data' => [
                'id' => $attendance->id,
                'member_id' => $attendance->member_id,
                'attendance_date' => $attendance->attendance_date?->format('Y-m-d'),
                'check_in' => $attendance->check_in ? Carbon::parse($attendance->check_in)->format('H:i') : null,
                'check_out' => $attendance->check_out ? Carbon::parse($attendance->check_out)->format('H:i') : null,
                'status' => 'completed',
            ],
        ]);
    }
}
