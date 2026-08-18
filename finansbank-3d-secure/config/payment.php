<?php

return [
    'api_url' => env('FINANSBANK_API_URL', 'https://vpos.qnbfinansbank.com/Gateway/Default.aspx'),
    'merchant_id' => env('FINANSBANK_MERCHANT_ID', ''),
    'merchant_password' => env('FINANSBANK_MERCHANT_PASSWORD', ''),
    'return_url' => env('FINANSBANK_3D_RETURN_URL', 'http://localhost:8000/payment/callback'),
];
