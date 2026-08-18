<?php

namespace App\Http\Controllers;

use App\DTO\PaymentRequestDTO;
use App\Services\Contracts\PaymentServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    protected PaymentServiceInterface $paymentService;

    public function __construct(PaymentServiceInterface $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function form(Request $request)
    {
        $amount = $request->query('amount', '0.00');
        $orderId = $request->query('order_id', uniqid('ORD_'));

        // Store in session for safety during the form POST
        session(['payment_amount' => $amount, 'payment_order_id' => $orderId]);

        return view('payment.form', compact('amount', 'orderId'));
    }

    public function pay(Request $request)
    {
        $validated = $request->validate([
            'orderId'     => 'required|string',
            'firstName'   => 'required|string|max:255',
            'lastName'    => 'required|string|max:255',
            'phone'       => 'required|string|max:20',
            'amount'      => 'required|numeric|min:0.01',
            'cardNumber'  => ['required', 'digits:16', function($attribute, $value, $fail) {
                // Basit Luhn algoritması kontrolü eklenebilir veya dummy data için esnek bırakılabilir
                // Güvenlik amaçlı kartın sadece numeric olmasını sağlamak bile önemli bir adımdır
                if (!preg_match('/^[0-9]+$/', $value)) {
                    $fail('Kart numarası geçersiz.');
                }
            }],
            'expireMonth' => ['required', 'digits:2', 'numeric', 'min:1', 'max:12'],
            'expireYear'  => ['required', 'digits:2', 'numeric', function($attribute, $value, $fail) use ($request) {
                $currentYear = (int)date('y');
                $currentMonth = (int)date('m');
                $inputYear = (int)$value;
                $inputMonth = (int)$request->input('expireMonth');

                if ($inputYear < $currentYear) {
                    $fail('Son kullanma tarihi geçmiş bir kart kullanamazsınız.');
                } elseif ($inputYear === $currentYear && $inputMonth < $currentMonth) {
                    $fail('Son kullanma tarihi geçmiş bir kart kullanamazsınız.');
                }
            }],
            'cvv'         => 'required|digits:3|numeric',
        ]);

        $paymentRequestDTO = new PaymentRequestDTO(
            $validated['orderId'],
            $validated['firstName'],
            $validated['lastName'],
            $validated['phone'],
            (float) $validated['amount'],
            $validated['cardNumber'],
            $validated['expireMonth'],
            $validated['expireYear'],
            $validated['cvv']
        );

        $response = $this->paymentService->pay($paymentRequestDTO);

        if ($response->isSuccess) {
            if (!empty($response->redirectUrl)) {
                return redirect()->away($response->redirectUrl);
            } elseif (!empty($response->htmlContent)) {
                return response($response->htmlContent);
            }
            
            return back()->withErrors(['Hata' => 'Banka yönlendirme verisi alınamadı.']);
        }

        return back()->with('error', $response->message);
    }

    public function callback(Request $request)
    {
        $callbackData = $request->all();
        $isSuccess = $this->paymentService->verify3DResponse($callbackData);

        // Define status
        $status = $isSuccess ? 'completed' : 'failed';
        
        // orderId from post (like OrderId from bank) or session fallback
        $orderId = $callbackData['OrderId'] ?? session('payment_order_id', '');

        // Notify Go Backend (Server-to-Server webhook call)
        try {
            Http::post('http://localhost:4000/api/payment/callback', [
                'order_id' => $orderId,
                'status'   => $status
            ]);
        } catch (\Exception $e) {
            \Log::error("Go backend webhook bildirimi başarısız: " . $e->getMessage());
        }

        // Redirect back to E-Commerce React App (rendered via view)
        $reactUrl = "http://localhost:5173/orders?status={$status}&order_id={$orderId}";
        
        if ($isSuccess) {
            return view('payment.success', ['orderId' => $orderId, 'redirectUrl' => $reactUrl]);
        } else {
            return view('payment.failure', ['orderId' => $orderId, 'redirectUrl' => $reactUrl]);
        }
    }
}
