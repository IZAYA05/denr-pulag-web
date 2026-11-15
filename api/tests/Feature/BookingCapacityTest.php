<?php

namespace Tests\Feature;

use App\Models\BlockedDate;
use App\Models\OrganizerPackage;
use App\Models\PackageBooking;
use App\Models\Reservation;
use App\Models\Trail;
use App\Models\User;
use App\Services\BookingCapacityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingCapacityTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Trail $trail;
    private OrganizerPackage $package;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'first_name' => 'Capacity',
            'last_name' => 'Tester',
            'email' => 'capacity.tester@example.test',
            'phone' => '09170000000',
            'password' => bcrypt('test-password'),
            'role' => 'USER',
            'status' => 'ACTIVE',
        ]);

        $this->trail = Trail::create([
            'name' => 'Capacity Test Trail',
            'description' => 'Trail used by automated capacity tests.',
            'difficulty' => 'Moderate',
            'max_capacity' => 500,
            'is_active' => true,
        ]);

        $this->package = OrganizerPackage::create([
            'organizer_id' => $this->user->id,
            'name' => 'Capacity Test Package',
            'description' => 'Package used by automated capacity tests.',
            'price' => 1000,
            'max_tourists' => 12,
            'status' => 'ACTIVE',
            'approval_status' => 'APPROVED',
            'is_walk_in' => false,
        ]);
    }

    public function test_shared_capacity_counts_direct_and_package_bookings(): void
    {
        $date = now('Asia/Manila')->addDays(40)->toDateString();

        $this->createReservation($date, 300, 'PENDING');
        $this->createPackageBooking($date, 150, 'PENDING', 'PENDING');

        $summary = app(BookingCapacityService::class)->getSummary($date);

        $this->assertSame(450, $summary['current_capacity']);
        $this->assertSame(50, $summary['remaining_capacity']);
        $this->assertFalse($summary['is_full']);
        $this->assertFalse($summary['is_blocked']);
    }

    public function test_cancelled_and_rejected_bookings_do_not_consume_capacity(): void
    {
        $date = now('Asia/Manila')->addDays(40)->toDateString();

        $this->createReservation($date, 100, 'CANCELLED');
        $this->createReservation($date, 100, 'REJECTED');
        $this->createReservation($date, 20, 'PENDING');
        $this->createPackageBooking($date, 50, 'REJECTED', 'APPROVED');
        $this->createPackageBooking($date, 30, 'APPROVED', 'REJECTED');

        $summary = app(BookingCapacityService::class)->getSummary($date);

        $this->assertSame(20, $summary['current_capacity']);
        $this->assertSame(480, $summary['remaining_capacity']);
    }

    public function test_blocked_date_is_reported_as_unavailable(): void
    {
        $date = now('Asia/Manila')->addDays(40)->toDateString();

        BlockedDate::create([
            'date' => $date,
            'reason' => 'Public holiday',
            'created_by' => $this->user->id,
        ]);

        $summary = app(BookingCapacityService::class)->getSummary($date);

        $this->assertTrue($summary['is_blocked']);
        $this->assertSame('Public holiday', $summary['blocked_reason']);
        $this->assertFalse(app(BookingCapacityService::class)->canAccommodate($date, 1));
    }

    public function test_capacity_lock_uses_its_own_record_without_requiring_a_trail(): void
    {
        $this->trail->delete();
        $this->assertDatabaseHas('booking_capacity_locks', ['id' => 1]);

        DB::transaction(function () {
            app(BookingCapacityService::class)->lockForCapacityCheck();
            $this->assertTrue(true);
        });
    }

    public function test_booking_creation_rejects_a_group_that_exceeds_shared_capacity(): void
    {
        $date = now('Asia/Manila')->addDays(40)->toDateString();
        $this->createReservation($date, 490, 'PENDING');
        Sanctum::actingAs($this->user);

        $participants = [];
        for ($index = 1; $index <= 11; $index++) {
            $participants[] = [
                'full_name' => "Visitor {$index}",
                'age' => 25,
                'gender' => 'MALE',
                'nationality' => 'Filipino',
                'contact_number' => '09170000000',
                'address' => 'Benguet',
                'emergency_contact' => 'Emergency Contact',
                'emergency_number' => '09171111111',
            ];
        }

        $response = $this->postJson('/api/reservations', [
            'group_leader_name' => 'Capacity Test',
            'group_leader_phone' => '09170000000',
            'hiking_date' => $date,
            'trail_id' => $this->trail->id,
            'participants' => $participants,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonPath('remaining_capacity', 10);
        $this->assertDatabaseCount('reservations', 1);
    }

    public function test_blocked_date_prevents_online_reservation_creation(): void
    {
        $date = now('Asia/Manila')->addDays(40)->toDateString();
        BlockedDate::create([
            'date' => $date,
            'reason' => 'DENR closure',
            'created_by' => $this->user->id,
        ]);
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/reservations', [
            'group_leader_name' => 'Capacity Test',
            'group_leader_phone' => '09170000000',
            'hiking_date' => $date,
            'trail_id' => $this->trail->id,
            'participants' => [[
                'full_name' => 'Visitor One',
                'age' => 25,
                'gender' => 'MALE',
                'nationality' => 'Filipino',
                'contact_number' => '09170000000',
                'address' => 'Benguet',
                'emergency_contact' => 'Emergency Contact',
                'emergency_number' => '09171111111',
            ]],
        ]);

        $response->assertUnprocessable();
        $response->assertJsonPath('reason', 'DENR closure');
        $this->assertDatabaseCount('reservations', 0);
    }

    public function test_walk_in_package_cannot_be_booked_online(): void
    {
        $this->package->update(['is_walk_in' => true]);
        Sanctum::actingAs($this->user);
        $date = now('Asia/Manila')->addDays(40)->toDateString();

        $response = $this->postJson('/api/package-bookings', [
            'package_id' => $this->package->id,
            'trail_id' => $this->trail->id,
            'hiking_date' => $date,
            'tourist_count' => 1,
            'tourists' => [[
                'full_name' => 'Visitor One',
                'age' => 25,
                'gender' => 'MALE',
                'nationality' => 'Filipino',
                'contact_number' => '09170000000',
                'address' => 'Benguet',
                'emergency_contact' => 'Emergency Contact',
                'emergency_number' => '09171111111',
            ]],
        ]);

        $response->assertUnprocessable();
        $response->assertJsonPath('message', 'The Walk-in Package can only be processed by DENR staff and cannot be booked online.');
        $this->assertDatabaseCount('package_bookings', 0);
    }

    public function test_non_user_roles_cannot_create_online_reservations(): void
    {
        $employee = User::create([
            'first_name' => 'Employee',
            'last_name' => 'Tester',
            'email' => 'employee.tester@example.test',
            'phone' => '09172222222',
            'password' => bcrypt('test-password'),
            'role' => 'EMPLOYEE',
            'status' => 'ACTIVE',
        ]);
        Sanctum::actingAs($employee);

        $response = $this->postJson('/api/reservations', []);

        $response->assertForbidden();
    }

    private function createReservation(string $date, int $count, string $status): Reservation
    {
        return Reservation::create([
            'reservation_number' => 'TEST-' . uniqid(),
            'group_leader_name' => 'Test Leader',
            'group_leader_phone' => '09170000000',
            'hiking_date' => $date,
            'total_participants' => $count,
            'status' => $status,
            'user_id' => $this->user->id,
            'trail_id' => $this->trail->id,
        ]);
    }

    private function createPackageBooking(
        string $date,
        int $count,
        string $status,
        string $denrStatus
    ): PackageBooking {
        return PackageBooking::create([
            'booking_number' => 'PKG-' . uniqid(),
            'package_id' => $this->package->id,
            'customer_id' => $this->user->id,
            'trail_id' => $this->trail->id,
            'hiking_date' => $date,
            'tourist_count' => $count,
            'status' => $status,
            'denr_status' => $denrStatus,
        ]);
    }
}
