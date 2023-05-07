import dotenv from "dotenv";

dotenv.config();

const configParams = {
    port: process.env.PORT,
    host: process.env.HOST,
    dbUrl: process.env.MONGO_URL,
    db: process.argv[2],
    mail: process.env.MAIL_ADMIN,
    timeSession: process.env.TIME_SESSION,

};

export default configParams;