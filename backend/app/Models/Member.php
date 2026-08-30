<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_code',
        'user_id',
        'phone',
        'address',
        'birthdate',
        'gender',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Member $member) {
            if (empty($member->member_code)) {
                $member->member_code = static::generateMemberCode();
            }
        });
    }

    public static function generateMemberCode(): string
    {
        $last = static::orderByDesc('id')->first();
        $nextId = $last ? $last->id + 1 : 1;
        return 'MEM-' . str_pad((string) $nextId, 4, '0', STR_PAD_LEFT);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getNameAttribute(): string
    {
        return $this->user?->name ?? '';
    }

    public function getEmailAttribute(): ?string
    {
        return $this->user?->email;
    }

    public function getPhotoAttribute(): ?string
    {
        return $this->user?->photo;
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->user?->photo_url;
    }

    public function scopeSearch($query, ?string $search)
    {
        if (blank($search)) {
            return $query;
        }

        $search = trim($search);

        return $query->where(function ($q) use ($search) {
            $q->where('member_code', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhereHas('user', function ($u) use ($search) {
                  $u->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
              });
        });
    }

    public function scopeStatus($query, ?string $status)
    {
        if (blank($status) || $status === 'all') {
            return $query;
        }

        return $query->where('status', $status);
    }

    public function scopeGender($query, ?string $gender)
    {
        if (blank($gender) || $gender === 'all') {
            return $query;
        }

        return $query->where('gender', $gender);
    }

    public function scopeHasActiveMembership($query)
    {
        return $query->whereHas('user', function ($q) {
            $q->whereHas('memberships', function ($mq) {
                $mq->where('status', 'active')->where('end_date', '>=', today());
            });
        });
    }

    public function scopeActiveMembershipStatus($query, ?string $filter)
    {
        if (blank($filter) || $filter === 'all') return $query;
        if ($filter === 'active') {
            return $query->whereHas('user', function ($q) {
                $q->whereHas('memberships', function ($mq) {
                    $mq->where('status', 'active')->where('end_date', '>=', today());
                });
            });
        }
        if ($filter === 'inactive') {
            return $query->whereDoesntHave('user.memberships', function ($mq) {
                $mq->where('status', 'active')->where('end_date', '>=', today());
            });
        }
        return $query;
    }
}
