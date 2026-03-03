import Invoice from '../Models/Invoice.js';
import {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOne
} from './handlerFactory.js';

const invoiceController = {
  getAllInvoices: getAll(Invoice),
  getInvoice: getOne(Invoice),
  createInvoice: createOne(Invoice),
  updateInvoice: updateOne(Invoice),
  deleteInvoice: deleteOne(Invoice),
};

export default invoiceController;