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
            expiresIn: '1d', // Token'ın geçerlilik süresi (1 gün)
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
