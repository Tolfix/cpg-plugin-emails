require("dotenv").config();
const BuildDir = process.cwd() + "/build";
// @ts-ignore
import type { ILoggingTypes } from "@cpg/Interfaces/Logging.interface";
// @ts-ignore
import type mainEvent from "@cpg/Events/Main.event";
// @ts-ignore
import type { server } from "@cpg/Server/Server"; 
// @ts-ignore
import type cs from "@cpg/Database/Models/Customers/Customer.model";
// @ts-ignore
import type pm from "@cpg/Database/Models/Products.model";
// @ts-ignore
import type { sendEmail as sE } from "@cpg/Email/Send"
import config from "../config.json";

// Change name of the class.
export = async function main()
{
    const Logger = (await import(`${BuildDir}/Lib/Logger`)).default as ILoggingTypes;
    const MainEvent = (await import(`${BuildDir}/Events/Main.event`)).default as typeof mainEvent;
    const Server = (await import(`${BuildDir}/Server/Server`)).server as typeof server;
    const sendEmail = (await import(`${BuildDir}/Email/Send`)).sendEmail as typeof sE;
    const CustomerModel = (await import(`${BuildDir}/Database/Models/Customers/Customer.model`)).default as typeof cs;
    const ProductModel = (await import(`${BuildDir}/Database/Models/Products.model`)).default as typeof pm;
    Logger.info(`Starting ${config.name} plugin with version ${config.version}.`);

    const module_name = "cpg-plugin-emails";
    const module_attr = {
        header_text: "Header text file for product",
    }

    Server.get(`/modules/${module_name}`, (req, res) =>
    {
        res.send(module_attr);
    });

    MainEvent.on(`invoice_paid`, async (invoice) =>
    {
        const customer = await CustomerModel.findOne({ $or: [
            { uid: invoice.customer_uid },
            { id: invoice.customer_uid }
        ] });
        if(!customer)
            return;
        // find all products in the invoice.items..product_id
        const products = await ProductModel.find({ id: { $in: invoice.items.map(i => i.product_id) } });
        Logger.debug(`Found ${products.length} products in invoice.`);
        // Check if any of the products has module.
        // Filter them
        const mProducts = products.filter(p => p.module_name.includes(module_name));
        Logger.debug(`Found ${mProducts.length} products with module.`);
        if(mProducts.length <= 0)
            return;

        mProducts.forEach(p =>
        {
            // Get header_text from p.modules
            const header_text = p.modules.find(m => m.name === "header_text");
            if(!header_text)
                return;
            Logger.debug(`Found header_text: ${header_text.value}`);
            sendEmail({
                receiver: customer?.personal.email,
                subject: `Product specific email`,
                body: {
                    body: `<h1>${header_text.value}</h1>`,
                }
            })
        });
    });
}
