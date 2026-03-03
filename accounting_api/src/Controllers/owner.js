import User from '../Models/User.js';
import Company from '../Models/Company.js';
import Invoice from '../Models/Invoice.js';
import MESSAGES from '../Utils/messages.js';

const ownerController = {
    // 1. Create Staff account
    createStaff: async (req, res) => {
        // Only MANAGERS should do this (enforced by roleMiddleware)
        const { name, email, password, department } = req.body;

        // In our authMiddleware, we set req.user from JWT
        const ownerCompanyId = req.user.companyId;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: MESSAGES.CONTROLLERS.OWNER.EMAIL_EXISTS });
            }

            const newStaff = new User({
                name,
                email,
                password, // Naive storage as per existing codebase
                role: 'USER',
                companyId: ownerCompanyId,
                department: department || 'Diger', // Add department option
                isActive: true
            });

            await newStaff.save();
            res.status(201).json({
                message: MESSAGES.CONTROLLERS.OWNER.STAFF_CREATED,
                staff: { id: newStaff._id, name: newStaff.name, email: newStaff.email }
            });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.CONTROLLERS.OWNER.SERVER_ERROR, error: error.message });
        }
    },

    // 2. View all staff in the company
    getCompanyStaff: async (req, res) => {
        const ownerCompanyId = req.user.companyId;

        try {
            const staffList = await User.find({ companyId: ownerCompanyId, role: 'USER' })
                .select('-password'); // exclude password
            res.json(staffList);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.CONTROLLERS.OWNER.SERVER_ERROR, error: error.message });
        }
    },

    // 3. View all invoices belonging to their companyId only
    getCompanyInvoices: async (req, res) => {
        const ownerCompanyId = req.user.companyId;

        try {
            // In a real app we might want pagination
            const invoices = await Invoice.find({ companyId: ownerCompanyId })
                .populate('uploadedBy', 'name email')
                .sort({ createdAt: -1 });
            res.json(invoices);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.CONTROLLERS.OWNER.SERVER_ERROR, error: error.message });
        }
    },

    // 4. Update company specific settings
    updateSettings: async (req, res) => {
        const ownerCompanyId = req.user.companyId;
        const { settings } = req.body;

        try {
            const company = await Company.findById(ownerCompanyId);
            if (!company) {
                return res.status(404).json({ message: MESSAGES.CONTROLLERS.OWNER.COMPANY_NOT_FOUND });
            }

            company.settings = { ...company.settings, ...settings };
            await company.save();

            res.json({ message: MESSAGES.CONTROLLERS.OWNER.SETTINGS_UPDATED, settings: company.settings });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.CONTROLLERS.OWNER.SERVER_ERROR, error: error.message });
        }
    },

    // 5. Create a new Category for the Company
    createCategory: async (req, res) => {
        const ownerCompanyId = req.user.companyId;
        const { name } = req.body;

        try {
            const { default: Category } = await import('../Models/Category.js');
            // Check if category already exists for this company
            const existingCategory = await Category.findOne({ name, companyId: ownerCompanyId });
            if (existingCategory) {
                return res.status(400).json({ message: MESSAGES.CONTROLLERS.OWNER.CATEGORY_EXISTS });
            }

            const newCategory = new Category({
                name,
                companyId: ownerCompanyId
            });
            await newCategory.save();

            res.status(201).json({ message: MESSAGES.CONTROLLERS.OWNER.CATEGORY_CREATED, category: newCategory });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.CONTROLLERS.OWNER.SERVER_ERROR, error: error.message });
        }
    },

    // 6. Get all Categories for the Company
    getCategories: async (req, res) => {
        const ownerCompanyId = req.user.companyId;

        try {
            const { default: Category } = await import('../Models/Category.js');
            const categories = await Category.find({ companyId: ownerCompanyId });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.CONTROLLERS.OWNER.SERVER_ERROR, error: error.message });
        }
    }
};

export default ownerController;
