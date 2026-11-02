<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $isSqlite = DB::getDriverName() === 'sqlite';

        // Temporarily allow the target value before rewriting existing rows
        if (!$isSqlite) {
            Schema::table('memberships', function (Blueprint $table) {
                $table->enum('status', ['active', 'inactive', 'expired'])->default('active')->change();
            });
        }

        DB::table('members')->where('status', 'expired')->update(['status' => 'inactive']);
        DB::table('memberships')->where('status', 'expired')->update(['status' => 'inactive']);

        if ($isSqlite) {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive'])->default('active')->change();
        });

        Schema::table('memberships', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive'])->default('active')->change();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('members', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive', 'expired'])->default('active')->change();
        });

        Schema::table('memberships', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive', 'expired'])->default('active')->change();
        });
    }
};
