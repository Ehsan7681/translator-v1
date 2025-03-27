# مترجم هوشمند با هوش مصنوعی

برنامه وب ترجمه متن با استفاده از هوش مصنوعی و API اوپن‌روتر، با طراحی گلس مورفیسم و قابلیت‌های متنوع.

## ویژگی‌ها

- ترجمه متن با استفاده از مدل‌های پیشرفته هوش مصنوعی
- طراحی مدرن با استایل گلس مورفیسم (نیمه شفاف تا 50% شفافیت)
- پشتیبانی از لحن‌های مختلف ترجمه (رسمی، غیررسمی، علمی، حرفه‌ای، کودکانه، جدی و عادی)
- دریافت خودکار لیست مدل‌های هوش مصنوعی از سرویس اوپن‌روتر
- ذخیره‌سازی کلید API و تنظیمات کاربر
- طراحی واکنش‌گرا (ریسپانسیو) برای استفاده در انواع دستگاه‌ها
- پشتیبانی از زبان‌های مختلف

## پیش‌نیازها

برای استفاده از این برنامه، به موارد زیر نیاز دارید:

1. یک کلید API معتبر از سایت [OpenRouter](https://openrouter.ai)
2. مرورگر وب مدرن با پشتیبانی از JavaScript و CSS3

## روش استفاده

1. فایل‌های پروژه را دانلود کنید
2. فایل `index.html` را در مرورگر خود باز کنید
3. کلید API اوپن‌روتر خود را در بخش مربوطه وارد کرده و روی "ذخیره" کلیک کنید
4. یک مدل هوش مصنوعی از لیست کشویی انتخاب کنید
5. لحن ترجمه مورد نظر خود را انتخاب کنید
6. متن اصلی را وارد کرده و زبان مبدا و مقصد را انتخاب کنید
7. روی دکمه "ترجمه" کلیک کنید تا متن ترجمه شده را دریافت کنید

## ساختار فایل‌ها

- `index.html`: ساختار اصلی برنامه
- `style.css`: استایل‌های برنامه و پیاده‌سازی گلس مورفیسم
- `script.js`: کدهای جاوااسکریپت برای ارتباط با API و منطق برنامه

## دریافت کلید API

برای دریافت کلید API اوپن‌روتر، به سایت [OpenRouter](https://openrouter.ai) مراجعه کرده و پس از ثبت‌نام، از بخش حساب کاربری خود یک کلید API دریافت کنید.

## نکات امنیتی

- کلید API شما در حافظه محلی مرورگر (localStorage) ذخیره می‌شود و به سرور ارسال نمی‌شود
- امکان مخفی‌سازی کلید API هنگام وارد کردن آن وجود دارد
- برای حفظ امنیت، از به اشتراک‌گذاری کلید API خود با دیگران خودداری کنید

## توسعه‌دهندگان

این پروژه به صورت متن‌باز (Open Source) منتشر شده و امکان توسعه و بهبود آن توسط جامعه توسعه‌دهندگان وجود دارد. 