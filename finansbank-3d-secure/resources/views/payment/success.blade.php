<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ödeme Başarılı</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background-color: #f0f2f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
        .icon { width: 80px; height: 80px; background: #d4edda; color: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 20px; }
        h2 { color: #28a745; margin-bottom: 10px; }
        p { color: #6c757d; margin-bottom: 30px; line-height: 1.5; }
        .btn { display: inline-block; padding: 12px 24px; background: #004b93; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; transition: 0.2s; }
        .btn:hover { background: #00366b; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✓</div>
        <h2>Ödeme Başarılı!</h2>
        <p>Siparişiniz ({{ $orderId }}) başarıyla alındı ve ödemeniz onaylandı. Teşekkür ederiz!</p>
        <a href="{{ $redirectUrl }}" class="btn">Siteye Geri Dön</a>
    </div>
    <script>
        setTimeout(function() {
            window.location.href = "{!! $redirectUrl !!}";
        }, 3000);
    </script>
</body>
</html>
