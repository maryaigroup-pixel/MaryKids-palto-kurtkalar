# MaryKids — palto, kurtka va shapkalar 🧥

Bolalar qishki kiyimlari uchun **Next.js (App Router)** landing sahifa. Instagram target reklamasidan kelgan mijozlar lid qoldiradi, lid darhol **Telegram botga** keladi, sotuv bo'lganda esa bitta havola orqali **Meta Conversions API** ga `Purchase` yuboriladi — Ads Manager'da Purchase va ROAS ko'rinadi.

## Qanday ishlaydi

```
Instagram reklama ──► Landing (Pixel: PageView)
                         │
                         ▼  mijoz ism + telefon qoldiradi
                     /api/lead
                         ├─► Meta CAPI: Lead (Pixel bilan bir xil event_id → dublikat yo'q)
                         ├─► Telegram bot: ism, telefon, mahsulot, UTM
                         │      + 🔐 "Xarid qildi → summani Meta'ga yuborish" havolasi
                         └─► mijoz Telegram kanalga yo'naltiriladi

Menejer sotuvdan keyin Telegram'dagi havolani bosadi ──► Chrome'da /purchase
                         │  to'lov summasini kiritadi → "Yuborish"
                         ▼
                   /api/purchase ──► Meta CAPI: Purchase (value + currency)
                                 └─► Telegram: "✅ Purchase yuborildi"
```

### Havola xavfsizligi
- Ism va telefon **SHA-256 bilan xeshlanadi** (Meta talabi bo'yicha normallashtirilgan holda).
- Xeshlar + `fbp`, `fbc`, IP, User-Agent bitta tokenga yig'ilib **AES-256-GCM** bilan shifrlanadi. Havolani soxtalashtirib yoki o'zgartirib bo'lmaydi.
- Bir lid uchun `event_id = purchase_<leadId>` — havola ikki marta bosilsa ham Meta dublikatni olib tashlaydi.
- Ixtiyoriy `ADMIN_PIN` — summani yuborishda PIN so'raladi.
- Meta Pixel faqat landingda ishlaydi, `/purchase` sahifasi statistikani buzmaydi va indekslanmaydi.

## Ishga tushirish

```bash
npm install
cp .env.example .env.local   # qiymatlarni to'ldiring
npm run dev                  # http://localhost:3000
```

## Vercel'ga deploy (tavsiya)

1. [vercel.com/new](https://vercel.com/new) → shu repozitoriyani import qiling.
2. **Environment Variables** bo'limiga `.env.example` dagi barcha o'zgaruvchilarni kiriting.
3. **Deploy**. Domeningizni ulang va `NEXT_PUBLIC_SITE_URL` ni shu domenga o'zgartiring (keyin Redeploy).

## Sozlamalar

| O'zgaruvchi | Qayerdan olinadi |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram'da [@BotFather](https://t.me/BotFather) → `/newbot` |
| `TELEGRAM_CHAT_ID` | Botni guruhga qo'shing, guruhga xabar yozing, so'ng `https://api.telegram.org/bot<TOKEN>/getUpdates` dan `chat.id` ni oling |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL_URL` | Mijoz yo'naltiriladigan kanal, masalan `https://t.me/marykids_uz` |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Events Manager → Data sources → Pixel ID |
| `META_CAPI_ACCESS_TOKEN` | Events Manager → Pixel → Settings → Conversions API → **Generate access token** |
| `META_TEST_EVENT_CODE` | Events Manager → **Test events** (faqat test paytida, keyin bo'sh qoldiring) |
| `META_CURRENCY`, `USD_UZS_RATE` | Purchase qiymati valyutasi. `USD` bo'lsa kiritilgan so'm kurs bo'yicha dollarga aylantiriladi |
| `LINK_SECRET` | `openssl rand -hex 32` — **hech kimga bermang**, o'zgartirsangiz eski havolalar ishlamay qoladi |
| `ADMIN_PIN` | Ixtiyoriy PIN kod |

## Meta'da tekshirish
1. `META_TEST_EVENT_CODE` ni qo'yib, saytda test lid qoldiring → Events Manager → Test events'da **Lead** (Browser + Server, "Deduplicated") ko'rinadi.
2. Telegram'dagi havolani ochib summa kiriting → **Purchase** ko'rinadi.
3. Test kodini o'chirib, Redeploy qiling.
4. Ads Manager'da kampaniya maqsadini **Sales**, konversiya hodisasini **Purchase** qilib tanlang. Columns → *Purchases*, *Purchase ROAS* qo'shing.

## Suratlarni almashtirish
`public/products/` papkasiga haqiqiy suratlarni (`.jpg`/`.webp`, 4:5 nisbat) joylang va `lib/products.ts` dagi `image`, nom va narxlarni yangilang.

## Tuzilma
```
app/
  page.tsx               # landing (hero CTA, kolleksiya, forma)
  purchase/page.tsx      # menejer uchun summa kiritish sahifasi
  api/lead/route.ts      # lid → Telegram + CAPI Lead
  api/purchase/route.ts  # summa → CAPI Purchase
components/              # LeadForm, ProductCard, MetaPixel
lib/                     # crypto (xesh + shifrlash), meta (CAPI), telegram, products
```
