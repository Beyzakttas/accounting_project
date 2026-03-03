import Company from '../Models/Company.js';
import User from '../Models/User.js';
import bcrypt from 'bcryptjs'; // Assuming we add bcrypt soon? Or I should just use plain for now since authController has password !== user.password
import MESSAGES from '../Utils/messages.js';

const adminController = {
    // 1. Create a new company and its Owner
    createCompanyWithOwner: async (req, res) => {
        const { companyName, quota, ownerName, ownerEmail, ownerPassword } = req.body;

        try {
            // Check if company or owner email already exists
            const existingCompany = await Company.findOne({ name: companyName });
            if (existingCompany) {
                return res.status(400).json({ message: MESSAGES.CONTROLLERS.ADMIN.COMPANY_EXISTS });
            }

            const existingUser = await User.findOne({ email: ownerEmail });
            if (existingUser) {
                return res.status(400).json({ message: MESSAGES.CONTROLLERS.ADMIN.OWNER_EXISTS });
            }

            // Create company
            const newCompany = new Company({
                name: companyName,
                quota: quota || 100
            });
            await newCompany.save();

            // Create Owner user
            // Assuming naive password storage for now as in authController.
            // In a real app we would use bcrypt.hash
            const newOwner = new User({
                name: ownerName,
                email: ownerEmail,
                password: ownerPassword,
                role: 'MANAGER',
                companyId: newCompany._id
            });
            await newOwner.save();

            res.status(201).json({
                message: MESSAGES.CONTROLLERS.ADMIN.COMPANY_CREATED,
                company: newCompany,
                owner: { id: newOwner._id, name: newOwner.name, email: newOwner.email }
            });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.CONTROLLERS.ADMIN.SERVER_ERROR, error: error.message });
        }
    },

    // 2. Manage Quota & Subscriptions
    updateCompanyQuota: async (req, res) => {
        const { id } = req.params;
        const { quota, isActive, subscriptionEndDate } = req.body;

        try {
            const company = await Company.findById(id);
            if (!company) {
                return res.status(404).json({ message: MESSAGES.CONTROLLERS.ADMIN.COMPANY_NOT_FOUND });
            }

            if (quota !== undefined) company.quota = quota;
            if (isActive !== undefined) company.isActive = isActive;
            if (subscriptionEndDate !== undefined) company.subscriptionEndDate = subscriptionEndDate;

            await company.save();
            res.json({ message: MESSAGES.CONTROLLERS.ADMIN.COMPANY_UPDATED, company });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.CONTROLLERS.ADMIN.SERVER_ERROR, error: error.message });
        }
    },

    // 3. List all companies (System Health / Overview)
    getAllCompanies: async (req, res) => {
        try {
            const companies = await Company.find();
            res.json(companies);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.CONTROLLERS.ADMIN.SERVER_ERROR, error: error.message });
        }
    }
};

export default adminController;
