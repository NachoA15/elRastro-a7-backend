const axios = require('axios')

let tokenLog = [];

/**
 * Busca la información del token en el log
 * @param token Token a buscar
 * @returns {null|*}
 */
const searchToken = (token) => {
    let i = 0;
    while (i < tokenLog.length && tokenLog[i].token !== token) {
        i++;
    }
    return i >= tokenLog.length? null : {index: i, tokenData: tokenLog[i]};
}

/**
 *  Verifica el token que recibe como parámetro mediante la API REST de Google
 * @param token
 * @returns {Promise<axios.AxiosResponse<any>|*>}
 */
const verifyGoogleToken = async (token) => {
    try {
        return await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`)
            .then((result) => {
                return result.data;
            });
    } catch (error) {
        return error.response.data;
    }
}

const deleteTokenFromLog = (token) => {
    const tokenData = searchToken(token);
    if (tokenData !== null) {
        tokenLog.splice(tokenData.index, 1);
    }
}

/**
 * Comprueba que el usuario al que pertenece el token tiene los permisos necesarios para realizar la operación
 * solicitada.
 * @param tokenData
 * @param method
 * @param userEmail
 * @returns {boolean}
 */
const checkPermission = (tokenData, method, userEmail) => {
    return !(typeof userEmail !== 'undefined' &&
        (method === 'PUT' || method === 'DELETE') && tokenData.email !== userEmail);
}

const checkGoogleToken = async (token) => {
    const tokenData = searchToken(token);
    const currentTimestampSec = Date.now() / 1000;

    // Comprueba si los datos del token ya están en el log
    if (tokenData == null) {   // En caso de que no lo esté
        const res = await verifyGoogleToken(token); // Se verifica mediante la API REST de Google
        if (!res.error) {
            // Si no hay ningún error se guarda la información del token en el log
            const tokenExpirationTimestamp = currentTimestampSec + res.expires_in;
            const newTokenData = {token: token, expiration: tokenExpirationTimestamp, email: res.email};
            tokenLog.push(newTokenData);

            /* Si el token se ha verificado con éxito, se comprueba que el usuario que ha enviado el token
            * tiene permisos para realizar la operación */
            return 'ok';
        } else {
            // Si hay error se devuelve el mensaje informativo
            return 'Token Error: ' + res.error_description;
        }
    } else {    // En caso de que el token esté en el log
        // Se comprueba la expiración del token
        if (currentTimestampSec > tokenData.tokenData.expiration) {
            // Si el token ha expirado se borra del log
            tokenLog.splice(tokenData.index, 1);
            return 'El token ha expirado.';
        }

        /* Si el token se ha verificado con éxito, se comprueba que el usuario que ha enviado el token
        * tiene permisos para realizar la operación */
        return 'ok';
    }
}

module.exports = {checkGoogleToken, deleteTokenFromLog}