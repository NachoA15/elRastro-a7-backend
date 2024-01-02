const ServiceUsuario = require('../service/usuarioService');
const serviceUsuario = new ServiceUsuario();

const {checkNewToken, checkTokenInLog, deleteTokenFromLog} = require('../service/tokenChecker')

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const createUsuarioController = async (req, res, next) => {
    if (!req.body){
        return res.status(400).json({
            error: "El usuario no existe"
        })
    }
    try{
        const tokenCheck = await checkTokenInLog(req.headers.authorization);

        if (tokenCheck.status < 200 && tokenCheck.status > 299) {
            res.status(tokenCheck.status).send(tokenCheck.message)
        } else {
            const usuario = await serviceUsuario.createUsuario(req.body);
            if (usuario.message !== 'ok') {
                res.status(409).send({message: usuario.message});
            } else {
                res.status(201).send({
                    message: "Usuario " + usuario.usuario.correo + " creado con éxito",
                    usuario: usuario.usuario
                });
            }
        }
    }catch (error) {
        res.status(500).send({success: false, message: error.message});
    }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getUsuarioByIdController = async (req, res, next) => {
    try{
        const tokenCheck = await checkTokenInLog(req.headers.authorization);

        if (tokenCheck.status < 200 && tokenCheck.status > 299) {
            res.status(tokenCheck.status).send(tokenCheck.message)
        } else {
            if (req.query.nombre) {
                usuario = await serviceUsuario.getUsuarioByNombre(req.query.nombre)
            } else if (req.query.correo) {
                usuario = await serviceUsuario.getUsuarioByCorreo(req.query.correo)
            } else {
                usuario = await serviceUsuario.getUsuarios()
            }

            res.status(200).send(usuario);
        }
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteUsuarioController = async (req, res, next) => {
    try{
        const response = await serviceUsuario.deleteUsuario(req.params.correo, req.headers.authorization)
        res.status(response.status).send(response.res);
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateUsuarioController = async (req, res, next) => {
    try{
        const tokenCheck = await checkTokenInLog(req.headers.authorization);

        if (tokenCheck.status < 200 && tokenCheck.status > 299) {
            res.status(tokenCheck.status).send(tokenCheck.message)
        } else {
            const response = await serviceUsuario.updateUsuario(req.body.id, req.body.nombre, req.body.correo)
            if (response === null) {
                res.status(400).send("El usuario que quiere actualizar no existe");
            } else {
                res.status(200).send({usuario: response});
            }
        }
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateValoracionController = async (req, res, next) => {
    try{
        const tokenCheck = await checkTokenInLog(req.headers.authorization);

        if (tokenCheck.status < 200 && tokenCheck.status > 299) {
            res.status(tokenCheck.status).send(tokenCheck.message)
        } else {
            const response = await serviceUsuario.checkValoracion(req.body.valorado, req.body.valorador, req.body.producto, req.headers.authorization)
            if (response !== "ok") {
                res.status(400).send(response);
            } else {
                const usuario = await serviceUsuario.valorar(req.body.valoracion, req.body.valorado, req.body.valorador, req.body.producto)
                res.status(200).send({usuario: usuario});
            }
        }
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

const getRatingUsuarioController = async (req, res, next) => {
    try{
        const tokenCheck = await checkTokenInLog(req.headers.authorization);

        if (tokenCheck.status < 200 && tokenCheck.status > 299) {
            res.status(tokenCheck.status).send(tokenCheck.message)
        } else {
            const media = await serviceUsuario.getValoracionMedia(req.query.correo)
            res.status(200).send({usuario: media});
        }
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}


const getValoracionUsuarioController = async (req, res, next) => {
    try{
        const tokenCheck = await checkTokenInLog(req.headers.authorization);

        if (tokenCheck.status < 200 && tokenCheck.status > 299) {
            res.status(tokenCheck.status).send(tokenCheck.message)
        } else {
            const valoracion = await serviceUsuario.getValoracion(req.query.correo)
            res.status(200).send({usuario: valoracion});
        }
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const checkToken = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const result = await checkNewToken(token);
        res.status(result.status).send(result.message);
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

const checkTokenInCache = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const result = await checkTokenInLog(token);
        console.log(result);
        res.status(result.status).send({message: result.message});
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const tokenData = await deleteTokenFromLog(token);
        res.status(200).send({message: 'Logout realizado con éxito'});
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    createUsuarioController,
    getUsuarioByIdController,
    deleteUsuarioController,
    updateUsuarioController,
    updateValoracionController,
    getRatingUsuarioController,
    getValoracionUsuarioController,
    checkToken,
    checkTokenInCache,
    logout
}