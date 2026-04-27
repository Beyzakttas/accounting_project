# Muhasebe AI (Accounting Panel)

Bu proje, yapay zeka destekli, modern bir muhasebe yönetim sistemidir. Sistem, rol tabanlı erişim kontrolü, JWT kimlik doğrulaması, şifre sıfırlama akışları ve dinamik olarak değişen karanlık/aydınlık tema altyapısı gibi özellikleri barındırmaktadır.

Aşağıda sisteme yeni eklenen/güncellenen özelliklerin detayı yer almaktadır.

---

## 🎨 Frontend (Kullanıcı Arayüzü) Güncellemeleri

### 1. Global Tema Yönetimi (Dark & Light Mode)
- `ThemeContext.js` adında merkezi bir bağlam (Context) oluşturularak, temanın (karanlık/aydınlık) tek bir merkezden yönetilmesi sağlandı.
- Önceden her sayfa kendi içinde temayı değiştirmeye çalışıyordu, bu durum senkronizasyon ve gecikme sorunlarına yol açıyordu. Artık Dashboard, Login, Register sayfalarındaki yerel (local state) tema ayarları kaldırılarak doğrudan genel duruma bağlandı.
- `public/index.html` dosyasına özel bir engelleme (blocking) komutu eklenerek, sayfa daha yüklenirken kullanıcının seçtiği temanın anında uygulanması sağlandı. Böylece "beyaz ekran parlaması" (Flash) problemi çözüldü.
- Tema geçişlerindeki CSS kırılmalarını önlemek için projedeki tüm `transition` süreleri `0.3s` olarak standartlaştırılıp eşitlendi.

### 2. Premium "Kayıt Ol" (Register) Sayfası
- Kayıt sayfası, basit görünümünden "Glassmorphism" (Buzlu cam / 3D Gölgeli) profesyonel görünüme geçirildi.
- Sayfa yüklenirken kutucukların ve form elemanlarının sırayla (staggered) belirmesini sağlayan modern CSS `@keyframes slideUpFade` animasyonları eklendi.
- Statik emoji (🚀) kaldırılarak, sistemin yapısını (veri ve analizleri) modern bir şekilde temsil eden katmanlı vektörel SVG logo eklendi ve gradyan destekli parlama efekti verildi.

### 3. Özel Bildirim Sistemi (Toast Notifications)
- Projedeki çirkin ve eski nesil varsayılan `alert()` fonksiyonları tamamen kaldırıldı.
- `ToastContext.js` mimarisi kurularak sayfanın üst-orta kısmından süzülerek çıkan bildirim kutucukları (Toasts) eklendi.
- Başarı, hata ve uyarı durumlarına özel renklerle tasarlanan bu bildirimler, temanın güncel durumuna (Dark/Light) göre renklerini otomatik ayarlamaktadır.

### 4. Admin Paneli Temizliği
- Sadece eski test amaçlı eklenmiş olan ve kullanılmayan ayrı `AdminPanel.jsx` dosyası ve `/admin` rotası projeden tamamen temizlendi.
- Sistem artık tam olarak tasarlandığı gibi, tek bir `Dashboard` üzerinden "Rol" (USER/ADMIN) yetkisine bağlı dinamik (öğe gizleyip gösterme) bir şemada çalışmaktadır.

### 5. Kod Mimarisi ve Dosya Yapılandırması (Refactoring)
- **API Merkezileştirme:** `src/utils/apiClient.js` kurularak tüm `fetch` istekleri tek bir merkezden (otomatik Base URL ve Authorization Token eklenerek) yönetilmeye başlandı.
- **Servis Katmanı:** Arayüz dosyalarında (Dashboard, Login vb.) kod kalabalığı yaratan ve dağınık halde bulunan API istekleri `src/services/authService.js` ve `src/services/companyService.js` dosyalarına modüler olarak taşındı. Sayfalar tamamen arayüze (UI) odaklı hale getirildi.
- **CSS Düzeni:** `pages` klasörü altındaki tüm dağınık CSS dosyaları merkezileştirilerek `src/assets/css` klasörü altına taşındı ve import bağlantıları güncellendi.
- **Merkezi Düzen (Layout) ve Topbar Entegrasyonu:** Tüm sayfalarda tekrar eden Sidebar/Topbar yapısı `DashboardLayout.jsx` bileşeninde birleştirildi. Eylem butonları sayfalardan alınıp Global Topbar'a taşınarak bütünlük sağlandı.
- **UI Bileşenleri ve Clean Code Revizyonu:** `Modal.jsx` için Portallar kullanıldı (Z-Index çözüldü). `FormInput.jsx` ile formlar standartlaştırıldı ve tüm satır içi (inline) CSS'ler harici CSS dosyalarına aktarıldı.
- **Modern Ayarlar Sayfası:** `Settings.jsx` sayfası kurumsal tasarıma kavuşturuldu; sadece güvenli şifre değiştirme ve bildirim aç/kapat (Switch) ayarlarını barındıracak şekilde optimize edildi.

