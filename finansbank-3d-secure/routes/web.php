<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

Route::get('/', function () {
    return redirect()->route('payment.form');
});

Route::get('/payment', [PaymentController::class, 'form'])->name('payment.form');
Route::post('/payment/process', [PaymentController::class, 'pay'])->name('payment.process');
Route::post('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');
