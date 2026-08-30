<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('plan_type', ['daily', 'monthly', 'yearly']);
            $table->decimal('amount', 10, 2);
            $table->string('reference_number');
            $table->string('receipt_path');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('plan_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_requests');
    }
};
