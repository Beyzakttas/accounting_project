/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required:
 *         - companyId
 *         - uploadedBy
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: Otomatik oluşturulan fatura ID'si
 *         companyId:
 *           type: string
 *           description: Faturanın ait olduğu şirket ID'si
 *         uploadedBy:
 *           type: string
 *           description: Faturayı yükleyen kullanıcı ID'si
 *         amount:
 *           type: number
 *           description: Fatura tutarı
 *         taxAmount:
 *           type: number
 *           default: 0
 *           description: Vergi tutarı
 *         category:
 *           type: string
 *           description: Fatura kategorisi ID'si
 *         paymentType:
 *           type: string
 *           description: Ödeme türü
 *         vendor:
 *           type: string
 *           description: Satıcı bilgisi
 *         status:
 *           type: string
 *           enum: [Pending, Processed, Rejected]
 *           default: Pending
 *           description: Fatura durumu
 *         imageUrl:
 *           type: string
 *           description: Fatura görselinin URL'si
 *         n8nSource:
 *           type: boolean
 *           default: false
 *           description: Faturanın n8n üzerinden gelip gelmediği
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncellenme tarihi
 */
