<?php

namespace App\Services\Contracts;

use App\DTO\PaymentRequestDTO;
use App\DTO\PaymentResponseDTO;

interface PaymentServiceInterface
{
    /**
     * Ödeme işlemini başlatır (3D Secure form post verisi döndürür).
     */
    public function pay(PaymentRequestDTO $paymentDTO): PaymentResponseDTO;

    /**
     * Bankadan dönen 3D Secure sonucunu doğrular.
     */
    public function verify3DResponse(array $postData): bool;
}
