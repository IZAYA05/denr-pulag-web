<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingCapacityController;
use App\Http\Controllers\Api\Admin\ActivityLogController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\EmployeeDashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrganizerPackageController;
use App\Http\Controllers\Api\WalkInPackageController;
use App\Http\Controllers\Api\PackageBookingController;
use App\Http\Controllers\Api\PackageCatalogController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\TrailController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/trails', [TrailController::class, 'index']);
Route::get('/trails/{trail}', [TrailController::class, 'show']);

Route::get('/packages', [PackageCatalogController::class, 'index']);


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/booking-capacity', [BookingCapacityController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);


    /*
    |--------------------------------------------------------------------------
    | Profile Settings
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', [
        ProfileController::class,
        'show',
    ]);

    Route::patch('/profile', [
        ProfileController::class,
        'update',
    ]);

    Route::patch('/profile/password', [
        ProfileController::class,
        'changePassword',
    ]);

    Route::get('/profile/login-activity', [
        ProfileController::class,
        'loginActivity',
    ]);


    /*
    |--------------------------------------------------------------------------
    | Notification Routes
    |--------------------------------------------------------------------------
    */

    Route::get('/notifications', [
        NotificationController::class,
        'index',
    ]);

    Route::patch('/notifications/{id}/read', [
        NotificationController::class,
        'markAsRead',
    ]);

    Route::patch('/notifications/read-all', [
        NotificationController::class,
        'markAllAsRead',
    ]);

    Route::delete('/notifications/{id}', [
        NotificationController::class,
        'destroy',
    ]);


    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:ADMIN')->group(function () {

        Route::get('/users', [
            UserController::class,
            'index',
        ]);

        Route::patch('/users/{user}', [
            UserController::class,
            'update',
        ]);

        Route::patch('/users/{user}/status', [
            UserController::class,
            'toggleStatus',
        ]);

        Route::get('/admin/reports/download', [
            ReportController::class,
            'download',
        ]);

        // Retrieve all trails, including inactive trails.
        Route::get('/admin/trails', [
            TrailController::class,
            'adminIndex',
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Activity Logs
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:ADMIN,EMPLOYEE')->group(function () {

        Route::get('/activity-logs', [
            ActivityLogController::class,
            'index',
        ]);

    });


    /*
    |--------------------------------------------------------------------------
    | Walk-in Package Management
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:ADMIN,EMPLOYEE')->group(function () {

        Route::get('/staff/walk-in-package', [
            WalkInPackageController::class,
            'show',
        ]);

        Route::post('/staff/walk-in-package', [
            WalkInPackageController::class,
            'store',
        ]);

        Route::patch('/staff/walk-in-package', [
            WalkInPackageController::class,
            'update',
        ]);

    });

    /*
    |--------------------------------------------------------------------------
    | Reservation Routes
    |--------------------------------------------------------------------------
    */

    Route::get('/reservations', [
        ReservationController::class,
        'index',
    ]);

    Route::get('/reservations/{reservation}', [
        ReservationController::class,
        'show',
    ]);

    Route::post('/reservations', [ReservationController::class, 'store'])->middleware('booking.creation');

    Route::delete('/reservations/{reservation}', [
        ReservationController::class,
        'destroy',
    ]);


    /*
    |--------------------------------------------------------------------------
    | Admin and Employee Reservation Management
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:ADMIN,EMPLOYEE')->group(function () {

        Route::get('/admin/reservations', [
            ReservationController::class,
            'adminIndex',
        ]);

        Route::patch('/admin/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])->middleware('booking.approval-window');

        Route::get('/admin/visitors', [
            EmployeeDashboardController::class,
            'visitors',
        ]);

        Route::get('/admin/package-bookings', [
            PackageBookingController::class,
            'adminIndex',
        ]);

        Route::patch('/admin/package-bookings/{packageBooking}/denr-status', [PackageBookingController::class, 'updateDenrStatus'])->middleware('booking.approval-window');

    });


    /*
    |--------------------------------------------------------------------------
    | Employee Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:EMPLOYEE')
        ->prefix('employee')
        ->group(function () {

            Route::get('/dashboard', [
                EmployeeDashboardController::class,
                'dashboard',
            ]);

            Route::get('/bookings', [
                EmployeeDashboardController::class,
                'bookings',
            ]);

            Route::get('/visitors', [
                EmployeeDashboardController::class,
                'visitors',
            ]);

            Route::get('/reports', [
                EmployeeDashboardController::class,
                'reports',
            ]);

            Route::get('/trails', [
                EmployeeDashboardController::class,
                'trails',
            ]);

        });


    /*
    |--------------------------------------------------------------------------
    | Organizer Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:ORGANIZER')->group(function () {

        Route::get('/organizer/packages', [
            OrganizerPackageController::class,
            'index',
        ]);

        Route::post('/organizer/packages', [
            OrganizerPackageController::class,
            'store',
        ]);

        Route::get('/organizer/packages/{package}', [
            OrganizerPackageController::class,
            'show',
        ]);

        Route::patch('/organizer/packages/{package}', [
            OrganizerPackageController::class,
            'update',
        ]);

        Route::patch('/organizer/packages/{package}/status', [
            OrganizerPackageController::class,
            'toggleStatus',
        ]);

        Route::delete('/organizer/packages/{package}', [
            OrganizerPackageController::class,
            'destroy',
        ]);

        // Stage 1: Organizer approves or rejects Tourist package bookings.

        Route::patch('/package-bookings/{packageBooking}/status', [PackageBookingController::class, 'updateStatus'])->middleware('booking.approval-window');

    });


    /*
    |--------------------------------------------------------------------------
    | Package Booking Routes
    |--------------------------------------------------------------------------
    */

    Route::get('/package-bookings', [
        PackageBookingController::class,
        'index',
    ]);

    Route::get('/package-bookings/{packageBooking}', [
        PackageBookingController::class,
        'show',
    ]);

    Route::post('/package-bookings', [PackageBookingController::class, 'store'])->middleware('booking.creation');

    Route::delete('/package-bookings/{packageBooking}', [
        PackageBookingController::class,
        'destroy',
    ]);

});
