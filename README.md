# Stok Takip Bot

E-ticaret sitelerinde ürün stoku takip eden otomatik bot sistemi.

## Özellikler

- **Defacto** - Ürün beden stok kontrolü
- **Bershka** - Ürün beden stok kontrolü
- Çerez banner'larını otomatik kapatma
- Ses bildirimi sistemi
- Özelleştirilebilir beden seçimi
- Gerçek zamanlı stok takibi

## Kurulum

1. Node.js'i yükleyin
2. Proje klasörüne gidin
3. Bağımlılıkları yükleyin:

```bash
npm install
```

## Kullanım

### Defacto için:
```bash
node defacto.js
```

### Bershka için:

```bash
node bershka.js
```

## Yapılandırma

Her dosyada şu ayarları değiştirebilirsiniz:

- `url`: Takip edilecek ürün URL'si
- `targetSize`: Aranacak beden
- Kontrol aralığı (defacto için 5 dakika, bershka için 10 saniye)

## Gereksinimler

- Node.js
- Puppeteer
- play-sound

## Lisans

MIT License
