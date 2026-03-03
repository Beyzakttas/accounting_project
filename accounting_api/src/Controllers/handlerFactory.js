import MESSAGES from '../Utils/messages.js';

export const deleteOne = (Model) => async (req, res) => {
    try {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Belirtilen ID ile kayıt bulunamadı'
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
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Belirtilen ID ile kayıt bulunamadı'
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
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Belirtilen ID ile kayıt bulunamadı'
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
        const docs = await Model.find();

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
