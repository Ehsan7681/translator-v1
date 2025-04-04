const CACHE_NAME = 'smart-translator-v1';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2'
];

// نصب سرویس ورکر و ذخیره فایل‌ها در کش
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('کش برنامه ایجاد شد');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// فعال‌سازی سرویس ورکر و حذف کش‌های قدیمی
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// استراتژی مدیریت درخواست‌ها: ابتدا کش، سپس آنلاین
self.addEventListener('fetch', event => {
    // برای درخواست‌های API، همیشه به صورت آنلاین
    if (event.request.url.includes('openrouter.ai')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // اگر در کش یافت شد، آن را برگردان
                if (response) {
                    return response;
                }
                
                // در غیر این صورت، درخواست را به سرور ارسال کن
                return fetch(event.request)
                    .then(response => {
                        // بررسی اعتبار پاسخ
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // کپی پاسخ برای ذخیره در کش
                        let responseClone = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });
                            
                        return response;
                    });
            })
            .catch(() => {
                // اگر هیچ راهی برای دریافت منبع نبود، اینجا می‌توان یک صفحه آفلاین خاص را برگرداند
                // در این مورد فعلاً چیزی برنمی‌گردانیم
            })
    );
});

// مدیریت پیام‌ها
self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
}); 