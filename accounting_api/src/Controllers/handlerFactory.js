import MESSAGES from '../Utils/messages.js';

export const deleteOne = (Model) => async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role !== 'ADMIN') {
            query.companyId = req.user.companyId;
            // EĞER USER İSE SADECE KENDİ YÜKLEDİĞİNİ SİLEBİLSİN (Daha güvenli senaryo)
            if (req.user.role === 'USER' && Model.schema.paths.uploadedBy) {
                query.uploadedBy = req.user._id;
            }
        }

        const doc = await Model.findOneAndDelete(query);

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Belirtilen ID ile kayıt bulunamadı veya bu işlem için yetkiniz yok'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Kayıt başarıyla silindi',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateOne = (Model) => async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role !== 'ADMIN') {
            query.companyId = req.user.companyId;
            // EĞER USER İSE SADECE KENDİ YÜKLEDİĞİNİ GÜNCELLEYEBİLSİN
            if (req.user.role === 'USER' && Model.schema.paths.uploadedBy) {
                query.uploadedBy = req.user._id;
            }
            // Kullanıcının kendi companyId'sini veya yükleyiciyi değiştirmesini engelle
            delete req.body.companyId;
            delete req.body.uploadedBy;
        }

        const doc = await Model.findOneAndUpdate(query, req.body, {
            new: true,
            runValidators: true
        });

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Belirtilen ID ile kayıt bulunamadı veya bu işlem için yetkiniz yok'
            });
        }

        res.status(200).json({
            success: true,
            data: doc
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const createOne = (Model) => async (req, res) => {
    try {
        // Otomatik olarak kullanıcının şirketini ve kendisini ekle (Admin değilse)
        if (req.user.role !== 'ADMIN') {
            req.body.companyId = req.user.companyId;
            if (Model.schema.paths.uploadedBy) {
                req.body.uploadedBy = req.user._id;
            }
        }

        const newDoc = await Model.create(req.body);

        res.status(201).json({
            success: true,
            data: newDoc
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getOne = (Model, popOptions) => async (req, res) => {
    try {
        const queryFilter = { _id: req.params.id };
        if (req.user.role !== 'ADMIN') {
            queryFilter.companyId = req.user.companyId;
            // USER ise sadece kendi yüklediğini görsün
            if (req.user.role === 'USER' && Model.schema.paths.uploadedBy) {
                queryFilter.uploadedBy = req.user._id;
            }
        }

        let query = Model.findOne(queryFilter);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Belirtilen ID ile kayıt bulunamadı veya bu işlem için yetkiniz yok'
            });
        }

        res.status(200).json({
            success: true,
            data: doc
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAll = (Model) => async (req, res) => {
    try {
        const filter = {};
        if (req.user && req.user.role !== 'ADMIN') {
            filter.companyId = req.user.companyId;
            // USER ise sadece kendi yüklediği faturaları görsün (Senaryo B)
            if (req.user.role === 'USER' && Model.schema.paths.uploadedBy) {
                filter.uploadedBy = req.user._id;
            }
        }

        const docs = await Model.find(filter);

        res.status(200).json({
            success: true,
            results: docs.length,
            data: docs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
