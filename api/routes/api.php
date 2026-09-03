<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\TrailController;
use App\Http\Controllers\Api\UserController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [
    AuthController::class,
    'register',
]);

Route::post('/login', [
    AuthController::class,
    'login',
]);

/*
|--------------------------------------------------------------------------
| Public Trail Routes
|--------------------------------------------------------------------------
*/

Route::get('/trails', [
    TrailController::class,
    'index',
]);

Route::get('/trails/{trail}', [
    TrailController::class,
    'show',
]);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Current Authenticated User
    |--------------------------------------------------------------------------
    */

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /*
    |--------------------------------------------------------------------------
    | User Management
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | User Reservation Routes
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

    Route::post('/reservations', [
        ReservationController::class,
        'store',
    ]);

    Route::delete('/reservations/{reservation}', [
        ReservationController::class,
        'destroy',
    ]);

    /*
    |--------------------------------------------------------------------------
    | DENR Staff Reservation Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:ADMIN,EMPLOYEE')->group(function () {

        Route::get('/admin/reservations', [
            ReservationController::class,
            'adminIndex',
        ]);

        Route::patch('/admin/reservations/{reservation}/status', [
            ReservationController::class,
            'updateStatus',
        ]);

    });

});