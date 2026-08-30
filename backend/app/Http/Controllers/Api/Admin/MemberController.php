<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMemberRequest;
use App\Http\Requests\Admin\UpdateMemberRequest;
use App\Http\Resources\Admin\MemberResource;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:all,active,inactive,expired'],
            'gender' => ['nullable', 'in:all,male,female,other'],
            'membership' => ['nullable', 'in:all,active,expired'],
            'has_active_membership' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'sort_by' => ['nullable', 'in:id,member_code,name,created_at,status'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
        ]);

        $perPage = (int) ($request->integer('per_page') ?: 10);
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $query = Member::query()->with('user')
            ->search($request->input('search'))
            ->status($request->input('status'))
            ->gender($request->input('gender'));

        if ($request->filled('membership') && $request->input('membership') !== 'all') {
            $query->activeMembershipStatus($request->input('membership'));
        }
        if ($request->boolean('has_active_membership')) {
            $query->hasActiveMembership();
        }

        if ($sortBy === 'name') {
            $query->join('users', 'users.id', '=', 'members.user_id')
                ->orderBy('users.name', $sortDir)
                ->select('members.*');
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        $paginator = $query->paginate($perPage)->appends($request->query());

        return response()->json([
            'data' => MemberResource::collection($paginator->items()),
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

    public function store(StoreMemberRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $this->resolveUser($request, $data);

        $member = Member::create([
            'member_code' => Member::generateMemberCode(),
            'user_id' => $user->id,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'birthdate' => $data['birthdate'] ?? null,
            'gender' => $data['gender'] ?? null,
            'status' => $data['status'] ?? 'active',
        ]);

        $member->load('user');

        return response()->json([
            'message' => 'Member created successfully.',
            'data' => new MemberResource($member),
        ], 201);
    }

    public function show(Member $member): JsonResponse
    {
        $member->load('user');

        return response()->json([
            'data' => new MemberResource($member),
        ]);
    }

    public function update(UpdateMemberRequest $request, Member $member): JsonResponse
    {
        $data = $request->validated();

        $user = $member->user;

        if (isset($data['user_id'])) {
            $user = User::findOrFail($data['user_id']);
            $member->user_id = $user->id;
        }

        if (isset($data['name'])) {
            $user->name = $data['name'];
        }

        if (isset($data['email'])) {
            $user->email = $data['email'];
        }

        if ($request->hasFile('photo')) {
            if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }
            $user->photo = $request->file('photo')->store('photos', 'public');
        }

        $user->save();

        $member->update([
            'phone' => $data['phone'] ?? $member->phone,
            'address' => $data['address'] ?? $member->address,
            'birthdate' => $data['birthdate'] ?? $member->birthdate,
            'gender' => $data['gender'] ?? $member->gender,
            'status' => $data['status'] ?? $member->status,
        ]);

        $member->load('user');

        return response()->json([
            'message' => 'Member updated successfully.',
            'data' => new MemberResource($member->fresh()->load('user')),
        ]);
    }

    public function destroy(Member $member): JsonResponse
    {
        $member->delete();

        return response()->json([
            'message' => 'Member deleted successfully.',
        ]);
    }

    private function resolveUser(Request $request, array $data): User
    {
        if (!empty($data['user_id'])) {
            $user = User::findOrFail($data['user_id']);
        } else {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'] ?? Str::random(10) . '@fitpay.local',
                'password' => Hash::make(Str::random(12)),
                'role' => 'member',
                'email_verified_at' => now(),
            ]);
        }

        if (isset($data['name'])) {
            $user->name = $data['name'];
        }

        if (isset($data['email'])) {
            $user->email = $data['email'];
        }

        if ($request->hasFile('photo')) {
            $user->photo = $request->file('photo')->store('photos', 'public');
        }

        $user->save();

        return $user;
    }
}
