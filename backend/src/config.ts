import dotenv from "dotenv";
dotenv.config();

function getEnvVariable(key: string, required = true): string {
    const value = process.env[key];
    if(!value && required){
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value!;
}

export const config = {
    PORT: parseInt(getEnvVariable("PORT")),
    jwtSecret: getEnvVariable("JWT_PASS"),
    mongoUri: getEnvVariable("MONGO_URI"),
    clientUrl: getEnvVariable("CLIENT_URL"),
}