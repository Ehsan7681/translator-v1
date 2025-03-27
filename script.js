document.addEventListener('DOMContentLoaded', () => {
    // المان‌های مورد نیاز
    const apiKeyInput = document.getElementById('api-key');
    const saveApiButton = document.getElementById('save-api');
    const showHideApiButton = document.getElementById('show-hide-api');
    const modelSelect = document.getElementById('model-select');
    const toneSelect = document.getElementById('tone-select');
    const sourceText = document.getElementById('source-text');
    const translatedText = document.getElementById('translated-text');
    const translateButton = document.getElementById('translate-button');
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
    
    // شناسه آیتم در حال حذف
    let currentDeleteId = null;

    // متغیر برای ذخیره تایمر تاخیر
    let translationTimer = null;
    let toastTimer = null;

    // بارگذاری تنظیمات ذخیره شده
    loadSavedSettings();

    // بارگذاری لیست مدل‌ها
    fetchModels();
    
    // بارگذاری تاریخچه
    loadHistory();
    
    // بارگذاری تم
    loadTheme();

    // رویدادها
    saveApiButton.addEventListener('click', saveApiKey);
    showHideApiButton.addEventListener('click', toggleApiKeyVisibility);
    translateButton.addEventListener('click', () => translateText(true));
    clearHistoryButton.addEventListener('click', showDeleteAllConfirmation);
    copyTranslationButton.addEventListener('click', copyTranslation);
    historyHeader.addEventListener('click', toggleHistory);
    clearSourceButton.addEventListener('click', clearSourceText);
    clearTranslationButton.addEventListener('click', clearTranslatedText);
    
    // رویدادهای مدیریت تم
    themeButton.addEventListener('click', toggleThemePanel);
    closePanelButton.addEventListener('click', closeThemePanel);
    opacitySlider.addEventListener('input', updateOpacity);
    
    // رویدادهای مدیریت تنظیمات
    settingsButton.addEventListener('click', toggleSettingsPanel);
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
    
    // بستن پنل تم با کلیک خارج از آن
    document.addEventListener('click', (e) => {
        if (themePanel.classList.contains('show') && 
            !themePanel.contains(e.target) && 
            e.target !== themeButton &&
            !themeButton.contains(e.target)) {
            closeThemePanel();
        }
        
        if (settingsPanel.classList.contains('show') && 
            !settingsPanel.contains(e.target) && 
            e.target !== settingsButton &&
            !settingsButton.contains(e.target)) {
            closeSettingsPanel();
        }
    });
    
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
                if (modelSelect.querySelector(`option[value="${savedModel}"]`)) {
                    modelSelect.value = savedModel;
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

    // دریافت لیست مدل‌ها از اوپن‌روتر
    async function fetchModels() {
        try {
            const apiKey = localStorage.getItem('openrouter_api_key');
            if (!apiKey) {
                modelSelect.innerHTML = '<option value="">ابتدا کلید API را وارد و ذخیره کنید</option>';
                return;
            }

            modelSelect.innerHTML = '<option value="">در حال بارگذاری مدل‌ها...</option>';

            const response = await fetch('https://openrouter.ai/api/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`خطا در دریافت مدل‌ها: ${response.status}`);
            }

            const data = await response.json();
            populateModelSelect(data.data);
        } catch (error) {
            console.error('خطا در دریافت مدل‌ها:', error);
            modelSelect.innerHTML = '<option value="">خطا در بارگذاری مدل‌ها</option>';
        }
    }

    // پر کردن لیست مدل‌ها
    function populateModelSelect(models) {
        if (!models || models.length === 0) {
            modelSelect.innerHTML = '<option value="">هیچ مدلی یافت نشد</option>';
            return;
        }

        modelSelect.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name} (${model.context_length} توکن)`;
            modelSelect.appendChild(option);
        });

        // بازیابی مدل ذخیره شده
        const savedModel = localStorage.getItem('selected_model');
        if (savedModel && modelSelect.querySelector(`option[value="${savedModel}"]`)) {
            modelSelect.value = savedModel;
        }

        // ذخیره انتخاب مدل
        modelSelect.addEventListener('change', () => {
            localStorage.setItem('selected_model', modelSelect.value);
        });
    }

    // ترجمه متن
    async function translateText(showAlert = true) {
        const text = sourceText.value.trim();
        const model = modelSelect.value;
        const tone = toneSelect.value;
        const srcLang = sourceLanguage.value;
        const tgtLang = targetLanguage.value;
        const apiKey = localStorage.getItem('openrouter_api_key');

        if (!text) {
            if (showAlert) alert('لطفاً متنی برای ترجمه وارد کنید.');
            return;
        }

        if (!model) {
            if (showAlert) alert('لطفاً یک مدل انتخاب کنید.');
            return;
        }

        if (!apiKey) {
            if (showAlert) alert('لطفاً کلید API را وارد و ذخیره کنید.');
            return;
        }

        // نمایش نشانگر بارگذاری
        loadingIndicator.style.display = 'flex';
        translatedText.value = 'در حال ترجمه...';

        try {
            const tonePrompts = {
                'normal': 'با لحن عادی ترجمه کن.',
                'formal': 'با لحن رسمی و مؤدبانه ترجمه کن.',
                'informal': 'با لحن غیررسمی و صمیمی ترجمه کن.',
                'scientific': 'با لحن علمی و تخصصی ترجمه کن.',
                'professional': 'با لحن حرفه‌ای و تجاری ترجمه کن.',
                'childish': 'با لحن کودکانه و ساده ترجمه کن.',
                'serious': 'با لحن جدی و قاطع ترجمه کن.'
            };

            const tonePrompt = tonePrompts[tone] || tonePrompts['normal'];
            
            const sourceLangName = sourceLanguage.options[sourceLanguage.selectedIndex].text;
            const targetLangName = targetLanguage.options[targetLanguage.selectedIndex].text;

            const prompt = `متن زیر را از ${sourceLangName} به ${targetLangName} ترجمه کن. ${tonePrompt}

متن اصلی:
${text}

ترجمه:`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'AI Translator'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: prompt }
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
            console.error('خطا در ترجمه متن:', error);
            translatedText.value = `خطا در ترجمه: ${error.message}`;
        } finally {
            // مخفی کردن نشانگر بارگذاری
            loadingIndicator.style.display = 'none';
        }
    }
    
    // ------------- توابع مربوط به تاریخچه -------------
    
    // افزودن ترجمه به تاریخچه
    function addToHistory(sourceText, translatedText, sourceLang, targetLang, model, tone) {
        // دریافت تاریخچه فعلی
        let history = JSON.parse(localStorage.getItem('translation_history') || '[]');
        
        // شناسه یکتا برای ترجمه جدید
        const id = Date.now().toString();
        
        // افزودن ترجمه جدید به ابتدای تاریخچه
        history.unshift({
            id,
            sourceText,
            translatedText,
            sourceLang,
            targetLang,
            model: modelSelect.options[modelSelect.selectedIndex].text,
            tone: toneSelect.options[toneSelect.selectedIndex].text,
            date: new Date().toISOString()
        });
        
        // محدود کردن تعداد آیتم‌های تاریخچه به 20
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        // ذخیره تاریخچه
        localStorage.setItem('translation_history', JSON.stringify(history));
        
        // نمایش تاریخچه به‌روزشده
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
}); 