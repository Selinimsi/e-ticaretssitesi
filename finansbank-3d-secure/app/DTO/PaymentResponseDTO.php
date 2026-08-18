<?php

namespace App\DTO;

class PaymentResponseDTO
{
    public bool $isSuccess;
    public string $message;
    public ?string $transactionId;
    public ?string $redirectUrl;
    public ?string $htmlContent;

    public function __construct(
        bool $isSuccess,
        string $message,
        ?string $transactionId = null,
        ?string $redirectUrl = null,
        ?string $htmlContent = null
    ) {
        $this->isSuccess = $isSuccess;
        $this->message = $message;
        $this->transactionId = $transactionId;
        $this->redirectUrl = $redirectUrl;
        $this->htmlContent = $htmlContent;
    }
}
