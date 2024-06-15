const puppeteer = require('puppeteer');
const sound = require('play-sound')();

const url = 'https://www.defacto.com.tr/beli-bagcikli-dar-paca-sort-3211993';
const targetSize = 'XL'; // Aranacak beden
var sayac = 0;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    while (true) {
        await page.goto(url);

        try {
            // Beden seçici butonlarının yüklenmesini bekle
            await page.waitForSelector('.product-size-selector__buttons .button-reset.cross-border-button', { timeout: 10000 });

            // Sayfanın tamamen yüklenmesini ve JavaScript'in stok durumunu güncellemesini bekle
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Stok durumunun stabilleşmesini bekle
            await page.waitForFunction(() => {
                const buttons = document.querySelectorAll('.product-size-selector__buttons .button-reset.cross-border-button');
                return buttons.length > 0;
            }, { timeout: 5000 });

        } catch (error) {
            console.log('Beden seçenekleri yüklenemedi veya stok durumu güncellenemedi.');
            await new Promise(resolve => setTimeout(resolve, 30000)); // 30 saniye bekle ve tekrar dene
            continue;
        }

        // Tüm mevcut butonları al
        const availableButtons = await page.$$eval('.product-size-selector__buttons .button-reset.cross-border-button', (buttons) => {
            return buttons.map(button => {
                const text = button.textContent.trim();
                const isDisabled = button.disabled || button.classList.contains('product-no-stock');
                return { size: text, available: !isDisabled };
            });
        });

        // Sadece mevcut bedenleri filtrele
        const availableSizes = availableButtons.filter(btn => btn.available).map(btn => btn.size);

        sayac += 1;

        if (availableSizes.length > 0) {
            console.log(`${sayac}. deneme...\nStokta olan bedenler:`, availableSizes);

            if (availableSizes.includes(targetSize)) {
                console.log(`İstediğiniz beden (${targetSize}) stokta!`);
                sound.play('./notification_sound.wav');
                break;
            }
        } else {
            console.log(`${sayac}. deneme... Hiçbir beden stokta değil.`);
        }

        await new Promise(resolve => setTimeout(resolve, 5*60000)); // 5 dakika bekle
    }

    await browser.close();
})();
