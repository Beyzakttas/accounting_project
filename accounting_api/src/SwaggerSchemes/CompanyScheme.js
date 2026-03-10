/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - taxNumber
 *         - phone
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: Otomatik oluşturulan şirket ID'si
 *         name:
 *           type: string
 *           description: Şirket adı (benzersiz)
 *         address:
 *           type: string
 *           description: Şirket adresi
 *         taxNumber:
 *           type: string
 *           description: Vergi numarası (benzersiz)
 *         phone:
 *           type: string
 *           description: Telefon numarası
 *         email:
 *           type: string
 *           format: email
 *           description: Şirket e-posta adresi (benzersiz)
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Şirketin aktiflik durumu
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncellenme tarihi
 */
