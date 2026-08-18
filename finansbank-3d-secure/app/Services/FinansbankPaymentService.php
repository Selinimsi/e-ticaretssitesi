<?php

namespace App\Services;

use App\DTO\PaymentRequestDTO;
use App\DTO\PaymentResponseDTO;
use App\Services\Contracts\PaymentServiceInterface;

class FinansbankPaymentService implements PaymentServiceInterface
{
    public function pay(PaymentRequestDTO $paymentDTO): PaymentResponseDTO
    {
        try {
            \Log::info("Finansbank 3D Secure ödeme başlatılıyor. Sipariş No: {$paymentDTO->orderId}");

            $merchantId = config('payment.merchant_id');
            $merchantPassword = config('payment.merchant_password');
            $returnUrl = config('payment.return_url');
            $apiUrl = config('payment.api_url');

            // Finansbank Hash Algorithm (Basit simülasyon)
            $hashString = $merchantId . $paymentDTO->orderId . $paymentDTO->amount . $returnUrl . $merchantPassword;
            $hash = base64_encode(pack('H*', sha1($hashString)));

            // Create Auto-submit HTML Form
            $htmlContent = "
            <html>
            <head>
                <title>3D Secure Yönlendirme</title>
            </head>
            <body onload='document.forms[\"payment_form\"].submit();'>
                <div style='text-align: center; margin-top: 50px; font-family: sans-serif;'>
                    <h3>Finansbank 3D Secure Sayfasına Yönlendiriliyorsunuz...</h3>
                    <p>Lütfen bekleyin...</p>
                    <form id='payment_form' name='payment_form' action='{$apiUrl}' method='post'>
                        <input type='hidden' name='MbrId' value='5'>
                        <input type='hidden' name='MerchantId' value='{$merchantId}'>
                        <input type='hidden' name='UserCode' value='test'>
                        <input type='hidden' name='UserPass' value='{$merchantPassword}'>
                        <input type='hidden' name='PurchAmount' value='{$paymentDTO->amount}'>
                        <input type='hidden' name='Currency' value='949'>
                        <input type='hidden' name='OrderId' value='{$paymentDTO->orderId}'>
                        <input type='hidden' name='OkUrl' value='{$returnUrl}'>
                        <input type='hidden' name='FailUrl' value='{$returnUrl}'>
                        <input type='hidden' name='TxnType' value='Auth'>
                        <input type='hidden' name='Hash' value='{$hash}'>
                        <!-- Simulated Card Fields -->
                        <input type='hidden' name='Pan' value='{$paymentDTO->cardNumber}'>
                        <input type='hidden' name='Expiry' value='{$paymentDTO->expireMonth}{$paymentDTO->expireYear}'>
                        <input type='hidden' name='Cvv2' value='{$paymentDTO->cvv}'>
                        <!-- Geliştirme ortamı için simülasyon butonu, normalde JS ile submit olur -->
                        <noscript>
                            <button type='submit'>Devam Et</button>
                        </noscript>
                    </form>
                </div>
            </body>
            </html>
            ";

            \Log::info("Finansbank 3D form başarıyla oluşturuldu. Sipariş No: {$paymentDTO->orderId}");

            return new PaymentResponseDTO(
                isSuccess: true,
                message: '3D Secure form created successfully.',
                htmlContent: $htmlContent
            );
        } catch (\Exception $e) {
            \Log::error("Finansbank 3D ödeme başlatılırken hata oluştu: " . $e->getMessage());
            return new PaymentResponseDTO(
                isSuccess: false,
                message: 'Ödeme başlatılamadı: ' . $e->getMessage()
            );
        }
    }

    public function verify3DResponse(array $postData): bool
    {
        try {
            \Log::info("Finansbank 3D dönüş verisi (callback) alındı.", ['data' => $postData]);

            $mdStatus = $postData['mdStatus'] ?? '';
            $authCode = $postData['AuthCode'] ?? '';

            if (in_array($mdStatus, ['1', '2', '3', '4']) && !empty($authCode)) {
                \Log::info("3D Doğrulama başarılı. mdStatus: {$mdStatus}");
                return true;
            }

            // Mock mode (çünkü test URL'si direkt dönmeyecek, kendimiz test edeceğiz)
            if (isset($postData['mock_status']) && $postData['mock_status'] === 'success') {
                \Log::info("Mock 3D Doğrulama başarılı.");
                return true;
            }

            \Log::error("3D Doğrulama başarısız. mdStatus: {$mdStatus}");
            return false;
            
        } catch (\Exception $e) {
            \Log::error("Callback doğrulanırken hata: " . $e->getMessage());
            return false;
        }
    }
}