### 6. Dinamik Kategori ve Gelişmiş Raporlama (08.04.2026)
- **Dinamik Kategori Sistemi:** Fatura ekleme formuna kategorize edilmiş seçim kutusu (Dropdown) ve anında yeni kategori eklemeyi sağlayan "+ Diğer" akışı eklendi.
- **Gelişmiş Analitik Grafikler:** Raporlar sayfasına "Gider Dağılımı (Daire Grafiği)" ve "Günlük Gelir/Gider Analizi (Alan Grafiği)" eklenerek finansal durumun görselleştirilmesi sağlandı.
- **Gerçek Zamanlı Veri Senkronizasyonu:** Fatura güncellendiğinde veya silindiğinde, Raporlar sayfasındaki grafiklerin ve özetlerin sayfa yenilenmesine gerek kalmadan anlık olarak güncellenmesi (`CustomEvent` ve `visibilitychange` dinleyicileri ile) sağlandı.

---

## ⚙️ Backend (Sunucu) Güncellemeleri

### 1. Şifre Doğrulama Sistemindeki Kritik Düzenlemeler
- `User.js` Mongoose modelindeki şifre kaydetme (`pre('save')`) yapısındaki hatalı doğrulama (validation) mekanizması çözüldü. Bu parça, yeni girişler veya şifre güncellemelerinde çakışma (500 Internal Server Error) yaratıyordu. Hata engellendi.

### 2. Admin Kullanıcısı Altyapısı
- Sorunlu ya da kayıp yönetici girişlerini düzeltmek için backend ortamına `regenerate_admin.js` adında özel bir betik (script) eklenip çalıştırılarak `admin@test.com` adında geçerli bir ana yönetici sisteme enjekte edildi.
- Yönetici sorunu çözüldükten sonra bu yardımcı / geçici (test) dosyalarının projede güvenlik açığı yaratmaması adına tümü tek bir komutla temizlendi.

### 3. Güvenli Token / Oturum Süreçleri
- `tokenService.js` ve `authMiddleware.js` parçalarındaki süreç kontrol edilerek teyit edildi. Uygulama, `jsonwebtoken` aracılığıyla API kapısında sıkı bir güvenlik profili uyguluyor. Yalnızca süresi dolmamış ve gerçekte hesabı banlanmamış (Aktif) kullanıcıların sisteme girmesine izin veriliyor.

### 4. API İletişim ve Token Hata Giderme (401 Sorunu)
- `NetworkService.js` üzerindeki HTTP metodlarının küçük-büyük harf uyumsuzluğu (POST/Get) giderildi. Böylece login sonrası 401 (Unauthorized) hatasına düşme problemi çözüldü.

### 5. Veritabanı Şifreleme (Bcrypt) İyileştirmeleri
- Veritabanındaki şifreleme mekanizması (`bcrypt`) ve `pre-save` kancalarındaki (hook) çakışmalar giderildi. Sisteme güvenli şifreleme ve MD5 uyumluluk altyapısı sağlamlaştırıldı.

### 6. Raporlama Altyapısı ve Yetkilendirme (08.04.2026)
- **Gelişmiş Veri Toplama (Aggregation Pipeline):** `$facet` ve `$addFields` operatörleri kullanılarak, tüm finansal istatistiklerin (Gelir, Gider, Kategori Dağılımı) tek bir veritabanı isteğiyle, yüksek performanslı bir şekilde getirilmesi sağlandı.
- **Tip Dönüşüm Güvenliği:** Eskiden string olarak tutulan kategori kimliklerinin, raporlama sırasında sorunsuz eşleşmesi için `$toObjectId` ile dinamik tip dönüşümü altyapısı kuruldu.
- **Rol Bazlı Yetki Genişletme:** `USER` (Standart Kullanıcı) rolündeki kişilerin kendi faturalarını güncelleyememe sorunu rota seviyesinde (`roleMiddleware`) çözüldü; artık her kullanıcı kendi verisini tam olarak yönetebilmektedir.
- **CORS ve Bağlantı Optimizasyonu:** Tarayıcı tarafındaki erişim engellerini kökten çözmek için CORS yapılandırması middleware sıralamasında en başa çekilerek sunucu yanıt kararlılığı artırıldı.

---

## 📱 Mobile App (Flutter) Güncellemeleri (27.04.2026)

