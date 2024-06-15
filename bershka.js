const puppeteer = require('puppeteer');
const sound = require('play-sound')();

const url = 'https://www.bershka.com/tr/pilili-baggy-jogger-pantolon-c0p196946372.html?colorId=251';
const targetSize = 'XL'; // Aranacak beden
var sayac = 0;
var cookiesAccepted = false; // Çerez banner'ı için flag

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
            // Çerez banner'ını sadece ilk seferde kapatmaya çalış
            if (!cookiesAccepted) {
                try {
                    await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
                    await page.click('#onetrust-accept-btn-handler');
                    console.log('Çerez banner\'ı kapatıldı.');
                    cookiesAccepted = true;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Banner'ın kapanması için bekle
                } catch (cookieError) {
                    console.log('Çerez banner\'ı bulunamadı veya zaten kapalı.');
                    cookiesAccepted = true; // Bir daha denemesin
                }
            }

            // Beden seçeneklerinin yüklenmesini bekle (sayfada doğrudan görünür)
            await page.waitForSelector('.ui--size-dot-list li', { timeout: 10000 });

            // Sayfanın tamamen yüklenmesini ve JavaScript'in stok durumunu güncellemesini bekle
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Stok durumunun stabilleşmesini bekle (bir kez daha kontrol et)
            await page.waitForFunction(() => {
                const buttons = document.querySelectorAll('.ui--size-dot-list li button');
                // En az bir butonun aria-checked özelliği varsa, sayfa yüklenmiştir
                return buttons.length > 0 && Array.from(buttons).some(btn => btn.hasAttribute('aria-checked'));
            }, { timeout: 5000 });

        } catch (error) {
            console.log('Beden seçenekleri yüklenemedi veya stok durumu güncellenemedi.');
            await new Promise(resolve => setTimeout(resolve, 30000)); // 30 saniye bekle ve tekrar dene
            continue;
        }

        // Tüm beden seçeneklerini kontrol et
        const sizeInfo = await page.$$eval('.ui--size-dot-list li', (items) => {
            return items.map(item => {
                const button = item.querySelector('button');
                const labelElement = item.querySelector('.text__label');

                if (!labelElement || !button) return null;

                const size = labelElement.textContent.trim();
                const isDisabled = button.disabled || button.classList.contains('is-disabled');
                const hasAriaChecked = button.hasAttribute('aria-checked');
                const isLastUnits = item.classList.contains('is-last-units');

                // Eğer aria-checked varsa ve disabled değilse, mevcut demektir
                const isAvailable = hasAriaChecked && !isDisabled;

                return {
                    size,
                    available: isAvailable,
                    lastUnits: isLastUnits
                };
            }).filter(item => item !== null);
        });

        const availableSizes = sizeInfo.filter(item => item.available).map(item => item.size);
        const lastUnitsSizes = sizeInfo.filter(item => item.lastUnits && item.available).map(item => item.size);

        sayac += 1;

        if (availableSizes.length > 0) {
            console.log(`${sayac}. deneme...\nStokta olan bedenler:`, availableSizes);
            if (lastUnitsSizes.length > 0) {
                console.log('Az sayıda kalan bedenler:', lastUnitsSizes);
            }

            if (availableSizes.includes(targetSize)) {
                console.log(`İstediğiniz beden (${targetSize}) stokta!`);
                if (lastUnitsSizes.includes(targetSize)) {
                    console.log(`DİKKAT: ${targetSize} bedeni az sayıda kaldı!`);
                }
                sound.play('./notification_sound.wav');
                break;
            }
        } else {
            console.log(`${sayac}. deneme... Hiçbir beden stokta değil.`);
        }

        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 saniye bekle
    }

    await browser.close();
})();
