/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - fullname
 *         - email
 *         - password
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: Otomatik oluşturulan kullanıcı ID'si
 *         fullname:
 *           type: string
 *           description: Kullanıcının tam adı
 *         email:
 *           type: string
 *           format: email
 *           description: Kullanıcının e-posta adresi (benzersiz)
 *         password:
 *           type: string
 *           format: password
 *           description: Kullanıcının şifresi (en az 8 karakter, karmaşık yapı)
 *         role:
 *           type: string
 *           enum: [ADMİN, MANAGER, USER]
 *           default: USER
 *           description: Kullanıcı rolü
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Kullanıcının aktiflik durumu
 *         department:
 *           type: string
 *           enum: [Satis, Pazarlama, Insan Kaynaklari, IT, Yonetim, Diger]
 *           default: Diger
 *           description: Kullanıcının çalıştığı departman
 *         companyId:
 *           type: string
 *           description: Kullanıcının bağlı olduğu şirket ID'si
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncellenme tarihi
 */
