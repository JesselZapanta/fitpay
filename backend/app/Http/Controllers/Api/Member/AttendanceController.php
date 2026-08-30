<?php

namespace App\Http\Controllers\Api\Member;

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
        $user = auth('api')->user();
        $member = Member::where('user_id', $user->id)->first();

        if (!$member) {
            return response()->json([
                'data' => [],
                'meta' => ['current_page' => 1, 'per_page' => 15, 'total' => 0, 'last_page' => 1, 'from' => null, 'to' => null],
                'stats' => ['total' => 0, 'this_month' => 0, 'today' => null, 'streak' => 0],
            ]);
        }

        $query = Attendance::where('member_id', $member->id)->latest('attendance_date')->latest('check_in');

        if ($request->filled('date')) {
            $query->where('attendance_date', $request->input('date'));
        }
        if ($request->filled('month')) {
            $month = (int) $request->input('month');
            if ($month >= 1 && $month <= 12) $query->whereMonth('attendance_date', $month);
        }
        if ($request->filled('from') && $request->filled('to')) {
            $query->whereBetween('attendance_date', [$request->input('from'), $request->input('to')]);
        }

        $paginator = $query->paginate($request->get('per_page', 15))->appends($request->query());

        $data = $paginator->getCollection()->map(function (Attendance $a) {
            $checkIn = $a->check_in ? Carbon::parse($a->check_in) : null;
            $checkOut = $a->check_out ? Carbon::parse($a->check_out) : null;
            $duration = null;
            if ($checkIn && $checkOut) {
                $diff = $checkIn->diff($checkOut);
                $duration = sprintf('%dh %dm', $diff->h, $diff->i);
                if ($diff->h === 0) $duration = sprintf('%dm', $diff->i);
            }
            return [
                'id' => $a->id,
                'attendance_date' => $a->attendance_date?->format('Y-m-d'),
                'check_in' => $checkIn?->format('H:i'),
                'check_out' => $checkOut?->format('H:i'),
                'check_in_full' => $checkIn?->format('H:i:s'),
                'check_out_full' => $checkOut?->format('H:i:s'),
                'status' => $a->check_in && !$a->check_out ? 'present' : ($a->check_in && $a->check_out ? 'completed' : 'unknown'),
                'duration' => $duration,
                'remarks' => $a->remarks,
                'created_at' => $a->created_at?->toISOString(),
            ];
        });

        $total = Attendance::where('member_id', $member->id)->count();
        $thisMonth = Attendance::where('member_id', $member->id)->whereMonth('attendance_date', now()->month)->whereYear('attendance_date', now()->year)->count();
        $today = Attendance::where('member_id', $member->id)->where('attendance_date', today())->first();
        $todayData = null;
        if ($today) {
            $todayData = [
                'attendance_date' => $today->attendance_date->format('Y-m-d'),
                'check_in' => $today->check_in ? Carbon::parse($today->check_in)->format('H:i') : null,
                'check_out' => $today->check_out ? Carbon::parse($today->check_out)->format('H:i') : null,
                'status' => $today->check_in && !$today->check_out ? 'present' : ($today->check_in && $today->check_out ? 'completed' : 'unknown'),
            ];
        }

        $hasActive = \App\Models\Membership::where('user_id', $user->id)->where('status', 'active')->where('end_date', '>=', today())->exists();

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
            'today' => $todayData,
            'stats' => [
                'total' => $total,
                'this_month' => $thisMonth,
                'today' => $todayData,
                'has_active_membership' => $hasActive,
            ],
            'member' => [
                'id' => $member->id,
                'member_code' => $member->member_code,
                'name' => $member->name,
            ],
        ]);
    }

    public function checkIn(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $member = Member::where('user_id', $user->id)->first();
        if (!$member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }
        $hasActive = \App\Models\Membership::where('user_id', $user->id)->where('status', 'active')->where('end_date', '>=', today())->exists();
        if (!$hasActive) {
            return response()->json(['message' => 'No active membership (most current fee). Please renew.'], 422);
        }
        $date = today()->format('Y-m-d');
        $now = now()->format('H:i:s');
        $attendance = Attendance::where('member_id', $member->id)->where('attendance_date', $date)->first();
        if ($attendance) {
            if ($attendance->check_in && is_null($attendance->check_out)) {
                return response()->json(['message' => 'Already checked in today. Please check out first.'], 422);
            }
            if ($attendance->check_in && $attendance->check_out) {
                return response()->json(['message' => 'Already completed attendance for today.'], 422);
            }
            $attendance->update(['check_in' => $now, 'user_id' => $user->id]);
        } else {
            $attendance = Attendance::create([
                'member_id' => $member->id,
                'user_id' => $user->id,
                'attendance_date' => $date,
                'check_in' => $now,
            ]);
        }
        return response()->json(['message' => 'Checked in successfully.', 'data' => [
            'attendance_date' => $attendance->attendance_date->format('Y-m-d'),
            'check_in' => Carbon::parse($attendance->check_in)->format('H:i'),
            'status' => 'present',
        ]]);
    }

    public function checkOut(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $member = Member::where('user_id', $user->id)->first();
        if (!$member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }
        $date = today()->format('Y-m-d');
        $now = now()->format('H:i:s');
        $attendance = Attendance::where('member_id', $member->id)->where('attendance_date', $date)->first();
        if (!$attendance || !$attendance->check_in) {
            return response()->json(['message' => 'Not checked in today.'], 422);
        }
        if ($attendance->check_out) {
            return response()->json(['message' => 'Already checked out today.'], 422);
        }
        $attendance->update(['check_out' => $now]);
        return response()->json(['message' => 'Checked out successfully.', 'data' => [
            'attendance_date' => $attendance->attendance_date->format('Y-m-d'),
            'check_in' => Carbon::parse($attendance->check_in)->format('H:i'),
            'check_out' => Carbon::parse($attendance->check_out)->format('H:i'),
            'status' => 'completed',
        ]]);
    }
}
