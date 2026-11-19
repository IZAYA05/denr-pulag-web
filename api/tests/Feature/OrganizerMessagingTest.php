<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\OrganizerPackage;
use App\Models\PackageBooking;
use App\Models\Trail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrganizerMessagingTest extends TestCase
{
    use RefreshDatabase;

    private User $organizer;
    private User $otherOrganizer;
    private User $customer;
    private PackageBooking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organizer = $this->createUser('organizer@example.test', 'ORGANIZER');
        $this->otherOrganizer = $this->createUser('other-organizer@example.test', 'ORGANIZER');
        $this->customer = $this->createUser('customer@example.test', 'USER');

        $trail = Trail::create([
            'name' => 'Messaging Test Trail',
            'description' => 'Trail for organizer messaging tests.',
            'difficulty' => 'Moderate',
            'max_capacity' => 500,
            'is_active' => true,
        ]);

        $package = OrganizerPackage::create([
            'organizer_id' => $this->organizer->id,
            'name' => 'Messaging Test Package',
            'description' => 'Package for organizer messaging tests.',
            'price' => 1000,
            'max_tourists' => 12,
            'status' => 'ACTIVE',
            'approval_status' => 'APPROVED',
            'is_walk_in' => false,
        ]);

        $this->booking = PackageBooking::create([
            'booking_number' => 'PB-2026-MSG-0001',
            'package_id' => $package->id,
            'customer_id' => $this->customer->id,
            'trail_id' => $trail->id,
            'hiking_date' => now('Asia/Manila')->addDays(40)->toDateString(),
            'tourist_count' => 2,
            'status' => 'PENDING',
            'denr_status' => 'PENDING',
        ]);
    }

    public function test_organizer_can_start_a_conversation_only_for_their_own_package_booking(): void
    {
        Sanctum::actingAs($this->organizer);

        $response = $this->postJson('/api/conversations', [
            'type' => 'PACKAGE_BOOKING',
            'package_booking_id' => $this->booking->id,
            'body' => 'Please confirm your group details before the hike.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('conversation.type', 'PACKAGE_BOOKING')
            ->assertJsonPath('conversation.user.id', $this->customer->id)
            ->assertJsonPath('conversation.organizer.id', $this->organizer->id);

        $this->assertDatabaseHas('conversations', [
            'user_id' => $this->customer->id,
            'organizer_id' => $this->organizer->id,
            'package_booking_id' => $this->booking->id,
            'type' => 'PACKAGE_BOOKING',
        ]);
    }

    public function test_another_organizer_cannot_message_a_tourist_from_a_booking_they_do_not_own(): void
    {
        Sanctum::actingAs($this->otherOrganizer);

        $this->postJson('/api/conversations', [
            'type' => 'PACKAGE_BOOKING',
            'package_booking_id' => $this->booking->id,
            'body' => 'This should not be allowed.',
        ])->assertNotFound();

        $this->assertDatabaseCount('conversations', 0);
    }

    public function test_tourist_can_read_and_reply_to_the_booking_conversation(): void
    {
        $conversation = Conversation::create([
            'user_id' => $this->customer->id,
            'organizer_id' => $this->organizer->id,
            'package_booking_id' => $this->booking->id,
            'type' => 'PACKAGE_BOOKING',
            'subject' => 'Package booking conversation',
            'status' => 'OPEN',
        ]);

        Sanctum::actingAs($this->customer);
        $this->getJson('/api/conversations/' . $conversation->id)
            ->assertOk()
            ->assertJsonPath('conversation.organizer.id', $this->organizer->id);

        $this->postJson('/api/conversations/' . $conversation->id . '/messages', [
            'body' => 'Thank you. We will be ready.',
        ])->assertCreated();

        Sanctum::actingAs($this->organizer);
        $this->getJson('/api/conversations')
            ->assertOk()
            ->assertJsonPath('conversations.0.id', $conversation->id);
    }

    public function test_tourist_cannot_start_an_organizer_package_conversation_without_a_booking(): void
    {
        Sanctum::actingAs($this->customer);

        $this->postJson('/api/conversations', [
            'type' => 'PACKAGE_BOOKING',
            'package_booking_id' => $this->booking->id,
            'body' => 'A tourist cannot initiate this organizer workflow.',
        ])->assertForbidden();
    }

    public function test_organizer_can_start_a_separate_denr_support_conversation(): void
    {
        Sanctum::actingAs($this->organizer);

        $response = $this->postJson('/api/conversations', [
            'type' => 'ORGANIZER_SUPPORT',
            'subject' => 'Package approval question',
            'body' => 'Could DENR clarify the review status of my package?',
        ]);

        $response->assertCreated()
            ->assertJsonPath('conversation.type', 'ORGANIZER_SUPPORT')
            ->assertJsonPath('conversation.user.id', $this->organizer->id);

        $this->assertDatabaseHas('conversations', [
            'user_id' => $this->organizer->id,
            'organizer_id' => null,
            'package_booking_id' => null,
            'type' => 'ORGANIZER_SUPPORT',
        ]);
    }

    private function createUser(string $email, string $role): User
    {
        return User::create([
            'first_name' => 'Test',
            'last_name' => ucfirst(strtok($email, '@')),
            'email' => $email,
            'phone' => '09170000000',
            'password' => bcrypt('test-password'),
            'role' => $role,
            'status' => 'ACTIVE',
        ]);
    }
}
