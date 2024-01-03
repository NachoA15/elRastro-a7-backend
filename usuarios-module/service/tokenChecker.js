const ServiceUsuario = require('./usuarioService')
const serviceUsuario = new ServiceUsuario();

const axios = require('axios')

let tokenLog = [];

const searchToken = (token) => {
    let i = 0;
    while (i < tokenLog.length && tokenLog[i].token !== token) {
        i++;
    }
    return i >= tokenLog.length? null : {index: i, tokenData: tokenLog[i]};
}

const verifyGoogleToken = async (token) => {
    try {
        return await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`)
            .then((result) => {
                return {status: 200, data: result.data};
            });
    } catch (error) {
        return {status: 400, data: error.response.data.error_description};
    }
}

const createOrUpdateUserFromToken = async (data) => {
    const usuario = await serviceUsuario.getUsuarioByCorreo(data.email);
    if (usuario === null || typeof usuario === 'undefined') {
        return await serviceUsuario.createUsuario(
            {
                nombre: data.name,
                email: data.email,
                imagen: data.picture
            }
        );
    } else {
        if (usuario.nombre !== data.name || typeof usuario.imagen === 'undefined' || usuario.imagen !== data.picture) {
            await serviceUsuario.updateUsuario(data.email, data.name, data.picture);
        }
    }
}

const deleteTokenFromLog = async (token) => {
    const tokenData = searchToken(token);

    if (tokenData !== null) {
        tokenLog.splice(tokenData.index, 1);
    }

    return 'ok';
}

const checkNewToken = async (token) => {
    const res = await verifyGoogleToken(token);
    if (res.status === 200) {
        await createOrUpdateUserFromToken(res.data);

        const currentTimestampSec = Date.now() / 1000;
        const tokenExpirationTimestamp = currentTimestampSec + res.data.expires_in;
        tokenLog.push({token: token, expiration: tokenExpirationTimestamp, email: res.data.email});
        return {status: 200, message: {email: res.data.email, token: token}};
    }
    return {status: 401, message: 'Acceso no autorizado. Token error: ' + res.data};
}

const checkTokenInLog = async (token) => {
    const tokenData = searchToken(token);
    if (tokenData !== null) {
        const currentTimestampSec = Date.now() / 1000;
        if (currentTimestampSec > tokenData.tokenData.expiration) {
            tokenLog.splice(tokenData.index, 1);
            return {status: 401, message: 'El token ha expirado'};
        }
        return {status: 200, message: 'Token correcto'};
    }
    return {status: 401, message: 'El token no es válido'};
}

module.exports = {checkNewToken, checkTokenInLog, deleteTokenFromLog}