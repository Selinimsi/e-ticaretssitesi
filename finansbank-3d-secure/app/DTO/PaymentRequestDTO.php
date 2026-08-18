<?php

namespace App\DTO;

class PaymentRequestDTO
{
    public string $orderId;
    public string $firstName;
    public string $lastName;
    public string $phone;
    public float $amount;
    public string $cardNumber;
    public string $expireMonth;
    public string $expireYear;
    public string $cvv;

    public function __construct(
        string $orderId,
        string $firstName,
        string $lastName,
        string $phone,
        float $amount,
        string $cardNumber,
        string $expireMonth,
        string $expireYear,
        string $cvv
    ) {
        $this->orderId = $orderId;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->phone = $phone;
        $this->amount = $amount;
        $this->cardNumber = $cardNumber;
        $this->expireMonth = $expireMonth;
        $this->expireYear = $expireYear;
        $this->cvv = $cvv;
    }
}
