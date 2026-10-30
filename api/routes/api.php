<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeDashboardController;
use App\Http\Controllers\Api\OrganizerPackageController;
use App\Http\Controllers\Api\PackageBookingController;
use App\Http\Controllers\Api\PackageCatalogController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\TrailController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/trails', [TrailController::class, 'index']);
Route::get('/trails/{trail}', [TrailController::class, 'show']);

// Public package catalog
Route::get('/packages', [PackageCatalogController::class, 'index']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {

    // Authenticated User
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Admin-only User Management
    Route::middleware('role:ADMIN')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::patch('/users/{user}', [UserController::class, 'update']);
        Route::patch('/users/{user}/status', [UserController::class, 'toggleStatus']);
    });

    // Direct DENR Reservations
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy']);

    // Admin / Employee Direct Reservation Management
    Route::middleware('role:ADMIN,EMPLOYEE')->group(function () {
        Route::get('/admin/reservations', [ReservationController::class, 'adminIndex']);
        Route::patch(
            '/admin/reservations/{reservation}/status',
            [ReservationController::class, 'updateStatus']
        );
    });

    // Employee Dashboard
    Route::middleware('role:EMPLOYEE')->prefix('employee')->group(function () {
        Route::get(
            '/dashboard',
            [EmployeeDashboardController::class, 'dashboard']
        );

        Route::get(
            '/bookings',
            [EmployeeDashboardController::class, 'bookings']
        );

        Route::get(
            '/visitors',
            [EmployeeDashboardController::class, 'visitors']
        );

        Route::get(
            '/reports',
            [EmployeeDashboardController::class, 'reports']
        );

        Route::get(
            '/trails',
            [EmployeeDashboardController::class, 'trails']
        );
    });

    // Organizer Package Management
    Route::middleware('role:ORGANIZER')->group(function () {
        Route::get('/organizer/packages', [OrganizerPackageController::class, 'index']);
        Route::post('/organizer/packages', [OrganizerPackageController::class, 'store']);
        Route::get('/organizer/packages/{package}', [OrganizerPackageController::class, 'show']);
        Route::patch('/organizer/packages/{package}', [OrganizerPackageController::class, 'update']);
        Route::patch('/organizer/packages/{package}/status', [OrganizerPackageController::class, 'toggleStatus']);
        Route::delete('/organizer/packages/{package}', [OrganizerPackageController::class, 'destroy']);

        Route::patch(
            '/package-bookings/{packageBooking}/coordination',
            [PackageBookingController::class, 'updateCoordination']
        );
    });

    // Package Bookings
    Route::get('/package-bookings', [PackageBookingController::class, 'index']);
    Route::get('/package-bookings/{packageBooking}', [PackageBookingController::class, 'show']);
    Route::post('/package-bookings', [PackageBookingController::class, 'store']);
    Route::delete('/package-bookings/{packageBooking}', [PackageBookingController::class, 'destroy']);
});
