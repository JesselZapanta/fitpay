<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'user_id',
        'attendance_date',
        'check_in',
        'check_out',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'check_in' => 'datetime:H:i:s',
            'check_out' => 'datetime:H:i:s',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getIsPresentAttribute(): bool
    {
        return !is_null($this->check_in) && is_null($this->check_out);
    }

    public function getIsCompletedAttribute(): bool
    {
        return !is_null($this->check_in) && !is_null($this->check_out);
    }

    public function scopeToday($query)
    {
        return $query->where('attendance_date', \Illuminate\Support\Carbon::today('Asia/Manila')->toDateString());
    }

    public function scopeDate($query, ?string $date)
    {
        if (blank($date)) return $query;
        return $query->where('attendance_date', $date);
    }

    public function scopeSearch($query, ?string $search)
    {
        if (blank($search)) return $query;
        $search = trim($search);
        return $query->where(function ($q) use ($search) {
            $q->whereHas('member', function ($m) use ($search) {
                $m->where('member_code', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            })->orWhereHas('user', function ($u) use ($search) {
                $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            });
        });
    }
}
