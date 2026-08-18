<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QNB Finansbank 3D Secure Ödeme Geçidi</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; margin: 0; padding: 40px 20px; color: #333; }
        .container { max-width: 450px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #f0f2f5; padding-bottom: 20px; margin-bottom: 20px; }
        .header h2 { margin: 0; color: #004b93; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #666; font-size: 14px; }
        .amount-display { background: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e9ecef; }
        .amount-display span { display: block; font-size: 12px; color: #6c757d; font-weight: bold; text-transform: uppercase; }
        .amount-display strong { font-size: 28px; color: #28a745; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 14px; color: #495057; }
        input[type="text"], input[type="number"] { width: 100%; padding: 12px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; font-size: 16px; transition: border-color 0.15s ease-in-out; }
        input[type="text"]:focus, input[type="number"]:focus { border-color: #004b93; outline: 0; box-shadow: 0 0 0 0.2rem rgba(0,75,147,.25); }
        input[readonly] { background-color: #e9ecef; opacity: 1; }
        button { width: 100%; padding: 14px; background-color: #004b93; color: #fff; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background-color 0.2s; margin-top: 10px; }
        button:hover { background-color: #00366b; }
        .alert { padding: 12px; margin-bottom: 20px; border-radius: 6px; font-size: 14px; }
        .alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .flex-row { display: flex; gap: 15px; }
        .flex-1 { flex: 1; }
        .footer-logos { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; }
        .footer-logos span { font-size: 12px; color: #adb5bd; font-weight: bold; }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h2>Güvenli Ödeme Geçidi</h2>
        <p>QNB Finansbank 3D Secure Altyapısı</p>
    </div>
    
    @if(session('error'))
        <div class="alert alert-danger">
            {{ session('error') }}
        </div>
    @endif
    @if($errors->any())
        <div class="alert alert-danger">
            <ul style="margin: 0; padding-left: 20px;">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="amount-display">
        <span>Ödenecek Tutar</span>
        <strong>{{ number_format((float)$amount, 2, ',', '.') }} TL</strong>
    </div>

    <form action="{{ route('payment.process') }}" method="POST">
        @csrf
        <input type="hidden" name="orderId" value="{{ $orderId }}">
        <input type="hidden" name="amount" value="{{ $amount }}">
        
        <div class="flex-row">
            <div class="form-group flex-1">
                <label for="firstName">Adınız</label>
                <input type="text" name="firstName" id="firstName" required placeholder="Örn: Ali">
            </div>
            <div class="form-group flex-1">
                <label for="lastName">Soyadınız</label>
                <input type="text" name="lastName" id="lastName" required placeholder="Örn: Yılmaz">
            </div>
        </div>

        <div class="form-group">
            <label for="phone">Cep Telefonu</label>
            <input type="text" name="phone" id="phone" required placeholder="05XX XXX XX XX">
        </div>

        <div class="form-group" style="margin-top: 25px;">
            <label for="cardNumber">Kart Numarası (16 Hane)</label>
            <input type="text" name="cardNumber" id="cardNumber" maxlength="16" required placeholder="4321 0000 0000 0000">
        </div>

        <div class="flex-row">
            <div class="form-group flex-1">
                <label for="expireMonth">Ay (AA)</label>
                <input type="text" name="expireMonth" id="expireMonth" maxlength="2" required placeholder="12">
            </div>
            <div class="form-group flex-1">
                <label for="expireYear">Yıl (YY)</label>
                <input type="text" name="expireYear" id="expireYear" maxlength="2" required placeholder="25">
            </div>
            <div class="form-group flex-1">
                <label for="cvv">CVV</label>
                <input type="text" name="cvv" id="cvv" maxlength="3" required placeholder="123">
            </div>
        </div>

        <button type="submit">🔒 Güvenli Ödeme Yap (3D Secure)</button>
    </form>
    
    <div class="footer-logos">
        <span>✅ 256-Bit SSL Sertifikası ile Korunmaktadır</span>
    </div>
</div>

</body>
</html>
