<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Services\Contracts\PaymentServiceInterface;
use App\DTO\PaymentResponseDTO;
use Mockery;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentFlowTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_form_page_renders_successfully()
    {
        $response = $this->get('/payment?amount=100.50&order_id=TEST1234');
        
        $response->assertStatus(200);
        $response->assertSee('TEST1234');
        $response->assertSee('100.50');
        $response->assertViewIs('payment.form');
    }

    public function test_payment_submission_with_valid_data()
    {
        // Mocking the Payment Service
        $mockService = Mockery::mock(PaymentServiceInterface::class);
        $mockService->shouldReceive('pay')
                    ->once()
                    ->andReturn(new PaymentResponseDTO(true, 'Success', null, null, '<html>Mock Form</html>'));

        $this->app->instance(PaymentServiceInterface::class, $mockService);

        $response = $this->post('/payment/process', [
            'orderId'     => 'TEST1234',
            'firstName'   => 'John',
            'lastName'    => 'Doe',
            'phone'       => '05554443322',
            'amount'      => '150.00',
            'cardNumber'  => '4111111111111111',
            'expireMonth' => '12',
            'expireYear'  => '29',
            'cvv'         => '123'
        ]);

        $response->assertStatus(200);
        $response->assertSee('<html>Mock Form</html>', false);
    }

    public function test_payment_submission_fails_with_invalid_card_format()
    {
        $response = $this->post('/payment/process', [
            'orderId'     => 'TEST1234',
            'firstName'   => 'John',
            'lastName'    => 'Doe',
            'phone'       => '05554443322',
            'amount'      => '150.00',
            'cardNumber'  => '4111AAAA11111111', // Invalid
            'expireMonth' => '12',
            'expireYear'  => '29',
            'cvv'         => '123'
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['cardNumber']);
    }

    public function test_payment_submission_fails_with_expired_card()
    {
        $response = $this->post('/payment/process', [
            'orderId'     => 'TEST1234',
            'firstName'   => 'John',
            'lastName'    => 'Doe',
            'phone'       => '05554443322',
            'amount'      => '150.00',
            'cardNumber'  => '4111111111111111',
            'expireMonth' => '01',
            'expireYear'  => '20', // Expired
            'cvv'         => '123'
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['expireYear']);
    }

    public function test_callback_handles_successful_payment()
    {
        Http::fake(); // Prevent actual HTTP requests to Go backend

        $mockService = Mockery::mock(PaymentServiceInterface::class);
        $mockService->shouldReceive('verify3DResponse')
                    ->once()
                    ->with(['OrderId' => 'TEST1234', 'mock_status' => 'success'])
                    ->andReturn(true);

        $this->app->instance(PaymentServiceInterface::class, $mockService);

        $response = $this->post('/payment/callback', [
            'OrderId' => 'TEST1234',
            'mock_status' => 'success'
        ]);

        $response->assertStatus(200);
        $response->assertViewIs('payment.success');
        $response->assertSee('TEST1234');
    }

    public function test_callback_handles_failed_payment()
    {
        Http::fake();

        $mockService = Mockery::mock(PaymentServiceInterface::class);
        $mockService->shouldReceive('verify3DResponse')
                    ->once()
                    ->andReturn(false);

        $this->app->instance(PaymentServiceInterface::class, $mockService);

        $response = $this->post('/payment/callback', [
            'OrderId' => 'TEST1234',
            'mdStatus' => '0',
            'AuthCode' => ''
        ]);

        $response->assertStatus(200);
        $response->assertViewIs('payment.failure');
        $response->assertSee('TEST1234');
    }
}
