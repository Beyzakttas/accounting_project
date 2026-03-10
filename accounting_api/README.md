# Muhasebe Backend Projesi


## Yapılan Son Değişiklikler

* **ES Modules (ESM) Geçişi:** Proje genelinde kullanılan CommonJS (`require() / module.exports`) yapısı terkedilerek modern ES Modules (`import / export default`) standartına geçilmiştir. `package.json` içerisine `"type": "module"` özelliği eklenmiştir.
* **Hata / Uyarı Mesajlarının Merkezileştirilmesi:** `Models`, `Controllers` ve `Middlewares` içerisinde yer alan tüm sabit (hardcoded) hata, uyarı ve bilgilendirme metinleri kod içerisinden arındırılmış ve `src/Utils/messages.js` dizininde oluşturulan yardımcı bir dosyada merkezileştirilmiştir. Bu sayede mesajların yönetimi ve ileride çoklu dil (i18n) desteği eklenmesi kolaylaştırılmıştır.
* **Dinamik Import Hatalarının Giderilmesi:** `Owner` controller'ında yaşanan döngüsel veya asenkron model yükleme problemleri, dinamik asenkron `import()` sözdizimi ile kurallara uygun şekilde çözülmüş ve sunucu başarılı bir şekilde ayağa kaldırılmıştır.