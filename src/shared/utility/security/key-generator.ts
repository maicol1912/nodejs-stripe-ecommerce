import * as crypto from 'crypto-js';
import config from "config";
//import * as bcrypt from 'bcryptjs';


export function encrypt(text: string): string {
    const encrypted = crypto.AES.encrypt(text, config.get('saltKey')).toString();
    return encrypted;
}

export function decrypt(encrypted: string): string {
    const decrypted = crypto.AES.decrypt(encrypted, config.get('saltKey')).toString(crypto.enc.Utf8);
    return decrypted;
}

export function encryptObject(objectToEncrypt: object, encryptKey = false): { [key: string]: any } {
    const objectToReturn: any = {};
    Object.entries(objectToEncrypt).forEach(([key, value]) => {
        const newValue = this.encrypt(value);
        objectToReturn[encryptKey ? this.encrypt(key) : key] = newValue;
    });
    return objectToReturn;
}

export function decryptObject(objectToDecrypt: object, decryptKey = false): object {
    const objectToReturn: any = {};
    Object.entries(objectToDecrypt).forEach(([key, value]) => {
        const newValue = this.decrypt(value);
        const newKey = this.decrypt(key);
        objectToReturn[decryptKey ? this.decrypt(key) : key] = newValue;
    });
    return objectToReturn;
}
