import jwt from 'jsonwebtoken';

class TokenService {
    /**
     * Token oluşturma işlemi.
     * "şifre gizleme" adımı burada JWT Payload kısmında şifrelenerek saklanır.
     * NOT: Güvenlik gereği JWT içine asla kullanıcı parolasını koymuyoruz, 
     * ancak kimlik, rol ve isim (username/fullname) gibi bilgileri burada gizliyoruz (imzalıyoruz).
     * 
     * @param {Object} payload Token içerisine eklenecek gizli veriler (id, role, fullname)
     * @returns {string} Üretilen (imzalanan) erişim token'ı
     */
    static generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
            expiresIn: '15m', // Access token'ın geçerlilik süresi (15 dakika - Güvenlik için kısa tutuldu)
        });
    }

    /**
     * Refresh Token oluşturma işlemi.
     * Genellikle daha uzun süreli (örn. 7 gün) ve DB'de saklanarak kontrol edilir.
     * 
     * @param {Object} payload 
     * @returns {string}
     */
    static generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'refresh_fallback_secret', {
            expiresIn: '7d', // Refresh token'ın geçerlilik süresi (7 gün)
        });
    }

    /**
     * Gelen token'ı çözer (Verileri geri okuma / Şifre Çözme işlemi).
     * İmza kontrolü yapar, başarılı olursa içerideki "username" vb. bilgileri okur çıkartır.
     * 
     * @param {string} token İstekten gelen Authorization Bearer Token
     * @returns {Object|null} Başarılıysa çözülmüş veri (decoded payload), başarısızsa null
     */
    static verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            return decoded;
        } catch (error) {
            return null; // Token süresi bitmiş veya uydurma (geçersiz) bir token girilmişse
        }
    }

    /**
     * Refresh Token doğrulama işlemi.
     * 
     * @param {string} token 
     * @returns {Object|null}
     */
    static verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refresh_fallback_secret');
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * Token'ın geçerliliğini doğrulamadan sadece içindeki Username/Role gibi verileri 
     * okumak (decode etmek) istenirse kullanılır.
     * 
     * @param {string} token 
     * @returns {Object|null}
     */
    static decodeToken(token) {
        return jwt.decode(token);
    }
}

export default TokenService;
