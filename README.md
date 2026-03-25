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

---

## ⚙️ Backend (Sunucu) Güncellemeleri

### 1. Şifre Doğrulama Sistemindeki Kritik Düzenlemeler
- `User.js` Mongoose modelindeki şifre kaydetme (`pre('save')`) yapısındaki hatalı doğrulama (validation) mekanizması çözüldü. Bu parça, yeni girişler veya şifre güncellemelerinde çakışma (500 Internal Server Error) yaratıyordu. Hata engellendi.

### 2. Admin Kullanıcısı Altyapısı
- Sorunlu ya da kayıp yönetici girişlerini düzeltmek için backend ortamına `regenerate_admin.js` adında özel bir betik (script) eklenip çalıştırılarak `admin@test.com` adında geçerli bir ana yönetici sisteme enjekte edildi.
- Yönetici sorunu çözüldükten sonra bu yardımcı / geçici (test) dosyalarının projede güvenlik açığı yaratmaması adına tümü tek bir komutla temizlendi.

### 3. Güvenli Token / Oturum Süreçleri
- `tokenService.js` ve `authMiddleware.js` parçalarındaki süreç kontrol edilerek teyit edildi. Uygulama, `jsonwebtoken` aracılığıyla API kapısında sıkı bir güvenlik profili uyguluyor. Yalnızca süresi dolmamış ve gerçekte hesabı banlanmamış (Aktif) kullanıcıların sisteme girmesine izin veriliyor.
