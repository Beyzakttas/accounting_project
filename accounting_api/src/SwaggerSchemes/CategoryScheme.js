/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - companyId
 *       properties:
 *         id:
 *           type: string
 *           description: Otomatik oluşturulan kategori ID'si
 *         name:
 *           type: string
 *           description: Kategori adı
 *         companyId:
 *           type: string
 *           description: Kategorinin ait olduğu şirket ID'si
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncellenme tarihi
 */
