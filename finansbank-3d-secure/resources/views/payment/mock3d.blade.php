<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>QNB Finansbank 3D Secure Simülasyonu</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .mock-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; width: 100%; border-top: 5px solid #0055a4; }
        h2 { color: #0055a4; margin-bottom: 20px; }
        p { color: #555; line-height: 1.6; margin-bottom: 30px; }
        .btn { background: #0055a4; color: white; border: none; padding: 15px 30px; font-size: 16px; border-radius: 4px; cursor: pointer; transition: background 0.3s; width: 100%; font-weight: bold; }
        .btn:hover { background: #003d7a; }
        .alert { background: #fff3cd; color: #856404; padding: 15px; border-radius: 4px; border: 1px solid #ffeeba; margin-bottom: 20px; font-size: 14px; text-align: left; }
    </style>
</head>
<body>

<div class="mock-container">
    <h2>🔒 3D Secure Simülasyonu</h2>
    
    <div class="alert">
        <strong>⚠️ Bilgi:</strong> Finansbank test API sunucusu şu anda "Plugin Bulunamadı (M042)" yapılandırma hatası verdiği için gerçek 3D sayfasına ulaşılamıyor. Sistemin kalan kısımlarını test edebilmeniz için bu sahte (mock) ekran oluşturulmuştur.
    </div>

    <p>Normalde bu ekranda bankanın SMS şifresi girme ekranı yer alırdı. Test ortamında işlemi başarıyla tamamlamak için aşağıdaki butona tıklayın.</p>

    <form method="POST" action="{{ route('payment.mock3d.submit') }}">
        @csrf
        <input type="hidden" name="orderId" value="{{ $orderId }}">
        <button type="submit" class="btn">SMS Şifresini Doğrula ve Öde</button>
    </form>
</div>

</body>
</html>
