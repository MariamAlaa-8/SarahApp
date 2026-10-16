import bcrypt from "bcrypt";
import argon2 from "argon2";

export const hash = async ({
    plaintext,
    rounds = 12,
    minor = "b",
    approach = "bcrypt"
} = {}) => {
    let cipherText = "";

    switch (approach) {
        case "bcrypt": {
            const salt = await bcrypt.genSalt(rounds, minor);
            cipherText = await bcrypt.hash(plaintext, salt);
            break;
        }
        case "argon2": {
            cipherText = await argon2.hash(plaintext)
            break
        }
        default: {
            break;
        }
    }

    return cipherText;
}

export const compare = async (plaintext, cipherText, approach = "bcrypt") => {
    let match = false;

    switch (approach) {
        case "bcrypt": {
            match = await bcrypt.compare(plaintext, cipherText);
            break;
        }
        case "argon2": {
            match = await argon2.verify(cipherText, plaintext);
            break;
        }
        default: {
            break;
        }
    }

    return match;
}