### 1. Kullanıcı Deneyimi ve Arayüz (UI/UX) İyileştirmeleri
- **Açılış Akışı (Startup Flow)**: Uygulama ilk açıldığında Dashboard yerine kısa süreliğine Login ekranının görünmesi (flicker) sorunu çözüldü. Artık yetki kontrolü bitene kadar şık bir yükleme ekranı gösteriliyor.
- **Klavye Taşma (Overflow) Sorunu**: Giriş ekranında klavye açıldığında oluşan sarı çizgili (Bottom Overflow) görsel hata, formun kaydırılabilir (Scrollable) hale getirilmesiyle giderildi.
- **Navigasyon Temizliği**: Kullanıcı zaten Dashboard üzerindeyken yan menüdeki (Drawer) gereksiz "Dashboard" linki kaldırılarak kafa karışıklığı önlendi.
- **Dinamik Kategori Seçimi**: Fatura ekleme ekranındaki kategori listesi, çok sayıda kategori olduğunda ekranı kaplamaması için 5 öğe ile sınırlandırıldı ve kaydırılabilir (Scroll) hale getirildi.

### 2. Analiz ve Raporlama (Charts)
- **Haftalık Gelir/Gider Analizi**: Ana sayfadaki grafik, son 4 haftalık veriyi (Bu hafta, Geçen hafta, vb.) baz alacak şekilde güncellendi. Tarih bazlı akıllı gruplama sayesinde veriler arası boşluklar olsa bile grafik artık doğru takvim haftasını gösteriyor.
- **Kategori Bazlı Raporlar**: Gelir ve gider dağılımını gösteren detaylı pasta (Pie) grafikleri ana sayfadan yeni oluşturulan "Raporlar" ekranına taşındı. Bu sayede ana sayfa daha sade, raporlar ise daha detaylı hale getirildi.
- **Gelişmiş Görsel Estetik**: Grafikler; gradyan renk geçişleri, daha kalın sütunlar ve temizlenmiş eksenler ile mobil cihazlarda daha okunabilir hale getirildi.

### 3. Profil ve Güvenlik Yönetimi
- **Profil Güncelleme**: Kullanıcıların ad, soyad ve e-posta bilgilerini doğrudan uygulama üzerinden güncelleyebileceği yeni bir Profil ekranı eklendi.
- **Şifre Değiştirme**: Güvenlik ayarları altında kullanıcıların mevcut şifrelerini doğrulayarak yeni şifre belirleyebilecekleri güvenli bir akış oluşturuldu.

---

## 🛠️ Web & Backend (Polishing & Robustness) (27.04.2026)

### 1. Web Paneli Arayüz Refactoring
- **Aydınlık Mod (Light Mode) Uyumu**: Tüm panelin aydınlık mod renkleri; Slate ve Indigo tonları kullanılarak daha premium ve göz yormayan bir yapıya kavuşturuldu.
- **Fatura Arama ve Filtreleme**: 
    - Fatura listesine; fno, açıklama ve firma ismine göre anlık çalışan bir **Arama Çubuğu** eklendi.
    - Standart tarayıcı seçim kutuları yerine, modern ve temiz bir görünüm sunan **Özel Açılır Menü (Custom Dropdown)** tasarlandı.
    - Tasarımı sadeleştirmek adına arama ve filtreleme alanlarındaki tüm gereksiz ikonlar temizlendi.
- **Z-Index Çözümleri**: Filtre menüsünün fatura kartlarının altında kalması sorunu, katman yönetimi (Z-index) ve pozisyonlama iyileştirmeleriyle çözüldü.
- **Personel Yönetimi**: Tablo başlıkları (th), açık modda sayfa ile daha uyumlu ve belirgin olması için hafif gri tonlu bir arka plana kavuşturuldu.

### 2. Hata Yönetimi ve Performans
- **Bildirim (Toast) Tekilleştirme**: Sunucu kapalıyken veya internet kesildiğinde üst üste binen onlarca hata bildirimini engellemek için `ToastContext` içerisine "aynı mesajı tekrar gösterme" kontrolü eklendi.
- **Merkezi Veri Çekme**: Sayfa ilk yüklenirken atılan çoklu API istekleri birleştirildi. Artık sunucu kapalıysa onlarca ayrı hata yerine tek bir anlamlı uyarı gösteriliyor.

### 3. Backend ve API Geliştirmeleri
- **İstatistik Algoritması Fix**: Dashboard istatistiklerinin en yeni veriler yerine en eskileri getirmesine neden olan sıralama hatası düzeltildi. Artık grafikler her zaman **en güncel son 60 günü** baz alıyor.
- **Güvenli Profil API**: Kullanıcının kendi bilgilerini güncellemesi ve şifre değiştirmesi için gerekli `update-profile` ve `change-password` uç noktaları (endpoints) yetkilendirme katmanıyla birlikte eklendi.
- **Tarih Senkronizasyonu**: Mobil grafiklerin takvimle tam uyumlu çalışması için istatistik API'sine ham tarih (Date object) çıktısı eklendi.

