document.addEventListener('DOMContentLoaded', () => {
    // المان‌های مورد نیاز
    const apiKeyInput = document.getElementById('api-key');
    const saveApiButton = document.getElementById('save-api');
    const showHideApiButton = document.getElementById('show-hide-api');
    const modelSearch = document.getElementById('model-search');
    const modelOptions = document.getElementById('model-options');
    const selectInput = modelSearch.closest('.select-input');
    const selectedValue = selectInput.querySelector('.selected-value');
    const toneSelect = document.getElementById('tone-select');
    const sourceText = document.getElementById('source-text');
    const translatedText = document.getElementById('translated-text');
    const translateButton = document.getElementById('translate-button');
    const mobileTranslateButton = document.getElementById('mobile-translate-button');
    const sourceLanguage = document.getElementById('source-language');
    const targetLanguage = document.getElementById('target-language');
    const loadingIndicator = document.getElementById('loading');
    const translationHistory = document.getElementById('translation-history');
    const clearHistoryButton = document.getElementById('clear-history');
    const copyTranslationButton = document.getElementById('copy-translation');
    const copyToast = document.getElementById('copy-toast');
    const historyHeader = document.querySelector('.history-header');
    const historyContent = document.querySelector('.history-content');
    const historyToggleIcon = document.querySelector('.history-toggle-icon');
    const clearSourceButton = document.getElementById('clear-source');
    const clearTranslationButton = document.getElementById('clear-translation');
    
    // المان‌های مدیریت تم
    const themeButton = document.getElementById('theme-button');
    const themePanel = document.querySelector('.theme-panel');
    const closePanelButton = document.querySelector('.close-panel');
    const themeOptions = document.querySelectorAll('.theme-option');
    const opacitySlider = document.getElementById('opacity-slider');
    const opacityValue = document.getElementById('opacity-value');
    
    // المان‌های مدیریت تنظیمات
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.querySelector('.settings-panel');
    const closeSettingsPanelButton = document.querySelector('.close-settings-panel');
    
    // مدال‌های تایید حذف
    const deleteModal = document.getElementById('delete-modal');
    const deleteAllModal = document.getElementById('delete-all-modal');
    const confirmDelete = document.getElementById('confirm-delete');
    const cancelDelete = document.getElementById('cancel-delete');
    const confirmDeleteAll = document.getElementById('confirm-delete-all');
    const cancelDeleteAll = document.getElementById('cancel-delete-all');
    
    // متغیرهای تشخیص موبایل
    const isMobile = window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // شناسه آیتم در حال حذف
    let currentDeleteId = null;

    // متغیر برای ذخیره تایمر تاخیر
    let translationTimer = null;
    let toastTimer = null;

    // تنظیم اضافی برای دستگاه‌های لمسی
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }

    // بارگذاری تنظیمات ذخیره شده
    loadSavedSettings();

    // بارگذاری لیست مدل‌ها
    fetchModels();
    
    // بارگذاری تاریخچه
    loadHistory();
    
    // بارگذاری تم
    loadTheme();

    // تنظیم رویدادهای سلکت قابل جستجو
    setupSearchableSelect();

    // رویدادها
    saveApiButton.addEventListener('click', saveApiKey);
    showHideApiButton.addEventListener('click', toggleApiKeyVisibility);
    translateButton.addEventListener('click', () => translateText(true));
    mobileTranslateButton.addEventListener('click', () => translateText(true));
    clearHistoryButton.addEventListener('click', showDeleteAllConfirmation);
    copyTranslationButton.addEventListener('click', copyTranslation);
    historyHeader.addEventListener('click', toggleHistory);
    clearSourceButton.addEventListener('click', clearSourceText);
    clearTranslationButton.addEventListener('click', clearTranslatedText);
    
    // رویدادهای مدیریت تم
    document.querySelectorAll('#theme-button').forEach(button => {
        button.addEventListener('click', toggleThemePanel);
    });
    closePanelButton.addEventListener('click', closeThemePanel);
    opacitySlider.addEventListener('input', updateOpacity);
    
    // رویدادهای مدیریت تنظیمات
    document.querySelectorAll('#settings-button').forEach(button => {
        button.addEventListener('click', toggleSettingsPanel);
    });
    closeSettingsPanelButton.addEventListener('click', closeSettingsPanel);
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            setTheme(theme);
        });
    });
    
    // رویدادهای مدال‌ها
    confirmDelete.addEventListener('click', deleteHistoryItem);
    cancelDelete.addEventListener('click', hideDeleteModal);
    confirmDeleteAll.addEventListener('click', clearAllHistory);
    cancelDeleteAll.addEventListener('click', hideDeleteAllModal);
    
    // رویداد تغییر سایز صفحه
    window.addEventListener('resize', handleResize);
    
    // بستن پنل تم با کلیک خارج از آن
    document.addEventListener('click', (e) => {
        if (themePanel.classList.contains('show') && 
            !themePanel.contains(e.target) && 
            !e.target.closest('#theme-button')) {
            closeThemePanel();
        }
        
        if (settingsPanel.classList.contains('show') && 
            !settingsPanel.contains(e.target) && 
            !e.target.closest('#settings-button')) {
            closeSettingsPanel();
        }
    });

    // تنظیم حالت تمام صفحه برای دستگاه‌های موبایل
    if (isMobile) {
        setupMobileFullscreen();
    }
    
    // تغییرات زبان و لحن فقط در لوکال استوریج ذخیره می‌شوند ولی باعث ترجمه خودکار نمی‌شوند
    sourceLanguage.addEventListener('change', () => {
        localStorage.setItem('source_language', sourceLanguage.value);
    });
    
    targetLanguage.addEventListener('change', () => {
        localStorage.setItem('target_language', targetLanguage.value);
    });
    
    toneSelect.addEventListener('change', () => {
        localStorage.setItem('selected_tone', toneSelect.value);
    });
    
    // تنظیم حالت تمام صفحه برای موبایل
    function setupMobileFullscreen() {
        // بررسی پشتیبانی از ویژگی تمام صفحه
        const fullscreenAvailable = 
            document.documentElement.requestFullscreen || 
            document.documentElement.webkitRequestFullscreen || 
            document.documentElement.mozRequestFullScreen || 
            document.documentElement.msRequestFullscreen;
            
        if (fullscreenAvailable && isMobile) {
            // اضافه کردن دکمه حالت تمام صفحه به فوتر
            const footer = document.querySelector('.glass-footer');
            const fullscreenButton = document.createElement('button');
            fullscreenButton.className = 'fullscreen-button';
            fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenButton.addEventListener('click', toggleFullscreen);
            footer.appendChild(fullscreenButton);
        }
    }
    
    // تابع تغییر حالت تمام صفحه
    function toggleFullscreen() {
        if (!document.fullscreenElement && 
            !document.mozFullScreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            // ورود به حالت تمام صفحه
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        } else {
            // خروج از حالت تمام صفحه
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    // مدیریت تغییر سایز صفحه
    function handleResize() {
        // تنظیم متغیر وضعیت موبایل
        const wasMobile = isMobile;
        const newIsMobile = window.innerWidth <= 768;
        
        // اگر وضعیت تغییر کرده است
        if (wasMobile !== newIsMobile) {
            location.reload(); // بارگذاری مجدد صفحه برای تنظیم عناصر متناسب با سایز
        }
        
        // تنظیم ارتفاع کادرهای متن متناسب با سایز صفحه
        adjustTextAreaHeights();
    }
    
    // تنظیم ارتفاع کادرهای متن
    function adjustTextAreaHeights() {
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight * 0.25; // 25% ارتفاع صفحه
        
        if (window.innerWidth <= 480) {
            // تنظیم ارتفاع برای موبایل
            sourceText.style.height = `${availableHeight}px`;
            translatedText.style.height = `${availableHeight}px`;
        } else if (window.innerWidth <= 768) {
            // تنظیم ارتفاع برای تبلت
            sourceText.style.height = `${availableHeight * 1.2}px`;
            translatedText.style.height = `${availableHeight * 1.2}px`;
        } else {
            // بازگرداندن به حالت پیش‌فرض برای دسکتاپ
            sourceText.style.height = '';
            translatedText.style.height = '';
        }
    }
    
    // پاک کردن متن اصلی
    function clearSourceText() {
        sourceText.value = '';
        sourceText.focus();
    }
    
    // پاک کردن متن ترجمه شده
    function clearTranslatedText() {
        translatedText.value = '';
    }
    
    // نمایش/مخفی کردن پنل تنظیمات
    function toggleSettingsPanel() {
        // اگر پنل تم باز است، آن را ببندید
        if (themePanel.classList.contains('show')) {
            closeThemePanel();
        }
        
        settingsPanel.classList.toggle('show');
        
        // مخفی کردن صفحه کلید در موبایل
        if (isMobile) {
            document.activeElement.blur();
        }
    }
    
    // بستن پنل تنظیمات
    function closeSettingsPanel() {
        settingsPanel.classList.remove('show');
    }

    // باز و بسته کردن بخش تاریخچه
    function toggleHistory(e) {
        // اگر کلیک روی دکمه پاک کردن تاریخچه بود، از اجرای تابع جلوگیری می‌کنیم
        if (e.target === clearHistoryButton || clearHistoryButton.contains(e.target)) {
            return;
        }

        historyContent.classList.toggle('show');
        
        // چرخش آیکون
        if (historyContent.classList.contains('show')) {
            historyToggleIcon.style.transform = 'rotate(180deg)';
        } else {
            historyToggleIcon.style.transform = 'rotate(0)';
        }
        
        // ذخیره وضعیت در localStorage
        localStorage.setItem('history_expanded', historyContent.classList.contains('show'));
    }

    // ذخیره کلید API
    function saveApiKey() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('openrouter_api_key', apiKey);
            alert('کلید API با موفقیت ذخیره شد.');
            fetchModels(); // بارگذاری مجدد مدل‌ها با کلید جدید
        } else {
            alert('لطفاً کلید API را وارد کنید.');
        }
    }

    // نمایش/مخفی کردن کلید API
    function toggleApiKeyVisibility() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            showHideApiButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            apiKeyInput.type = 'password';
            showHideApiButton.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    // بارگذاری تنظیمات ذخیره شده
    function loadSavedSettings() {
        const savedApiKey = localStorage.getItem('openrouter_api_key');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
        }

        const savedModel = localStorage.getItem('selected_model');
        if (savedModel) {
            setTimeout(() => {
                if (modelOptions.querySelector(`option[value="${savedModel}"]`)) {
                    modelOptions.value = savedModel;
                }
            }, 1000); // تاخیر برای اطمینان از بارگذاری مدل‌ها
        }

        const savedTone = localStorage.getItem('selected_tone');
        if (savedTone) {
            toneSelect.value = savedTone;
        }

        const savedSourceLang = localStorage.getItem('source_language');
        if (savedSourceLang) {
            sourceLanguage.value = savedSourceLang;
        }

        const savedTargetLang = localStorage.getItem('target_language');
        if (savedTargetLang) {
            targetLanguage.value = savedTargetLang;
        }
        
        // بارگذاری وضعیت باز/بسته بودن تاریخچه
        const historyExpanded = localStorage.getItem('history_expanded') === 'true';
        if (historyExpanded) {
            historyContent.classList.add('show');
            historyToggleIcon.style.transform = 'rotate(180deg)';
        }
    }
    
    // کپی متن ترجمه شده به کلیپ‌بورد
    function copyTranslation() {
        const text = translatedText.value.trim();
        if (!text) return;
        
        // کپی متن
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast();
            })
            .catch(err => {
                console.error('خطا در کپی متن:', err);
                // روش جایگزین برای مرورگرهایی که از Clipboard API پشتیبانی نمی‌کنند
                fallbackCopy();
            });
    }
    
    // روش جایگزین برای کپی متن
    function fallbackCopy() {
        translatedText.select();
        translatedText.setSelectionRange(0, 99999); // برای موبایل
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showToast();
            } else {
                alert('کپی متن امکان‌پذیر نیست. لطفاً به صورت دستی متن را انتخاب و کپی کنید.');
            }
        } catch (err) {
            console.error('خطا در کپی متن با روش جایگزین:', err);
            alert('کپی متن امکان‌پذیر نیست. لطفاً به صورت دستی متن را انتخاب و کپی کنید.');
        }
        
        // برداشتن انتخاب
        window.getSelection().removeAllRanges();
    }
    
    // نمایش اعلان کپی
    function showToast() {
        // لغو تایمر قبلی
        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        
        // نمایش اعلان
        copyToast.classList.add('show');
        
        // مخفی کردن اعلان پس از 3 ثانیه
        toastTimer = setTimeout(() => {
            copyToast.classList.remove('show');
        }, 3000);
    }
    
    // نمایش/مخفی کردن پنل تم
    function toggleThemePanel() {
        // اگر پنل تنظیمات باز است، آن را ببندید
        if (settingsPanel.classList.contains('show')) {
            closeSettingsPanel();
        }
        
        themePanel.classList.toggle('show');
    }
    
    // بستن پنل تم
    function closeThemePanel() {
        themePanel.classList.remove('show');
    }
    
    // تنظیم تم
    function setTheme(theme) {
        // حذف کلاس تم فعلی
        document.body.removeAttribute('data-theme');
        
        // اضافه کردن کلاس تم جدید (به جز تم پیش‌فرض)
        if (theme !== 'default') {
            document.body.setAttribute('data-theme', theme);
        }
        
        // به‌روزرسانی گزینه فعال
        themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // ذخیره تم در localStorage
        localStorage.setItem('selected_theme', theme);
    }
    
    // بارگذاری تم ذخیره شده
    function loadTheme() {
        const savedTheme = localStorage.getItem('selected_theme') || 'default';
        setTheme(savedTheme);
        
        // بارگذاری تنظیمات شفافیت
        const savedOpacity = localStorage.getItem('panel_opacity') || 50;
        opacitySlider.value = savedOpacity;
        opacityValue.textContent = `${savedOpacity}%`;
        document.documentElement.style.setProperty('--panel-opacity', savedOpacity / 100);
    }
    
    // به‌روزرسانی شفافیت پنل‌ها
    function updateOpacity() {
        const opacity = opacitySlider.value;
        opacityValue.textContent = `${opacity}%`;
        document.documentElement.style.setProperty('--panel-opacity', opacity / 100);
        localStorage.setItem('panel_opacity', opacity);
    }

    // تنظیم رویدادهای سلکت قابل جستجو
    function setupSearchableSelect() {
        // باز و بسته کردن لیست
        selectInput.addEventListener('click', (e) => {
            if (e.target !== modelSearch) {
                if (!modelOptions.classList.contains('show')) {
                    openSelect();
                } else {
                    closeSelect();
                }
            }
        });
        
        // اگر روی جای دیگری از صفحه کلیک شد، سلکت بسته شود
        document.addEventListener('click', (e) => {
            if (!selectInput.contains(e.target) && modelOptions.classList.contains('show')) {
                closeSelect();
            }
        });
        
        // جستجو در لیست
        modelSearch.addEventListener('input', () => {
            const searchTerm = modelSearch.value.trim().toLowerCase();
            const options = modelOptions.querySelectorAll('.select-option');
            let hasResults = false;
            
            options.forEach(option => {
                const text = option.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    option.style.display = 'block';
                    hasResults = true;
                } else {
                    option.style.display = 'none';
                }
            });
            
            // نمایش پیام "نتیجه‌ای یافت نشد" اگر هیچ نتیجه‌ای نبود
            const noResultElem = modelOptions.querySelector('.search-no-result');
            if (noResultElem) {
                if (hasResults) {
                    noResultElem.style.display = 'none';
                } else {
                    noResultElem.textContent = 'نتیجه‌ای یافت نشد';
                    noResultElem.style.display = 'block';
                }
            }
        });
        
        // فوکوس روی فیلد جستجو وقتی سلکت باز می‌شود
        modelSearch.addEventListener('focus', () => {
            openSelect();
        });
        
        // باز کردن سلکت
        function openSelect() {
            selectInput.classList.add('active');
            modelOptions.classList.add('show');
            modelSearch.focus();
            
            // اگر مقداری انتخاب شده، آن را پاک کنیم تا کاربر بتواند جستجو کند
            if (selectInput.classList.contains('has-value')) {
                modelSearch.value = '';
                selectInput.classList.remove('has-value');
            }
        }
        
        // بستن سلکت
        function closeSelect() {
            selectInput.classList.remove('active');
            modelOptions.classList.remove('show');
            
            // اگر مقداری انتخاب شده است، آن را نمایش دهیم
            const selectedOption = modelOptions.querySelector('.select-option.selected');
            if (selectedOption) {
                selectedValue.textContent = selectedOption.textContent;
                selectInput.classList.add('has-value');
            }
        }
    }

    // بارگذاری مدل‌ها از API
    async function fetchModels() {
        const apiKey = localStorage.getItem('openrouter_api_key');
        
        // ابتدا لیست را خالی کنیم
        modelOptions.innerHTML = '<div class="search-no-result">در حال بارگذاری مدل‌ها...</div>';
        
        if (!apiKey) {
            modelOptions.innerHTML = '<div class="search-no-result">لطفا ابتدا کلید API را وارد کنید</div>';
            return;
        }
        
        try {
            const response = await fetch('https://openrouter.ai/api/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`خطا در دریافت لیست مدل‌ها: ${response.status}`);
            }
            
            const data = await response.json();
            
            // خالی کردن لیست قبلی
            modelOptions.innerHTML = '';
            
            // اگر هیچ مدلی وجود نداشت
            if (!data.data || data.data.length === 0) {
                modelOptions.innerHTML = '<div class="search-no-result">هیچ مدلی یافت نشد</div>';
                return;
            }
            
            // مرتب‌سازی مدل‌ها بر اساس نام
            const models = data.data.sort((a, b) => a.id.localeCompare(b.id));
            
            // اضافه کردن مدل‌ها به لیست
            models.forEach(model => {
                const option = document.createElement('div');
                option.className = 'select-option';
                option.setAttribute('data-value', model.id);
                option.textContent = model.id;
                
                // اگر این مدل قبلاً انتخاب شده بود
                const savedModel = localStorage.getItem('selected_model');
                if (savedModel && savedModel === model.id) {
                    option.classList.add('selected');
                    selectedValue.textContent = model.id;
                    selectInput.classList.add('has-value');
                }
                
                option.addEventListener('click', () => {
                    // انتخاب این گزینه
                    const allOptions = modelOptions.querySelectorAll('.select-option');
                    allOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    
                    // نمایش مقدار انتخاب شده
                    selectedValue.textContent = model.id;
                    selectInput.classList.add('has-value');
                    
                    // ذخیره مدل انتخاب شده
                    localStorage.setItem('selected_model', model.id);
                    
                    // بستن لیست
                    closeSelect();
                });
                
                modelOptions.appendChild(option);
            });
            
        } catch (error) {
            console.error('خطا در دریافت لیست مدل‌ها:', error);
            modelOptions.innerHTML = '<div class="search-no-result">خطا در دریافت لیست مدل‌ها</div>';
        }
    }

    // ترجمه متن
    async function translateText(showAlert = true) {
        const apiKey = localStorage.getItem('openrouter_api_key');
        const text = sourceText.value.trim();
        const tone = toneSelect.value;
        const srcLang = sourceLanguage.value;
        const tgtLang = targetLanguage.value;
        
        if (!text) {
            if (showAlert) alert('لطفاً متنی برای ترجمه وارد کنید.');
            return;
        }
        
        if (!apiKey) {
            if (showAlert) alert('لطفاً ابتدا کلید API را وارد کنید.');
            return;
        }
        
        // گزینه انتخاب شده در لیست مدل‌ها
        const selectedOption = modelOptions.querySelector('.select-option.selected');
        const model = selectedOption ? selectedOption.getAttribute('data-value') : null;
        
        if (!model) {
            if (showAlert) alert('لطفاً یک مدل انتخاب کنید.');
            return;
        }
        
        // نمایش نشانگر بارگذاری
        loadingIndicator.style.display = 'flex';
        
        try {
            // لحن‌های مختلف ترجمه
            const tonePrompts = {
                normal: 'ترجمه کن',
                formal: 'به صورت رسمی و مؤدبانه ترجمه کن',
                informal: 'به صورت غیررسمی و محاوره‌ای ترجمه کن',
                scientific: 'به صورت علمی و تخصصی ترجمه کن',
                professional: 'به صورت حرفه‌ای و تجاری ترجمه کن',
                childish: 'به زبان ساده و قابل فهم برای کودکان ترجمه کن',
                serious: 'به صورت جدی و رسمی ترجمه کن',
                meanings: 'انواع معانی مختلف این کلمه را نشان بده و در هر زمینه چه معنی می‌دهد'
            };

            const tonePrompt = tonePrompts[tone] || tonePrompts['normal'];
            
            const sourceLangName = sourceLanguage.options[sourceLanguage.selectedIndex].text;
            const targetLangName = targetLanguage.options[targetLanguage.selectedIndex].text;
            
            // ساخت پیام برای API
            let userMessage;
            
            if (tone === 'meanings') {
                userMessage = `این کلمه یا عبارت "${text}" را تحلیل کن و معانی مختلف آن را در زمینه‌های مختلف به ${targetLangName} نشان بده.
لطفاً به صورت ساختارمند موارد زیر را نشان بده:
1. معنی اصلی
2. معانی مختلف در زمینه‌های متفاوت (مثل ادبی، تخصصی، عامیانه و غیره)
3. مترادف‌ها و متضادها
4. مثال‌هایی از کاربرد در جمله

فقط معانی را نشان بده و توضیح اضافی ندهد.`;
            } else {
                userMessage = `${srcLang === 'auto' ? 'این متن را به ' + targetLangName + ' ' + tonePrompt : 
                    'این متن ' + sourceLangName + ' را به ' + targetLangName + ' ' + tonePrompt}:
                    
فقط متن را ترجمه کن و هیچ توضیح، مقدمه یا پاورقی اضافه نکن. فقط و فقط ترجمه خالص متن زیر:

${text}`;
            }
             
             const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                 method: 'POST',
                 headers: {
                     'Authorization': `Bearer ${apiKey}`,
                     'Content-Type': 'application/json',
                     'HTTP-Referer': window.location.href,
                     'X-Title': 'Smart Translator'
                 },
                 body: JSON.stringify({
                     model: model,
                     messages: [
                         { role: 'user', content: userMessage }
                     ]
                 })
             });
             
             if (!response.ok) {
                 throw new Error(`خطا در ترجمه: ${response.status}`);
             }
             
             const data = await response.json();
             const translatedContent = data.choices[0].message.content.trim();
             
             translatedText.value = translatedContent;
             
             // افزودن ترجمه به تاریخچه
             addToHistory(text, translatedContent, sourceLangName, targetLangName, model, tone);
             
         } catch (error) {
             console.error('خطا در ترجمه:', error);
             if (showAlert) alert(`خطا در ترجمه: ${error.message}`);
         } finally {
             // مخفی کردن نشانگر بارگذاری
             loadingIndicator.style.display = 'none';
         }
     }
     
     // افزودن به تاریخچه
     function addToHistory(sourceText, translatedText, sourceLang, targetLang, model, tone) {
         // بررسی اینکه آیا قبلاً تاریخچه‌ای ذخیره شده است
         let history = JSON.parse(localStorage.getItem('translation_history')) || [];
         
         // ایجاد یک شناسه منحصر به فرد
         const id = Date.now().toString();
         
         // افزودن ترجمه جدید به ابتدای آرایه
         history.unshift({
             id,
             sourceText,
             translatedText,
             sourceLang,
             targetLang,
             model: selectedValue.textContent,
             tone: toneSelect.options[toneSelect.selectedIndex].text,
             date: new Date().toISOString()
         });
         
         // محدود کردن تعداد موارد تاریخچه به 50 مورد
         if (history.length > 50) {
             history = history.slice(0, 50);
         }
         
         // ذخیره تاریخچه
         localStorage.setItem('translation_history', JSON.stringify(history));
         
         // بروزرسانی نمایش تاریخچه
         loadHistory();
     }
     
     // بارگذاری و نمایش تاریخچه
     function loadHistory() {
         const history = JSON.parse(localStorage.getItem('translation_history') || '[]');
         
         if (history.length === 0) {
             translationHistory.innerHTML = '<p class="no-history">تاریخچه‌ای وجود ندارد</p>';
             return;
         }
         
         translationHistory.innerHTML = '';
         
         history.forEach(item => {
             const date = new Date(item.date);
             const formattedDate = `${date.toLocaleDateString('fa-IR')} - ${date.toLocaleTimeString('fa-IR')}`;
             
             const historyItem = document.createElement('div');
             historyItem.className = 'history-item';
             historyItem.dataset.id = item.id;
             
             historyItem.innerHTML = `
                 <div class="history-item-header">
                     <span>${formattedDate}</span>
                     <div class="history-actions">
                         <button class="use" title="استفاده مجدد"><i class="fas fa-sync-alt"></i></button>
                         <button class="delete" title="حذف"><i class="fas fa-trash"></i></button>
                     </div>
                 </div>
                 <div class="history-info">
                     <small>از ${item.sourceLang} به ${item.targetLang} | مدل: ${item.model} | لحن: ${item.tone}</small>
                 </div>
                 <div class="history-text">
                     <div class="history-text-column">
                         <div class="history-text-title">متن اصلی:</div>
                         <div class="history-text-content">${escapeHTML(item.sourceText)}</div>
                     </div>
                     <div class="history-text-column">
                         <div class="history-text-title">ترجمه:</div>
                         <div class="history-text-content">${escapeHTML(item.translatedText)}</div>
                     </div>
                 </div>
             `;
             
             translationHistory.appendChild(historyItem);
             
             // افزودن رویدادها به دکمه‌ها
             const useButton = historyItem.querySelector('.use');
             const deleteButton = historyItem.querySelector('.delete');
             
             useButton.addEventListener('click', () => {
                 useHistoryItem(item);
             });
             
             deleteButton.addEventListener('click', () => {
                 showDeleteConfirmation(item.id);
             });
         });
         
         // در حالت موبایل، اسکرول اتوماتیک به بالای لیست تاریخچه
         if (isMobile && history.length > 0) {
             translationHistory.scrollTo(0, 0);
         }
     }
     
     // استفاده مجدد از یک آیتم تاریخچه
     function useHistoryItem(item) {
         sourceText.value = item.sourceText;
         translatedText.value = item.translatedText;
         
         // یافتن و انتخاب زبان‌ها
         for (let i = 0; i < sourceLanguage.options.length; i++) {
             if (sourceLanguage.options[i].text === item.sourceLang) {
                 sourceLanguage.selectedIndex = i;
                 break;
             }
         }
         
         for (let i = 0; i < targetLanguage.options.length; i++) {
             if (targetLanguage.options[i].text === item.targetLang) {
                 targetLanguage.selectedIndex = i;
                 break;
             }
         }
         
         // یافتن و انتخاب لحن
         for (let i = 0; i < toneSelect.options.length; i++) {
             if (toneSelect.options[i].text === item.tone) {
                 toneSelect.selectedIndex = i;
                 break;
             }
         }
         
         // اسکرول به بالای صفحه
         window.scrollTo({
             top: 0,
             behavior: 'smooth'
         });
         
         // در حالت موبایل، بستن پنل تاریخچه
         if (isMobile && historyContent.classList.contains('show')) {
             toggleHistory();
         }
     }
     
     // نمایش تایید حذف یک آیتم
     function showDeleteConfirmation(id) {
         currentDeleteId = id;
         deleteModal.style.display = 'flex';
     }
     
     // نمایش تایید حذف همه آیتم‌ها
     function showDeleteAllConfirmation() {
         deleteAllModal.style.display = 'flex';
     }
     
     // مخفی کردن مدال حذف
     function hideDeleteModal() {
         deleteModal.style.display = 'none';
         currentDeleteId = null;
     }
     
     // مخفی کردن مدال حذف همه
     function hideDeleteAllModal() {
         deleteAllModal.style.display = 'none';
     }
     
     // حذف یک آیتم از تاریخچه
     function deleteHistoryItem() {
         if (!currentDeleteId) return;
         
         let history = JSON.parse(localStorage.getItem('translation_history') || '[]');
         history = history.filter(item => item.id !== currentDeleteId);
         localStorage.setItem('translation_history', JSON.stringify(history));
         
         loadHistory();
         hideDeleteModal();
     }
     
     // حذف تمام تاریخچه
     function clearAllHistory() {
         localStorage.removeItem('translation_history');
         loadHistory();
         hideDeleteAllModal();
     }
     
     // ایمن‌سازی متن HTML
     function escapeHTML(text) {
         return text
             .replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
     }

    // بررسی وضعیت اتصال به اینترنت
    function checkOnlineStatus() {
        const offlineMessage = document.createElement('div');
        offlineMessage.className = 'offline-message';
        offlineMessage.textContent = 'شما آفلاین هستید. برخی از ویژگی‌ها در دسترس نیستند.';
        document.body.appendChild(offlineMessage);
        
        function updateOnlineStatus() {
            if (navigator.onLine) {
                offlineMessage.classList.remove('show');
                document.body.classList.remove('offline');
                // فعال‌سازی مجدد دکمه‌ها
                translateButton.disabled = false;
                if (mobileTranslateButton) mobileTranslateButton.disabled = false;
            } else {
                offlineMessage.classList.add('show');
                document.body.classList.add('offline');
                // غیرفعال کردن دکمه‌ها
                translateButton.disabled = true;
                if (mobileTranslateButton) mobileTranslateButton.disabled = true;
            }
        }
        
        // بررسی وضعیت اولیه
        updateOnlineStatus();
        
        // اضافه کردن لیسنرها برای تغییر وضعیت
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }
    
    // فراخوانی تابع بررسی وضعیت اتصال
    checkOnlineStatus();
}); 