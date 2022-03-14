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
import config from "../config.json";

// Change name of the class.
export = async function main()
{
    const Logger = await import(`${BuildDir}/lib/Logger`) as ILoggingTypes;
    const MainEvent = await import(`${BuildDir}/Events/Main.event`) as typeof mainEvent;
    const Server = await import(`${BuildDir}/Server`) as typeof server;
    const CustomerModel = await import(`${BuildDir}/Database/Models/Customer/Customer.model`) as typeof cs;
    Logger.info(`Starting ${config.name} plugin with version ${config.version}.`);
}
