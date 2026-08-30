<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->date('attendance_date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'attendance_date']);
            $table->index('attendance_date');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
